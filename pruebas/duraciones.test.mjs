// ─────────────────────────────────────────────────────────────
// `npm run duraciones`: que cace los errores que tiene que cazar.
//
// 🔴 POR QUÉ IMPORTA: el día que Isaac lo pase y diga «todo cuadra», tiene que
// ser verdad. Un detector que se queda ciego —porque alguien movió
// `parseMeasures` o cambió cómo se lee una duración— contesta lo mismo que uno
// que no encontró nada. Estos son los errores plantados con que se probó el
// 2026-10-05 antes de darle la lista; el `F;2` se le escapaba al principio.
// ─────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { revisar } from "../scripts/duraciones-revisar.mjs";

const resumen = (contenido, compas = "4/4") =>
  revisar(contenido, compas).map((h) => `${h.tipo} c${h.n} ${h.compas}`);

test("caza los errores plantados, cada uno con su tipo", () => {
  const plantados =
    "[Prueba]\n| C:1.25 G:2 | D:1,5 E:2 | F;2 A:2 | C:2 G:1 | C:2 G:2 | Bm7:1 :1 z:2 | %:4 |\n6/8\n| C:3 D:1.5 |";
  assert.deepEqual(resumen(plantados), [
    "1 c1 4/4", // C:1.25 no es ninguna figura…
    "3 c1 4/4", // …y el compás tampoco suma
    "2 c2 4/4", // la coma: D:1,5
    "2 c3 4/4", // el punto y coma: F;2 — el que se escapaba
    "3 c4 4/4", // 3 de 4
    "3 c9 6/8", // 4,5 en un 6/8, que son 3 tiempos
  ]);
});

test("lo bien escrito no da nada: silencios, %, la figura sola y el 6/8", () => {
  assert.deepEqual(resumen("[A]\n| C:2 G:2 | Bm7:1 :1 z:2 | %:4 | Am F |\n[B]\n6/8\n| C:1.5 D:1.5 | E:3 |"), []);
});

test("un cambio de compás escrito en una sección vale para las siguientes, como en la página", () => {
  // Fue lo de «Simplemente Alaba»: la sección A heredaba el 2/4 de la Intro.
  assert.deepEqual(resumen("[Intro]\n2/4\n| C:2 |\n[A]\n| G:2 G/B:2 |"), ["3 c1 2/4"]);
  assert.deepEqual(resumen("[Intro]\n2/4\n| C:2 |\n[A]\n4/4\n| G:2 G/B:2 |"), []);
});

test("si lo medido ya se pasa y quedan acordes sin duración, avisa", () => {
  assert.deepEqual(resumen("[A]\n| C:3 G:2 D |"), ["4 c1 4/4"]);
  assert.deepEqual(resumen("[A]\n| C:3 D |"), []);
});

test("el primer compás corto sale con la pista de anacrusa, y con lo que lo reconoce como aceptado", () => {
  const [anacrusa] = revisar("[Intro]\n| C:0.5 B:0.5 | C:4 |", "4/4");
  assert.match(anacrusa.que, /anacrusa/);
  assert.equal(anacrusa.crudo, "C:0.5 B:0.5");
  assert.equal(anacrusa.sec, "Intro");
});
