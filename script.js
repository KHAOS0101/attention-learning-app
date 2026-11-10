const STORAGE_KEY = 'attention-learning-prototype-v1';

const initialState = {
  profile: null,
  sessions: [],
  goals: { study: false, review: false, pause: false },
  customGoals: [],
  goalsDate: todayKey(),
  dailyLogs: {},
  journalEntries: [],
  joinedGroups: [],
  pomodoro: { focusMinutes: 25, breakMinutes: 5 },
  reminders: { enabled: false, intervalMinutes: 60, nextReminderAt: null },
  studyTasks: [],
  goalHistory: {},
  preferences: { theme: 'system', textSize: 'normal', onboardingComplete: false },
  flashcards: [],
};

const defaultGoalLabels = {
  study: { title: 'Fazer uma sessão de foco', detail: 'Comece com 25 minutos' },
  review: { title: 'Revisar um conteúdo', detail: 'Use flashcards ou repetição espaçada' },
  pause: { title: 'Fazer uma pausa ativa', detail: 'Alongue-se entre os blocos' },
};

const studyGroups = [
  { id: 'bioquimica', name: 'Grupo de Bioquímica', subject: 'Biologia', members: 12, nextMeeting: 'Hoje, 18h', description: 'Revisão colaborativa de metabolismo, células e fundamentos de bioquímica.' },
  { id: 'calculo', name: 'Sprint de Matemática', subject: 'Cálculo', members: 8, nextMeeting: 'Amanhã, 16h', description: 'Resolução de exercícios em blocos curtos com espaço para tirar dúvidas.' },
  { id: 'historia', name: 'Estudos em Dupla', subject: 'História', members: 6, nextMeeting: 'Quinta, 19h', description: 'Leitura guiada e conversa sobre os principais temas da semana.' },
  { id: 'redacao', name: 'Oficina de Redação', subject: 'Linguagens', members: 10, nextMeeting: 'Sexta, 17h', description: 'Pratique estrutura, repertório e revisão de textos com colegas.' },
  { id: 'programacao', name: 'Código em Foco', subject: 'Tecnologia', members: 9, nextMeeting: 'Sábado, 10h', description: 'Sessões de estudo compartilhado para lógica e desenvolvimento.' },
  { id: 'idiomas', name: 'Clube de Conversação', subject: 'Idiomas', members: 7, nextMeeting: 'Quarta, 18h', description: 'Pratique conversação e vocabulário em um ambiente acolhedor.' },
];

const moodOptions = [
  '😊 Feliz', '🤩 Animado', '💪 Motivado', '😌 Tranquilo', '🙏 Grato', '😎 Confiante',
  '🙂 Bem', '😐 Neutro', '😴 Cansado', '😟 Ansioso', '😣 Estressado', '😢 Triste',
  '😤 Frustrado', '✨ Ótimo',
];

function readState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return JSON.parse(JSON.stringify(initialState));

  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Os dados salvos do protótipo estão inválidos. Limpe os dados do site para continuar.');
  }

  const savedGoals = { ...initialState.goals, ...(parsed.goals || {}) };
  const customGoals = Array.isArray(parsed.customGoals)
    ? parsed.customGoals.filter((goal) => goal && typeof goal.id === 'string' && typeof goal.title === 'string')
      .map((goal) => ({ id: goal.id, title: goal.title, completed: Boolean(goal.completed) }))
    : [];
  const goalsDate = parsed.goalsDate || todayKey();
  const goalHistory = parsed.goalHistory && typeof parsed.goalHistory === 'object' && !Array.isArray(parsed.goalHistory)
    ? Object.fromEntries(Object.entries(parsed.goalHistory).slice(0, 10000).filter(([date, summary]) => (
      isValidDateKey(date) && summary && Number.isInteger(summary.completed) && summary.completed >= 0
      && Number.isInteger(summary.total) && summary.total >= summary.completed && summary.total <= 503
    )))
    : {};
  if (goalsDate !== todayKey()) {
    if (isValidDateKey(goalsDate)) {
      const total = Object.keys(savedGoals).length + customGoals.length;
      goalHistory[goalsDate] = {
        completed: Object.values(savedGoals).filter(Boolean).length + customGoals.filter((goal) => goal.completed).length,
        total,
      };
    }
    Object.keys(savedGoals).forEach((id) => { savedGoals[id] = false; });
    customGoals.forEach((goal) => { goal.completed = false; });
  }
  const savedPomodoro = parsed.pomodoro || {};
  const pomodoro = {
    focusMinutes: Number.isInteger(savedPomodoro.focusMinutes) && savedPomodoro.focusMinutes >= 5 && savedPomodoro.focusMinutes <= 90
      ? savedPomodoro.focusMinutes : initialState.pomodoro.focusMinutes,
    breakMinutes: Number.isInteger(savedPomodoro.breakMinutes) && savedPomodoro.breakMinutes >= 1 && savedPomodoro.breakMinutes <= 30
      ? savedPomodoro.breakMinutes : initialState.pomodoro.breakMinutes,
  };
  const savedReminders = parsed.reminders || {};
  const reminders = {
    enabled: savedReminders.enabled === true,
    intervalMinutes: [30, 45, 60, 90].includes(savedReminders.intervalMinutes)
      ? savedReminders.intervalMinutes : initialState.reminders.intervalMinutes,
    nextReminderAt: typeof savedReminders.nextReminderAt === 'string'
      && !Number.isNaN(Date.parse(savedReminders.nextReminderAt))
      ? savedReminders.nextReminderAt : null,
  };
  const studyTasks = Array.isArray(parsed.studyTasks)
    ? parsed.studyTasks.filter((task) => task && typeof task.id === 'string'
      && task.id.length <= 100 && typeof task.title === 'string'
      && task.title.trim().length > 0 && task.title.length <= 120
      && isValidDateKey(task.date) && (task.time === '' || task.time === null
        || (typeof task.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(task.time)))
      && Number.isInteger(task.minutes) && task.minutes >= 5 && task.minutes <= 360
      && [undefined, 'study', 'exam', 'assignment'].includes(task.type))
      .map((task) => ({
        id: task.id,
        title: task.title,
        type: task.type || 'study',
        date: task.date,
        time: task.time || '',
        minutes: task.minutes,
        completed: Boolean(task.completed),
      }))
      .slice(0, 500)
    : [];
  const savedPreferences = parsed.preferences || {};
  const preferences = {
    theme: ['system', 'light', 'dark', 'contrast'].includes(savedPreferences.theme) ? savedPreferences.theme : 'system',
    textSize: ['normal', 'large', 'larger'].includes(savedPreferences.textSize) ? savedPreferences.textSize : 'normal',
    onboardingComplete: savedPreferences.onboardingComplete === true,
  };
  const flashcards = Array.isArray(parsed.flashcards)
    ? parsed.flashcards.filter((card) => card && typeof card.id === 'string' && card.id.length <= 100
      && typeof card.front === 'string' && card.front.trim().length > 0 && card.front.length <= 500
      && typeof card.back === 'string' && card.back.trim().length > 0 && card.back.length <= 1000
      && isValidDateKey(card.dueDate) && isValidDateKey(card.createdAt)
      && Number.isInteger(card.intervalDays) && card.intervalDays >= 0 && card.intervalDays <= 3650
      && Number.isInteger(card.repetitions) && card.repetitions >= 0 && card.repetitions <= 1000
      && (card.lastReviewed === null || isValidDateKey(card.lastReviewed)))
      .map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        dueDate: card.dueDate,
        createdAt: card.createdAt,
        intervalDays: card.intervalDays,
        repetitions: card.repetitions,
        lastReviewed: card.lastReviewed,
      }))
      .slice(0, 1000)
    : [];

  return {
    ...JSON.parse(JSON.stringify(initialState)),
    ...parsed,
    goals: savedGoals,
    customGoals,
    goalsDate: todayKey(),
    dailyLogs: parsed.dailyLogs || {},
    journalEntries: Array.isArray(parsed.journalEntries)
      ? parsed.journalEntries.filter((entry) => entry && typeof entry.id === 'string' && typeof entry.text === 'string' && typeof entry.createdAt === 'string')
      : [],
    sessions: Array.isArray(parsed.sessions)
      ? parsed.sessions.filter((session) => session && isValidDateKey(session.date)
        && Number.isInteger(session.minutes) && session.minutes >= 1 && session.minutes <= 1440)
        .map((session) => ({
          ...(typeof session.id === 'string' && session.id.length <= 100 ? { id: session.id } : {}),
          date: session.date,
          minutes: session.minutes,
          reflection: session.reflection && typeof session.reflection === 'object'
            && typeof session.reflection.completed === 'string' && session.reflection.completed.length <= 500
            && typeof session.reflection.nextStep === 'string' && session.reflection.nextStep.length <= 300
            && typeof session.reflection.createdAt === 'string'
            && !Number.isNaN(Date.parse(session.reflection.createdAt))
            ? {
              completed: session.reflection.completed,
              nextStep: session.reflection.nextStep,
              createdAt: session.reflection.createdAt,
            }
            : null,
        }))
      : [],
    joinedGroups: Array.isArray(parsed.joinedGroups) ? parsed.joinedGroups : [],
    pomodoro,
    reminders,
    studyTasks,
    goalHistory,
    preferences,
    flashcards,
  };
}

let state;
try {
  state = readState();
} catch (error) {
  state = JSON.parse(JSON.stringify(initialState));
  window.addEventListener('DOMContentLoaded', () => showStorageError(error.message));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Não foi possível salvar os dados locais.', error);
    showStorageError('Não foi possível salvar neste navegador. Verifique o espaço disponível e as permissões de armazenamento.');
    return false;
  }
}

function showStorageError(message) {
  const notice = document.getElementById('storageError');
  if (notice) {
    notice.hidden = false;
    notice.textContent = message;
  } else {
    console.error(message);
  }
}

function todayKey() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function isValidDateKey(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

function todaySessions() {
  return state.sessions.filter((session) => session.date === todayKey());
}

function renderLanding() {
  const features = [
    { emoji: '⏱️', title: 'Pomodoro', text: 'Estruture blocos de foco com pausas estratégicas para manter uma rotina sustentável.' },
    { emoji: '💜', title: 'Autoconhecimento', text: 'Registre humor, sono e foco para perceber como seus hábitos se relacionam com a experiência de estudar.' },
    { emoji: '🧠', title: 'Memória', text: 'Explore técnicas de revisão e exercícios para fortalecer a retenção de conteúdo.' },
    { emoji: '🤝', title: 'Conexão e apoio', text: 'Encontre grupos de estudo e fortaleça o senso de pertencimento na vida universitária.' },
  ];
  const metrics = [
    { label: 'Pomodoro', value: 'No seu ritmo' },
    { label: 'Check-in', value: 'Quando quiser' },
    { label: 'Tendências', value: 'Seus registros' },
    { label: 'Privacidade', value: 'Dados locais' },
  ];
  const exercises = [
    { title: 'Mapa mental', difficulty: 'Intermediário', description: 'Conecte ideias e conceitos para facilitar a memorização visual.' },
    { title: 'Repetição espaçada', difficulty: 'Fácil', description: 'Revise conteúdos em intervalos estratégicos para consolidar o aprendizado.' },
    { title: 'Flashcards', difficulty: 'Fácil', description: 'Teste a memória ativa com perguntas rápidas e respostas curtas.' },
  ];
  const progress = [
    { label: 'Perceba seus hábitos', detail: 'Registre sono, humor e foco se isso fizer sentido para você.' },
    { label: 'Defina suas metas', detail: 'Escolha pequenos passos que respeitem sua rotina.' },
    { label: 'Faça pausas', detail: 'Ajuste os blocos de estudo ao jeito que funciona para você.' },
    { label: 'Peça apoio', detail: 'Explore grupos de estudo e recursos confiáveis quando precisar.' },
  ];

  renderCards('featureGrid', features, (item) => `
    <article class="feature-card"><div class="feature-emoji">${item.emoji}</div><h3>${item.title}</h3><p>${item.text}</p></article>
  `);
  renderCards('heroMetrics', metrics, (item) => `
    <div class="metric-item"><span class="metric-label">${item.label}</span><strong>${item.value}</strong></div>
  `);
  renderCards('daySummary', metrics, (item) => `
    <div class="mini-metric"><span class="mini-metric-label">${item.label}</span><strong>${item.value}</strong></div>
  `);
  renderCards('memoryExercises', exercises, (item) => `
    <article class="exercise-card"><div class="tag">${item.difficulty}</div><h4>${item.title}</h4><p>${item.description}</p></article>
  `);
  renderCards('studyGroups', studyGroups.slice(0, 3), (item) => `
    <article class="group-card"><div class="tag">${item.subject}</div><h4>${item.name}</h4><p>Grupo demonstrativo</p></article>
  `);
  renderCards('progressBoard', progress, (item) => `
    <article class="progress-card"><h4>${item.label}</h4><p>${item.detail}</p></article>
  `);

  const name = document.getElementById('studentName');
  const campus = document.getElementById('studentCampus');
  if (name) name.textContent = state.profile?.name || 'Aprendizagem';
  if (campus) campus.textContent = state.profile?.campus || 'Um passo de cada vez';
}

function renderCards(id, items, renderItem) {
  const container = document.getElementById(id);
  if (container) container.innerHTML = items.map(renderItem).join('');
}

function setupSignup() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  if (state.profile) {
    form.elements.name.value = state.profile.name || '';
    form.elements.email.value = state.profile.email || '';
    form.elements.campus.value = state.profile.campus || '';
    form.elements.course.value = state.profile.course || '';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    state.profile = {
      name: String(formData.get('name')).trim(),
      email: String(formData.get('email')).trim(),
      campus: String(formData.get('campus')).trim(),
      course: String(formData.get('course') || '').trim(),
    };
    if (!saveState()) return;

    const message = document.getElementById('signupMessage');
    message.textContent = 'Perfil salvo. Abrindo seu dashboard…';
    window.setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 700);
  });
}

function setupDashboard() {
  if (document.body.dataset.page !== 'dashboard') return;

  const profile = state.profile || { name: 'estudante', campus: 'Seu espaço de aprendizagem' };
  document.getElementById('dashboardName').textContent = profile.name.split(/\s+/)[0];
  document.getElementById('dashboardCampus').textContent = [profile.course, profile.campus].filter(Boolean).join(' · ') || 'Um passo de cada vez já é progresso.';
  document.getElementById('todayLabel').textContent = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());
  document.querySelectorAll('[data-current-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  const todayLog = state.dailyLogs[todayKey()];
  if (todayLog) {
    document.getElementById('sleepHours').value = todayLog.sleepHours;
    document.getElementById('mood').value = todayLog.mood;
    document.getElementById('focusScore').value = todayLog.focusScore;
    document.getElementById('focusOutput').value = todayLog.focusScore;
  }
  document.querySelectorAll('[data-goal]').forEach((input) => {
    input.checked = Boolean(state.goals[input.dataset.goal]);
    input.addEventListener('change', () => {
      state.goals[input.dataset.goal] = input.checked;
      saveTodayGoalProgress();
      refreshDashboardStats();
      setupWeeklyTrends();
    });
  });
  renderCustomGoals();
  document.getElementById('customGoalForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('customGoalInput');
    const title = input.value.trim();
    const message = document.getElementById('customGoalMessage');
    if (!title) {
      message.textContent = 'Digite uma meta antes de adicionar.';
      input.focus();
      return;
    }

    state.customGoals.push({
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      completed: false,
    });
    if (!saveTodayGoalProgress()) return;
    input.value = '';
    message.textContent = 'Meta adicionada à sua lista de hoje.';
    renderCustomGoals();
    refreshDashboardStats();
    setupWeeklyTrends();
    input.focus();
  });
  document.getElementById('customGoalList').addEventListener('change', (event) => {
    const input = event.target.closest('[data-custom-goal]');
    if (!input) return;
    const goal = state.customGoals.find((item) => item.id === input.dataset.customGoal);
    if (!goal) return;
    goal.completed = input.checked;
    saveTodayGoalProgress();
    refreshDashboardStats();
    setupWeeklyTrends();
  });
  document.getElementById('customGoalList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-goal]');
    if (!button) return;
    state.customGoals = state.customGoals.filter((goal) => goal.id !== button.dataset.removeGoal);
    if (!saveTodayGoalProgress()) return;
    renderCustomGoals();
    refreshDashboardStats();
    setupWeeklyTrends();
  });

  document.getElementById('focusScore').addEventListener('input', (event) => {
    document.getElementById('focusOutput').value = event.target.value;
  });

  document.getElementById('diaryForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    state.dailyLogs[todayKey()] = {
      sleepHours: Number(formData.get('sleepHours')),
      mood: String(formData.get('mood')),
      focusScore: Number(formData.get('focusScore')),
    };
    if (!saveState()) return;
    document.getElementById('diaryMessage').textContent = 'Registro salvo neste navegador.';
    setupWeeklyTrends();
    refreshDashboardStats();
  });

  setupJournal();
  setupPrivacyControls();
  setupWeeklyTrends();
  setupStudyPlanner();
  setupFlashcards();
  setupSessionReflections();
  setupGuidedBreaks();
  setupWeeklyReview();
  setupPreferences();
  setupOnboarding();
  setupResourceSearch();
  setupReminders();
  setupTimer();
  if (!state.goalHistory[todayKey()]) saveTodayGoalProgress();
  setupWeeklyTrends();
  refreshDashboardStats();
}

function saveTodayGoalProgress() {
  const date = todayKey();
  const total = Object.keys(state.goals).length + state.customGoals.length;
  state.goalHistory[date] = {
    completed: Object.values(state.goals).filter(Boolean).length
      + state.customGoals.filter((goal) => goal.completed).length,
    total,
  };
  state.goalsDate = date;
  return saveState();
}

function setupStudyPlanner() {
  const form = document.getElementById('plannerTaskForm');
  if (!form) return;

  const weekContainer = document.getElementById('plannerWeek');
  const taskContainer = document.getElementById('plannerTasks');
  const dateInput = document.getElementById('plannerTaskDate');
  let selectedDate = todayKey();
  let weekStart = startOfWeek(new Date());

  function renderPlanner() {
    weekContainer.replaceChildren();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const formatWeekDate = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' });
    document.getElementById('plannerWeekLabel').textContent = `${formatWeekDate.format(weekStart)} – ${formatWeekDate.format(weekEnd)}`;

    for (let offset = 0; offset < 7; offset += 1) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + offset);
      const key = dateKey(date);
      const tasksForDate = state.studyTasks.filter((task) => task.date === key);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'planner-day-button';
      button.classList.toggle('is-selected', key === selectedDate);
      button.setAttribute('aria-pressed', String(key === selectedDate));
      button.dataset.plannerDate = key;
      const weekday = document.createElement('span');
      weekday.textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date);
      const dayNumber = document.createElement('strong');
      dayNumber.textContent = String(date.getDate());
      const count = document.createElement('span');
      count.textContent = `${tasksForDate.filter((task) => task.completed).length}/${tasksForDate.length} tarefas`;
      button.append(weekday, dayNumber, count);
      weekContainer.append(button);
    }

    const selected = new Date(`${selectedDate}T12:00:00`);
    document.getElementById('plannerDayTitle').textContent = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long',
    }).format(selected);
    dateInput.value = selectedDate;
    taskContainer.replaceChildren();
    const tasks = state.studyTasks.filter((task) => task.date === selectedDate)
      .sort((first, second) => (first.time || '99:99').localeCompare(second.time || '99:99'));
    document.getElementById('plannerEmpty').hidden = tasks.length > 0;
    tasks.forEach((task) => {
      const item = document.createElement('article');
      item.className = 'planner-task';
      const taskType = document.createElement('span');
      taskType.className = `planner-task-type planner-task-type-${task.type || 'study'}`;
      taskType.textContent = {
        study: 'Estudo',
        assignment: 'Etapa de trabalho',
        exam: 'Prova ou entrega',
      }[task.type || 'study'];
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.dataset.plannerTask = task.id;
      checkbox.setAttribute('aria-label', `Marcar como concluída: ${task.title}`);
      const title = document.createElement('strong');
      title.textContent = task.title;
      title.classList.toggle('is-complete', task.completed);
      label.append(checkbox, title);
      const detail = document.createElement('span');
      detail.textContent = `${task.time ? `${task.time} · ` : ''}${task.minutes} min`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-goal-button';
      remove.dataset.removePlannerTask = task.id;
      remove.setAttribute('aria-label', `Apagar tarefa: ${task.title}`);
      remove.textContent = 'Apagar';
      item.append(taskType, label, detail, remove);
      taskContainer.append(item);
    });
  }

  weekContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-planner-date]');
    if (!button) return;
    selectedDate = button.dataset.plannerDate;
    renderPlanner();
  });
  document.getElementById('plannerPreviousWeek').addEventListener('click', () => {
    weekStart.setDate(weekStart.getDate() - 7);
    selectedDate = dateKey(weekStart);
    renderPlanner();
  });
  document.getElementById('plannerNextWeek').addEventListener('click', () => {
    weekStart.setDate(weekStart.getDate() + 7);
    selectedDate = dateKey(weekStart);
    renderPlanner();
  });
  document.getElementById('plannerCurrentWeek').addEventListener('click', () => {
    weekStart = startOfWeek(new Date());
    selectedDate = todayKey();
    renderPlanner();
  });
  dateInput.value = selectedDate;
  dateInput.addEventListener('change', () => {
    if (!isValidDateKey(dateInput.value)) return;
    selectedDate = dateInput.value;
    weekStart = startOfWeek(new Date(`${selectedDate}T12:00:00`));
    renderPlanner();
  });
  taskContainer.addEventListener('change', (event) => {
    const checkbox = event.target.closest('[data-planner-task]');
    if (!checkbox) return;
    const task = state.studyTasks.find((item) => item.id === checkbox.dataset.plannerTask);
    if (!task) return;
    task.completed = checkbox.checked;
    if (!saveState()) return;
    renderPlanner();
    setupWeeklyTrends();
    renderWeeklyReview();
  });
  taskContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-planner-task]');
    if (!button) return;
    state.studyTasks = state.studyTasks.filter((task) => task.id !== button.dataset.removePlannerTask);
    if (!saveState()) return;
    renderPlanner();
    setupWeeklyTrends();
    renderWeeklyReview();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const title = String(formData.get('title') || '').trim();
    const date = String(formData.get('date') || '');
    const time = String(formData.get('time') || '');
    const minutes = Number(formData.get('minutes'));
    const message = document.getElementById('plannerMessage');
    if (!title || title.length > 120 || !isValidDateKey(date)
      || (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
      || !Number.isInteger(minutes) || minutes < 5 || minutes > 360) {
      message.textContent = 'Confira a tarefa, o dia e a duração antes de salvar.';
      return;
    }
    if (state.studyTasks.length >= 500) {
      message.textContent = 'Você atingiu o limite de 500 tarefas salvas. Apague algumas para adicionar outras.';
      return;
    }
    state.studyTasks.push({
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      type: ['study', 'exam', 'assignment'].includes(formData.get('type'))
        ? String(formData.get('type'))
        : 'study',
      date,
      time,
      minutes,
      completed: false,
    });
    if (!saveState()) return;
    selectedDate = date;
    weekStart = startOfWeek(new Date(`${date}T12:00:00`));
    form.reset();
    document.getElementById('plannerTaskMinutes').value = '25';
    message.textContent = 'Passo adicionado ao seu planejamento.';
    renderPlanner();
    setupWeeklyTrends();
    renderWeeklyReview();
    document.getElementById('plannerTaskTitle').focus();
  });
  renderPlanner();
}

function scheduleFlashcard(card, rating, reviewedAt = todayKey()) {
  const date = new Date(`${reviewedAt}T12:00:00`);
  if (rating === 'again') {
    card.repetitions = 0;
    card.intervalDays = 1;
  } else {
    card.repetitions = Math.min(1000, card.repetitions + 1);
    const intervals = [1, 3, 7, 14, 30, 60, 90];
    if (rating === 'easy') {
      card.intervalDays = Math.min(3650, Math.max(4, Math.ceil(Math.max(1, card.intervalDays) * 1.5)));
    } else {
      card.intervalDays = intervals[Math.min(card.repetitions - 1, intervals.length - 1)];
    }
  }
  date.setDate(date.getDate() + card.intervalDays);
  card.dueDate = dateKey(date);
  card.lastReviewed = reviewedAt;
  return card;
}

function setupFlashcards() {
  const form = document.getElementById('flashcardForm');
  if (!form) return;
  const review = document.getElementById('flashcardReview');
  const question = document.getElementById('flashcardQuestion');
  const answer = document.getElementById('flashcardAnswer');
  const ratings = document.getElementById('flashcardRatings');
  const list = document.getElementById('flashcardList');
  let currentCardId = null;
  let revealed = false;

  function render() {
    const dueCards = state.flashcards.filter((card) => card.dueDate <= todayKey())
      .sort((first, second) => first.dueDate.localeCompare(second.dueDate)
        || first.createdAt.localeCompare(second.createdAt));
    document.getElementById('flashcardDueCount').textContent = `${dueCards.length} para revisar`;
    currentCardId = dueCards[0]?.id || null;
    review.hidden = !currentCardId;
    document.getElementById('flashcardEmpty').hidden = Boolean(currentCardId);
    revealed = false;
    answer.hidden = true;
    ratings.hidden = true;
    document.getElementById('revealFlashcard').hidden = !currentCardId;
    const currentCard = dueCards[0];
    question.textContent = currentCard?.front || '';
    answer.textContent = currentCard?.back || '';

    list.replaceChildren();
    if (state.flashcards.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Seus cartões aparecerão aqui.';
      list.append(empty);
      return;
    }
    state.flashcards.slice().sort((first, second) => first.dueDate.localeCompare(second.dueDate))
      .forEach((card) => {
        const item = document.createElement('article');
        item.className = 'flashcard-list-item';
        const text = document.createElement('p');
        text.textContent = card.front;
        const due = document.createElement('span');
        due.textContent = `Revisão: ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${card.dueDate}T12:00:00`))}`;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove-goal-button';
        remove.dataset.removeFlashcard = card.id;
        remove.setAttribute('aria-label', `Apagar flashcard: ${card.front}`);
        remove.textContent = 'Apagar';
        item.append(text, due, remove);
        list.append(item);
      });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const front = String(formData.get('front') || '').trim();
    const back = String(formData.get('back') || '').trim();
    const message = document.getElementById('flashcardMessage');
    if (!front || front.length > 500 || !back || back.length > 1000) {
      message.textContent = 'Preencha a pergunta e a resposta antes de salvar.';
      return;
    }
    if (state.flashcards.length >= 1000) {
      message.textContent = 'Você atingiu o limite de 1000 cartões. Apague alguns para criar novos.';
      return;
    }
    state.flashcards.push({
      id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      front,
      back,
      dueDate: todayKey(),
      createdAt: todayKey(),
      intervalDays: 0,
      repetitions: 0,
      lastReviewed: null,
    });
    if (!saveState()) return;
    form.reset();
    message.textContent = 'Cartão criado e pronto para revisar.';
    render();
    question.focus();
  });

  document.getElementById('revealFlashcard').addEventListener('click', () => {
    if (!currentCardId) return;
    revealed = true;
    answer.hidden = false;
    ratings.hidden = false;
    document.getElementById('revealFlashcard').hidden = true;
  });
  ratings.addEventListener('click', (event) => {
    const button = event.target.closest('[data-flashcard-rating]');
    if (!button || !revealed) return;
    const card = state.flashcards.find((item) => item.id === currentCardId);
    if (!card) return;
    scheduleFlashcard(card, button.dataset.flashcardRating);
    if (!saveState()) return;
    document.getElementById('flashcardMessage').textContent = 'Próxima revisão ajustada ao que você lembrou.';
    render();
    renderWeeklyReview();
  });
  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-flashcard]');
    if (!button) return;
    state.flashcards = state.flashcards.filter((card) => card.id !== button.dataset.removeFlashcard);
    if (!saveState()) return;
    render();
  });
  render();
}

function setupSessionReflections() {
  const form = document.getElementById('reflectionForm');
  if (!form) return;
  const select = document.getElementById('reflectionSession');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const session = state.sessions.find((item) => item.id === select.value && !item.reflection);
    if (!session) {
      renderSessionReflections();
      return;
    }
    const completed = document.getElementById('reflectionDone').value.trim();
    const nextStep = document.getElementById('reflectionNext').value.trim();
    if (completed.length > 500 || nextStep.length > 300) return;
    if (!completed && !nextStep) {
      document.getElementById('reflectionMessage').textContent = 'Escreva algo ou deixe a reflexão para depois.';
      return;
    }
    session.reflection = {
      completed,
      nextStep,
      createdAt: new Date().toISOString(),
    };
    if (!saveState()) return;
    form.reset();
    document.getElementById('reflectionMessage').textContent = 'Reflexão salva neste dispositivo.';
    renderSessionReflections();
  });
  renderSessionReflections();
}

function renderSessionReflections() {
  const form = document.getElementById('reflectionForm');
  const select = document.getElementById('reflectionSession');
  if (!form || !select) return;
  const sessions = state.sessions.filter((session) => session.id && !session.reflection)
    .slice(-20).reverse();
  select.replaceChildren();
  sessions.forEach((session) => {
    const option = document.createElement('option');
    option.value = session.id;
    option.textContent = `${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${session.date}T12:00:00`))} · ${session.minutes} min`;
    select.append(option);
  });
  select.disabled = sessions.length === 0;
  form.querySelector('button[type="submit"]').disabled = sessions.length === 0;
  document.getElementById('reflectionMessage').textContent = sessions.length
    ? 'A reflexão é opcional; deixe em branco o que não quiser registrar.'
    : 'Quando uma sessão de foco terminar, ela aparecerá aqui para você refletir se desejar.';
}

function setupGuidedBreaks() {
  const type = document.getElementById('guidedBreakType');
  if (!type) return;
  const instructions = {
    breathing: {
      duration: 60,
      description: 'Sente-se como for confortável. Respire no seu ritmo, sem prender o ar; se não for bom para você, escolha outra pausa.',
      phases: ['Inspire com suavidade, se for confortável.', 'Expire devagar, sem forçar.'],
    },
    stretch: {
      duration: 45,
      description: 'Se for confortável, movimente os ombros e braços suavemente. Sem forçar o pescoço ou qualquer movimento; pare se sentir desconforto.',
      phases: [],
    },
    eyes: {
      duration: 20,
      description: 'Se puder, desvie o olhar da tela e observe algo distante. Você também pode simplesmente fechar os olhos ou descansar.',
      phases: [],
    },
  };
  let intervalId = null;
  let remaining = 60;

  function setInstructions() {
    const activity = instructions[type.value] || instructions.breathing;
    remaining = activity.duration;
    document.getElementById('guidedBreakTimer').textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
    document.getElementById('guidedBreakInstruction').textContent = activity.description;
    document.getElementById('guidedBreakStart').disabled = Boolean(intervalId);
    document.getElementById('guidedBreakStop').disabled = !intervalId;
  }

  type.addEventListener('change', () => {
    if (!intervalId) setInstructions();
  });
  document.getElementById('guidedBreakStart').addEventListener('click', () => {
    if (intervalId) return;
    const activity = instructions[type.value] || instructions.breathing;
    remaining = activity.duration;
    const status = document.getElementById('guidedBreakStatus');
    const tick = () => {
      remaining -= 1;
      document.getElementById('guidedBreakTimer').textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
      if (type.value === 'breathing') {
        const phase = (activity.duration - remaining) % 10;
        document.getElementById('guidedBreakInstruction').textContent = phase < 4
          ? activity.phases[0]
          : activity.phases[1];
      }
      if (remaining <= 0) {
        window.clearInterval(intervalId);
        intervalId = null;
        status.textContent = 'Pausa concluída. Continue no seu ritmo ou volte quando quiser.';
        document.getElementById('guidedBreakStart').disabled = false;
        document.getElementById('guidedBreakStop').disabled = true;
      }
    };
    document.getElementById('guidedBreakStart').disabled = true;
    document.getElementById('guidedBreakStop').disabled = false;
    status.textContent = 'Pausa iniciada. Você pode parar a qualquer momento.';
    intervalId = window.setInterval(tick, 1000);
  });
  document.getElementById('guidedBreakStop').addEventListener('click', () => {
    window.clearInterval(intervalId);
    intervalId = null;
    document.getElementById('guidedBreakStatus').textContent = 'Pausa interrompida. Está tudo bem parar ou escolher outra atividade.';
    setInstructions();
  });
  setInstructions();
}

function setupWeeklyReview() {
  renderWeeklyReview();
}

function renderWeeklyReview(today = new Date()) {
  const container = document.getElementById('weeklyReviewSummary');
  if (!container) return;
  container.replaceChildren();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - index));
    return { date, key: dateKey(date) };
  });
  const start = days[0].date;
  const end = days[6].date;
  const dateFormat = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });
  document.getElementById('weeklyReviewRange').textContent = `${dateFormat.format(start)} – ${dateFormat.format(end)}`;
  const keys = new Set(days.map((day) => day.key));
  const sessions = state.sessions.filter((session) => keys.has(session.date));
  const plannedTasks = state.studyTasks.filter((task) => keys.has(task.date));
  const completedTasks = plannedTasks.filter((task) => task.completed).length;
  const loggedDays = days.filter(({ key }) => state.dailyLogs[key]).length;
  const metrics = [
    { title: 'Sessões de foco', value: sessions.length ? String(sessions.length) : 'Sem registros' },
    { title: 'Minutos em foco', value: sessions.length ? `${sessions.reduce((sum, session) => sum + session.minutes, 0)} min` : 'Sem registros' },
    { title: 'Check-ins registrados', value: loggedDays ? `${loggedDays} de 7 dias` : 'Sem registros' },
    { title: 'Tarefas planejadas', value: plannedTasks.length ? `${completedTasks} de ${plannedTasks.length} concluídas` : 'Nenhuma tarefa planejada' },
    { title: 'Cartões revisados', value: state.flashcards.some((card) => card.lastReviewed && keys.has(card.lastReviewed))
      ? String(state.flashcards.filter((card) => card.lastReviewed && keys.has(card.lastReviewed)).length)
      : 'Sem revisões registradas' },
  ];
  metrics.forEach(({ title, value }) => {
    const item = document.createElement('article');
    item.className = 'weekly-review-metric';
    const label = document.createElement('h3');
    label.textContent = title;
    const number = document.createElement('p');
    number.textContent = value;
    item.append(label, number);
    container.append(item);
  });
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function startOfWeek(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function setupPreferences() {
  const form = document.getElementById('preferencesForm');
  if (!form) return;
  const theme = document.getElementById('themePreference');
  const textSize = document.getElementById('textSizePreference');
  theme.value = state.preferences.theme;
  textSize.value = state.preferences.textSize;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    state.preferences.theme = ['system', 'light', 'dark', 'contrast'].includes(theme.value) ? theme.value : 'system';
    state.preferences.textSize = ['normal', 'large', 'larger'].includes(textSize.value) ? textSize.value : 'normal';
    if (!saveState()) return;
    applyPreferences();
    document.getElementById('preferencesMessage').textContent = 'Preferências salvas neste dispositivo.';
  });
}

function applyPreferences() {
  if (!state?.preferences) return;
  const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  document.body.dataset.theme = state.preferences.theme === 'system'
    ? (systemPrefersDark ? 'dark' : 'light')
    : state.preferences.theme;
  document.documentElement.dataset.textSize = state.preferences.textSize;
}

function setupOnboarding() {
  const dialog = document.getElementById('welcomeDialog');
  if (!dialog) return;
  const finish = () => {
    state.preferences.onboardingComplete = true;
    saveState();
  };
  document.getElementById('finishWelcomeGuide').addEventListener('click', () => {
    finish();
    dialog.close();
  });
  document.getElementById('showWelcomeGuide').addEventListener('click', () => dialog.showModal());
  dialog.addEventListener('close', finish);
  if (!state.preferences.onboardingComplete) dialog.showModal();
}

function setupResourceSearch() {
  const input = document.getElementById('resourceSearch');
  const results = document.getElementById('resourceSearchResults');
  if (!input || !results) return;
  const resources = [
    { title: 'Planejamento semanal e tarefas', keywords: 'agenda calendário prazo tarefa organizar', href: '#studyPlanner' },
    { title: 'Flashcards e revisão espaçada', keywords: 'memória lembrar cartões repetição ativa', href: '#flashcards' },
    { title: 'Pomodoro e foco', keywords: 'tempo sessão pausa timer concentração', href: '#focusTools' },
    { title: 'Reflexão após o estudo', keywords: 'sessão aprender próximo passo reflexão', href: '#sessionReflection' },
    { title: 'Metas de hoje', keywords: 'meta objetivo progresso rotina', href: '#dailyGoals' },
    { title: 'Check-in de humor, sono e foco', keywords: 'emoção bem-estar diário humor sono', href: '#checkIn' },
    { title: 'Gráficos e tendências', keywords: 'histórico gráfico evolução progresso', href: '#progressTrends' },
    { title: 'Resumo semanal', keywords: 'semana resumo revisar reflexão tarefas', href: '#weeklyReview' },
    { title: 'Escrita livre e diário', keywords: 'desabafo opinião escrever diário', href: '#personalJournal' },
    { title: 'Lembretes de pausa', keywords: 'notificação descanso intervalo', href: '#breakReminders' },
    { title: 'Pausas guiadas', keywords: 'respiração alongamento olhos relaxar', href: '#guidedBreaks' },
    { title: 'Aparência e acessibilidade', keywords: 'tema escuro contraste texto leitura acessibilidade', href: '#personalization' },
    { title: 'Privacidade e backups', keywords: 'dados exportar importar apagar privacidade', href: '#privacyControls' },
    { title: 'Grupos de estudo', keywords: 'comunidade colegas grupo', href: 'comunidade.html' },
    { title: 'Apoio emocional', keywords: 'psicologia ajuda cvv emergência sus', href: 'apoio.html' },
  ];
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  input.addEventListener('input', () => {
    results.replaceChildren();
    const query = normalize(input.value.trim());
    if (!query) {
      results.hidden = true;
      return;
    }
    const matches = resources.filter((resource) => normalize(`${resource.title} ${resource.keywords}`).includes(query));
    matches.forEach((resource) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = resource.href;
      link.textContent = resource.title;
      item.append(link);
      results.append(item);
    });
    if (matches.length === 0) {
      const item = document.createElement('li');
      item.textContent = 'Nenhum recurso encontrado. Tente outra palavra.';
      results.append(item);
    }
    results.hidden = false;
  });
}

function setupPrivacyControls() {
  const exportButton = document.getElementById('exportData');
  const deleteButton = document.getElementById('deleteData');
  if (!exportButton || !deleteButton) return;

  const message = document.getElementById('privacyMessage');
  exportButton.addEventListener('click', () => {
    try {
      const exportData = {
        app: 'Attention Learning',
        version: 3,
        exportedAt: new Date().toISOString(),
        note: 'Exportação de dados armazenados localmente pelo protótipo.',
        data: state,
      };
      const file = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attention-learning-dados-${todayKey()}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      message.textContent = 'Cópia dos seus dados exportada. Guarde o arquivo em local seguro.';
    } catch (error) {
      console.error('Não foi possível exportar os dados.', error);
      message.textContent = 'Não foi possível exportar os dados. Tente novamente neste navegador.';
    }
  });

  const importButton = document.getElementById('importData');
  const importFile = document.getElementById('importDataFile');
  importButton.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async () => {
    const file = importFile.files?.[0];
    importFile.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      message.textContent = 'O arquivo excede o limite de 5 MB.';
      return;
    }

    let restoredState;
    try {
      const backup = JSON.parse(await file.text());
      restoredState = validateBackup(backup);
    } catch (error) {
      console.error('O arquivo de backup não pôde ser validado.', error);
      message.textContent = error instanceof SyntaxError
        ? 'Este arquivo não contém um JSON válido.'
        : error.message || 'Não foi possível ler este arquivo de backup.';
      return;
    }

    const confirmed = window.confirm('Restaurar este arquivo substituirá todos os dados atuais do Attention Learning neste navegador. Deseja continuar?');
    if (!confirmed) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredState));
      state = restoredState;
      window.location.reload();
    } catch (error) {
      console.error('Não foi possível restaurar o backup.', error);
      message.textContent = 'Não foi possível restaurar o backup. Verifique o espaço disponível e as permissões de armazenamento.';
    }
  });

  deleteButton.addEventListener('click', () => {
    const confirmed = window.confirm('Apagar definitivamente todos os dados do Attention Learning salvos neste navegador? Esta ação não pode ser desfeita.');
    if (!confirmed) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      state = JSON.parse(JSON.stringify(initialState));
      window.location.reload();
    } catch (error) {
      console.error('Não foi possível apagar os dados locais.', error);
      message.textContent = 'Não foi possível apagar os dados. Tente novamente ou remova os dados do site nas configurações do navegador.';
    }
  });
}

function validateBackup(backup) {
  const invalid = () => new Error('O arquivo não é um backup válido do Attention Learning ou contém dados incompatíveis.');
  const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const validDate = (value) => typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

  if (!isObject(backup) || backup.app !== 'Attention Learning'
    || ![undefined, 1, 2, 3].includes(backup.version) || !isObject(backup.data)) {
    throw invalid();
  }
  const data = backup.data;
  const requiredKeys = ['profile', 'goals', 'goalsDate', 'dailyLogs', 'sessions', 'customGoals', 'journalEntries', 'joinedGroups'];
  if (!requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(data, key))) throw invalid();
  const result = JSON.parse(JSON.stringify(initialState));

  if (data.profile !== null && data.profile !== undefined) {
    if (!isObject(data.profile)
      || !['name', 'email', 'campus', 'course'].every((field) => typeof data.profile[field] === 'string')
      || data.profile.name.length > 70 || data.profile.email.length > 120
      || data.profile.campus.length > 100 || data.profile.course.length > 100) throw invalid();
    result.profile = {
      name: data.profile.name,
      email: data.profile.email,
      campus: data.profile.campus,
      course: data.profile.course,
    };
  }

  if (data.goals !== undefined) {
    if (!isObject(data.goals) || !Object.keys(result.goals).every((key) => typeof data.goals[key] === 'boolean')) throw invalid();
    result.goals = { ...result.goals, ...data.goals };
  }
  if (data.goalsDate !== undefined) {
    if (!validDate(data.goalsDate)) throw invalid();
    result.goalsDate = data.goalsDate;
  }

  if (data.customGoals !== undefined) {
    if (!Array.isArray(data.customGoals) || data.customGoals.length > 500
      || data.customGoals.some((goal) => !isObject(goal) || typeof goal.id !== 'string'
        || !goal.id || goal.id.length > 100 || typeof goal.title !== 'string'
        || !goal.title.trim() || goal.title.length > 100 || typeof goal.completed !== 'boolean')) throw invalid();
    result.customGoals = data.customGoals.map(({ id, title, completed }) => ({ id, title, completed }));
  }

  if (data.sessions !== undefined) {
    if (!Array.isArray(data.sessions) || data.sessions.length > 10000
      || data.sessions.some((session) => !isObject(session) || !validDate(session.date)
        || !Number.isInteger(session.minutes) || session.minutes < 1 || session.minutes > 1440
        || (session.id !== undefined && (typeof session.id !== 'string' || !session.id || session.id.length > 100))
        || (session.reflection !== undefined && session.reflection !== null
          && (!isObject(session.reflection)
            || typeof session.reflection.completed !== 'string' || session.reflection.completed.length > 500
            || typeof session.reflection.nextStep !== 'string' || session.reflection.nextStep.length > 300
            || typeof session.reflection.createdAt !== 'string'
            || Number.isNaN(Date.parse(session.reflection.createdAt)))))) throw invalid();
    result.sessions = data.sessions.map((session) => ({
      ...(session.id ? { id: session.id } : {}),
      date: session.date,
      minutes: session.minutes,
      reflection: session.reflection ? {
        completed: session.reflection.completed,
        nextStep: session.reflection.nextStep,
        createdAt: session.reflection.createdAt,
      } : null,
    }));
  }

  if (data.dailyLogs !== undefined) {
    if (!isObject(data.dailyLogs) || Object.entries(data.dailyLogs).length > 10000) throw invalid();
    for (const [date, log] of Object.entries(data.dailyLogs)) {
      if (!validDate(date) || !isObject(log)
        || typeof log.sleepHours !== 'number' || log.sleepHours < 0 || log.sleepHours > 24
        || !moodOptions.includes(log.mood)
        || !Number.isInteger(log.focusScore) || log.focusScore < 1 || log.focusScore > 5) throw invalid();
      result.dailyLogs[date] = { sleepHours: log.sleepHours, mood: log.mood, focusScore: log.focusScore };
    }
  }

  if (data.journalEntries !== undefined) {
    if (!Array.isArray(data.journalEntries) || data.journalEntries.length > 5000
      || data.journalEntries.some((entry) => !isObject(entry) || typeof entry.id !== 'string'
        || !entry.id || entry.id.length > 100 || typeof entry.text !== 'string'
        || !entry.text.trim() || entry.text.length > 3000 || typeof entry.createdAt !== 'string'
        || Number.isNaN(Date.parse(entry.createdAt)))) throw invalid();
    result.journalEntries = data.journalEntries.map(({ id, text, createdAt }) => ({ id, text, createdAt }));
  }

  if (data.joinedGroups !== undefined) {
    const knownGroupIds = studyGroups.map((group) => group.id);
    if (!Array.isArray(data.joinedGroups) || data.joinedGroups.length > knownGroupIds.length
      || data.joinedGroups.some((id) => !knownGroupIds.includes(id))) throw invalid();
    result.joinedGroups = [...new Set(data.joinedGroups)];
  }

  if (data.pomodoro !== undefined) {
    if (!isObject(data.pomodoro)
      || !Number.isInteger(data.pomodoro.focusMinutes) || data.pomodoro.focusMinutes < 5 || data.pomodoro.focusMinutes > 90
      || !Number.isInteger(data.pomodoro.breakMinutes) || data.pomodoro.breakMinutes < 1 || data.pomodoro.breakMinutes > 30) throw invalid();
    result.pomodoro = { ...data.pomodoro };
  }

  if (data.reminders !== undefined) {
    if (!isObject(data.reminders) || typeof data.reminders.enabled !== 'boolean'
      || ![30, 45, 60, 90].includes(data.reminders.intervalMinutes)
      || (data.reminders.nextReminderAt !== null
        && (typeof data.reminders.nextReminderAt !== 'string' || Number.isNaN(Date.parse(data.reminders.nextReminderAt))))) throw invalid();
    result.reminders = {
      enabled: data.reminders.enabled,
      intervalMinutes: data.reminders.intervalMinutes,
      nextReminderAt: data.reminders.nextReminderAt,
    };
  }

  if (data.studyTasks !== undefined) {
    if (!Array.isArray(data.studyTasks) || data.studyTasks.length > 500
      || data.studyTasks.some((task) => !isObject(task) || typeof task.id !== 'string'
        || !task.id || task.id.length > 100 || typeof task.title !== 'string'
        || !task.title.trim() || task.title.length > 120 || !validDate(task.date)
        || (task.type !== undefined && !['study', 'exam', 'assignment'].includes(task.type))
        || (task.time !== '' && task.time !== null
          && (typeof task.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(task.time)))
        || !Number.isInteger(task.minutes) || task.minutes < 5 || task.minutes > 360
        || typeof task.completed !== 'boolean')) throw invalid();
    result.studyTasks = data.studyTasks.map((task) => ({
      id: task.id, title: task.title, type: task.type || 'study', date: task.date, time: task.time || '',
      minutes: task.minutes, completed: task.completed,
    }));
  }

  if (data.flashcards !== undefined) {
    if (!Array.isArray(data.flashcards) || data.flashcards.length > 1000
      || data.flashcards.some((card) => !isObject(card) || typeof card.id !== 'string'
        || !card.id || card.id.length > 100 || typeof card.front !== 'string'
        || !card.front.trim() || card.front.length > 500 || typeof card.back !== 'string'
        || !card.back.trim() || card.back.length > 1000 || !validDate(card.dueDate)
        || !validDate(card.createdAt) || !Number.isInteger(card.intervalDays)
        || card.intervalDays < 0 || card.intervalDays > 3650
        || !Number.isInteger(card.repetitions) || card.repetitions < 0 || card.repetitions > 1000
        || (card.lastReviewed !== null && !validDate(card.lastReviewed)))) throw invalid();
    result.flashcards = data.flashcards.map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      dueDate: card.dueDate,
      createdAt: card.createdAt,
      intervalDays: card.intervalDays,
      repetitions: card.repetitions,
      lastReviewed: card.lastReviewed,
    }));
  }

  if (data.goalHistory !== undefined) {
    if (!isObject(data.goalHistory) || Object.entries(data.goalHistory).length > 10000) throw invalid();
    for (const [date, summary] of Object.entries(data.goalHistory)) {
      if (!validDate(date) || !isObject(summary)
        || !Number.isInteger(summary.completed) || summary.completed < 0
        || !Number.isInteger(summary.total) || summary.total < summary.completed || summary.total > 503) throw invalid();
      result.goalHistory[date] = { completed: summary.completed, total: summary.total };
    }
  }

  if (data.preferences !== undefined) {
    if (!isObject(data.preferences)
      || !['system', 'light', 'dark', 'contrast'].includes(data.preferences.theme)
      || !['normal', 'large', 'larger'].includes(data.preferences.textSize)
      || typeof data.preferences.onboardingComplete !== 'boolean') throw invalid();
    result.preferences = {
      theme: data.preferences.theme,
      textSize: data.preferences.textSize,
      onboardingComplete: data.preferences.onboardingComplete,
    };
  }

  return result;
}

function setupWeeklyTrends() {
  const body = document.getElementById('weeklyTrend');
  if (!body) return;
  body.replaceChildren();
  let recordedDays = 0;
  const today = new Date();

  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const log = state.dailyLogs[key];
    if (log) recordedDays += 1;

    const row = document.createElement('tr');
    const dayCell = document.createElement('th');
    dayCell.scope = 'row';
    dayCell.textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
    row.append(dayCell);

    const moodCell = document.createElement('td');
    moodCell.textContent = log?.mood || '—';
    row.append(moodCell);

    const sleepCell = document.createElement('td');
    sleepCell.textContent = log ? `${log.sleepHours} h` : '—';
    if (log) {
      const sleepTrack = document.createElement('span');
      sleepTrack.className = 'trend-meter';
      sleepTrack.setAttribute('aria-hidden', 'true');
      const sleepFill = document.createElement('span');
      sleepFill.className = 'trend-meter-fill sleep-meter-fill';
      sleepFill.style.width = `${Math.min(100, (Number(log.sleepHours) / 12) * 100)}%`;
      sleepTrack.append(sleepFill);
      sleepCell.append(sleepTrack);
    }
    row.append(sleepCell);

    const focusCell = document.createElement('td');
    focusCell.textContent = log ? `${log.focusScore}/5` : '—';
    if (log) {
      const focusTrack = document.createElement('span');
      focusTrack.className = 'trend-meter';
      focusTrack.setAttribute('aria-hidden', 'true');
      const focusFill = document.createElement('span');
      focusFill.className = 'trend-meter-fill focus-meter-fill';
      focusFill.style.width = `${Math.min(100, (Number(log.focusScore) / 5) * 100)}%`;
      focusTrack.append(focusFill);
      focusCell.append(focusTrack);
    }
    row.append(focusCell);
    body.append(row);
  }
  document.getElementById('trendEmpty').hidden = recordedDays > 0;
  renderTrendCharts(today);
  renderWeeklyReview(today);
}

function renderTrendCharts(today = new Date()) {
  const days = [];
  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo);
    days.push({ date, key: dateKey(date) });
  }

  const sessionsPerDay = new Map();
  state.sessions.forEach((session) => {
    sessionsPerDay.set(session.date, (sessionsPerDay.get(session.date) || 0) + session.minutes);
  });
  const renderBars = (id, label, values, maximum, formatValue) => {
    const container = document.getElementById(id);
    if (!container) return;
    container.replaceChildren();
    container.setAttribute('role', 'list');
    container.setAttribute('aria-label', label);
    values.forEach(({ date, value }) => {
      const item = document.createElement('div');
      item.className = 'trend-chart-day';
      item.setAttribute('role', 'listitem');
      const dayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date);
      const dayNumber = String(date.getDate());
      const numericValue = value !== null && typeof value === 'object' ? value.value : value;
      const detail = value === null ? 'Sem registro'
        : (typeof value === 'object' ? value.display : formatValue(numericValue));
      item.setAttribute('aria-label', `${dayName}, ${dayNumber}: ${detail}`);
      const barTrack = document.createElement('span');
      barTrack.className = 'trend-chart-track';
      barTrack.setAttribute('aria-hidden', 'true');
      const bar = document.createElement('span');
      bar.className = 'trend-chart-bar';
      bar.style.height = value === null ? '0%' : `${Math.max(4, Math.min(100, (numericValue / maximum) * 100))}%`;
      barTrack.append(bar);
      const valueLabel = document.createElement('span');
      valueLabel.className = 'trend-chart-value';
      valueLabel.textContent = value === null ? '—' : detail;
      const dayLabel = document.createElement('span');
      dayLabel.className = 'trend-chart-label';
      dayLabel.textContent = `${dayName.replace('.', '')} ${dayNumber}`;
      item.append(barTrack, valueLabel, dayLabel);
      container.append(item);
    });
  };

  renderBars('sleepChart', 'Horas de sono registradas por dia', days.map(({ date, key }) => ({
    date, value: state.dailyLogs[key]?.sleepHours ?? null,
  })), 12, (value) => `${value} h`);
  renderBars('focusChart', 'Foco percebido registrado por dia, em escala de 1 a 5', days.map(({ date, key }) => ({
    date, value: state.dailyLogs[key]?.focusScore ?? null,
  })), 5, (value) => `${value}/5`);
  renderBars('studyChart', 'Minutos de foco registrados pelo temporizador por dia', days.map(({ date, key }) => ({
    date, value: sessionsPerDay.get(key) || 0,
  })), Math.max(60, ...days.map(({ key }) => sessionsPerDay.get(key) || 0)), (value) => `${value} min`);
  renderBars('goalChart', 'Proporção das metas concluídas em cada dia com registros', days.map(({ date, key }) => {
    const summary = state.goalHistory[key];
    if (!summary || summary.total === 0) return { date, value: null };
    return {
      date,
      value: (summary.completed / summary.total) * 100,
      display: `${summary.completed}/${summary.total} (${Math.round((summary.completed / summary.total) * 100)}%)`,
    };
  }), 100, (value) => `${Math.round(value)}%`);

  const moodContainer = document.getElementById('moodChart');
  if (!moodContainer) return;
  moodContainer.replaceChildren();
  moodContainer.setAttribute('role', 'list');
  moodContainer.setAttribute('aria-label', 'Humor registrado em cada dia, sem escala de intensidade');
  days.forEach(({ date, key }) => {
    const item = document.createElement('div');
    item.className = 'mood-chart-day';
    item.setAttribute('role', 'listitem');
    const mood = state.dailyLogs[key]?.mood || 'Sem registro';
    item.setAttribute('aria-label', `${new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric' }).format(date)}: ${mood}`);
    const moodLabel = document.createElement('span');
    moodLabel.textContent = state.dailyLogs[key]?.mood || '—';
    const dayLabel = document.createElement('span');
    dayLabel.className = 'trend-chart-label';
    dayLabel.textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric' }).format(date);
    item.append(moodLabel, dayLabel);
    moodContainer.append(item);
  });
}

function setupReminders() {
  const form = document.getElementById('remindersForm');
  if (!form) return;

  const enabledInput = document.getElementById('remindersEnabled');
  const intervalInput = document.getElementById('reminderInterval');
  const status = document.getElementById('reminderStatus');
  enabledInput.checked = state.reminders.enabled;
  intervalInput.value = String(state.reminders.intervalMinutes);

  if (state.reminders.enabled
    && (!state.reminders.nextReminderAt || Date.parse(state.reminders.nextReminderAt) <= Date.now())) {
    state.reminders.nextReminderAt = new Date(Date.now() + state.reminders.intervalMinutes * 60000).toISOString();
    saveState();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    let permission = 'unsupported';
    if (enabledInput.checked && 'Notification' in window) {
      permission = Notification.permission;
      if (permission === 'default') {
        try {
          permission = await Notification.requestPermission();
        } catch (error) {
          console.error('Não foi possível solicitar permissão para notificações.', error);
          permission = 'denied';
        }
      }
    }

    const previousReminders = state.reminders;
    const intervalMinutes = Number(intervalInput.value);
    state.reminders = {
      enabled: enabledInput.checked,
      intervalMinutes,
      nextReminderAt: enabledInput.checked
        ? new Date(Date.now() + intervalMinutes * 60000).toISOString()
        : null,
    };
    if (!saveState()) {
      state.reminders = previousReminders;
      enabledInput.checked = previousReminders.enabled;
      intervalInput.value = String(previousReminders.intervalMinutes);
      return;
    }

    if (!state.reminders.enabled) {
      status.textContent = 'Lembretes desativados.';
    } else if (permission === 'granted') {
      status.textContent = `Lembretes ativados a cada ${intervalMinutes} minutos. As notificações aparecem quando esta página estiver em segundo plano.`;
    } else {
      status.textContent = `Lembretes ativados a cada ${intervalMinutes} minutos enquanto o dashboard estiver aberto. Notificações do navegador não estão disponíveis ou foram negadas.`;
    }
  });

  window.setInterval(() => {
    const nextReminder = Date.parse(state.reminders.nextReminderAt || '');
    if (!state.reminders.enabled || !nextReminder || nextReminder > Date.now()) return;

    const previousNextReminder = state.reminders.nextReminderAt;
    state.reminders.nextReminderAt = new Date(Date.now() + state.reminders.intervalMinutes * 60000).toISOString();
    if (!saveState()) {
      state.reminders.nextReminderAt = previousNextReminder;
      status.textContent = 'Não foi possível salvar o próximo lembrete. Verifique o armazenamento do navegador.';
      return;
    }

    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      try {
        new Notification('Hora de fazer uma pausa', {
          body: 'Se puder, alongue-se, respire um pouco ou descanse os olhos.',
          icon: new URL('app-icon.svg', document.baseURI).href,
        });
        return;
      } catch (error) {
        console.error('Não foi possível mostrar uma notificação de pausa.', error);
      }
    }
    status.textContent = 'Lembrete: se puder, faça uma pausa curta e volte no seu ritmo.';
  }, 15000);
}

function setupJournal() {
  const form = document.getElementById('journalForm');
  if (!form) return;

  const textarea = document.getElementById('journalEntry');
  const characterCount = document.getElementById('journalCharCount');
  const message = document.getElementById('journalMessage');
  const entriesContainer = document.getElementById('journalEntries');

  const updateCharacterCount = () => {
    characterCount.textContent = `${textarea.value.length}/3000`;
  };
  textarea.addEventListener('input', updateCharacterCount);
  updateCharacterCount();
  renderJournalEntries();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = textarea.value.trim();
    if (!text) {
      message.textContent = 'Escreva algo antes de guardar.';
      textarea.focus();
      return;
    }

    state.journalEntries.unshift({
      id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      createdAt: new Date().toISOString(),
    });
    if (!saveState()) {
      state.journalEntries.shift();
      return;
    }

    textarea.value = '';
    updateCharacterCount();
    message.textContent = 'Registro guardado neste navegador.';
    renderJournalEntries();
  });

  entriesContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete-entry]');
    if (!button) return;
    if (!window.confirm('Apagar este registro do diário? Esta ação não pode ser desfeita.')) return;
    const previousEntries = state.journalEntries;
    state.journalEntries = previousEntries.filter((entry) => entry.id !== button.dataset.deleteEntry);
    if (saveState()) {
      renderJournalEntries();
      message.textContent = 'Registro apagado.';
    } else {
      state.journalEntries = previousEntries;
    }
  });
}

function renderJournalEntries() {
  const container = document.getElementById('journalEntries');
  if (!container) return;
  const emptyState = document.getElementById('journalEmpty');
  container.replaceChildren();
  emptyState.hidden = state.journalEntries.length > 0;

  state.journalEntries.forEach((entry) => {
    const article = document.createElement('article');
    article.className = 'journal-entry';
    const header = document.createElement('div');
    header.className = 'journal-entry-header';
    const date = document.createElement('time');
    const createdAt = new Date(entry.createdAt);
    date.dateTime = Number.isNaN(createdAt.getTime()) ? '' : createdAt.toISOString();
    date.textContent = Number.isNaN(createdAt.getTime())
      ? 'Registro anterior'
      : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(createdAt);
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'remove-goal-button';
    deleteButton.dataset.deleteEntry = entry.id;
    deleteButton.setAttribute('aria-label', `Apagar registro de ${date.textContent}`);
    deleteButton.textContent = 'Apagar';
    const text = document.createElement('p');
    text.textContent = entry.text;
    header.append(date, deleteButton);
    article.append(header, text);
    container.append(article);
  });
}

function renderCustomGoals() {
  const container = document.getElementById('customGoalList');
  if (!container) return;
  container.replaceChildren();

  state.customGoals.forEach((goal) => {
    const item = document.createElement('div');
    item.className = 'goal-item custom-goal-item';
    const label = document.createElement('label');
    label.className = 'custom-goal-label';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.customGoal = goal.id;
    checkbox.checked = goal.completed;
    const title = document.createElement('strong');
    title.textContent = goal.title;
    label.append(checkbox, title);

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-goal-button';
    removeButton.dataset.removeGoal = goal.id;
    removeButton.setAttribute('aria-label', `Remover meta: ${goal.title}`);
    removeButton.textContent = 'Remover';
    item.append(label, removeButton);
    container.append(item);
  });
}

function refreshDashboardStats() {
  const sessions = todaySessions();
  const totalMinutes = sessions.reduce((total, session) => total + session.minutes, 0);
  const defaultGoals = Object.keys(defaultGoalLabels);
  const completedGoals = defaultGoals.filter((id) => state.goals[id]).length
    + state.customGoals.filter((goal) => goal.completed).length;
  const totalGoals = defaultGoals.length + state.customGoals.length;
  const log = state.dailyLogs[todayKey()];
  document.getElementById('sessionsCount').textContent = sessions.length;
  document.getElementById('focusMinutes').textContent = `${totalMinutes} min`;
  document.getElementById('sleepSummary').textContent = log ? `${log.sleepHours}h` : '—';
  document.getElementById('goalSummary').textContent = `${completedGoals}/${totalGoals}`;
  const focusPercent = totalGoals ? Math.min(100, Math.round((completedGoals / totalGoals) * 100)) : 0;
  document.querySelectorAll('[data-goal]').forEach((input) => {
    input.checked = Boolean(state.goals[input.dataset.goal]);
  });
  renderCustomGoals();
  renderCards('progressBoard', [
    { label: 'Metas de hoje', value: `${focusPercent}%`, change: `${completedGoals} de 3 metas concluídas` },
    { label: 'Sessões de foco', value: `${sessions.length}`, change: `${totalMinutes} minutos registrados hoje` },
    { label: 'Bem-estar', value: log ? `${log.focusScore}/5` : '—', change: log ? `Humor: ${log.mood} · Sono: ${log.sleepHours}h` : 'Adicione um registro diário para acompanhar' },
  ], (item) => `
    <article class="progress-card"><h4>${item.label}</h4><div class="progress-value">${item.value}</div><div class="progress-bar"><span class="progress-track" style="width:${item.label === 'Metas de hoje' ? focusPercent : item.label === 'Sessões de foco' ? Math.min(100, sessions.length * 25) : log ? log.focusScore * 20 : 0}%"></span></div><p>${item.label === 'Metas de hoje' ? `${completedGoals} de ${totalGoals} metas concluídas` : item.change}</p></article>
  `);
}

function setupTimer() {
  const timer = document.getElementById('pomodoroTimer');
  const startButton = document.getElementById('timerStart');
  const resetButton = document.getElementById('timerReset');
  const message = document.getElementById('timerMessage');
  const modes = {
    focus: state.pomodoro.focusMinutes,
    break: state.pomodoro.breakMinutes,
  };
  let mode = 'focus';
  let secondsLeft = modes[mode] * 60;
  let intervalId = null;
  const settingsForm = document.getElementById('timerSettingsForm');
  settingsForm.elements.focusDuration.value = modes.focus;
  settingsForm.elements.breakDuration.value = modes.break;
  updatePresetLabels();

  function renderTime() {
    timer.textContent = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;
    startButton.textContent = intervalId ? 'Pausar' : mode === 'focus' ? 'Iniciar foco' : 'Iniciar pausa';
  }

  function setMode(nextMode) {
    window.clearInterval(intervalId);
    intervalId = null;
    mode = nextMode;
    secondsLeft = modes[mode] * 60;
    document.getElementById('timerModeLabel').textContent = mode === 'focus' ? 'Foco' : 'Pausa';
    document.querySelectorAll('[data-mode]').forEach((button) => button.classList.toggle('is-active', button.dataset.mode === mode));
    message.textContent = '';
    renderTime();
  }

  function updatePresetLabels() {
    document.querySelector('[data-mode="focus"]').textContent = `Foco · ${modes.focus} min`;
    document.querySelector('[data-mode="break"]').textContent = `Pausa · ${modes.break} min`;
  }

  settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (intervalId) {
      message.textContent = 'Pause o temporizador antes de alterar as durações.';
      return;
    }
    const updatedPomodoro = {
      focusMinutes: Number(settingsForm.elements.focusDuration.value),
      breakMinutes: Number(settingsForm.elements.breakDuration.value),
    };
    const previousPomodoro = state.pomodoro;
    state.pomodoro = updatedPomodoro;
    if (!saveState()) {
      state.pomodoro = previousPomodoro;
      return;
    }
    modes.focus = updatedPomodoro.focusMinutes;
    modes.break = updatedPomodoro.breakMinutes;
    secondsLeft = modes[mode] * 60;
    updatePresetLabels();
    renderTime();
    document.getElementById('timerSettingsMessage').textContent = 'Durações atualizadas e salvas neste navegador.';
  });

  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  });

  startButton.addEventListener('click', () => {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
      renderTime();
      return;
    }

    intervalId = window.setInterval(() => {
      secondsLeft -= 1;
      renderTime();
      if (secondsLeft <= 0) {
        window.clearInterval(intervalId);
        intervalId = null;
        if (mode === 'focus') {
          state.sessions.push({
            id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            date: todayKey(),
            minutes: modes.focus,
            reflection: null,
          });
          state.goals.study = true;
          saveTodayGoalProgress();
          renderSessionReflections();
          renderWeeklyReview();
          setupWeeklyTrends();
          refreshDashboardStats();
          message.textContent = 'Bloco concluído! Faça uma pausa ou inicie outro quando estiver pronto.';
        } else {
          message.textContent = 'Pausa concluída. Pronto para voltar ao foco?';
        }
        renderTime();
      }
    }, 1000);
    message.textContent = '';
    renderTime();
  });

  resetButton.addEventListener('click', () => setMode(mode));
  renderTime();
}

function setupCommunity() {
  if (document.body.dataset.page !== 'community') return;

  const search = document.getElementById('groupSearch');
  const filter = document.getElementById('subjectFilter');
  const container = document.getElementById('allStudyGroups');
  const subjects = [...new Set(studyGroups.map((group) => group.subject))].sort();
  subjects.forEach((subject) => {
    const option = document.createElement('option');
    option.value = subject;
    option.textContent = subject;
    filter.append(option);
  });

  function render() {
    const query = search.value.trim().toLocaleLowerCase('pt-BR');
    const subject = filter.value;
    const visible = studyGroups.filter((group) => {
      const matchesQuery = `${group.name} ${group.subject} ${group.description}`.toLocaleLowerCase('pt-BR').includes(query);
      return matchesQuery && (!subject || group.subject === subject);
    });
    document.getElementById('groupCount').textContent = `${visible.length} ${visible.length === 1 ? 'grupo encontrado' : 'grupos encontrados'} · ${state.joinedGroups.length} salvos`;
    document.getElementById('emptyGroups').hidden = visible.length > 0;
    container.innerHTML = '';
    visible.forEach((group) => {
      const card = document.createElement('article');
      card.className = 'group-card community-card';
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = group.subject;
      const title = document.createElement('h2');
      title.textContent = group.name;
      const description = document.createElement('p');
      description.textContent = group.description;
      const meta = document.createElement('p');
      meta.className = 'meta';
      meta.textContent = `${group.members} participantes · Próximo encontro: ${group.nextMeeting}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = state.joinedGroups.includes(group.id) ? 'btn btn-secondary' : 'btn btn-primary';
      button.dataset.groupId = group.id;
      button.textContent = state.joinedGroups.includes(group.id) ? 'Remover dos salvos' : 'Salvar grupo';
      card.append(tag, title, description, meta, button);
      container.append(card);
    });
  }

  search.addEventListener('input', render);
  filter.addEventListener('change', render);
  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-group-id]');
    if (!button) return;
    const groupId = button.dataset.groupId;
    if (state.joinedGroups.includes(groupId)) {
      state.joinedGroups = state.joinedGroups.filter((id) => id !== groupId);
    } else {
      state.joinedGroups.push(groupId);
    }
    if (saveState()) render();
  });
  render();
}

let deferredInstallPrompt = null;

function setupPwa() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.error('Não foi possível ativar o modo offline.', error);
    });
  }

  const installButton = document.getElementById('installAppButton');
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (installButton) installButton.hidden = false;
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (installButton) installButton.hidden = true;
  });

  if (installButton) {
    installButton.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      try {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
      } catch (error) {
        console.error('Não foi possível iniciar a instalação do aplicativo.', error);
        const installHelp = document.getElementById('installHelp');
        if (installHelp) installHelp.textContent = 'A instalação não foi concluída. Use “Instalar app” ou “Adicionar à tela inicial” no menu do navegador.';
      } finally {
        deferredInstallPrompt = null;
        installButton.hidden = true;
      }
    });
  }

  const networkNotice = document.createElement('p');
  networkNotice.className = 'network-notice';
  networkNotice.setAttribute('role', 'status');
  networkNotice.setAttribute('aria-live', 'polite');
  networkNotice.hidden = navigator.onLine;
  networkNotice.textContent = 'Você está sem conexão. As páginas já visitadas podem continuar disponíveis neste dispositivo.';
  const header = document.querySelector('.site-header');
  if (header) header.after(networkNotice);
  window.addEventListener('offline', () => { networkNotice.hidden = false; });
  window.addEventListener('online', () => { networkNotice.hidden = true; });
}

function initializePage() {
  document.querySelectorAll('[data-current-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  if (document.getElementById('currentYear')) document.getElementById('currentYear').textContent = new Date().getFullYear();
  applyPreferences();
  const colorScheme = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (colorScheme) {
    const updateSystemTheme = () => {
      if (state.preferences.theme === 'system') applyPreferences();
    };
    if (colorScheme.addEventListener) colorScheme.addEventListener('change', updateSystemTheme);
    else colorScheme.addListener(updateSystemTheme);
  }
  renderLanding();
  setupSignup();
  setupDashboard();
  setupCommunity();
  setupPwa();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}
