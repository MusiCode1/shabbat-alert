<script lang="ts">
	interface Props {
		connecting: boolean;
		connected: boolean;
		upstreamConnected: boolean;
		lastUpdate: Date | null;
	}
	let { connecting, connected, upstreamConnected, lastUpdate }: Props = $props();

	function fmt(d: Date | null): string {
		if (!d) return '—';
		return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	}

	let label = $derived(
		connecting ? 'מתחבר...' : !connected ? 'מנותק' : !upstreamConnected ? 'מנותק מהמקור' : 'מחובר'
	);
	let dotColor = $derived(
		connecting ? 'bg-yellow-500' : !connected ? 'bg-red-500' : !upstreamConnected ? 'bg-yellow-500' : 'bg-green-400'
	);
	let textColor = $derived(
		connecting ? 'text-yellow-400' : !connected ? 'text-red-400' : !upstreamConnected ? 'text-yellow-400' : 'text-green-400'
	);
</script>

<div class="flex items-center gap-3 text-[clamp(0.7rem,1.5vw,1rem)]">
	<span class="flex items-center gap-1.5">
		<span
			class="inline-block size-2.5 rounded-full {dotColor}"
			class:animate-pulse={connecting || !connected}
		></span>
		<span class={textColor}>
			{label}
		</span>
	</span>
	{#if lastUpdate}
		<span class="opacity-50">עדכון אחרון: {fmt(lastUpdate)}</span>
	{/if}
</div>
