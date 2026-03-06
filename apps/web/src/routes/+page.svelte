<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { alertHistory, alertStore } from '$lib/stores/alertStore';
	import AlertList from '$lib/components/AlertList.svelte';
	import Clock from '$lib/components/Clock.svelte';
	import ConnectionBadge from '$lib/components/ConnectionBadge.svelte';
	import StatusPanel from '$lib/components/StatusPanel.svelte';
	import { browser } from '$app/environment';

	const appState = alertStore;
	const history = alertHistory;

	let selectedCity = $state(browser ? (localStorage.getItem('selectedCity') ?? '') : '');
	let testMode = $state(browser ? (localStorage.getItem('testMode') ?? 'off') : 'off');
	let cityZones = $state<Map<string, string>>(new Map());

	onMount(async () => {
		try {
			const res = await fetch('/cities.json');
			const data = await res.json();
			cityZones = new Map(
				(data.data as { city: string; cityZone?: string | null }[])
					.filter((c) => c.cityZone)
					.map((c) => [c.city, c.cityZone!])
			);
		} catch {
			// ignore
		}
	});

	onDestroy(() => alertStore.destroy());
</script>

<div class="flex min-h-screen flex-col gap-4 p-4 md:p-6">
	<!-- Header -->
	<header class="flex items-center justify-between gap-2">
		<div class="flex items-center gap-2">
			<span class="text-[clamp(1rem,2.5vw,1.5rem)] font-bold text-red-500">⚡ RedAlert</span>
			{#if selectedCity}
				<span class="rounded-full bg-white/10 px-2 py-0.5 text-[clamp(0.65rem,1.5vw,0.9rem)] opacity-80">
					📍 {selectedCity}
				</span>
			{/if}
		</div>
		<div class="flex items-center gap-3">
			{#if testMode === 'server'}
				<span class="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300 ring-1 ring-blue-500/40">
					📡 שרת טסט
				</span>
			{:else if testMode === 'local'}
				<span class="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60 ring-1 ring-white/20">
					🖥️ סימולציה
				</span>
			{/if}
			<Clock />
			<a
				href="/settings"
				class="rounded-lg p-2 opacity-60 transition hover:bg-white/10 hover:opacity-100"
				title="הגדרות"
				aria-label="הגדרות"
			>
				⚙️
			</a>
		</div>
	</header>

	<!-- Status Panel -->
	<StatusPanel appState={$appState} />

	<!-- Alert History -->
	<AlertList entries={$history} {selectedCity} {cityZones} />

	<!-- Footer -->
	<footer class="mt-auto border-t border-white/10 pt-2">
		<ConnectionBadge connected={$appState.connected} lastUpdate={$appState.lastUpdate} />
	</footer>
</div>
