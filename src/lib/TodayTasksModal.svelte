<script>
  import { store, getTodaysTasks, getAllTasks, clearDatabase, formatDuration } from './store.js';

  export let onClose;

  let view = 'today'; // 'today' | 'all'
  let confirmingClear = false;

  $: tasks = view === 'today' ? getTodaysTasks() : getAllTasks();

  function handleClear() {
    confirmingClear = true;
  }

  function confirmClear() {
    clearDatabase();
    confirmingClear = false;
    onClose();
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="backdrop" on:click={handleBackdrop}>
  <div class="modal">
    <div class="modal-header">
      <h2>Task Log</h2>
      <button class="close-btn" on:click={onClose}>✕</button>
    </div>

    <div class="toggle">
      <button class:active={view === 'today'} on:click={() => view = 'today'}>Today</button>
      <button class:active={view === 'all'} on:click={() => view = 'all'}>All Tasks</button>
    </div>

    {#if tasks.length === 0}
      <p class="empty">No tasks {view === 'today' ? 'today' : 'recorded yet'}.</p>
    {:else}
      <ul>
        {#each tasks as task}
          <li class:current={$store.currentTaskId === task.id}>
            <span class="task-name">{task.name}</span>
            <span class="duration">{formatDuration(task.elapsedMs)}</span>
          </li>
        {/each}
      </ul>
    {/if}

    <div class="footer">
      {#if confirmingClear}
        <div class="confirm">
          <p>Are you sure? This will delete all task history.</p>
          <div class="confirm-btns">
            <button class="danger" on:click={confirmClear}>Yes, clear everything</button>
            <button on:click={() => confirmingClear = false}>Cancel</button>
          </div>
        </div>
      {:else}
        <button class="clear-btn" on:click={handleClear}>Clear Database</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .modal {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    width: 400px;
    max-width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #666;
    padding: 4px;
  }

  .close-btn:hover {
    color: #000;
  }

  .toggle {
    display: flex;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    overflow: hidden;
  }

  .toggle button {
    flex: 1;
    padding: 8px;
    background: #f9f9f9;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.1s;
  }

  .toggle button.active {
    background: #4f46e5;
    color: #fff;
  }

  .empty {
    color: #888;
    text-align: center;
    margin: 8px 0;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: #f9f9f9;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
  }

  li.current {
    background: #eef2ff;
    border-color: #a5b4fc;
  }

  .task-name {
    font-size: 0.95rem;
  }

  li.current .task-name {
    color: #4f46e5;
    font-weight: 500;
  }

  .duration {
    font-size: 0.95rem;
    font-variant-numeric: tabular-nums;
    color: #444;
    font-family: monospace;
  }

  .footer {
    border-top: 1px solid #eee;
    padding-top: 12px;
  }

  .clear-btn {
    background: none;
    border: 1px solid #e5e5e5;
    color: #dc2626;
    border-radius: 4px;
    padding: 8px 14px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .clear-btn:hover {
    background: #fef2f2;
    border-color: #dc2626;
  }

  .confirm p {
    margin: 0 0 10px;
    font-size: 0.9rem;
    color: #444;
  }

  .confirm-btns {
    display: flex;
    gap: 8px;
  }

  .confirm-btns button {
    padding: 8px 14px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    border: 1px solid #e5e5e5;
    background: #f9f9f9;
  }

  .confirm-btns button.danger {
    background: #dc2626;
    color: #fff;
    border-color: #dc2626;
  }

  .confirm-btns button.danger:hover {
    background: #b91c1c;
  }
</style>
