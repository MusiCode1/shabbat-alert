<script lang="ts">
	interface Props {
		connected: boolean;
		lastUpdate: Date | null;
	}
	let { connected, lastUpdate }: Props = $props();

	function fmt(d: Date | null): string {
		if (!d) return '—';
		return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	}
</script>

<div class="flex items-center gap-3 text-[clamp(0.7rem,1.5vw,1rem)]">
	<span class="flex items-center gap-1.5">
		<span
			class="inline-block size-2.5 rounded-full"
			class:bg-green-400={connected}
			class:bg-red-500={!connected}
			class:animate-pulse={!connected}
		></span>
		<span class={connected ? 'text-green-400' : 'text-red-400'}>
			{connected ? 'מחובר' : 'מנותק'}
		</span>
	</span>
	{#if lastUpdate}
		<span class="opacity-50">עדכון אחרון: {fmt(lastUpdate)}</span>
	{/if}
</div>
