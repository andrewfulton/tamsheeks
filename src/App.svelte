<script>
  import { onMount, onDestroy } from 'svelte';
  import { store, getElapsedToday, formatDuration } from './lib/store.js';
  import SwitchTaskModal from './lib/SwitchTaskModal.svelte';
  import TodayTasksModal from './lib/TodayTasksModal.svelte';
  import ManageTasksModal from './lib/ManageTasksModal.svelte';
  import { Button } from '$lib/components/ui/button/index.js';

  let showSwitchModal = false;
  let showTodayModal = false;
  let showManageModal = false;
  let now = new Date();
  let interval;

  onMount(() => {
    interval = setInterval(() => { now = new Date(); }, 30000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  $: currentTask = $store.tasks.find(t => t.id === $store.currentTaskId) || null;

  $: elapsedMs = (() => {
    void now;
    if (!currentTask) return 0;
    return getElapsedToday(currentTask.id, $store);
  })();

  $: sessionStart = $store.currentSessionStart
    ? new Date($store.currentSessionStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;
</script>

<main class="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
  <div class="w-full max-w-sm space-y-8">
    <header class="text-center">
      <h1 class="text-2xl font-semibold tracking-tight">Tamsheek</h1>
    </header>

    <section class="space-y-2 text-center">
      <p class="text-sm text-muted-foreground">Current Task</p>
      {#if currentTask}
        <h2 class="text-xl font-medium">{currentTask.name}</h2>
        <div class="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          {#if sessionStart}
            <span>Started {sessionStart}</span>
          {/if}
          <span class="font-mono text-foreground">{formatDuration(elapsedMs)}</span>
        </div>
      {:else}
        <h2 class="text-xl font-medium text-muted-foreground">No task started</h2>
      {/if}
    </section>

    <div class="flex flex-col sm:flex-row gap-3">
      <Button class="flex-1" onclick={() => showSwitchModal = true}>Switch Task</Button>
      <Button class="flex-1" variant="outline" onclick={() => showTodayModal = true}>Today's Tasks</Button>
      <Button class="flex-1" variant="outline" onclick={() => showManageModal = true}>Common Tasks</Button>
    </div>
  </div>
</main>

<SwitchTaskModal bind:open={showSwitchModal} />
<TodayTasksModal bind:open={showTodayModal} />
<ManageTasksModal bind:open={showManageModal} />
