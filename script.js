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
  if (goalsDate !== todayKey()) {
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
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    joinedGroups: Array.isArray(parsed.joinedGroups) ? parsed.joinedGroups : [],
    pomodoro,
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
    { label: 'Foco', value: '84%' },
    { label: 'Sono', value: '7h 40m' },
    { label: 'Estresse', value: 'Moderado' },
    { label: 'Telas', value: '2h 30m' },
  ];
  const exercises = [
    { title: 'Mapa mental', difficulty: 'Intermediário', description: 'Conecte ideias e conceitos para facilitar a memorização visual.' },
    { title: 'Repetição espaçada', difficulty: 'Fácil', description: 'Revise conteúdos em intervalos estratégicos para consolidar o aprendizado.' },
    { title: 'Flashcards', difficulty: 'Fácil', description: 'Teste a memória ativa com perguntas rápidas e respostas curtas.' },
  ];
  const progress = [
    { label: 'Foco semanal', value: '92%', change: '+12% vs. semana anterior' },
    { label: 'Sinais de bem-estar', value: '87%', change: '+8% em sono e descanso' },
    { label: 'Conclusão de metas', value: '75%', change: '3 de 4 objetivos atingidos' },
    { label: 'Conexão com a comunidade', value: '91%', change: '+5 novos contatos' },
  ];

  renderCards('featureGrid', features, (item) => `
    <article class="feature-card"><div class="feature-emoji">${item.emoji}</div><h3>${item.title}</h3><p>${item.text}</p></article>
  `);
  renderCards('heroMetrics', metrics, (item) => `
    <div class="metric-item"><label>${item.label}</label><strong>${item.value}</strong></div>
  `);
  renderCards('daySummary', metrics, (item) => `
    <div class="mini-metric"><label>${item.label}</label><strong>${item.value}</strong></div>
  `);
  renderCards('memoryExercises', exercises, (item) => `
    <article class="exercise-card"><div class="tag">${item.difficulty}</div><h4>${item.title}</h4><p>${item.description}</p></article>
  `);
  renderCards('studyGroups', studyGroups.slice(0, 3), (item) => `
    <article class="group-card"><div class="tag">${item.subject}</div><h4>${item.name}</h4><p>${item.members} membros</p><p class="meta">Próxima aula: ${item.nextMeeting}</p></article>
  `);
  renderCards('progressBoard', progress, (item) => `
    <article class="progress-card"><h4>${item.label}</h4><div class="progress-value">${item.value}</div><div class="progress-bar"><span class="progress-track" style="width:${item.value}"></span></div><p>${item.change}</p></article>
  `);

  const name = document.getElementById('studentName');
  const campus = document.getElementById('studentCampus');
  if (name) name.textContent = state.profile?.name || 'Ana Luíza';
  if (campus) campus.textContent = state.profile?.campus || 'Campus Central';
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
      saveState();
      refreshDashboardStats();
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
    if (!saveState()) return;
    input.value = '';
    message.textContent = 'Meta adicionada à sua lista de hoje.';
    renderCustomGoals();
    refreshDashboardStats();
    input.focus();
  });
  document.getElementById('customGoalList').addEventListener('change', (event) => {
    const input = event.target.closest('[data-custom-goal]');
    if (!input) return;
    const goal = state.customGoals.find((item) => item.id === input.dataset.customGoal);
    if (!goal) return;
    goal.completed = input.checked;
    saveState();
    refreshDashboardStats();
  });
  document.getElementById('customGoalList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-goal]');
    if (!button) return;
    state.customGoals = state.customGoals.filter((goal) => goal.id !== button.dataset.removeGoal);
    if (!saveState()) return;
    renderCustomGoals();
    refreshDashboardStats();
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
  setupTimer();
  refreshDashboardStats();
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
    state.journalEntries = state.journalEntries.filter((entry) => entry.id !== button.dataset.deleteEntry);
    if (saveState()) renderJournalEntries();
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
    deleteButton.setAttribute('aria-label', 'Apagar este registro do diário');
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
          state.sessions.push({ date: todayKey(), minutes: modes.focus });
          state.goals.study = true;
          saveState();
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

function initializePage() {
  document.querySelectorAll('[data-current-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  if (document.getElementById('currentYear')) document.getElementById('currentYear').textContent = new Date().getFullYear();
  renderLanding();
  setupSignup();
  setupDashboard();
  setupCommunity();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}
