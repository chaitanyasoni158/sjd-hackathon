import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentShellData } from "@/lib/dashboard/data";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const shellData = await getCurrentShellData();

  if (!shellData) {
    redirect("/login");
  }

  return (
    <DashboardShell
      fullName={shellData.profile?.full_name ?? shellData.user.fullName}
      theme={shellData.preferences?.theme ?? "dark"}
      unreadAlertsCount={shellData.unreadAlertsCount}
      wellnessScore={shellData.latestAssessment?.wellness_score ?? 0}
    >
      {children}
    </DashboardShell>
  );
}
