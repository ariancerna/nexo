"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registerWorker = async () => {
      try {
        if (process.env.NODE_ENV === "development") {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));

          if ("caches" in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.filter((name) => name.startsWith("nexo-")).map((name) => caches.delete(name)));
          }

          return;
        }

        await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
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
