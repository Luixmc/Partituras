"use client";

import { useEffect } from "react";

// Registra el service worker: la app se puede instalar y lo guardado se ve SIN
// INTERNET (O-96). No renderiza nada.
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

    // 🔴 L-497: aquí solo se esperaba el `load`, y cuando React monta este
    // componente el `load` YA PASÓ (la página carga antes de que React
    // termine). Un evento que ya ocurrió no vuelve a dispararse, así que el
    // service worker **no se registró en ningún aparato** hasta el 2026-10-22
    // — medido con un perfil limpio: cero registros tras tres visitas.
    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
