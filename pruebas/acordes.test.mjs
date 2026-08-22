// ─────────────────────────────────────────────────────────────
// Qué notas tiene un acorde, y cómo se escriben.
//
// Aquí vive la regla de T-13: **las notas se nombran por GRADOS, no por
// semitonos**. La tercera de `Bb` es un `D` porque está dos letras más arriba
// —B, C, D—, no porque caiga en tal semitono. Contando semitonos hay que
// elegir entre `A#` y `Bb`, y esa elección no se puede acertar sin saber de
// dónde viene la nota.
//
// Y la regla de la BARRA, que Isaac tuvo que explicar: lo que va detrás de "/"
// son DOS cosas distintas y confundirlas hace que el bajista toque una nota
// que no existe.
// ─────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const { leerAcorde, semitonoDe } = await cargar("acordes");

const notas = (escrito) => leerAcorde(escrito)?.notas.join(" ");

describe("las notas se nombran por grados (T-13)", () => {
  // Cada línea de aquí salía MAL antes del 2026-08-21.
  const CASOS = [
    ["Bb",      "Bb D F"],
    ["Gm",      "G Bb D"],
    ["Cm7",     "C Eb G Bb"],
    ["Ebmaj7",  "Eb G Bb D"],
    ["C",       "C E G"],
    ["Am7",     "A C E G"],
    ["F#m7",    "F# A C# E"],
  ];
  for (const [escrito, esperado] of CASOS) {
    test(`${escrito} = ${esperado}`, () => assert.equal(notas(escrito), esperado));
  }
});

describe("los dos casos que PARECEN fallos y no lo son", () => {
  // Isaac los revisó y dijo «está bien así, déjalos». Están aquí para que
  // nadie los «arregle» y los estropee.
  test("Bbmaj7/#9 lleva un sostenido dentro de un acorde de bemoles", () => {
    // La novena de Bb es C; aumentada es C#. Un Db ahí estaría MAL.
    assert.equal(notas("Bbmaj7/#9"), "Bb D F A C#");
  });

  test("Dbm da Fb, aunque Fb suene igual que E", () => {
    // La tercera menor de Db es Fb: baja tres semitonos Y dos letras.
    assert.equal(notas("Dbm"), "Db Fb Ab");
    assert.equal(notas("Dbm7"), "Db Fb Ab Cb");
  });
});

describe("la barra significa DOS cosas distintas", () => {
  test("/A es un BAJO: el bajista toca esa nota", () => {
    const a = leerAcorde("F/A");
    assert.equal(a.bajo, "A");
    assert.deepEqual(a.notas, ["F", "A", "C"], "el acorde de arriba no cambia");
  });

  test("/b5 es una ALTERACIÓN: el bajo sigue siendo la fundamental", () => {
    const a = leerAcorde("F#m7/b5");
    assert.equal(a.bajo, "F#", "el bajista NO toca un Bb");
    assert.ok(a.notas.length >= 4);
  });

  test("b5 SUSTITUYE a la quinta, no se añade encima", () => {
    // Añadirla hacía sonar la quinta justa y la bemol a la vez.
    const justa = semitonoDe(leerAcorde("F#m7").notas[2]);
    const bemol = semitonoDe(leerAcorde("F#m7/b5").notas[2]);
    assert.equal((justa - bemol + 12) % 12, 1, "la quinta baja un semitono");
    assert.equal(leerAcorde("F#m7/b5").notas.length, 4, "siguen siendo cuatro notas");
  });

  test("acorde sobre acorde: A/G#m, el bajo es la fundamental del de abajo", () => {
    assert.equal(leerAcorde("A/G#m").bajo, "G#");
  });
});

describe("la notación propia de Isaac", () => {
  test("A4 es Asus4", () => {
    assert.equal(notas("A4"), notas("Asus4"));
  });

  test("E#m2/b5, el que parecía imposible", () => {
    // Menor con la segunda añadida y la quinta disminuida. Lo explicó él.
    assert.equal(notas("E#m2/b5"), "E# F## G# B");
  });
});

describe("lo que no se sabe, NO se inventa", () => {
  test("una calidad desconocida se marca, no se adivina", () => {
    const a = leerAcorde("Cqwerty");
    // O no lo lee, o lo lee marcándolo. Lo que no puede es devolver notas
    // inventadas como si las supiera.
    if (a) assert.equal(a.desconocida, true);
  });

  test("lo que no es un acorde devuelve null", () => {
    for (const basura of ["", "   ", "Z", "%", "|"]) {
      assert.equal(leerAcorde(basura), null, JSON.stringify(basura));
    }
  });
});

describe("semitonoDe entiende las dobles alteraciones", () => {
  test("F## suena como G", () => assert.equal(semitonoDe("F##"), semitonoDe("G")));
  test("Cb suena como B", () => assert.equal(semitonoDe("Cb"), semitonoDe("B")));
  test("Fb suena como E", () => assert.equal(semitonoDe("Fb"), semitonoDe("E")));
});
