# Timesheets

A minimal, single-page timesheet tracker. No backend, no auth — all data lives in `localStorage`.

## Features

- Track what you're working on with a running elapsed timer
- Switch tasks instantly; previous session is closed automatically
- Switching back to a task accumulates time across multiple sessions
- Recent tasks list for quick re-selection
- Common tasks list that persists across database clears (tracks frequency)
- Today's Tasks view with per-task totals
- Full task history view (all time)
- Clear database — wipes today's tasks while preserving common task frequency

## Stack

- Vite + Svelte (no external runtime dependencies beyond Svelte)
- No framework CSS — scoped Svelte styles only

## Running locally

```bash
npm install
npm run dev
```

## Data model

Two `localStorage` keys:

**`timesheets`** — main state (cleared on "Clear Database")
```json
{
  "tasks": [
    {
      "id": "string",
      "name": "string",
      "sessions": [{ "start": "ISO string", "end": "ISO string | null" }]
    }
  ],
  "currentTaskId": "string | null",
  "currentSessionStart": "ISO string | null"
}
```

**`timesheets_common`** — persists across clears (up to 30 entries)
```json
[{ "name": "string", "frequency": "number" }]
```

## Project structure

```
src/
  App.svelte                  # Main view: current task, elapsed timer, action buttons
  lib/
    store.js                  # Reactive localStorage store + all helper functions
    SwitchTaskModal.svelte    # Recent + common task picker, new task input
    TodayTasksModal.svelte    # Today/all-time task log, clear database
```
