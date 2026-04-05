import Link from "next/link";
import { redirect } from "next/navigation";
import {
  saveAssessmentSubmission,
  saveHabitLogs,
  saveJournalEntry,
  saveMoodCheckIn,
  savePreferences,
  saveProfile,
  signOutUser,
} from "@/actions/dashboard-actions";
import type { DashboardSlug } from "@/components/dashboard/dashboard-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  type AssessmentSubmissionRecord,
  type DashboardData,
  type HabitLogRecord,
  type MoodCheckInRecord,
  getCurrentDashboardData,
} from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

const moodOptions = [
  { value: "Happy", emoji: "😊", score: 9, badge: "good" as const },
  { value: "Calm", emoji: "😌", score: 8, badge: "good" as const },
  { value: "Neutral", emoji: "😐", score: 5, badge: "info" as const },
  { value: "Sad", emoji: "😢", score: 3, badge: "warn" as const },
  { value: "Anxious", emoji: "😰", score: 2, badge: "warn" as const },
  { value: "Stressed", emoji: "😤", score: 1, badge: "danger" as const },
];

const assessmentQuestions = [
  {
    name: "question_1",
    label: "How often have you felt overwhelmed by daily responsibilities?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
  },
  {
    name: "question_2",
    label: "How difficult has it been to quiet anxious thoughts at night?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
  },
  {
    name: "question_3",
    label: "How often have you felt down, low-energy, or disconnected?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
  },
  {
    name: "question_4",
    label: "How supported and able to cope have you felt this week?",
    options: ["Strong", "Fair", "Fragile", "Overwhelmed"],
  },
];

const profileFocusAreas = [
  "Anxiety Management",
  "Sleep Improvement",
  "Mood Stability",
  "Stress Reduction",
];

const trackedHabits = [
  { key: "sleep_hours", icon: "🌙", label: "Sleep Hours", unit: "h", defaultTarget: 8 },
  { key: "water_intake", icon: "💧", label: "Water Intake", unit: "glasses", defaultTarget: 8 },
  { key: "exercise_minutes", icon: "🏃", label: "Exercise", unit: "min", defaultTarget: 30 },
  { key: "screen_time_hours", icon: "📱", label: "Screen Time", unit: "h", defaultTarget: 4 },
  { key: "meditation_minutes", icon: "🧘", label: "Meditation", unit: "min", defaultTarget: 15 },
];

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatDateTime(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function formatTime(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function formatNumber(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value);
}

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getMoodMeta(mood: string | null | undefined) {
  return moodOptions.find((option) => option.value === mood) ?? moodOptions[2];
}

function getBadgeVariant(value: string | null | undefined) {
  const normalized = value?.toLowerCase();

  if (normalized === "high") {
    return "danger" as const;
  }

  if (normalized === "moderate") {
    return "warn" as const;
  }

  if (normalized === "low") {
    return "good" as const;
  }

  return "info" as const;
}

function getAlertVariant(value: string | null | undefined) {
  const normalized = value?.toLowerCase();

  if (normalized === "high" || normalized === "critical") {
    return "alert-danger";
  }

  if (normalized === "moderate" || normalized === "medium") {
    return "alert-warn";
  }

  return "alert-info";
}

function scoreMood(checkIn: MoodCheckInRecord) {
  return getMoodMeta(checkIn.mood).score;
}

function calculateMoodStreak(moodCheckIns: MoodCheckInRecord[]) {
  const uniqueDays = Array.from(
    new Set(moodCheckIns.map((entry) => new Date(entry.checked_in_at).toISOString().slice(0, 10))),
  );

  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!uniqueDays.includes(key)) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getLatestHabitValue(habitLogs: HabitLogRecord[], habitType: string) {
  return habitLogs.find((entry) => entry.habit_type === habitType) ?? null;
}

function getAverageHabitValue(habitLogs: HabitLogRecord[], habitType: string, days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);

  const values = habitLogs
    .filter(
      (entry) =>
        entry.habit_type === habitType &&
        entry.value_numeric !== null &&
        new Date(entry.log_date) >= cutoff,
    )
    .map((entry) => Number(entry.value_numeric));

  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getRecentMoodSeries(moodCheckIns: MoodCheckInRecord[], days: number) {
  const end = new Date();
  const items = Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (days - index - 1));
    const key = date.toISOString().slice(0, 10);
    const entry = moodCheckIns.find((item) => item.checked_in_at.slice(0, 10) === key);
    return {
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      value: entry ? scoreMood(entry) : 0,
    };
  });

  return items;
}

function getAssessmentSeries(submissions: AssessmentSubmissionRecord[]) {
  return submissions
    .slice(0, 8)
    .map((submission) => ({
      label: new Intl.DateTimeFormat("en-US", { month: "numeric", day: "numeric" }).format(
        new Date(submission.submitted_at),
      ),
      value: submission.wellness_score,
      anxiety: submission.anxiety_level,
      sadness: submission.sadness_level,
      risk: submission.risk_level,
    }))
    .reverse();
}

function getMoodDistribution(moodCheckIns: MoodCheckInRecord[]) {
  const counts = moodOptions.map((option) => ({
    label: option.value,
    color:
      option.value === "Happy"
        ? "#2d65ff"
        : option.value === "Calm"
          ? "#14b8a6"
          : option.value === "Neutral"
            ? "#64748b"
            : option.value === "Sad"
              ? "#8b5cf6"
              : option.value === "Anxious"
                ? "#f59e0b"
                : "#ef4444",
    count: moodCheckIns.filter((entry) => entry.mood === option.value).length,
  })).filter((item) => item.count > 0);

  const total = counts.reduce((sum, item) => sum + item.count, 0);
  return { total, counts };
}

function getLatestInsight(data: DashboardData) {
  const alert = data.alerts.find((item) => !item.expires_at || new Date(item.expires_at) > new Date());
  if (alert) {
    return {
      title: alert.title,
      body: alert.message,
      href: alert.action_url ?? "/dashboard/alerts",
      cta: "Open alert",
    };
  }

  const sleepAverage = getAverageHabitValue(data.habitLogs, "sleep_hours", 7);
  const sleepGoal = data.profile?.sleep_goal_hours ?? 8;

  if (sleepAverage !== null && sleepAverage < sleepGoal) {
    return {
      title: "Sleep is trending below goal",
      body: `You are averaging ${formatNumber(sleepAverage)} hours against a ${formatNumber(sleepGoal)} hour goal.`,
      href: "/dashboard/habit-tracker",
      cta: "Review habits",
    };
  }

  if (data.assessmentSubmissions[0]) {
    return {
      title: "Latest assessment is ready",
      body: data.assessmentSubmissions[0].summary_text ?? "Your most recent assessment is available to review.",
      href: "/dashboard/assessment",
      cta: "Review assessment",
    };
  }

  return {
    title: "Start building your baseline",
    body: "Log a mood check-in or complete a quick assessment so the dashboard can begin spotting patterns.",
    href: "/dashboard/mood-check-in",
    cta: "Log mood",
  };
}

function getSuggestionCards(data: DashboardData) {
  const latestAssessment = data.assessmentSubmissions[0];
  const sleepAverage = getAverageHabitValue(data.habitLogs, "sleep_hours", 7);
  const moodAverage = (() => {
    const moods = data.moodCheckIns.slice(0, 5);
    if (moods.length === 0) {
      return null;
    }
    return moods.reduce((sum, mood) => sum + scoreMood(mood), 0) / moods.length;
  })();

  const cards = [
    {
      icon: "🌬️",
      title: "Box Breathing",
      description: "A fast reset when your body feels tense or your thoughts are spiraling.",
      tag: "4 minutes",
    },
    {
      icon: "✍️",
      title: "Reflect in Your Journal",
      description: "Turning the day into words can lower mental load and make patterns easier to spot.",
      tag: "5 minutes",
    },
    {
      icon: "🌙",
      title: "Protect Tonight's Sleep",
      description: "Reduce stimulation before bed so recovery does not keep slipping.",
      tag: "Evening focus",
    },
  ];

  if (latestAssessment?.anxiety_level.toLowerCase() === "high") {
    cards[0] = {
      icon: "🧘",
      title: "Body Scan Reset",
      description: "Ground physical tension first, then return to the task that feels heavy.",
      tag: "10 minutes",
    };
  }

  if (sleepAverage !== null && sleepAverage < (data.profile?.sleep_goal_hours ?? 8)) {
    cards[2] = {
      icon: "📵",
      title: "Screen-Light Wind Down",
      description: "Shorten screen time tonight to help your sleep duration recover.",
      tag: "Tonight",
    };
  }

  if (moodAverage !== null && moodAverage >= 7) {
    cards[1] = {
      icon: "🌿",
      title: "Keep Momentum Going",
      description: "Capture what is helping lately so you can repeat it on more difficult days.",
      tag: "2 minutes",
    };
  }

  return cards;
}

function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function EmptyState({
  title,
  description,
  href,
  label,
}: {
  title: string;
  description: string;
  href?: string;
  label?: string;
}) {
  return (
    <Card>
      <CardContent className="tips-list">
        <div className="tip-item">
          <span className="tip-icon">✨</span>
          <div>
            <strong>{title}</strong>
            <p>{description}</p>
            {href && label ? (
              <div style={{ marginTop: 12 }}>
                <Link className={buttonVariants({ size: "sm" })} href={href}>
                  {label}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MoodLineChart({ data }: { data: ReturnType<typeof getRecentMoodSeries> }) {
  if (data.every((item) => item.value === 0)) {
    return <p className="page-subtitle">No mood check-ins yet for this week.</p>;
  }

  const maxY = 10;
  const width = 620;
  const height = 180;
  const stepX = width / Math.max(1, data.length - 1);
  const points = data.map((item, index) => {
    const x = 20 + index * stepX;
    const y = 20 + (height - (item.value / maxY) * height);
    return { x, y, value: item.value };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]!.x} ${height + 20} L ${points[0]!.x} ${height + 20} Z`;

  return (
    <div className="chart-panel">
      <div className="chart-scale">
        {[10, 8, 6, 4, 2, 0].map((value) => (
          <span key={value}>{value}</span>
        ))}
      </div>
      <div className="line-chart">
        <svg aria-hidden="true" className="line-chart-svg" viewBox="0 0 660 220">
          <path className="chart-area" d={areaPath} />
          <path className="chart-line" d={linePath} />
          {points.map((point) => (
            <circle className="chart-point" cx={point.x} cy={point.y} key={`${point.x}-${point.y}`} r="5.5" />
          ))}
        </svg>
        <div className="chart-labels">
          {data.map((item, index) => (
            <span key={`${item.label}-${index}`}>{item.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnxietyBars({ submissions }: { submissions: AssessmentSubmissionRecord[] }) {
  const values = submissions
    .slice(0, 7)
    .reverse()
    .map((submission) => ({
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
        new Date(submission.submitted_at),
      ),
      value:
        submission.anxiety_level.toLowerCase() === "high"
          ? 9
          : submission.anxiety_level.toLowerCase() === "moderate"
            ? 6
            : 3,
    }));

  if (values.length === 0) {
    return <p className="page-subtitle">Your anxiety trend will appear after your first assessment.</p>;
  }

  return (
    <div className="bar-chart">
      <div className="bar-chart-grid">
        {values.map((item, index) => (
          <div className="bar-chart-col" key={`${item.label}-${index}`}>
            <div className="bar-chart-track">
              <div className="bar-chart-fill" style={{ height: `${item.value * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="chart-labels">
        {values.map((item, index) => (
          <span key={`${item.label}-${index}`}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

function TrendScoreChart({ series }: { series: ReturnType<typeof getAssessmentSeries> }) {
  if (series.length === 0) {
    return <p className="page-subtitle">Complete an assessment to start tracking your score over time.</p>;
  }

  const points = series.map((item, index) => {
    const x = 20 + index * (780 / Math.max(1, series.length - 1));
    const y = 220 - (item.value / 100) * 180;
    return { ...item, x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]!.x} 220 L ${points[0]!.x} 220 Z`;

  return (
    <div className="trend-chart-wrap">
      <div className="trend-score-grid">
        {[100, 80, 60, 40, 20, 0].map((tick) => (
          <div className="trend-score-row" key={tick}>
            <span>{tick}</span>
            <div />
          </div>
        ))}
      </div>
      <svg aria-hidden="true" className="trend-score-svg" viewBox="0 0 820 280">
        <path className="trend-score-area" d={areaPath} />
        <path className="trend-main-line" d={linePath} />
        {points.map((point) => (
          <circle className="trend-score-point" cx={point.x} cy={point.y} key={point.label} r="4" />
        ))}
      </svg>
      <div className="trend-x-axis">
        {series.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

function MoodDonutChart({ moodCheckIns }: { moodCheckIns: MoodCheckInRecord[] }) {
  const distribution = getMoodDistribution(moodCheckIns);

  if (distribution.total === 0) {
    return <p className="page-subtitle">Mood distribution appears after you log a few check-ins.</p>;
  }

  const gradient = distribution.counts
    .reduce<{ segments: string[]; cursor: number }>(
      (state, item) => {
        const start = state.cursor;
        const end = start + (item.count / distribution.total) * 100;

        state.segments.push(`${item.color} ${start}% ${end}%`);
        return {
          segments: state.segments,
          cursor: end,
        };
      },
      { segments: [], cursor: 0 },
    )
    .segments.join(", ");

  return (
    <div className="donut-panel">
      <div className="donut-wrap">
        <div
          aria-hidden="true"
          className="donut-chart"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="donut-chart-inner">
            <strong>{distribution.total}</strong>
            <span>Logs</span>
          </div>
        </div>
      </div>
      <div className="donut-legend">
        {distribution.counts.map((segment) => (
          <div className="donut-legend-item" key={segment.label}>
            <span className="donut-legend-dot" style={{ backgroundColor: segment.color }} />
            <span className="donut-legend-label">{segment.label}</span>
            <span className="donut-legend-value">
              {Math.round((segment.count / distribution.total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardOverview({ data }: { data: DashboardData }) {
  const latestAssessment = data.assessmentSubmissions[0];
  const latestMood = data.moodCheckIns[0];
  const sleepAverage = getAverageHabitValue(data.habitLogs, "sleep_hours", 7);
  const moodStreak = calculateMoodStreak(data.moodCheckIns);
  const recentMoodSeries = getRecentMoodSeries(data.moodCheckIns, 7);
  const insight = getLatestInsight(data);
  const recentJournal = data.journalEntries[0];

  return (
    <section className="page-route">
      <PageHeader
        title={`Welcome back, ${(data.profile?.full_name ?? data.user.fullName).split(" ")[0]} 👋`}
        subtitle="Your dashboard is now reading directly from the wellness tables in Supabase."
        action={
          <Link className={buttonVariants({ variant: "secondary" })} href="/dashboard/mood-check-in">
            Log Today&apos;s Mood
          </Link>
        }
      />

      <div className="alert-banner alert-spotlight mb-20">
        <span className="alert-icon">⚠️</span>
        <div>
          <strong>{insight.title}</strong>
          {insight.body}
          <div style={{ marginTop: 10 }}>
            <Link className="btn-sm" href={insight.href}>
              {insight.cta} →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid-4">
        {[
          {
            icon: "🧠",
            value: latestAssessment?.wellness_score ?? "—",
            label: "Wellness Score",
            change: latestAssessment ? `${latestAssessment.risk_level} risk` : "Take an assessment",
            changeClass: latestAssessment?.risk_level === "Low" ? "positive" : "neutral",
            accent: "#3b82f6",
            background: "rgba(59,130,246,0.15)",
          },
          {
            icon: getMoodMeta(latestMood?.mood).emoji,
            value: latestMood?.mood ?? "—",
            label: "Latest Mood",
            change: latestMood ? `${formatTime(latestMood.checked_in_at)} today` : "Not logged yet",
            changeClass: latestMood ? "positive" : "neutral",
            accent: "#10b981",
            background: "rgba(16,185,129,0.15)",
          },
          {
            icon: "😰",
            value: latestAssessment?.anxiety_level ?? "—",
            label: "Anxiety Level",
            change: latestAssessment ? `Last checked ${formatDate(latestAssessment.submitted_at)}` : "No assessment yet",
            changeClass: latestAssessment?.anxiety_level === "Low" ? "positive" : "neutral",
            accent: "#f59e0b",
            background: "rgba(245,158,11,0.15)",
          },
          {
            icon: "🌙",
            value: sleepAverage !== null ? `${formatNumber(sleepAverage)}h` : "—",
            label: "Avg Sleep",
            change: `${moodStreak} day mood streak`,
            changeClass: sleepAverage !== null && sleepAverage >= (data.profile?.sleep_goal_hours ?? 8) ? "positive" : "negative",
            accent: "#ef4444",
            background: "rgba(239,68,68,0.15)",
          },
        ].map((item) => (
          <Card
            className="stat-card"
            key={item.label}
            style={{ ["--card-accent" as string]: item.accent }}
          >
            <div className="stat-icon" style={{ background: item.background }}>
              {item.icon}
            </div>
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">{item.label}</div>
            <div className={cn("stat-change", item.changeClass)}>{item.change}</div>
          </Card>
        ))}
      </div>

      <div className="grid-2">
        <Card>
          <CardHeader>
            <CardTitle>Wellness Score</CardTitle>
            <Badge variant={getBadgeVariant(latestAssessment?.risk_level)}>
              {latestAssessment?.risk_level ?? "No data"}
            </Badge>
          </CardHeader>
          <CardContent className="wellness-ring-wrap">
            <svg className="ring-svg" viewBox="0 0 140 140">
              <circle className="ring-track" cx="70" cy="70" r="54" />
              <circle
                className="ring-fill"
                cx="70"
                cy="70"
                r="54"
                style={{
                  strokeDashoffset: 339 - ((latestAssessment?.wellness_score ?? 0) / 100) * 339,
                }}
              />
              <text className="ring-value" x="70" y="66">
                {latestAssessment?.wellness_score ?? 0}
              </text>
              <text className="ring-unit" x="70" y="82">
                /100
              </text>
            </svg>
            <div className="ring-info">
              <div className="ring-title">
                {latestAssessment ? `${latestAssessment.risk_level} Wellness` : "No assessment yet"}
              </div>
              <p className="ring-desc">
                {latestAssessment?.summary_text ??
                  "Complete your first assessment to generate a personalized summary."}
              </p>
              <div className={`risk-chip risk-${latestAssessment?.risk_level?.toLowerCase() ?? "moderate"}`}>
                {latestAssessment ? `${latestAssessment.risk_level} Risk` : "No risk score yet"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>This Week&apos;s Mood</CardTitle>
          <MoodLineChart data={recentMoodSeries} />
        </Card>
      </div>

      <div className="grid-2">
        <Card>
          <CardTitle>Anxiety Trend</CardTitle>
          <AnxietyBars submissions={data.assessmentSubmissions} />
        </Card>

        <Card>
          <CardTitle>Recent Activity</CardTitle>
          <div className="activity-list">
            {latestAssessment ? (
              <div className="activity-item">
                <div className="activity-icon" style={{ background: "rgba(59,130,246,0.15)" }}>
                  📋
                </div>
                <div className="activity-info">
                  <div className="activity-name">Assessment Completed</div>
                  <div className="activity-sub">
                    Score {latestAssessment.wellness_score} · {formatDateTime(latestAssessment.submitted_at)}
                  </div>
                </div>
                <Badge variant={getBadgeVariant(latestAssessment.risk_level)}>
                  {latestAssessment.risk_level}
                </Badge>
              </div>
            ) : null}
            {recentJournal ? (
              <div className="activity-item">
                <div className="activity-icon" style={{ background: "rgba(99,102,241,0.15)" }}>
                  📓
                </div>
                <div className="activity-info">
                  <div className="activity-name">{recentJournal.title || "Journal Entry"}</div>
                  <div className="activity-sub">{formatDateTime(recentJournal.created_at)}</div>
                </div>
                <Badge variant="info">Logged</Badge>
              </div>
            ) : null}
            {latestMood ? (
              <div className="activity-item">
                <div className="activity-icon" style={{ background: "rgba(16,185,129,0.15)" }}>
                  {getMoodMeta(latestMood.mood).emoji}
                </div>
                <div className="activity-info">
                  <div className="activity-name">Mood Check-In</div>
                  <div className="activity-sub">
                    {latestMood.mood} at intensity {latestMood.intensity} · {formatDateTime(latestMood.checked_in_at)}
                  </div>
                </div>
                <Badge variant={getMoodMeta(latestMood.mood).badge}>{latestMood.mood}</Badge>
              </div>
            ) : null}
            {!latestAssessment && !recentJournal && !latestMood ? (
              <p className="page-subtitle">No activity yet. Start with a mood check-in or journal entry.</p>
            ) : null}
          </div>
        </Card>
      </div>
    </section>
  );
}

function MoodCheckInPage({ data }: { data: DashboardData }) {
  const latestMood = data.moodCheckIns[0];

  return (
    <section className="page-route">
      <PageHeader
        title="Mood Check-In"
        subtitle="Save a new record to `mood_check_ins` and keep your trend line up to date."
      />
      <form action={saveMoodCheckIn}>
        <Card className="mb-20">
          <CardTitle>Select Your Current Mood</CardTitle>
          <div className="mood-grid">
            {moodOptions.map((option) => (
              <label className={cn("mood-btn", latestMood?.mood === option.value && "selected")} key={option.value}>
                <input defaultChecked={latestMood?.mood === option.value} name="mood" type="radio" value={option.value} />
                <span className="mood-emoji">{option.emoji}</span>
                <span className="mood-label">{option.value}</span>
              </label>
            ))}
          </div>
        </Card>
        <Card className="mb-20">
          <CardTitle>Intensity (1-10)</CardTitle>
          <div className="slider-row">
            <span className="slider-label">Mild</span>
            <input className="styled-slider" defaultValue={latestMood?.intensity ?? 5} max={10} min={1} name="intensity" type="range" />
            <span className="slider-label">Intense</span>
            <span className="slider-val">{latestMood?.intensity ?? 5}</span>
          </div>
        </Card>
        <Card className="mb-20">
          <CardTitle>Add a Note</CardTitle>
          <Textarea defaultValue={latestMood?.note ?? ""} name="note" placeholder="What is contributing to this mood right now?" />
        </Card>
        <button className={buttonVariants({ variant: "default", className: "full-width" })} type="submit">
          Save Mood Check-In
        </button>
      </form>
    </section>
  );
}

function AssessmentPage({ data }: { data: DashboardData }) {
  const latestAssessment = data.assessmentSubmissions[0];

  return (
    <section className="page-route">
      <PageHeader
        title="Mental Health Assessment"
        subtitle="Submitting this form creates a row in `assessment_submissions` plus its matching `assessment_answers`."
      />
      <form action={saveAssessmentSubmission}>
        <div className="question-card">
          <div className="q-progress-wrap">
            <Progress className="q-progress-bar" indicatorClassName="q-progress-fill" value={100} />
            <div className="q-counter">{assessmentQuestions.length} quick questions</div>
          </div>
          {assessmentQuestions.map((question) => (
            <div className="form-group" key={question.name}>
              <label className="form-label">{question.label}</label>
              <select className="form-input" defaultValue={question.options[0]} name={question.name}>
                {question.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          ))}
          <div className="q-nav">
            <Link className={buttonVariants({ variant: "outline" })} href="/dashboard/trends">
              View Trends
            </Link>
            <button className="btn-next" type="submit">
              Save Assessment
            </button>
          </div>
        </div>
      </form>

      <div className="result-card">
        <div className="result-title">Latest Summary</div>
        <p className="result-desc">
          {latestAssessment?.summary_text ??
            "Once you submit your first assessment, the latest summary will appear here."}
        </p>
        <div className="result-tags">
          <Badge variant={getBadgeVariant(latestAssessment?.anxiety_level)}>
            Anxiety: {latestAssessment?.anxiety_level ?? "N/A"}
          </Badge>
          <Badge variant={getBadgeVariant(latestAssessment?.sadness_level)}>
            Sadness: {latestAssessment?.sadness_level ?? "N/A"}
          </Badge>
          <Badge variant={getBadgeVariant(latestAssessment?.risk_level)}>
            Risk: {latestAssessment?.risk_level ?? "N/A"}
          </Badge>
        </div>
        <div className="result-actions">
          <Link className={buttonVariants({ variant: "outline" })} href="/dashboard/trends">
            Review Trends
          </Link>
          <Link className="btn-next" href="/dashboard/suggestions">
            View Suggestions
          </Link>
        </div>
      </div>

      {data.latestAssessmentAnswers.length > 0 ? (
        <Card>
          <CardTitle>Latest Answers</CardTitle>
          <table className="data-table trends-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Answer</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {data.latestAssessmentAnswers.map((answer) => (
                <tr key={answer.id}>
                  <td>{answer.question_text}</td>
                  <td>{answer.selected_option_text}</td>
                  <td>{answer.selected_option_score ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}
    </section>
  );
}

function TrendsPage({ data }: { data: DashboardData }) {
  const scoreSeries = getAssessmentSeries(data.assessmentSubmissions);

  return (
    <section className="page-route">
      <PageHeader
        title="Emotion Trends"
        subtitle="Assessments and mood logs are now powering these views from the database."
      />
      <div className="trends-top-grid mb-20">
        <Card>
          <CardTitle>Wellness Score History</CardTitle>
          <TrendScoreChart series={scoreSeries} />
        </Card>
        <Card>
          <CardTitle>Mood Distribution</CardTitle>
          <MoodDonutChart moodCheckIns={data.moodCheckIns} />
        </Card>
      </div>
      <Card className="mb-20">
        <CardTitle>Recent Mood Trend</CardTitle>
        <MoodLineChart data={getRecentMoodSeries(data.moodCheckIns, 10)} />
      </Card>
      <Card>
        <CardTitle>Assessment History</CardTitle>
        {data.assessmentSubmissions.length === 0 ? (
          <p className="page-subtitle">No assessment submissions yet.</p>
        ) : (
          <table className="data-table trends-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Wellness</th>
                <th>Anxiety</th>
                <th>Sadness</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {data.assessmentSubmissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{formatDate(submission.submitted_at)}</td>
                  <td>{submission.wellness_score}</td>
                  <td>{submission.anxiety_level}</td>
                  <td>{submission.sadness_level}</td>
                  <td>
                    <Badge variant={getBadgeVariant(submission.risk_level)}>{submission.risk_level}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </section>
  );
}

function JournalPage({ data }: { data: DashboardData }) {
  return (
    <section className="page-route">
      <PageHeader
        title="Daily Journal"
        subtitle="Save reflections straight into `journal_entries` and review them below."
      />
      <form action={saveJournalEntry}>
        <Card className="mb-20">
          <CardTitle>New Entry - {formatDate(new Date().toISOString())}</CardTitle>
          <Input name="title" placeholder="Optional title" />
          <Textarea name="body" placeholder="Write about your day, feelings, thoughts, or anything on your mind..." />
          <div className="journal-controls">
            <select className="form-input journal-mood-select" defaultValue="Neutral" name="mood">
              {moodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value} {option.emoji}
                </option>
              ))}
            </select>
            <button className={buttonVariants({ variant: "secondary" })} type="submit">
              Save Entry
            </button>
          </div>
        </Card>
      </form>
      <h3 className="section-label">Previous Entries</h3>
      {data.journalEntries.length === 0 ? (
        <EmptyState
          description="Your saved entries will show up here once you add one."
          href="/dashboard/journal"
          label="Write first entry"
          title="No journal entries yet"
        />
      ) : (
        data.journalEntries.map((entry) => (
          <div className="journal-entry" key={entry.id}>
            <div className="journal-entry-header">
              <div className="journal-date">📅 {formatDateTime(entry.created_at)}</div>
              <Badge variant={getMoodMeta(entry.mood).badge}>
                {entry.mood ?? "Unspecified"} {getMoodMeta(entry.mood).emoji}
              </Badge>
            </div>
            {entry.title ? <strong>{entry.title}</strong> : null}
            <p className="journal-text">{entry.body}</p>
          </div>
        ))
      )}
    </section>
  );
}

function HabitTrackerPage({ data }: { data: DashboardData }) {
  const latestSleepTarget = data.profile?.sleep_goal_hours ?? 8;

  return (
    <section className="page-route">
      <PageHeader
        title="Habit Tracker"
        subtitle="Today&apos;s saves upsert directly into `habit_logs` using the per-day uniqueness from the schema."
      />
      <form action={saveHabitLogs}>
        <input name="log_date" type="hidden" value={new Date().toISOString().slice(0, 10)} />
        <input name="sleep_goal" type="hidden" value={String(latestSleepTarget)} />
        <Card className="mb-20">
          <CardTitle>Today&apos;s Habits</CardTitle>
          {trackedHabits.map((habit) => {
            const entry = getLatestHabitValue(data.habitLogs, habit.key);
            const target = habit.key === "sleep_hours" ? latestSleepTarget : habit.defaultTarget;
            const value = entry?.value_numeric ?? target;
            const progress = entry?.progress_percent ?? Math.min(100, Math.round((Number(value) / target) * 100));
            return (
              <div className="habit-item" key={habit.key}>
                <div className="habit-icon">{habit.icon}</div>
                <div className="habit-info">
                  <div className="habit-name">{habit.label}</div>
                  <Input
                    defaultValue={String(value)}
                    min="0"
                    name={habit.key}
                    step={habit.key.includes("minutes") ? "5" : "0.5"}
                    type="number"
                  />
                  <Progress value={progress} />
                </div>
                <div className="habit-value">
                  {formatNumber(Number(value))} {habit.unit}
                </div>
              </div>
            );
          })}
          <Separator />
          <button className={buttonVariants({ variant: "default", className: "full-width" })} type="submit">
            Save Today&apos;s Habits
          </button>
        </Card>
      </form>
      <Card>
        <CardTitle>Weekly Habit Overview</CardTitle>
        <div className="tips-list">
          {trackedHabits.map((habit) => {
            const average = getAverageHabitValue(data.habitLogs, habit.key, 7);
            const target = habit.key === "sleep_hours" ? latestSleepTarget : habit.defaultTarget;
            return (
              <div className="tip-item" key={habit.key}>
                <span className="tip-icon">{habit.icon}</span>
                <div>
                  <strong>{habit.label}</strong>
                  <p>
                    {average === null
                      ? "No recent logs yet."
                      : `Average ${formatNumber(average)} ${habit.unit} across the last 7 days against a target of ${formatNumber(target)} ${habit.unit}.`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}

function SuggestionsPage({ data }: { data: DashboardData }) {
  const suggestionCards = getSuggestionCards(data);

  return (
    <section className="page-route">
      <PageHeader
        title="Wellness Suggestions"
        subtitle="These recommendations are generated from your latest moods, assessments, sleep, and habits."
      />
      <div className="alert-banner alert-info mb-20">
        <span className="alert-icon">💡</span>
        <div>
          <strong>Personalized for you</strong>
          Suggestions respond to your latest dashboard records instead of prototype placeholder data.
        </div>
      </div>
      <div className="suggestion-grid mb-24">
        {suggestionCards.map((card) => (
          <Card className="suggestion-card" key={card.title}>
            <div className="suggestion-icon">{card.icon}</div>
            <div className="suggestion-title">{card.title}</div>
            <p className="suggestion-desc">{card.description}</p>
            <span className="suggestion-tag">{card.tag}</span>
          </Card>
        ))}
      </div>
      <Card className="mb-20">
        <CardTitle>Suggested Focus Area</CardTitle>
        <div className="tips-list">
          <div className="tip-item">
            <span className="tip-icon">🎯</span>
            <div>
              <strong>{data.preferences?.focus_area ?? "Build a consistent baseline"}</strong>
              <p>
                {data.preferences?.focus_area
                  ? "Your profile preference is shaping which habits and coping tools we highlight first."
                  : "Set a focus area in your profile to steer future suggestions."}
              </p>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <CardTitle>Sleep Hygiene Tips</CardTitle>
        <div className="tips-list">
          <div className="tip-item">
            <span className="tip-icon">💤</span>
            <div>
              <strong>Consistent bedtime</strong>
              <p>Steadier sleep timing makes mood swings and stress spikes easier to manage.</p>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">📵</span>
            <div>
              <strong>Reduce late screen exposure</strong>
              <p>Lower light and stimulation at night so your sleep target is easier to reach.</p>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

function AlertsPage({ data }: { data: DashboardData }) {
  return (
    <section className="page-route">
      <PageHeader
        title="Alerts & Notifications"
        subtitle="This page now renders from `user_alerts` instead of hard-coded prototype warnings."
      />
      {data.alerts.length === 0 ? (
        <EmptyState
          description="Alerts will appear here when your workflow starts creating records in `user_alerts`."
          href="/dashboard/profile"
          label="Set preferences"
          title="No alerts yet"
        />
      ) : (
        data.alerts.map((alert) => (
          <div className={cn("alert-banner", getAlertVariant(alert.severity))} key={alert.id}>
            <span className="alert-icon">{alert.is_read ? "📬" : "🔔"}</span>
            <div>
              <strong>{alert.title}</strong>
              {alert.message}
              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <Badge variant={getBadgeVariant(alert.severity)}>{titleCase(alert.severity)}</Badge>
                <span className="page-subtitle">{formatDateTime(alert.triggered_at)}</span>
              </div>
              {alert.action_url ? (
                <div style={{ marginTop: 8 }}>
                  <Link className={buttonVariants({ size: "sm" })} href={alert.action_url}>
                    Open linked page
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

function ProfilePage({ data }: { data: DashboardData }) {
  const daysTracked = new Set(
    data.moodCheckIns.map((entry) => new Date(entry.checked_in_at).toISOString().slice(0, 10)),
  ).size;

  return (
    <section className="page-route">
      <PageHeader title="My Profile" subtitle="Your profile and preferences are saved in `profiles` and `user_preferences`." />
      <div className="profile-header-card">
        <div className="profile-avatar-lg">
          {(data.profile?.full_name ?? data.user.fullName)
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("")}
        </div>
        <div className="profile-header-info">
          <div className="profile-name">{data.profile?.full_name ?? data.user.fullName}</div>
          <div className="profile-email">{data.user.email ?? "No email available"}</div>
          <div className="profile-stats-row">
            <div className="profile-stat">
              <span className="pstat-val">{daysTracked}</span>
              <span className="pstat-lbl">Days tracked</span>
            </div>
            <div className="profile-stat">
              <span className="pstat-val">{data.assessmentSubmissions.length}</span>
              <span className="pstat-lbl">Assessments</span>
            </div>
            <div className="profile-stat">
              <span className="pstat-val">{data.journalEntries.length}</span>
              <span className="pstat-lbl">Journal entries</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid-2">
        <form action={saveProfile}>
          <Card>
            <CardTitle>Personal Information</CardTitle>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <Input defaultValue={data.profile?.full_name ?? data.user.fullName} name="full_name" />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <Input defaultValue={data.profile?.age ?? ""} name="age" type="number" />
            </div>
            <div className="form-group">
              <label className="form-label">Sleep Goal (hours)</label>
              <Input
                defaultValue={data.profile?.sleep_goal_hours ?? 8}
                name="sleep_goal_hours"
                step="0.5"
                type="number"
              />
            </div>
            <button className={buttonVariants({ variant: "default", className: "full-width" })} type="submit">
              Save Changes
            </button>
          </Card>
        </form>
        <form action={savePreferences}>
          <Card>
            <CardTitle>Preferences</CardTitle>
            <div className="form-group">
              <label className="form-label">Daily Reminder Time</label>
              <Input defaultValue={data.preferences?.daily_reminder_time ?? ""} name="daily_reminder_time" type="time" />
            </div>
            <div className="form-group">
              <label className="form-label">Focus Area</label>
              <select className="form-input" defaultValue={data.preferences?.focus_area ?? profileFocusAreas[0]} name="focus_area">
                {profileFocusAreas.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Theme</label>
              <select className="form-input" defaultValue={data.preferences?.theme ?? "dark"} name="theme">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <button className={buttonVariants({ variant: "default", className: "full-width" })} type="submit">
              Save Preferences
            </button>
          </Card>
        </form>
      </div>
    </section>
  );
}

function CrisisSupportPage() {
  return (
    <section className="page-route">
      <PageHeader title="Crisis Support" subtitle="Immediate support resources are always available, independent of your dashboard data." />
      <div className="emergency-card">
        <div className="emergency-icon">🆘</div>
        <h2 className="emergency-title">You Matter. Help Is Here.</h2>
        <p className="emergency-text">
          If you are in crisis or worried about your immediate safety, please contact emergency or crisis resources right away.
        </p>
        <div className="crisis-grid">
          <div className="crisis-item">
            <span className="crisis-icon">📞</span>
            <div>
              <strong>988 Suicide & Crisis Lifeline</strong>
              <span>Call or text 988 in the U.S.</span>
            </div>
          </div>
          <div className="crisis-item">
            <span className="crisis-icon">💬</span>
            <div>
              <strong>Crisis Text Line</strong>
              <span>Text HOME to 741741</span>
            </div>
          </div>
          <div className="crisis-item">
            <span className="crisis-icon">🌍</span>
            <div>
              <strong>International Resources</strong>
              <span>findahelpline.com</span>
            </div>
          </div>
          <div className="crisis-item">
            <span className="crisis-icon">🚨</span>
            <div>
              <strong>Emergency Services</strong>
              <span>Call 911 if you are in immediate danger</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SignOutPage() {
  return (
    <section className="page-route">
      <PageHeader title="Sign Out" subtitle="This route is now wired to Supabase auth instead of prototype copy." />
      <div className="result-card">
        <div className="result-title">Ready to close your session?</div>
        <p className="result-desc">
          Signing out clears your authenticated Supabase session and sends you back to login.
        </p>
        <div className="result-actions">
          <Link className={buttonVariants({ variant: "outline" })} href="/dashboard">
            Return to Dashboard
          </Link>
          <form action={signOutUser}>
            <button className="btn-next" type="submit">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export async function DashboardPageContent({ slug }: { slug: DashboardSlug }) {
  const data = await getCurrentDashboardData();

  if (!data) {
    redirect("/login");
  }

  switch (slug) {
    case "dashboard":
      return <DashboardOverview data={data} />;
    case "mood-check-in":
      return <MoodCheckInPage data={data} />;
    case "assessment":
      return <AssessmentPage data={data} />;
    case "trends":
      return <TrendsPage data={data} />;
    case "journal":
      return <JournalPage data={data} />;
    case "habit-tracker":
      return <HabitTrackerPage data={data} />;
    case "suggestions":
      return <SuggestionsPage data={data} />;
    case "alerts":
      return <AlertsPage data={data} />;
    case "profile":
      return <ProfilePage data={data} />;
    case "crisis-support":
      return <CrisisSupportPage />;
    case "sign-out":
      return <SignOutPage />;
    default:
      return null;
  }
}
