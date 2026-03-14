<script lang="ts">
	import { browser } from '$app/environment';
	import { alertStore } from '$lib/stores/alertStore';
	import type { City, AlertType } from '$lib/types';

	let searchQuery = $state('');
	let allCities = $state<City[]>([]);
	let loading = $state(false);
	let selectedCity = $state(browser ? (localStorage.getItem('selectedCity') ?? '') : '');
	type TestMode = 'off' | 'server' | 'local';
	let testMode = $state<TestMode>(browser ? (localStorage.getItem('testMode') as TestMode ?? 'off') : 'off');
	let lastSimulation = $state<AlertType | null>(null);
	let allClearMin = $state(browser ? Number(localStorage.getItem('allClearDurationMin') ?? 5) : 5);
	let isFullscreen = $state(false);

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}

	$effect(() => {
		if (!browser) return;
		const handler = () => { isFullscreen = !!document.fullscreenElement; };
		document.addEventListener('fullscreenchange', handler);
		return () => document.removeEventListener('fullscreenchange', handler);
	});
	let testTiming = $state(browser ? (localStorage.getItem('testTiming') ?? '5s') : '5s');

	const TIMING_OPTIONS = ['1s', '5s', '10s', '30s', '1m'];

	const SIMULATE_FLOWS: { label: string; icon: string; type: AlertType }[] = [
		{ label: 'טיל', icon: '🚀', type: 'missiles' },
		{ label: 'צונמי', icon: '🌊', type: 'tsunami' },
		{ label: 'רעידה', icon: '🌍', type: 'earthQuake' },
		{ label: 'בזק חדשות', icon: '📢', type: 'newsFlash' },
	];

	let filteredCities = $derived(
		searchQuery.trim()
			? allCities.filter((c) => c.city.includes(searchQuery.trim()))
			: allCities
	);

	type ZoneGroup = [zone: string, cities: City[]];
	let groupedCities = $derived.by<ZoneGroup[]>(() => {
		const map = new Map<string, City[]>();
		for (const c of filteredCities) {
			const zone = c.cityZone ?? 'ללא אזור';
			if (!map.has(zone)) map.set(zone, []);
			map.get(zone)!.push(c);
		}
		return [...map.entries()].sort(([a], [b]) => {
			if (a === 'ללא אזור') return 1;
			if (b === 'ללא אזור') return -1;
			return a.localeCompare(b, 'he');
		});
	});

	function zoneHasSelected(cities: City[]) {
		return cities.some((c) => c.city === selectedCity);
	}

	function setTestMode(mode: TestMode) {
		testMode = mode;
		localStorage.setItem('testMode', mode);
		localStorage.setItem('useTestServer', mode === 'server' ? '1' : '0');
		alertStore.reconnect();
	}

	function runSimulation(type: AlertType) {
		lastSimulation = type;
		alertStore.simulateFlow(type);
	}

	function setTiming(t: string) {
		testTiming = t;
		localStorage.setItem('testTiming', t);
	}

	function selectCity(city: City) {
		selectedCity = city.city;
		if (browser) {
			localStorage.setItem('selectedCity', city.city);
			if (city.id != null) localStorage.setItem('selectedCityId', String(city.id));
			else localStorage.removeItem('selectedCityId');
			alertStore.updateCity(city.city);
		}
	}

	function clearCity() {
		selectedCity = '';
		if (browser) {
			localStorage.removeItem('selectedCity');
			localStorage.removeItem('selectedCityId');
			alertStore.updateCity('');
		}
	}

	function onAllClearChange() {
		localStorage.setItem('allClearDurationMin', String(allClearMin));
	}

	$effect(() => {
		if (!browser) return;
		loading = true;
		fetch('/cities.json')
			.then((r) => r.json())
			.then((data) => { allCities = (data.data as City[]) ?? []; })
			.catch((e) => console.error('Failed to load cities', e))
			.finally(() => (loading = false));
	});
</script>

<div class="mx-auto flex max-w-2xl flex-col gap-6 p-6" dir="rtl">
	<!-- Header -->
	<header class="flex items-center justify-between mb-2">
		<h1 class="text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold text-amber-glow-primary-light dark:text-amber-glow-primary-dark">⚙️ הגדרות</h1>
		<a href="/" class="rounded-2xl bg-black/5 dark:bg-white/10 px-5 py-3 text-[clamp(1rem,2vw,1.3rem)] font-bold transition hover:bg-black/10 dark:hover:bg-white/20 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10">
			← חזרה לתצוגה
		</a>
	</header>

	<!-- Selected City -->
	<section class="rounded-3xl bg-black/5 dark:bg-white/5 p-6 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-md">
		<p class="mb-2 text-[clamp(1rem,1.8vw,1.2rem)] font-medium opacity-60">עיר נוכחית</p>
		{#if selectedCity}
			<div class="flex items-center justify-between gap-4">
				<span class="text-[clamp(1.8rem,3vw,2.2rem)] font-bold text-green-700 dark:text-green-400">📍 {selectedCity}</span>
				<button onclick={clearCity} class="rounded-xl px-5 py-2.5 text-[clamp(1.1rem,2vw,1.3rem)] font-bold text-red-600 dark:text-red-400 transition hover:bg-red-500/10 hover:shadow-sm">
					הסר
				</button>
			</div>
		{:else}
			<p class="text-[clamp(1.1rem,2vw,1.3rem)] opacity-50 font-medium pb-1">לא נבחרה עיר — המערכת מציגה כעת את כל ההתראות מהשרת</p>
		{/if}
	</section>

	<!-- Fullscreen -->
	<section class="rounded-3xl bg-black/5 dark:bg-white/5 p-6 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-md">
		<div class="flex items-center justify-between">
			<p class="text-[clamp(1.2rem,2vw,1.5rem)] font-bold text-stone-700 dark:text-stone-300">מסך מלא</p>
			<button
				onclick={toggleFullscreen}
				class="rounded-2xl bg-black/5 dark:bg-white/10 px-5 py-3 text-[clamp(1rem,2vw,1.2rem)] font-bold transition hover:bg-black/10 dark:hover:bg-white/20 ring-1 ring-black/5 dark:ring-white/10"
			>
				{isFullscreen ? '⛶ צא ממסך מלא' : '⛶ כנס למסך מלא'}
			</button>
		</div>
	</section>

	<!-- ALL_CLEAR duration -->
	<section class="rounded-3xl bg-black/5 dark:bg-white/5 p-6 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-md">
		<p class="mb-4 text-[clamp(1.2rem,2vw,1.5rem)] font-bold text-stone-700 dark:text-stone-300">זמן הצגת הודעת "הכל בסדר" על המסך</p>
		<div class="flex items-center gap-4 text-[clamp(1.1rem,2vw,1.3rem)]">
			<input
				type="number"
				min="1"
				max="60"
				bind:value={allClearMin}
				oninput={onAllClearChange}
				class="w-24 rounded-2xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 px-4 py-3 text-center text-xl font-bold outline-none ring-amber-glow-primary-light dark:ring-amber-glow-primary-dark focus:ring-4 transition-all"
			/>
			<span class="opacity-80 font-medium">דקות</span>
			<span class="text-sm opacity-50 font-medium mr-2">(ברירת מחדל: 5)</span>
		</div>
	</section>

	<!-- Test mode -->
	<section class="rounded-3xl bg-black/5 dark:bg-white/5 p-6 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-md flex flex-col gap-5">
		<p class="text-[clamp(1.2rem,2vw,1.5rem)] font-bold text-stone-700 dark:text-stone-300">🔬 מצב טסט</p>

		<!-- Mode tabs -->
		<div class="grid grid-cols-3 gap-1 rounded-xl bg-black/10 dark:bg-black/40 p-1.5 shadow-inner">
			<button
				onclick={() => setTestMode('off')}
				class="rounded-lg px-2 py-2 text-sm font-medium transition {testMode === 'off' ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-0' : 'opacity-50 hover:opacity-80'}"
			>
				כבוי
			</button>
			<button
				onclick={() => setTestMode('server')}
				class="rounded-lg px-2 py-2 text-sm font-medium transition {testMode === 'server' ? 'bg-blue-600 text-white shadow-md' : 'opacity-50 hover:opacity-80'}"
			>
				📡 שרת
			</button>
			<button
				onclick={() => setTestMode('local')}
				class="rounded-lg px-2 py-2 text-sm font-medium transition {testMode === 'local' ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-0' : 'opacity-50 hover:opacity-80'}"
			>
				🖥️ מקומי
			</button>
		</div>

		{#if testMode === 'server'}
			<!-- Test server options -->
			<div>
				<p class="mb-2 text-sm opacity-60">תדירות התרעות</p>
				<div class="flex flex-wrap gap-2">
					{#each TIMING_OPTIONS as t}
						<button
							onclick={() => setTiming(t)}
							class="rounded-xl px-4 py-2 text-sm font-medium transition shadow-sm {testTiming === t ? 'bg-blue-600 text-white ring-2 ring-blue-600/30' : 'bg-white/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 ring-1 ring-black/5 dark:ring-white/10'}"
						>
							{t}
						</button>
					{/each}
				</div>
			</div>
		{:else if testMode === 'local'}
			<!-- Local simulation -->
			<div>
				<p class="mb-2 text-sm opacity-60">הפעל סימולציה</p>
				<div class="flex flex-wrap gap-2">
					{#each SIMULATE_FLOWS as flow}
						<button
							onclick={() => runSimulation(flow.type)}
							class="rounded-xl px-4 py-2 text-sm font-medium transition shadow-sm active:scale-95
								{lastSimulation === flow.type ? 'bg-amber-glow-alert-light dark:bg-amber-glow-alert-dark text-white ring-2 ring-red-500/30' : 'bg-white/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 ring-1 ring-black/5 dark:ring-white/10'}"
						>
							{flow.icon} {flow.label}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</section>

	<!-- City search -->
	<section class="flex flex-col gap-3">
		<label for="city-search" class="text-sm font-medium opacity-70">חפש עיר</label>
		<input
			id="city-search"
			type="search"
			placeholder="הקלד שם עיר..."
			bind:value={searchQuery}
			class="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 px-4 py-3 text-base shadow-sm backdrop-blur-md outline-none placeholder:opacity-40 ring-amber-glow-primary-light dark:ring-amber-glow-primary-dark focus:ring-2"
			dir="rtl"
		/>

		<div class="max-h-96 overflow-y-auto rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20 shadow-inner">
			{#if loading}
				<div class="p-6 text-center opacity-50 font-medium">טוען...</div>
			{:else if groupedCities.length === 0}
				<div class="p-6 text-center opacity-50 font-medium">לא נמצאו ערים</div>
			{:else}
				{#each groupedCities as [zone, zoneCities]}
					<details open={zoneHasSelected(zoneCities)}>
						<summary class="flex cursor-pointer items-center justify-between px-5 py-3 text-sm font-bold opacity-70 hover:bg-black/5 dark:hover:bg-white/5 select-none border-b border-black/5 dark:border-white/5">
							<span>{zone}</span>
							<span class="text-xs font-normal opacity-60 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">{zoneCities.length}</span>
						</summary>
						<ul>
							{#each zoneCities as city (city.city)}
								<li>
									<button
										onclick={() => selectCity(city)}
										class="flex w-full items-center gap-2 px-7 py-3 text-right transition hover:bg-black/5 dark:hover:bg-white/5
											{selectedCity === city.city ? 'bg-amber-glow-primary-light/10 dark:bg-amber-glow-primary-dark/10 text-amber-glow-primary-light dark:text-amber-glow-primary-dark font-bold' : ''}"
									>
										<span class="font-medium">{city.city}</span>
									</button>
								</li>
							{/each}
						</ul>
					</details>
				{/each}
			{/if}
		</div>
	</section>
</div>
