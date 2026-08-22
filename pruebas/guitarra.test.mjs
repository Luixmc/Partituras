// ─────────────────────────────────────────────────────────────
// Las posturas de guitarra: que SUENEN.
//
// 🔴 Esta es la prueba que más se parece a un seguro. De las 15 formas que se
// escribieron a mano, la comprobación en ejecución **cazó cinco que no
// sonaban** — y eso NO se ve mirando el dibujo: hay que contar las notas.
//
// Una postura equivocada no da error, no rompe la página y compila
// perfectamente. Simplemente **alguien la toca en un culto y suena mal**.
// ─────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const { posicionDe, CUERDAS_GUITARRA } = await cargar("guitarra");
const { leerAcorde, semitonoDe } = await cargar("acordes");

/** Qué notas suenan de verdad al pisar esos trastes. */
function loQueSuena(pos) {
  const suenan = new Set();
  pos.trastes.forEach((t, i) => {
    if (t !== null) suenan.add((CUERDAS_GUITARRA[i].semitono + t) % 12);
  });
  return suenan;
}

/** Las 32 calidades que aparecen en el repertorio, con una raíz de cada tipo. */
const ACORDES = [
  "C", "G", "D", "A", "E", "F", "Bb", "Eb", "Ab", "F#",
  "Am", "Em", "Dm", "Bm", "F#m", "Cm", "Gm",
  "C7", "G7", "A7", "D7", "B7", "E7",
  "Am7", "Em7", "Dm7", "Bm7", "F#m7", "Cm7", "Gm7",
  "Cmaj7", "Fmaj7", "Bbmaj7",
  "Csus4", "Dsus4", "Asus2", "A4",
  "C6", "Am6", "C9", "Am9", "Cadd9", "Cmaj9",
  "Cdim", "Bdim7", "Cm7b5", "Caug",
];

describe("ninguna postura suena mal", () => {
  for (const escrito of ACORDES) {
    test(escrito, () => {
      const acorde = leerAcorde(escrito);
      assert.ok(acorde, `${escrito} debería leerse`);
      const pos = posicionDe(acorde);
      // Que no haya postura es una respuesta válida y deseable: más vale no
      // enseñar nada que enseñar algo que no suena.
      if (!pos) return;

      const suenan = loQueSuena(pos);
      const deben = new Set(acorde.notas.map(semitonoDe));
      const quinta = (semitonoDe(acorde.notas[0]) + 7) % 12;

      for (const s of suenan) {
        assert.ok(deben.has(s), `${escrito}: suena una nota que no es del acorde`);
      }
      for (const d of deben) {
        // Omitir la quinta es lo que hace cualquier guitarrista, y es lo que
        // permite que las novenas quepan en cuatro dedos.
        if (d !== quinta) assert.ok(suenan.has(d), `${escrito}: falta una nota del acorde`);
      }
    });
  }
});

describe("las posturas son tocables", () => {
  for (const escrito of ["C", "G", "Am", "F", "Bb", "F#m7", "Cm7"]) {
    test(`${escrito} cabe en una mano`, () => {
      const pos = posicionDe(leerAcorde(escrito));
      if (!pos) return;
      const pisados = pos.trastes.filter((t) => t !== null && t > 0);
      if (pisados.length) {
        const abertura = Math.max(...pisados) - Math.min(...pisados);
        assert.ok(abertura <= 4, `${escrito}: ${abertura} trastes de abertura, no llega la mano`);
      }
      assert.ok(pos.base >= 0 && pos.base <= 12, `${escrito}: traste ${pos.base} fuera del mástil`);
      assert.ok(pos.cuerdaRaiz === 6 || pos.cuerdaRaiz === 5);
    });
  }

  test("los acordes al aire ganan a los de cejilla", () => {
    // Es lo que se toca de verdad en un culto.
    for (const escrito of ["C", "G", "D", "A", "E", "Am", "Em", "Dm"]) {
      const pos = posicionDe(leerAcorde(escrito));
      if (pos) assert.ok(pos.base <= 5, `${escrito} debería caer cerca del aire, no en el ${pos.base}`);
    }
  });
});

describe("lo que no se sabe no se dibuja", () => {
  test("una calidad sin forma devuelve null, no una postura inventada", () => {
    const raro = leerAcorde("Cqwerty");
    if (raro) assert.equal(posicionDe(raro), null);
  });
});
