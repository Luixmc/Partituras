import { createClient } from "@/lib/supabase/server";
import { ChevronRight, Music2, PlusCircle } from "lucide-react";
import Link from "next/link";
import type { Song } from "@/types";

type SongRow = Song & {
  category?: {
    name: string | null;
    color: string | null;
  } | null;
  sections?: Array<{
    id: string;
  }>;
};

export default async function SongsPage() {
  const supabase = await createClient();

  const { data: songs } = await supabase
    .from("songs")
    .select(`
      *,
      category:categories ( name, color ),
      sections:song_sections ( id )
    `)
    .eq("status", "published")
    .order("title", { ascending: true });

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-5 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Canciones
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Repertorio con melodia, cifrado americano y pentagrama.
            </p>
          </div>
          <Link
            href="/sheets/new"
            className="hidden items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-500 md:inline-flex"
          >
            <PlusCircle className="h-4 w-4" />
            Nueva
          </Link>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8">
        {songs && songs.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {(songs as SongRow[]).map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Music2 className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="font-display mb-1 text-lg font-semibold text-slate-700">
              Sin canciones
            </h3>
            <p className="text-sm text-slate-400">
              No hay canciones publicadas aun.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SongCard({ song }: { song: SongRow }) {
  return (
    <Link href={`/mosaics/${song.id}`} className="block">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display truncate text-lg font-bold text-slate-900">
                {song.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {song.composer || song.author || "Repertorio iglesia"}
              </p>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-slate-300" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 px-5 py-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tono
            </p>
            <p className="mt-1 font-semibold text-slate-700">
              {song.key_signature || "C"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Compas
            </p>
            <p className="mt-1 font-semibold text-slate-700">
              {song.time_signature || "4/4"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Partes
            </p>
            <p className="mt-1 font-semibold text-slate-700">
              {song.sections?.length ?? 0}
            </p>
          </div>
        </div>

        {song.chord_chart && (
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
            <p className="line-clamp-2 font-mono text-xs leading-5 text-slate-500">
              {song.chord_chart}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
