import type { Metadata } from "next";
import { DashboardPageContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Assessment | MindWell",
};

export default function AssessmentPage() {
  return <DashboardPageContent slug="assessment" />;
}
