import type { Metadata } from "next";
import { DashboardPageContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Suggestions | MindWell",
};

export default function SuggestionsPage() {
  return <DashboardPageContent slug="suggestions" />;
}
