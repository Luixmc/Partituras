// ─────────────────────────────────────────────────────────────
// Conversor de "acordes sobre la letra" (formato típico de LaCuerda
// y sitios similares) a la cuadrícula de acordes de la app.
//
// Importa lo que SÍ existe en la fuente: tono, secciones (Intro/Coro…)
// y la secuencia de acordes. NO infiere el ritmo (duraciones :n ni los
// compases |): eso se ajusta a mano en el editor.
// ─────────────────────────────────────────────────────────────

export type ChordImportResult = {
  content: string;
  key: string | null;
  title: string | null;
};

// Un token es un acorde si: raíz A–G (mayúscula) + alteración opcional +
// calidad/extensiones reconocidas + bajo opcional "/X". Así se rechazan
// palabras de la letra ("Cuando", "Dios", "Gloria"...) que empiezan por A–G.
const CHORD_RE =
  /^[A-G](?:#|b)?(?:maj|min|m|dim|aug|sus|add|°|ø|\+|M)?(?:\d{1,2})?(?:(?:sus|add|maj|min|m|b|#)\d{1,2})*(?:\/[A-G](?:#|b)?)?$/;

// Palabras que marcan el inicio de una sección.
const SECTION_RE =
  /^(intro(?:duccion)?|coro|pre[\s-]?coro|estrofa|verso|verse|chorus|puente|bridge|interludio|interlude|final|outro|solo|tag|instrumental)\b\s*\d*\s*[:.\-)]*\s*(.*)$/i;

function isChord(token: string): boolean {
  return CHORD_RE.test(token);
}

/** Devuelve los acordes de una línea si es una "línea de acordes"; si no, null. */
function chordLine(s: string): string | null {
  const tokens = s.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;
  const chords = tokens.filter(isChord);
  // Mayoría de tokens son acordes → es una línea de acordes (no de letra).
  if (chords.length >= 1 && chords.length / tokens.length >= 0.6) {
    return chords.join(" ");
  }
  return null;
}

/** Normaliza una etiqueta de sección a Capitalizado (Intro, Coro, Estrofa…). */
function sectionLabel(word: string, rest: string): string {
  const base = word.trim().toLowerCase();
  const map: Record<string, string> = {
    intro: "Intro",
    introduccion: "Intro",
    coro: "Coro",
    "pre-coro": "Pre-coro",
    "pre coro": "Pre-coro",
    precoro: "Pre-coro",
    estrofa: "Estrofa",
    verso: "Estrofa",
    verse: "Estrofa",
    chorus: "Coro",
    puente: "Puente",
    bridge: "Puente",
    interludio: "Interludio",
    interlude: "Interludio",
    final: "Final",
    outro: "Final",
    solo: "Solo",
    tag: "Tag",
    instrumental: "Instrumental",
  };
  return map[base] ?? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** Extrae el tono de un valor como "G", "Am", "Re mayor" → token limpio. */
function normalizeKey(value: string): string | null {
  const m = value.trim().match(/^([A-G](?:#|b)?m?)/);
  return m ? m[1] : null;
}

export function convertChordSheet(raw: string): ChordImportResult {
  const lines = raw.replace(/\r/g, "").split("\n");
  const out: string[] = [];
  let key: string | null = null;
  let title: string | null = null;
  let firstContentSeen = false;

  for (const original of lines) {
    const t = original.trim();
    if (!t) {
      // Línea en blanco: separa bloques, pero sin acumular varias seguidas.
      if (out.length && out[out.length - 1] !== "") out.push("");
      continue;
    }

    // Tono / tonalidad.
    const km = t.match(/^(tono|tonalidad|key)\s*[:=]\s*(.+)$/i);
    if (km) {
      key = key ?? normalizeKey(km[2]);
      continue;
    }

    // Capo / cejilla: no aplica a la cuadrícula, se ignora.
    if (/^(capo|cejilla)\b/i.test(t)) continue;

    // Título: primera línea TODO EN MAYÚSCULAS que no sea acorde (estilo LaCuerda).
    if (!firstContentSeen && !chordLine(t) && t === t.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(t) && t.length <= 60) {
      title = t.replace(/\s+/g, " ").trim();
      firstContentSeen = true;
      continue;
    }
    firstContentSeen = true;

    // Sección (posible acorde inline: "Intro: G C D").
    const sm = t.match(SECTION_RE);
    if (sm) {
      const rest = sm[2]?.trim() ?? "";
      // Solo es sección si no hay resto, o el resto es una línea de acordes.
      const restChords = rest ? chordLine(rest) : null;
      if (!rest || restChords) {
        out.push(`[${sectionLabel(sm[1], rest)}]`);
        if (restChords) out.push(restChords);
        continue;
      }
    }

    // Línea de acordes.
    const cl = chordLine(t);
    if (cl) {
      out.push(cl);
      continue;
    }

    // Resto (letra): se descarta — la cuadrícula es de acordes.
  }

  // Limpieza final: sin blancos al inicio/fin ni triples.
  const content = out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { content, key, title };
}
