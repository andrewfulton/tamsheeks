<script>
  import { commonStore, addCommonTask, removeCommonTask } from './store.js';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Trash2 } from '@lucide/svelte';

  export let open = false;

  let newTaskName = '';

  $: commonTasks = [...$commonStore].sort((a, b) => b.frequency - a.frequency);

  function handleAdd() {
    if (!newTaskName.trim()) return;
    addCommonTask(newTaskName.trim());
    newTaskName = '';
  }

  function handleRemove(name) {
    removeCommonTask(name);
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') handleAdd();
  }
</script>

<Dialog bind:open>
  <DialogContent class="max-w-sm">
    <DialogHeader>
      <DialogTitle>Common Tasks</DialogTitle>
    </DialogHeader>

    <div class="flex gap-2">
      <Input
        type="text"
        placeholder="Task name…"
        bind:value={newTaskName}
        onkeydown={handleKeydown}
        autofocus
        class="flex-1"
      />
      <Button onclick={handleAdd} disabled={!newTaskName.trim()}>Add</Button>
    </div>

    <section class="space-y-1">
      <h3 class="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Common Tasks</h3>
      {#if commonTasks.length === 0}
        <p class="text-sm text-muted-foreground px-1 py-2">No common tasks yet</p>
      {:else}
        <div class="space-y-0.5">
          {#each commonTasks as task}
            <div class="flex items-center gap-2 px-1 py-1 rounded-md hover:bg-accent">
              <span class="flex-1 text-sm">{task.name}</span>
              <span class="text-xs text-muted-foreground">{task.frequency}</span>
              <Button
                variant="ghost"
                size="icon"
                class="h-7 w-7 shrink-0"
                onclick={() => handleRemove(task.name)}
              >
                <Trash2 class="h-3.5 w-3.5" />
              </Button>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </DialogContent>
</Dialog>
