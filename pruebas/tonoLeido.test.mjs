// ─────────────────────────────────────────────────────────────
// En qué tono se lee una canción (O-86).
//
// 🔴 ESTAS PRUEBAS EXISTEN PARA QUE DOS PANTALLAS NO SE SEPAREN. La cuenta del
// tono la necesitan la pantalla completa —desde agosto— y el PDF del culto
// —desde hoy, porque el trompetista se lo lleva en papel—. Mientras estuvo
// escrita en línea dentro de la presentación, copiarla al PDF habría sido lo
// natural… y el día que una de las dos cambiara, **el papel diría un tono y la
// tablet otro, y se descubriría en mitad de un culto**.
//
// Ahora la cuenta está en un solo sitio y esto la fija. Lo que se prueba no es
// aritmética: es que las cuatro cosas que salen de aquí —cuánto transponer, con
// qué ortografía, qué se lee y qué suena— **no se puedan contradecir** (T-14).
// ─────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const { tonoLeido } = await cargar("tonoLeido");
const { transposeContent } = await cargar("music");
const { semitonosDe } = await cargar("transpositores");

const TROMPETA = semitonosDe("sib"); // +2

describe("sin tocar nada, no se toca nada", () => {
  test("una canción en su tono se queda como está escrita", () => {
    const t = tonoLeido({ original: "D", destino: null });
    assert.equal(t.semitonos, 0);
    assert.equal(t.seLee, "D");
    assert.equal(t.suena, null, "sin instrumento no hay nada que aclarar");
  });

  test("🔴 y se respeta la ORTOGRAFÍA escrita, no se recalcula (T-11)", () => {
    // Elegir entre `Bb` y `A#` ya lo hizo quien escribió la canción. Si aquí se
    // recalculara, la etiqueta podría decir «A#» con los acordes en «Bb».
    const t = tonoLeido({ original: "Bb", destino: null });
    assert.equal(t.seLee, "Bb");
    assert.equal(t.bemoles, true);
  });

  test("el tono del culto manda sobre el original", () => {
    const t = tonoLeido({ original: "C", destino: "D" });
    assert.equal(t.semitonos, 2);
    assert.equal(t.seLee, "D");
  });
});

describe("lo que lee el trompetista (D-28)", () => {
  test("🔴 una canción en D se le da en E, y se dicen LOS DOS", () => {
    // El motivo de enseñar los dos no es informativo: sin ellos, él diría
    // «estamos en E» y el resto «no, en D», discutiendo en mitad del culto.
    const t = tonoLeido({ original: "D", destino: null, desplazamiento: TROMPETA });
    assert.equal(t.semitonos, 2);
    assert.equal(t.seLee, "E");
    assert.equal(t.suena, "D");
  });

  test("🔴 una canción en F se le da en G, SIN heredar los bemoles", () => {
    // F lleva un bemol; G no lleva ninguno. Si la ortografía se heredara del
    // tono de partida, saldría un `Gb`/`Bb` donde toca `F#`/`B`.
    const t = tonoLeido({ original: "F", destino: null, desplazamiento: TROMPETA });
    assert.equal(t.seLee, "G");
    assert.equal(t.bemoles, false);
  });

  test("se conserva el modo menor", () => {
    const t = tonoLeido({ original: "Dm", destino: null, desplazamiento: TROMPETA });
    assert.equal(t.seLee, "Em");
    assert.equal(t.suena, "Dm");
  });

  test("y suma con el tono del culto, no lo sustituye", () => {
    // La canción está en C, el culto la toca en D, y él lee E.
    const t = tonoLeido({ original: "C", destino: "D", desplazamiento: TROMPETA });
    assert.equal(t.semitonos, 4);
    assert.equal(t.seLee, "E");
    assert.equal(t.suena, "D");
  });
});

describe("🔴 el papel y la pantalla no se pueden separar (O-86)", () => {
  // Esto es lo que de verdad justifica el módulo. Se recorren las tonalidades
  // reales del repertorio y se comprueba que la cuenta del PDF —que solo pasa
  // el instrumento— coincide con la de la pantalla completa cuando el músico
  // no ha movido nada a mano. Si alguien vuelve a escribir la cuenta en una de
  // las dos, esto salta.
  const TONOS = ["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb", "Ab", "Db", "F#", "Dm", "Em", "Am", "Bm", "G#m"];

  for (const instrumento of ["do", "sib"]) {
    test(`con «${instrumento}», el PDF calcula lo mismo que la pantalla`, () => {
      for (const tono of TONOS) {
        const pantalla = tonoLeido({
          original: tono,
          destino: null,
          ajuste: 0, // el músico no ha tocado los ± de la barra
          desplazamiento: semitonosDe(instrumento),
        });
        const papel = tonoLeido({
          original: tono,
          destino: null,
          desplazamiento: semitonosDe(instrumento),
        });
        assert.deepEqual(papel, pantalla, `se separan en ${tono}`);
      }
    });
  }

  test("🔴 y los ACORDES escritos coinciden con la etiqueta del tono", () => {
    // El fallo que esto impide es T-14 tal cual: la barra decía «E» y debajo
    // estaba escrito en bemoles, como si fuera Fb. La etiqueta y los acordes
    // tienen que salir del mismo par (semitonos, ortografía).
    for (const tono of ["D", "F", "Bb", "A", "Eb"]) {
      const t = tonoLeido({ original: tono, destino: null, desplazamiento: TROMPETA });
      // El acorde de tónica, transpuesto igual que el contenido de la canción.
      const tonica = transposeContent(tono.replace(/m$/, ""), t.semitonos, t.bemoles);
      assert.equal(tonica, t.seLee.replace(/m$/, ""), `la etiqueta miente en ${tono}`);
    }
  });
});

describe("lo que suena, para el reproductor", () => {
  test("🔴 los semitonos del CULTO no llevan el instrumento", () => {
    // Si el reproductor sonara con los de lectura, la melodía saldría un tono
    // por encima del grupo en cuanto el trompetista eligiera su instrumento.
    const t = tonoLeido({ original: "C", destino: "D", desplazamiento: TROMPETA });
    assert.equal(t.semitonosDelCulto, 2, "solo original → culto");
    assert.equal(t.semitonos, 4, "lectura: culto + instrumento");
  });
});

describe("lo que no se sabe no revienta", () => {
  test("🔴 sin tonalidad escrita, los ACORDES se mueven igual", () => {
    // 8 canciones del catálogo no tienen tonalidad puesta. Que no sepamos cómo
    // se llama su tono no cambia lo que necesita el trompetista: sus acordes
    // siguen teniendo que subir dos semitonos o sonará por debajo del grupo.
    // Lo que no se puede es inventarle un nombre de tono a la etiqueta.
    const t = tonoLeido({ original: null, destino: null, desplazamiento: TROMPETA });
    assert.equal(t.semitonos, TROMPETA, "los acordes sí se transponen");
    assert.equal(t.seLee, null, "pero no hay tono que enseñar");
    assert.equal(t.suena, null);
  });

  test("una tonalidad que no se reconoce", () => {
    const t = tonoLeido({ original: "H7", destino: null });
    assert.equal(t.semitonos, 0);
    assert.equal(t.seLee, "H7", "se devuelve tal cual, sin inventar");
  });
});
