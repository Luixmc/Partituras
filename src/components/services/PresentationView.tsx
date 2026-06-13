"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Columns2, Columns3, Expand, Maximize2, Minus, Plus, RotateCcw, Shrink, Square, X } from "lucide-react";

import TablaturePreview from "@/components/sheets/TablaturePreview";
import { cn } from "@/lib/utils";
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
  // El tamaño de letra lo decide el auto-ajuste; el usuario puede ajustarlo a
  // mano (40%–200%), lo que desactiva el auto-ajuste para esa canción.
  const [fontScale, setFontScale] = useState(1);
  const [autoFit, setAutoFit] = useState(true);
  const [liveOffset, setLiveOffset] = useState(0); // semitonos manuales (±)
  const [columns, setColumns] = useState<1 | 2 | 3>(2); // 1, 2 ó 3 columnas
  // Auto-ocultar la cabecera/tono/navegación en pantalla completa (reaparecen
  // al mover el ratón o tocar) para ganar espacio.
  const [chromeVisible, setChromeVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pantalla completa real (Fullscreen API) sobre el contenedor de la
  // presentación: al pedir fullscreen sobre la raíz de este componente, el
  // navegador muestra SOLO la presentación y deja la navbar/sidebar del layout
  // fuera por completo.
  const rootRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Referencias para medir el espacio disponible vs. el contenido y auto-ajustar.
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Espejo del tamaño actual para el lazo de auto-ajuste (sin re-disparar efecto).
  const scaleRef = useRef(fontScale);
  useEffect(() => {
    scaleRef.current = fontScale;
  }, [fontScale]);
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
      setAutoFit(true); // re-ajusta a pantalla en la nueva canción
    },
    [total]
  );

  // Entrar/salir de pantalla completa (con prefijos para Safari/iOS antiguos).
  const toggleFullscreen = useCallback(() => {
    const el = rootRef.current as any;
    const doc = document as any;
    const fsElement =
      document.fullscreenElement || doc.webkitFullscreenElement || null;
    if (!fsElement) {
      const req =
        el?.requestFullscreen || el?.webkitRequestFullscreen || el?.webkitEnterFullscreen;
      req?.call(el);
    } else {
      const exit = document.exitFullscreen || doc.webkitExitFullscreen;
      exit?.call(document);
    }
  }, []);

  // Muestra los controles y programa su auto-ocultado (solo en pantalla
  // completa). Se llama al mover el ratón, tocar o pulsar una tecla.
  const pokeChrome = useCallback(() => {
    setChromeVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const doc = document as any;
    if (document.fullscreenElement || doc.webkitFullscreenElement) {
      hideTimer.current = setTimeout(() => setChromeVisible(false), 2500);
    }
  }, []);

  // Mantener el estado sincronizado con el navegador (ESC, gestos, etc.).
  useEffect(() => {
    const onChange = () => {
      const doc = document as any;
      const fs = Boolean(document.fullscreenElement || doc.webkitFullscreenElement);
      setIsFullscreen(fs);
      setAutoFit(true); // re-ajusta los acordes al nuevo espacio disponible
      if (fs) {
        pokeChrome(); // muestra los controles un momento y luego los oculta
      } else {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setChromeVisible(true);
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pokeChrome]);

  // Ajuste manual del tamaño (desactiva el auto-ajuste para esta canción).
  const bumpScale = useCallback((delta: number) => {
    setAutoFit(false);
    setFontScale((f) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(f + delta).toFixed(2))));
  }, []);

  // Navegación con teclado (flechas / espacio).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      pokeChrome();
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      else if (e.key === "f" || e.key === "F") { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, toggleFullscreen, pokeChrome]);

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
  const onTouchStart = (e: React.TouchEvent) => { pokeChrome(); touchX.current = e.touches[0].clientX; };
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

  // Auto-ajuste: escala la letra para que la canción ocupe toda la pantalla sin
  // scroll. La iteración se hace con requestAnimationFrame y un TOPE de pasos —
  // NO depende de `fontScale` (evita el bucle de re-render / React #185), y se
  // detiene al converger o tras unos pocos cuadros (el reflujo al envolver hace
  // que el ajuste no sea monótono, así que el tope garantiza terminar).
  useLayoutEffect(() => {
    if (!autoFit) return;
    let raf = 0;
    let steps = 0;
    const step = () => {
      const main = mainRef.current;
      const content = contentRef.current;
      if (!main || !content) return;

      const cs = getComputedStyle(main);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const availH = main.clientHeight - padY;
      const contentH = content.scrollHeight;
      if (availH <= 0 || contentH <= 0) return;

      const prev = scaleRef.current;
      const ratio = (availH / contentH) * 0.985; // pequeño margen para no rozar
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(prev * ratio).toFixed(3)));

      if (Math.abs(next - prev) > 0.015 && steps < 10) {
        steps += 1;
        scaleRef.current = next;
        setFontScale(next);
        raf = requestAnimationFrame(step); // mide de nuevo tras repintar
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [autoFit, index, viewport, liveOffset, columns, isFullscreen]);

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
      ref={rootRef}
      className="relative flex min-h-dvh flex-col bg-white dark:bg-slate-950"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseMove={pokeChrome}
    >
      {/* Cabecera + sub-barra. En pantalla completa flotan (absolute) sobre el
          contenido y se auto-ocultan tras unos segundos (reaparecen al mover el
          ratón o tocar), para que los acordes usen toda la pantalla. */}
      <div
        className={cn(
          "transition-opacity duration-300",
          isFullscreen && "absolute inset-x-0 top-0 z-30",
          isFullscreen && !chromeVisible && "pointer-events-none opacity-0"
        )}
      >
      {/* Barra superior */}
      <header className={cn(
        "sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 px-3 py-2 backdrop-blur dark:border-slate-800",
        isFullscreen ? "bg-white/70 dark:bg-slate-950/70" : "bg-white/95 dark:bg-slate-950/95"
      )}>
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

        {/* Pantalla completa real: oculta por completo la navbar del layout. */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          title={isFullscreen ? "Salir de pantalla completa (F)" : "Pantalla completa (F)"}
        >
          {isFullscreen ? <Shrink className="h-5 w-5" /> : <Expand className="h-5 w-5" />}
        </button>
      </header>

      {/* Sub-barra: tono y transposición manual */}
      <div className={cn(
        "flex flex-wrap items-center justify-center gap-2 border-b border-slate-100 px-3 py-1.5 text-sm dark:border-slate-800",
        isFullscreen ? "bg-slate-50/70 backdrop-blur dark:bg-slate-900/70" : "bg-slate-50 dark:bg-slate-900"
      )}>
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

        {/* Tamaño de letra (40%–200%) + volver al ajuste automático. */}
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
        <button
          type="button"
          onClick={() => bumpScale(-0.1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
          aria-label="Reducir letra"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => bumpScale(0.1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
          aria-label="Aumentar letra"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setAutoFit(true)}
          title="Ajustar a pantalla"
          aria-label="Ajustar a pantalla"
          className={
            "flex h-8 w-8 items-center justify-center rounded-lg ring-1 transition-colors " +
            (autoFit
              ? "bg-brand-600 text-white ring-brand-600"
              : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700")
          }
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Alternar columnas: 1 → 2 → 3 → 1. */}
        <button
          type="button"
          onClick={() => { setColumns((c) => (c === 3 ? 1 : ((c + 1) as 1 | 2 | 3))); setAutoFit(true); }}
          title={`Columnas: ${columns} (cambiar)`}
          aria-label={`Columnas: ${columns}. Pulsa para cambiar`}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
        >
          {columns === 1 ? <Square className="h-4 w-4" /> : columns === 2 ? <Columns2 className="h-4 w-4" /> : <Columns3 className="h-4 w-4" />}
        </button>
      </div>
      </div>

      {/* Contenido de la canción */}
      <main
        ref={mainRef}
        className={cn(
          "flex-1 overflow-auto px-3 md:px-8",
          isFullscreen ? "py-1" : "py-3"
        )}
      >
        <div ref={contentRef}>
          {song.composer && (
            <p className={cn("text-center text-sm text-slate-400", isFullscreen ? "mb-1" : "mb-3")}>
              {song.composer}
            </p>
          )}
          {sections.length > 0 ? (
            // Multi-columna = CSS grid: se llena por FILAS, de IZQUIERDA a DERECHA
            // y luego baja (A, B, C…). 1 columna = pila vertical.
            <div
              className={cn(
                "mx-auto",
                columns === 1
                  ? cn("flex max-w-5xl flex-col", isFullscreen ? "gap-1.5" : "gap-4")
                  : cn(
                      "grid items-start gap-x-6",
                      columns === 2 ? "max-w-6xl grid-cols-2" : "max-w-7xl grid-cols-3",
                      isFullscreen ? "gap-y-1.5" : "gap-y-4"
                    )
              )}
            >
              {sections.map((sec, i) => (
                <TablaturePreview
                  key={i}
                  notes={sec.content}
                  label={sec.title}
                  fontScale={fontScale}
                  dense
                />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-slate-400">Esta cancion no tiene acordes para mostrar.</p>
          )}
        </div>
      </main>

      {/* Navegación inferior. En pantalla completa flota (absolute) y se
          auto-oculta para no robar altura a los acordes. */}
      <footer className={cn(
        "flex items-center gap-3 border-t border-slate-200 px-3 py-2.5 transition-opacity duration-300 dark:border-slate-800",
        isFullscreen
          ? "absolute inset-x-0 bottom-0 z-30 bg-white/70 backdrop-blur dark:bg-slate-950/70"
          : "sticky bottom-0 bg-white dark:bg-slate-950",
        isFullscreen && !chromeVisible && "pointer-events-none opacity-0"
      )}>
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
