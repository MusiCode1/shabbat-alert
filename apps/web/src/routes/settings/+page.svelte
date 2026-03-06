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
	let testTiming = $state(browser ? (localStorage.getItem('testTiming') ?? '5s') : '5s');

	const TIMING_OPTIONS = ['1s', '5s', '10s', '30s', '1m'];

	const SIMULATE_FLOWS: { label: string; icon: string; type: AlertType }[] = [
		{ label: 'טיל', icon: '🚀', type: 'missiles' },
		{ label: 'צונמי', icon: '🌊', type: 'tsunami' },
		{ label: 'רעידה', icon: '🌍', type: 'earthQuake' },
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

<div class="mx-auto flex max-w-lg flex-col gap-6 p-6" dir="rtl">
	<!-- Header -->
	<header class="flex items-center justify-between">
		<h1 class="text-[clamp(1.2rem,3vw,1.8rem)] font-bold">⚙️ הגדרות</h1>
		<a href="/" class="rounded-lg bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20">
			← חזרה לתצוגה
		</a>
	</header>

	<!-- Selected City -->
	<section class="rounded-xl bg-white/5 p-4">
		<p class="mb-1 text-sm opacity-60">עיר נוכחית</p>
		{#if selectedCity}
			<div class="flex items-center justify-between gap-2">
				<span class="font-semibold text-green-400">📍 {selectedCity}</span>
				<button onclick={clearCity} class="rounded-lg px-3 py-1 text-sm text-red-400 transition hover:bg-red-500/20">
					הסר
				</button>
			</div>
		{:else}
			<p class="opacity-40">לא נבחרה עיר — מציג כל ההתראות</p>
		{/if}
	</section>

	<!-- ALL_CLEAR duration -->
	<section class="rounded-xl bg-white/5 p-4">
		<p class="mb-3 font-medium">זמן הצגת הודעת "הכל בסדר" על המסך</p>
		<div class="flex items-center gap-3">
			<input
				type="number"
				min="1"
				max="60"
				bind:value={allClearMin}
				oninput={onAllClearChange}
				class="w-20 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-center text-base outline-none focus:border-blue-500"
			/>
			<span class="opacity-60">דקות</span>
			<span class="text-xs opacity-40">(ברירת מחדל: 5)</span>
		</div>
	</section>

	<!-- Test mode -->
	<section class="rounded-xl bg-white/5 p-4 flex flex-col gap-4">
		<p class="font-medium">🔬 מצב טסט</p>

		<!-- Mode tabs -->
		<div class="grid grid-cols-3 gap-1 rounded-lg bg-black/20 p-1">
			<button
				onclick={() => setTestMode('off')}
				class="rounded-md px-2 py-2 text-sm font-medium transition {testMode === 'off' ? 'bg-white/15 shadow' : 'opacity-40 hover:opacity-70'}"
			>
				כבוי
			</button>
			<button
				onclick={() => setTestMode('server')}
				class="rounded-md px-2 py-2 text-sm font-medium transition {testMode === 'server' ? 'bg-blue-500 text-white shadow' : 'opacity-40 hover:opacity-70'}"
			>
				📡 שרת
			</button>
			<button
				onclick={() => setTestMode('local')}
				class="rounded-md px-2 py-2 text-sm font-medium transition {testMode === 'local' ? 'bg-white/15 shadow' : 'opacity-40 hover:opacity-70'}"
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
							class="rounded-lg px-3 py-1.5 text-sm font-medium transition {testTiming === t ? 'bg-blue-500 text-white ring-2 ring-blue-400/50' : 'bg-white/10 hover:bg-white/20'}"
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
							class="rounded-lg px-3 py-1.5 text-sm font-medium transition active:scale-95
								{lastSimulation === flow.type ? 'bg-blue-500 text-white ring-2 ring-blue-400/50' : 'bg-white/10 hover:bg-white/20'}"
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
			class="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-base outline-none placeholder:opacity-40 focus:border-blue-500 focus:bg-white/15"
			dir="rtl"
		/>

		<div class="max-h-96 overflow-y-auto rounded-xl border border-white/10">
			{#if loading}
				<div class="p-4 text-center opacity-50">טוען...</div>
			{:else if groupedCities.length === 0}
				<div class="p-4 text-center opacity-50">לא נמצאו ערים</div>
			{:else}
				{#each groupedCities as [zone, zoneCities]}
					<details open={zoneHasSelected(zoneCities)}>
						<summary class="flex cursor-pointer items-center justify-between px-4 py-2 text-sm font-semibold opacity-60 hover:bg-white/5 hover:opacity-80 select-none">
							<span>{zone}</span>
							<span class="text-xs font-normal opacity-60">{zoneCities.length}</span>
						</summary>
						<ul>
							{#each zoneCities as city (city.city)}
								<li>
									<button
										onclick={() => selectCity(city)}
										class="flex w-full items-center gap-2 px-6 py-2.5 text-right transition hover:bg-white/10
											{selectedCity === city.city ? 'bg-blue-600/30 text-blue-300' : ''}"
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
