import type { Metadata } from "next";
import { DashboardPageContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Crisis Support | MindWell",
};

export default function CrisisSupportPage() {
  return <DashboardPageContent slug="crisis-support" />;
}
