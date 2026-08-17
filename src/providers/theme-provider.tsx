"use client";

import { useEffect, type ReactNode } from "react";

import { APP_CONFIG } from "@/config/app";

type StoredTheme = "light" | "dark" | "system";

function isStoredTheme(value: string | null): value is StoredTheme {
  return value === "light" || value === "dark" || value === "system";
}

function applyTheme(theme: StoredTheme, prefersDark: boolean) {
  const useDarkTheme = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", useDarkTheme);
  document.documentElement.style.colorScheme = useDarkTheme ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const storedTheme = window.localStorage.getItem(APP_CONFIG.themeStorageKey);
    const theme = isStoredTheme(storedTheme) ? storedTheme : "system";
    const updateTheme = () => applyTheme(theme, mediaQuery.matches);

    updateTheme();
    mediaQuery.addEventListener("change", updateTheme);
    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, []);

  return children;
}
