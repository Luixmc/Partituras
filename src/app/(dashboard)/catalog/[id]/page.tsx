import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Download, Edit } from "lucide-react";
import Link from "next/link";
import ABCViewer from "@/components/sheets/ABCViewer";
import MusicXmlViewer from "@/components/sheets/MusicXmlViewer";
import { formatKey, categoryStyle } from "@/lib/utils";

export default async function SheetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: sheet } = await supabase
    .from("sheets")
    .select("*, category:categories(name, color)")
    .eq("id", params.id)
    .single();

  if (!sheet) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const canEdit = profile?.role === "admin" || profile?.role === "musician";

  // Generate signed URL for PDF
  let pdfUrl: string | null = null;
  if (sheet.storage_path) {
    const { data } = await supabase.storage
      .from("sheets")
      .createSignedUrl(sheet.storage_path, 3600);
    pdfUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/catalog"
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center
                       hover:bg-slate-200 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-slate-900 text-lg leading-tight truncate">
              {sheet.title}
            </h1>
            {sheet.composer && (
              <p className="text-slate-500 text-sm">{sheet.composer}</p>
            )}
          </div>
        </div>

        {/* Metadata chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {(sheet as any).category && (
            <span
              className="category-badge border"
              style={categoryStyle((sheet as any).category.color)}
            >
              {(sheet as any).category.name}
            </span>
          )}
          {sheet.key_signature && (
            <span className="category-badge border border-slate-200 bg-slate-50 text-slate-600">
              {formatKey(sheet.key_signature)}
            </span>
          )}
          {sheet.time_signature && (
            <span className="category-badge border border-slate-200 bg-slate-50 text-slate-600">
              {sheet.time_signature}
            </span>
          )}
          {sheet.hymn_number && (
            <span className="category-badge border border-slate-200 bg-slate-50 text-slate-600">
              #{sheet.hymn_number}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          {sheet.drive_file_id && (
            <a
              href={`https://drive.google.com/file/d/${sheet.drive_file_id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700
                         text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Google Drive
            </a>
          )}
          {pdfUrl && (
            <a
              href={pdfUrl}
              download={`${sheet.title}.pdf`}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700
                         text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar PDF
            </a>
          )}
          {canEdit && (
            <Link
              href={`/catalog/${sheet.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 bg-brand-50 text-brand-700
                         text-xs font-semibold rounded-lg hover:bg-brand-100 transition-colors ml-auto"
            >
              <Edit className="w-3.5 h-3.5" />
              Editar
            </Link>
          )}
        </div>
      </div>

      {/* Content viewer */}
      <div className="flex-1 overflow-auto">
        {sheet.editor_type === "pdf_upload" && pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-full min-h-[70vh]"
            title={sheet.title}
          />
        ) : sheet.editor_type === "abc" && sheet.content ? (
          <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <ABCViewer content={sheet.content} title={sheet.title} />
          </div>
        ) : sheet.editor_type === "musicxml" && sheet.content ? (
          <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <MusicXmlViewer content={sheet.content} title={sheet.title} />
          </div>
        ) : (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            Sin contenido disponible
          </div>
        )}
      </div>
    </div>
  );
}
