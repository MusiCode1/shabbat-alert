<script lang="ts">
	import type { HistoryEntry } from '$lib/types';
	import { ALERT_TYPE_LABELS } from '$lib/types';

	interface Props {
		entries: HistoryEntry[];
		selectedCity?: string;
		cityZones?: Map<string, string>;
	}
	let { entries, selectedCity = '', cityZones = new Map() }: Props = $props();

	function sortedCities(cities: string[]): string[] {
		if (!selectedCity || !cities.includes(selectedCity)) return cities;
		return [selectedCity, ...cities.filter((c) => c !== selectedCity)];
	}

	function uniqueZones(cities: string[]): string[] {
		const seen = new Set<string>();
		const result: string[] = [];
		for (const city of cities) {
			const zone = cityZones.get(city);
			if (zone && !seen.has(zone)) {
				seen.add(zone);
				result.push(zone);
			}
		}
		return result;
	}

	function fmtTime(iso: string): string {
		const d = new Date(iso);
		const today = new Date();
		const sameDay = d.getFullYear() === today.getFullYear()
			&& d.getMonth() === today.getMonth()
			&& d.getDate() === today.getDate();
		const time = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
		if (sameDay) return time;
		const dd = String(d.getDate()).padStart(2, '0');
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const yyyy = d.getFullYear();
		return `${dd}/${mm}/${yyyy} ${time}`;
	}
</script>

<section class="flex flex-col gap-1">
	<h2 class="mb-1 font-semibold opacity-60 text-[clamp(0.75rem,1.5vw,1rem)]">התראות אחרונות</h2>

	{#if entries.length === 0}
		<p class="opacity-40 text-[clamp(0.7rem,1.3vw,0.9rem)]">אין התראות להצגה</p>
	{:else}
		<ul class="flex flex-col gap-1">
			{#each entries as entry (entry.id)}
				<li class="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-[clamp(0.7rem,1.5vw,1rem)]">
					<span class="shrink-0 font-mono opacity-60">{fmtTime(entry.timestamp)}</span>
					<span class="opacity-90">{ALERT_TYPE_LABELS[entry.type] ?? entry.title}</span>
					<span class="ml-auto shrink-0 opacity-50 text-[0.85em]">
					{sortedCities(entry.cities).slice(0, 3).join(', ')}{entry.cities.length > 3 ? ` +${entry.cities.length - 3}` : ''}
					{#if cityZones.size > 0}
						{@const zones = uniqueZones(entry.cities)}
						{#if zones.length > 0}
							<span class="opacity-70"> | {zones.join(', ')}</span>
						{/if}
					{/if}
				</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
