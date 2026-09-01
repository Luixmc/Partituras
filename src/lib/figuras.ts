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

