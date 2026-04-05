import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "good" | "warn" | "danger" | "info" | "purple";

export function Badge({
  className,
  variant = "info",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn("badge", `badge-${variant}`, className)} {...props} />;
}
