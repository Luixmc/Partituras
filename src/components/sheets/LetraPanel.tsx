"use client";

import { useState } from "react";
import { Save, Sparkles } from "lucide-react";

import { andamioDesdeAcordes, estrofasDe, estrofasCantadas, tieneLetra } from "@/lib/letras";

// ─────────────────────────────────────────────────────────────
// La letra de una canción: se escribe aquí (solo el admin) y se lee
// aquí (los tres roles).
//
// 🔴 EL ANDAMIO ES LO QUE HACE VIABLE ESTO. Son ~284 estrofas en 75
// canciones, y **cada una ya trae escrito su arranque** entre paréntesis
// en la etiqueta de su sección —«(Ven señor...)»—. El botón «Traer las
// secciones» rellena el cuadro con todas las secciones de los acordes y
// el primer trozo de cada una, así que escribir es continuar, no
// empezar de cero.
//
// 🔴 Y NO DECIDE QUÉ SE CANTA. Isaac, 2026-08-21, sobre las secciones sin
// pista: «a veces se repiten estrofas a cantar, a veces son
// instrumentales, a veces solos de guitarra; no es algo fijo». → Se
// ofrecen TODAS, y **la que se quede vacía es que no se canta**.
// ─────────────────────────────────────────────────────────────

export default function LetraPanel({
  lyrics,
  setLyrics,
  contenidoAcordes,
  puedeEscribir,
  saving,
  onGuardar,
}: {
  lyrics: string;
  setLyrics: (v: string) => void;
  /** El texto de acordes, de donde salen las secciones del andamio. */
  contenidoAcordes: string;
  puedeEscribir: boolean;
  saving: boolean;
  onGuardar: () => Promise<boolean>;
}) {
  const [confirmarAndamio, setConfirmarAndamio] = useState(false);

  const estrofas = estrofasDe(lyrics);
  const cantadas = estrofasCantadas(lyrics);

  // ── Solo lectura: lo que ve quien canta ──
  if (!puedeEscribir) {
    if (!tieneLetra(lyrics)) {
      return (
        <p className="py-16 text-center text-slate-500 dark:text-slate-400">
          Esta cancion todavia no tiene la letra escrita.
        </p>
      );
    }
    return <LetraLeida estrofas={estrofas} />;
  }

  // ── Administrador: escribir ──
  const traerSecciones = () => {
    setLyrics(andamioDesdeAcordes(contenidoAcordes));
    setConfirmarAndamio(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">Letra</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {cantadas > 0
              ? `${cantadas} ${cantadas === 1 ? "estrofa escrita" : "estrofas escritas"}`
              : "Sin escribir todavia"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Rellenar pisa lo que haya, así que si ya hay algo se pregunta. */}
          {tieneLetra(lyrics) && !confirmarAndamio ? (
            <button
              type="button"
              onClick={() => setConfirmarAndamio(true)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Sparkles className="h-4 w-4" />
              Traer las secciones
            </button>
          ) : confirmarAndamio ? (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs dark:bg-amber-950/50">
              <span className="text-amber-800 dark:text-amber-200">Se borra lo escrito. ¿Seguro?</span>
              <button type="button" onClick={traerSecciones} className="font-semibold text-amber-900 underline dark:text-amber-100">
                Si
              </button>
              <button type="button" onClick={() => setConfirmarAndamio(false)} className="text-amber-700 dark:text-amber-300">
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={traerSecciones}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Sparkles className="h-4 w-4" />
              Traer las secciones
            </button>
          )}

          <button
            type="button"
            onClick={onGuardar}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
        Cada estrofa va debajo de su seccion, entre corchetes, igual que en los acordes. La seccion
        que <strong className="font-semibold">dejes vacia</strong> es que no se canta —una intro, un
        solo—, y no aparecera al leer.
      </p>

      <textarea
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        spellCheck
        placeholder={"[A]\nLa primera estrofa...\n\n[Coro]\n..."}
        className="min-h-[55vh] w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />

      {tieneLetra(lyrics) && (
        <details className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">
            Ver como queda
          </summary>
          <div className="mt-4">
            <LetraLeida estrofas={estrofas} />
          </div>
        </details>
      )}
    </div>
  );
}

/** La letra tal como la lee quien canta: sin acordes y con aire. */
function LetraLeida({ estrofas }: { estrofas: ReturnType<typeof estrofasDe> }) {
  // Las vacías no se enseñan: son las instrumentales, y a quien canta no
  // le aportan nada.
  const cantadas = estrofas.filter((e) => e.texto);
  if (!cantadas.length) {
    return (
      <p className="py-10 text-center text-slate-500 dark:text-slate-400">
        Todavia no hay ninguna estrofa escrita.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-7">
      {cantadas.map((e, i) => (
        <section key={i} className="flex flex-col gap-1.5">
          {e.titulo && (
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {e.titulo}
            </h3>
          )}
          {/* `whitespace-pre-line` para que cada verso ocupe su renglon:
              los saltos de linea SON el contenido de una letra. */}
          <p className="whitespace-pre-line text-lg leading-relaxed text-slate-800 dark:text-slate-100">
            {e.texto}
          </p>
        </section>
      ))}
    </div>
  );
}
