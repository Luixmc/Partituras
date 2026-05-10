"use client";

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
    .replace(/[|\n\r\t]/g, " ")
    .split(/\s+/)
    .map((note) => note.trim())
    .filter(Boolean);
}

export default function TablaturePreview({ notes, compact = false, label }: Props) {
  const parsedNotes = parseTabNotes(notes);

  return (
    <div className={cn("overflow-hidden rounded-lg", !compact && "border border-slate-200 bg-white")}>
      {(label || (!compact)) && (
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
          style={{ 
            gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))" 
          }}
        >
          {(parsedNotes.length ? parsedNotes : [""]).map((note, index) => {
            const isText = note.startsWith("(") && note.endsWith(")");
            
            // Separar la nota base (A-G) de las alteraciones (#, m, 7, etc)
            const match = !isText ? note.match(/^([A-G])(.*)$/) : null;
            const rootNote = match ? match[1] : (isText ? note.slice(1, -1) : note);
            const suffix = match ? match[2] : "";
            
            return (
              <div
                key={`${note}-${index}`}
                className={cn(
                  "relative flex aspect-square items-center justify-center border-b border-r border-slate-300 transition-colors hover:bg-slate-50",
                  isText && "bg-slate-100/50 text-[10px] italic text-slate-400 font-sans"
                )}
              >
                {suffix && (
                  <span className="absolute right-1 top-1 text-[10px] font-bold leading-none text-brand-600">
                    {suffix}
                  </span>
                )}
                <span className={cn("font-bold", isText ? "text-[10px]" : "text-base")}>
                  {rootNote}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
