"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, FileCode2, Wand2 } from "lucide-react";
import MusicXmlViewer from "@/components/sheets/MusicXmlViewer";
import { buildMusicXml, type MusicSection } from "@/lib/musicxml";

type Props = {
  title: string;
  composer?: string;
  keySignature: string;
  timeSignature: string;
  musicXmlContent: string;
  onMusicXmlChange: (value: string) => void;
};

const defaultSections: MusicSection[] = [
  {
    id: "verse",
    name: "Estrofa",
    chords: "C | G/B | Am | F\nC | G | F | C",
    melody: "C D E G | G E D C | A B c A | F E D C\nE F G A | G F E D | F G A F | E D C2",
    lyrics: "Grande es tu amor Senor\nFiel es tu voz aqui",
  },
  {
    id: "chorus",
    name: "Coro",
    chords: "F | C/E | Dm | G\nAm | G | F | C",
    melody: "F G A c | B A G2 | D E F A | G F E2\nA B c A | G A B G | F G A F | E D C2",
    lyrics: "Te adoramos con todo el corazon\nCristo Rey y Salvador",
  },
];

export default function LeadSheetComposer({
  title,
  composer,
  keySignature,
  timeSignature,
  musicXmlContent,
  onMusicXmlChange,
}: Props) {
  const [sections, setSections] = useState<MusicSection[]>(defaultSections);
  const [mode, setMode] = useState<"builder" | "musicxml">("builder");

  const generatedMusicXml = useMemo(
    () =>
      buildMusicXml({
        title,
        composer,
        keySignature,
        timeSignature,
        sections,
      }),
    [composer, keySignature, sections, timeSignature, title]
  );

  useEffect(() => {
    if (mode === "builder") {
      onMusicXmlChange(generatedMusicXml);
    }
  }, [generatedMusicXml, mode, onMusicXmlChange]);

  function updateSection(id: string | undefined, field: keyof MusicSection, value: string) {
    setSections((current) =>
      current.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  }

  function addSection() {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());

    setSections((current) => [
      ...current,
      {
        id,
        name: "Puente",
        chords: "Dm | F | C | G",
        melody: "D F A F | F A c A | C E G E | G A B2",
        lyrics: "Santo santo eres tu",
      },
    ]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("builder")}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            mode === "builder"
              ? "bg-brand-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Wand2 className="h-4 w-4" />
          Editor MusicXML
        </button>
        <button
          type="button"
          onClick={() => setMode("musicxml")}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            mode === "musicxml"
              ? "bg-brand-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <FileCode2 className="h-4 w-4" />
          MusicXML
        </button>
      </div>

      {mode === "builder" ? (
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                <label className="text-sm font-medium text-slate-700">
                  Seccion
                  <input
                    value={section.name}
                    onChange={(event) =>
                      updateSection(section.id, "name", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Acordes por compas
                  <textarea
                    value={section.chords}
                    onChange={(event) =>
                      updateSection(section.id, "chords", event.target.value)
                    }
                    rows={3}
                    spellCheck={false}
                    className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium text-slate-700">
                Notas de la melodia
                <textarea
                  value={section.melody}
                  onChange={(event) =>
                    updateSection(section.id, "melody", event.target.value)
                  }
                  rows={3}
                  spellCheck={false}
                  className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
              <label className="mt-3 block text-sm font-medium text-slate-700">
                Letra
                <textarea
                  value={section.lyrics}
                  onChange={(event) =>
                    updateSection(section.id, "lyrics", event.target.value)
                  }
                  rows={2}
                  className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
            </div>
          ))}

          <button
            type="button"
            onClick={addSection}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Agregar seccion
          </button>
        </div>
      ) : (
        <label className="block text-sm font-medium text-slate-700">
          MusicXML
          <textarea
            value={musicXmlContent}
            onChange={(event) => onMusicXmlChange(event.target.value)}
            rows={16}
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            spellCheck={false}
          />
        </label>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Eye className="h-4 w-4" />
          Preview
        </div>
        <MusicXmlViewer
          content={mode === "builder" ? generatedMusicXml : musicXmlContent}
        />
      </div>
    </div>
  );
}
