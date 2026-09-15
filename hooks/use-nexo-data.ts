"use client";

import { useEffect, useMemo, useState } from "react";

import { defaultNexoData } from "@/lib/nexo/default-data";
import type { NexoData } from "@/types/nexo";

const storageKey = "nexo-workspace-v1";

export function useNexoData() {
  const [data, setData] = useState<NexoData>(defaultNexoData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);

    if (stored) {
      try {
        setData({ ...defaultNexoData, ...JSON.parse(stored) });
      } catch {
        setData(defaultNexoData);
      }
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, ready]);

  const actions = useMemo(
    () => ({
      setData,
      resetData: () => setData(defaultNexoData),
    }),
    [],
  );

  return { data, ready, ...actions };
}
