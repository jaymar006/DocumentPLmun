import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "approved"
    | "pending"
    | "processing"
    | "rejected"
    | "gold";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground":
            variant === "default",
          "border-border bg-secondary text-secondary-foreground":
            variant === "secondary",
          "border-transparent bg-destructive text-destructive-foreground":
            variant === "destructive",
          "text-foreground border-border bg-background": variant === "outline",
          "border-primary/40 bg-primary/15 text-foreground font-bold":
            variant === "approved",
          "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300":
            variant === "pending",
          "border-blue-500/40 bg-blue-500/15 text-blue-800 dark:text-blue-300":
            variant === "processing",
          "border-destructive/40 bg-destructive/15 text-destructive":
            variant === "rejected",
          "border-border bg-secondary text-secondary-foreground font-bold":
            variant === "gold",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
