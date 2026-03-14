<script lang="ts">
  import type { AlertState, AppState } from "$lib/types";
  import ShelterTimer from "./ShelterTimer.svelte";
  import {
    CheckCircle2,
    TriangleAlert,
    ShieldAlert,
    Check,
    AlertTriangle,
  } from "lucide-svelte";

  interface Props {
    appState: AppState;
  }
  let { appState }: Props = $props();

  const headlines: Record<AlertState, string> = {
    IDLE: "אין התראות",
    STANDBY: "הישארו ליד המרחב המוגן",
    ALERT: "כנסו למרחב מוגן!",
    SHELTER: "שהו במרחב מוגן",
    ALL_CLEAR: "ניתן לצאת מהמרחב המוגן",
    STANDBY_CLEAR: "ניתן להתרחק מהמרחב המוגן",
  };

  const MAX_CITIES = 3;

  const stateToClass = (state: AlertState) =>
    state.toLowerCase().replaceAll("_", "-");
</script>

<div
  class="relative flex min-h-[40vh] flex-col items-center justify-center gap-4
  rounded-4xl p-8 transition-all duration-700 border backdrop-blur-xl
  status-panel-bg {stateToClass(appState.status)}"
  class:animate-radar-pulse={appState.status === "ALERT"}
>
  <!-- Icon -->
  <div class="mb-2 md:mb-4 flex items-center justify-center text-center">
    {#if appState.status === "IDLE"}
      <CheckCircle2
        size="clamp(6rem, 12vmin, 8rem)"
        strokeWidth={1.5}
        class="text-green-600/60 dark:text-green-400/60"
      />
    {:else if appState.status === "STANDBY"}
      <AlertTriangle
        size="clamp(6.5rem, 14vmin, 9rem)"
        strokeWidth={1.5}
        class="text-yellow-700 dark:text-yellow-300 drop-shadow-sm"
      />
    {:else if appState.status === "ALERT"}
      <TriangleAlert
        size="clamp(7rem, 15vmin, 10rem)"
        strokeWidth={2}
        class="text-white drop-shadow-md"
      />
    {:else if appState.status === "SHELTER"}
      <ShieldAlert
        size="clamp(6.5rem, 14vmin, 9rem)"
        strokeWidth={1.5}
        class="text-white drop-shadow-sm"
      />
    {:else if appState.status === "ALL_CLEAR" || appState.status === "STANDBY_CLEAR"}
      <Check
        size="clamp(6.5rem, 14vmin, 9rem)"
        strokeWidth={2}
        class="text-green-700 dark:text-green-400"
      />
    {/if}
  </div>

  <!-- Headline -->
  <h1
    class="text-center font-bold leading-tight text-[clamp(1.8rem,6vmin,4.5rem)] drop-shadow-sm"
  >
    {headlines[appState.status]}
  </h1>

  <!-- Alert details -->
  {#if appState.currentAlert && appState.status !== "IDLE"}
    <p
      class="text-center opacity-90 font-medium text-[clamp(1.2rem,3.5vmin,2.5rem)]"
    >
      {appState.currentAlert.title}
    </p>
    {#if appState.currentAlert.cities.length > 0}
      {@const cities = appState.currentAlert.cities}
      {@const shown = cities.slice(0, MAX_CITIES)}
      {@const rest = cities.length - MAX_CITIES}
      <p
        class="text-center opacity-75 text-[clamp(0.85rem,1.8vmin,1.3rem)] mt-1"
      >
        {shown.join(", ")}{#if rest > 0}
          <span class="opacity-60">+{rest}</span>{/if}
      </p>
    {/if}
  {/if}

  <!-- Shelter timer (countdown) -->
  {#if appState.status === "ALERT"}
    <ShelterTimer seconds={appState.alertSecondsLeft} />
  {/if}
</div>

<style type="text/postcss">
  @reference "#app.css";

  :global(.status-panel-bg) {
    &.idle {
      @apply bg-green-600/10 dark:bg-green-500/10 
      border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]
      text-stone-700 dark:text-stone-300;
    }

    &.standby {
      @apply bg-yellow-500/20 dark:bg-yellow-400/15
       border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.3)]
        text-yellow-900 dark:text-yellow-200;
    }

    &.alert {
      @apply bg-amber-glow-alert-light dark:bg-amber-glow-alert-dark 
      border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.4)] text-white;
    }

    &.shelter {
      @apply bg-amber-glow-primary-light dark:bg-amber-glow-primary-dark
      border-orange-500/30 shadow-[0_0_30px_rgba(234,88,12,0.3)] text-white;
    }

    &.all-clear,
    &.standby-clear {
      @apply bg-green-500/20 dark:bg-green-400/20 border-green-400/30 
      shadow-[0_0_40px_rgba(74,222,128,0.2)] text-green-900
      dark:text-green-300;
    }
  }

</style>
