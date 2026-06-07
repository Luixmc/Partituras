"use client";

import type { ReactNode } from "react";
import { Grid2X2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  raw: string;
};

type Measure = {
  notes: NoteToken[];
  repeatStart: boolean;
  repeatEnd: boolean;
};

function parseMeasures(value: string): Measure[] {
  if (typeof value !== "string") return [];

  // Protegemos los signos de repetición antes de separar las barras simples.
  const spaced = value
    .replace(/[\n\r\t]/g, " ")
    .replace(/\|:/g, " §RS§ ")
    .replace(/:\|/g, " §RE§ ")
    .replace(/\|/g, " §BAR§ ");

  const parts = spaced
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const measures: Measure[] = [];
  let current: Measure = { notes: [], repeatStart: false, repeatEnd: false };

  const hasContent = (m: Measure) => m.notes.length > 0 || m.repeatStart || m.repeatEnd;
  const flush = () => {
    if (hasContent(current)) measures.push(current);
    current = { notes: [], repeatStart: false, repeatEnd: false };
  };

  for (const part of parts) {
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

    const isText = part.startsWith("(") && part.endsWith(")");
    if (isText) {
      current.notes.push({ root: "", suffix: "", duration: null, text: part.slice(1, -1), raw: part });
      continue;
    }

    const match = part.match(/^([A-G])(.*)$/);
    if (match) {
      let rest = match[2];
      let duration: number | null = null;
      const durMatch = rest.match(/:(\d+(?:\.\d+)?)$/);
      if (durMatch) {
        duration = parseFloat(durMatch[1]);
        rest = rest.slice(0, rest.lastIndexOf(":"));
      }
      current.notes.push({ root: match[1], suffix: rest, duration, raw: part });
    } else {
      current.notes.push({ root: "", suffix: "", duration: null, text: part, raw: part });
    }
  }

  flush();
  return measures;
}

function NoteCell({ token, dark }: { token: NoteToken; dark: boolean }) {
  // La duración determina cuánto ocupa la nota dentro del compás (flex-grow).
  const beats = token.duration ?? 1;

  let content: ReactNode;
  if (token.root) {
    content = (
      <div className="flex items-baseline justify-center gap-[1px] leading-none">
        <span
          className={cn("font-bold leading-none", dark ? "text-slate-50" : "text-slate-950")}
          style={{ fontSize: "1.6em" }}
        >
          {token.root}
        </span>
        {token.suffix && (
          <span
            className={cn("font-semibold leading-none", dark ? "text-brand-300" : "text-brand-600")}
            style={{ fontSize: "0.95em" }}
          >
            {token.suffix}
          </span>
        )}
      </div>
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
      <span className={dark ? "text-slate-500" : "text-slate-400"} style={{ fontSize: "1em" }}>
        {token.raw}
      </span>
    );
  }

  return (
    <div
      className="flex min-w-[28px] flex-col items-center justify-end gap-0.5 px-0.5 py-1.5"
      style={{ flexGrow: beats, flexBasis: 0 }}
    >
      {/* La duración sale ARRIBA de la nota */}
      <span
        className={cn("font-semibold leading-none", dark ? "text-slate-500" : "text-slate-400")}
        style={{ fontSize: "0.55em", minHeight: "0.7em" }}
      >
        {token.duration ? `×${token.duration}` : ""}
      </span>
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

export default function TablaturePreview({
  notes,
  compact = false,
  label,
  fontScale = 1,
  dark = false,
}: Props) {
  const measures = parseMeasures(notes);

  // La línea divisora entre compases (barra de tempo). Fina, solo entre compases.
  const barColor = dark ? "border-slate-600" : "border-slate-300";

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
            measures.map((measure, mi) => {
              const totalBeats = measure.notes.reduce((sum, n) => sum + (n.duration ?? 1), 0) || 1;
              return (
                <div
                  key={mi}
                  // Cada compás crece según sus tiempos; los compases se reparten la fila.
                  // Borde derecho fino = barra de tempo. No hay líneas entre acordes del mismo compás.
                  className={cn("flex items-stretch border-r", barColor)}
                  style={{
                    flexGrow: totalBeats,
                    flexBasis: `${Math.max(measure.notes.length, 1) * 34}px`,
                  }}
                >
                  {measure.repeatStart && <RepeatGlyph side="start" dark={dark} />}
                  <div className="flex flex-1 items-stretch">
                    {measure.notes.length ? (
                      measure.notes.map((token, ti) => <NoteCell key={ti} token={token} dark={dark} />)
                    ) : (
                      <div className="min-w-[28px] flex-1" />
                    )}
                  </div>
                  {measure.repeatEnd && <RepeatGlyph side="end" dark={dark} />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
