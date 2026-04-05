import type { Metadata } from "next";
import { DashboardPageContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Habit Tracker | MindWell",
};

export default function HabitTrackerPage() {
  return <DashboardPageContent slug="habit-tracker" />;
}
