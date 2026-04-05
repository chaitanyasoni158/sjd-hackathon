import type { Metadata } from "next";
import { DashboardPageContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Alerts | MindWell",
};

export default function AlertsPage() {
  return <DashboardPageContent slug="alerts" />;
}
