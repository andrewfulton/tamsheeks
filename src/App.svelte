<script>
  import { onMount, onDestroy } from 'svelte';
  import { store, getElapsedToday, formatDuration } from './lib/store.js';
  import SwitchTaskModal from './lib/SwitchTaskModal.svelte';
  import TodayTasksModal from './lib/TodayTasksModal.svelte';

  let showSwitchModal = false;
  let showTodayModal = false;
  let now = new Date();
  let interval;

  onMount(() => {
    interval = setInterval(() => { now = new Date(); }, 30000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  $: currentTask = $store.tasks.find(t => t.id === $store.currentTaskId) || null;

  // Depend on `now` so this recomputes every tick
  $: elapsedMs = (() => {
    void now; // force reactivity on tick
    if (!currentTask) return 0;
    return getElapsedToday(currentTask.id, $store);
  })();

  $: sessionStart = $store.currentSessionStart
    ? new Date($store.currentSessionStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;
</script>

<main>
  <header>
    <h1>Timesheet</h1>
  </header>

  <section class="current-task">
    <p class="label">Current Task</p>
    {#if currentTask}
      <h2 class="task-name">{currentTask.name}</h2>
      <div class="meta">
        {#if sessionStart}
          <span class="session-start">Started {sessionStart}</span>
        {/if}
        <span class="elapsed">{formatDuration(elapsedMs)}</span>
      </div>
    {:else}
      <h2 class="task-name placeholder">No task started</h2>
    {/if}
  </section>

  <div class="actions">
    <button class="btn primary" on:click={() => showSwitchModal = true}>Switch Task</button>
    <button class="btn secondary" on:click={() => showTodayModal = true}>Today's Tasks</button>
  </div>
</main>

{#if showSwitchModal}
  <SwitchTaskModal onClose={() => showSwitchModal = false} />
{/if}

{#if showTodayModal}
  <TodayTasksModal onClose={() => showTodayModal = false} />
{/if}

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f5f5f5;
    color: #111;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    gap: 32px;
  }

  header h1 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #888;
  }

  .current-task {
    background: #fff;
    border-radius: 12px;
    padding: 32px 40px;
    text-align: center;
    min-width: 280px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }

  .label {
    margin: 0 0 8px;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #999;
  }

  h2.task-name {
    margin: 0 0 16px;
    font-size: 1.6rem;
    font-weight: 600;
  }

  h2.placeholder {
    color: #bbb;
    font-weight: 400;
  }

  .meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .session-start {
    font-size: 0.85rem;
    color: #888;
  }

  .elapsed {
    font-size: 2rem;
    font-weight: 700;
    font-family: monospace;
    color: #4f46e5;
    font-variant-numeric: tabular-nums;
  }

  .actions {
    display: flex;
    gap: 12px;
  }

  .btn {
    padding: 12px 24px;
    border-radius: 6px;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
    transition: opacity 0.1s;
  }

  .btn:hover {
    opacity: 0.85;
  }

  .btn.primary {
    background: #4f46e5;
    color: #fff;
  }

  .btn.secondary {
    background: #e5e7eb;
    color: #111;
  }
</style>
