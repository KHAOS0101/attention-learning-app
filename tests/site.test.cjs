const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const appScript = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

function createAppContext(savedState = null) {
  const sandbox = {
    localStorage: {
      getItem: () => savedState,
      setItem: () => {},
    },
    document: {
      readyState: 'loading',
      addEventListener: () => {},
    },
    window: { addEventListener: () => {} },
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(appScript, sandbox, { filename: 'script.js' });
  return sandbox;
}

function makeBackup(overrides = {}) {
  return {
    app: 'Attention Learning',
    version: 2,
    data: {
      profile: null,
      goals: { study: true, review: false, pause: false },
      goalsDate: '2026-11-10',
      dailyLogs: {},
      sessions: [],
      customGoals: [],
      journalEntries: [],
      joinedGroups: [],
      ...overrides,
    },
  };
}

function validate(context, backup) {
  context.backupInput = JSON.stringify(backup);
  return JSON.parse(vm.runInContext('JSON.stringify(validateBackup(JSON.parse(backupInput)))', context));
}

test('new backups restore study tasks, goal history, and preferences', () => {
  const context = createAppContext();
  const backup = makeBackup({
    studyTasks: [{
      id: 'task-1',
      title: 'Revisar um capítulo',
      date: '2026-11-11',
      time: '14:30',
      minutes: 25,
      completed: false,
    }],
    goalHistory: { '2026-11-10': { completed: 2, total: 3 } },
    preferences: { theme: 'dark', textSize: 'large', onboardingComplete: true },
  });

  const restored = validate(context, backup);
  assert.deepEqual(restored.studyTasks, backup.data.studyTasks);
  assert.deepEqual(restored.goalHistory, backup.data.goalHistory);
  assert.deepEqual(restored.preferences, backup.data.preferences);
});

test('backup validation rejects malformed planner dates, times, and durations', () => {
  const context = createAppContext();
  for (const changes of [
    { date: '2026-02-30' },
    { time: '25:30' },
    { minutes: 361 },
  ]) {
    const task = {
      id: 'task-1',
      title: 'Estudar',
      date: '2026-11-11',
      time: '14:30',
      minutes: 25,
      completed: false,
      ...changes,
    };
    assert.throws(() => validate(context, makeBackup({ studyTasks: [task] })), /backup válido/);
  }
});

test('legacy backups without new fields remain restorable', () => {
  const context = createAppContext();
  const restored = validate(context, makeBackup());
  assert.deepEqual(restored.studyTasks, []);
  assert.deepEqual(restored.goalHistory, {});
  assert.deepEqual(restored.preferences, {
    theme: 'system',
    textSize: 'normal',
    onboardingComplete: false,
  });
});

test('daily rollover archives completed goal counts before resetting today', () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = [
    yesterday.getFullYear(),
    String(yesterday.getMonth() + 1).padStart(2, '0'),
    String(yesterday.getDate()).padStart(2, '0'),
  ].join('-');
  const saved = {
    profile: null,
    goals: { study: true, review: false, pause: true },
    customGoals: [{ id: 'custom-1', title: 'Ler', completed: true }],
    goalsDate: yesterdayKey,
    dailyLogs: {},
    sessions: [],
    joinedGroups: [],
  };
  const context = createAppContext(JSON.stringify(saved));
  const archived = JSON.parse(vm.runInContext(`JSON.stringify(state.goalHistory["${yesterdayKey}"])`, context));

  assert.deepEqual(archived, { completed: 3, total: 4 });
  assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(state.goals)', context)), {
    study: false,
    review: false,
    pause: false,
  });
});
