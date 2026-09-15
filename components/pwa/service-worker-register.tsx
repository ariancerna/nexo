"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registerWorker = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("No pudimos registrar el service worker de Nexo.", error);
        }
      }
    };

    void registerWorker();
  }, []);

  return null;
}
