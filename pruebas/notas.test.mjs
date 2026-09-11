// ─────────────────────────────────────────────────────────────
// Las notas privadas de cada músico (O-74).
//
// Lo que se prueba aquí es QUIÉN ve el recuadro y cómo se guarda el texto.
// Que sean privadas lo garantiza la base (RLS de `notas_musico`), no esto.
// ─────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const { puedeTenerNotas, ROLES_NOTAS, limpiarNota, notaVacia, LARGO_MAXIMO_NOTA } = await cargar("notas");

test("las notas son del MÚSICO y del ADMINISTRADOR; el lector no (Isaac, 2026-09-10)", () => {
  assert.deepEqual(ROLES_NOTAS, ["admin", "musician"]);
  assert.equal(puedeTenerNotas("musician"), true);
  assert.equal(puedeTenerNotas("admin"), true);
  assert.equal(puedeTenerNotas("viewer"), false, "lo único que el músico tiene de más que el lector");
  assert.equal(puedeTenerNotas(null), false);
  assert.equal(puedeTenerNotas(undefined), false);
});

test("la nota se guarda limpia, pero sin tocar lo que escribió", () => {
  assert.equal(limpiarNota("  Yo la toco en G  "), "Yo la toco en G");
  assert.equal(limpiarNota("Entro en el 2.º compás\r\nSubo una octava"), "Entro en el 2.º compás\nSubo una octava");
  assert.equal(limpiarNota("¡OJO! Aquí BAJA"), "¡OJO! Aquí BAJA", "ni mayúsculas ni signos");
  assert.equal(limpiarNota(null), "");
});

test("no se pasa del máximo, y una vacía se borra en vez de guardarse", () => {
  assert.equal(limpiarNota("x".repeat(5000)).length, LARGO_MAXIMO_NOTA);
  assert.equal(notaVacia("   \n  "), true);
  assert.equal(notaVacia(""), true);
  assert.equal(notaVacia("G"), false);
});
