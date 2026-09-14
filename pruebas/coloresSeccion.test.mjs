// ─────────────────────────────────────────────────────────────
// Un color por sección (O-83).
//
// 🔴 ESTAS PRUEBAS EXISTEN POR UN MOTIVO CONCRETO: las etiquetas de las
// canciones NO son un menú cerrado, son lo que Isaac teclea. En producción hay
// más de 300 distintas y casi todas aparecen una sola vez. Lo que sí es cerrado
// es su PRIMERA PALABRA, y todo esto se apoya en eso.
//
// Así que aquí se prueba con etiquetas REALES —incluidas las cuatro rarezas de
// una sola aparición— y con las que todavía no existen pero existirán el día
// que escriba `[Puente 2]`. Si alguien cambia el reparto, salta aquí y no en la
// tablet de un músico en mitad del culto.
// ─────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const { claveDe, colorDeEtiqueta, paletaPorId, PALETAS } = await cargar("coloresSeccion");

describe("la clave sale de la PRIMERA palabra, no de la etiqueta entera", () => {
  test("la etiqueta pelada", () => {
    assert.equal(claveDe("Intro"), "intro");
    assert.equal(claveDe("Final"), "final");
    assert.equal(claveDe("Coda"), "coda");
  });

  test("🔴 con el primer verso pegado, que es como están casi todas", () => {
    // De las 87 canciones de producción. Sin esto, cada una sería un color.
    assert.equal(claveDe("A (cuando nadie me ve...)"), "a");
    assert.equal(claveDe("B (y quisiera confesarte que tengo...)"), "b");
    assert.equal(claveDe("C coro (un gozo pegajoso...)"), "c");
    assert.equal(claveDe("D rap (señor, tu amor me lleva a la cima...)"), "d");
    assert.equal(claveDe("Coda (llama de fuego...)"), "coda");
  });

  test("con el instrumento pegado", () => {
    assert.equal(claveDe("Intro sinte guitar"), "intro");
    assert.equal(claveDe("Intro champeta guitarra sintetizador"), "intro");
    assert.equal(claveDe("A guitar - caja (libre, tú me hicistes libre...)"), "a");
  });

  test("🔴 separada por algo que no es un espacio", () => {
    // `B - champeta (cristo rompe...)` existe tal cual. Si se cortara solo por
    // espacios daría `b` igual, pero `b-champeta` —sin espacios— daría `otras`
    // y esa sección se quedaría gris sin que nadie entendiera por qué.
    assert.equal(claveDe("B - champeta (cristo rompe...)"), "b");
    assert.equal(claveDe("b-champeta"), "b");
    assert.equal(claveDe("A(mi jesús...)"), "a");
  });

  test("mayúsculas y espacios de sobra dan igual", () => {
    assert.equal(claveDe("INTRO"), "intro");
    assert.equal(claveDe("  Intro  "), "intro");
    assert.equal(claveDe("FINAL (amén...)"), "final");
  });
});

describe("lo que no tiene nombre y lo que no se reconoce", () => {
  test("sin etiqueta", () => {
    // `[]` sale 129 veces: es la sección más común de todas.
    assert.equal(claveDe(""), "sinNombre");
    assert.equal(claveDe("   "), "sinNombre");
    assert.equal(claveDe(undefined), "sinNombre");
    assert.equal(claveDe(null), "sinNombre");
  });

  test("🔴 las cuatro rarezas de producción caen en «otras» y NO revientan", () => {
    // Una aparición cada una. Lo desconocido no se pinta; lo que no puede
    // pasar es que rompa la página de quien abra esa canción.
    for (const rara of ["Bombo", "Pitos", "Banda regae", "Cosa (mi refugio y mi paz...)"]) {
      assert.equal(claveDe(rara), "otras");
    }
  });

  test("🔴 y las que todavía no existen entran solas por su inicial", () => {
    // El día que Isaac escriba esto, tiene que funcionar sin tocar el código.
    assert.equal(claveDe("Puente 2"), "puente");
    assert.equal(claveDe("Intro 3"), "intro");
    assert.equal(claveDe("Coro (algo nuevo...)"), "coro");
    assert.equal(claveDe("G (una sección más allá de la F...)"), "otras");
  });
});

describe("apagado es apagado", () => {
  test("sin paleta no se pinta nada", () => {
    assert.equal(colorDeEtiqueta("Intro", null), undefined);
    assert.equal(colorDeEtiqueta("Intro", undefined), undefined);
    assert.equal(colorDeEtiqueta("Intro", ""), undefined);
    assert.equal(paletaPorId(null), null);
  });

  test("🔴 una paleta que ya no existe tampoco pinta, no falla", () => {
    // Pasa de verdad: el músico guardó «suave2» en su tablet y un día esa
    // paleta se quita. Tiene que ver la página de siempre, no un error.
    assert.equal(colorDeEtiqueta("Intro", "una-que-borramos"), undefined);
    assert.equal(paletaPorId("una-que-borramos"), null);
  });
});

describe("las paletas están completas y se ven en los dos modos", () => {
  const CLAVES = ["intro", "a", "b", "c", "d", "e", "f", "coro", "puente", "coda", "final", "sinNombre", "otras"];

  test("cada paleta tiene su color para TODAS las claves", () => {
    for (const paleta of PALETAS) {
      for (const clave of CLAVES) {
        assert.equal(typeof paleta.colores[clave], "string", `${paleta.id} no tiene ${clave}`);
        assert.ok(paleta.colores[clave].length > 0, `${paleta.id}.${clave} está vacío`);
      }
    }
  });

  test("🔴 ningún color se queda sin su tono para el modo oscuro", () => {
    // Un verde que se lee sobre blanco desaparece sobre gris oscuro. Media
    // iglesia toca con la tablet en oscuro.
    for (const paleta of PALETAS) {
      for (const clave of CLAVES) {
        assert.match(paleta.colores[clave], /dark:/, `${paleta.id}.${clave} no tiene tono oscuro`);
      }
    }
  });

  test("🔴 las clases están escritas ENTERAS, no armadas a cachos", () => {
    // Tailwind lee el código como texto: una clase compuesta en tiempo de
    // ejecución no llega al CSS y el color no sale, sin ningún error.
    for (const paleta of PALETAS) {
      for (const clave of CLAVES) {
        assert.match(
          paleta.colores[clave],
          /^text-[a-z]+-\d{3} dark:text-[a-z]+-\d{3}$/,
          `${paleta.id}.${clave} no es una clase entera`
        );
      }
    }
  });

  test("los identificadores no se repiten", () => {
    const ids = PALETAS.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test("lo que Carlos pidió por su nombre: intro verde y parte A roja", () => {
    const suaves = paletaPorId("suave");
    assert.match(suaves.colores.intro, /emerald/);
    assert.match(suaves.colores.a, /red/);
  });

  test("🔴 «sin nombre» y «otras» se quedan del color de siempre", () => {
    // Si se pintaran, la sección más común de todas (129 veces) cambiaría de
    // color para todo el mundo, y eso no es lo que se pidió.
    for (const paleta of PALETAS) {
      assert.equal(paleta.colores.sinNombre, paleta.colores.otras);
      assert.match(paleta.colores.sinNombre, /slate/);
    }
  });
});
