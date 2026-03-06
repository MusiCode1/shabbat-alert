<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { toJewishDate, formatJewishDateInHebrew } from 'jewish-date';

	let time = $state('');
	let date = $state('');
	let hebrewDate = $state('');
	let interval: ReturnType<typeof setInterval>;

	function update() {
		const now = new Date();
		time = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
		date = now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
		hebrewDate = formatJewishDateInHebrew(toJewishDate(now));
	}

	onMount(() => {
		update();
		interval = setInterval(update, 1000);
	});

	onDestroy(() => clearInterval(interval));
</script>

<div class="clock text-right leading-tight">
	<div class="font-mono text-[clamp(1.25rem,3vw,2.5rem)] font-bold tabular-nums">{time}</div>
	<div class="text-[clamp(0.7rem,1.5vw,1.1rem)] opacity-70">{date}</div>
	<div class="text-[clamp(0.65rem,1.3vw,0.95rem)] opacity-50">{hebrewDate}</div>
</div>
