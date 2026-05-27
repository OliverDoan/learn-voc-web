import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  barClassName?: string;
}

export function Progress({
  value,
  max = 100,
  className,
  barClassName,
  ...props
}: ProgressProps) {
  const pct = max === 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className={cn("h-full bg-primary transition-all", barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
