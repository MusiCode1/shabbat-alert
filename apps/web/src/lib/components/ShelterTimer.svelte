<script lang="ts">
	interface Props {
		seconds: number;
	}
	let { seconds }: Props = $props();

	const mins = $derived(Math.floor(seconds / 60));
	const secs = $derived(seconds % 60);
	const display = $derived(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
	const pct = $derived(Math.min(100, Math.round((seconds / 90) * 100)));
</script>

<div class="flex flex-col items-center gap-2">
	<div class="font-mono text-[clamp(2.5rem,8vw,6rem)] font-black tabular-nums leading-none">
		{display}
	</div>
	<!-- Progress bar -->
	<div class="h-2 w-full max-w-xs rounded-full bg-white/20">
		<div
			class="h-full rounded-full bg-white transition-all duration-1000"
			style="width: {pct}%"
		></div>
	</div>
</div>
