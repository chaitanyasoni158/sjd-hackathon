/* eslint-disable */
/* ═══════════════════════════════════════════════════════════
   MINDWELL — APP.JS
   All application logic: auth, navigation, charts, features
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── APP STATE ── */
const state = {
  user:                null,
  currentMood:         null,
  currentPage:         'dashboard',
  darkMode:            false,
  wellnessScore:       72,
  questionStep:        0,
  questionAnswers:     [],
  breathInterval:      null,
  journals:            [],
  moodLog:             [],
  chartsInitialized:   {},
};

/* ── QUESTIONNAIRE DATA ── */
const QUESTIONS = [
  { text: "How often do you feel nervous, anxious, or on edge?",
    opts: ["Never", "Several days", "More than half the days", "Nearly every day"] },
  { text: "How often do you feel unable to stop or control worrying?",
    opts: ["Never", "Several days", "More than half the days", "Nearly every day"] },
  { text: "How often do you feel down, depressed, or hopeless?",
    opts: ["Never", "Several days", "More than half the days", "Nearly every day"] },
  { text: "How often do you have little interest or pleasure in doing things?",
    opts: ["Never", "Several days", "More than half the days", "Nearly every day"] },
  { text: "How often do you have trouble falling or staying asleep?",
    opts: ["Never", "Several days", "More than half the days", "Nearly every day"] },
  { text: "How often do you feel tired or have little energy?",
    opts: ["Never", "Several days", "More than half the days", "Nearly every day"] },
  { text: "How often do you have trouble concentrating on things?",
    opts: ["Never", "Sometimes", "Often", "Very often"] },
  { text: "Do you feel irritable, restless, or keyed up?",
    opts: ["Never", "Rarely", "Sometimes", "Frequently"] },
  { text: "Have you felt like a failure or let yourself or your family down?",
    opts: ["Never", "Several days", "More than half the days", "Nearly every day"] },
  { text: "Have you had any thoughts of hurting yourself or that you'd be better off not here?",
    opts: ["Never", "Rarely", "Sometimes", "Often"] },
];

const BREATH_PHASES = ['Inhale', 'Hold', 'Exhale', 'Hold'];

/* ═══════════════════════════════════════════
   AUTH
═══════════════════════════════════════════ */
function login() {
  const email = document.getElementById('loginEmail').value.trim();
  if (!email) { showToast('⚠️', 'Please enter your email'); return; }
  _enterApp({ name: 'Alex Johnson', email });
}

function signup() {
  const name  = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  if (!name || !email) { showToast('⚠️', 'Please fill in all fields'); return; }
  _enterApp({ name, email });
}

function demoLogin() {
  _enterApp({ name: 'Alex Johnson', email: 'demo@mindwell.app' });
}

function _enterApp(user) {
  state.user = user;
  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  document.getElementById('userAvatar').textContent       = initials;
  document.getElementById('greetName').textContent        = user.name.split(' ')[0];
  document.getElementById('profileName').textContent      = user.name;
  document.getElementById('profileEmail').textContent     = user.email;
  document.getElementById('profileAvatarLarge').textContent = initials;
  document.getElementById('pName').value                  = user.name;
  document.getElementById('journalDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  _injectDashboardAlert();
  initDashboardCharts();
  renderQuestionnaire();
  _animateRing(72);

  setTimeout(() => showToast('👋', `Welcome back, ${user.name.split(' ')[0]}!`), 200);
  setTimeout(() => showToast('🔔', '3 new wellness alerts for you'), 1800);
}

function logout() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('authScreen').style.display = 'flex';
  state.user = null;
  state.chartsInitialized = {};
  showPage('dashboard');
}

function switchTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
  document.getElementById('loginForm').style.display  = tab === 'login'  ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
}

/* ═══════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════ */
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageNavMap = {
    dashboard: 'dashboard', mood: 'mood check-in', questionnaire: 'assessment',
    trends: 'trends', journal: 'journal', habits: 'habit tracker',
    suggestions: 'suggestions', alerts: 'alerts', profile: 'profile', emergency: 'crisis'
  };
  const keyword = pageNavMap[page] || page;
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.textContent.trim().toLowerCase().includes(keyword)) n.classList.add('active');
  });

  state.currentPage = page;
  if (page === 'trends') initTrendCharts();
  if (page === 'habits') initHabitsChart();
}

/* ═══════════════════════════════════════════
   THEME
═══════════════════════════════════════════ */
function toggleTheme() {
  state.darkMode = !state.darkMode;
  document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
  document.getElementById('themeBtn').textContent = state.darkMode ? '☀️' : '🌙';
  showToast(state.darkMode ? '🌙' : '☀️', state.darkMode ? 'Dark mode on' : 'Light mode on');
}

function setTheme(val) {
  state.darkMode = val === 'dark';
  document.documentElement.setAttribute('data-theme', val);
}

/* ═══════════════════════════════════════════
   MOOD CHECK-IN
═══════════════════════════════════════════ */
function selectMood(el, mood, emoji) {
  document.querySelectorAll('.mood-btn').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');
  state.currentMood = { mood, emoji };
}

function saveMood() {
  if (!state.currentMood) { showToast('⚠️', 'Please select a mood first'); return; }
  const intensity = document.getElementById('moodIntensity').value;
  const note      = document.getElementById('moodNote').value;

  document.getElementById('currentMoodDisplay').textContent = state.currentMood.emoji;

  state.moodLog.push({
    ...state.currentMood,
    intensity: parseInt(intensity),
    note,
    date: new Date(),
  });

  showToast('✅', `Mood "${state.currentMood.mood}" logged!`);
  document.querySelectorAll('.mood-btn').forEach(m => m.classList.remove('selected'));
  document.getElementById('moodNote').value = '';
  document.getElementById('intensityVal').textContent = '5';
  document.getElementById('moodIntensity').value = 5;
  state.currentMood = null;

  setTimeout(() => showPage('dashboard'), 500);
}

/* ═══════════════════════════════════════════
   QUESTIONNAIRE
═══════════════════════════════════════════ */
function renderQuestionnaire() {
  const container = document.getElementById('questionnaireContent');
  if (!container) return;

  if (state.questionStep >= QUESTIONS.length) {
    _renderResults(container);
    return;
  }

  const q   = QUESTIONS[state.questionStep];
  const pct = Math.round((state.questionStep / QUESTIONS.length) * 100);
  const saved = state.questionAnswers[state.questionStep];

  container.innerHTML = `
    <div class="question-card">
      <div class="q-progress-wrap">
        <div class="q-progress-bar">
          <div class="q-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="q-counter">${state.questionStep + 1} / ${QUESTIONS.length}</div>
      </div>

      <div class="question-text">${q.text}</div>

      <div class="question-options">
        ${q.opts.map((opt, i) => `
          <div class="q-option${saved === i ? ' selected' : ''}" onclick="selectAnswer(${i}, this)">
            <div class="q-dot"></div>
            <span>${opt}</span>
          </div>
        `).join('')}
      </div>

      <div class="q-nav">
        <button class="btn-outline" onclick="prevQuestion()" ${state.questionStep === 0 ? 'disabled style="opacity:.4;cursor:not-allowed"' : ''}>← Back</button>
        <button class="btn-next" id="qNextBtn" onclick="nextQuestion()" ${saved === undefined ? 'disabled' : ''}>
          ${state.questionStep === QUESTIONS.length - 1 ? 'View Results ✓' : 'Next →'}
        </button>
      </div>
    </div>`;
}

function selectAnswer(val, el) {
  document.querySelectorAll('.q-option').forEach(o => {
    o.classList.remove('selected');
    const dot = o.querySelector('.q-dot');
    if (dot) dot.style.background = '';
  });
  el.classList.add('selected');
  const dot = el.querySelector('.q-dot');
  if (dot) { dot.style.borderColor = 'var(--accent)'; dot.style.background = 'var(--accent)'; }

  state.questionAnswers[state.questionStep] = val;
  const btn = document.getElementById('qNextBtn');
  if (btn) btn.disabled = false;
}

function nextQuestion() {
  if (state.questionAnswers[state.questionStep] === undefined) return;
  state.questionStep++;
  renderQuestionnaire();
}

function prevQuestion() {
  if (state.questionStep > 0) { state.questionStep--; renderQuestionnaire(); }
}

function resetQuestionnaire() {
  state.questionStep = 0;
  state.questionAnswers = [];
  renderQuestionnaire();
}

function _renderResults(container) {
  const total = state.questionAnswers.reduce((s, v) => s + v, 0);
  const maxScore = QUESTIONS.length * 3;
  const wellness = Math.max(5, Math.round(100 - (total / maxScore) * 100));

  // Update global score
  state.wellnessScore = wellness;
  _updateWellnessScore(wellness);

  // Calculate sub-scores
  const anxietyAnswers = [0,1,7].map(i => state.questionAnswers[i] || 0);
  const sadnessAnswers = [2,3,8].map(i => state.questionAnswers[i] || 0);
  const anxScore = anxietyAnswers.reduce((s,v) => s+v, 0);
  const sadScore = sadnessAnswers.reduce((s,v) => s+v, 0);
  const sleepVal = state.questionAnswers[4] || 0;

  const anxLevel  = anxScore >= 6 ? 'High' : anxScore >= 3 ? 'Moderate' : 'Low';
  const sadLevel  = sadScore >= 6 ? 'High' : sadScore >= 3 ? 'Moderate' : 'Low';
  const sleepLbl  = sleepVal >= 2 ? 'Poor' : sleepVal === 1 ? 'Fair' : 'Good';

  let risk, riskColor, riskClass, desc;
  if (wellness >= 70) {
    risk = 'Low Risk'; riskColor = '#059669'; riskClass = 'risk-low';
    desc = 'Your wellness looks good! Keep maintaining your healthy habits, regular check-ins, and self-care practices.';
  } else if (wellness >= 45) {
    risk = 'Moderate Risk'; riskColor = '#d97706'; riskClass = 'risk-moderate';
    desc = 'Some areas need attention. Consider stress management techniques, better sleep hygiene, and regular relaxation practices.';
  } else {
    risk = 'High Risk'; riskColor = '#dc2626'; riskClass = 'risk-high';
    desc = 'Your results indicate high risk. Please consider speaking with a mental health professional as soon as possible.';
  }

  const circumference = 2 * Math.PI * 70;
  const dash = (wellness / 100) * circumference;

  const badgeFor = (level) => level === 'Low' ? 'badge-good' : level === 'Moderate' ? 'badge-warn' : 'badge-danger';

  container.innerHTML = `
    <div class="result-card">
      <div class="result-score-ring">
        <svg viewBox="0 0 160 160" width="180" height="180">
          <defs>
            <linearGradient id="resGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2563eb"/>
              <stop offset="100%" stop-color="${riskColor}"/>
            </linearGradient>
          </defs>
          <circle fill="none" stroke="var(--border)" stroke-width="12" cx="80" cy="80" r="70"/>
          <circle fill="none" stroke="url(#resGrad)" stroke-width="12" stroke-linecap="round"
            stroke-dasharray="${circumference.toFixed(1)}"
            stroke-dashoffset="${(circumference - dash).toFixed(1)}"
            cx="80" cy="80" r="70"
            transform="rotate(-90 80 80)"
            style="transition:stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)"/>
          <text x="80" y="73" text-anchor="middle" dominant-baseline="middle"
            style="font-family:'Fraunces',serif;font-size:38px;font-weight:900;fill:var(--text)">${wellness}</text>
          <text x="80" y="100" text-anchor="middle"
            style="font-size:13px;fill:var(--text3);font-family:'Plus Jakarta Sans',sans-serif">Wellness Score</text>
        </svg>
      </div>

      <div class="result-title" style="color:${riskColor}">${risk}</div>
      <p class="result-desc">${desc}</p>

      <div class="result-tags">
        <span class="badge ${badgeFor(anxLevel)}">Anxiety: ${anxLevel}</span>
        <span class="badge ${badgeFor(sadLevel)}">Sadness: ${sadLevel}</span>
        <span class="badge ${sleepVal >= 2 ? 'badge-danger' : sleepVal === 1 ? 'badge-warn' : 'badge-good'}">Sleep: ${sleepLbl}</span>
      </div>

      ${wellness < 45 ? `
        <div class="alert-banner alert-danger" style="text-align:left;max-width:480px;margin:0 auto 24px">
          <span class="alert-icon">🆘</span>
          <div><strong>Immediate Support Recommended</strong>
          Your results indicate high risk. Please reach out to a mental health professional or use our crisis support resources.</div>
        </div>` : ''}

      <div class="result-actions">
        <button class="btn-outline" onclick="resetQuestionnaire()">Retake Assessment</button>
        <button class="btn-next" onclick="showPage('suggestions')">View Suggestions →</button>
        ${wellness < 45 ? `<button class="btn-next" style="background:linear-gradient(135deg,#dc2626,#d97706)" onclick="showPage('emergency')">Get Help Now 🆘</button>` : ''}
      </div>
    </div>`;

  showToast('✅', `Assessment complete! Score: ${wellness}/100`);
}

/* ═══════════════════════════════════════════
   WELLNESS SCORE HELPERS
═══════════════════════════════════════════ */
function _updateWellnessScore(score) {
  const sidebarScore = document.getElementById('sidebarScore');
  const sidebarFill  = document.getElementById('sidebarScoreFill');
  if (sidebarScore) sidebarScore.textContent = score;
  if (sidebarFill)  sidebarFill.style.width  = score + '%';
  _animateRing(score);
}

function _animateRing(score) {
  const fill = document.getElementById('ringFill');
  const val  = document.getElementById('ringValue');
  if (!fill) return;
  const circumference = 2 * Math.PI * 54; // r=54
  const offset = circumference - (score / 100) * circumference;
  fill.style.strokeDasharray  = circumference.toFixed(1);
  fill.style.strokeDashoffset = offset.toFixed(1);
  if (val) val.textContent = score;
}

/* ═══════════════════════════════════════════
   JOURNAL
═══════════════════════════════════════════ */
function saveJournal() {
  const text = document.getElementById('journalInput').value.trim();
  if (!text) { showToast('⚠️', 'Please write something first'); return; }

  const mood = document.getElementById('journalMood').value;
  const entry = { text, mood, date: new Date() };
  state.journals.unshift(entry);

  const moodBadgeClass = mood.includes('Happy') ? 'badge-good'
    : mood.includes('Anxious') || mood.includes('Stressed') ? 'badge-warn'
    : mood.includes('Sad') ? 'badge-danger' : 'badge-info';

  const div = document.createElement('div');
  div.className = 'journal-entry';
  div.style.animation = 'alertIn .3s ease';
  div.innerHTML = `
    <div class="journal-entry-header">
      <div class="journal-date">📅 ${entry.date.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
      <span class="badge ${moodBadgeClass}">${mood}</span>
    </div>
    <p class="journal-text">${text}</p>`;

  document.getElementById('journalEntries').prepend(div);
  document.getElementById('journalInput').value = '';
  showToast('📓', 'Journal entry saved!');
}

/* ═══════════════════════════════════════════
   HABITS
═══════════════════════════════════════════ */
function updateHabit(slider, valueId, unit, goal) {
  const el = document.getElementById(valueId);
  if (el) el.textContent = slider.value + unit;
  const pct = Math.min(100, (parseFloat(slider.value) / goal) * 100);
  slider.style.background = `linear-gradient(90deg, var(--accent) ${pct}%, var(--border) ${pct}%)`;
}

function saveHabits() {
  const sliders = document.querySelectorAll('#habitsList .styled-slider');
  if (sliders.length > 0) {
    document.getElementById('sleepDisplay').textContent = sliders[0].value + 'h';
  }
  showToast('✅', 'Habits logged for today!');
}

/* ═══════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════ */
function saveProfile() {
  const name = document.getElementById('pName').value.trim();
  if (!name) { showToast('⚠️', 'Name cannot be empty'); return; }

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('profileName').textContent      = name;
  document.getElementById('greetName').textContent        = name.split(' ')[0];
  document.getElementById('userAvatar').textContent       = initials;
  document.getElementById('profileAvatarLarge').textContent = initials;
  showToast('✅', 'Profile updated!');
}

/* ═══════════════════════════════════════════
   BREATHING EXERCISE
═══════════════════════════════════════════ */
function openBreathing() {
  const card = document.getElementById('breathingCard');
  if (card) {
    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function startBreathing() {
  _startBreathCycle('breathingCircle', 'breathLabel', 'breathSub');
}

function _startBreathCycle(circleId, labelId, subId) {
  if (state.breathInterval) clearInterval(state.breathInterval);

  let phase = 0;
  let secs  = 4;

  const tick = () => {
    const circle = document.getElementById(circleId);
    const label  = document.getElementById(labelId);
    const sub    = document.getElementById(subId);
    if (!circle) { clearInterval(state.breathInterval); return; }

    label.textContent = BREATH_PHASES[phase];
    sub.textContent   = secs + ' seconds';

    if (BREATH_PHASES[phase] === 'Inhale') circle.classList.add('inhale');
    else circle.classList.remove('inhale');

    secs--;
    if (secs <= 0) { phase = (phase + 1) % 4; secs = 4; }
  };

  tick();
  state.breathInterval = setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════════════════ */
function showToast(icon, msg) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 280);
  }, 3200);
}

/* ═══════════════════════════════════════════
   DASHBOARD ALERT
═══════════════════════════════════════════ */
function _injectDashboardAlert() {
  const container = document.getElementById('alertBannerContainer');
  if (!container) return;
  container.innerHTML = `
    <div class="alert-banner alert-warn" style="margin-bottom:20px">
      <span class="alert-icon">⚠️</span>
      <div><strong>Stress Pattern Detected</strong>
      Your stress has been elevated for 5 days. Consider a breathing exercise or mindfulness break.
      <button class="btn-sm" onclick="openBreathing();showPage('suggestions')" style="margin-left:8px;margin-top:6px">Try Breathing →</button></div>
    </div>`;
}

/* ═══════════════════════════════════════════
   CHARTS
═══════════════════════════════════════════ */
function _chartDefaults() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    grid:  dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    text:  dark ? '#7a90b0' : '#7a90b0',
    font:  { family: 'Plus Jakarta Sans', size: 11 },
  };
}

function initDashboardCharts() {
  if (state.chartsInitialized.dashboard) return;
  state.chartsInitialized.dashboard = true;

  const d = _chartDefaults();

  /* Weekly Mood Line */
  new Chart(document.getElementById('weekMoodChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Mood Score',
        data: [6, 5, 4, 7, 6, 8, 7],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.12)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        fill: true,
        tension: 0.45,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: d.grid }, ticks: { color: d.text, font: d.font } },
        y: { min: 0, max: 10, grid: { color: d.grid }, ticks: { color: d.text, font: d.font, stepSize: 2 } },
      },
    },
  });

  /* Anxiety Bar */
  new Chart(document.getElementById('anxietyChart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Anxiety',
        data: [5, 7, 8, 6, 7, 4, 5],
        backgroundColor: ctx => {
          const v = ctx.raw;
          return v >= 7 ? 'rgba(220,38,38,0.75)' : v >= 5 ? 'rgba(217,119,6,0.75)' : 'rgba(5,150,105,0.75)';
        },
        borderRadius: 8,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: d.text, font: d.font } },
        y: { min: 0, max: 10, grid: { color: d.grid }, ticks: { color: d.text, font: d.font, stepSize: 2 } },
      },
    },
  });
}

function initTrendCharts() {
  if (state.chartsInitialized.trends) return;
  state.chartsInitialized.trends = true;

  const d = _chartDefaults();
  const now = new Date();

  const labels30 = Array.from({ length: 30 }, (_, i) => {
    const dt = new Date(now); dt.setDate(now.getDate() - 29 + i);
    return `${dt.getDate()}/${dt.getMonth() + 1}`;
  });
  const labels14 = labels30.slice(-14);

  /* 30-Day Wellness */
  new Chart(document.getElementById('wellnessChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: labels30,
      datasets: [{
        label: 'Wellness Score',
        data: labels30.map(() => Math.floor(Math.random() * 40 + 50)),
        borderColor: '#2563eb',
        backgroundColor: ctx => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return 'rgba(37,99,235,0.1)';
          const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          grad.addColorStop(0, 'rgba(37,99,235,0.20)');
          grad.addColorStop(1, 'rgba(37,99,235,0.00)');
          return grad;
        },
        borderWidth: 2.5, fill: true, tension: 0.45, pointRadius: 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: d.text, font: { size: 10 }, maxTicksLimit: 8 } },
        y: { min: 0, max: 100, grid: { color: d.grid }, ticks: { color: d.text, font: { size: 10 } } },
      },
    },
  });

  /* Mood Distribution Doughnut */
  new Chart(document.getElementById('moodDistChart').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Happy', 'Calm', 'Neutral', 'Anxious', 'Sad', 'Stressed'],
      datasets: [{
        data: [8, 5, 6, 7, 3, 4],
        backgroundColor: ['#059669', '#2563eb', '#7a90b0', '#d97706', '#7c3aed', '#dc2626'],
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: {
        legend: {
          position: 'right',
          labels: { color: d.text, font: { family: 'Plus Jakarta Sans', size: 11 }, boxWidth: 10, padding: 10 },
        },
      },
    },
  });

  /* Anxiety & Sadness Line */
  new Chart(document.getElementById('anxietySadnessChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: labels14,
      datasets: [
        {
          label: 'Anxiety',
          data: labels14.map(() => Math.floor(Math.random() * 6 + 2)),
          borderColor: '#d97706', backgroundColor: 'rgba(217,119,6,0.06)',
          borderWidth: 3, tension: 0.45, pointRadius: 4,
          pointBackgroundColor: '#d97706', pointBorderColor: '#fff', pointBorderWidth: 2, fill: true,
        },
        {
          label: 'Sadness',
          data: labels14.map(() => Math.floor(Math.random() * 5 + 1)),
          borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.06)',
          borderWidth: 3, tension: 0.45, pointRadius: 4,
          pointBackgroundColor: '#7c3aed', pointBorderColor: '#fff', pointBorderWidth: 2, fill: true,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: d.text, font: { family: 'Plus Jakarta Sans', size: 12 } } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: d.text } },
        y: { min: 0, max: 10, grid: { color: d.grid }, ticks: { color: d.text } },
      },
    },
  });
}

function initHabitsChart() {
  if (state.chartsInitialized.habits) return;
  state.chartsInitialized.habits = true;

  const d = _chartDefaults();

  new Chart(document.getElementById('habitsChart').getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['Sleep', 'Water', 'Exercise', 'Low Screen', 'Meditation'],
      datasets: [
        {
          label: 'This Week',
          data: [75, 60, 50, 42, 30],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.15)',
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
        {
          label: 'Goal',
          data: [100, 100, 100, 100, 100],
          borderColor: 'rgba(5,150,105,0.4)',
          backgroundColor: 'rgba(5,150,105,0.04)',
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: d.text, font: { family: 'Plus Jakarta Sans', size: 11 } } } },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { display: false },
          grid: { color: d.grid },
          pointLabels: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: d.text },
        },
      },
    },
  });
}

/* ═══════════════════════════════════════════
   INIT — run after DOM ready
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  /* Kick slider visuals */
  document.querySelectorAll('.styled-slider').forEach(s => {
    s.dispatchEvent(new Event('input'));
  });
});
