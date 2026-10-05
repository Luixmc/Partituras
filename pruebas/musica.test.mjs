// ─────────────────────────────────────────────────────────────
// El tono: transponer, y sobre todo CÓMO SE ESCRIBE lo transpuesto.
//
// 🔴 Estas pruebas no son teóricas: cada bloque de abajo es un fallo que
// llegó a la página y que Isaac encontró tocando. Cuatro en dos semanas, y
// todos de la misma familia — el tono se DEDUCÍA de la información
// equivocada:
//
//   T-06 · una canción en "Bm" salía como "B": se perdía el modo al transponer
//   T-11 · una canción en "Bb" salía como "A#": se recalculaba lo ya escrito
//   T-13 · el acorde "Bb" decía tener las notas "A# D F"
//   T-14 · bajando de F a E salían "Dbm Gbm7 Abm7" — escrito como si fuera Fb
//
// Por eso el archivo empieza por aquí y no por lo fácil.
// ─────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const { transposeContent, keyToPitch, esMenor, prefersFlats, ortografiaDe } = await cargar("music");

describe("de qué tonalidad hablamos", () => {
  test("el modo NO se pierde: Bm es una tonalidad distinta de B (T-06)", () => {
    assert.equal(esMenor("Bm"), true);
    assert.equal(esMenor("B"), false);
    // La altura es la misma; lo que cambia es el modo. Confundirlos fue T-06.
    assert.equal(keyToPitch("Bm"), keyToPitch("B"));
  });

  test("entiende las tonalidades escritas con bemol", () => {
    assert.equal(keyToPitch("Bb"), 10);
    assert.equal(keyToPitch("Eb"), 3);
    assert.equal(keyToPitch("A#"), 10, "Bb y A# son la misma tecla");
  });
});

describe("bemoles o sostenidos: manda el tono AL QUE SE LLEGA (T-14)", () => {
  // La regla no es de nadie: es el círculo de quintas. G, D, A, E y B
  // llevan sostenidos; F, Bb, Eb, Ab y Db llevan bemoles.
  const MAYORES = [
    [0, false, "C"], [1, true, "Db"], [2, false, "D"], [3, true, "Eb"],
    [4, false, "E"], [5, true, "F"], [6, false, "F#"], [7, false, "G"],
    [8, true, "Ab"], [9, false, "A"], [10, true, "Bb"], [11, false, "B"],
  ];
  for (const [pitch, bemoles, nombre] of MAYORES) {
    test(`${nombre} se escribe con ${bemoles ? "bemoles" : "sostenidos"}`, () => {
      assert.equal(ortografiaDe(pitch, false), bemoles);
    });
  }

  test("los menores tienen su propia tabla: Dm lleva bemoles y D no", () => {
    assert.equal(ortografiaDe(2, true), true,  "Dm");
    assert.equal(ortografiaDe(2, false), false, "D");
  });

  test("aguanta alturas fuera de rango sin romperse", () => {
    assert.equal(ortografiaDe(-1, false), ortografiaDe(11, false));
    assert.equal(ortografiaDe(13, false), ortografiaDe(1, false));
  });
});

describe("EL CASO DE ISAAC: bajar de F a E (T-14)", () => {
  // Su captura del 2026-08-21. La barra decía «Tono: E» y debajo los acordes
  // estaban escritos como si el tono fuera Fb. Nadie toca en Fb.
  const DE_F_A_E = 11; // bajar un semitono es subir once
  const flats = ortografiaDe(keyToPitch("E"), false);

  test("el destino, E, se escribe con sostenidos", () => {
    assert.equal(flats, false);
  });

  const CASOS = [
    ["Dbm", "C#m"],
    ["Gbm7", "F#m7"],
    ["Abm7", "G#m7"],
    ["Ab/C", "G#/C"],
    ["Eb", "D#"],
  ];
  for (const [malo, bueno] of CASOS) {
    test(`el segundo grado sale ${bueno} y no ${malo}`, () => {
      const origen = { "C#m": "Dm", "F#m7": "Gm7", "G#m7": "Am7", "G#/C": "A/C#", "D#": "E" }[bueno];
      const salida = transposeContent(origen, DE_F_A_E, flats).trim();
      assert.equal(salida, bueno, `${origen} +11 con sostenidos`);
    });
  }
});

describe("lo que NO se debe tocar", () => {
  test("sin transposición, el contenido sale IDÉNTICO (T-11)", () => {
    // Es la regla de fondo: un dato que el usuario escribió no se recalcula.
    // Recalcular obliga a elegir entre Bb y A#, y esa elección ya la tomó él.
    const escrito = "|: Bb:2 Cm7 F7 :| Ebmaj7 ~ Gm";
    assert.equal(transposeContent(escrito, 0, false), escrito);
    assert.equal(transposeContent(escrito, 0, true), escrito);
  });

  test("las etiquetas de sección no se transponen", () => {
    // "[A]" y "<Conteo>" no son acordes aunque empiecen por letra de nota.
    const contenido = "[Coro]\nC D E";
    const salida = transposeContent(contenido, 2, false);
    assert.ok(salida.startsWith("[Coro]"), "la etiqueta se queda igual");
    assert.ok(salida.includes("D E F#"), "los acordes sí se mueven");
  });

  test("dar la vuelta completa devuelve lo mismo", () => {
    const escrito = "C G Am F";
    assert.equal(transposeContent(transposeContent(escrito, 5, false), 7, false), escrito);
  });
});

// O-89 · 2026-10-04. Isaac creó la versión en B de «Tu Hijo Soy» y tuvo que
// poner a mano los acordes de una línea. Al revisar las 26 versiones salieron
// DOS fallos distintos, los dos ya en producción:
describe("lo que NO es acorde no se toca, y lo que sí se mueve todo (O-89)", () => {
  test("una línea que EMPIEZA con texto amarillo sigue transportando sus acordes", () => {
    // Antes se saltaba la línea entera si empezaba por "<" (de cuando las
    // secciones se escribían <Coro>). Caso real: «Tu Hijo Soy», D → B.
    const linea = "<C> (x3) | Bm7:1 :1 z:2 | G:1 :1 z:2 | D | % |";
    assert.equal(
      transposeContent(linea, -3, false),
      "<C> (x3) | G#m7:1 :1 z:2 | E:1 :1 z:2 | B | % |"
    );
    // Caso real: «Tengo Fe», D → A. La E quedaba sin mover.
    assert.equal(transposeContent("<A> (Una vez) | E", 7, false), "<A> (Una vez) | B");
  });

  test("la letra entre paréntesis no se transporta aunque tenga palabras con mayúscula", () => {
    // Caso real: «Hay Poder En La Alabanza», Dm → Bbm: salía «Tengo un Bbios».
    assert.equal(
      transposeContent("|: Dm7 (Tengo un Dios... x6) | D:2 C:2 |", -4, true),
      "|: Bbm7 (Tengo un Dios... x6) | Bb:2 Ab:2 |"
    );
  });

  test("el texto amarillo con espacios se queda igual, esté donde esté", () => {
    assert.equal(
      transposeContent("C <Entra Guitarra> G <Bajo y Batería>", 2, false),
      "D <Entra Guitarra> A <Bajo y Batería>"
    );
    // Pegado al acorde, también.
    assert.equal(transposeContent("C(Gloria a Dios)", 2, false), "D(Gloria a Dios)");
  });

  test("las secciones con espacios no se tocan, y un texto sin cerrar tampoco", () => {
    assert.equal(transposeContent("[C Banda Solo]", 2, false), "[C Banda Solo]");
    assert.equal(transposeContent("<Coro", 2, false), "<Coro");
  });
});

describe("prefersFlats, que sigue usándose donde el destino ya se conoce", () => {
  test("acierta con las tonalidades escritas", () => {
    assert.equal(prefersFlats("Bb"), true);
    assert.equal(prefersFlats("E"), false);
    assert.equal(prefersFlats("Dm"), true);
  });
  test("sin tonalidad no inventa: sostenidos", () => {
    assert.equal(prefersFlats(null), false);
    assert.equal(prefersFlats(undefined), false);
  });
});
