<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	let { children } = $props();

	onMount(() => {
		// Load preference
		const theme = localStorage.getItem('theme');
		if (theme === 'light') {
			document.documentElement.classList.remove('dark');
		} else {
			document.documentElement.classList.add('dark');
		}
	});
</script>

<svelte:head>
	<title>RedAlert - מערכת התראות</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<!-- We expose the toggle function via context or window so child pages can call it. In this simple app, we can just pass it or make it global, but for SvelteKit it's easiest to attach it to window for quick access or use a store wrapper. -->
<script module lang="ts">
	export let toggleGlobalTheme: () => void = () => {};
</script>

<div class="min-h-screen" dir="rtl">
	{@render children()}
</div>
