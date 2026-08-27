"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [theme, setThemeState] = useState<ThemePreference>("system");

  const applyThemeToDOM = (pref: ThemePreference) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    let activeTheme = pref;
    if (pref === "system") {
      activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    if (activeTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userId = (session.user as any).id || session.user.email;
      const cached = localStorage.getItem(`habit_theme_${userId}`) as ThemePreference | null;

      if (cached && ["light", "dark", "system"].includes(cached)) {
        setThemeState(cached);
        applyThemeToDOM(cached);
      }

      // Read authentic user theme setting from Database
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.theme && ["light", "dark", "system"].includes(data.theme)) {
            const dbTheme = data.theme as ThemePreference;
            setThemeState(dbTheme);
            applyThemeToDOM(dbTheme);
            if (userId) {
              localStorage.setItem(`habit_theme_${userId}`, dbTheme);
            }
          }
        })
        .catch(() => {});
    } else if (status === "unauthenticated") {
      // Unauthenticated / Logged Out: reset theme to clean light mode
      setThemeState("light");
      applyThemeToDOM("light");
    }
  }, [status, session]);

  const setTheme = (pref: ThemePreference) => {
    setThemeState(pref);
    applyThemeToDOM(pref);

    if (session?.user) {
      const userId = (session.user as any).id || session.user.email;
      if (userId) {
        localStorage.setItem(`habit_theme_${userId}`, pref);
      }
    }

    // Persist immediately to Database table UserSettings
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: pref }),
    }).catch(() => {});
  };

  const toggleTheme = () => {
    const nextTheme: ThemePreference = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
