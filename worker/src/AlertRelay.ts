import { io, Socket } from 'socket.io-client';
import { type } from 'arktype';

const PING_INTERVAL_MS = 30_000;

const AlertSchema = type({
	type: 'string',
	title: 'string',
	cities: 'string[]',
	instructions: 'string'
});
type Alert = typeof AlertSchema.infer;

const WsClientMessageSchema = type({ type: "'subscribe'", city: 'string' });

interface ClientSession {
	ws: WebSocket;
	city: string;
}

export class AlertRelay implements DurableObject {
	private state: DurableObjectState;
	private env: Env;
	private clients: Map<string, ClientSession> = new Map();
	private socket: Socket | null = null;
	private upstreamConnected = false;
	private clientIdCounter = 0;
	private testTiming = '5s';
	private pingInterval: ReturnType<typeof setInterval> | null = null;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// Only handle WebSocket upgrades on /ws
		if (url.pathname !== '/ws') {
			return new Response('Not found', { status: 404 });
		}

		const upgradeHeader = request.headers.get('Upgrade');
		if (upgradeHeader !== 'websocket') {
			return new Response('Expected WebSocket', { status: 426 });
		}

		const city = url.searchParams.get('city') || '';
		const useTest = url.searchParams.get('test') === '1';
		const timing = url.searchParams.get('timing') ?? '5s';

		const { 0: clientWs, 1: serverWs } = new WebSocketPair();

		this.state.acceptWebSocket(serverWs);

		const clientId = String(++this.clientIdCounter);
		this.clients.set(clientId, { ws: serverWs, city });

		// Attach clientId so we can look it up in webSocketMessage
		(serverWs as unknown as { clientId: string }).clientId = clientId;

		// Start upstream if not already connected
		if (!this.socket) {
			this.testTiming = timing;
			this.connectUpstream(useTest, timing, city);
		} else if (useTest && timing !== this.testTiming) {
			// Reconnect test socket with new timing
			this.socket.disconnect();
			this.socket = null;
			this.testTiming = timing;
			this.connectUpstream(useTest, timing, city);
		} else {
			// Send current connection state to new client
			this.sendTo(serverWs, { type: 'state', connected: this.upstreamConnected });
		}

		return new Response(null, { status: 101, webSocket: clientWs });
	}

	webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
		// Accept updated city subscription
		try {
			const msg = WsClientMessageSchema(JSON.parse(typeof message === 'string' ? message : ''));
			if (msg instanceof type.errors) return;
			const clientId = (ws as unknown as { clientId: string }).clientId;
			const session = this.clients.get(clientId);
			if (session) session.city = msg.city;
		} catch {
			// ignore parse errors
		}
	}

	webSocketClose(ws: WebSocket) {
		this.removeClient(ws);
	}

	webSocketError(ws: WebSocket) {
		this.removeClient(ws);
	}

	private removeClient(ws: WebSocket) {
		for (const [id, session] of this.clients) {
			if (session.ws === ws) {
				this.clients.delete(id);
				break;
			}
		}
		// If no clients left, disconnect upstream to save resources
		if (this.clients.size === 0 && this.socket) {
			this.socket.disconnect();
			this.socket = null;
			this.upstreamConnected = false;
			this.stopPing();
		}
	}

	private startPing() {
		this.stopPing();
		this.pingInterval = setInterval(() => {
			this.broadcast({ type: 'ping' });
		}, PING_INTERVAL_MS);
	}

	private stopPing() {
		if (this.pingInterval) {
			clearInterval(this.pingInterval);
			this.pingInterval = null;
		}
	}

	private connectUpstream(useTest = false, timing = '5s', city = '') {
		const apiKey = this.env.REDALERT_API_KEY;
		const serverUrl = useTest
			? 'https://redalert.orielhaim.com/test'
			: 'https://redalert.orielhaim.com';

		const socketOptions = useTest
			? { query: { timing, ...(city ? { cities: city } : {}) }, transports: ['websocket'] as string[] }
			: (apiKey ? { auth: { apiKey }, transports: ['websocket'] as string[] } : { transports: ['websocket'] as string[] });

		this.socket = io(serverUrl, socketOptions);

		this.socket.on('connect', () => {
			this.upstreamConnected = true;
			this.broadcast({ type: 'state', connected: true });
			this.startPing();
		});

		this.socket.on('disconnect', () => {
			this.upstreamConnected = false;
			this.broadcast({ type: 'state', connected: false });
			this.stopPing();
		});

		this.socket.on('alert', (raw: unknown) => {
			const list = Array.isArray(raw) ? raw : [raw];
			for (const item of list) {
				const alert = AlertSchema(item);
				if (alert instanceof type.errors) continue;
				this.broadcastToCity(alert.cities, { type: 'alert', data: alert });
			}
		});

		this.socket.on('endAlert', (raw: unknown) => {
			const alert = AlertSchema(raw);
			if (alert instanceof type.errors) return;
			this.broadcastToCity(alert.cities, { type: 'endAlert', data: alert });
		});

		// Handle all specific alert type events (missiles, earthQuake, etc.)
		const alertTypes = [
			'missiles',
			'radiologicalEvent',
			'earthQuake',
			'tsunami',
			'hostileAircraftIntrusion',
			'hazardousMaterials',
			'terroristInfiltration',
			'newsFlash',
			'missilesDrill',
			'earthQuakeDrill',
			'tsunamiDrill'
		];

		for (const alertType of alertTypes) {
			this.socket.on(alertType, (raw: unknown) => {
				const alert = AlertSchema(raw);
				if (alert instanceof type.errors) return;
				this.broadcastToCity(alert.cities, { type: 'alert', data: { ...alert, type: alertType } });
			});
		}
	}

	private broadcastToCity(cities: string[], message: unknown) {
		const json = JSON.stringify(message);
		for (const session of this.clients.values()) {
			// Send if client has no city filter or city is in the alert
			if (!session.city || cities.includes(session.city)) {
				try {
					session.ws.send(json);
				} catch {
					// ignore closed connections
				}
			}
		}
	}

	private broadcast(message: unknown) {
		const json = JSON.stringify(message);
		for (const session of this.clients.values()) {
			try {
				session.ws.send(json);
			} catch {
				// ignore closed connections
			}
		}
	}

	private sendTo(ws: WebSocket, message: unknown) {
		try {
			ws.send(JSON.stringify(message));
		} catch {
			// ignore
		}
	}
}

export interface Env {
	REDALERT_API_KEY?: string;
	ALERT_RELAY: DurableObjectNamespace;
}
