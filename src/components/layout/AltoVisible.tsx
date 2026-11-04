"use client";

import { useEffect } from "react";

// Mide el alto VISIBLE de la pantalla para `.alto-pantalla` (globals.css), solo
// en los navegadores que no conocen `dvh` (O-102). En los demás no hace nada:
// allí manda `100dvh`, que ya sigue a la barra de direcciones solo.
//
// `innerHeight` y no `100vh`: en un teléfono viejo `100vh` es el alto con la
// barra de direcciones ESCONDIDA, así que con ella a la vista la barra de
// Culto/Catálogo quedaría debajo, fuera de la pantalla.
export default function AltoVisible() {
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports?.("height", "100dvh")) return;
    const medir = () =>
      document.documentElement.style.setProperty("--alto-visible", `${window.innerHeight}px`);
    medir();
    window.addEventListener("resize", medir);
    window.addEventListener("orientationchange", medir);
    return () => {
      window.removeEventListener("resize", medir);
      window.removeEventListener("orientationchange", medir);
    };
  }, []);
  return null;
}
