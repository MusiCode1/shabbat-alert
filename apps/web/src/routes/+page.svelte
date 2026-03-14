<script lang="ts">
  import { onMount } from "svelte";
  import { alertHistory, alertStore } from "$lib/stores/alertStore";
  import AlertList from "./_components/AlertList.svelte";
  import Clock from "./_components/Clock.svelte";
  import ConnectionBadge from "./_components/ConnectionBadge.svelte";
  import StatusPanel from "./_components/StatusPanel.svelte";
  import { browser } from "$app/environment";
  import {
    MapPin,
    Satellite,
    Computer,
    Settings,
    Moon,
    Sun,
    Shield,
  } from "lucide-svelte";

  const appState = alertStore;
  const history = alertHistory;

  let selectedCity = $state(
    browser ? (localStorage.getItem("selectedCity") ?? "") : "",
  );
  let testMode = $state(
    browser ? (localStorage.getItem("testMode") ?? "off") : "off",
  );
  let cityZones = $state<Map<string, string>>(new Map());
  let isDarkTheme = $state(true);

  onMount(async () => {
    try {
      const res = await fetch("/cities.json");
      const data = await res.json();
      cityZones = new Map(
        (data.data as { city: string; cityZone?: string | null }[])
          .filter((c) => c.cityZone)
          .map((c) => [c.city, c.cityZone!]),
      );
    } catch {
      // ignore
    }

    isDarkTheme = document.documentElement.classList.contains("dark");
    const observer = new MutationObserver(() => {
      isDarkTheme = document.documentElement.classList.contains("dark");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  });


</script>

<!-- Main Application Wrapper -->
<div
  class="flex min-h-screen flex-col gap-4 md:gap-5 p-3 md:p-6 max-w-[1600px] mx-auto w-full"
>
  <!-- Header -->
  <header
    class="flex flex-col lg:flex-row items-center justify-between gap-4 rounded-[2rem] bg-white/60 dark:bg-white/5 p-4 md:p-5 border border-black/15 dark:border-white/10 shadow-lg backdrop-blur-2xl"
  >
    <div
      class="flex flex-col lg:flex-row items-center gap-3 lg:gap-6 w-full lg:w-auto shrink-0"
    >
      <div class="flex flex-wrap justify-center items-center gap-3 md:gap-4">
        <span
          class="text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold text-amber-glow-primary-light dark:text-amber-glow-primary-dark drop-shadow-md flex items-center gap-2 md:gap-3"
        >
          <Shield size={32} strokeWidth={2.5} /> RedAlert
        </span>
        {#if selectedCity}
          <span
            class="flex items-center gap-2 rounded-full bg-black/5 dark:bg-white/10 px-4 py-1.5 text-[clamp(0.9rem,1.5vw,1.2rem)] font-bold opacity-90 ring-1 ring-black/10 dark:ring-white/20 shadow-sm backdrop-blur-md"
          >
            <MapPin size={18} class="text-green-600 dark:text-green-400" />
            {selectedCity}
          </span>
        {/if}
      </div>
    </div>

    <!-- Centered Clock -->
    <div
      class="hidden lg:flex flex-1 justify-center text-[clamp(0.9rem,1.2vw,1.2rem)] font-medium text-stone-700 dark:text-stone-300 opacity-90 min-w-0"
    >
      <Clock />
    </div>

    <!-- Right Side Actions & Badges -->
    <div class="flex flex-col items-center lg:items-end justify-center gap-2">
      <div class="flex flex-wrap justify-center items-center gap-3 md:gap-4">
        {#if testMode === "server"}
          <span
            class="flex items-center gap-1.5 rounded-full bg-blue-500/20 px-4 py-2 text-[clamp(1rem,1.5vw,1.3rem)] font-bold text-blue-800 dark:text-blue-300 ring-1 ring-blue-500/40"
          >
            <Satellite size={20} /> שרת טסט
          </span>
        {:else if testMode === "local"}
          <span
            class="flex items-center gap-1.5 rounded-full bg-black/10 dark:bg-white/10 px-4 py-2 text-[clamp(1rem,1.5vw,1.3rem)] font-bold text-stone-700 dark:text-white/70 ring-1 ring-black/20 dark:ring-white/20"
          >
            <Computer size={20} /> סימולציה
          </span>
        {/if}

        <div class="flex flex-col items-end gap-2 pr-2">
          <div
            class="flex items-center gap-2 bg-black/5 dark:bg-black/20 rounded-3xl p-1.5 ring-1 ring-black/10 dark:ring-white/10 shadow-inner"
          >
            <button
              onclick={() => {
                const d = document.documentElement;
                if (d.classList.contains("dark")) {
                  d.classList.remove("dark");
                  localStorage.setItem("theme", "light");
                } else {
                  d.classList.add("dark");
                  localStorage.setItem("theme", "dark");
                }
              }}
              class="rounded-2xl p-2.5 opacity-70 transition-all hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
              title="החלף עיצוב"
            >
              {#if isDarkTheme}
                <Sun size={24} />
              {:else}
                <Moon size={24} />
              {/if}
            </button>
            <a
              href="/settings"
              class="rounded-2xl p-2.5 opacity-70 transition-all hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
              title="הגדרות"
              aria-label="הגדרות"
            >
              <Settings size={24} />
            </a>
          </div>

          <ConnectionBadge
            connecting={$appState.connecting}
            connected={$appState.connected}
            upstreamConnected={$appState.upstreamConnected}
            lastUpdate={$appState.lastUpdate}
          />
        </div>
      </div>
    </div>
  </header>

  <!-- Main Two-Column Layout -->
  <main class="flex flex-col lg:flex-row flex-1 gap-6 md:gap-8 items-stretch">
    <!-- Right Column (Status Panel) (RTL means first element is right) -->
    <div
      class="flex flex-col flex-1 lg:flex-[1.2] justify-center lg:sticky top-6 lg:h-[calc(100vh-180px)]"
    >
      <StatusPanel appState={$appState} />
    </div>

    <!-- Left Column (Alert History) -->
    <div
      class="flex flex-col flex-1 rounded-4xl bg-black/5 dark:bg-white/5 p-5 md:p-8 border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl lg:h-[calc(100vh-180px)] overflow-hidden"
    >
      <div class="h-full overflow-y-auto pr-2">
        <AlertList entries={$history} {selectedCity} {cityZones} />
      </div>
    </div>
  </main>
</div>
