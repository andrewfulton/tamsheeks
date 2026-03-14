import { writable, derived, get } from 'svelte/store';

const STORAGE_KEY = 'timesheets';
const COMMON_KEY = 'timesheets_common';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { tasks: [], currentTaskId: null, currentSessionStart: null };
}

function loadCommon() {
  try {
    const raw = localStorage.getItem(COMMON_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveCommon(common) {
  localStorage.setItem(COMMON_KEY, JSON.stringify(common));
  commonStore.set(common);
}

export const store = writable(loadState());
export const commonStore = writable(loadCommon());

store.subscribe(saveState);

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isToday(isoString) {
  return new Date(isoString) >= todayStart();
}

// Returns the effective end of a session, capped at 18:00 of the start day.
// Sessions are assumed to finish on the same day they started (office hours rule).
function sessionEffectiveEnd(session, taskId, state, now = new Date()) {
  const start = new Date(session.start);
  const rawEnd = session.end
    ? new Date(session.end)
    : (state.currentTaskId === taskId ? now : start);
  const dayEnd = new Date(start);
  dayEnd.setHours(18, 0, 0, 0);
  return new Date(Math.min(rawEnd.getTime(), dayEnd.getTime()));
}

// Sum ms from completed sessions + optional live session
export function getElapsedToday(taskId, state) {
  const s = state || get(store);
  const task = s.tasks.find(t => t.id === taskId);
  if (!task) return 0;

  const now = new Date();
  let ms = 0;
  for (const session of task.sessions) {
    if (!isToday(session.start)) continue;
    const start = new Date(session.start);
    const end = sessionEffectiveEnd(session, taskId, s, now);
    ms += Math.max(0, end - start);
  }
  return ms;
}

export function formatDuration(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function startTask(taskId) {
  store.update(s => {
    const now = new Date().toISOString();

    // End current session
    if (s.currentTaskId) {
      const current = s.tasks.find(t => t.id === s.currentTaskId);
      if (current && s.currentSessionStart) {
        const lastSession = current.sessions[current.sessions.length - 1];
        if (lastSession && lastSession.end === null) {
          lastSession.end = now;
        }
      }
    }

    if (taskId === null) {
      return { ...s, currentTaskId: null, currentSessionStart: null };
    }

    const task = s.tasks.find(t => t.id === taskId);
    if (!task) return s;

    // Add new session
    task.sessions.push({ start: now, end: null });

    return { ...s, currentTaskId: taskId, currentSessionStart: now };
  });
}

export function createAndStartTask(name) {
  const trimmed = name.trim();
  if (!trimmed) return;

  let newId;
  store.update(s => {
    const now = new Date().toISOString();

    // End current session
    if (s.currentTaskId) {
      const current = s.tasks.find(t => t.id === s.currentTaskId);
      if (current && s.currentSessionStart) {
        const lastSession = current.sessions[current.sessions.length - 1];
        if (lastSession && lastSession.end === null) {
          lastSession.end = now;
        }
      }
    }

    // Check if task with same name already has sessions today ("extend timer")
    const existing = s.tasks.find(t => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      const hasToday = existing.sessions.some(sess => isToday(sess.start));
      if (hasToday) {
        newId = existing.id;
        existing.sessions.push({ start: now, end: null });
        return { ...s, currentTaskId: existing.id, currentSessionStart: now };
      }
    }

    newId = generateId();
    const newTask = { id: newId, name: trimmed, sessions: [{ start: now, end: null }] };
    return {
      ...s,
      tasks: [...s.tasks, newTask],
      currentTaskId: newId,
      currentSessionStart: now,
    };
  });
  return newId;
}

export function getTodaysTasks() {
  const s = get(store);
  return s.tasks
    .filter(t => t.sessions.some(sess => isToday(sess.start)))
    .map(t => ({ ...t, elapsedMs: getElapsedToday(t.id, s) }))
    .sort((a, b) => {
      const aLast = Math.max(...a.sessions.map(sess => new Date(sess.start)));
      const bLast = Math.max(...b.sessions.map(sess => new Date(sess.start)));
      return bLast - aLast;
    });
}

export function getAllTasks() {
  const s = get(store);
  const now = new Date();
  return s.tasks.map(t => {
    let ms = 0;
    for (const sess of t.sessions) {
      const start = new Date(sess.start);
      const end = sessionEffectiveEnd(sess, t.id, s, now);
      ms += Math.max(0, end - start);
    }
    return { ...t, elapsedMs: ms };
  }).sort((a, b) => {
    const aLast = Math.max(...a.sessions.map(s => new Date(s.start)));
    const bLast = Math.max(...b.sessions.map(s => new Date(s.start)));
    return bLast - aLast;
  });
}

export function getTasksGroupedByDay() {
  const s = get(store);
  const now = new Date();
  const dayMap = new Map();

  for (const task of s.tasks) {
    for (const session of task.sessions) {
      const start = new Date(session.start);
      const end = sessionEffectiveEnd(session, task.id, s, now);
      const dayKey = start.toDateString();

      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, { date: start, tasks: new Map() });
      }
      const dayTasks = dayMap.get(dayKey).tasks;
      if (!dayTasks.has(task.id)) {
        dayTasks.set(task.id, { id: task.id, name: task.name, elapsedMs: 0 });
      }
      dayTasks.get(task.id).elapsedMs += Math.max(0, end - start);
    }
  }

  return [...dayMap.values()]
    .sort((a, b) => b.date - a.date)
    .map(({ date, tasks }) => ({
      date,
      tasks: [...tasks.values()].sort((a, b) => b.elapsedMs - a.elapsedMs),
    }));
}

export function getRecentTasks(n = 5) {
  const s = get(store);
  // Sort tasks by most recent session start, pick distinct task names
  const sorted = [...s.tasks].sort((a, b) => {
    const aLast = Math.max(...a.sessions.map(sess => new Date(sess.start)));
    const bLast = Math.max(...b.sessions.map(sess => new Date(sess.start)));
    return bLast - aLast;
  });
  return sorted.slice(0, n);
}

export function getCommonTasks(n = 5) {
  const common = loadCommon();
  return common.sort((a, b) => b.frequency - a.frequency).slice(0, n);
}

export function getAllCommonTasks() {
  return loadCommon().sort((a, b) => b.frequency - a.frequency);
}

export function addCommonTask(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  let common = loadCommon();
  const existing = common.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    existing.frequency += 1;
  } else {
    common.push({ name: trimmed, frequency: 1 });
  }
  common.sort((a, b) => b.frequency - a.frequency);
  saveCommon(common);
}

export function removeCommonTask(name) {
  const common = loadCommon().filter(c => c.name.toLowerCase() !== name.toLowerCase());
  saveCommon(common);
}

export function clearDatabase() {
  const s = get(store);
  let common = loadCommon();

  // Increment frequency for each task name
  for (const task of s.tasks) {
    const existing = common.find(c => c.name.toLowerCase() === task.name.toLowerCase());
    if (existing) {
      existing.frequency += 1;
    } else {
      common.push({ name: task.name, frequency: 1 });
    }
  }

  // Sort by frequency desc, cap at 30
  common.sort((a, b) => b.frequency - a.frequency);
  common = common.slice(0, 30);

  saveCommon(common);

  const fresh = { tasks: [], currentTaskId: null, currentSessionStart: null };
  saveState(fresh);
  store.set(fresh);
}
