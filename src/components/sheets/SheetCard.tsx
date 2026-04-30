import Link from "next/link";
import { Music, FileText, ExternalLink } from "lucide-react";
import type { SheetCatalogItem } from "@/types";
import { formatKey, categoryStyle } from "@/lib/utils";

export default function SheetCard({ sheet }: { sheet: SheetCatalogItem }) {
  return (
    <div className="sheet-card">
      {/* Thumbnail or placeholder */}
      <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
        {sheet.thumbnail_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sheets/${sheet.thumbnail_path}`}
            alt={sheet.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
            <Music className="w-10 h-10 text-slate-300" />
            {/* Fake staff lines */}
            <div className="w-full space-y-2 opacity-20">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-px bg-slate-400 w-full" />
              ))}
            </div>
          </div>
        )}

        {/* Editor type badge */}
        <div className="absolute top-2 right-2">
          <span className="bg-black/50 text-white text-[10px] font-bold uppercase tracking-wider
                           px-2 py-0.5 rounded-full backdrop-blur-sm">
            {sheet.editor_type === "pdf_upload" ? "PDF" : sheet.editor_type.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-display font-semibold text-slate-900 text-sm leading-tight line-clamp-2 mb-1">
          {sheet.title}
        </h3>

        {sheet.composer && (
          <p className="text-xs text-slate-500 mb-2 truncate">{sheet.composer}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap mb-3">
          {sheet.category_name && (
            <span
              className="category-badge border"
              style={categoryStyle(sheet.category_color ?? "#6b7280")}
            >
              {sheet.category_name}
            </span>
          )}
          {sheet.key_signature && (
            <span className="text-[11px] text-slate-500 font-medium">
              {formatKey(sheet.key_signature)}
            </span>
          )}
          {sheet.time_signature && (
            <span className="text-[11px] text-slate-400">{sheet.time_signature}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/catalog/${sheet.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-50
                       text-brand-700 text-xs font-semibold rounded-lg hover:bg-brand-100
                       transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Ver
          </Link>

          {sheet.drive_file_id && (
            <a
              href={`https://drive.google.com/file/d/${sheet.drive_file_id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100
                         text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200
                         transition-colors"
              title="Ver en Google Drive"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
