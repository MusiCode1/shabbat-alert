<script lang="ts">
  interface Props {
    seconds: number;
  }
  let { seconds }: Props = $props();

  const mins = $derived(Math.floor(seconds / 60));
  const secs = $derived(seconds % 60);
  const display = $derived(
    `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`,
  );

  const MAX_SECONDS = 90;
  // Calculate SVG circle properties for circular progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = $derived(
    circumference - (Math.max(0, seconds) / MAX_SECONDS) * circumference,
  );
</script>

<div
  class="relative flex items-center justify-center translate-y-2 md:translate-y-4"
>
  <!-- Circular SVG Progress -->
  <svg
    class="w-[clamp(10rem,25vmin,16rem)] h-auto -rotate-90 transform drop-shadow-md"
    viewBox="0 0 280 280"
  >
    <!-- Background Track -->
    <circle
      cx="140"
      cy="140"
      r={radius}
      stroke="currentColor"
      stroke-width="12"
      fill="transparent"
      class="opacity-20 text-white"
    ></circle>

    <!-- Progress Arc -->
    <circle
      cx="140"
      cy="140"
      r={radius}
      stroke="currentColor"
      stroke-width="12"
      fill="transparent"
      stroke-linecap="round"
      class="text-white transition-all duration-1000 ease-linear"
      style="stroke-dasharray: {circumference}; stroke-dashoffset: {strokeDashoffset};"
    ></circle>
  </svg>

  <!-- Centered Text -->
  <div class="absolute inset-0 flex items-center justify-center flex-col">
    <div
      class="font-mono text-[clamp(2.2rem,6vmin,4rem)] font-black tabular-nums leading-none tracking-tight drop-shadow-md"
    >
      {display}
    </div>
    <div
      class="text-[clamp(0.8rem,1.5vmin,1.1rem)] opacity-80 mt-1 font-medium"
    >
      זמן למרחב מוגן
    </div>
  </div>
</div>
