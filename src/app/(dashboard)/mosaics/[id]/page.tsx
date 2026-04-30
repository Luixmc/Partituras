import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Music } from "lucide-react";
import Link from "next/link";

export default async function MosaicDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: mosaic } = await supabase
    .from("mosaics")
    .select(`
      *,
      entries:mosaic_entries (
        id, position, block_label, repeat_count, transition_note,
        song:songs (
          id, title, style, key_signature, time_signature,
          sections:song_sections (
            id, label, section_type, chord_chart, repeat_count,
            dynamics, band_notes, sort_order
          )
        )
      )
    `)
    .eq("id", params.id)
    .single();

  if (!mosaic) notFound();

  const entries = [...(mosaic.entries ?? [])].sort((a: any) => a.position);

  return (
    <div className="min-h-full bg-slate-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 md:px-8 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/mosaics"
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center
                       hover:bg-slate-200 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-slate-900 text-lg leading-tight truncate">
              {mosaic.title}
            </h1>
            <p className="text-slate-500 text-xs">
              {mosaic.key_signature?.replace("major","Mayor").replace("minor","menor")} · {mosaic.time_signature}
            </p>
          </div>
          {mosaic.drive_file_id && (
            <a
              href={`https://drive.google.com/file/d/${mosaic.drive_file_id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700
                         text-xs font-semibold rounded-lg hover:bg-brand-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Drive
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-4">

        {/* Execution order summary */}
        <div className="bg-brand-950 text-white rounded-2xl p-5">
          <h2 className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-3">
            Orden de ejecución
          </h2>
          <div className="flex flex-wrap gap-2">
            {entries.map((entry: any) => (
              <div key={entry.id} className="flex items-center gap-1.5">
                <span className="bg-brand-500 text-white text-sm font-bold w-7 h-7
                                 rounded-lg flex items-center justify-center">
                  {entry.block_label}
                </span>
                {entry.repeat_count > 1 && (
                  <span className="text-brand-300 text-xs font-medium">×{entry.repeat_count}</span>
                )}
                {entry !== entries[entries.length - 1] && (
                  <span className="text-brand-700 text-lg font-light">›</span>
                )}
              </div>
            ))}
          </div>
          {mosaic.closing_note && (
            <p className="text-brand-300 text-xs mt-3 italic border-t border-brand-800 pt-3">
              {mosaic.closing_note}
            </p>
          )}
        </div>

        {/* Each song */}
        {entries.map((entry: any, idx: number) => {
          const song = entry.song;
          const sections = [...(song?.sections ?? [])].sort(
            (a: any, b: any) => a.sort_order - b.sort_order
          );

          return (
            <div key={entry.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Song header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                <span className="w-9 h-9 bg-brand-500 text-white text-sm font-bold
                                 rounded-xl flex items-center justify-center flex-shrink-0">
                  {entry.block_label ?? idx + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-slate-900">{song?.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {song?.style && (
                      <span className="text-xs text-brand-600 font-semibold">{song.style}</span>
                    )}
                    {song?.key_signature && (
                      <span className="text-xs text-slate-400">
                        {song.key_signature.replace("major","Mayor").replace("minor","menor")}
                      </span>
                    )}
                    {song?.time_signature && (
                      <span className="text-xs text-slate-400">{song.time_signature}</span>
                    )}
                  </div>
                </div>
                <span className="text-slate-400 text-xs font-medium">×{entry.repeat_count}</span>
              </div>

              {/* Sections */}
              <div className="divide-y divide-slate-50">
                {sections.map((section: any) => (
                  <div key={section.id} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {section.label}
                      </span>
                      {section.repeat_count > 1 && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">
                          ×{section.repeat_count}
                        </span>
                      )}
                      {section.section_type && (
                        <span className="text-[10px] text-slate-400 capitalize">
                          {section.section_type}
                        </span>
                      )}
                    </div>

                    {section.chord_chart && (
                      <div className="chord-chart mb-2">{section.chord_chart}</div>
                    )}

                    {section.dynamics && (
                      <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg
                                    font-medium flex items-center gap-1.5 mt-2">
                        <Music className="w-3 h-3 flex-shrink-0" />
                        {section.dynamics}
                      </p>
                    )}

                    {section.band_notes && (
                      <p className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg
                                    font-medium mt-2">
                        🎺 {section.band_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Transition note */}
              {entry.transition_note && (
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                  <p className="text-xs text-slate-500 italic">
                    ➜ {entry.transition_note}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
