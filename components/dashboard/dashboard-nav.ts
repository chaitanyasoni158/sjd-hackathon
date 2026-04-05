export type DashboardSlug =
  | "dashboard"
  | "mood-check-in"
  | "assessment"
  | "trends"
  | "journal"
  | "habit-tracker"
  | "suggestions"
  | "alerts"
  | "profile"
  | "crisis-support"
  | "sign-out";

type NavItem = {
  slug: DashboardSlug;
  href: string;
  label: string;
  icon: string;
  badge?: string;
  className?: string;
};

export const dashboardNavSections: Array<{
  label: string;
  items: NavItem[];
}> = [
  {
    label: "Main",
    items: [
      { slug: "dashboard", href: "/dashboard", label: "Dashboard", icon: "📊" },
      {
        slug: "mood-check-in",
        href: "/dashboard/mood-check-in",
        label: "Mood Check-In",
        icon: "😊",
      },
      {
        slug: "assessment",
        href: "/dashboard/assessment",
        label: "Assessment",
        icon: "📋",
      },
      { slug: "trends", href: "/dashboard/trends", label: "Trends", icon: "📈" },
    ],
  },
  {
    label: "Wellness",
    items: [
      { slug: "journal", href: "/dashboard/journal", label: "Journal", icon: "📓" },
      {
        slug: "habit-tracker",
        href: "/dashboard/habit-tracker",
        label: "Habit Tracker",
        icon: "✅",
      },
      {
        slug: "suggestions",
        href: "/dashboard/suggestions",
        label: "Suggestions",
        icon: "💡",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        slug: "alerts",
        href: "/dashboard/alerts",
        label: "Alerts",
        icon: "🔔",
      },
      { slug: "profile", href: "/dashboard/profile", label: "Profile", icon: "👤" },
      {
        slug: "crisis-support",
        href: "/dashboard/crisis-support",
        label: "Crisis Support",
        icon: "🆘",
        className: "nav-crisis",
      },
      {
        slug: "sign-out",
        href: "/dashboard/sign-out",
        label: "Sign Out",
        icon: "🚪",
        className: "nav-logout",
      },
    ],
  },
];

export function isDashboardSlug(slug: string): slug is DashboardSlug {
  return dashboardNavSections
    .flatMap((section) => section.items)
    .some((item) => item.slug === slug);
}
