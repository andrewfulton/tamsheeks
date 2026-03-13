<script>
  import { store, getTodaysTasks, getAllTasks, clearDatabase, formatDuration } from './store.js';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs/index.js';

  export let open = false;

  let confirmingClear = false;

  function handleClear() {
    confirmingClear = true;
  }

  function confirmClear() {
    clearDatabase();
    confirmingClear = false;
    open = false;
  }
</script>

<Dialog bind:open>
  <DialogContent class="max-w-sm">
    <DialogHeader>
      <DialogTitle>Task Log</DialogTitle>
    </DialogHeader>

    <Tabs value="today">
      <TabsList class="w-full">
        <TabsTrigger value="today" class="flex-1">Today</TabsTrigger>
        <TabsTrigger value="all" class="flex-1">All Tasks</TabsTrigger>
      </TabsList>

      <TabsContent value="today">
        {#if getTodaysTasks().length === 0}
          <p class="text-sm text-muted-foreground text-center py-4">No tasks today.</p>
        {:else}
          <ul class="space-y-1">
            {#each getTodaysTasks() as task}
              <li class="flex items-center justify-between px-2 py-1.5 rounded-md text-sm {$store.currentTaskId === task.id ? 'bg-accent font-medium' : ''}">
                <span>{task.name}</span>
                <span class="font-mono text-muted-foreground">{formatDuration(task.elapsedMs)}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </TabsContent>

      <TabsContent value="all">
        {#if getAllTasks().length === 0}
          <p class="text-sm text-muted-foreground text-center py-4">No tasks recorded yet.</p>
        {:else}
          <ul class="space-y-1">
            {#each getAllTasks() as task}
              <li class="flex items-center justify-between px-2 py-1.5 rounded-md text-sm {$store.currentTaskId === task.id ? 'bg-accent font-medium' : ''}">
                <span>{task.name}</span>
                <span class="font-mono text-muted-foreground">{formatDuration(task.elapsedMs)}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </TabsContent>
    </Tabs>

    <div class="pt-2 border-t">
      {#if confirmingClear}
        <div class="space-y-3">
          <p class="text-sm text-muted-foreground">Are you sure? This will delete all task history.</p>
          <div class="flex gap-2">
            <Button variant="destructive" class="flex-1" onclick={confirmClear}>Yes, clear everything</Button>
            <Button variant="outline" class="flex-1" onclick={() => confirmingClear = false}>Cancel</Button>
          </div>
        </div>
      {:else}
        <Button
          variant="ghost"
          class="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onclick={handleClear}
        >
          Clear Database
        </Button>
      {/if}
    </div>
  </DialogContent>
</Dialog>
