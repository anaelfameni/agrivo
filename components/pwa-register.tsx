"use client";

import { useEffect } from "react";

/** Enregistre le service worker (PWA). En dev, désenregistre pour ne jamais servir du périmé. */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations?.().then((rs) => rs.forEach((r) => r.unregister()));
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* l'app fonctionne sans PWA */
    });
  }, []);
  return null;
}
