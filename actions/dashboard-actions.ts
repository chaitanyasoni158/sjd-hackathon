"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureDashboardRecords } from "@/lib/dashboard/data";

const DASHBOARD_PATHS = [
  "/dashboard",
  "/dashboard/mood-check-in",
  "/dashboard/assessment",
  "/dashboard/trends",
  "/dashboard/journal",
  "/dashboard/habit-tracker",
  "/dashboard/suggestions",
  "/dashboard/alerts",
  "/dashboard/profile",
  "/dashboard/sign-out",
];

function revalidateDashboard() {
  for (const path of DASHBOARD_PATHS) {
    revalidatePath(path);
  }
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureDashboardRecords(supabase, user);
  return { supabase, user };
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNullableString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getNumber(formData: FormData, key: string) {
  const value = Number(getString(formData, key));
  return Number.isFinite(value) ? value : null;
}

function computeProgressPercent(value: number | null, target: number | null) {
  if (value === null || target === null || target <= 0) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
}

function normalizeLevel(score: number) {
  if (score >= 2.5) {
    return "High";
  }

  if (score >= 1.5) {
    return "Moderate";
  }

  return "Low";
}

function normalizeRisk(score: number) {
  if (score >= 2.5) {
    return "High";
  }

  if (score >= 1.5) {
    return "Moderate";
  }

  return "Low";
}

export async function saveMoodCheckIn(formData: FormData) {
  const { supabase, user } = await requireUser();
  const mood = getString(formData, "mood") || "Neutral";
  const intensity = Math.max(1, Math.min(10, Number(getString(formData, "intensity") || "5")));
  const note = getNullableString(formData, "note");

  await supabase.from("mood_check_ins").insert({
    user_id: user.id,
    mood,
    intensity,
    note,
  });

  revalidateDashboard();
}

export async function saveJournalEntry(formData: FormData) {
  const { supabase, user } = await requireUser();
  const body = getString(formData, "body");

  if (!body) {
    return;
  }

  await supabase.from("journal_entries").insert({
    user_id: user.id,
    title: getNullableString(formData, "title"),
    body,
    mood: getNullableString(formData, "mood"),
  });

  revalidateDashboard();
}

export async function saveHabitLogs(formData: FormData) {
  const { supabase, user } = await requireUser();
  const logDate = getString(formData, "log_date") || new Date().toISOString().slice(0, 10);

  const records = [
    {
      habit_type: "sleep_hours",
      value_numeric: getNumber(formData, "sleep_hours"),
      unit: "hours",
      target_value: getNumber(formData, "sleep_goal"),
    },
    {
      habit_type: "water_intake",
      value_numeric: getNumber(formData, "water_intake"),
      unit: "glasses",
      target_value: 8,
    },
    {
      habit_type: "exercise_minutes",
      value_numeric: getNumber(formData, "exercise_minutes"),
      unit: "min",
      target_value: 30,
    },
    {
      habit_type: "screen_time_hours",
      value_numeric: getNumber(formData, "screen_time_hours"),
      unit: "hours",
      target_value: 4,
    },
    {
      habit_type: "meditation_minutes",
      value_numeric: getNumber(formData, "meditation_minutes"),
      unit: "min",
      target_value: 15,
    },
  ]
    .filter((record) => record.value_numeric !== null)
    .map((record) => ({
      user_id: user.id,
      log_date: logDate,
      habit_type: record.habit_type,
      value_numeric: record.value_numeric,
      value_text: null,
      unit: record.unit,
      target_value: record.target_value,
      progress_percent: computeProgressPercent(record.value_numeric, record.target_value),
    }));

  if (records.length > 0) {
    await supabase.from("habit_logs").upsert(records, {
      onConflict: "user_id,log_date,habit_type",
    });
  }

  revalidateDashboard();
}

export async function saveAssessmentSubmission(formData: FormData) {
  const { supabase, user } = await requireUser();

  const questions = [
    {
      order: 1,
      text: "How often have you felt overwhelmed by daily responsibilities?",
      value: getString(formData, "question_1"),
    },
    {
      order: 2,
      text: "How difficult has it been to quiet anxious thoughts at night?",
      value: getString(formData, "question_2"),
    },
    {
      order: 3,
      text: "How often have you felt down, low-energy, or disconnected?",
      value: getString(formData, "question_3"),
    },
    {
      order: 4,
      text: "How supported and able to cope have you felt this week?",
      value: getString(formData, "question_4"),
    },
  ];

  const scoreMap: Record<string, number> = {
    "Not at all": 0,
    "Several days": 1,
    "More than half the days": 2,
    "Nearly every day": 3,
    Strong: 0,
    Fair: 1,
    Fragile: 2,
    Overwhelmed: 3,
  };

  const scoredAnswers = questions.map((question) => ({
    ...question,
    score: scoreMap[question.value] ?? 0,
  }));

  const anxietyScore = (scoredAnswers[0].score + scoredAnswers[1].score) / 2;
  const sadnessScore = scoredAnswers[2].score;
  const resiliencePenalty = scoredAnswers[3].score;
  const totalScore =
    scoredAnswers[0].score + scoredAnswers[1].score + scoredAnswers[2].score + resiliencePenalty;
  const wellnessScore = Math.max(0, Math.min(100, 100 - totalScore * 8));
  const anxietyLevel = normalizeLevel(anxietyScore);
  const sadnessLevel = normalizeLevel(sadnessScore);
  const riskLevel = normalizeRisk((anxietyScore + sadnessScore + resiliencePenalty) / 3);
  const summaryText = `Recent check-in points to ${anxietyLevel.toLowerCase()} anxiety and ${sadnessLevel.toLowerCase()} sadness. Focus on routines that improve recovery and reduce overwhelm.`;

  const { data: submission } = await supabase
    .from("assessment_submissions")
    .insert({
      user_id: user.id,
      wellness_score: wellnessScore,
      anxiety_level: anxietyLevel,
      sadness_level: sadnessLevel,
      risk_level: riskLevel,
      summary_text: summaryText,
    })
    .select("id")
    .single();

  if (submission) {
    await supabase.from("assessment_answers").insert(
      scoredAnswers.map((answer) => ({
        submission_id: submission.id,
        question_order: answer.order,
        question_text: answer.text,
        selected_option_text: answer.value || "Not answered",
        selected_option_score: answer.score,
      })),
    );
  }

  revalidateDashboard();
}

export async function saveProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  const fullName = getString(formData, "full_name");
  const age = getNumber(formData, "age");
  const sleepGoal = getNumber(formData, "sleep_goal_hours");

  if (!fullName) {
    return;
  }

  await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      full_name: fullName,
      age,
      sleep_goal_hours: sleepGoal,
    },
    { onConflict: "user_id" },
  );

  revalidateDashboard();
}

export async function savePreferences(formData: FormData) {
  const { supabase, user } = await requireUser();

  await supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      daily_reminder_time: getNullableString(formData, "daily_reminder_time"),
      focus_area: getNullableString(formData, "focus_area"),
      theme: getString(formData, "theme") === "light" ? "light" : "dark",
    },
    { onConflict: "user_id" },
  );

  revalidateDashboard();
}

export async function signOutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
