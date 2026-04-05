import type { Metadata } from "next";
import { DashboardPageContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Sign Out | MindWell",
};

export default function SignOutPage() {
  return <DashboardPageContent slug="sign-out" />;
}
