<script lang="ts">
  import type { HistoryEntry } from "$lib/types";
  import { ALERT_TYPE_LABELS } from "$lib/types";
  import { MapPin } from "lucide-svelte";
  import { slide } from "svelte/transition";

  interface Props {
    entries: HistoryEntry[];
    selectedCity?: string;
    cityZones?: Map<string, string>;
  }
  let { entries, selectedCity = "", cityZones = new Map() }: Props = $props();

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
    const sameDay =
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
    const time = d.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (sameDay) return time;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy} ${time}`;
  }
</script>

<section class="flex flex-col gap-2">
  <h2 class="mb-1 font-semibold opacity-60 text-[clamp(1rem,2vw,1.2rem)]">
    התראות אחרונות
  </h2>

  {#if entries.length === 0}
    <p class="opacity-40 text-[clamp(1rem,1.8vw,1.1rem)]">אין התראות להצגה</p>
  {:else}
    <ul class="flex flex-col gap-3">
      {#each entries as entry (entry.id)}
        <li
          class="flex flex-col gap-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 px-5 py-4 text-[clamp(1rem,2vw,1.3rem)] shadow-sm backdrop-blur-md transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          transition:slide
        >
          <div class="flex items-center justify-between w-full gap-2">
            <span class="opacity-90 font-bold"
              >{ALERT_TYPE_LABELS[entry.type] ?? entry.title}</span
            >
            <span class="shrink-0 font-mono opacity-60 text-[0.8em]"
              >{fmtTime(entry.timestamp)}</span
            >
          </div>
          <span
            class="flex items-center flex-wrap gap-1 opacity-70 text-[0.85em] leading-snug"
          >
            <MapPin size={16} class="shrink-0 opacity-50" />
            {sortedCities(entry.cities).slice(0, 3).join(", ")}{entry.cities
              .length > 3
              ? ` +${entry.cities.length - 3}`
              : ""}
            {#if cityZones.size > 0}
              {@const zones = uniqueZones(entry.cities)}
              {#if zones.length > 0}
                <span class="opacity-50 mx-1">|</span> {zones.join(", ")}
              {/if}
            {/if}
          </span>
        </li>
      {/each}
    </ul>
  {/if}
</section>
