"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";

import TablaturePreview from "@/components/sheets/TablaturePreview";
import { parseSections } from "@/lib/sections";
import { keyToPitch, prefersFlats, semitonesBetween, transposeContent } from "@/lib/music";
import type { PresentSong } from "@/types";

const PITCH_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const PITCH_FLAT  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

type Props = {
  title:    string;
  songs:    PresentSong[];
  backHref: string;
};

// Límites del tamaño de letra: 40% – 200%.
const MIN_SCALE = 0.4;
const MAX_SCALE = 2;

export default function PresentationView({ title, songs, backHref }: Props) {
  const [index, setIndex] = useState(0);
  // El tamaño de letra lo decide el auto-ajuste (sin controles manuales).
  const [fontScale, setFontScale] = useState(1);
  const [liveOffset, setLiveOffset] = useState(0); // semitonos manuales (±)

  // Referencias para medir el espacio disponible vs. el contenido y auto-ajustar.
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Tamaño de ventana: re-dispara el auto-ajuste al rotar/redimensionar.
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  const song = songs[index];
  const total = songs.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => {
        const next = i + dir;
        if (next < 0 || next >= total) return i;
        return next;
      });
      setLiveOffset(0); // reinicia la transposición manual al cambiar de canción
    },
    [total]
  );

  // Navegación con teclado (flechas / espacio).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Mantener la pantalla encendida durante el servicio (best-effort).
  useEffect(() => {
    let lock: any = null;
    const request = async () => {
      try {
        lock = await (navigator as any).wakeLock?.request("screen");
      } catch { /* no soportado */ }
    };
    request();
    const onVisible = () => { if (document.visibilityState === "visible") request(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      try { lock?.release?.(); } catch { /* ignore */ }
    };
  }, []);

  // Swipe en móvil/tablet.
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
  };

  // Re-dispara el auto-ajuste cuando cambia el tamaño de la ventana.
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  // Auto-ajuste: escala la letra para que la canción ocupe toda la pantalla
  // disponible sin necesidad de hacer scroll. Converge en pocos repintados
  // (el ajuste de fuente cambia el reflujo, pero el lazo tiene realimentación
  // negativa y se detiene al acercarse al objetivo).
  useLayoutEffect(() => {
    const main = mainRef.current;
    const content = contentRef.current;
    if (!main || !content) return;

    const cs = getComputedStyle(main);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const availH = main.clientHeight - padY;
    const contentH = content.scrollHeight;
    if (availH <= 0 || contentH <= 0) return;

    const ratio = (availH / contentH) * 0.985; // pequeño margen para no rozar
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(fontScale * ratio).toFixed(3)));

    // Solo reajusta si la diferencia es apreciable (evita bucles infinitos).
    if (Math.abs(next - fontScale) > 0.01) setFontScale(next);
  }, [fontScale, index, viewport, liveOffset]);

  // Semitonos efectivos: (original → tono del culto) + ajuste manual.
  const baseSemitones = semitonesBetween(song?.original_key, song?.target_key) ?? 0;
  const totalSemitones = (((baseSemitones + liveOffset) % 12) + 12) % 12;
  const flats = prefersFlats(song?.target_key) || liveOffset < 0;

  const content = useMemo(
    () => (song?.content ? transposeContent(song.content, totalSemitones, flats) : ""),
    [song?.content, totalSemitones, flats]
  );

  const sections = useMemo(() => (content ? parseSections(content) : []), [content]);

  // Etiqueta del tono mostrado (original transpuesto).
  const keyLabel = useMemo(() => {
    const base = keyToPitch(song?.target_key) ?? keyToPitch(song?.original_key);
    if (base === null) return song?.target_key || song?.original_key || null;
    const eff = (((base + liveOffset) % 12) + 12) % 12;
    return (flats ? PITCH_FLAT : PITCH_SHARP)[eff];
  }, [song?.target_key, song?.original_key, liveOffset, flats]);

  if (!song) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white p-8 text-center dark:bg-slate-950">
        <p className="text-slate-500">Este culto no tiene canciones.</p>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-dvh flex-col bg-white dark:bg-slate-950"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Barra superior */}
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <Link
          href={backHref}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          aria-label="Salir de la presentacion"
        >
          <X className="h-5 w-5" />
        </Link>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-xs text-slate-400">{title}</p>
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
            {index + 1}/{total} · {song.title}
          </p>
        </div>

        {/* Botón de salida a la derecha para equilibrar la barra (ancho fijo). */}
        <span className="h-9 w-9 flex-shrink-0" aria-hidden />
      </header>

      {/* Sub-barra: tono y transposición manual */}
      <div className="flex items-center justify-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900">
        <span className="text-slate-500 dark:text-slate-400">Tono</span>
        <span className="rounded-md bg-brand-600 px-2 py-0.5 font-bold text-white">
          {keyLabel ?? "—"}
        </span>
        <button
          type="button"
          onClick={() => setLiveOffset((o) => o - 1)}
          className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
          aria-label="Bajar medio tono"
        >
          ♭
        </button>
        <button
          type="button"
          onClick={() => setLiveOffset((o) => o + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
          aria-label="Subir medio tono"
        >
          ♯
        </button>
        {liveOffset !== 0 && (
          <button
            type="button"
            onClick={() => setLiveOffset(0)}
            className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {liveOffset > 0 ? `+${liveOffset}` : liveOffset}
          </button>
        )}
      </div>

      {/* Contenido de la canción */}
      <main ref={mainRef} className="flex-1 overflow-auto px-3 py-3 md:px-8">
        <div ref={contentRef}>
          {song.composer && (
            <p className="mb-3 text-center text-sm text-slate-400">{song.composer}</p>
          )}
          {sections.length > 0 ? (
            <div className="mx-auto max-w-5xl space-y-4">
              {sections.map((sec, i) => (
                <TablaturePreview key={i} notes={sec.content} label={sec.title} fontScale={fontScale} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-slate-400">Esta cancion no tiene acordes para mostrar.</p>
          )}
        </div>
      </main>

      {/* Navegación inferior */}
      <footer className="sticky bottom-0 flex items-center gap-3 border-t border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-30 dark:bg-slate-800 dark:text-slate-200"
        >
          <ChevronLeft className="h-5 w-5" />
          Anterior
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={index === total - 1}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-30"
        >
          Siguiente
          <ChevronRight className="h-5 w-5" />
        </button>
      </footer>
    </div>
  );
}
