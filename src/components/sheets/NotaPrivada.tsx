"use client";

// ─────────────────────────────────────────────────────────────
// «Mis notas»: la nota privada de quien mira, en la ficha de la canción (O-74).
//
// Isaac, 2026-09-10: las notas son del músico y del administrador, **se
// escriben aquí** y salen a pantalla completa como un aviso pequeño arriba.
// Que nadie más las vea lo garantiza la base, no esta pantalla (ver
// `lib/notasBase.ts`).
//
// 📌 GUARDA CON SU PROPIO BOTÓN, como la melodía, y avisa hacia fuera de si hay
// algo sin guardar para que la ficha lo proteja (O-61): lo que se añade
// después no hereda la red de «cambios sin guardar» si no se le extiende a
// mano (lección de O-43).
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";

import AutoTextarea from "@/components/ui/AutoTextarea";
import { LARGO_MAXIMO_NOTA, limpiarNota } from "@/lib/notas";
import { guardarNota, leerNota } from "@/lib/notasBase";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  sheetId: string;
  /** Avisa de si hay texto sin guardar, para que la ficha lo proteja. */
  onSucio?: (sucio: boolean) => void;
};

export default function NotaPrivada({ sheetId, onSucio }: Props) {
  const [texto, setTexto] = useState("");
  const [guardado, setGuardado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const sucio = limpiarNota(texto) !== limpiarNota(guardado);

  useEffect(() => {
    onSucio?.(sucio);
  }, [sucio, onSucio]);
  // Al irse de la ficha, ya no hay nada que proteger aquí.
  useEffect(() => () => onSucio?.(false), [onSucio]);

  // La nota se pide al montar, y otra vez al pasar de canción.
  useEffect(() => {
    let vivo = true;
    (async () => {
      const nota = await leerNota(createClient(), sheetId);
      if (!vivo) return;
      setTexto(nota);
      setGuardado(nota);
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [sheetId]);

  const guardar = async () => {
    setGuardando(true);
    setAviso(null);
    const error = await guardarNota(createClient(), sheetId, texto);
    setGuardando(false);
    if (error) {
      setAviso(`No se pudo guardar: ${error}`);
      return;
    }
    const limpio = limpiarNota(texto);
    setTexto(limpio);
    setGuardado(limpio);
    setAviso(limpio ? "Nota guardada." : "Nota borrada.");
  };

  return (
    <section
      data-nota-privada
      className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/30"
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">📝 Mis notas</h2>
        <span className="text-xs text-amber-800/80 dark:text-amber-300/80">
          Solo las ves tú · salen también a pantalla completa
        </span>
      </div>

      {cargando ? (
        <p className="py-3 text-sm text-slate-500 dark:text-slate-400">Cargando tu nota…</p>
      ) : (
        <>
          <AutoTextarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={LARGO_MAXIMO_NOTA}
            placeholder="Por ejemplo: la toco en G · entro en el segundo compás · aquí subo una octava"
            aria-label="Mis notas de esta canción"
            className="w-full rounded-lg border border-amber-200 bg-white p-3 text-sm text-slate-900 dark:border-amber-900/60 dark:bg-slate-900 dark:text-slate-100"
            style={{ minHeight: "4.5rem" }}
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={guardar}
              disabled={guardando || !sucio}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition",
                guardando || !sucio ? "cursor-not-allowed bg-slate-300 dark:bg-slate-700" : "bg-amber-600 hover:bg-amber-700"
              )}
            >
              {guardando ? "Guardando…" : sucio ? "Guardar nota" : "Guardada"}
            </button>
            {aviso && <span className="text-sm text-slate-600 dark:text-slate-300">{aviso}</span>}
          </div>
        </>
      )}
    </section>
  );
}
