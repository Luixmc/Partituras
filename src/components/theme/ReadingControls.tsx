"use client";

import { Minus, Plus, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";

// Controles de lectura (tamaño de letra + tema claro/oscuro). Se muestran en la
// barra lateral, en la navegación móvil y donde haga falta. Modifican las
// preferencias globales, así que el cambio afecta a toda la página.

type Props = {
  /** "bar" = pastilla clara (sobre fondo blanco); "dark" = sobre la barra lateral oscura. */
  variant?: "bar" | "dark";
  className?: string;
};

export default function ReadingControls({ variant = "bar", className }: Props) {
  const { dark, toggleDark, fontScale, incFont, decFont } = useTheme();

  const onDark = variant === "dark";
  const btn = onDark
    ? "text-brand-200 hover:bg-brand-900 hover:text-white"
    : "text-slate-500 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white";

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border p-1",
        onDark
          ? "border-brand-900 bg-brand-900/40"
          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800",
        className
      )}
    >
      <button
        type="button"
        onClick={decFont}
        className={cn("inline-flex h-8 w-8 items-center justify-center rounded-md", btn)}
        title="Reducir letra"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className={cn(
          "min-w-[2.5rem] text-center text-xs font-semibold",
          onDark ? "text-brand-100" : "text-slate-600 dark:text-slate-200"
        )}
      >
        {Math.round(fontScale * 100)}%
      </span>
      <button
        type="button"
        onClick={incFont}
        className={cn("inline-flex h-8 w-8 items-center justify-center rounded-md", btn)}
        title="Aumentar letra"
      >
        <Plus className="h-4 w-4" />
      </button>
      <div className={cn("mx-1 h-5 w-px", onDark ? "bg-brand-800" : "bg-slate-200 dark:bg-slate-600")} />
      <button
        type="button"
        onClick={toggleDark}
        className={cn("inline-flex h-8 w-8 items-center justify-center rounded-md", btn)}
        title={dark ? "Modo claro" : "Modo oscuro"}
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  );
}
