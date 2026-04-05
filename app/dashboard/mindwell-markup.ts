export const mindwellMarkup = String.raw`

<!-- ═══════════════════════════════════════════
     AUTH SCREEN
═══════════════════════════════════════════ -->
<div id="authScreen">
  <div class="auth-bg-orb orb1"></div>
  <div class="auth-bg-orb orb2"></div>
  <div class="auth-bg-orb orb3"></div>

  <div class="auth-card">
    <div class="auth-logo">
      <div class="auth-logo-icon">🧠</div>
      <div class="auth-logo-text">Mind<span>Well</span></div>
    </div>
    <p class="auth-tagline">Your personal mental wellness companion</p>

    <div class="auth-tabs">
      <button class="auth-tab active" id="tabLogin" onclick="switchTab('login')">Sign In</button>
      <button class="auth-tab" id="tabSignup" onclick="switchTab('signup')">Sign Up</button>
    </div>

    <!-- LOGIN -->
    <div id="loginForm">
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" class="form-input" id="loginEmail" placeholder="you@example.com" value="demo@mindwell.app" />
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" class="form-input" id="loginPass" placeholder="••••••••" value="password" />
      </div>
      <button class="btn-primary" onclick="login()">Sign In →</button>
    </div>

    <!-- SIGNUP -->
    <div id="signupForm" style="display:none">
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <input type="text" class="form-input" id="signupName" placeholder="Alex Johnson" />
      </div>
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" class="form-input" id="signupEmail" placeholder="you@example.com" />
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" class="form-input" id="signupPass" placeholder="Create a strong password" />
      </div>
      <button class="btn-primary" onclick="signup()">Create Account →</button>
    </div>

    <div class="auth-divider">or</div>
    <button class="btn-demo" onclick="demoLogin()">🚀 Continue with Demo Account</button>
  </div>
</div>

<!-- ═══════════════════════════════════════════
     MAIN APP
═══════════════════════════════════════════ -->
<div id="app" style="display:none">
  <div class="app-layout">

    <!-- TOP BAR -->
    <header class="topbar">
      <div class="topbar-logo">
        <div class="logo-icon">🧠</div>
        <span>Mind<span class="logo-accent">Well</span></span>
      </div>
      <div class="topbar-actions">
        <button class="topbar-btn notif-btn" onclick="showPage('alerts')" title="Alerts">🔔</button>
        <button class="topbar-btn" onclick="toggleTheme()" id="themeBtn" title="Toggle theme">🌙</button>
        <div class="user-avatar" id="userAvatar" onclick="showPage('profile')">A</div>
      </div>
    </header>

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-score-card">
        <div class="sidebar-score-label">Wellness Score</div>
        <div class="sidebar-score-value" id="sidebarScore">72</div>
        <div class="sidebar-score-sub">Moderate — Keep going!</div>
        <div class="sidebar-score-bar">
          <div class="sidebar-score-fill" id="sidebarScoreFill" style="width:72%"></div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">Main</div>
        <a class="nav-item active" onclick="showPage('dashboard')"><span class="nav-icon">📊</span>Dashboard</a>
        <a class="nav-item" onclick="showPage('mood')"><span class="nav-icon">😊</span>Mood Check-In</a>
        <a class="nav-item" onclick="showPage('questionnaire')"><span class="nav-icon">📋</span>Assessment</a>
        <a class="nav-item" onclick="showPage('trends')"><span class="nav-icon">📈</span>Trends</a>

        <div class="nav-section-label">Wellness</div>
        <a class="nav-item" onclick="showPage('journal')"><span class="nav-icon">📓</span>Journal</a>
        <a class="nav-item" onclick="showPage('habits')"><span class="nav-icon">✅</span>Habit Tracker</a>
        <a class="nav-item" onclick="showPage('suggestions')"><span class="nav-icon">💡</span>Suggestions</a>

        <div class="nav-section-label">System</div>
        <a class="nav-item" onclick="showPage('alerts')"><span class="nav-icon">🔔</span>Alerts<span class="nav-badge">3</span></a>
        <a class="nav-item" onclick="showPage('profile')"><span class="nav-icon">👤</span>Profile</a>
        <a class="nav-item nav-crisis" onclick="showPage('emergency')"><span class="nav-icon">🆘</span>Crisis Support</a>
        <a class="nav-item nav-logout" onclick="logout()"><span class="nav-icon">🚪</span>Sign Out</a>
      </nav>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">

      <!-- ── DASHBOARD ── -->
      <section class="page active" id="page-dashboard">
        <div class="page-header">
          <div>
            <h1 class="page-title">Good morning, <span id="greetName">Alex</span> 👋</h1>
            <p class="page-subtitle">Here's your wellness overview for today</p>
          </div>
          <button class="btn-accent" onclick="showPage('mood')">Log Today's Mood</button>
        </div>

        <div id="alertBannerContainer"></div>

        <div class="grid-4">
          <div class="stat-card" style="--card-accent:#3b82f6">
            <div class="stat-icon" style="background:rgba(59,130,246,0.15)">🧠</div>
            <div class="stat-value">72</div>
            <div class="stat-label">Wellness Score</div>
            <div class="stat-change positive">↑ +4 this week</div>
          </div>
          <div class="stat-card" style="--card-accent:#10b981">
            <div class="stat-icon" style="background:rgba(16,185,129,0.15)">😊</div>
            <div class="stat-value" id="currentMoodDisplay">—</div>
            <div class="stat-label">Today's Mood</div>
            <div class="stat-change neutral">Not logged yet</div>
          </div>
          <div class="stat-card" style="--card-accent:#f59e0b">
            <div class="stat-icon" style="background:rgba(245,158,11,0.15)">😰</div>
            <div class="stat-value">Mod</div>
            <div class="stat-label">Anxiety Level</div>
            <div class="stat-change negative">↑ Elevated</div>
          </div>
          <div class="stat-card" style="--card-accent:#ef4444">
            <div class="stat-icon" style="background:rgba(239,68,68,0.15)">🌙</div>
            <div class="stat-value" id="sleepDisplay">6.5h</div>
            <div class="stat-label">Avg Sleep</div>
            <div class="stat-change negative">↓ Below goal</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="card-header"><span class="card-title">Wellness Score</span><span class="badge badge-warn">Moderate</span></div>
            <div class="wellness-ring-wrap">
              <svg class="ring-svg" viewBox="0 0 140 140">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6"/>
                    <stop offset="100%" stop-color="#10b981"/>
                  </linearGradient>
                </defs>
                <circle class="ring-track" cx="70" cy="70" r="54"/>
                <circle class="ring-fill" id="ringFill" cx="70" cy="70" r="54"/>
                <text class="ring-value" x="70" y="66" id="ringValue">72</text>
                <text class="ring-unit" x="70" y="82">/100</text>
              </svg>
              <div class="ring-info">
                <div class="ring-title">Moderate Wellness</div>
                <p class="ring-desc">Keep tracking daily. Consistent journaling and breathing exercises can boost your score.</p>
                <div class="risk-chip risk-moderate">⚠️ Moderate Risk</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><span class="card-title">This Week's Mood</span></div>
            <div class="chart-wrap"><canvas id="weekMoodChart"></canvas></div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="card-header"><span class="card-title">Anxiety Trend</span></div>
            <div class="chart-wrap"><canvas id="anxietyChart"></canvas></div>
          </div>
          <div class="card">
            <div class="card-header"><span class="card-title">Recent Activity</span></div>
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-icon" style="background:rgba(59,130,246,0.15)">📋</div>
                <div class="activity-info">
                  <div class="activity-name">Assessment Completed</div>
                  <div class="activity-sub">Score: 72 — Moderate · 2 hours ago</div>
                </div>
                <span class="badge badge-warn">Moderate</span>
              </div>
              <div class="activity-item">
                <div class="activity-icon" style="background:rgba(99,102,241,0.15)">📓</div>
                <div class="activity-info">
                  <div class="activity-name">Journal Entry</div>
                  <div class="activity-sub">Wrote about today's feelings · Yesterday</div>
                </div>
                <span class="badge badge-info">Logged</span>
              </div>
              <div class="activity-item">
                <div class="activity-icon" style="background:rgba(16,185,129,0.15)">🧘</div>
                <div class="activity-info">
                  <div class="activity-name">Breathing Exercise</div>
                  <div class="activity-sub">5-min session completed · 2 days ago</div>
                </div>
                <span class="badge badge-good">Done</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── MOOD CHECK-IN ── -->
      <section class="page" id="page-mood">
        <div class="page-header">
          <div>
            <h1 class="page-title">Mood Check-In</h1>
            <p class="page-subtitle">How are you feeling right now?</p>
          </div>
        </div>
        <div class="card mb-20">
          <div class="card-title">Select Your Current Mood</div>
          <div class="mood-grid">
            <div class="mood-btn" onclick="selectMood(this,'Happy','😊')"><span class="mood-emoji">😊</span><span class="mood-label">Happy</span></div>
            <div class="mood-btn" onclick="selectMood(this,'Calm','😌')"><span class="mood-emoji">😌</span><span class="mood-label">Calm</span></div>
            <div class="mood-btn" onclick="selectMood(this,'Neutral','😐')"><span class="mood-emoji">😐</span><span class="mood-label">Neutral</span></div>
            <div class="mood-btn" onclick="selectMood(this,'Sad','😢')"><span class="mood-emoji">😢</span><span class="mood-label">Sad</span></div>
            <div class="mood-btn" onclick="selectMood(this,'Anxious','😰')"><span class="mood-emoji">😰</span><span class="mood-label">Anxious</span></div>
            <div class="mood-btn" onclick="selectMood(this,'Stressed','😤')"><span class="mood-emoji">😤</span><span class="mood-label">Stressed</span></div>
          </div>
        </div>
        <div class="card mb-20">
          <div class="card-title">Intensity (1–10)</div>
          <div class="slider-row">
            <span class="slider-label">Mild</span>
            <input type="range" class="styled-slider" id="moodIntensity" min="1" max="10" value="5" oninput="document.getElementById('intensityVal').textContent=this.value" />
            <span class="slider-label">Intense</span>
            <span class="slider-val" id="intensityVal">5</span>
          </div>
        </div>
        <div class="card mb-20">
          <div class="card-title">Add a Note <span style="font-weight:400;color:var(--text3)">(Optional)</span></div>
          <textarea class="journal-textarea" id="moodNote" placeholder="What's contributing to this mood? Any triggers or thoughts..."></textarea>
        </div>
        <button class="btn-primary full-width" onclick="saveMood()">Save Today's Mood</button>
      </section>

      <!-- ── QUESTIONNAIRE ── -->
      <section class="page" id="page-questionnaire">
        <div class="page-header">
          <div>
            <h1 class="page-title">Mental Health Assessment</h1>
            <p class="page-subtitle">Answer honestly — all data is private and encrypted</p>
          </div>
        </div>
        <div id="questionnaireContent"></div>
      </section>

      <!-- ── TRENDS ── -->
      <section class="page" id="page-trends">
        <div class="page-header">
          <div>
            <h1 class="page-title">Emotion Trends</h1>
            <p class="page-subtitle">Your emotional history visualized over time</p>
          </div>
        </div>
        <div class="grid-2 mb-20">
          <div class="card">
            <div class="card-title">30-Day Wellness Score</div>
            <div class="chart-wrap"><canvas id="wellnessChart"></canvas></div>
          </div>
          <div class="card">
            <div class="card-title">Mood Distribution</div>
            <div class="chart-wrap" style="height:200px"><canvas id="moodDistChart"></canvas></div>
          </div>
        </div>
        <div class="card mb-20">
          <div class="card-title">Anxiety &amp; Sadness Levels (14 Days)</div>
          <div class="chart-wrap" style="height:240px"><canvas id="anxietySadnessChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-title">Assessment History</div>
          <table class="data-table">
            <thead><tr><th>Date</th><th>Wellness</th><th>Anxiety</th><th>Sadness</th><th>Risk</th></tr></thead>
            <tbody>
              <tr><td>Mar 28, 2025</td><td>72</td><td>Moderate</td><td>Low</td><td><span class="badge badge-warn">Moderate</span></td></tr>
              <tr><td>Mar 21, 2025</td><td>68</td><td>High</td><td>Moderate</td><td><span class="badge badge-danger">High</span></td></tr>
              <tr><td>Mar 14, 2025</td><td>81</td><td>Low</td><td>Low</td><td><span class="badge badge-good">Low</span></td></tr>
              <tr><td>Mar 7, 2025</td><td>75</td><td>Moderate</td><td>Low</td><td><span class="badge badge-warn">Moderate</span></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ── JOURNAL ── -->
      <section class="page" id="page-journal">
        <div class="page-header">
          <div>
            <h1 class="page-title">Daily Journal</h1>
            <p class="page-subtitle">Express your thoughts freely — this space is yours</p>
          </div>
        </div>
        <div class="card mb-20">
          <div class="card-title">New Entry — <span id="journalDate" style="font-weight:500;color:var(--accent)"></span></div>
          <textarea class="journal-textarea" id="journalInput" placeholder="Write about your day, feelings, thoughts, or anything on your mind. This is your safe space..."></textarea>
          <div class="journal-controls">
            <select class="form-input journal-mood-select" id="journalMood">
              <option>Happy 😊</option><option>Calm 😌</option><option>Neutral 😐</option>
              <option selected>Anxious 😰</option><option>Sad 😢</option><option>Stressed 😤</option>
            </select>
            <button class="btn-accent" onclick="saveJournal()">Save Entry</button>
          </div>
        </div>
        <h3 class="section-label">Previous Entries</h3>
        <div id="journalEntries">
          <div class="journal-entry">
            <div class="journal-entry-header">
              <div class="journal-date">📅 March 27, 2025 · 9:14 PM</div>
              <span class="badge badge-warn">Anxious 😰</span>
            </div>
            <p class="journal-text">Had a difficult day at work. My mind kept racing about the upcoming presentation. I tried the breathing exercise from the app and it helped a little. Need to focus on sleep tonight and not overthink things.</p>
          </div>
          <div class="journal-entry">
            <div class="journal-entry-header">
              <div class="journal-date">📅 March 26, 2025 · 8:30 PM</div>
              <span class="badge badge-good">Happy 😊</span>
            </div>
            <p class="journal-text">Great day today! Met with friends and spent time outdoors. Felt genuinely good for the first time in a while. The sunshine really helped lift my mood. Grateful for small moments of joy.</p>
          </div>
        </div>
      </section>

      <!-- ── HABITS ── -->
      <section class="page" id="page-habits">
        <div class="page-header">
          <div>
            <h1 class="page-title">Habit Tracker</h1>
            <p class="page-subtitle">Small habits, big results</p>
          </div>
        </div>
        <div class="card mb-20">
          <div class="card-title">Today's Habits</div>
          <div id="habitsList">
            <div class="habit-item">
              <div class="habit-icon">🌙</div>
              <div class="habit-info">
                <div class="habit-name">Sleep Hours</div>
                <input type="range" class="styled-slider" min="0" max="12" value="6" step="0.5" oninput="updateHabit(this,'sleepVal','h',8)" />
              </div>
              <div class="habit-value" id="sleepVal">6h</div>
            </div>
            <div class="habit-item">
              <div class="habit-icon">💧</div>
              <div class="habit-info">
                <div class="habit-name">Water Intake</div>
                <input type="range" class="styled-slider" min="0" max="12" value="5" oninput="updateHabit(this,'waterVal',' glasses',8)" />
              </div>
              <div class="habit-value" id="waterVal">5 glasses</div>
            </div>
            <div class="habit-item">
              <div class="habit-icon">🏃</div>
              <div class="habit-info">
                <div class="habit-name">Exercise (min)</div>
                <input type="range" class="styled-slider" min="0" max="120" value="30" step="5" oninput="updateHabit(this,'exVal',' min',60)" />
              </div>
              <div class="habit-value" id="exVal">30 min</div>
            </div>
            <div class="habit-item">
              <div class="habit-icon">📱</div>
              <div class="habit-info">
                <div class="habit-name">Screen Time (hours)</div>
                <input type="range" class="styled-slider" min="0" max="12" value="7" oninput="updateHabit(this,'screenVal','h',4)" />
              </div>
              <div class="habit-value" id="screenVal">7h</div>
            </div>
            <div class="habit-item">
              <div class="habit-icon">🧘</div>
              <div class="habit-info">
                <div class="habit-name">Meditation (min)</div>
                <input type="range" class="styled-slider" min="0" max="60" value="10" step="5" oninput="updateHabit(this,'medVal',' min',20)" />
              </div>
              <div class="habit-value" id="medVal">10 min</div>
            </div>
          </div>
          <div class="divider"></div>
          <button class="btn-primary full-width" onclick="saveHabits()">Save Today's Habits</button>
        </div>
        <div class="card">
          <div class="card-title">Weekly Habit Overview</div>
          <div class="chart-wrap"><canvas id="habitsChart"></canvas></div>
        </div>
      </section>

      <!-- ── SUGGESTIONS ── -->
      <section class="page" id="page-suggestions">
        <div class="page-header">
          <div>
            <h1 class="page-title">Wellness Suggestions</h1>
            <p class="page-subtitle">Personalized coping strategies just for you</p>
          </div>
        </div>
        <div class="alert-banner alert-info mb-20">
          <span class="alert-icon">💡</span>
          <div><strong>Personalized for You</strong><br>Based on moderate anxiety detected in your recent assessment.</div>
        </div>
        <div class="suggestion-grid mb-24">
          <div class="suggestion-card" onclick="openBreathing()">
            <div class="suggestion-icon">🌬️</div>
            <div class="suggestion-title">Box Breathing</div>
            <p class="suggestion-desc">4-4-4-4 technique to calm anxiety in minutes</p>
            <span class="suggestion-tag">Try Now →</span>
          </div>
          <div class="suggestion-card">
            <div class="suggestion-icon">🧘</div>
            <div class="suggestion-title">Body Scan Meditation</div>
            <p class="suggestion-desc">Progressive relaxation from head to toe</p>
            <span class="suggestion-tag">10 min</span>
          </div>
          <div class="suggestion-card">
            <div class="suggestion-icon">🌿</div>
            <div class="suggestion-title">Nature Walk</div>
            <p class="suggestion-desc">20-min outdoor walk to reset your nervous system</p>
            <span class="suggestion-tag">20 min</span>
          </div>
          <div class="suggestion-card">
            <div class="suggestion-icon">📖</div>
            <div class="suggestion-title">Gratitude Journal</div>
            <p class="suggestion-desc">Write 3 things you're grateful for today</p>
            <span class="suggestion-tag">5 min</span>
          </div>
          <div class="suggestion-card">
            <div class="suggestion-icon">🎵</div>
            <div class="suggestion-title">Calming Music</div>
            <p class="suggestion-desc">Listen to lo-fi or nature sounds for 15 minutes</p>
            <span class="suggestion-tag">15 min</span>
          </div>
          <div class="suggestion-card">
            <div class="suggestion-icon">💬</div>
            <div class="suggestion-title">Talk to Someone</div>
            <p class="suggestion-desc">Share your feelings with a trusted friend or therapist</p>
            <span class="suggestion-tag">Anytime</span>
          </div>
        </div>

        <div class="card" id="breathingCard" style="display:none">
          <div class="card-title">Box Breathing Exercise</div>
          <div class="breathing-wrap">
            <div class="breathing-circle" id="breathingCircle" onclick="startBreathing()">
              <div class="breath-inner">
                <div class="breath-label" id="breathLabel">Tap to Start</div>
                <div class="breath-sub" id="breathSub">4-4-4-4 technique</div>
              </div>
            </div>
          </div>
          <p style="text-align:center;font-size:13px;color:var(--text3)">Inhale 4s → Hold 4s → Exhale 4s → Hold 4s</p>
        </div>

        <div class="card" style="margin-top:20px">
          <div class="card-title">Sleep Hygiene Tips</div>
          <div class="tips-list">
            <div class="tip-item"><span class="tip-icon">💤</span><div><strong>Consistent bedtime</strong><p>Go to bed and wake up at the same time every day</p></div></div>
            <div class="tip-item"><span class="tip-icon">📵</span><div><strong>No screens 1hr before bed</strong><p>Blue light disrupts melatonin production</p></div></div>
            <div class="tip-item"><span class="tip-icon">🌡️</span><div><strong>Cool room temperature</strong><p>Keep bedroom between 65–68°F for optimal sleep</p></div></div>
          </div>
        </div>
      </section>

      <!-- ── ALERTS ── -->
      <section class="page" id="page-alerts">
        <div class="page-header">
          <div>
            <h1 class="page-title">Alerts &amp; Notifications</h1>
            <p class="page-subtitle">Smart wellness alerts based on your patterns</p>
          </div>
        </div>
        <div class="alert-banner alert-danger"><span class="alert-icon">⚠️</span><div><strong>Elevated Stress Pattern</strong><br>Stress has been high for 5 days. Consider a mental health day or speaking with a professional.</div></div>
        <div class="alert-banner alert-warn"><span class="alert-icon">😴</span><div><strong>Sleep Deficit Detected</strong><br>Averaging 6.2 hours this week, below your 8-hour goal. Poor sleep amplifies anxiety.</div></div>
        <div class="alert-banner alert-warn"><span class="alert-icon">💧</span><div><strong>Hydration Reminder</strong><br>Less than 6 glasses for 3 days. Dehydration increases anxiety symptoms.</div></div>
        <div class="alert-banner alert-info"><span class="alert-icon">📋</span><div><strong>Weekly Assessment Due</strong><br>7 days since your last check-up.<br><button class="btn-sm" onclick="showPage('questionnaire')" style="margin-top:8px">Take Assessment →</button></div></div>
        <div class="alert-banner alert-info"><span class="alert-icon">🌅</span><div><strong>Daily Mood Reminder</strong><br>Don't forget to log your mood today!<br><button class="btn-sm" onclick="showPage('mood')" style="margin-top:8px">Log Mood →</button></div></div>
      </section>

      <!-- ── PROFILE ── -->
      <section class="page" id="page-profile">
        <div class="page-header">
          <div>
            <h1 class="page-title">My Profile</h1>
            <p class="page-subtitle">Manage your personal wellness information</p>
          </div>
        </div>
        <div class="profile-header-card">
          <div class="profile-avatar-lg" id="profileAvatarLarge">A</div>
          <div class="profile-header-info">
            <div class="profile-name" id="profileName">Alex Johnson</div>
            <div class="profile-email" id="profileEmail">demo@mindwell.app</div>
            <div class="profile-stats-row">
              <div class="profile-stat"><span class="pstat-val">28</span><span class="pstat-lbl">Days tracked</span></div>
              <div class="profile-stat"><span class="pstat-val">12</span><span class="pstat-lbl">Assessments</span></div>
              <div class="profile-stat"><span class="pstat-val">21</span><span class="pstat-lbl">Journal entries</span></div>
            </div>
          </div>
        </div>
        <div class="grid-2">
          <div class="card">
            <div class="card-title">Personal Information</div>
            <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="pName" value="Alex Johnson" /></div>
            <div class="form-group"><label class="form-label">Age</label><input class="form-input" type="number" id="pAge" value="28" /></div>
            <div class="form-group"><label class="form-label">Sleep Goal (hours)</label><input class="form-input" type="number" id="pSleep" value="8" /></div>
            <button class="btn-primary full-width" onclick="saveProfile()">Save Changes</button>
          </div>
          <div class="card">
            <div class="card-title">Preferences</div>
            <div class="form-group"><label class="form-label">Daily Reminder Time</label><input class="form-input" type="time" value="20:00" /></div>
            <div class="form-group"><label class="form-label">Focus Area</label>
              <select class="form-input">
                <option>Anxiety Management</option><option>Sleep Improvement</option>
                <option>Mood Stability</option><option>Stress Reduction</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Theme</label>
              <select class="form-input" onchange="setTheme(this.value)">
                <option value="light">Light</option><option value="dark">Dark</option>
              </select>
            </div>
            <button class="btn-primary full-width" onclick="showToast('✅','Preferences saved!')">Save Preferences</button>
          </div>
        </div>
      </section>

      <!-- ── EMERGENCY ── -->
      <section class="page" id="page-emergency">
        <div class="page-header">
          <div>
            <h1 class="page-title">Crisis Support</h1>
            <p class="page-subtitle">You are not alone. Help is available right now.</p>
          </div>
        </div>
        <div class="emergency-card">
          <div class="emergency-icon">🆘</div>
          <h2 class="emergency-title">You Matter. Help Is Here.</h2>
          <p class="emergency-text">If you're experiencing a mental health crisis or thoughts of self-harm, please reach out immediately.</p>
          <div class="crisis-grid">
            <div class="crisis-item"><span class="crisis-icon">📞</span><div><strong>iCall — India</strong><span>9152987821 · Free counseling</span></div></div>
            <div class="crisis-item"><span class="crisis-icon">💬</span><div><strong>Vandrevala Foundation</strong><span>1860-2662-345 · 24/7 helpline</span></div></div>
            <div class="crisis-item"><span class="crisis-icon">🌍</span><div><strong>International Resources</strong><span>findahelpline.com</span></div></div>
            <div class="crisis-item"><span class="crisis-icon">🏥</span><div><strong>Emergency Services</strong><span>Call 112 immediately</span></div></div>
          </div>
        </div>
        <div class="suggestion-grid" style="margin-top:24px">
          <div class="suggestion-card" onclick="openBreathing();showPage('suggestions')"><div class="suggestion-icon">🌬️</div><div class="suggestion-title">Breathe with Me</div><p class="suggestion-desc">Start guided breathing right now</p></div>
          <div class="suggestion-card" onclick="showPage('journal')"><div class="suggestion-icon">✍️</div><div class="suggestion-title">Write it Out</div><p class="suggestion-desc">Express your feelings privately</p></div>
          <div class="suggestion-card" onclick="showPage('questionnaire')"><div class="suggestion-icon">📋</div><div class="suggestion-title">Take Assessment</div><p class="suggestion-desc">Understand what you're feeling</p></div>
        </div>
      </section>

    </main>
  </div>
</div>

<!-- TOAST CONTAINER -->
<div class="toast-container" id="toastContainer"></div>

`;
