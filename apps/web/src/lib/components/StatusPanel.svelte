<script lang="ts">
	import type { AlertState, AppState } from '$lib/types';
	import ShelterTimer from './ShelterTimer.svelte';

	interface Props {
		appState: AppState;
	}
	let { appState }: Props = $props();

	const icons: Record<AlertState, string> = {
		IDLE: '✅',
		ALERT: '🚨',
		SHELTER: '🛡️',
		ALL_CLEAR: '✔️'
	};

	const headlines: Record<AlertState, string> = {
		IDLE: 'אין התראות',
		ALERT: 'כנסו למרחב מוגן!',
		SHELTER: 'שהו בממ"ד',
		ALL_CLEAR: 'אפשר לצאת מהממ"ד'
	};

	const bgColors: Record<AlertState, string> = {
		IDLE: 'bg-green-600',
		ALERT: 'bg-red-600',
		SHELTER: 'bg-orange-500',
		ALL_CLEAR: 'bg-green-400'
	};

	const textColors: Record<AlertState, string> = {
		IDLE: 'text-white',
		ALERT: 'text-white',
		SHELTER: 'text-white',
		ALL_CLEAR: 'text-green-900'
	};
</script>

<div
	class="relative flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl p-8 transition-colors duration-500
	{bgColors[appState.status]} {textColors[appState.status]}"
	class:animate-pulse={appState.status === 'ALERT'}
>
	<!-- Icon -->
	<div class="text-[clamp(2.5rem,8vw,5rem)] leading-none select-none">
		{icons[appState.status]}
	</div>

	<!-- Headline -->
	<h1 class="text-center font-bold leading-tight text-[clamp(1.5rem,5vw,4rem)]">
		{headlines[appState.status]}
	</h1>

	<!-- Alert details -->
	{#if appState.currentAlert && appState.status !== 'IDLE'}
		<p class="text-center opacity-90 text-[clamp(0.9rem,2.5vw,1.8rem)]">
			{appState.currentAlert.title}
		</p>
		{#if appState.currentAlert.cities.length > 0}
			<p class="text-center opacity-75 text-[clamp(0.75rem,1.8vw,1.3rem)]">
				{appState.currentAlert.cities.join('، ')}
			</p>
		{/if}
	{/if}

	<!-- Shelter timer (countdown) -->
	{#if appState.status === 'ALERT'}
		<ShelterTimer seconds={appState.alertSecondsLeft} />
	{/if}
</div>
