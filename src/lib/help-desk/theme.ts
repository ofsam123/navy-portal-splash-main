import { useCallback, useSyncExternalStore } from "react";

export type HelpDeskTheme = "light" | "dark";

const STORAGE_KEY = "dddp-help-theme";

let theme: HelpDeskTheme = "dark";
const listeners = new Set<() => void>();

function readTheme(): HelpDeskTheme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return theme;
}

function setTheme(next: HelpDeskTheme) {
  theme = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, next);
  }
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  theme = readTheme();
}

export function useHelpDeskTheme() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => "dark" as HelpDeskTheme);

  const toggle = useCallback(() => {
    setTheme(current === "light" ? "dark" : "light");
  }, [current]);

  return { theme: current, isDark: current === "dark", toggle };
}
