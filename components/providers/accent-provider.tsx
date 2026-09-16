"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const accentPalette = [
  { key: "indigo", label: "Índigo", color: "#4f46e5" },
  { key: "blue", label: "Azul", color: "#0284c7" },
  { key: "green", label: "Verde", color: "#16a34a" },
  { key: "emerald", label: "Esmeralda", color: "#059669" },
  { key: "orange", label: "Naranja", color: "#d97706" },
  { key: "red", label: "Rojo", color: "#dc2626" },
  { key: "pink", label: "Rosa", color: "#db2777" },
] as const;

export const accentOptions = accentPalette.map((option) => option.key);

export type AccentColor = (typeof accentPalette)[number]["key"];

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
