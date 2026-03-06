import { AlertRelay, type Env } from './AlertRelay';
import { type } from 'arktype';

export { AlertRelay };

const CORS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Allow-Methods': 'GET',
};

const UPSTREAM = 'https://redalert.orielhaim.com';
const CITIES_TTL = 86_400; // 24h
const HISTORY_TTL = 300;   // 5min

// Schemas — duplicated from apps/web/src/lib/types.ts (Worker is a separate package)
const CitySchema = type({
	city: 'string',
	cityZone: 'string | null',
	count: 'number',
	'translations?': {
		en: { name: 'string', zone: 'string' },
		ru: { name: 'string', zone: 'string' },
		ar: { name: 'string', zone: 'string' },
	},
	'lat?': 'number',
	'lng?': 'number',
});

const PageSchema = type({
	data: CitySchema.array(),
	'pagination?': {
		total: 'number',
		limit: 'number',
		offset: 'number',
		hasMore: 'boolean',
	},
});

const HistoryApiCitySchema = type({ id: 'number', name: 'string' });
const HistoryApiEntrySchema = type({
	id: 'string | number',
	timestamp: 'string',
	type: 'string',
	cities: HistoryApiCitySchema.array(),
});
const HistoryApiResponseSchema = type({
	data: HistoryApiEntrySchema.array(),
	'pagination?': {
		total: 'number',
		limit: 'number',
		offset: 'number',
		hasMore: 'boolean',
	},
});

function respond(data: unknown, status = 200, ttl?: number): Response {
	const headers: Record<string, string> = { 'Content-Type': 'application/json', ...CORS };
	if (ttl) headers['Cache-Control'] = `public, max-age=${ttl}`;
	return new Response(JSON.stringify(data), { status, headers });
}

async function handleCities(env: Env): Promise<Response> {
	const cacheReq = new Request('https://cache-key/cities-all');
	const cached = await caches.default.match(cacheReq);
	if (cached) return new Response(cached.body, { headers: { 'Content-Type': 'application/json', ...CORS } });

	const PAGE_SIZE = 500;
	const allCities: (typeof CitySchema.infer)[] = [];
	let offset = 0;
	let hasMore = true;

	while (hasMore) {
		const params = new URLSearchParams({
			limit: String(PAGE_SIZE),
			offset: String(offset),
			sort: 'city',
			order: 'asc',
		});
		const res = await fetch(`${UPSTREAM}/api/stats/cities?${params}`, {
			headers: { Authorization: `Bearer ${env.REDALERT_API_KEY ?? ''}` },
		});
		if (!res.ok) return respond({ error: 'upstream error' }, 502);

		const page = PageSchema(await res.json());
		if (page instanceof type.errors) return respond({ error: 'invalid upstream response' }, 502);

		allCities.push(...page.data);
		hasMore = page.pagination?.hasMore ?? false;
		offset += PAGE_SIZE;
	}

	const response = respond({ data: allCities }, 200, CITIES_TTL);
	caches.default.put(cacheReq, response.clone());
	return response;
}

async function handleHistory(request: Request, env: Env): Promise<Response> {
	const reqUrl = new URL(request.url);
	const cityId = reqUrl.searchParams.get('cityId') ?? '';
	const limit = reqUrl.searchParams.get('limit') ?? '50';

	const cacheReq = new Request(`https://cache-key/history-${cityId}-${limit}`);
	const cached = await caches.default.match(cacheReq);
	if (cached) return new Response(cached.body, { headers: { 'Content-Type': 'application/json', ...CORS } });

	const params = new URLSearchParams({ limit });
	if (cityId) params.set('cityId', cityId);

	const res = await fetch(`${UPSTREAM}/api/stats/history?${params}`, {
		headers: { Authorization: `Bearer ${env.REDALERT_API_KEY ?? ''}` },
	});
	if (!res.ok) return respond({ error: 'upstream error' }, 502);

	const data = HistoryApiResponseSchema(await res.json());
	if (data instanceof type.errors) return respond({ error: 'invalid upstream response' }, 502);

	const response = respond(data, 200, HISTORY_TTL);
	caches.default.put(cacheReq, response.clone());
	return response;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: CORS });
		}

		if (url.pathname === '/ws') {
			const instanceName = url.searchParams.get('test') === '1' ? 'singleton-test' : 'singleton';
			const doId = env.ALERT_RELAY.idFromName(instanceName);
			const stub = env.ALERT_RELAY.get(doId);
			return stub.fetch(request);
		}

		if (url.pathname === '/api/cities') return handleCities(env);
		if (url.pathname === '/api/history') return handleHistory(request, env);

		return new Response('Not found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
