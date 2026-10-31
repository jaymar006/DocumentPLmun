import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "gold";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px]",
          {
            "bg-primary text-primary-foreground hover:opacity-90 shadow-sm":
              variant === "default",
            "bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm":
              variant === "destructive",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground shadow-2xs":
              variant === "outline",
            "bg-secondary text-secondary-foreground hover:opacity-85 shadow-2xs":
              variant === "secondary",
            "hover:bg-accent hover:text-accent-foreground text-foreground":
              variant === "ghost",
            "text-primary underline-offset-4 hover:underline":
              variant === "link",
            "bg-secondary text-secondary-foreground border border-border hover:bg-accent shadow-sm font-semibold":
              variant === "gold",
            "h-10 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-12 rounded-md px-8 text-base font-semibold": size === "lg",
            "h-9 w-9 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
