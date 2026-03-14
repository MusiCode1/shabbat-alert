import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import { type } from 'arktype';
import { WsServerMessageSchema, HistoryApiResponseSchema } from '$lib/types';
import type { Alert, AlertType, AlertState, AppState, HistoryEntry } from '$lib/types';

const ALERT_DURATION_MS = 90_000;
const RECONNECT_BASE_MS = 3_000;
const RECONNECT_MAX_MS = 60_000;
const STALE_TIMEOUT_MS = 45_000;

const WORKER_WS_URL: string = import.meta.env.VITE_WORKER_WS_URL ?? '';
const WORKER_URL: string = import.meta.env.VITE_WORKER_URL ?? '';

function getAllClearMs(): number {
	const mins = Number(localStorage.getItem('allClearDurationMin') ?? 5);
	return (isFinite(mins) && mins > 0 ? mins : 5) * 60_000;
}

function createAlertStore() {
	const state = writable<AppState>({
		status: 'IDLE',
		currentAlert: null,
		alertSecondsLeft: 90,
		connecting: false,
		connected: false,
		upstreamConnected: false,
		lastUpdate: null
	});

	const history = writable<HistoryEntry[]>([]);
	let historySeq = 0;
	let historyLoaded = false;

	let ws: WebSocket | null = null;
	let alertTimer: ReturnType<typeof setTimeout> | null = null;
	let allClearTimer: ReturnType<typeof setTimeout> | null = null;
	let shelterInterval: ReturnType<typeof setInterval> | null = null;
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	let staleTimer: ReturnType<typeof setTimeout> | null = null;
	let reconnectAttempts = 0;
	let intentionalReconnect = false;
	let destroyed = false;

	function getCity(): string {
		if (!browser) return '';
		return localStorage.getItem('selectedCity') ?? '';
	}

	function setState(partial: Partial<AppState>) {
		state.update((s) => ({ ...s, ...partial, lastUpdate: new Date() }));
	}

	function clearTimers() {
		if (alertTimer) clearTimeout(alertTimer);
		if (allClearTimer) clearTimeout(allClearTimer);
		if (shelterInterval) clearInterval(shelterInterval);
		alertTimer = null;
		allClearTimer = null;
		shelterInterval = null;
	}

	function resetStaleTimer() {
		if (staleTimer) clearTimeout(staleTimer);
		staleTimer = setTimeout(() => {
			ws?.close();
		}, STALE_TIMEOUT_MS);
	}

	function addToHistory(alert: Alert) {
		history.update((h) => {
			const entry: HistoryEntry = {
				id: `${++historySeq}-${Date.now()}`,
				type: alert.type,
				title: alert.title,
				cities: alert.cities,
				timestamp: new Date().toISOString()
			};
			return [entry, ...h].slice(0, 50);
		});
	}

	function currentStatus(): AlertState {
		let current: AlertState = 'IDLE';
		state.subscribe((s) => (current = s.status))();
		return current;
	}

	function onStandby(alert: Alert) {
		clearTimers();
		addToHistory(alert);
		setState({ status: 'STANDBY', currentAlert: alert, alertSecondsLeft: 0 });
	}

	function onAlert(alert: Alert) {
		clearTimers();
		addToHistory(alert);

		setState({ status: 'ALERT', currentAlert: alert, alertSecondsLeft: 90 });

		let seconds = 90;
		shelterInterval = setInterval(() => {
			seconds -= 1;
			state.update((s) => ({ ...s, alertSecondsLeft: seconds }));
			if (seconds <= 0) {
				clearInterval(shelterInterval!);
				shelterInterval = null;
			}
		}, 1000);

		alertTimer = setTimeout(() => {
			clearInterval(shelterInterval!);
			shelterInterval = null;
			setState({ status: 'SHELTER', alertSecondsLeft: 0 });
		}, ALERT_DURATION_MS);
	}

	function onEndAlert(alert: Alert) {
		clearTimers();
		const status = currentStatus();
		const nextStatus: AlertState = status === 'STANDBY' ? 'STANDBY_CLEAR' : 'ALL_CLEAR';
		setState({ status: nextStatus, currentAlert: alert });

		allClearTimer = setTimeout(() => {
			setState({ status: 'IDLE', currentAlert: null });
		}, getAllClearMs());
	}

	async function loadHistory() {
		if (!WORKER_URL || historyLoaded) return;
		historyLoaded = true;
		try {
			let cityId = localStorage.getItem('selectedCityId');
			if (!cityId) {
				const cityName = getCity();
				if (cityName) {
					const citiesRes = await fetch('/cities.json').then((r) => r.json()).catch(() => null);
					const found = citiesRes?.data?.find((c: { city: string; id?: number }) => c.city === cityName);
					if (found?.id != null) {
						cityId = String(found.id);
						localStorage.setItem('selectedCityId', cityId);
					}
				}
			}
			const params = new URLSearchParams({ limit: '50' });
			if (cityId) params.set('cityId', cityId);
			const res = await fetch(`${WORKER_URL}/api/history?${params}`);
			if (!res.ok) return;
			const data = HistoryApiResponseSchema(await res.json());
			if (data instanceof type.errors) return;
			const entries: HistoryEntry[] = data.data.map((e) => ({
				id: `api-${e.id}`,
				type: e.type as AlertType,
				title: e.type,
				cities: e.cities.map((c) => c.name),
				timestamp: e.timestamp,
			}));
			history.update((h) => [...entries, ...h].slice(0, 50));
		} catch {
			// ignore fetch errors
		}
	}

	function simulateFlow(alertType: AlertType) {
		const mock: Alert = {
			type: alertType,
			title: `סימולציה: ${alertType}`,
			cities: [getCity() || 'בדיקה'],
			instructions: '',
		};
		if (alertType === 'newsFlash') {
			onStandby(mock);
			setTimeout(() => onEndAlert(mock), 30_000);
		} else {
			onAlert(mock);
			setTimeout(() => onEndAlert(mock), ALERT_DURATION_MS + 1_000);
		}
	}

	function connect() {
		if (!browser || destroyed) return;
		if (!WORKER_WS_URL) {
			console.warn('[alertStore] VITE_WORKER_WS_URL not set — WebSocket disabled');
			return;
		}

		const useTest = localStorage.getItem('testMode') === 'server';
		const city = getCity();
		const params = new URLSearchParams();

		if (city) params.set('city', city);
		if (useTest) {
			params.set('test', '1');
			params.set('timing', localStorage.getItem('testTiming') ?? '5s');
		}

		const qs = params.toString();
		const url = qs ? `${WORKER_WS_URL}?${qs}` : WORKER_WS_URL;

		ws = new WebSocket(url);
		setState({ connecting: true });

		ws.addEventListener('open', () => {
			reconnectAttempts = 0;
			setState({ connecting: false, connected: true });
		});

		ws.addEventListener('message', (event) => {
			try {
				resetStaleTimer();
				const msg = WsServerMessageSchema(JSON.parse(event.data));
				if (msg instanceof type.errors) return;
				if (msg.type === 'alert') {
					if (msg.data.type === 'newsFlash') {
						onStandby(msg.data);
					} else {
						onAlert(msg.data);
					}
				} else if (msg.type === 'endAlert') {
					onEndAlert(msg.data);
				} else if (msg.type === 'state') {
					setState({ upstreamConnected: msg.connected });
				}
				// ping — stale timer already reset above, nothing else needed
			} catch {
				// ignore parse errors
			}
		});

		ws.addEventListener('close', () => {
			if (staleTimer) clearTimeout(staleTimer);
			setState({ connecting: false, connected: false, upstreamConnected: false });
			ws = null;
			if (intentionalReconnect) {
				intentionalReconnect = false;
				connect();
			} else {
				scheduleReconnect();
			}
		});

		ws.addEventListener('error', () => {
			ws?.close();
		});
	}

	function scheduleReconnect() {
		if (destroyed) return;
		const delay = Math.min(RECONNECT_BASE_MS * 2 ** reconnectAttempts, RECONNECT_MAX_MS);
		reconnectAttempts++;
		reconnectTimer = setTimeout(() => {
			if (!destroyed) connect();
		}, delay);
	}

	function destroy() {
		destroyed = true;
		clearTimers();
		if (reconnectTimer) clearTimeout(reconnectTimer);
		if (staleTimer) clearTimeout(staleTimer);
		ws?.close();
		ws = null;
	}

	function reconnect() {
		destroyed = false;
		reconnectAttempts = 0;
		if (reconnectTimer) clearTimeout(reconnectTimer);
		if (ws) {
			intentionalReconnect = true;
			ws.close();
		} else {
			connect();
		}
	}

	function updateCity(city: string) {
		if (browser) localStorage.setItem('selectedCity', city);
		historyLoaded = false;
		history.set([]);
		loadHistory();
		reconnect();
	}

	if (browser) {
		connect();
		loadHistory();
	}

	return {
		subscribe: state.subscribe,
		history,
		connect,
		reconnect,
		destroy,
		updateCity,
		simulateFlow,
	};
}

export const alertStore = createAlertStore();
export const alertHistory = alertStore.history;

export const statusColor = derived(alertStore, ($s) => {
	switch ($s.status) {
		case 'ALERT':
			return '#ef4444';
		case 'SHELTER':
			return '#f97316';
		case 'STANDBY':
			return '#eab308';
		case 'ALL_CLEAR':
		case 'STANDBY_CLEAR':
			return '#86efac';
		default:
			return '#22c55e';
	}
});
