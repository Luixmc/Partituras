// ─────────────────────────────────────────────────────────────
// Los instrumentos que suenan en otro tono del que leen (D-28).
//
// 🔴 Esto se prueba con números porque **el error no se ve**: si la cuenta
// está mal, el trompetista lee algo que parece razonable, lo toca, y suena
// un tono fuera del grupo. No hay pantalla en rojo ni error en la consola —
// solo un domingo que suena raro.
//
// La regla, para no volver a razonarla: un instrumento en Bb **suena un tono
// más grave de lo que lee**, así que su parte se escribe **un tono por
// encima**. Toca su `E` → suena `D`.
// ─────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const { TRANSPOSITORES, semitonosDe, TRANSPOSITOR_POR_DEFECTO } = await cargar("transpositores");
const { keyToPitch, esMenor, ortografiaDe, transposeContent } = await cargar("music");

const SOSTENIDOS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BEMOLES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

/** El tono que se le enseña a ese instrumento, escrito como se lee. */
function loQueLee(tono, instrumento) {
  const base = keyToPitch(tono);
  const menor = esMenor(tono);
  const destino = ((base + semitonosDe(instrumento)) % 12 + 12) % 12;
  const nota = (ortografiaDe(destino, menor) ? BEMOLES : SOSTENIDOS)[destino];
  return menor ? `${nota}m` : nota;
}

describe("la cuenta de cada instrumento", () => {
  test("por defecto NO se transpone nada", () => {
    assert.equal(semitonosDe(TRANSPOSITOR_POR_DEFECTO), 0);
    assert.equal(semitonosDe("do"), 0);
  });

  test("la trompeta (en Bb) sube UN TONO: 2 semitonos", () => {
    assert.equal(semitonosDe("sib"), 2);
  });

  test("solo hay dos opciones: como suena y trompeta", () => {
    // Isaac quitó el Mi bemol del saxo alto el 2026-08-22: «nada más usamos
    // trompeta». Si algún día vuelve, se añade aquí y en `transpositores.ts`.
    assert.deepEqual(TRANSPOSITORES.map((t) => t.id).sort(), ["do", "sib"]);
  });

  test("lo que no se reconoce no transpone: ante la duda, como suena", () => {
    // Importante que sea 0 y no otra cosa: si un día se guarda un valor viejo
    // en el navegador, lo peor que puede pasar es que se vea el tono normal.
    for (const raro of ["", "mib", "sib2", null, undefined]) {
      assert.equal(semitonosDe(raro), 0, JSON.stringify(raro));
    }
  });

  test("no hay dos instrumentos con el mismo identificador", () => {
    const ids = TRANSPOSITORES.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe("qué lee el trompetista en las canciones de Isaac", () => {
  // Los tonos reales del repertorio, con cuántas canciones hay en cada uno.
  const CASOS = [
    ["D", "E"], ["F", "G"], ["E", "F#"], ["C", "D"], ["G", "A"],
    ["Bb", "C"], ["A", "B"], ["B", "Db"], ["F#", "Ab"],
    ["Dm", "Em"], ["Bm", "C#m"], ["Em", "F#m"], ["Am", "Bm"],
    ["Gm", "Am"], ["Cm", "Dm"], ["G#m", "Bbm"],
  ];
  for (const [suena, lee] of CASOS) {
    test(`la canción en ${suena} se le enseña en ${lee}`, () => {
      assert.equal(loQueLee(suena, "sib"), lee);
    });
  }

  test("con «como suena» el tono no se mueve", () => {
    for (const [suena] of CASOS) assert.equal(loQueLee(suena, "do"), suena);
  });
});

describe("los acordes también se reescriben, no solo la etiqueta", () => {
  test("una canción en D se le enseña con los acordes de E", () => {
    // Si solo cambiara el rótulo y no los acordes, sería T-14 al revés: la
    // barra diciendo una cosa y la partitura otra.
    const enD = "D A Bm G";
    const enE = transposeContent(enD, semitonosDe("sib"), ortografiaDe(keyToPitch("E"), false));
    assert.equal(enE, "E B C#m A");
  });

  test("una canción en F se le enseña en G, sin bemoles heredados", () => {
    // F es tono de bemoles y G de sostenidos: si se heredara la ortografía de
    // partida saldría `Gb`-algo, que es justo el fallo T-14.
    const enF = "F Bb C Dm";
    const enG = transposeContent(enF, semitonosDe("sib"), ortografiaDe(keyToPitch("G"), false));
    assert.equal(enG, "G C D Em");
  });

  test("volver a «como suena» deja los acordes intactos", () => {
    const escrito = "F Bb C Dm";
    assert.equal(transposeContent(escrito, semitonosDe("do"), false), escrito);
  });
});
