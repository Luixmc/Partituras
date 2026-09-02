// ─────────────────────────────────────────────────────────────
// Cómo se reparte una sección larga entre las casillas (O-52).
//
// 🔴 POR QUÉ IMPORTA QUE ESTO ESTÉ PROBADO: si la cuenta falla, **no salta
// ningún error**. La canción se dibuja repartida de otra manera, y quien lo
// nota es el que la está tocando en mitad del culto. Es el mismo caso que las
// figuras: un domingo que se lee raro no deja ni una línea en la consola.
//
// Lo que Isaac pidió, y es lo que se fija aquí:
//   «cuatro compases mínimos, o las que pueda para que aproveche lo máximo los
//    espacios, no que quede tan estrecho pero si los que pueda la página».
// ─────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const { repartirBloques, cortesDe, MINIMO_POR_BLOQUE, MAXIMO_BLOQUES } = await cargar("reparto");

test("una seccion CORTA que no cabe tambien se reparte", () => {
  // «Su Presencia», Intro Sinte: DOS compases que envolvian dentro de la caja.
  // Isaac los quiere uno al lado del otro, siguiendo el orden de lectura.
  assert.deepEqual(repartirBloques(2, 1), [1, 1]);
  assert.deepEqual(repartirBloques(3, 2), [2, 1]);
});

test("si la sección CABE entera, no se parte", () => {
  assert.deepEqual(repartirBloques(4, 8), [4]);
  assert.equal(MINIMO_POR_BLOQUE, 4);
  assert.deepEqual(repartirBloques(8, 8), [8]);
  assert.deepEqual(repartirBloques(12, 20), [12]);
});

test("🔴 NINGUN bloque envuelve: ese fue el fallo de media pantalla", () => {
  // Isaac, 2026-09-01, con la ventana a la mitad: los bloques eran de 5 donde
  // solo cabian 3, asi que cada uno se partia en dos filas. La regla es que
  // **ningun bloque puede pasar de lo que cabe en una fila**.
  for (let total = 4; total <= 60; total++) {
    for (let cabe = 1; cabe <= 15; cabe++) {
      const r = repartirBloques(total, cabe);
      if (r.length > 1) {
        assert.ok(
          r.every((t) => t <= cabe),
          `${total} compases con sitio para ${cabe} sacó ${r.join("+")}`
        );
      }
    }
  }
});

test("«Cada Vez» a pantalla completa: como ya salia bien, no cambia", () => {
  // La A tiene 10 bloques y la C 12. Con sitio para 5 o 6 en una fila:
  assert.deepEqual(repartirBloques(10, 5), [5, 5]);
  assert.deepEqual(repartirBloques(10, 6), [5, 5]);
  assert.deepEqual(repartirBloques(12, 4), [4, 4, 4]);
  assert.deepEqual(repartirBloques(12, 5), [4, 4, 4]);
});

test("«Cada Vez» a MEDIA pantalla: lo que el vio mal", () => {
  // Con sitio para 3 en una fila, antes salia 5+5 (envolviendo). Ahora:
  assert.deepEqual(repartirBloques(10, 3), [3, 3, 2, 2]);
  assert.deepEqual(repartirBloques(12, 3), [3, 3, 3, 3]);
  // Pero si hicieran falta mas de 4 trozos, se deja entera (tope).
  assert.deepEqual(repartirBloques(12, 2), [12]);
});

test("se hacen los MENOS bloques posibles, o sea los mas grandes", () => {
  // «Que aproveche lo maximo los espacios»: entre varios repartos validos,
  // el de menos bloques es el de bloques mas grandes.
  for (let total = 4; total <= 40; total++) {
    for (let cabe = 2; cabe <= 12; cabe++) {
      const r = repartirBloques(total, cabe);
      if (r.length > 2) {
        // Con un bloque menos, alguno tendria que pasar de lo que cabe.
        const conUnoMenos = Math.ceil(total / (r.length - 1));
        assert.ok(conUnoMenos > cabe, `${total}/${cabe}: sobra un bloque`);
      }
    }
  }
});

test("se reparte PAREJO: no queda un ultimo bloque suelto", () => {
  // Con 10 en 4 bloques salen 3+3+2+2, no 3+3+3+1.
  assert.deepEqual(repartirBloques(10, 3), [3, 3, 2, 2]);
  // En general, entre el mayor y el menor no puede haber mas de 1 de diferencia.
  for (let total = 4; total <= 60; total++) {
    for (let cabe = 2; cabe <= 15; cabe++) {
      const r = repartirBloques(total, cabe);
      assert.ok(Math.max(...r) - Math.min(...r) <= 1, `${total}/${cabe} → ${r.join("+")}`);
    }
  }
});

test("🔴 EN EL TELEFONO no se trocea en diez: se deja entera", () => {
  // Lo enseno el telefono de Isaac el 2026-09-01: en vertical solo cabe UN
  // compas por fila, y sin tope la seccion salia en diez tarjetas con diez
  // cabeceras. Peor que dejarla entera.
  assert.deepEqual(repartirBloques(10, 1), [10]);
  assert.deepEqual(repartirBloques(12, 1), [12]);
  assert.deepEqual(repartirBloques(12, 2), [12]); // harian falta 6

  // Lo que SI protege el tope: una seccion larga en un movil no se hace polvo.
  for (let total = 5; total <= 40; total++) {
    assert.deepEqual(repartirBloques(total, 1), [total], `${total} con sitio para 1`);
  }
});

test("nunca se pasa del tope de trozos", () => {
  assert.equal(MAXIMO_BLOQUES, 4);
  for (let total = 1; total <= 80; total++) {
    for (let cabe = 0; cabe <= 20; cabe++) {
      assert.ok(
        repartirBloques(total, cabe).length <= MAXIMO_BLOQUES,
        `${total} compases con sitio para ${cabe}`
      );
    }
  }
});

test("no se pierde ni se inventa ningún compás", () => {
  for (let total = 1; total <= 60; total++) {
    for (let caben = 0; caben <= 15; caben++) {
      const r = repartirBloques(total, caben);
      assert.equal(r.reduce((a, b) => a + b, 0), total, `${total} / ${caben}`);
      assert.ok(r.every((t) => t > 0), `${total}/${caben} sacó un bloque vacío`);
    }
  }
});

test("los cortes son contiguos y cubren la sección entera", () => {
  assert.deepEqual(cortesDe(10, 3), [
    [0, 3],
    [3, 6],
    [6, 8],
    [8, 10],
  ]);
  // Y en general: cada corte empieza donde acabó el anterior.
  for (let total = 1; total <= 30; total++) {
    const c = cortesDe(total, 5);
    assert.equal(c[0][0], 0);
    assert.equal(c[c.length - 1][1], total);
    for (let i = 1; i < c.length; i++) assert.equal(c[i][0], c[i - 1][1]);
  }
});

test("una sección vacía no revienta", () => {
  assert.deepEqual(repartirBloques(0, 6), []);
  assert.deepEqual(cortesDe(0, 6), []);
});

test("ante un ancho sin medir o absurdo, NO se toca la seccion", () => {
  // El navegador puede devolver 0 antes de medir. Mas vale verla como siempre
  // que repartirla por un numero inventado.
  for (const raro of [0, -3, NaN, Infinity]) {
    assert.deepEqual(repartirBloques(8, raro), [8], `ancho ${raro}`);
  }
  // Un decimal se redondea hacia abajo: si caben "6,9", caben 6.
  assert.deepEqual(repartirBloques(8, 6.9), [4, 4]);
});
