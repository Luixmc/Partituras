"use client";

import type { ReactNode } from "react";
import { Grid2X2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NoteFigure, RestFigure, FermataFigure } from "@/components/sheets/MusicFigures";

type Props = {
  notes: string;
  compact?: boolean;
  label?: string;
  /** Escala de la letra (1 = normal). */
  fontScale?: number;
  /** Modo oscuro para la lectura. */
  dark?: boolean;
};

type NoteToken = {
  root: string;
  suffix: string;
  duration: number | null;
  text?: string;
  rest?: boolean;
  fermata?: boolean; // calderón: acorde de pausa/alargación
  timeSig?: string; // cambio de compás inline (ej. "6/8")
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

function parseMeasures(value: string): Measure[] {
  if (typeof value !== "string") return [];

  // Protegemos signos de repetición y llaves antes de separar las barras simples.
  const spaced = value
    .replace(/[\n\r\t]/g, " ")
    .replace(/\|:/g, " §RS§ ")
    .replace(/:\|/g, " §RE§ ")
    .replace(/\|/g, " §BAR§ ")
    .replace(/\{/g, " { ")
    .replace(/\}(\d*)/g, " }$1 ");

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

    // Calderón (fermata): el `^` se quita del token y marca el acorde.
    const fermata = part.includes("^");
    const core = fermata ? part.replace(/\^/g, "") : part;

    // Cambio de compás inline (2/4, 6/8, 12/8...).
    if (/^\d{1,2}\/\d{1,2}$/.test(core)) {
      current.notes.push({ root: "", suffix: "", duration: null, timeSig: core, raw: part });
      continue;
    }

    const isText = core.startsWith("(") && core.endsWith(")");
    if (isText) {
      current.notes.push({ root: "", suffix: "", duration: null, text: core.slice(1, -1), raw: part });
      continue;
    }

    // Silencio: "Z" con duración opcional (Z:4, Z:2, Z:1, Z:0.5).
    const restMatch = core.match(/^[Zz](?::(\d+(?:\.\d+)?))?$/);
    if (restMatch) {
      const duration = restMatch[1] ? parseFloat(restMatch[1]) : null;
      current.notes.push({ root: "", suffix: "", duration, rest: true, fermata, raw: part });
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
      current.notes.push({ root: match[1], suffix: rest, duration, fermata, raw: part });
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

function NoteCell({ token, dark }: { token: NoteToken; dark: boolean }) {
  // Color base de notas; bajos y alteraciones usan EXACTAMENTE el mismo.
  const noteColor = dark ? "text-slate-50" : "text-slate-950";

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
        className={cn("flex items-center justify-center leading-none", dark ? "text-slate-200" : "text-slate-500")}
        style={{ fontSize: "2.1em" }}
      >
        <RestFigure beats={token.duration ?? 4} />
      </span>
    );
  } else if (token.root) {
    // Acorde completo (raíz + alteraciones + bajo) con un solo tamaño y color.
    content = (
      <span className={cn("whitespace-nowrap font-bold leading-none", noteColor)} style={{ fontSize: "1.5em" }}>
        {token.root}
        {token.suffix}
      </span>
    );
  } else if (token.text) {
    content = (
      <span
        className={cn("text-center italic leading-tight", dark ? "text-amber-300" : "text-amber-700")}
        style={{ fontSize: "0.7em" }}
      >
        {token.text}
      </span>
    );
  } else {
    content = (
      <span className={cn("text-center", dark ? "text-slate-500" : "text-slate-400")}>{token.raw}</span>
    );
  }

  return (
    <div
      // Celda del tamaño de su contenido (no se estira). El compás centra el
      // grupo de acordes y un gap los separa. El padding vertical simétrico
      // centra verticalmente y deja sitio arriba para el calderón/figura.
      className="relative flex items-center justify-center text-center"
      style={{ minWidth: "1.3em", padding: "0.95em 0.15em" }}
    >
      {!token.rest && !token.timeSig && (token.fermata || token.duration) && (
        <span
          className="absolute inset-x-0 top-0 flex justify-center text-slate-400"
          style={{ fontSize: "0.85em", height: "0.95em" }}
        >
          {token.fermata ? <FermataFigure /> : <NoteFigure beats={token.duration!} />}
        </span>
      )}
      {content}
    </div>
  );
}

function RepeatGlyph({ side, dark }: { side: "start" | "end"; dark: boolean }) {
  return (
    <div
      className={cn(
        "flex w-4 items-center justify-center self-stretch font-bold",
        dark ? "text-brand-300" : "text-brand-600"
      )}
      style={{ fontSize: "1.2em" }}
    >
      {side === "start" ? "𝄆" : "𝄇"}
    </div>
  );
}

function MeasureBlock({
  measure,
  dark,
  barColor,
  noBar = false,
}: {
  measure: Measure;
  dark: boolean;
  barColor: string;
  noBar?: boolean;
}) {
  const totalBeats = measure.notes.reduce((sum, n) => sum + (n.duration ?? 1), 0) || 1;
  return (
    <div
      // Cada compás crece según sus tiempos; los compases se reparten la fila.
      // Borde derecho fino = barra de tempo (se omite en el último de un recuadro).
      className={cn("flex items-stretch", !noBar && "border-r", !noBar && barColor)}
      style={{
        flexGrow: totalBeats,
        // De base, el ancho según nº de acordes; crece para llenar la fila.
        flexBasis: `${Math.max(measure.notes.length, 1) * 3}em`,
      }}
    >
      {measure.repeatStart && <RepeatGlyph side="start" dark={dark} />}
      {/* Los acordes se agrupan y CENTRAN dentro del compás, con espacio entre ellos. */}
      <div className="flex flex-1 items-stretch justify-center gap-[0.5em]">
        {measure.notes.length ? (
          measure.notes.map((token, ti) => <NoteCell key={ti} token={token} dark={dark} />)
        ) : (
          <div className="min-w-[1.6em] flex-1" />
        )}
      </div>
      {measure.repeatEnd && <RepeatGlyph side="end" dark={dark} />}
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
  dark = false,
}: Props) {
  const measures = parseMeasures(notes);
  const segments = groupSegments(measures);

  // La línea divisora entre compases (barra de tempo). Fina, solo entre compases.
  const barColor = dark ? "border-slate-600" : "border-slate-300";
  const boxBorder = dark ? "border-slate-400" : "border-slate-500";
  const labelColor = dark ? "text-slate-100" : "text-slate-700";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg",
        !compact && (dark ? "border border-slate-700 bg-slate-900" : "border border-slate-200 bg-white")
      )}
    >
      {(label || !compact) && (
        <div
          className={cn(
            "flex items-center justify-between border-b px-4 py-2",
            dark ? "border-slate-700 bg-slate-800/60" : "border-slate-100 bg-slate-50/50"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2 text-sm font-semibold",
              dark ? "text-slate-100" : "text-slate-800"
            )}
          >
            <Grid2X2 className="h-3.5 w-3.5 text-brand-600" />
            {label || "Notas"}
          </div>
        </div>
      )}

      <div
        className={cn(
          "w-full",
          compact ? "p-0" : "p-4",
          dark ? "bg-slate-900" : compact ? "bg-white" : "bg-slate-50"
        )}
      >
        <div
          className={cn("flex flex-wrap items-stretch gap-y-3 rounded-lg", dark ? "bg-slate-900" : "bg-white")}
          // Base de la fuente: todo el contenido escala con esto.
          style={{ fontSize: `${16 * fontScale}px` }}
        >
          {measures.length === 0 ? (
            <div className="flex min-h-[64px] w-full items-center justify-center text-sm text-slate-300">
              Sin notas
            </div>
          ) : (
            segments.map((seg, si) => {
              // Compás suelto (sin recuadro): item flexible directo.
              if (seg.boxId == null) {
                return <MeasureBlock key={si} measure={seg.items[0]} dark={dark} barColor={barColor} />;
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
                  <span className={cn("mb-0.5 pl-1 font-bold leading-none", labelColor)} style={{ fontSize: "1.2em" }}>
                    {seg.label || ""}
                  </span>
                  <div className={cn("flex flex-1 items-stretch rounded-md border-2", boxBorder)}>
                    {seg.items.map((m, idx) => (
                      <MeasureBlock
                        key={idx}
                        measure={m}
                        dark={dark}
                        barColor={barColor}
                        noBar={idx === seg.items.length - 1}
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
