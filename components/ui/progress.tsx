import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName,
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
}) {
  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={value}
      className={cn("sidebar-score-bar", className)}
      role="progressbar"
    >
      <div
        className={cn("sidebar-score-fill", indicatorClassName)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
