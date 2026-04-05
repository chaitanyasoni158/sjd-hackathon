import type { Metadata } from "next";
import { DashboardPageContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Journal | MindWell",
};

export default function JournalPage() {
  return <DashboardPageContent slug="journal" />;
}
