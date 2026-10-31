"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={(e) => toggleTheme(e)}
      aria-label="Toggle Dark/Light Mode"
      className="inline-flex items-center justify-center p-2 rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring shadow-2xs"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-primary transition-transform duration-300 rotate-0 hover:scale-110" />
      ) : (
        <Moon className="w-4 h-4 text-foreground transition-transform duration-300 rotate-0 hover:scale-110" />
      )}
    </button>
  );
}
