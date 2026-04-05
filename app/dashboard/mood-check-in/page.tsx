import type { Metadata } from "next";
import { DashboardPageContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Mood Check-In | MindWell",
};

export default function MoodCheckInPage() {
  return <DashboardPageContent slug="mood-check-in" />;
}
