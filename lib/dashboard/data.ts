import { createClient } from "@/lib/supabase/server";

type DashboardUser = {
  id: string;
  email: string | null;
  fullName: string;
};

export type ProfileRecord = {
  user_id: string;
  full_name: string;
  age: number | null;
  sleep_goal_hours: number | null;
  created_at: string;
  updated_at: string;
};

export type PreferenceRecord = {
  user_id: string;
  daily_reminder_time: string | null;
  focus_area: string | null;
  theme: "light" | "dark";
  created_at: string;
  updated_at: string;
};

export type MoodCheckInRecord = {
  id: string;
  mood: string;
  intensity: number;
  note: string | null;
  checked_in_at: string;
  created_at: string;
};

export type JournalEntryRecord = {
  id: string;
  title: string | null;
  body: string;
  mood: string | null;
  created_at: string;
  updated_at: string;
};

export type HabitLogRecord = {
  id: string;
  log_date: string;
  habit_type: string;
  value_numeric: number | null;
  value_text: string | null;
  unit: string | null;
  target_value: number | null;
  progress_percent: number | null;
  created_at: string;
  updated_at: string;
};

export type AssessmentSubmissionRecord = {
  id: string;
  submitted_at: string;
  wellness_score: number;
  anxiety_level: string;
  sadness_level: string;
  risk_level: string;
  summary_text: string | null;
  created_at: string;
};

export type AssessmentAnswerRecord = {
  id: string;
  submission_id: string;
  question_order: number;
  question_text: string;
  selected_option_text: string;
  selected_option_score: number | null;
  created_at: string;
};

export type UserAlertRecord = {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  triggered_at: string;
  expires_at: string | null;
  created_at: string;
};

export type DashboardData = {
  user: DashboardUser;
  profile: ProfileRecord | null;
  preferences: PreferenceRecord | null;
  moodCheckIns: MoodCheckInRecord[];
  journalEntries: JournalEntryRecord[];
  habitLogs: HabitLogRecord[];
  assessmentSubmissions: AssessmentSubmissionRecord[];
  latestAssessmentAnswers: AssessmentAnswerRecord[];
  alerts: UserAlertRecord[];
  unreadAlertsCount: number;
};

export type DashboardShellData = {
  user: DashboardUser;
  profile: ProfileRecord | null;
  preferences: PreferenceRecord | null;
  latestAssessment: AssessmentSubmissionRecord | null;
  unreadAlertsCount: number;
};

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

function getUserDisplayName(user: {
  email?: string | null;
  user_metadata?: { full_name?: string | null };
}) {
  const metadataName = user.user_metadata?.full_name?.trim();

  if (metadataName) {
    return metadataName;
  }

  const emailPrefix = user.email?.split("@")[0]?.trim();
  if (emailPrefix) {
    return emailPrefix.replace(/[._-]+/g, " ");
  }

  return "MindCare Member";
}

export async function ensureDashboardRecords(
  supabase: SupabaseClient,
  user: {
    id: string;
    email?: string | null;
    user_metadata?: { full_name?: string | null };
  },
) {
  const fullName = getUserDisplayName(user);

  await Promise.all([
    supabase.from("profiles").upsert(
      {
        user_id: user.id,
        full_name: fullName,
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true,
      },
    ),
    supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true,
      },
    ),
  ]);
}

function normalizeUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: { full_name?: string | null };
}): DashboardUser {
  return {
    id: user.id,
    email: user.email ?? null,
    fullName: getUserDisplayName(user),
  };
}

export async function getCurrentShellData(): Promise<DashboardShellData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  await ensureDashboardRecords(supabase, user);

  const [{ data: profile }, { data: preferences }, { data: latestAssessment }, { count }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("assessment_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("user_alerts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false),
    ]);

  return {
    user: normalizeUser(user),
    profile,
    preferences,
    latestAssessment,
    unreadAlertsCount: count ?? 0,
  };
}

export async function getCurrentDashboardData(): Promise<DashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  await ensureDashboardRecords(supabase, user);

  const [
    { data: profile },
    { data: preferences },
    { data: moodCheckIns },
    { data: journalEntries },
    { data: habitLogs },
    { data: assessmentSubmissions },
    { data: alerts },
    { count },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("mood_check_ins")
      .select("*")
      .eq("user_id", user.id)
      .order("checked_in_at", { ascending: false })
      .limit(14),
    supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(40),
    supabase
      .from("assessment_submissions")
      .select("*")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(12),
    supabase
      .from("user_alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("triggered_at", { ascending: false })
      .limit(10),
    supabase
      .from("user_alerts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),
  ]);

  const latestSubmissionId = assessmentSubmissions?.[0]?.id;
  const latestAssessmentAnswers = latestSubmissionId
    ? (
        await supabase
          .from("assessment_answers")
          .select("*")
          .eq("submission_id", latestSubmissionId)
          .order("question_order", { ascending: true })
      ).data ?? []
    : [];

  return {
    user: normalizeUser(user),
    profile,
    preferences,
    moodCheckIns: moodCheckIns ?? [],
    journalEntries: journalEntries ?? [],
    habitLogs: habitLogs ?? [],
    assessmentSubmissions: assessmentSubmissions ?? [],
    latestAssessmentAnswers,
    alerts: alerts ?? [],
    unreadAlertsCount: count ?? 0,
  };
}
