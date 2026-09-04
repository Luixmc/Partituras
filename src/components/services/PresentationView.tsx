"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Columns2, Columns3, CornerDownRight, Expand, Maximize2, Mic2, Minus, Music2, Music4, Plus, RotateCcw, Shrink, Square, TextQuote, X } from "lucide-react";

import { estrofasDe } from "@/lib/letras";

import SeccionRepartida from "@/components/sheets/SeccionRepartida";
import Pentagrama from "@/components/sheets/Pentagrama";
import { parsearMelodia, tramosDe } from "@/lib/melodia";
import { ChordPopoverProvider } from "@/components/sheets/ChordPopover";
import { cn } from "@/lib/utils";
import { parseSections } from "@/lib/sections";
import { esMenor, keyToPitch, ortografiaDe, prefersFlats, semitonesBetween, transposeContent } from "@/lib/music";
import {
  TRANSPOSITORES,
  TRANSPOSITOR_POR_DEFECTO,
  guardarTranspositor,
  leerTranspositor,
  semitonosDe,
} from "@/lib/transpositores";
import type { PresentSong } from "@/types";

const PITCH_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const PITCH_FLAT  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

type Props = {
  title:    string;
  songs:    PresentSong[];
  backHref: string;
  /**
   * Dirección de salida armada CON LA CANCIÓN QUE SE ESTÁ VIENDO (O-40).
   *
   * Isaac: «si la primera canción fue "x" y en la pantalla quedamos en la "y",
   * cuando le demos para salir que nos deje en el modo vista de la "y"». Con
   * `backHref` a secas se volvía siempre a la canción por la que se entró, y
   * después de pasar tres se perdía por dónde ibas.
   *
   * 🔴 Va como DATOS y no como función: esto es componente de cliente y quien
   * lo monta es de servidor, así que una función no se puede pasar.
   *
   * Solo lo usa la pantalla completa de UNA canción. Entrando por «Presentar»
   * desde el culto, la X vuelve al culto y así está bien: allí no se entró por
   * una canción concreta.
   */
  volverPorCancion?: { base: string; sufijo: string };
  /** Canción por la que se empieza. Se usa al abrir una canción concreta del
      catálogo: la lista es la que el músico estaba viendo, pero se arranca en
      la que abrió (O-16). */
  startIndex?: number;
};

// Límites del tamaño de letra: 40% – 200%.
const MIN_SCALE = 0.4;
// 🔴 SUBIDO de 2 a 4 el 2026-09-01, y lo pidio Isaac con «Avivamiento»: *«por
// mas que quiera que se ponga grande para aprovechar el tamano de la pantalla y
// la poca estructura que tiene, no se pone mas grande»*.
//
// Tenia razon y el numero lo explica: una cancion corta cabe de sobra, asi que
// el auto-ajuste queria crecer — y **chocaba contra este techo**, dejando media
// pantalla vacia. El techo no protegia de nada: el auto-ajuste ya para solo
// cuando el contenido llena el alto, y ademas itera hasta converger.
const MAX_SCALE = 4;

// ─────────────────────────────────────────────────────────────
// Tamaño de letra guardado, POR CANCIÓN y POR MÚSICO.
//
// Se guarda en el navegador de cada uno (no en la base de datos) por dos
// motivos: cada músico lo quiere a su manera, y el tamaño que hace falta
// depende de la pantalla —no es lo mismo una tablet que un móvil que un PC—.
// Así también funciona para lectores y músicos, que no tienen permiso para
// escribir en las canciones.
// ─────────────────────────────────────────────────────────────
const CLAVE_TAMANOS = "presentacion-tamanos";

// ─────────────────────────────────────────────────────────────
// Qué se está leyendo: los acordes, la letra (J.4) o la melodía (O-57 · R.4).
//
// 📌 Es UN botón que va rotando, no tres. Se lee tocando y con una mano
// ocupada: tres botones en esa barra serían tres sitios donde mirar.
type Modo = "acordes" | "letra" | "melodia";

/**
 * El siguiente modo QUE ESTA CANCIÓN TIENE.
 *
 * 🔴 Salta los que no existen aquí a proposito: *un botón que lleva a una
 * pantalla vacía es peor que no tenerlo*. Si la canción no tiene melodía
 * escrita, la rotación va acordes → letra → acordes y ya.
 */
function siguienteModo(actual: Modo, hayLetra: boolean, hayMelodia: boolean): Modo {
  const orden: Modo[] = ["acordes", "letra", "melodia"];
  const tiene = (m: Modo) => m === "acordes" || (m === "letra" ? hayLetra : hayMelodia);
  const desde = orden.indexOf(actual);
  for (let i = 1; i <= orden.length; i++) {
    const m = orden[(desde + i) % orden.length];
    if (tiene(m)) return m;
  }
  return "acordes";
}

/** Lo que dice el botón: a dónde lleva. */
function etiquetaModo(m: Modo): string {
  return m === "acordes" ? "Ver los acordes" : m === "letra" ? "Ver la letra" : "Ver la melodía";
}

// Cómo se recorren las secciones cuando hay más de una columna (O-26).
//
//   "filas"    → izquierda, derecha, y luego la fila de abajo  (A B / C D)
//   "columnas" → la primera columna entera de arriba abajo, y
//                después la segunda                            (A C / B D)
//
// Lo pidió un músico del grupo de alabanza: según cómo esté escrita la canción,
// una de las dos se lee mucho mejor. Se guarda en el navegador de cada uno,
// igual que el tamaño de letra: es preferencia de quien lee, no de la canción.
// ─────────────────────────────────────────────────────────────
type Recorrido = "filas" | "columnas";
const CLAVE_RECORRIDO = "presentacion-recorrido";

function leerRecorrido(): Recorrido {
  if (typeof window === "undefined") return "filas";
  try {
    return localStorage.getItem(CLAVE_RECORRIDO) === "columnas" ? "columnas" : "filas";
  } catch {
    return "filas";
  }
}

function leerTamanos(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_TAMANOS) || "{}");
    return guardado && typeof guardado === "object" ? guardado : {};
  } catch {
    return {};
  }
}

/** Guarda el tamaño de una canción; con `null` lo borra (vuelve al automático). */
function guardarTamano(songId: string, escala: number | null) {
  if (typeof window === "undefined") return;
  try {
    const todos = leerTamanos();
    if (escala === null) delete todos[songId];
    else todos[songId] = escala;
    localStorage.setItem(CLAVE_TAMANOS, JSON.stringify(todos));
  } catch {
    /* almacenamiento lleno o bloqueado: se sigue sin guardar */
  }
}

export default function PresentationView({ title, songs, backHref, startIndex = 0, volverPorCancion }: Props) {
  const [index, setIndex] = useState(startIndex);
  // El tamaño de letra lo decide el auto-ajuste; el usuario puede ajustarlo a
  // mano (40%–200%), lo que desactiva el auto-ajuste para esa canción.
  const [fontScale, setFontScale] = useState(1);
  const [autoFit, setAutoFit] = useState(true);
  const [liveOffset, setLiveOffset] = useState(0); // semitonos manuales (±)
  const [columns, setColumns] = useState<1 | 2 | 3>(2); // 1, 2 ó 3 columnas
  // Se arranca en "filas" y se lee el guardado ya en el navegador: leerlo en el
  // estado inicial rompería el render del servidor (no hay localStorage allí).
  const [recorrido, setRecorrido] = useState<Recorrido>("filas");

  // ── El instrumento de quien lee (D-28) ────────────────────
  //
  // Un instrumento en Bb SUENA UN TONO MÁS GRAVE de lo que lee, así que su
  // parte se escribe un tono por encima. Si el trompetista lee el `D` de la
  // página y toca su `D`, suena `C`: un tono por debajo del grupo. Ahora la
  // cuenta la hace la página y él no transpone nada de cabeza.
  //
  // Se arranca en «como suena» y lo guardado se lee ya en el navegador:
  // leerlo en el estado inicial rompería el render del servidor.
  const [transpositor, setTranspositor] = useState(TRANSPOSITOR_POR_DEFECTO);
  useEffect(() => {
    setTranspositor(leerTranspositor());
  }, []);

  function elegirTranspositor(id: string) {
    setTranspositor(id);
    guardarTranspositor(id);
  }

  const desplazamiento = semitonosDe(transpositor);

  // Acordes · letra (J.4) · melodía (O-57 · R.4).
  //
  // 🔴 SE MANTIENE al pasar de canción. Primero se reiniciaba a acordes
  // para no dejar una pantalla vacía si la siguiente no tenía letra, y era
  // el arreglo equivocado: Isaac lo vio cantando un culto entero —«paso a
  // la otra canción y me muestra los acordes, tengo que darle otra vez al
  // botón»—. Quien canta, canta TODO el repertorio.
  //
  // El caso vacío se resuelve abajo, sin perder su elección: si la canción
  // no tiene letra se enseñan los acordes, y en cuanto llega una que sí la
  // tiene, vuelve a salir la letra sola. **La melodía va igual**: el
  // trompetista pasa de canción y sigue leyendo su pentagrama.
  const [modo, setModo] = useState<Modo>("acordes");
  useEffect(() => setRecorrido(leerRecorrido()), []);
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

  // A dónde lleva la X. Si quien montó la pantalla dio una plantilla, se sale
  // por la canción que se está viendo (O-40); si no, por donde se entró.
  const salirA =
    volverPorCancion && song?.id
      ? `${volverPorCancion.base}/${song.id}${volverPorCancion.sufijo}`
      : backHref;
  const total = songs.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => {
        const next = i + dir;
        if (next < 0 || next >= total) return i;
        return next;
      });
      setLiveOffset(0); // reinicia la transposición manual al cambiar de canción
      // El tamaño lo decide el efecto de más abajo: si la canción nueva tiene
      // uno guardado se respeta, y si no, se vuelve al ajuste automático.
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
      // No se toca el tamaño: si el músico fijó uno, manda el suyo. Si está en
      // automático, el propio auto-ajuste se re-dispara al cambiar el espacio.
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

  // Ajuste manual del tamaño: desactiva el auto-ajuste para esta canción y
  // GUARDA la elección, para que la próxima vez se abra así (O-06).
  const bumpScale = useCallback(
    (delta: number) => {
      setAutoFit(false);
      const nuevo = Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(scaleRef.current + delta).toFixed(2)));
      scaleRef.current = nuevo;
      setFontScale(nuevo);
      if (song?.id) guardarTamano(song.id, nuevo);
    },
    [song?.id]
  );

  // Al abrir una canción (y al pasar a la siguiente): si el músico le guardó un
  // tamaño, se usa ese; si no, se deja que el auto-ajuste haga su trabajo.
  //
  // Va en useLayoutEffect y ANTES del auto-ajuste a propósito: así se decide el
  // tamaño antes de pintar. Con un useEffect normal se vería un parpadeo — la
  // canción aparecería un instante con el tamaño calculado y saltaría al
  // guardado.
  useLayoutEffect(() => {
    if (!song?.id) return;
    const guardado = leerTamanos()[song.id];
    if (typeof guardado === "number" && guardado >= MIN_SCALE && guardado <= MAX_SCALE) {
      scaleRef.current = guardado;
      setFontScale(guardado);
      setAutoFit(false);
    } else {
      setAutoFit(true);
    }
  }, [song?.id]);

  // Navegación con teclado (flechas / espacio).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      pokeChrome();
      // No robar las teclas si se está escribiendo en algún campo.
      const destino = e.target as HTMLElement | null;
      if (
        destino?.tagName === "INPUT" ||
        destino?.tagName === "TEXTAREA" ||
        destino?.isContentEditable
      ) return;

      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      else if (e.key === "f" || e.key === "F") { e.preventDefault(); toggleFullscreen(); }
      // + y − ajustan el tamaño de letra, igual que los botones (O-21). Se
      // aceptan las variantes del teclado: "=" es el "+" sin Shift, y el pad
      // numérico manda "Add"/"Subtract" en algunos navegadores.
      else if (e.key === "+" || e.key === "=" || e.key === "Add") { e.preventDefault(); bumpScale(0.1); }
      else if (e.key === "-" || e.key === "_" || e.key === "Subtract") { e.preventDefault(); bumpScale(-0.1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, toggleFullscreen, pokeChrome, bumpScale]);

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
    // 🔴 En MELODÍA no se auto-ajusta, y no es pereza: `abcjs` se carga
    // diferido y dibuja DESPUÉS de este efecto, así que aquí se mediría una
    // caja vacía y la escala se dispararía al tope. El pentagrama usa la
    // escala que haya, y los ± del músico la siguen moviendo.
    if (!autoFit || modo === "melodia") return;
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
  }, [autoFit, index, viewport, liveOffset, desplazamiento, columns, recorrido, modo, isFullscreen]);


  // Semitonos efectivos: (original → tono del culto) + ajuste manual + el
  // desplazamiento del instrumento.
  const baseSemitones = semitonesBetween(song?.original_key, song?.target_key) ?? 0;
  const totalSemitones = (((baseSemitones + liveOffset + desplazamiento) % 12) + 12) % 12;
  // ── El tono que se está viendo, UNO SOLO ──────────────────
  //
  // Antes la etiqueta de arriba y los acordes de abajo lo calculaban por
  // caminos distintos, y por eso podían contradecirse: la barra decía «E» y
  // debajo estaba escrito en bemoles, como si fuera Fb (T-14).
  const tonoBase = song?.target_key || song?.original_key;
  const menor = esMenor(tonoBase);
  const basePitch = keyToPitch(song?.target_key) ?? keyToPitch(song?.original_key);
  // El que SUENA: sin el desplazamiento del instrumento. Es el tono del que
  // habla el grupo.
  const tonoQueSuena =
    basePitch === null ? null : (((basePitch + liveOffset) % 12) + 12) % 12;
  // El que se LEE en la pantalla: con el desplazamiento. Es el que hay que
  // usar para escribir los acordes.
  const tonoEfectivo =
    tonoQueSuena === null ? null : (((tonoQueSuena + desplazamiento) % 12) + 12) % 12;

  // ¿Bemoles o sostenidos? **Lo decide el tono AL QUE SE LLEGA.**
  //
  // 🔴 Antes se heredaba del tono de PARTIDA, más un «si baja, bemoles» que es
  // falso: bajar de F da E, de C da B, de G da F#, y las tres son de
  // sostenidos. Bajar no tiene nada que ver con los bemoles.
  //
  // Y si el músico NO ha movido el tono, no se decide nada: se respeta lo que
  // está escrito (T-11). Elegir entre `Bb` y `A#` solo toca cuando hay que
  // reescribir de verdad; esa elección ya la tomó quien escribió la canción.
  //
  // ⚠️ La excepción de T-11 —«sin mover el tono se respeta lo escrito»— vale
  // solo cuando NO se transpone. Con un instrumento transpositor sí se
  // reescribe, así que ahí manda otra vez el tono destino.
  const flats =
    !liveOffset && !desplazamiento && tonoBase
      ? prefersFlats(tonoBase)
      : tonoEfectivo === null
        ? false
        : ortografiaDe(tonoEfectivo, menor);

  const content = useMemo(
    () => (song?.content ? transposeContent(song.content, totalSemitones, flats) : ""),
    [song?.content, totalSemitones, flats]
  );

  const sections = useMemo(() => (content ? parseSections(content) : []), [content]);

  // Las estrofas que se cantan de esta canción. Las vacías son las
  // instrumentales y no se enseñan.
  const estrofas = useMemo(
    () => estrofasDe(song?.lyrics ?? "").filter((e) => e.texto),
    [song?.lyrics]
  );
  // Los tramos de la MELODÍA, uno por sección (O-57 · R.4).
  //
  // 🔴 `song.melody` solo llega relleno si el rol puede ver la melodía: la
  // página lo comprueba EN EL SERVIDOR y, si no le toca, el texto ni siquiera
  // sale de ahí — igual que la letra (D-22). Aquí no hay nada que esconder
  // porque no hay nada que haya llegado.
  const tramos = useMemo(
    () => tramosDe(song?.melody ?? "").filter((t) => t.abc),
    [song?.melody]
  );

  // Lo que se enseña de verdad: si él eligió letra o melodía y esta canción no
  // la tiene, salen los acordes — sin perder su elección para la siguiente.
  const hayLetra = estrofas.length > 0;
  const hayMelodia = tramos.length > 0;
  const mostrandoLetra = modo === "letra" && hayLetra;
  const mostrandoMelodia = modo === "melodia" && hayMelodia;
  // A dónde lleva el botón. Se calcula desde lo que se está ENSEÑANDO, no
  // desde lo elegido: si eligió letra y esta canción no la tiene, está
  // mirando acordes, y el botón tiene que llevarle a lo siguiente de ahí.
  // Cuánto se mueve la MELODÍA, y por qué no es `totalSemitones` a secas.
  //
  // 🔴 `totalSemitones` está normalizado a 0..11, que para los ACORDES da
  // igual —`Bb` es `Bb` esté donde esté— pero en un pentagrama **no**: bajar
  // un semitono se convertiría en subir una séptima mayor, y la melodía se
  // iría al techo del pentagrama con líneas adicionales. Se coge la dirección
  // MÁS CORTA, que es la que el músico espera ver.
  const semitonosMelodia = totalSemitones > 6 ? totalSemitones - 12 : totalSemitones;

  // La escala del pentagrama va acotada a propósito: el auto-ajuste de los
  // acordes puede haber dejado `fontScale` en 4 (O-52, para canciones cortas),
  // y una partitura a ese tamaño no cabe ni en un compás por renglón.
  const escalaMelodia = Math.min(2, Math.max(0.8, fontScale));

  const proximo = siguienteModo(
    mostrandoLetra ? "letra" : mostrandoMelodia ? "melodia" : "acordes",
    hayLetra,
    hayMelodia
  );

  // Etiqueta del tono mostrado (el original, ya transpuesto).
  //
  // Se conserva el MODO: al transponer solo se mueve la nota, así que una
  // canción en "Bm" salía como "B" a secas — otra tonalidad distinta. El modo
  // se lleva aparte y se vuelve a pegar al final.
  const keyLabel = useMemo(() => {
    const tonoBase = song?.target_key || song?.original_key;
    // Si el músico no ha movido nada, se enseña EL TONO TAL COMO ESTÁ ESCRITO.
    // No se recalcula: recalcular obliga a elegir entre Bb y A#, y esa elección
    // ya la tomó quien escribió la canción. Los acordes tampoco se tocan cuando
    // no hay transposición, así que recalcular solo servía para contradecirlos:
    // arriba ponía "A#" y debajo estaba "Bb".
    if (!liveOffset && !desplazamiento && tonoBase) return tonoBase;
    if (tonoEfectivo === null) return tonoBase || null;
    // El MISMO tono efectivo y la MISMA ortografía que usan los acordes: así la
    // barra no puede volver a contradecir a la partitura (T-14).
    const nota = (flats ? PITCH_FLAT : PITCH_SHARP)[tonoEfectivo];
    return menor ? `${nota}m` : nota;
  }, [tonoBase, tonoEfectivo, menor, liveOffset, desplazamiento, flats]);

  // El tono que SUENA, para enseñarlo al lado del que se lee.
  //
  // 🔴 Se enseñan LOS DOS a propósito. Con solo el suyo, el trompetista diría
  // «estamos en E» y el resto «no, en D», y acabarían discutiendo el tono en
  // mitad del servicio. Dos números no cuestan nada y quitan el malentendido.
  const etiquetaQueSuena = useMemo(() => {
    if (!desplazamiento) return null;
    if (!liveOffset && tonoBase) return tonoBase;
    if (tonoQueSuena === null) return tonoBase || null;
    const bemoles = ortografiaDe(tonoQueSuena, menor);
    const nota = (bemoles ? PITCH_FLAT : PITCH_SHARP)[tonoQueSuena];
    return menor ? `${nota}m` : nota;
  }, [tonoBase, tonoQueSuena, menor, liveOffset, desplazamiento]);

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
          href={salirA}
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
          onClick={() => {
            setAutoFit(true);
            if (song?.id) guardarTamano(song.id, null); // olvida el tamaño fijado
          }}
          title="Ajustar a pantalla (olvida el tamaño guardado de esta canción)"
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
          onClick={() => setColumns((c) => (c === 3 ? 1 : ((c + 1) as 1 | 2 | 3)))}
          title={`Columnas: ${columns} (cambiar)`}
          aria-label={`Columnas: ${columns}. Pulsa para cambiar`}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
        >
          {columns === 1 ? <Square className="h-4 w-4" /> : columns === 2 ? <Columns2 className="h-4 w-4" /> : <Columns3 className="h-4 w-4" />}
        </button>

        {/* Acordes ↔ letra (J.4) ↔ melodía (R.4). Solo si esa canción tiene
            algo más que acordes: un botón que lleva a una pantalla vacía es
            peor que no tenerlo.
            📌 El icono es el del modo AL QUE SE VA, no el actual — que es como
            venía funcionando con la letra y como se lee de un vistazo. */}
        {(hayLetra || hayMelodia) && (
          <button
            type="button"
            onClick={() => setModo((m) => siguienteModo(m, hayLetra, hayMelodia))}
            title={etiquetaModo(proximo)}
            aria-label={etiquetaModo(proximo)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg ring-1 transition-colors",
              mostrandoLetra || mostrandoMelodia
                ? "bg-brand-600 text-white ring-brand-600"
                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
            )}
          >
            {proximo === "acordes" ? (
              <Music2 className="h-4 w-4" />
            ) : proximo === "letra" ? (
              <Mic2 className="h-4 w-4" />
            ) : (
              <Music4 className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Cómo se recorren las secciones (O-26). Con una sola columna no hay
            nada que elegir, así que el botón no aparece. */}
        {columns > 1 && (
          <button
            type="button"
            onClick={() => {
              const otro: Recorrido = recorrido === "filas" ? "columnas" : "filas";
              setRecorrido(otro);
              try {
                localStorage.setItem(CLAVE_RECORRIDO, otro);
              } catch {
                /* almacenamiento lleno o bloqueado: se sigue sin guardar */
              }
            }}
            title={
              recorrido === "filas"
                ? "Se lee de izquierda a derecha y luego abajo. Pulsa para leer por columnas"
                : "Se lee la primera columna entera y luego la siguiente. Pulsa para leer por filas"
            }
            aria-label={`Lectura ${recorrido === "filas" ? "por filas" : "por columnas"}. Pulsa para cambiar`}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
          >
            {recorrido === "filas" ? <CornerDownRight className="h-4 w-4" /> : <TextQuote className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Tu instrumento (D-28). Va pegado al tono porque es justo lo que
          cambia: qué tono ves escrito. */}
      <div className={cn(
        "flex flex-wrap items-center justify-center gap-2 border-b border-slate-100 px-3 py-1.5 text-sm dark:border-slate-800",
        isFullscreen ? "bg-slate-50/70 backdrop-blur dark:bg-slate-900/70" : "bg-slate-50 dark:bg-slate-900"
      )}>
        <span className="text-slate-500 dark:text-slate-400">Tu instrumento</span>
        {TRANSPOSITORES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => elegirTranspositor(t.id)}
            aria-pressed={t.id === transpositor}
            title={t.ejemplos}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
              t.id === transpositor
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
            )}
          >
            {t.nombre}
          </button>
        ))}
        {desplazamiento > 0 && (
          <span className="text-xs text-slate-400">
            se te muestra un tono más arriba — así lo que suena va con el grupo
          </span>
        )}
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
          {/* 🔴 El AUTOR no se dibuja en la presentacion, ni en pantalla
              completa ni fuera de ella. Isaac, 2026-09-02, con mayusculas:
              *«QUE NO SALGA EN EL MODO PANTALLA COMPLETA PARA NADA, NI CUANDO
              NO SE PRESIONA F, NI CUANDO SE LE DA EL BOTON»*.
              Mi primera version solo lo quitaba con `isFullscreen`, y esta
              pantalla se usa para tocar tambien sin pantalla completa — que es
              justo la captura que mando. **El modo presentacion es para leer
              acordes; de quien es la cancion ya se sabe.** Sigue estando en la
              vista normal y en la tarjeta. */}

          {mostrandoMelodia ? (
            // ── LA MELODÍA (O-57 · R.4) ──
            //
            // 🔴 A UNA COLUMNA SIEMPRE, aunque el músico tenga puestas dos o
            // tres. Un pentagrama estrecho no se lee: `abcjs` reparte sus
            // renglones según el ancho que se le dé, así que darle el ancho
            // entero es lo que hace que quepan más compases por línea — la
            // misma razón por la que se quitaron los topes de ancho (O-56).
            //
            // Y se transpone con `totalSemitones`, EL MISMO que los acordes:
            // ahí ya están el tono del culto, los ± del músico y su
            // instrumento. Si la melodía se moviera por su cuenta, el
            // trompetista leería una cosa y el grupo tocaría otra.
            <div className={cn("flex w-full flex-col", isFullscreen ? "gap-2" : "gap-4")}>
              {tramos.map((t, i) => (
                <section key={i}>
                  {t.titulo && (
                    <h3
                      className="mb-1 font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400"
                      style={{ fontSize: `${0.75 * fontScale}rem` }}
                    >
                      {t.titulo}
                    </h3>
                  )}
                  <Pentagrama
                    elementos={parsearMelodia(t.abc)}
                    tono={song?.original_key || "C"}
                    transponer={semitonosMelodia}
                    escala={escalaMelodia}
                  />
                </section>
              ))}
            </div>
          ) : mostrandoLetra ? (
            // ── LA LETRA (J.4) ──
            //
            // Reparte las estrofas EXACTAMENTE igual que los acordes: una,
            // dos o tres columnas, y por FILAS o por COLUMNAS (O-26). Al
            // principio se dibujaba siempre en multi-columna, así que el
            // recorrido por filas no hacía nada — lo vio Isaac usándolo.
            // Quien canta ajusta la lectura igual que quien toca.
            <div
              className={cn(
                "mx-auto",
                columns === 1
                  ? cn("flex w-full flex-col", isFullscreen ? "gap-3" : "gap-5")
                  : recorrido === "columnas"
                    ? "w-full"
                    : cn(
                        "grid items-start gap-x-8",
                        columns === 2 ? "grid-cols-2" : "grid-cols-3",
                        isFullscreen ? "gap-y-3" : "gap-y-5"
                      )
              )}
              style={
                columns > 1 && recorrido === "columnas"
                  ? { columnCount: columns, columnGap: "2rem" }
                  : undefined
              }
            >
              {estrofas.map((e, i) => {
                const bloque = (
                  <>
                    {e.titulo && (
                      <h3
                        className="mb-1 font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400"
                        style={{ fontSize: `${0.75 * fontScale}rem` }}
                      >
                        {e.titulo}
                      </h3>
                    )}
                    {/* Los saltos de línea SON el contenido de una letra. */}
                    <p
                      className="whitespace-pre-line leading-snug text-slate-900 dark:text-slate-50"
                      style={{ fontSize: `${1.35 * fontScale}rem` }}
                    >
                      {e.texto}
                    </p>
                  </>
                );
                // En multi-columna hace falta el envoltorio con
                // `break-inside: avoid`, o una estrofa se parte por la mitad
                // entre dos columnas. En rejilla cada hijo ya es una celda.
                return columns > 1 && recorrido === "columnas" ? (
                  <div
                    key={i}
                    className={cn("break-inside-avoid", isFullscreen ? "mb-4" : "mb-6")}
                    style={{ breakInside: "avoid" }}
                  >
                    {bloque}
                  </div>
                ) : (
                  <section key={i}>{bloque}</section>
                );
              })}
            </div>
          ) : sections.length > 0 ? (
            // Los acordes se pueden pulsar para ver cómo se tocan (fase I).
            // `bemoles` viene de la tonalidad, o un `Cm7` se dibujaría con
            // «D# A#» en vez de «Eb Bb» y a un músico le chirría.
            // Dos maneras de repartir las secciones en varias columnas (O-26):
            //
            //   FILAS    → CSS grid. Se llena de izquierda a derecha y luego
            //              baja: A B / C D. Es lo de siempre.
            //   COLUMNAS → CSS multi-columna. Se llena la primera columna de
            //              arriba abajo y luego la siguiente: A C / B D.
            //
            // Para "columnas" se usa multi-columna y NO `grid-auto-flow: column`,
            // que era lo primero que se pensó: el grid por columnas obliga a
            // fijar cuántas filas hay, y como las secciones miden distinto
            // (un puente no ocupa lo que un coro) deja huecos grandes al
            // alinear las filas. Multi-columna reparte por altura y las
            // equilibra sola. `break-inside: avoid` impide lo único malo que
            // podría hacer: partir una sección entre dos columnas.
            <ChordPopoverProvider bemoles={flats}>
            {/* 🔴 SIN TOPE DE ANCHO. Lo cazo Isaac el 2026-09-02: *«¿por que las
                estructuras no aprovechan del ancho de la pantalla? mira que
                tambien mucho espacio y no se aprovecha para nada»*.
                Y tenia razon: la rejilla llevaba `max-w-6xl` / `max-w-7xl`
                —1152 y 1280 px—, asi que en un monitor ancho **se dejaba a los
                lados todo lo que sobrara de ahi**. Un tope de ancho tiene
                sentido en un texto que se lee de corrido —lineas muy largas
                cansan— pero **esto es una cuadricula de acordes que se lee de un
                vistazo**: cuanto mas ancha, mas compases por fila y menos
                envolver. */}
            <div
              className={cn(
                "mx-auto",
                columns === 1
                  ? cn("flex w-full flex-col", isFullscreen ? "gap-1.5" : "gap-4")
                  : recorrido === "columnas"
                    ? "w-full"
                    : cn(
                        "grid items-start gap-x-6",
                        columns === 2 ? "grid-cols-2" : "grid-cols-3",
                        isFullscreen ? "gap-y-1.5" : "gap-y-4"
                      )
              )}
              style={
                columns > 1 && recorrido === "columnas"
                  ? { columnCount: columns, columnGap: "1.5rem" }
                  : undefined
              }
            >
              {/* 📌 O-52 · `SeccionRepartida` en vez de `TablaturePreview` a
                  secas. Una sección que cabe se dibuja EXACTAMENTE igual que
                  antes; una que no cabe se reparte entre varias casillas, así
                  que lo que sigue cae en la casilla siguiente —arriba-derecha o
                  abajo-izquierda según el recorrido— en vez de apretarse.
                  Isaac ya no tiene que partir a mano una sección en dos. */}
              {sections.map((sec, i) => (
                <SeccionRepartida
                  key={i}
                  notes={sec.content}
                  label={sec.title}
                  fontScale={fontScale}
                  dense
                  // El envoltorio es lo que se mantiene entero dentro de una
                  // columna; el margen hace de separación entre secciones,
                  // porque en multi-columna `gap` no aplica.
                  claseCelda={
                    columns > 1 && recorrido === "columnas"
                      ? cn("break-inside-avoid", isFullscreen ? "mb-1.5" : "mb-4")
                      : undefined
                  }
                  estiloCelda={
                    columns > 1 && recorrido === "columnas" ? { breakInside: "avoid" } : undefined
                  }
                />
              ))}
            </div>
            </ChordPopoverProvider>
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
