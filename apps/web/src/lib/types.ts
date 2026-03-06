import { type } from 'arktype';

export const AlertTypeSchema = type(
	"'missiles' | 'radiologicalEvent' | 'earthQuake' | 'tsunami' | 'hostileAircraftIntrusion' | 'hazardousMaterials' | 'terroristInfiltration' | 'newsFlash' | 'missilesDrill' | 'earthQuakeDrill' | 'tsunamiDrill' | 'endAlert'"
);
export type AlertType = typeof AlertTypeSchema.infer;

export const ALERT_TYPE_LABELS: Record<string, string> = {
	missiles: 'ירי רקטות וטילים',
	radiologicalEvent: 'אירוע רדיולוגי',
	earthQuake: 'רעידת אדמה',
	tsunami: 'צונמי',
	hostileAircraftIntrusion: 'חדירת כלי טיס עוין',
	hazardousMaterials: 'חומרים מסוכנים',
	terroristInfiltration: 'חדירת מחבלים',
	newsFlash: 'בזק חדשות',
	missilesDrill: 'תרגיל — ירי רקטות',
	earthQuakeDrill: 'תרגיל — רעידת אדמה',
	tsunamiDrill: 'תרגיל — צונמי',
	endAlert: 'סיום התראה',
};

export const AlertSchema = type({
	type: AlertTypeSchema,
	title: 'string',
	cities: 'string[]',
	instructions: 'string'
});
export type Alert = typeof AlertSchema.infer;

export type AlertState = 'IDLE' | 'ALERT' | 'SHELTER' | 'ALL_CLEAR';

export interface AppState {
	status: AlertState;
	currentAlert: Alert | null;
	alertSecondsLeft: number;
	connected: boolean;
	lastUpdate: Date | null;
}

export interface HistoryEntry {
	id: string;
	type: AlertType;
	title: string;
	cities: string[];
	timestamp: string;
}

// Message types for WebSocket communication with the Durable Object
export const WsClientMessageSchema = type({ type: "'subscribe'", city: 'string' });
export type WsClientMessage = typeof WsClientMessageSchema.infer;

export const WsServerMessageSchema = type({ type: "'alert'", data: AlertSchema })
	.or({ type: "'endAlert'", data: AlertSchema })
	.or({ type: "'state'", connected: 'boolean' })
	.or({ type: "'ping'" });
export type WsServerMessage = typeof WsServerMessageSchema.infer;

// History API response schemas (from /api/stats/history upstream)
export const HistoryApiCitySchema = type({ id: 'number', name: 'string' });
export const HistoryApiEntrySchema = type({
	id: 'string | number',
	timestamp: 'string',
	type: 'string',
	cities: HistoryApiCitySchema.array(),
});
export const HistoryApiResponseSchema = type({
	data: HistoryApiEntrySchema.array(),
	'pagination?': {
		total: 'number',
		limit: 'number',
		offset: 'number',
		hasMore: 'boolean',
	},
});

export const TranslationSchema = type({ name: 'string', zone: 'string' });

export const CitySchema = type({
	city: 'string',
	cityZone: 'string | null',
	'count?': 'number',
	'id?': 'number',
	'orefId?': 'string',
	'rashut?': 'string | null',
	'translations?': {
		en: TranslationSchema,
		ru: TranslationSchema,
		ar: TranslationSchema,
	},
	'lat?': 'number',
	'lng?': 'number',
});

export const PageSchema = type({
	data: CitySchema.array(),
	'pagination?': {
		total: 'number',
		limit: 'number',
		offset: 'number',
		hasMore: 'boolean',
	},
});

export type City = typeof CitySchema.infer;
