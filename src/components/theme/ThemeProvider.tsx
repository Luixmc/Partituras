"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Preferencias de lectura compartidas por TODA la aplicación: tema (oscuro/claro)
// y tamaño de letra. Se guardan en localStorage (clave "reading-prefs") y se
// aplican sobre <html> (clase `dark` + font-size raíz) para que afecten a la
// página entera: inicio, catálogo, vista y edición.

type ThemeContextValue = {
  dark: boolean;
  setDark: (v: boolean) => void;
  toggleDark: () => void;
  fontScale: number;
  incFont: () => void;
  decFont: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "reading-prefs";
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.6;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDarkState] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [loaded, setLoaded] = useState(false);

  // Carga inicial de las preferencias guardadas.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const prefs = JSON.parse(saved);
        if (typeof prefs.dark === "boolean") setDarkState(prefs.dark);
        if (typeof prefs.fontScale === "number") setFontScale(prefs.fontScale);
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  // Aplica el tema y el tamaño sobre <html>, y los persiste.
  useEffect(() => {
    if (!loaded) return;
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.fontSize = `${16 * fontScale}px`;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dark, fontScale }));
    } catch {
      /* ignore */
    }
  }, [dark, fontScale, loaded]);

  const value: ThemeContextValue = {
    dark,
    setDark: setDarkState,
    toggleDark: () => setDarkState((d) => !d),
    fontScale,
    incFont: () => setFontScale((s) => Math.min(MAX_SCALE, +(s + 0.1).toFixed(2))),
    decFont: () => setFontScale((s) => Math.max(MIN_SCALE, +(s - 0.1).toFixed(2))),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}
