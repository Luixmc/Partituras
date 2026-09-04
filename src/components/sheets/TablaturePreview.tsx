"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { useAbrirAcorde } from "@/components/sheets/ChordPopover";
import { Grid2X2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NoteFigure, RestFigure, FermataFigure, SlurFigure, FIGURA_ALTO } from "@/components/sheets/MusicFigures";

type Props = {
  notes: string;
  compact?: boolean;
  label?: string;
  /** Escala de la letra (1 = normal). */
  fontScale?: number;
  /** Compacta los márgenes (título de sección y contenido) para ganar espacio. */
  dense?: boolean;
  /**
   * Dibuja SOLO un tramo de la sección: `[desde, hasta)` en índices de segmento
   * (O-52). Sirve para que una sección larga se reparta en varias casillas de
   * la rejilla en vez de apretarse en una sola.
   *
   * 🔴 Se corta por SEGMENTO y no por compás a propósito: un recuadro de
   * casilla 1ª/2ª vez (`{ Bb }1 { Gm7 }2`) son varios compases que forman UN
   * solo bloque visual, y partirlo por el medio dejaría media casilla suelta.
   *
   * Los compases se siguen leyendo enteros para las ligaduras, así que un arco
   * que cruce el corte sigue sabiendo lo que tiene al lado.
   */
  segmentos?: [number, number];
};

type NoteToken = {
  root: string;
  suffix: string;
  duration: number | null;
  text?: string;
  rest?: boolean;
  repeat?: boolean; // "%": repetición de un acorde (se dibuja como acorde)
  tieNext?: boolean; // ligadura: une este acorde con el siguiente por arriba
  fermata?: boolean; // calderón: acorde de pausa/alargación
  staccato?: boolean; // staccato: punto debajo de la figura (se escribe "!")
  soloFigura?: boolean; // duración suelta, sin acorde: se dibuja solo la figura
  timeSig?: string; // cambio de compás inline (ej. "6/8")
  lyric?: string; // texto entre paréntesis, se muestra debajo del acorde
  chordLabel?: string; // texto <...>: se dibuja como un acorde pero en amarillo
  raw: string;
};

type Measure = {
  notes: NoteToken[];
  repeatStart: boolean;
  repeatEnd: boolean;

  // Recuadro (casilla / final 1 ó 2): compases con el mismo boxId van juntos
  // dentro de un recuadro, con boxLabel encima.
  boxId?: number;
  boxLabel?: string;
};

// Marcador interno: espacios DENTRO de un paréntesis para que el texto entre
// paréntesis (aunque tenga varias palabras) no se parta al separar por espacios.
const SP = "";

export function parseMeasures(value: string): Measure[] {
  if (typeof value !== "string") return [];

  // 1) Protegemos el texto entre paréntesis: sus espacios internos se sustituyen
  //    por un marcador para que "(mi Dios)" quede como un solo token y no se
  //    interprete cada palabra (p. ej. "Dios") como un acorde.
  const withParens = value
    .replace(/[\n\r\t]/g, " ")
    .replace(/\(([^)]*)\)/g, (_m, inner: string) => ` (${inner.trim().split(/\s+/).join(SP)}) `)
    // Texto entre <...>: se trata como un solo token (sus espacios se protegen).
    .replace(/<([^>]*)>/g, (_m, inner: string) => ` <${inner.trim().split(/\s+/).join(SP)}> `);

  // 2) Protegemos signos de repetición y llaves antes de separar las barras.
  const spaced = withParens
    .replace(/\|:/g, " §RS§ ")
    .replace(/:\|/g, " §RE§ ")
    .replace(/\|/g, " §BAR§ ")
    .replace(/\{/g, " { ")
    .replace(/\}(\d*)/g, " }$1 ")
    // 🔴 Este separador SE QUEDA aunque el salto de línea se eliminara (O-62):
    // es lo que convierte un ";" pegado a otra cosa en un token suelto, para
    // que la rama que lo DESCARTA lo reconozca. Sin esto, un "A;B" escrito en
    // un borrador —que no se puede leer para comprobarlo— se pintaría como
    // texto en la cuadrícula.
    .replace(/;/g, " ; ");

  const parts = spaced
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const measures: Measure[] = [];
  let current: Measure = { notes: [], repeatStart: false, repeatEnd: false };

  // Estado del recuadro actual.
  let boxCounter = 0;
  let currentBoxId: number | null = null;
  const boxLabels = new Map<number, string>();

  const hasContent = (m: Measure) => m.notes.length > 0 || m.repeatStart || m.repeatEnd;
  const flush = () => {
    if (hasContent(current)) {
      if (currentBoxId !== null) current.boxId = currentBoxId;
      measures.push(current);
    }
    current = { notes: [], repeatStart: false, repeatEnd: false };
  };

  for (const part of parts) {
    if (part === "{") {
      // Inicio de recuadro: arranca en un límite de compás.
      flush();
      boxCounter += 1;
      currentBoxId = boxCounter;
      continue;
    }
    const closeBox = part.match(/^\}(\d*)$/);
    if (closeBox) {
      // Fin de recuadro: el compás actual se cierra dentro del recuadro.
      flush();
      if (currentBoxId !== null) boxLabels.set(currentBoxId, closeBox[1] || "");
      currentBoxId = null;
      continue;
    }
    if (part === "§RS§") {
      flush();
      current.repeatStart = true;
      continue;
    }
    if (part === "§RE§") {
      // 🔴 Si el compás actual está VACÍO, el cierre se pega al último que ya
      // hay en vez de abrir uno nuevo (O-64).
      //
      // Pasa siempre que el ":|" viene justo detrás de algo que ya cerró compás
      // —"}2:|" al final de una casilla, o "| :|"—: ahí `current` no tiene notas,
      // pero `hasContent` lo daba por bueno solo por llevar el signo, y se
      // empujaba un **compás fantasma** que solo contenía el ":|".
      //
      // Y eso no era cosmético desde O-52: **ese fantasma cuenta como un bloque
      // para el reparto**, así que ocupaba sitio en la fila y podía irse él solo a
      // la siguiente. Isaac lo vio en el teléfono con «Es Por Tu Gracia»: las
      // casillas arriba y el ":|" colgando debajo.
      //
      // 📌En una partitura el signo cierra el compás anterior; no vive solo.
      if (!current.notes.length && measures.length) {
        measures[measures.length - 1].repeatEnd = true;
        continue;
      }
      current.repeatEnd = true;
      flush();
      continue;
    }
    if (part === "§BAR§") {
      flush();
      continue;
    }

    // 🔴 El SALTO DE LÍNEA (";") se ELIMINÓ (O-62). Existía para cortar una
    // sección a mano, y la página ya la reparte sola midiendo lo que cabe en
    // cada aparato — que es algo que no se puede acertar a mano para todos los
    // tamaños a la vez.
    //
    // ⚠️ Pero se sigue ACEPTANDO y se DESCARTA en silencio, y no es por nostalgia:
    // los 8 borradores no se pueden leer con la clave pública, así que **no se
    // sabe si alguno lleva un `;` escrito**. Si esta rama desapareciera, ese `;`
    // caería en el `else` de abajo y **se dibujaría como texto suelto en la
    // cuadrícula** — peor que la función que se está quitando.
    // 📌 Es T-07 aplicada a los datos: quitar solo es seguro cuando ya nadie lo
    // pide, y de los borradores no se sabe. Aceptar y descartar cuesta una línea.
    if (part === ";") continue;

    // Ligadura / ligado: "~" suelto une el acorde anterior con el siguiente.
    if (part === "~") {
      const prev = current.notes[current.notes.length - 1];
      if (prev && (prev.root || prev.rest || prev.repeat || prev.duration != null)) prev.tieNext = true;
      continue;
    }

    // Calderón (fermata): el `^` se quita del token y marca el acorde.
    const fermata = part.includes("^");
    let core = fermata ? part.replace(/\^/g, "") : part;

    // Staccato: "!" pegado al token (C:1!). Se eligió "!" y no el punto porque
    // el punto ya es el decimal de la duración (:1.5, :0.25) y habría vuelto
    // ambiguas las canciones ya escritas (D-08).
    // ⚠️ Dentro de un texto —"<Conteo 1, 2, 3, Sube!>" o "(¡vamos!)"— el "!" es
    //    parte de lo que se quiere leer, no un staccato. Sin esta comprobación
    //    se lo comía: lo cazó la comparación contra las 75 canciones.
    const esTexto = core.startsWith("<") || core.startsWith("(");
    const staccato = !esTexto && core.includes("!");
    if (staccato) core = core.replace(/!/g, "");

    // Ligadura pegada al final del acorde (p. ej. "C~"): marca el acorde y se quita.
    let tieNext = false;
    if (core.length > 1 && core.endsWith("~")) {
      tieNext = true;
      core = core.slice(0, -1);
    }

    // Duración SUELTA, sin acorde delante (":1", ":0.5"). Se dibuja la figura
    // sola, en el mismo sitio donde va la de los acordes (O-01). Antes esto
    // caía en el "si no es nada, píntalo como texto gris".
    const soloDuracion = core.match(/^:(\d+(?:\.\d+)?)$/);
    if (soloDuracion) {
      current.notes.push({
        root: "", suffix: "", duration: parseFloat(soloDuracion[1]),
        soloFigura: true, fermata, staccato, tieNext, raw: part,
      });
      continue;
    }

    // Repetición de acorde: "%" se dibuja con las mismas características que un
    // acorde, y ADMITE DURACIÓN igual que ellos ("%:4", "%:2"…).
    //
    // 🔴 Antes se comparaba `core === "%"`, exacto, así que **`%:4` no encajaba
    // y salía escrito tal cual en amarillo**, como un texto. Lo vio Isaac con
    // una captura (O-50). Y aunque hubiera encajado, la fila se guardaba con
    // `duration: null` fijo: el "%" nunca pudo llevar duración.
    //
    // 📌 Y hace falta de verdad: el "%" dice «vuelve a tocar el acorde de
    // antes», y **cuánto dura ese golpe es justo lo que hay que indicar** —
    // sin eso el compás no puede repartir sus tiempos.
    const repeticion = /^%(?::([0-9]*\.?[0-9]+))?$/.exec(core);
    if (repeticion) {
      current.notes.push({
        root: "",
        suffix: "",
        duration: repeticion[1] ? parseFloat(repeticion[1]) : null,
        repeat: true,
        fermata,
        staccato,
        tieNext,
        raw: part,
      });
      continue;
    }

    // Cambio de compás inline (2/4, 6/8, 12/8...).
    if (/^\d{1,2}\/\d{1,2}$/.test(core)) {
      current.notes.push({ root: "", suffix: "", duration: null, timeSig: core, raw: part });
      continue;
    }

    // Texto <...>: se dibuja como una CELDA de acorde (mismo tamaño, centrado)
    // en amarillo, fluyendo con los demás acordes. Si es largo, su texto se
    // ajusta dentro de la celda (no se desborda).
    if (core.length > 2 && core.startsWith("<") && core.endsWith(">")) {
      const labelText = core.slice(1, -1).split(SP).join(" ");
      current.notes.push({
        root: "", suffix: "", duration: null, chordLabel: labelText, fermata, staccato, tieNext, raw: part,
      });
      continue;
    }

    const isText = core.startsWith("(") && core.endsWith(")");
    if (isText) {
      const lyric = core.slice(1, -1).split(SP).join(" ");
      // Se adjunta debajo del acorde/silencio anterior; si no hay, queda suelto.
      const prev = current.notes[current.notes.length - 1];
      if (prev && (prev.root || prev.rest || prev.repeat)) {
        prev.lyric = prev.lyric ? `${prev.lyric} ${lyric}` : lyric;
      } else {
        current.notes.push({ root: "", suffix: "", duration: null, text: lyric, raw: part });
      }
      continue;
    }

    // Silencio: "Z" con duración opcional (Z:4, Z:2, Z:1.5, Z:1, Z:0.5, Z:0.25).
    const restMatch = core.match(/^[Zz](?::(\d+(?:\.\d+)?))?$/);
    if (restMatch) {
      const duration = restMatch[1] ? parseFloat(restMatch[1]) : null;
      current.notes.push({ root: "", suffix: "", duration, rest: true, fermata, staccato, tieNext, raw: part });
      continue;
    }

    const match = core.match(/^([A-G])(.*)$/);
    if (match) {
      let rest = match[2];
      let duration: number | null = null;
      const durMatch = rest.match(/:(\d+(?:\.\d+)?)$/);
      if (durMatch) {
        duration = parseFloat(durMatch[1]);
        rest = rest.slice(0, rest.lastIndexOf(":"));
      }
      current.notes.push({ root: match[1], suffix: rest, duration, fermata, staccato, tieNext, raw: part });
    } else {
      current.notes.push({ root: "", suffix: "", duration: null, text: core, fermata, raw: part });
    }
  }

  flush();

  // Aplicamos la etiqueta (número) del recuadro a todos sus compases.
  for (const m of measures) {
    if (m.boxId != null) m.boxLabel = boxLabels.get(m.boxId) ?? "";
  }

  return measures;
}

// Sustituye los nombres largos por su símbolo musical en el sufijo del acorde.
// Solo cambia CÓMO SE VE: el texto guardado sigue diciendo "maj7" y "dim", así
// que las canciones ya escritas no se tocan.
//   "Cmaj7" → "CΔ"   ·   "Gmaj7/B" → "GΔ/B"
//   "Cdim"  → "C°"   ·   "Cdim7"   → "C°7"
// "m7b5" (semidisminuido) se deja tal cual, por decisión de Isaac (O-04).
export function formatSuffix(suffix: string): string {
  return suffix.replace(/maj7/gi, "Δ").replace(/dim/gi, "°");
}

function NoteCell({ token, beamed = false, dense = false }: { token: NoteToken; beamed?: boolean; dense?: boolean }) {
  // Color base de notas; bajos y alteraciones usan EXACTAMENTE el mismo.
  const noteColor = "text-slate-950 dark:text-slate-50";
  // `null` cuando los acordes no son pulsables (edición, impresión).
  const abrirAcorde = useAbrirAcorde();

  let content: ReactNode;
  if (token.timeSig) {
    // Cambio de compás: numerador sobre denominador (2/4, 6/8, ...).
    const [num, den] = token.timeSig.split("/");
    content = (
      <span className={cn("flex flex-col items-center font-bold", noteColor)} style={{ fontSize: "1.05em", lineHeight: 0.85 }}>
        <span>{num}</span>
        <span>{den}</span>
      </span>
    );
  } else if (token.rest) {
    // Silencio: la propia figura indica la duración.
    //
    // 🔴 EL ALTO DEL SILENCIO SE ATA AL DE UN ACORDE. No se escribe a mano.
    //
    // Isaac, 2026-09-02: *«el silencio no se comporta de la misma manera que lo
    // hacen los {}1{}2»*, y luego *«falta poco»*. **Medido, faltaban 16 px**: un
    // cuadro con silencio media 171 px contra los 155 px de uno normal.
    //
    // La causa no se veia leyendo esta linea: `RestFigure` dibuja su SVG con
    // alto `--figura-alto` (1,6), asi que poniendo el span a `1.5em` el silencio
    // acababa midiendo **1,5 x 1,6 = 2,4em**, cuando un acorde mide `1.5em`.
    // Dos numeros escritos en archivos distintos que tenian que cuadrar.
    //
    // 🔴 El arreglo NO es encogerlo. Se probo —dividir el tamaño por
    // `--figura-alto`— y quedaba **ridiculo**: el silencio de blanca es una
    // barrita dentro de un lienzo alto, asi que al encoger el lienzo la barra
    // casi desaparece. Se veia en la captura.
    //
    // → **La caja mide lo de un acorde (`1.5em`) y el dibujo se sale por
    // encima.** El silencio conserva su tamaño de siempre pero **no empuja
    // nada**: se desborda hacia el hueco que la celda ya reserva arriba para la
    // figura — hueco que en un silencio esta VACIO, porque la figura ES el
    // silencio. Espacio que estaba desaprovechado y ahora se usa.
    //
    // Es el mismo patron que la figura del acorde y que el numero de casilla:
    // **lo que no es contenido no ocupa sitio en el flujo.**
    content = (
      // La caja mide lo de un acorde y **no crece**; el dibujo va ABSOLUTO,
      // centrado sobre ella. Con `height` a secas no bastaba —medido: subiendo
      // el silencio de 2,1 a 3em la celda pasaba de 160 a 181 px—, porque el
      // SVG seguia contando para el alto. Absoluto no cuenta, y punto.
      <span
        className="relative block leading-none text-slate-500 dark:text-slate-200"
        style={{ height: "1.5em", width: "1.5em" }}
      >
        <span
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          style={{ fontSize: `calc(3em / ${FIGURA_ALTO})` }}
        >
          <RestFigure beats={token.duration ?? 4} />
        </span>
      </span>
    );
  } else if (token.repeat) {
    // Repetición de acorde ("%"): mismas características que un acorde.
    content = (
      <span className={cn("whitespace-nowrap font-bold leading-none", noteColor)} style={{ fontSize: "1.5em" }}>
        %
      </span>
    );
  } else if (token.root) {
    // Acorde completo (raíz + alteraciones + bajo) con un solo tamaño y color.
    //
    // Es el ÚNICO elemento que se puede pulsar para ver cómo se toca: los
    // silencios, los textos y las etiquetas no son acordes. Si `abrirAcorde`
    // es null —en edición y al imprimir— se dibuja exactamente como antes,
    // sin botón y sin cambiar nada del aspecto.
    const texto = (
      <span className={cn("whitespace-nowrap font-bold leading-none", noteColor)} style={{ fontSize: "1.5em" }}>
        {token.root}
        {formatSuffix(token.suffix)}
      </span>
    );
    content = abrirAcorde ? (
      <button
        type="button"
        // `rounded`+`hover` es toda la pista de que se puede pulsar: un color
        // distinto competiría con el amarillo de los textos y con el arco de
        // las ligaduras, y esto se lee tocando.
        className="cursor-pointer rounded px-0.5 transition-colors hover:bg-brand-100 dark:hover:bg-brand-900"
        aria-label={`Ver cómo se toca ${token.root}${token.suffix}`}
        onClick={(e) => {
          e.stopPropagation();
          abrirAcorde(`${token.root}${token.suffix}`, e.currentTarget.getBoundingClientRect());
        }}
      >
        {texto}
      </button>
    ) : (
      texto
    );
  } else if (token.chordLabel) {
    // Texto <...>: mismas características que un acorde pero en amarillo. La celda
    // se dimensiona a su texto (legible, en una línea); el salto a otra fila lo
    // hace el compás (que envuelve cuando hay etiquetas) sin partir palabras.
    content = (
      <span
        className="etiqueta whitespace-nowrap font-bold leading-tight text-yellow-500 dark:text-yellow-300"
        style={{ fontSize: "1.5em" }}
      >
        {token.chordLabel}
      </span>
    );
  } else if (token.soloFigura) {
    // Duración suelta: sigue sonando el acorde anterior, así que NO se repite su
    // nombre —para eso está el "%"—; solo se marca el golpe con la figura, que
    // ya se dibuja arriba.
    //
    // La celda ocupa lo MISMO que un acorde (misma altura de línea) aunque vaya
    // vacía: si fuera más estrecha, el compás se descuadraría y la figura
    // quedaría desalineada de las demás. Es un golpe más del compás y tiene que
    // ocupar como tal.
    content = <span className="block leading-none" style={{ fontSize: "1.5em" }}>&nbsp;</span>;
  } else if (token.text) {
    content = (
      <span
        className="etiqueta text-center italic leading-tight text-amber-700 dark:text-amber-300"
        style={{ fontSize: "0.7em" }}
      >
        {token.text}
      </span>
    );
  } else {
    content = <span className="text-center text-slate-400 dark:text-slate-500">{token.raw}</span>;
  }

  return (
    <div
      // `data-celda` lo usa el arco de ligadura para medir dónde está cada
      // acorde: "nota" es lo que suena, "texto" es lo que solo se lee.
      data-celda={token.root || token.rest || token.repeat || token.duration != null ? "nota" : "texto"}
      // Celda del tamaño de su contenido (no se estira). El compás centra el
      // grupo de acordes y un gap los separa. El padding vertical centra y deja
      // sitio arriba para el calderón/figura. La letra (paréntesis) va debajo.
      className="relative flex flex-col items-center justify-center text-center"
      style={{
        // La duración suelta reserva algo más de ancho: sin texto que la
        // sostenga, se quedaba pegada al acorde de al lado.
        minWidth: token.soloFigura ? (dense ? "1.4em" : "1.8em") : dense ? "1em" : "1.3em",
        // 🔴 EL HUECO DE ARRIBA SE CALCULA, no se escribe a mano.
        //
        // La figura va en un `<span>` ABSOLUTO pegado arriba, así que **no
        // empuja nada**: si no cabe en este padding, se sale y cae encima del
        // acorde. Es justo lo que pasó al agrandarlas a 1,6 (O-53): el hueco
        // seguía valiendo `0.95em`, de cuando medían 1.
        //
        // La figura ocupa `FIGURA_ALTO × 0.85em` —el 0.85 es el `fontSize` de
        // su span—, más un respiro. Atado así, el día que cambie el tamaño el
        // hueco cambia solo.
        paddingTop: `calc(${FIGURA_ALTO} * 0.85em + 0.12em)`,
        paddingBottom: dense ? "0.6em" : "0.95em",
        paddingLeft: dense ? "0.08em" : "0.15em",
        paddingRight: dense ? "0.08em" : "0.15em",
      }}
    >
      {!token.rest && !token.timeSig && (token.fermata || token.duration) && (
        <span
          className="figura absolute inset-x-0 top-0 flex justify-center text-slate-400 dark:text-slate-300"
          // El alto del span y el hueco de la celda salen del MISMO número.
          style={{ fontSize: "0.85em", height: `calc(${FIGURA_ALTO} * 1em)` }}
        >
          {token.fermata ? <FermataFigure /> : <NoteFigure beats={token.duration!} beamed={beamed} />}
        </span>
      )}
      {content}
      {/* Staccato: el punto va DEBAJO de la nota, como en la partitura. */}
      {token.staccato && (
        <span
          aria-hidden
          className="figura block leading-none text-slate-700 dark:text-slate-200"
          style={{ fontSize: "1.1em", marginTop: "-0.15em" }}
        >
          •
        </span>
      )}
      {token.lyric && (
        <span
          className="etiqueta mt-0.5 whitespace-nowrap italic leading-none text-amber-700 dark:text-amber-300"
          style={{ fontSize: "0.62em" }}
        >
          {token.lyric}
        </span>
      )}
    </div>
  );
}

function RepeatGlyph({ side }: { side: "start" | "end" }) {
  return (
    <div
      className="flex w-4 items-center justify-center self-stretch font-bold text-brand-600 dark:text-brand-300"
      style={{ fontSize: "1.2em" }}
    >
      {side === "start" ? "𝄆" : "𝄇"}
    </div>
  );
}

// Segmento de acordes dentro de un compás: nota suelta o grupo unido por viga.
type ChordSeg =
  | { type: "single"; token: NoteToken }
  | { type: "beam"; tokens: NoteToken[]; beats: number };

// Una nota se puede unir por viga si es un acorde de corchea (0.5) o
// semicorchea (0.25) y no lleva calderón.
function isBeamable(t: NoteToken): boolean {
  return !!t.root && !t.fermata && (t.duration === 0.5 || t.duration === 0.25);
}

// Agrupa corcheas/semicorcheas consecutivas de IGUAL duración (mínimo 2) en
// grupos con viga; el resto quedan como notas sueltas (con su corchete).
function beamSegments(chords: NoteToken[]): ChordSeg[] {
  const out: ChordSeg[] = [];
  let i = 0;
  while (i < chords.length) {
    const t = chords[i];
    if (isBeamable(t)) {
      let j = i + 1;
      while (j < chords.length && isBeamable(chords[j]) && chords[j].duration === t.duration) j++;
      if (j - i >= 2) {
        out.push({ type: "beam", tokens: chords.slice(i, j), beats: t.duration! });
        i = j;
        continue;
      }
    }
    out.push({ type: "single", token: t });
    i++;
  }
  return out;
}

// Grupo de notas unidas por viga: dibuja las plicas (sin corchete) y la barra
// horizontal que las conecta por arriba (doble barra para semicorcheas).
function BeamGroup({ tokens, beats, dense = false }: { tokens: NoteToken[]; beats: number; dense?: boolean }) {
  const n = tokens.length;
  const inset = `${50 / n}%`; // aproxima el centro del primer/último acorde
  const doubleBeam = beats <= 0.25;
  return (
    <div className={cn("relative flex items-stretch", dense ? "gap-[0.3em]" : "gap-[0.5em]")}>
      {tokens.map((t, i) => (
        <NoteCell key={i} token={t} beamed dense={dense} />
      ))}
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-[1px] bg-slate-400 dark:bg-slate-300"
        style={{ top: "0.1em", left: inset, right: inset, height: "0.16em" }}
      />
      {doubleBeam && (
        <span
          aria-hidden
          className="pointer-events-none absolute rounded-[1px] bg-slate-400 dark:bg-slate-300"
          style={{ top: "0.34em", left: inset, right: inset, height: "0.16em" }}
        />
      )}
    </div>
  );
}

/**
 * Elementos unidos por ligadura, con UN arco que va del centro del primero al
 * centro del último.
 *
 * El arco se coloca MIDIENDO dónde acaba cada celda, no por porcentaje. Antes
 * se calculaba "la mitad del grupo hacia dentro", y eso solo acierta si todos
 * los acordes miden lo mismo: en `F ~ G7` el arco se quedaba corto, porque "F"
 * es mucho más estrecho que "G7".
 *
 * Y se mide del primer al último elemento CON SONIDO: si en medio hay un texto
 * —como el `-` de `F# ~ - D`, que significa "por semitonos"—, el arco pasa por
 * encima en vez de acabar en él.
 */
function TieGroup({ tokens, dense = false }: { tokens: NoteToken[]; dense?: boolean }) {
  const cajaRef = useRef<HTMLDivElement>(null);
  const [arco, setArco] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const caja = cajaRef.current;
    if (!caja) return;

    const medir = () => {
      const celdas = Array.from(caja.querySelectorAll<HTMLElement>("[data-celda]"));
      // Solo cuentan las que suenan: un texto intermedio no es el final del arco.
      const suenan = celdas.filter((c) => c.dataset.celda === "nota");
      if (suenan.length < 2) return setArco(null);
      const base = caja.getBoundingClientRect();
      const a = suenan[0].getBoundingClientRect();
      const b = suenan[suenan.length - 1].getBoundingClientRect();
      const centroA = a.left + a.width / 2 - base.left;
      const centroB = b.left + b.width / 2 - base.left;
      setArco({ left: centroA, width: Math.max(0, centroB - centroA) });
    };

    medir();
    // El ancho cambia al redimensionar, al cambiar el zoom o al girar el móvil.
    const obs = new ResizeObserver(medir);
    obs.observe(caja);
    return () => obs.disconnect();
  }, [tokens, dense]);

  return (
    <div ref={cajaRef} className={cn("relative flex items-stretch", dense ? "gap-[0.3em]" : "gap-[0.5em]")}>
      {beamSegments(tokens).map((seg, si) =>
        seg.type === "single" ? (
          <NoteCell key={si} token={seg.token} dense={dense} />
        ) : (
          <BeamGroup key={si} tokens={seg.tokens} beats={seg.beats} dense={dense} />
        )
      )}
      {arco && arco.width > 0 && (
        <span
          aria-hidden
          className="figura pointer-events-none absolute top-0 z-10 text-slate-500 dark:text-slate-300"
          style={{ left: arco.left, width: arco.width, height: "0.55em" }}
        >
          <SlurFigure />
        </span>
      )}
    </div>
  );
}

/** Parte los acordes en grupos: los unidos por ligadura van juntos. */
function tieSegments(chords: NoteToken[]): { tokens: NoteToken[]; tied: boolean }[] {
  // Un texto intercalado no rompe la ligadura ni la termina: el `-` de
  // "F# ~ - D" quiere decir "por semitonos", y el arco tiene que llegar al D.
  const suena = (t: NoteToken) =>
    Boolean(t.root || t.rest || t.repeat || t.duration != null);

  const out: { tokens: NoteToken[]; tied: boolean }[] = [];
  let i = 0;
  while (i < chords.length) {
    let j = i;
    // Mientras el de turno esté ligado, se salta hasta el SIGUIENTE QUE SUENE.
    while (chords[j].tieNext) {
      let k = j + 1;
      while (k < chords.length && !suena(chords[k])) k++;
      if (k >= chords.length) break; // la ligadura cruza el compás: la pinta MeasureBlock
      j = k;
    }
    if (j > i) {
      out.push({ tokens: chords.slice(i, j + 1), tied: true });
      i = j + 1;
      continue;
    }
    out.push({ tokens: [chords[i]], tied: false });
    i++;
  }
  return out;
}


function MeasureBlock({
  measure,
  noBar = false,
  dense = false,
  saleLigado = false,
  entraLigado = false,
}: {
  /** El último acorde queda ligado al compás siguiente (Ebmaj7 ~ | %). */
  saleLigado?: boolean;
  /** El primer acorde viene ligado del compás anterior. */
  entraLigado?: boolean;
  measure: Measure;
  noBar?: boolean;
  dense?: boolean;
}) {
  // 🔴 O-54 · CUANTO CRECE ESTE COMPAS. **No es `totalBeats`, y aqui esta el
  // porque**, que Isaac tuvo que decir tres veces:
  //
  //   *«el silencio de blanca coge mucho espacio… de la estructura b, el 75 % lo
  //    ocupa el compas del silencio»*  ·  *«AUN EL SILENCIO SE COME EL ESPACIO,
  //    LO MISMO AHORA OCURRE CON LAS SECCIONES QUE SE MARCAN EN AMARILLO Y CON
  //    LAS REPETICIONES DEL {}1{}2»*
  //
  // La causa: el ancho iba por TIEMPOS, y `totalBeats` mezcla dos cosas — cuando
  // el compas trae duraciones escritas son tiempos de verdad, y cuando no, es
  // **el numero de acordes**. `A7` solo dura el compas entero pero cuenta 1,
  // mientras `z:4` cuenta 4. Comparar los dos es lo que hacia que un silencio
  // —UN simbolo— se llevara cuatro veces el ancho de un acorde.
  //
  // → **El ancho lo decide CUANTO HAY QUE DIBUJAR.** Un compas con un simbolo
  // ocupa lo de un simbolo, tenga los tiempos que tenga. Lo mismo vale para los
  // recuadros `{}1 {}2` y para las secciones de texto amarillo, que tambien se
  // hinchaban por lo mismo.
  //
  // ⚠️ Lo que se pierde, dicho claro: **el ancho deja de contar el tiempo**. Ese
  // era el diseño del primo —«la duracion controla el ancho relativo»— pero se
  // rompia justo donde mas se nota. El tiempo se sigue leyendo donde toca: en la
  // FIGURA que va encima de cada acorde.
  const crecimiento = Math.max(1, measure.notes.length);
  // El compás (timeSig) se muestra a la IZQUIERDA; los acordes se centran aparte.
  const timeSigs = measure.notes.filter((n) => n.timeSig);
  const chords = measure.notes.filter((n) => !n.timeSig);
  // Si el compás incluye etiquetas <...>, permitimos que las celdas envuelvan a
  // otra línea (las etiquetas son anchas); los acordes normales no envuelven.
  const hasLabel = chords.some((c) => c.chordLabel);
  return (
    <div
      // Cada compás crece según sus tiempos; los compases se reparten la fila.
      // Borde derecho fino = barra de tempo (se omite en el último de un recuadro).
      className={cn(
        "relative flex items-stretch",
        !noBar && "border-r border-slate-300 dark:border-slate-600"
      )}
      style={{
        flexGrow: crecimiento,
        // De base, el ancho según nº de acordes; crece para llenar la fila. En
        // modo compacto los compases son más estrechos (acordes más juntos).
        flexBasis: `${Math.max(measure.notes.length, 1) * (dense ? 1.7 : 3)}em`,
      }}
    >
      {measure.repeatStart && <RepeatGlyph side="start" />}
      {/* Indicación de compás pegada a la izquierda. */}
      {timeSigs.map((token, ti) => (
        <NoteCell key={`ts-${ti}`} token={token} dense={dense} />
      ))}
      {/* Los acordes se agrupan y CENTRAN dentro del compás, con espacio entre
          ellos. Las corcheas/semicorcheas consecutivas se unen con viga. Con
          etiquetas <...>, las celdas pueden envolver a otra línea. */}
      <div
        className={cn(
          "flex flex-1 items-stretch justify-center",
          dense ? "gap-[0.3em]" : "gap-[0.5em]",
          hasLabel && "flex-wrap gap-y-1"
        )}
      >
        {chords.length ? (
          tieSegments(chords).map((grupo, gi) =>
            grupo.tied ? (
              <TieGroup key={gi} tokens={grupo.tokens} dense={dense} />
            ) : (
              beamSegments(grupo.tokens).map((seg, si) =>
                seg.type === "single" ? (
                  <NoteCell key={`${gi}-${si}`} token={seg.token} dense={dense} />
                ) : (
                  <BeamGroup key={`${gi}-${si}`} tokens={seg.tokens} beats={seg.beats} dense={dense} />
                )
              )
            )
          )
        ) : (
          <div className="min-w-[1.6em] flex-1" />
        )}
      </div>
      {/* Ligadura que cruza la barra de compás: en la partitura se dibuja medio
          arco saliendo de un compás y medio entrando en el siguiente. Aquí
          igual — el arco entero no cabe, porque cada compás es su propia caja. */}
      {saleLigado && (
        <span
          aria-hidden
          className="figura pointer-events-none absolute top-0 right-0 z-10 overflow-hidden text-slate-500 dark:text-slate-300"
          style={{ width: "1.2em", height: "0.55em" }}
        >
          {/* El arco entero mide el doble y se asoma solo su mitad izquierda:
              sale del acorde, sube, y la barra de compás lo corta. */}
          <span className="absolute left-0 top-0 block" style={{ width: "2.4em", height: "0.55em" }}>
            <SlurFigure />
          </span>
        </span>
      )}
      {entraLigado && (
        <span
          aria-hidden
          className="figura pointer-events-none absolute top-0 left-0 z-10 overflow-hidden text-slate-500 dark:text-slate-300"
          style={{ width: "1.2em", height: "0.55em" }}
        >
          {/* Aquí se asoma la mitad derecha: entra por la barra y baja al acorde. */}
          <span className="absolute right-0 top-0 block" style={{ width: "2.4em", height: "0.55em" }}>
            <SlurFigure />
          </span>
        </span>
      )}
      {measure.repeatEnd && <RepeatGlyph side="end" />}
    </div>
  );
}

type Segment = { boxId?: number; label?: string; items: Measure[] };

/**
 * Cuántos bloques visuales tiene una sección: compases y recuadros.
 *
 * 📌 Antes devolvía además `conSaltoManual`, para que quien reparte respetara
 * los cortes escritos a mano con ";". **Esa excepción murió con el salto de
 * línea (O-62): ahora TODAS las secciones se reparten midiendo**, y no queda
 * ninguna forma de desactivarlo.
 */
export function bloquesVisuales(notes: string): { total: number } {
  return { total: groupSegments(parseMeasures(notes)).length };
}

export function groupSegments(measures: Measure[]): Segment[] {
  const segments: Segment[] = [];
  for (const m of measures) {
    const last = segments[segments.length - 1];
    if (m.boxId != null) {
      if (last && last.boxId === m.boxId) last.items.push(m);
      else segments.push({ boxId: m.boxId, label: m.boxLabel ?? "", items: [m] });
    } else {
      // Cada compás sin recuadro es su propio item flexible (como antes).
      segments.push({ items: [m] });
    }
  }
  return segments;
}

/** ¿El último acorde de este compás queda ligado al siguiente? */
function terminaLigado(m: Measure): boolean {
  const suenan = m.notes.filter((n) => !n.timeSig);
  const ultimo = suenan[suenan.length - 1];
  return Boolean(ultimo?.tieNext);
}

export default function TablaturePreview({
  notes,
  compact = false,
  label,
  fontScale = 1,
  dense = false,
  segmentos,
}: Props) {
  const measures = parseMeasures(notes);
  const todos = groupSegments(measures);
  const segments = segmentos ? todos.slice(segmentos[0], segmentos[1]) : todos;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg",
        !compact && "border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      )}
    >
      {(label || !compact) && (
        <div className={cn(
          "flex items-center justify-between border-b border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/60",
          dense ? "px-3 py-0.5" : "px-4 py-2"
        )}>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Grid2X2 className="h-3.5 w-3.5 text-brand-600" />
            {label || "Notas"}
          </div>
        </div>
      )}

      <div
        className={cn(
          "w-full",
          compact ? "p-0" : dense ? "p-1.5" : "p-4",
          compact ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-900"
        )}
      >
        <div
          className={cn(
            "flex flex-wrap items-stretch rounded-lg bg-white dark:bg-slate-900",
            dense ? "gap-y-1" : "gap-y-3"
          )}
          // 📌 La marca es para poder MEDIR desde fuera cuántos compases caben
          // en una fila (O-52). Cada hijo directo de esta caja es un compás —o
          // un recuadro de casilla—, así que agrupándolos por su posición
          // vertical se sabe dónde envuelve la fila. Se mide el dibujo de
          // verdad, no se estima con un número escrito a mano.
          data-rejilla-compases=""
          // Base de la fuente: todo el contenido escala con esto.
          style={{ fontSize: `${16 * fontScale}px` }}
        >
          {measures.length === 0 ? (
            <div className="flex min-h-[64px] w-full items-center justify-center text-sm text-slate-300 dark:text-slate-600">
              Sin notas
            </div>
          ) : (
            segments.map((seg, si) => {
              // Compás suelto (sin recuadro): item flexible directo.
              if (seg.boxId == null) {
                const m = seg.items[0];
                // Una ligadura puede cruzar la barra de compás ("Ebmaj7 ~ | %"):
                // hay que mirar el compás de al lado para saberlo.
                const anterior = measures[measures.indexOf(m) - 1];
                return (
                  <MeasureBlock
                    key={si}
                    measure={m}
                    dense={dense}
                    saleLigado={terminaLigado(m)}
                    entraLigado={Boolean(anterior && terminaLigado(anterior))}
                  />
                );
              }

              // Recuadro (casilla / final 1 ó 2): número arriba + caja con borde.
              // 🔴 O-54 · El recuadro se mide como los compases sueltos: por
              // CUANTOS SIMBOLOS lleva, no por sus tiempos.
              //
              // Se me habia quedado sin arreglar, y lo vio Isaac el 2026-09-02:
              // *«aun sale el problema de los espacios con los {}1{}2 y demas»*.
              // Su captura de «Aceleracion» lo enseña: `{ C | Gm }1` y
              // `{ Z:4 | Dm }2` — el segundo recuadro lleva un silencio de
              // compas entero, asi que con los tiempos contaba **cinco** contra
              // los dos del primero y se llevaba media fila para dibujar lo
              // mismo. **El mismo fallo que el silencio suelto, en otro sitio.**
              const segNotes = seg.items.reduce((s, m) => s + Math.max(m.notes.length, 1), 0);
              return (
                <div
                  key={si}
                  className="relative flex"
                  style={{ flexGrow: segNotes, flexBasis: `${segNotes * 2.4}em` }}
                >
                  {/* 🔴 El numero de casilla NO OCUPA SITIO: va absoluto, en la
                      esquina de la caja.
                      Isaac, 2026-09-02: *«fijate, de largo, para cuando en el
                      compas tiene {}1{}2 sobresale abajo»*. Y su captura lo
                      explica: el numero iba ENCIMA de la caja, dentro del flujo,
                      asi que el recuadro medía «etiqueta + caja» y **estiraba de
                      alto la fila entera** — por eso los compases de al lado
                      (`Dm`, `Bb`) salian centrados con hueco arriba y abajo.
                      Sacandolo del flujo, el recuadro mide **exactamente lo
                      mismo que un compas normal** y la fila deja de crecer.
                      Se queda pequeño (`0.6em`): es una etiqueta, no contenido. */}
                  <span
                    className="pointer-events-none absolute left-1 top-0 z-10 font-bold leading-none text-slate-700 dark:text-slate-100"
                    style={{ fontSize: "0.6em" }}
                  >
                    {seg.label || ""}
                  </span>
                  <div className="flex flex-1 items-stretch rounded-md border-2 border-slate-500 dark:border-slate-400">
                    {seg.items.map((m, idx) => (
                      <MeasureBlock
                        key={idx}
                        measure={m}
                        noBar={idx === seg.items.length - 1}
                        dense={dense}
                        saleLigado={terminaLigado(m)}
                        entraLigado={Boolean(idx > 0 && terminaLigado(seg.items[idx - 1]))}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
