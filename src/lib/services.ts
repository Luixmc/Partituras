import type { PresentSong, ServiceType } from "@/types";

// Etiquetas y colores por tipo de culto (compartido entre lista y editor).
export const SERVICE_TYPE_META: Record<ServiceType, { label: string; color: string }> = {
  viernes:    { label: "Viernes",    color: "#2563eb" },
  domingo:    { label: "Domingo",    color: "#16a34a" },
  ayuno:      { label: "Ayuno",      color: "#ca8a04" },
  santa_cena: { label: "Santa Cena", color: "#9333ea" },
  otro:       { label: "Otro",       color: "#64748b" },
};

export const SERVICE_TYPES: ServiceType[] = ["viernes", "domingo", "ayuno", "santa_cena", "otro"];

/** Convierte las filas embebidas service_songs(...sheet) en canciones de presentación. */
export function mapPresentSongs(rows: any[]): PresentSong[] {
  return (rows ?? [])
    .filter((r) => r.sheet) // ignora canciones eliminadas
    .sort((a, b) => a.position - b.position)
    .map((r) => {
      // Si hay una versión guardada (sheet_key), se presenta tal cual: sus
      // acordes ya están en su tonalidad, así que original = target = ese tono
      // para que PresentationView NO vuelva a transponer.
      if (r.sheet_key && r.sheet_key.content != null) {
        const k = r.sheet_key.key_signature ?? null;
        return {
          title:        r.sheet.title,
          composer:     r.sheet.composer ?? null,
          original_key: k,
          target_key:   k,
          content:      r.sheet_key.content,
          editor_type:  r.sheet.editor_type,
        };
      }
      return {
        title:        r.sheet.title,
        composer:     r.sheet.composer ?? null,
        original_key: r.sheet.key_signature ?? null,
        target_key:   r.key_override ?? null,
        content:      r.sheet.content ?? null,
        editor_type:  r.sheet.editor_type,
      };
    });
}

/** Formatea una fecha ISO (YYYY-MM-DD) a texto legible en español. */
export function formatServiceDate(date: string | null): string | null {
  if (!date) return null;
  // Construimos en horario local para evitar desfase de zona horaria.
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
