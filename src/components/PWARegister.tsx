"use client";

import { useEffect } from "react";

// Registra el service worker para que la app sea instalable (PWA) y funcione
// mejor offline. No renderiza nada.
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // evita cachear en dev

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignoramos errores de registro */
      });
    };
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
