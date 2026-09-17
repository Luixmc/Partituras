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

const { claveDe, bandaDeEtiqueta, paletaPorId, PALETAS } = await cargar("coloresSeccion");

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
    assert.equal(bandaDeEtiqueta("Intro", null), undefined);
    assert.equal(bandaDeEtiqueta("Intro", undefined), undefined);
    assert.equal(bandaDeEtiqueta("Intro", ""), undefined);
    assert.equal(paletaPorId(null), null);
  });

  test("🔴 una paleta que ya no existe tampoco pinta, no falla", () => {
    // Pasa de verdad: el músico guardó «suave2» en su tablet y un día esa
    // paleta se quita. Tiene que ver la página de siempre, no un error.
    assert.equal(bandaDeEtiqueta("Intro", "una-que-borramos"), undefined);
    assert.equal(paletaPorId("una-que-borramos"), null);
  });

  test("🔴 una sección que la paleta no pinta devuelve undefined, NUNCA cadena vacía", () => {
    // Las dos cosas son «no pintar» vistas desde fuera, pero una cadena vacía
    // obligaría a comprobarlo dos veces en cada sitio que la use.
    // (Desde O-85, la que NO pinta lo que no tiene categoría es «extremos».)
    assert.equal(bandaDeEtiqueta("", "extremos"), undefined);
    assert.equal(bandaDeEtiqueta("Bombo", "extremos"), undefined);
    assert.equal(bandaDeEtiqueta("A (a tus pies...)", "extremos"), undefined);
  });

  test("🔴 O-85 · pero en las paletas de color, lo sin categorizar SÍ pinta", () => {
    for (const id of ["suave", "fuerte"]) {
      assert.ok(bandaDeEtiqueta("", id), `${id}: sección sin etiqueta sin banda`);
      assert.ok(bandaDeEtiqueta("Bombo", id), `${id}: sección rara sin banda`);
    }
  });
});

describe("las bandas están completas y se ven en los dos modos (O-84)", () => {
  const CLAVES = ["intro", "a", "b", "c", "d", "e", "f", "coro", "puente", "coda", "final", "sinNombre", "otras"];
  const PINTADAS = (paleta) => CLAVES.filter((c) => paleta.colores[c] !== null);

  test("cada paleta responde a TODAS las claves, con una clase o con null", () => {
    for (const paleta of PALETAS) {
      for (const clave of CLAVES) {
        const v = paleta.colores[clave];
        assert.ok(v === null || (typeof v === "string" && v.length > 0), `${paleta.id}.${clave} no vale`);
      }
    }
  });

  test("🔴 lo que se pinta es el FONDO de la banda, no la letra", () => {
    // O-84: Isaac lo corrigió mirando la app. Si alguien vuelve a poner aquí
    // un `text-`, la letra se pintaría y la banda no, que es lo que él descartó.
    for (const paleta of PALETAS) {
      for (const clave of PINTADAS(paleta)) {
        assert.match(paleta.colores[clave], /^bg-/, `${paleta.id}.${clave} no pinta fondo`);
        assert.doesNotMatch(paleta.colores[clave], /text-/, `${paleta.id}.${clave} pinta letra`);
      }
    }
  });

  test("🔴 ninguna banda se queda sin su tono para el modo oscuro", () => {
    // Un fondo claro en modo oscuro es una pared blanca con letra clara encima.
    for (const paleta of PALETAS) {
      for (const clave of PINTADAS(paleta)) {
        assert.match(paleta.colores[clave], /dark:bg-/, `${paleta.id}.${clave} no tiene tono oscuro`);
      }
    }
  });

  test("🔴 y el tono oscuro es HUNDIDO, no el mismo claro repetido", () => {
    // 100/300 en claro, 600/700/900 en oscuro. Repetir el claro dejaría la
    // banda blanca sobre la página negra.
    //
    // 📌 El mínimo del oscuro es 700 para los COLORES y 600 para la banda
    // neutra de lo sin categorizar (O-85), y no es una excepción de
    // conveniencia: un color saturado a 600 ya aclara demasiado para llevar
    // letra clara encima, mientras que la pizarra a 600 sigue bastante más
    // oscura que el fondo de la cabecera —que es de lo que tiene que
    // despegarse— y con la letra clara contrasta de sobra.
    for (const paleta of PALETAS) {
      for (const clave of PINTADAS(paleta)) {
        const [claro, oscuro] = paleta.colores[clave].split(" ");
        const nClaro = Number(claro.match(/-(\d{3})$/)[1]);
        const nOscuro = Number(oscuro.match(/-(\d{3})$/)[1]);
        const neutra = /slate/.test(claro);
        assert.ok(nClaro <= 300, `${paleta.id}.${clave}: el claro es ${nClaro}`);
        assert.ok(nOscuro >= (neutra ? 600 : 700), `${paleta.id}.${clave}: el oscuro es ${nOscuro}`);
        assert.ok(nOscuro > nClaro, `${paleta.id}.${clave}: el oscuro no está hundido`);
      }
    }
  });

  test("🔴 las clases están escritas ENTERAS, no armadas a cachos", () => {
    // Tailwind lee el código como texto: una clase compuesta en tiempo de
    // ejecución no llega al CSS y el color no sale, sin ningún error (L-289).
    for (const paleta of PALETAS) {
      for (const clave of PINTADAS(paleta)) {
        assert.match(
          paleta.colores[clave],
          /^bg-[a-z]+-\d{3} dark:bg-[a-z]+-\d{3}$/,
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

  test("🔴 O-85 · «sin nombre» y «otras» SÍ se pintan, y con la MISMA banda neutra", () => {
    // Isaac, 2026-09-17: una banda gris entre bandas de color rompe justo lo
    // que el color viene a hacer, que es separar una sección de la siguiente.
    // Y comparten banda porque significan lo mismo: esto no está categorizado.
    for (const id of ["suave", "fuerte"]) {
      const paleta = paletaPorId(id);
      assert.ok(paleta.colores.sinNombre, `${id}: «sin nombre» sin pintar`);
      assert.equal(paleta.colores.sinNombre, paleta.colores.otras, id);
      assert.match(paleta.colores.sinNombre, /slate/, `${id}: debería ser neutra`);
    }
  });

  test("🔴 y esa banda neutra NO es el fondo de siempre: se tiene que VER pintada", () => {
    // Si fuera casi el color de la cabecera, «pintada» y «sin pintar» se verían
    // igual y no habríamos arreglado nada. El fondo normal es slate-50/800.
    const suave = paletaPorId("suave");
    assert.doesNotMatch(suave.colores.sinNombre, /slate-50|slate-800/);
  });

  test("🔴 pero en «solo el principio y el final» se queda sin pintar, a propósito", () => {
    // Ahí la gracia es que destaquen solo la intro, la coda y el final; pintar
    // las demás la convertiría en «Fuertes».
    const extremos = paletaPorId("extremos");
    assert.equal(extremos.colores.sinNombre, null);
    assert.equal(extremos.colores.otras, null);
  });

  test("🔴 «solo el principio y el final» deja las letras sin pintar", () => {
    const extremos = paletaPorId("extremos");
    for (const letra of ["a", "b", "c", "d", "e", "f"]) {
      assert.equal(extremos.colores[letra], null, letra);
    }
    assert.ok(extremos.colores.intro && extremos.colores.final);
  });
});
