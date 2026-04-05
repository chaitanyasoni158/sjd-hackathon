import type { Metadata } from "next";
import { DashboardPageContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Trends | MindWell",
};

export default function TrendsPage() {
  return <DashboardPageContent slug="trends" />;
}
