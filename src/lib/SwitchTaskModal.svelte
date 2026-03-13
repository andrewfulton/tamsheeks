<script>
  import { store, startTask, createAndStartTask, getRecentTasks, getCommonTasks, getAllCommonTasks } from './store.js';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';

  export let open = false;

  let newTaskName = '';
  let showAllCommon = false;

  $: recentTasks = $store.tasks && getRecentTasks(5);
  $: commonTasks = $store.tasks && (showAllCommon ? getAllCommonTasks() : getCommonTasks(5));

  function handleSelect(taskId) {
    startTask(taskId);
    open = false;
  }

  function handleStartNew() {
    if (!newTaskName.trim()) return;
    createAndStartTask(newTaskName.trim());
    newTaskName = '';
    open = false;
  }

  function handleStartCommon(name) {
    const s = $store;
    const existing = s.tasks.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      startTask(existing.id);
    } else {
      createAndStartTask(name);
    }
    open = false;
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') handleStartNew();
  }
</script>

<Dialog bind:open>
  <DialogContent class="max-w-sm">
    <DialogHeader>
      <DialogTitle>Switch Task</DialogTitle>
    </DialogHeader>

    <div class="flex gap-2">
      <Input
        type="text"
        placeholder="New task name…"
        bind:value={newTaskName}
        onkeydown={handleKeydown}
        autofocus
        class="flex-1"
      />
      <Button onclick={handleStartNew} disabled={!newTaskName.trim()}>Start</Button>
    </div>

    {#if recentTasks.length > 0}
      <section class="space-y-1">
        <h3 class="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Recent</h3>
        <div class="space-y-0.5">
          {#each recentTasks as task}
            <Button
              variant={$store.currentTaskId === task.id ? 'secondary' : 'ghost'}
              class="w-full justify-start"
              onclick={() => handleSelect(task.id)}
            >
              {task.name}
            </Button>
          {/each}
        </div>
      </section>
    {/if}

    {#if commonTasks.length > 0}
      <section class="space-y-1">
        <h3 class="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Common</h3>
        <div class="space-y-0.5">
          {#each commonTasks as item}
            <Button
              variant="ghost"
              class="w-full justify-start"
              onclick={() => handleStartCommon(item.name)}
            >
              {item.name}
            </Button>
          {/each}
        </div>
        {#if getAllCommonTasks().length > 5}
          <Button
            variant="ghost"
            class="w-full text-xs text-muted-foreground"
            onclick={() => showAllCommon = !showAllCommon}
          >
            {showAllCommon ? 'Show less' : `Load more (${getAllCommonTasks().length - 5} more)`}
          </Button>
        {/if}
      </section>
    {/if}
  </DialogContent>
</Dialog>
