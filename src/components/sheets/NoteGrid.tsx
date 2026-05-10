"use client";

import { NoteCell } from "@/lib/notesParser";

export default function NoteGrid({ notes }: { notes: NoteCell[] }) {
  return (
    <div 
      className="grid gap-2 w-full"
      style={{ 
        gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" 
      }}
    >
      {notes.map((n, i) => (
        <div key={i} className="aspect-square">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <rect x="0" y="0" width="100" height="100" rx="16" fill="#1e293b" />
            <text 
              x="50%" 
              y="50%" 
              dominantBaseline="middle" 
              textAnchor="middle" 
              fill="white" 
              fontSize="28" 
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              {n.note}
            </text>
          </svg>
        </div>
      ))}
    </div>
  );
}