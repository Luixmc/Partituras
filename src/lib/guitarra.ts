// ─────────────────────────────────────────────────────────────
// Cómo se toca un acorde en la guitarra.
//
// 🔴 SIN TABLA DE DIGITACIONES, que era lo que hacía «pesada» esta parte
// del encargo (O-17). No hacen falta cientos de posiciones guardadas a
// mano: se usan **FORMAS MÓVILES**.
//
// Una forma móvil es el dibujo de un acorde SIN nota fija —la forma de
// «mi mayor», la de «la menor»…— que se sube por el mástil hasta que su
// fundamental cae donde toca. La misma forma de `E` puesta en el traste
// 3 es un `G`, en el 5 un `A`. Es lo que hace un guitarrista con la
// cejilla, y es exactamente lo que hay que enseñarle.
//
// Con **dos familias** —fundamental en la 6ª cuerda y en la 5ª— y una
// forma por calidad, se cubre el repertorio entero. Se eligen así:
//
//   · la que caiga MÁS CERCA DEL AIRE, que es la que se toca de verdad
//     en un culto y la más fácil de agarrar;
//   · y si una cae al aire (traste 0), esa gana: no hace falta cejilla.
//
// 🔴 Y la regla de siempre: **la calidad que no tenga forma NO se
// inventa.** Se devuelve `null` y el dibujo no aparece. Más vale no
// enseñar nada que enseñar una postura que no suena.
// ─────────────────────────────────────────────────────────────

import { semitonoDe, type Acorde } from "@/lib/acordes";

/** Las seis cuerdas al aire, de la más grave a la más aguda. */
export const CUERDAS_GUITARRA = [
  { nombre: "E", semitono: 4 },
  { nombre: "A", semitono: 9 },
  { nombre: "D", semitono: 2 },
  { nombre: "G", semitono: 7 },
  { nombre: "B", semitono: 11 },
  { nombre: "e", semitono: 4 },
];

/**
 * Una forma móvil: qué traste pisar en cada cuerda, contando desde el
 * de la fundamental. `null` = esa cuerda no se toca.
 *
 * El orden es de la 6ª a la 1ª, como se dibuja un diagrama de guitarra.
 */
type Forma = (number | null)[];

/** Formas con la fundamental en la 6ª cuerda (familia de «E»). */
const EN_SEXTA: Record<string, Forma> = {
  "":     [0, 2, 2, 1, 0, 0],   // mi mayor
  m:      [0, 2, 2, 0, 0, 0],   // mi menor
  "7":    [0, 2, 0, 1, 0, 0],
  m7:     [0, 2, 0, 0, 0, 0],
  maj7:   [0, 2, 1, 1, 0, 0],
  sus4:   [0, 2, 2, 2, 0, 0],
  sus2:   [0, 2, 4, 4, 0, 0],
  "4":    [0, 2, 2, 2, 0, 0],   // Isaac escribe "A4" por "Asus4"
  "6":    [0, 2, 2, 1, 2, 0],
  m6:     [0, 2, 2, 0, 2, 0],
  "9":    [0, 2, 0, 1, 0, 2],
  m9:     [0, 2, 0, 0, 0, 2],
  aug:    [0, 3, 2, 1, 1, 0],
  dim:    [0, 1, 2, 0, null, null],
  "°":    [0, 1, 2, 0, null, null],
  dim7:   [0, 1, 2, 0, null, null],
  "°7":   [0, 1, 2, 0, null, null],
  m7b5:   [0, 1, 0, 0, null, null],
  add9:   [0, 2, 2, 1, 0, 2],
  maj9:   [0, 2, 1, 1, 0, 2],
};

/** Formas con la fundamental en la 5ª cuerda (familia de «A»). */
const EN_QUINTA: Record<string, Forma> = {
  "":     [null, 0, 2, 2, 2, 0],   // la mayor
  m:      [null, 0, 2, 2, 1, 0],   // la menor
  "7":    [null, 0, 2, 0, 2, 0],
  m7:     [null, 0, 2, 0, 1, 0],
  maj7:   [null, 0, 2, 1, 2, 0],
  sus4:   [null, 0, 2, 2, 3, 0],
  sus2:   [null, 0, 2, 2, 0, 0],
  "4":    [null, 0, 2, 2, 3, 0],
  "6":    [null, 0, 2, 2, 2, 2],
  m6:     [null, 0, 2, 2, 1, 2],
  "9":    [null, 0, -1, 0, 0, null],   // la 3a baja un traste: por eso puede no caber al aire
  m9:     [null, 0, 2, 4, 1, 3],
  aug:    [null, 0, 3, 2, 2, 1],
  dim:    [null, 0, 1, 2, 1, null],
  "°":    [null, 0, 1, 2, 1, null],
  dim7:   [null, 0, 1, 2, 1, null],
  "°7":   [null, 0, 1, 2, 1, null],
  m7b5:   [null, 0, 1, 0, 1, null],
  add9:   [null, 0, 2, 4, 2, 0],
  maj9:   [null, 0, -1, 1, 0, null],
};

export type PosicionGuitarra = {
  /** En qué traste va la cejilla (0 = acorde al aire, sin cejilla). */
  base: number;
  /** Traste ABSOLUTO de cada cuerda, de la 6ª a la 1ª. `null` = muda. */
  trastes: (number | null)[];
  /** Qué cuerda lleva la fundamental: 6 o 5. */
  cuerdaRaiz: 6 | 5;
};

/** La calidad, quitándole a la raíz sus alteraciones ("F#m7" → "m7"). */
function calidadDe(acorde: Acorde): string | null {
  const m = acorde.escrito.trim().match(/^[A-G][#b]*(.*)$/);
  if (!m) return null;
  const resto = m[1].trim();
  // La barra significa DOS cosas (ver `acordes.ts`), y aquí importa:
  //  · `F/A` → un bajo. Se toca la forma del acorde de arriba; el bajo lo
  //    pone el bajista.
  //  · `m7/b5` → una ALTERACIÓN. Es `m7b5`, y tiene forma propia. Tratarlo
  //    como `m7` hacía sonar la quinta justa en vez de la bemol — lo cazó
  //    `scratchpad/guitarra.mjs` contando las notas.
  const alterado = resto.replace(/\/(b5|#5)$/, "$1");
  if (alterado !== resto) return alterado;
  return resto.split("/")[0].trim();
}

/**
 * Dónde se toca este acorde en la guitarra, o `null` si no se sabe.
 *
 * Se prueban las dos familias y gana la que caiga más cerca del aire.
 */
export function posicionDe(acorde: Acorde): PosicionGuitarra | null {
  const calidad = calidadDe(acorde);
  if (calidad === null) return null;

  const raiz = semitonoDe(acorde.notas[0]);
  if (raiz === null) return null;

  const debenSonar = new Set(
    acorde.notas.map(semitonoDe).filter((x): x is number => x !== null)
  );
  const quinta = (raiz + 7) % 12;

  const candidatas: PosicionGuitarra[] = [];
  const probar = (forma: Forma | undefined, cuerdaRaiz: 6 | 5, aire: number) => {
    if (!forma) return;
    const base = ((raiz - aire) % 12 + 12) % 12;
    const trastes = forma.map((f) => (f === null ? null : base + f));
    // Una forma con traste negativo no cabe tan abajo del mástil: se sube
    // una octava. (La novena en 5ª cuerda baja un traste la tercera.)
    if (trastes.some((t) => t !== null && t < 0)) return;
    if (!suenaBien(trastes, debenSonar, quinta)) return;
    candidatas.push({ base, cuerdaRaiz, trastes });
  };
  probar(EN_SEXTA[calidad], 6, CUERDAS_GUITARRA[0].semitono);
  probar(EN_QUINTA[calidad], 5, CUERDAS_GUITARRA[1].semitono);
  if (!candidatas.length) return null;

  // La más cercana al aire. Empatando, gana la de la 6ª cuerda: suena
  // más llena porque entra el bajo de la cuerda gruesa.
  candidatas.sort((a, b) => a.base - b.base || b.cuerdaRaiz - a.cuerdaRaiz);
  return candidatas[0];
}

/**
 * ¿Esta postura suena de verdad como el acorde?
 *
 * 🔴 Se comprueba EN EJECUCIÓN, no solo al escribir las formas. Una forma
 * mal copiada devuelve trastes con toda la pinta de correctos y suena
 * mal, y eso **no se ve mirando el dibujo**: hay que contar las notas.
 * De las 15 formas escritas a mano, el arnés cazó **cinco** que no
 * sonaban. Con esta comprobación, una forma equivocada deja de dibujarse
 * en vez de llegarle a alguien que la va a tocar en un culto.
 *
 * Dos reglas:
 *  · **Ninguna nota de fuera.** Si suena algo que no está en el acorde,
 *    la postura está mal. Sin excepción.
 *  · **Se puede omitir la QUINTA, y solo ella.** Es lo que hace cualquier
 *    guitarrista —la quinta no define nada— y es lo que permite que los
 *    acordes de novena quepan en cuatro dedos. Faltar la tercera, la
 *    séptima o una alteración sí es un error.
 */
function suenaBien(
  trastes: (number | null)[],
  debenSonar: Set<number>,
  quinta: number
): boolean {
  const suenan = new Set<number>();
  trastes.forEach((t, i) => {
    if (t !== null) suenan.add((CUERDAS_GUITARRA[i].semitono + t) % 12);
  });
  for (const s of Array.from(suenan)) if (!debenSonar.has(s)) return false;
  for (const d of Array.from(debenSonar)) if (!suenan.has(d) && d !== quinta) return false;
  return true;
}

/** El nombre de la nota que suena en una cuerda pisada en un traste. */
export function notaEnTraste(cuerda: number, traste: number, notas: string[]): string | null {
  const semi = (CUERDAS_GUITARRA[cuerda].semitono + traste) % 12;
  // Se devuelve el nombre TAL COMO está escrito en el acorde, para que
  // el diagrama y el nombre no se contradigan (T-13).
  return notas.find((n) => semitonoDe(n) === semi) ?? null;
}
