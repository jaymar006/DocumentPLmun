"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { flushSync } from "react-dom";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent<HTMLElement>) => void;
  setTheme: (theme: Theme, e?: React.MouseEvent<HTMLElement>) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_KEY = "plmun_theme_preference";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY) as Theme | null;
      if (stored === "dark" || stored === "light") {
        setThemeState(stored);
        if (stored === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setThemeState("dark");
        document.documentElement.classList.add("dark");
      }
    } catch {
      // ignore
    }
  }, []);

  const applyDomTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_KEY, newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // ignore
    }
  };

  const setTheme = (newTheme: Theme, e?: React.MouseEvent<HTMLElement>) => {
    if (newTheme === theme) return;

    // Determine origin coordinates from the clicked button or mouse position
    let x = typeof window !== "undefined" ? window.innerWidth - 48 : 0;
    let y = 32;

    if (e) {
      if (e.clientX && e.clientY) {
        x = e.clientX;
        y = e.clientY;
      } else if (e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    if (
      typeof window !== "undefined" &&
      doc.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const transition = doc.startViewTransition(() => {
        flushSync(() => {
          applyDomTheme(newTheme);
        });
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 550,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    } else {
      applyDomTheme(newTheme);
    }
  };

  const toggleTheme = (e?: React.MouseEvent<HTMLElement>) => {
    setTheme(theme === "dark" ? "light" : "dark", e);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
