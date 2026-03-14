<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";

  let time = $state("");
  let date = $state("");
  let hebrewDate = $state("");
  let interval: ReturnType<typeof setInterval>;

  function update() {
    const now = new Date();
    time = now.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const weekday = now.toLocaleDateString("he-IL", { weekday: "long" });
    const dayMonth = now.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "long",
    });

    date = dayMonth;
    hebrewDate = `${weekday}, ${formatJewishDateInHebrew(toJewishDate(now))}`;
  }

  onMount(() => {
    update();
    interval = setInterval(update, 1000);
  });

  onDestroy(() => clearInterval(interval));
</script>

<div class="flex items-center gap-3">
  <span class="opacity-80 font-medium">{hebrewDate}</span>
  <span class="opacity-40">|</span>
  <span class="opacity-80">{date}</span>
  <span class="opacity-40">|</span>
  <span class="font-mono font-bold tabular-nums opacity-90">{time}</span>
</div>
