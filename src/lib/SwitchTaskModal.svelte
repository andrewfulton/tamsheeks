<script>
  import { store, startTask, createAndStartTask, getRecentTasks, getCommonTasks, getAllCommonTasks } from './store.js';

  export let onClose;

  let newTaskName = '';
  let showAllCommon = false;

  $: recentTasks = getRecentTasks(5);
  $: commonTasks = showAllCommon ? getAllCommonTasks() : getCommonTasks(5);

  function handleSelect(taskId) {
    startTask(taskId);
    onClose();
  }

  function handleStartNew() {
    if (!newTaskName.trim()) return;
    createAndStartTask(newTaskName.trim());
    onClose();
  }

  function handleStartCommon(name) {
    // Check if a task with this name already exists
    const s = $store;
    const existing = s.tasks.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      startTask(existing.id);
    } else {
      createAndStartTask(name);
    }
    onClose();
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') handleStartNew();
    if (e.key === 'Escape') onClose();
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
      <h2>Switch Task</h2>
      <button class="close-btn" on:click={onClose}>✕</button>
    </div>

    <div class="new-task">
      <input
        type="text"
        placeholder="New task name…"
        bind:value={newTaskName}
        on:keydown={handleKeydown}
        autofocus
      />
      <button on:click={handleStartNew} disabled={!newTaskName.trim()}>Start</button>
    </div>

    {#if recentTasks.length > 0}
      <section>
        <h3>Recent</h3>
        <ul>
          {#each recentTasks as task}
            <li>
              <button
                class="task-btn"
                class:active={$store.currentTaskId === task.id}
                on:click={() => handleSelect(task.id)}
              >
                {task.name}
              </button>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if commonTasks.length > 0}
      <section>
        <h3>Common</h3>
        <ul>
          {#each commonTasks as item}
            <li>
              <button class="task-btn" on:click={() => handleStartCommon(item.name)}>
                {item.name}
              </button>
            </li>
          {/each}
        </ul>
        {#if getAllCommonTasks().length > 5}
          <button class="load-more" on:click={() => showAllCommon = !showAllCommon}>
            {showAllCommon ? 'Show less' : `Load more (${getAllCommonTasks().length - 5} more)`}
          </button>
        {/if}
      </section>
    {/if}
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
    width: 360px;
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

  h3 {
    margin: 0 0 8px;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #666;
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

  .new-task {
    display: flex;
    gap: 8px;
  }

  .new-task input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.95rem;
  }

  .new-task input:focus {
    outline: none;
    border-color: #4f46e5;
  }

  .new-task button {
    padding: 8px 16px;
    background: #4f46e5;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.95rem;
  }

  .new-task button:disabled {
    background: #a5b4fc;
    cursor: not-allowed;
  }

  section {
    border-top: 1px solid #eee;
    padding-top: 12px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .task-btn {
    width: 100%;
    text-align: left;
    padding: 8px 12px;
    background: #f9f9f9;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: background 0.1s;
  }

  .task-btn:hover {
    background: #f0f0f0;
  }

  .task-btn.active {
    background: #eef2ff;
    border-color: #a5b4fc;
    color: #4f46e5;
    font-weight: 500;
  }

  .load-more {
    margin-top: 8px;
    background: none;
    border: none;
    color: #4f46e5;
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0;
  }

  .load-more:hover {
    text-decoration: underline;
  }
</style>
