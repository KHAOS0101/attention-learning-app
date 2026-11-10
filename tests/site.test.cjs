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
    version: 3,
    data: {
      profile: null,
      goals: { study: true, review: false, pause: false },
      goalsDate: '2026-11-10',
      dailyLogs: {},
      sessions: [],
      customGoals: [],
      journalEntries: [],
      joinedGroups: [],
      sessions: [],
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
      type: 'study',
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

test('version 3 backups restore flashcards, task types, and session reflections', () => {
  const context = createAppContext();
  const backup = makeBackup({
    studyTasks: [{
      id: 'exam-1',
      title: 'Prova de biologia',
      type: 'exam',
      date: '2026-11-12',
      time: '',
      minutes: 25,
      completed: false,
    }],
    flashcards: [{
      id: 'card-1',
      front: 'Qual é a função da mitocôndria?',
      back: 'Participa da produção de energia celular.',
      dueDate: '2026-11-10',
      createdAt: '2026-11-09',
      intervalDays: 1,
      repetitions: 1,
      lastReviewed: '2026-11-09',
    }],
    sessions: [{
      id: 'session-1',
      date: '2026-11-10',
      minutes: 25,
      reflection: {
        completed: 'Revisei o capítulo.',
        nextStep: 'Fazer exercícios.',
        createdAt: '2026-11-10T12:00:00.000Z',
      },
    }],
  });

  const restored = validate(context, backup);
  assert.deepEqual(restored.flashcards, backup.data.flashcards);
  assert.equal(restored.studyTasks[0].type, 'exam');
  assert.deepEqual(restored.sessions[0].reflection, backup.data.sessions[0].reflection);
});

test('flashcard ratings schedule increasing recall intervals and retry missed cards tomorrow', () => {
  const context = createAppContext();
  context.cardInput = JSON.stringify({
    id: 'card-1',
    dueDate: '2026-11-10',
    intervalDays: 0,
    repetitions: 0,
    lastReviewed: null,
  });
  const nextGood = JSON.parse(vm.runInContext(
    'JSON.stringify(scheduleFlashcard(JSON.parse(cardInput), "good", "2026-11-10"))',
    context,
  ));
  assert.equal(nextGood.dueDate, '2026-11-11');
  assert.equal(nextGood.intervalDays, 1);
  assert.equal(nextGood.repetitions, 1);

  context.cardInput = JSON.stringify(nextGood);
  const secondGood = JSON.parse(vm.runInContext(
    'JSON.stringify(scheduleFlashcard(JSON.parse(cardInput), "good", "2026-11-11"))',
    context,
  ));
  assert.equal(secondGood.dueDate, '2026-11-14');
  assert.equal(secondGood.intervalDays, 3);

  context.cardInput = JSON.stringify(secondGood);
  const missed = JSON.parse(vm.runInContext(
    'JSON.stringify(scheduleFlashcard(JSON.parse(cardInput), "again", "2026-11-14"))',
    context,
  ));
  assert.equal(missed.dueDate, '2026-11-15');
  assert.equal(missed.repetitions, 0);
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

test('backup validation rejects invalid flashcards and oversized session reflections', () => {
  const context = createAppContext();
  const validCard = {
    id: 'card-1',
    front: 'Pergunta',
    back: 'Resposta',
    dueDate: '2026-11-10',
    createdAt: '2026-11-10',
    intervalDays: 0,
    repetitions: 0,
    lastReviewed: null,
  };
  assert.throws(() => validate(context, makeBackup({
    flashcards: [{ ...validCard, dueDate: '2026-02-30' }],
  })), /backup válido/);

  assert.throws(() => validate(context, makeBackup({
    sessions: [{
      id: 'session-1',
      date: '2026-11-10',
      minutes: 25,
      reflection: {
        completed: 'a'.repeat(501),
        nextStep: '',
        createdAt: '2026-11-10T12:00:00.000Z',
      },
    }],
  })), /backup válido/);
});

test('legacy backups without new fields remain restorable', () => {
  const context = createAppContext();
  const legacyBackup = makeBackup();
  legacyBackup.version = 2;
  const restored = validate(context, legacyBackup);
  assert.deepEqual(restored.studyTasks, []);
  assert.deepEqual(restored.flashcards, []);
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
