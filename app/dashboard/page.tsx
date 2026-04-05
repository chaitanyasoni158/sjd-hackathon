import type { Metadata } from "next";
import { DashboardPageContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard | MindWell",
};

export default function DashboardPage() {
  return <DashboardPageContent slug="dashboard" />;
}
