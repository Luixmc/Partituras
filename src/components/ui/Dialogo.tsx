"use client";

// ─────────────────────────────────────────────────────────────
// EL diálogo de la app. Uno solo, para todos (O-60).
//
// Isaac, 2026-09-04, con dos capturas —el cartel gris del navegador al borrar
// un culto, y el bonito de «Cambios sin guardar»—: *«que no sea solamente para
// este caso, que sea para TODO en lo que vaya a saltar un cuadro de diálogo»*.
//
// 🔴 NACE UNIFICANDO, NO AÑADIENDO. El diálogo bonito estaba escrito DOS VECES
// —en `ServiceEditor` y en `SongDetailEditor`—, idénticos salvo una frase.
// Atender la petición copiándolo habría escrito una TERCERA copia, y este
// proyecto ya ha pagado ese patrón cuatro veces (P-09): la consulta del
// catálogo, la lista de secciones del panel, `parseSections`… y este.
//
// ⚠️ Y LA DIFERENCIA QUE NO ES COSMÉTICA, la que puede borrar un culto sin
// preguntar: `confirm()` **detiene el programa** hasta que el usuario contesta,
// así que lo de después del `if` solo corría al aceptar. Un diálogo dibujado
// **no detiene nada**. Por eso aquí la acción no se escribe debajo: se GUARDA y
// se ejecuta cuando se pulsa el botón.
// ─────────────────────────────────────────────────────────────

import { useEffect, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Cómo se pinta cada botón. El color es lo único que se lee ANTES de pulsar. */
export type EstiloAccion = "principal" | "peligro" | "peligro-suave" | "suave";

export type Accion = {
  texto: string;
  onClick: () => void;
  estilo?: EstiloAccion;
  disabled?: boolean;
};

const ESTILOS: Record<EstiloAccion, string> = {
  principal:
    "bg-brand-600 text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50",
  // 🔴 Rojo en lo que borra, por decisión de Isaac (2026-09-04). Con todo del
  // mismo color, «eliminar el culto» se ve igual que «guardar cambios».
  //
  // Y son DOS rojos, no uno, porque el papel del botón no es el mismo:
  //  · `peligro` — SÓLIDO. Es la acción PRINCIPAL del diálogo («Eliminar»).
  //    Contorneado se leía como secundario, que es justo lo contrario.
  //  · `peligro-suave` — contorneado. Una salida destructiva que NO es la
  //    principal, como «Descartar cambios» al lado de «Guardar y salir».
  peligro:
    "bg-red-600 text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50",
  "peligro-suave":
    "border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950",
  suave:
    "text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700",
};

export default function Dialogo({
  titulo,
  children,
  acciones,
  onCancelar,
}: {
  titulo: string;
  children?: ReactNode;
  acciones: Accion[];
  /** Se llama con Escape. Si no se pasa, el diálogo no se cierra con teclado. */
  onCancelar?: () => void;
}) {
  // Escape cierra, igual que hacía el `confirm()` del navegador. Sin esto, un
  // diálogo dibujado se sentiría más atrapado que el que viene a sustituir.
  useEffect(() => {
    if (!onCancelar) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancelar();
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [onCancelar]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-slate-800">
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
          {titulo}
        </h3>
        {children && (
          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{children}</div>
        )}
        <div className="mt-5 flex flex-col gap-2">
          {acciones.map((a, i) => (
            <button
              key={i}
              type="button"
              onClick={a.onClick}
              disabled={a.disabled}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors",
                ESTILOS[a.estilo ?? "principal"]
              )}
            >
              {a.texto}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * El caso corriente: preguntar antes de hacer algo que no se puede deshacer.
 *
 * Sustituye a `confirm()`. Los tres que había en la app —borrar un culto,
 * borrar una versión por tono y regenerar los acordes— **destruyen algo**, así
 * que por defecto el botón va en rojo.
 */
export function DialogoConfirmar({
  titulo,
  mensaje,
  textoConfirmar = "Eliminar",
  peligro = true,
  ocupado = false,
  onConfirmar,
  onCancelar,
}: {
  titulo: string;
  mensaje: ReactNode;
  textoConfirmar?: string;
  peligro?: boolean;
  ocupado?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <Dialogo
      titulo={titulo}
      onCancelar={ocupado ? undefined : onCancelar}
      acciones={[
        {
          texto: textoConfirmar,
          onClick: onConfirmar,
          estilo: peligro ? "peligro" : "principal",
          disabled: ocupado,
        },
        { texto: "Cancelar", onClick: onCancelar, estilo: "suave", disabled: ocupado },
      ]}
    >
      {mensaje}
    </Dialogo>
  );
}
