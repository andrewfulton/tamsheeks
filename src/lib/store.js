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
}

export const store = writable(loadState());

store.subscribe(saveState);

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isToday(isoString) {
  return new Date(isoString) >= todayStart();
}

// Sum ms from completed sessions + optional live session
export function getElapsedToday(taskId, state) {
  const s = state || get(store);
  const task = s.tasks.find(t => t.id === taskId);
  if (!task) return 0;

  let ms = 0;
  const now = new Date();
  for (const session of task.sessions) {
    if (!isToday(session.start)) continue;
    const start = new Date(session.start);
    const end = session.end ? new Date(session.end) : (s.currentTaskId === taskId ? now : start);
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
  return s.tasks.map(t => {
    let ms = 0;
    const now = new Date();
    for (const sess of t.sessions) {
      const start = new Date(sess.start);
      const end = sess.end ? new Date(sess.end) : (s.currentTaskId === t.id ? now : start);
      ms += Math.max(0, end - start);
    }
    return { ...t, elapsedMs: ms };
  }).sort((a, b) => {
    const aLast = Math.max(...a.sessions.map(s => new Date(s.start)));
    const bLast = Math.max(...b.sessions.map(s => new Date(s.start)));
    return bLast - aLast;
  });
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
