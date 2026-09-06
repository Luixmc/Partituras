// Qué figura musical corresponde a una duración.
//
// 📌 Vive en `lib/` y no dentro del componente A PROPÓSITO: es lógica pura
// —entra un número, sale una figura— y así **la cubren las pruebas del CI**
// en vez de un arnés suelto. Es lo mismo que se hizo con `music.ts` y
// `acordes.ts`, y por el mismo motivo: lo que se puede probar sin navegador,
// se prueba sin navegador.

/**
 * De una duración en tiempos saca LA FIGURA BASE y CUÁNTOS PUNTILLOS lleva.
 *
 * 🔴 POR QUÉ EXISTE, y es lo que arregla de raíz una familia entera de fallos:
 * antes cada decisión era una LISTA CERRADA de números —
 * `hasDot = beats === 3 || beats === 1.5 || beats === 0.75`, y otras tres
 * iguales para el relleno, el corchete y el doble corchete—. Eso obliga a
 * acordarse de cuatro sitios cada vez que aparece una figura nueva, y **ya se
 * pagó**: O-02 fueron DOS fallos de esa misma familia (la negra con puntillo
 * salía hueca, la corchea con puntillo sin corchete), los dos por un umbral
 * que no contemplaba el puntillo.
 *
 * Con el doble puntillo (O-49) habrían sido CINCO valores más en cada lista.
 *
 * La regla de verdad es simple, y es la de la música:
 *   · la FIGURA BASE decide la forma — relleno, plica y corchetes;
 *   · los PUNTILLOS solo añaden puntos, y **no cambian la forma**.
 * Un puntillo alarga la mitad; dos puntillos, la mitad más un cuarto.
 *
 *   redonda 4 · 6 · 7      blanca 2 · 3 · 3.5      negra 1 · 1.5 · 1.75
 *   corchea 0.5 · 0.75 · 0.875      semicorchea 0.25 · 0.375 · 0.4375
 *
 * Ante una duración que no encaje con ninguna —alguien escribe `:1.3`— se
 * devuelve la base más cercana por debajo y CERO puntillos: se dibuja algo
 * razonable en vez de nada, y sobre todo **no se inventa un puntillo que no
 * está**.
 */
/**
 * Cuántos tiempos vale lo que va detrás de los dos puntos.
 *
 * 🔴 O-70 · Acepta DOS formas, y las dos se quedan (2026-09-05):
 *
 *   · **el número**, como siempre — `:2` `:1.5` `:3.5` `:0.4375`
 *   · **la figura con sus puntillos** — `:2.` es blanca con puntillo y `:2..`
 *     con doble puntillo, que es como se lee en una partitura de verdad
 *
 * Isaac lo pidió porque `:0.4375` **es impracticable de teclear**: con la forma
 * corta es `:0.25..`. Los botones ya ponían las 15 desde O-49; esto es para
 * quien escriba a mano.
 *
 * ⚠️ **La forma vieja NO se toca**, y no es por nostalgia: es lo que hay escrito
 * en las canciones y **lo que siguen poniendo los botones**. Aquí conviven.
 *
 * 📌 Y se midió antes de elegir la sintaxis: de las **72 canciones, NINGUNA**
 * escribía `:N.` con el punto suelto, así que el punto estaba libre. Ojo, que
 * sin esto `parseFloat("2.")` daba **2** — o sea que `:2.` ya "funcionaba" y
 * significaba otra cosa.
 *
 * @returns Los tiempos, o `null` si el texto no es una duración
 */
export function duracionDe(texto: string): number | null {
  const m = /^(\d+(?:\.\d+)?)(\.{0,2})$/.exec(texto);
  if (!m) return null;
  const base = parseFloat(m[1]);
  if (!Number.isFinite(base) || base <= 0) return null;
  // Un puntillo alarga la mitad; dos, la mitad más un cuarto.
  const factor = m[2].length === 2 ? 1.75 : m[2].length === 1 ? 1.5 : 1;
  return base * factor;
}

/** Lo que puede ir detrás de los dos puntos: el número y, si acaso, sus puntillos. */
export const DURACION = String.raw`\d+(?:\.\d+)?\.{0,2}`;

export function figuraDe(beats: number): { base: number; puntillos: number } {
  const BASES = [4, 2, 1, 0.5, 0.25];
  for (const base of BASES) {
    if (casiIgual(beats, base)) return { base, puntillos: 0 };
    if (casiIgual(beats, base * 1.5)) return { base, puntillos: 1 };
    if (casiIgual(beats, base * 1.75)) return { base, puntillos: 2 };
  }
  // Nada encajó: la base más cercana por debajo, sin puntillos.
  const base = BASES.find((b) => beats >= b) ?? 0.25;
  return { base, puntillos: 0 };
}

// Los tiempos son decimales (0.4375, 0.875…), y comparar decimales con `===`
// falla por redondeo. Con una tolerancia pequeña no hay sorpresas.
function casiIgual(a: number, b: number) {
  return Math.abs(a - b) < 0.0001;
}

