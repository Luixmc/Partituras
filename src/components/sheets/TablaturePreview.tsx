"use client";

import type { ReactNode } from "react";
import { Grid2X2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NoteFigure, RestFigure, FermataFigure, SlurFigure } from "@/components/sheets/MusicFigures";

type Props = {
  notes: string;
  compact?: boolean;
  label?: string;
  /** Escala de la letra (1 = normal). */
  fontScale?: number;
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
  timeSig?: string; // cambio de compás inline (ej. "6/8")
  lyric?: string; // texto entre paréntesis, se muestra debajo del acorde
  chordLabel?: string; // texto <...>: se dibuja como un acorde pero en amarillo
  raw: string;
};

type Measure = {
  notes: NoteToken[];
  repeatStart: boolean;
  repeatEnd: boolean;
  // Salto de línea manual (";"): fuerza una nueva fila en la cuadrícula.
  isBreak?: boolean;
  // Recuadro (casilla / final 1 ó 2): compases con el mismo boxId van juntos
  // dentro de un recuadro, con boxLabel encima.
  boxId?: number;
  boxLabel?: string;
};

// Marcador interno: espacios DENTRO de un paréntesis para que el texto entre
// paréntesis (aunque tenga varias palabras) no se parta al separar por espacios.
const SP = "";

function parseMeasures(value: string): Measure[] {
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
    .replace(/;/g, " ; "); // salto de línea: siempre token suelto

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
      current.repeatEnd = true;
      flush();
      continue;
    }
    if (part === "§BAR§") {
      flush();
      continue;
    }

    // Salto de línea manual: ";" (suelto) fuerza una nueva fila.
    if (part === ";") {
      flush();
      measures.push({ notes: [], repeatStart: false, repeatEnd: false, isBreak: true });
      continue;
    }

    // Ligadura / ligado: "~" suelto une el acorde anterior con el siguiente.
    if (part === "~") {
      const prev = current.notes[current.notes.length - 1];
      if (prev && (prev.root || prev.rest || prev.repeat)) prev.tieNext = true;
      continue;
    }

    // Calderón (fermata): el `^` se quita del token y marca el acorde.
    const fermata = part.includes("^");
    let core = fermata ? part.replace(/\^/g, "") : part;

    // Ligadura pegada al final del acorde (p. ej. "C~"): marca el acorde y se quita.
    let tieNext = false;
    if (core.length > 1 && core.endsWith("~")) {
      tieNext = true;
      core = core.slice(0, -1);
    }

    // Repetición de acorde: "%" se dibuja con las mismas características que un acorde.
    if (core === "%") {
      current.notes.push({ root: "", suffix: "", duration: null, repeat: true, fermata, tieNext, raw: part });
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
        root: "", suffix: "", duration: null, chordLabel: labelText, fermata, tieNext, raw: part,
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
      current.notes.push({ root: "", suffix: "", duration, rest: true, fermata, tieNext, raw: part });
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
      current.notes.push({ root: match[1], suffix: rest, duration, fermata, tieNext, raw: part });
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

// Reemplaza "maj7" (en cualquier capitalización) por el triángulo Δ en el
// sufijo del acorde. Ej.: "Cmaj7" → "CΔ", "Gmaj7/B" → "GΔ/B".
function formatSuffix(suffix: string): string {
  return suffix.replace(/maj7/gi, "Δ");
}

function NoteCell({ token, beamed = false }: { token: NoteToken; beamed?: boolean }) {
  // Color base de notas; bajos y alteraciones usan EXACTAMENTE el mismo.
  const noteColor = "text-slate-950 dark:text-slate-50";

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
    // Silencio: figura gráfica grande (la propia figura indica la duración).
    content = (
      <span
        className="flex items-center justify-center leading-none text-slate-500 dark:text-slate-200"
        style={{ fontSize: "2.1em" }}
      >
        <RestFigure beats={token.duration ?? 4} />
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
    content = (
      <span className={cn("whitespace-nowrap font-bold leading-none", noteColor)} style={{ fontSize: "1.5em" }}>
        {token.root}
        {formatSuffix(token.suffix)}
      </span>
    );
  } else if (token.chordLabel) {
    // Texto <...>: mismas características que un acorde pero en amarillo. La celda
    // se dimensiona a su texto (legible, en una línea); el salto a otra fila lo
    // hace el compás (que envuelve cuando hay etiquetas) sin partir palabras.
    content = (
      <span
        className="whitespace-nowrap font-bold leading-tight text-yellow-500 dark:text-yellow-300"
        style={{ fontSize: "1.5em" }}
      >
        {token.chordLabel}
      </span>
    );
  } else if (token.text) {
    content = (
      <span
        className="text-center italic leading-tight text-amber-700 dark:text-amber-300"
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
      // Celda del tamaño de su contenido (no se estira). El compás centra el
      // grupo de acordes y un gap los separa. El padding vertical centra y deja
      // sitio arriba para el calderón/figura. La letra (paréntesis) va debajo.
      className="relative flex flex-col items-center justify-center text-center"
      style={{ minWidth: "1.3em", padding: "0.95em 0.15em" }}
    >
      {!token.rest && !token.timeSig && (token.fermata || token.duration) && (
        <span
          className="absolute inset-x-0 top-0 flex justify-center text-slate-400 dark:text-slate-300"
          style={{ fontSize: "0.85em", height: "0.95em" }}
        >
          {token.fermata ? <FermataFigure /> : <NoteFigure beats={token.duration!} beamed={beamed} />}
        </span>
      )}
      {/* Ligadura: arco que sale de este acorde hacia el siguiente, por arriba. */}
      {token.tieNext && (
        <span
          className="pointer-events-none absolute top-0 z-10 text-slate-500 dark:text-slate-300"
          style={{ left: "50%", width: "calc(100% + 1.1em)", height: "0.55em" }}
        >
          <SlurFigure />
        </span>
      )}
      {content}
      {token.lyric && (
        <span
          className="mt-0.5 whitespace-nowrap italic leading-none text-amber-700 dark:text-amber-300"
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
function BeamGroup({ tokens, beats }: { tokens: NoteToken[]; beats: number }) {
  const n = tokens.length;
  const inset = `${50 / n}%`; // aproxima el centro del primer/último acorde
  const doubleBeam = beats <= 0.25;
  return (
    <div className="relative flex items-stretch gap-[0.5em]">
      {tokens.map((t, i) => (
        <NoteCell key={i} token={t} beamed />
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

function MeasureBlock({
  measure,
  noBar = false,
}: {
  measure: Measure;
  noBar?: boolean;
}) {
  const totalBeats = measure.notes.reduce((sum, n) => sum + (n.duration ?? 1), 0) || 1;
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
      className={cn("flex items-stretch", !noBar && "border-r border-slate-300 dark:border-slate-600")}
      style={{
        flexGrow: totalBeats,
        // De base, el ancho según nº de acordes; crece para llenar la fila.
        flexBasis: `${Math.max(measure.notes.length, 1) * 3}em`,
      }}
    >
      {measure.repeatStart && <RepeatGlyph side="start" />}
      {/* Indicación de compás pegada a la izquierda. */}
      {timeSigs.map((token, ti) => (
        <NoteCell key={`ts-${ti}`} token={token} />
      ))}
      {/* Los acordes se agrupan y CENTRAN dentro del compás, con espacio entre
          ellos. Las corcheas/semicorcheas consecutivas se unen con viga. Con
          etiquetas <...>, las celdas pueden envolver a otra línea. */}
      <div
        className={cn(
          "flex flex-1 items-stretch justify-center gap-[0.5em]",
          hasLabel && "flex-wrap gap-y-1"
        )}
      >
        {chords.length ? (
          beamSegments(chords).map((seg, si) =>
            seg.type === "single" ? (
              <NoteCell key={si} token={seg.token} />
            ) : (
              <BeamGroup key={si} tokens={seg.tokens} beats={seg.beats} />
            )
          )
        ) : (
          <div className="min-w-[1.6em] flex-1" />
        )}
      </div>
      {measure.repeatEnd && <RepeatGlyph side="end" />}
    </div>
  );
}

type Segment = { boxId?: number; label?: string; items: Measure[] };

function groupSegments(measures: Measure[]): Segment[] {
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

export default function TablaturePreview({
  notes,
  compact = false,
  label,
  fontScale = 1,
}: Props) {
  const measures = parseMeasures(notes);
  const segments = groupSegments(measures);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg",
        !compact && "border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      )}
    >
      {(label || !compact) && (
        <div className="flex items-center justify-between border-b px-4 py-2 border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Grid2X2 className="h-3.5 w-3.5 text-brand-600" />
            {label || "Notas"}
          </div>
        </div>
      )}

      <div
        className={cn(
          "w-full",
          compact ? "p-0" : "p-4",
          compact ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-900"
        )}
      >
        <div
          className="flex flex-wrap items-stretch gap-y-3 rounded-lg bg-white dark:bg-slate-900"
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
                // Salto de línea manual (";"): item de ancho completo y alto 0
                // que obliga a los compases siguientes a bajar a otra fila.
                if (m.isBreak) {
                  return <div key={si} aria-hidden style={{ flexBasis: "100%", flexShrink: 0, height: 0 }} />;
                }
                return <MeasureBlock key={si} measure={m} />;
              }

              // Recuadro (casilla / final 1 ó 2): número arriba + caja con borde.
              const segBeats =
                seg.items.reduce(
                  (s, m) => s + (m.notes.reduce((a, n) => a + (n.duration ?? 1), 0) || 1),
                  0
                ) || 1;
              const segNotes = seg.items.reduce((s, m) => s + Math.max(m.notes.length, 1), 0);
              return (
                <div
                  key={si}
                  className="flex flex-col"
                  style={{ flexGrow: segBeats, flexBasis: `${segNotes * 2.4}em` }}
                >
                  <span
                    className="mb-0.5 pl-1 font-bold leading-none text-slate-700 dark:text-slate-100"
                    style={{ fontSize: "1.2em" }}
                  >
                    {seg.label || ""}
                  </span>
                  <div className="flex flex-1 items-stretch rounded-md border-2 border-slate-500 dark:border-slate-400">
                    {seg.items.map((m, idx) => (
                      <MeasureBlock key={idx} measure={m} noBar={idx === seg.items.length - 1} />
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
