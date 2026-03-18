import { cn } from "@/lib/utils";
import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "subtle";
}

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
      variant === "default" && "bg-brand-100 text-brand-700",
      variant === "subtle" && "bg-slate-100 text-slate-700",
      className
    )}
    {...props}
  />
);
