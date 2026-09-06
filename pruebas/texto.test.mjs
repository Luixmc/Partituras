// ─────────────────────────────────────────────────────────────
// Buscar como escribe la gente: sin tildes y sin mayúsculas (O-72).
//
// 🔴 POR QUÉ IMPORTA QUE ESTO ESTÉ PROBADO: **23 de los 72 títulos llevan tilde
// o ñ**. Si esto falla, la canción no aparece y quien busca cree que no está —
// no salta ningún error, igual que con las figuras.
//
// Isaac lo pidió con su ejemplo: «si busco "Aquí Te Esperaré" pero no lo busco
// así sino "aqui" o "esperare", me salga la canción».
// ─────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const { sinTildes, contiene, algunoContiene } = await cargar("texto");

test("🔴 O-72 · el ejemplo de Isaac, tal cual lo dijo", () => {
  const titulo = "Aquí Te Esperaré";
  assert.ok(contiene(titulo, "aqui"), "«aqui» tiene que encontrarla");
  assert.ok(contiene(titulo, "esperare"), "«esperare» tiene que encontrarla");
  // Y al revés: con tilde también, que es como está escrita.
  assert.ok(contiene(titulo, "Aquí"));
  assert.ok(contiene(titulo, "esperaré"));
});

test("O-72 · títulos de verdad del repertorio", () => {
  assert.ok(contiene("Yo Navegaré", "navegare"));
  assert.ok(contiene("Yo Navegaré", "naveg"), "por trozo, como antes");
  assert.ok(contiene("Quiero Conocer A Jesús (Yeshúa)", "jesus"));
  assert.ok(contiene("No Hay Lugar Más Alto", "mas alto"));
  assert.ok(contiene("Yahweh  Se Manifestará", "manifestara"));
});

test("⚠️ O-72 · la Ñ se respeta: «año» no es «ano»", () => {
  assert.equal(sinTildes("Año"), "año");
  assert.ok(contiene("El Año del Señor", "año"));
  assert.ok(contiene("El Año del Señor", "señor"));
  assert.ok(!contiene("Año", "ano"), "«ano» NO puede encontrar «año»");
});

test("O-72 · sin nada escrito sale todo, que es lo que espera quien borra la caja", () => {
  assert.ok(contiene("lo que sea", ""));
  assert.ok(contiene("lo que sea", "   "));
  assert.ok(algunoContiene(["a", "b"], ""));
});

test("O-72 · busca en varios campos, y los vacíos no estorban", () => {
  const campos = ["Aquí Te Esperaré", null, "dice la letra que navegare"];
  assert.ok(algunoContiene(campos, "aqui"), "por el título");
  assert.ok(algunoContiene(campos, "navegare"), "por la letra");
  assert.ok(!algunoContiene(campos, "zzz"));
  assert.ok(!algunoContiene([null, undefined, ""], "algo"));
});

test("O-72 · no encuentra lo que no está", () => {
  assert.ok(!contiene("Aquí Te Esperaré", "esperanza"));
  assert.ok(!contiene(null, "algo"));
});
