import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Music } from "lucide-react";
import Link from "next/link";
import MusicXmlViewer from "@/components/sheets/MusicXmlViewer";
import { buildMusicXml, normalizeMusicKey, type MusicSection } from "@/lib/musicxml";

type SongSectionRow = {
  id: string;
  label: string;
  section_type: string | null;
  chord_chart: string | null;
  repeat_count: number;
  dynamics: string | null;
  band_notes: string | null;
  sort_order: number;
};

type SongRow = {
  id: string;
  title: string;
  composer: string | null;
  author: string | null;
  key_signature: string | null;
  time_signature: string | null;
  style: string | null;
  tempo: number | null;
  tempo_label: string | null;
  lyrics: string | null;
  chord_chart: string | null;
  drive_file_id: string | null;
  sections: SongSectionRow[] | null;
};

const noteByRoot: Record<string, string> = {
  C: "C",
  "C#": "^C",
  Db: "_D",
  D: "D",
  "D#": "^D",
  Eb: "_E",
  E: "E",
  F: "F",
  "F#": "^F",
  Gb: "_G",
  G: "G",
  "G#": "^G",
  Ab: "_A",
  A: "A",
  "A#": "^A",
  Bb: "_B",
  B: "B",
};

function chordRoot(chord: string) {
  const match = chord.trim().match(/^[A-G](?:#|b)?/);
  return match ? match[0] : "C";
}

function chordToNote(chord: string) {
  return noteByRoot[chordRoot(chord)] ?? "C";
}

function parseChordMeasures(chart: string | null) {
  if (!chart?.trim()) return [["C", "G", "Am", "F"]];

  return chart
    .split(/\r?\n/)
    .map((line) =>
      line
        .split("|")
        .flatMap((bar) => bar.trim().split(/\s+/).filter(Boolean))
        .filter(Boolean)
    )
    .filter((line) => line.length > 0);
}

function melodyFromChords(chart: string | null) {
  return parseChordMeasures(chart)
    .map((row) => row.map(chordToNote).join(" | "))
    .join("\n");
}

function songToMusicXml(song: SongRow) {
  const sections =
    song.sections && song.sections.length > 0
      ? [...song.sections].sort((a, b) => a.sort_order - b.sort_order)
      : [
          {
            id: "main",
            label: "Cancion",
            section_type: null,
            chord_chart: song.chord_chart,
            repeat_count: 1,
            dynamics: null,
            band_notes: null,
            sort_order: 1,
          },
        ];

  const musicSections: MusicSection[] = sections.map((section) => ({
    id: section.id,
    name: section.label,
    chords: section.chord_chart || song.chord_chart || "C | G | Am | F",
    melody: melodyFromChords(section.chord_chart || song.chord_chart),
    lyrics: "",
  }));

  return buildMusicXml({
    title: song.title,
    composer: song.composer || song.author,
    keySignature: song.key_signature,
    timeSignature: song.time_signature,
    sections: musicSections,
  });
}

export default async function SongDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: song } = await supabase
    .from("songs")
    .select(`
      *,
      sections:song_sections (
        id, label, section_type, chord_chart, repeat_count,
        dynamics, band_notes, sort_order
      )
    `)
    .eq("id", params.id)
    .single();

  if (!song) notFound();

  const typedSong = song as SongRow;
  const sections = [...(typedSong.sections ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const musicXmlContent = songToMusicXml(typedSong);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/mosaics"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200"
            aria-label="Volver a canciones"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-display truncate text-lg font-bold leading-tight text-slate-900">
              {typedSong.title}
            </h1>
            <p className="text-xs text-slate-500">
              {normalizeMusicKey(typedSong.key_signature)} - {typedSong.time_signature || "4/4"}
            </p>
          </div>
          {typedSong.drive_file_id && (
            <a
              href={`https://drive.google.com/file/d/${typedSong.drive_file_id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Drive
            </a>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 md:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {typedSong.style && (
              <span className="category-badge border border-brand-200 bg-brand-50 text-brand-700">
                {typedSong.style}
              </span>
            )}
            <span className="category-badge border border-slate-200 bg-slate-50 text-slate-600">
              Tono {normalizeMusicKey(typedSong.key_signature)}
            </span>
            <span className="category-badge border border-slate-200 bg-slate-50 text-slate-600">
              {typedSong.time_signature || "4/4"}
            </span>
            {typedSong.tempo_label && (
              <span className="category-badge border border-slate-200 bg-slate-50 text-slate-600">
                {typedSong.tempo_label}
              </span>
            )}
          </div>

          <MusicXmlViewer content={musicXmlContent} title="Pentagrama" />
        </div>

        {sections.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <div
                key={section.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {section.label}
                  </span>
                  {section.repeat_count > 1 && (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                      x{section.repeat_count}
                    </span>
                  )}
                </div>
                {section.chord_chart && (
                  <div className="chord-chart mb-2">{section.chord_chart}</div>
                )}
                {section.dynamics && (
                  <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                    <Music className="h-3 w-3 flex-shrink-0" />
                    {section.dynamics}
                  </p>
                )}
                {section.band_notes && (
                  <p className="mt-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                    {section.band_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
