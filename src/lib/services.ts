import type { ServiceType } from "@/types";

// Etiquetas y colores por tipo de culto (compartido entre lista y editor).
export const SERVICE_TYPE_META: Record<ServiceType, { label: string; color: string }> = {
  viernes:    { label: "Viernes",    color: "#2563eb" },
  domingo:    { label: "Domingo",    color: "#16a34a" },
  ayuno:      { label: "Ayuno",      color: "#ca8a04" },
  santa_cena: { label: "Santa Cena", color: "#9333ea" },
  otro:       { label: "Otro",       color: "#64748b" },
};

export const SERVICE_TYPES: ServiceType[] = ["viernes", "domingo", "ayuno", "santa_cena", "otro"];

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
