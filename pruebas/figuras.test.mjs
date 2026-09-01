// ─────────────────────────────────────────────────────────────
// Qué figura corresponde a cada duración, con sus puntillos.
//
// 🔴 POR QUÉ IMPORTA QUE ESTO ESTÉ PROBADO: si la cuenta falla, **no se ve un
// error**. Se dibuja una figura razonable pero equivocada, y quien lee la
// canción toca el doble o la mitad de tiempo. Es exactamente el fallo que ya
// se pagó dos veces con O-02 —la negra con puntillo salía hueca y parecía
// blanca; la corchea con puntillo salía sin corchete— y otra vez con los
// silencios, donde `Z:0.5` se dibujaba como silencio de negra.
//
// Un domingo que suena raro no deja ni un mensaje en la consola.
// ─────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const { figuraDe } = await cargar("figuras");

const NOMBRE = { 4: "redonda", 2: "blanca", 1: "negra", 0.5: "corchea", 0.25: "semicorchea" };

// Las 15 figuras: cinco bases × (normal, con puntillo, con doble puntillo).
const FIGURAS = [
  [4, 4, 0], [6, 4, 1], [7, 4, 2],
  [2, 2, 0], [3, 2, 1], [3.5, 2, 2],
  [1, 1, 0], [1.5, 1, 1], [1.75, 1, 2],
  [0.5, 0.5, 0], [0.75, 0.5, 1], [0.875, 0.5, 2],
  [0.25, 0.25, 0], [0.375, 0.25, 1], [0.4375, 0.25, 2],
];

for (const [beats, base, puntillos] of FIGURAS) {
  const cola = puntillos === 0 ? "" : puntillos === 1 ? " con puntillo" : " con doble puntillo";
  test(`:${beats} es una ${NOMBRE[base]}${cola}`, () => {
    const r = figuraDe(beats);
    assert.equal(r.base, base);
    assert.equal(r.puntillos, puntillos);
  });
}

test("un puntillo alarga la MITAD, y dos la mitad más un cuarto", () => {
  for (const base of [4, 2, 1, 0.5, 0.25]) {
    assert.equal(figuraDe(base * 1.5).puntillos, 1, `${base} × 1.5`);
    assert.equal(figuraDe(base * 1.75).puntillos, 2, `${base} × 1.75`);
    // y la base no cambia por llevar puntillos: una negra con dos puntos
    // sigue siendo una negra, que es lo que decide la forma que se dibuja
    assert.equal(figuraDe(base * 1.75).base, base, `${base} cambia de figura`);
  }
});

test("una duración que no encaja NO se inventa puntillos", () => {
  // Alguien escribe `:1.3` a mano. Se dibuja algo razonable —la base más
  // cercana por debajo— pero sin puntos, porque un punto de más es un dato
  // musical falso, y esos son los que no se ven.
  for (const raro of [1.3, 0.9, 5, 2.4]) {
    assert.equal(figuraDe(raro).puntillos, 0, `:${raro} inventó un puntillo`);
  }
});

test("los decimales feos no fallan por redondeo", () => {
  // 0.4375 y 0.875 salen de dividir, y comparar decimales con `===` falla.
  // Por eso `figuraDe` compara con tolerancia; esto lo deja fijado.
  assert.equal(figuraDe(0.5 * 1.75).puntillos, 2);
  assert.equal(figuraDe(0.25 * 1.75).puntillos, 2);
  assert.equal(figuraDe(0.1 + 0.15 + 0.1875).puntillos, 2); // 0.4375 sumado
});

test("una duración por debajo de todo cae en semicorchea, sin reventar", () => {
  const r = figuraDe(0.05);
  assert.equal(r.base, 0.25);
  assert.equal(r.puntillos, 0);
});
