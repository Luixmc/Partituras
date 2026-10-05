"use client";

// ─────────────────────────────────────────────────────────────
// El interruptor de los colores de sección (O-83).
//
// Lo pidió Carlos, el líder de alabanza, a través de Isaac el 2026-09-13, y con
// una condición que es la mitad del encargo: **cada músico decide si lo quiere
// y con qué paleta**. Así que esto no toca la base ni la canción: vive en el
// aparato de quien lee, igual que el tamaño de letra.
//
// 🔴 ARRANCA APAGADO Y SE LEE DESPUÉS DE MONTAR. Las dos cosas importan:
//  · **Apagado** significa que quien no toque nada ve la página de siempre. Un
//    encargo de un músico no le cambia la pantalla a los otros treinta.
//  · **Después de montar**, porque en el servidor no hay `localStorage`: leerlo
//    en el estado inicial deja el HTML del servidor distinto del primer dibujo
//    del navegador. Es la misma trampa que ya está anotada en
//    `PresentationView` con el recorrido por columnas.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { PALETAS, guardarPaleta, leerPaleta } from "@/lib/coloresSeccion";
import { cn } from "@/lib/utils";
import Selector from "@/components/ui/Selector";

/**
 * La paleta elegida por este músico y cómo cambiarla.
 *
 * Devuelve `null` hasta que monta, así que el primer dibujo es siempre el de
 * la página sin colores — y el guardado entra un instante después.
 */
export function usePaletaSecciones() {
  const [paletaId, setPaletaId] = useState<string | null>(null);

  useEffect(() => {
    setPaletaId(leerPaleta());
  }, []);

  const elegir = (id: string | null) => {
    setPaletaId(id);
    guardarPaleta(id);
  };

  return { paletaId, elegir };
}

type Props = {
  paletaId: string | null;
  elegir: (id: string | null) => void;
  /** "barra" = sobre fondo claro; "compacto" = en la barra de la presentación. */
  variante?: "barra" | "compacto";
  className?: string;
};

export default function SelectorColoresSeccion({ paletaId, elegir, variante = "barra", className }: Props) {
  const compacto = variante === "compacto";

  return (
    <label
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border",
        compacto
          ? "border-slate-200 bg-white px-1.5 py-1 dark:border-slate-600 dark:bg-slate-800"
          : "border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800",
        className
      )}
      // El título lleva la pista de la paleta elegida: es donde cabe explicar
      // qué hace cada una sin llenar la barra de texto.
      title={PALETAS.find((p) => p.id === paletaId)?.pista ?? "Pinta el nombre de cada sección de un color"}
    >
      <Palette className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-300" aria-hidden="true" />
      <span className="sr-only">Colores de las secciones</span>
      {/* 🔴 T-12 · Aquí había un `<select>` y su lista la dibujaba el navegador:
          en oscuro salía con letra casi blanca sobre la lista clara (Isaac,
          2026-09-17). Desde O-91 (2026-10-04) es el `Selector` de la página, que
          se pinta con el tema, así que ese fallo ya no puede volver. */}
      <Selector
        value={paletaId ?? ""}
        onChange={(v) => elegir(v || null)}
        options={[
          { value: "", label: "Sin colores" },
          ...PALETAS.map((p) => ({ value: p.id, label: p.nombre })),
        ]}
        aria-label="Colores de las secciones"
        className={cn(
          "rounded-md border-0 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:text-slate-100",
          compacto ? "py-0" : "py-0.5"
        )}
      />
    </label>
  );
}
