"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const accentOptions = [
  "indigo",
  "blue",
  "green",
  "emerald",
  "orange",
  "red",
  "pink",
  "custom",
] as const;

export type AccentColor = (typeof accentOptions)[number];

type AccentContextValue = {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
};

const AccentContext = createContext<AccentContextValue | null>(null);
const storageKey = "nexo-accent";

function isAccentColor(value: string | null): value is AccentColor {
  return Boolean(value && accentOptions.includes(value as AccentColor));
}

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<AccentColor>(() => {
    if (typeof window === "undefined") {
      return "indigo";
    }

    const storedAccent = window.localStorage.getItem(storageKey);
    return isAccentColor(storedAccent) ? storedAccent : "indigo";
  });

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);

  const value = useMemo<AccentContextValue>(
    () => ({
      accent,
      setAccent: (nextAccent) => {
        setAccentState(nextAccent);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, nextAccent);
        }
        document.documentElement.dataset.accent = nextAccent;
      },
    }),
    [accent],
  );

  return <AccentContext.Provider value={value}>{children}</AccentContext.Provider>;
}

export function useAccent() {
  const context = useContext(AccentContext);

  if (!context) {
    throw new Error("useAccent debe usarse dentro de AccentProvider.");
  }

  return context;
}
