import { createClient } from "@/lib/supabase/server";
import { Music2, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { MosaicWithEntries } from "@/types";

export default async function MosaicsPage() {
  const supabase = await createClient();

  const { data: mosaics } = await supabase
    .from("mosaics")
    .select(`
      *,
      entries:mosaic_entries (
        id, position, block_label, repeat_count, transition_note,
        song:songs ( id, title, style, key_signature, time_signature )
      ),
      category:categories ( name, color )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-5">
        <h1 className="font-display text-2xl font-bold text-slate-900">Mosaicos</h1>
        <p className="text-slate-500 text-sm mt-1">
          Sets de canciones encadenadas para el servicio
        </p>
      </div>

      <div className="flex-1 p-4 md:p-8">
        {mosaics && mosaics.length > 0 ? (
          <div className="space-y-4 max-w-2xl">
            {(mosaics as unknown as MosaicWithEntries[]).map((mosaic) => (
              <MosaicCard key={mosaic.id} mosaic={mosaic} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Music2 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-display text-lg font-semibold text-slate-700 mb-1">
              Sin mosaicos
            </h3>
            <p className="text-slate-400 text-sm">No hay mosaicos publicados aún</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MosaicCard({ mosaic }: { mosaic: MosaicWithEntries }) {
  // Sort entries by position
  const entries = [...(mosaic.entries ?? [])].sort((a, b) => a.position - b.position);

  return (
    <Link href={`/mosaics/${mosaic.id}`} className="block">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden
                      hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-99">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-white text-lg leading-tight">
                {mosaic.title}
              </h2>
              <p className="text-brand-200 text-sm mt-0.5">
                {mosaic.key_signature?.replace("major","Mayor").replace("minor","menor")} · {mosaic.time_signature}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-brand-200 flex-shrink-0" />
          </div>
        </div>

        {/* Song list */}
        <div className="divide-y divide-slate-100">
          {entries.map((entry, idx) => (
            <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
              {/* Block label */}
              <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold
                               flex items-center justify-center flex-shrink-0">
                {entry.block_label ?? idx + 1}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {(entry as any).song?.title}
                </p>
                {(entry as any).song?.style && (
                  <p className="text-xs text-slate-400">{(entry as any).song.style}</p>
                )}
              </div>

              {/* Repeat count */}
              <span className="text-xs text-slate-400 font-medium flex-shrink-0">
                ×{entry.repeat_count}
              </span>
            </div>
          ))}
        </div>

        {/* Closing note */}
        {mosaic.closing_note && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-500 italic">{mosaic.closing_note}</p>
          </div>
        )}
      </div>
    </Link>
  );
}
