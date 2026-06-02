"use client";

import type { ReactNode } from "react";
import { Grid2X2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  notes: string;
  compact?: boolean;
  label?: string;
};

function parseTabNotes(value: string) {
  if (typeof value !== "string") return [];
  return value
    .replace(/[\n\r\t]/g, " ")
    .replace(/\|/g, " | ")
    .split(/\s+/)
    .map((note) => note.trim())
    .filter(Boolean);
}

export default function TablaturePreview({ notes, compact = false, label }: Props) {
  const parsedNotes = parseTabNotes(notes);

  return (
    <div className={cn("overflow-hidden rounded-lg", !compact && "border border-slate-200 bg-white")}>
      {(label || !compact) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 bg-slate-50/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Grid2X2 className="h-3.5 w-3.5 text-brand-600" />
            {label || "Notas"}
          </div>
        </div>
      )}

      <div className={cn("w-full", compact ? "bg-white p-0" : "bg-slate-50 p-4")}>
        <div
          className="grid w-full border-l border-t border-slate-300 bg-white font-mono text-sm text-slate-950"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))" }}
        >
          {(parsedNotes.length ? parsedNotes : [""]).map((note, index) => {
            const isText = note.startsWith("(") && note.endsWith(")");
            const isPipe = note === "|";

            // Separar la nota raíz (A-G) del resto
            const match = !isText && !isPipe ? note.match(/^([A-G])(.*)$/) : null;

            let rootNote = "";
            let suffix = "";
            let duration: string | null = null;

            if (match) {
              rootNote = match[1];
              let rest = match[2];
              // Extraer duración al final: :1, :2, :3, :4, :0.5, etc.
              const durMatch = rest.match(/:(\d+(?:\.\d+)?)$/);
              if (durMatch) {
                duration = durMatch[1];
                rest = rest.slice(0, rest.lastIndexOf(":"));
              }
              suffix = rest;
            }

            let noteContent: ReactNode;

            if (match) {
              noteContent = (
                <div className="flex flex-col items-center leading-none gap-0.5">
                  <div className="flex items-baseline gap-[1px]">
                    <span className="font-bold text-base leading-none">{rootNote}</span>
                    {suffix && (
                      <span className="text-brand-600 text-[10px] leading-none font-semibold">
                        {suffix}
                      </span>
                    )}
                  </div>
                  {duration && (
                    <span className="text-slate-400 text-[8px] leading-none">×{duration}</span>
                  )}
                </div>
              );
            } else if (isText) {
              noteContent = (
                <span className="text-center px-0.5 break-words leading-tight">
                  {note.slice(1, -1)}
                </span>
              );
            } else {
              noteContent = note;
            }

            return (
              <div
                key={`${note}-${index}`}
                className={cn(
                  "flex aspect-square items-center justify-center border-b border-r border-slate-300 transition-colors hover:bg-slate-50 overflow-hidden",
                  isText && "bg-amber-50 text-[9px] italic text-amber-700 font-sans",
                  isPipe && "bg-slate-50 text-slate-400 text-xs font-semibold"
                )}
              >
                {noteContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
