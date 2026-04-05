import type { Metadata } from "next";
import { DashboardPageContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Profile | MindWell",
};

export default function ProfilePage() {
  return <DashboardPageContent slug="profile" />;
}
