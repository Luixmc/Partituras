"use client";

import { useEffect } from "react";

// Registra el service worker para que la app sea instalable (PWA) y funcione
// mejor offline. No renderiza nada.
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // evita cachear en dev

    // La dirección lleva el id de ESTE despliegue. Al cambiar, el navegador
    // instala el service worker nuevo y su `activate` borra el caché anterior.
    // Con `/sw.js` a secas la dirección no cambiaba nunca y el caché viejo
    // sobrevivía a todos los despliegues.
    const version = process.env.NEXT_PUBLIC_BUILD_ID || "dev";
    const register = () => {
      navigator.serviceWorker.register(`/sw.js?v=${version}`).catch(() => {
        /* ignoramos errores de registro */
      });
    };
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
