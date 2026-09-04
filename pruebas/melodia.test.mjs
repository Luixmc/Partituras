// ─────────────────────────────────────────────────────────────
// La melodía: que lo que se dibuja es lo que se guarda, y al revés (O-57).
//
// 🔴 POR QUÉ IMPORTA QUE ESTO ESTÉ PROBADO: si al guardar se pierde una
// alteración o una duración, **no salta ningún error**. La melodía se dibuja
// igual de bonita con una nota equivocada, y quien lo descubre es el
// trompetista tocándola en el culto. Es el mismo caso que las figuras y que la
// transposición: un domingo que suena raro no deja ni una línea en la consola.
//
// La prueba que de verdad protege es la de IDA Y VUELTA: se guarda texto, así
// que abrir una melodía ya escrita tiene que devolver exactamente lo mismo.
// ─────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const {
  pasoAbc,
  elementoAbc,
  melodiaAbc,
  abcCompleto,
  parsearMelodia,
  puedeVerMelodia,
  ROLES_MELODIA,
  DURACIONES,
} = await cargar("melodia");

const nota = (paso, duracion = 2, alteracion = null, ligada = false) => ({
  tipo: "nota",
  paso,
  alteracion,
  duracion,
  ligada,
});

test("la melodía está OCULTA hasta que Isaac la abra", () => {
  // D-22 aplicado igual que a las letras: un solo interruptor.
  assert.deepEqual(ROLES_MELODIA, ["admin"]);
  assert.equal(puedeVerMelodia("admin"), true);
  assert.equal(puedeVerMelodia("musician"), false);
  assert.equal(puedeVerMelodia("viewer"), false);
  assert.equal(puedeVerMelodia(null), false);
});

test("las alturas: el do central es «C», el de arriba «c»", () => {
  assert.equal(pasoAbc(0), "C");
  assert.equal(pasoAbc(4), "G");
  assert.equal(pasoAbc(6), "B");
  assert.equal(pasoAbc(7), "c"); // una octava arriba
  assert.equal(pasoAbc(14), "c'"); // dos
  assert.equal(pasoAbc(-1), "B,"); // una abajo
  assert.equal(pasoAbc(-7), "C,");
  assert.equal(pasoAbc(-8), "B,,");
});

test("las duraciones, con L:1/8", () => {
  assert.equal(elementoAbc(nota(0, 1)), "C"); // corchea: sin número
  assert.equal(elementoAbc(nota(0, 2)), "C2"); // negra
  assert.equal(elementoAbc(nota(0, 3)), "C3"); // negra con puntillo
  assert.equal(elementoAbc(nota(0, 4)), "C4"); // blanca
  assert.equal(elementoAbc(nota(0, 6)), "C6"); // blanca con puntillo
  assert.equal(elementoAbc(nota(0, 8)), "C8"); // redonda
  assert.equal(elementoAbc(nota(0, 0.5)), "C/2"); // semicorchea
  assert.equal(elementoAbc(nota(0, 1.5)), "C3/2"); // corchea con puntillo
});

test("alteraciones, silencios, ligaduras y barras", () => {
  assert.equal(elementoAbc(nota(0, 2, "sostenido")), "^C2");
  assert.equal(elementoAbc(nota(0, 2, "bemol")), "_C2");
  assert.equal(elementoAbc(nota(0, 2, "becuadro")), "=C2");
  assert.equal(elementoAbc(nota(0, 2, null, true)), "C2-");
  assert.equal(elementoAbc({ tipo: "silencio", duracion: 4 }), "z4");
  assert.equal(elementoAbc({ tipo: "barra" }), "|");
});

test("🔴 IDA Y VUELTA: lo que se guarda vuelve igual", () => {
  // Esta es la prueba que de verdad protege: se guarda TEXTO, así que abrir una
  // melodía ya escrita tiene que devolver exactamente los mismos elementos.
  const melodia = [
    nota(4, 2),
    nota(4, 2),
    nota(5, 2, "sostenido"),
    { tipo: "barra" },
    nota(7, 4, null, true),
    nota(7, 1),
    { tipo: "silencio", duracion: 2 },
    nota(-1, 0.5, "bemol"),
    nota(14, 1.5, "becuadro"),
    { tipo: "barra" },
  ];
  assert.deepEqual(parsearMelodia(melodiaAbc(melodia)), melodia);
});

test("la ida y vuelta aguanta TODAS las combinaciones", () => {
  // 8 duraciones x 4 alteraciones x 2 (ligada o no) x alturas de 3 octavas.
  for (const { valor } of DURACIONES) {
    for (const alt of [null, "sostenido", "bemol", "becuadro"]) {
      for (const ligada of [false, true]) {
        for (const paso of [-7, -1, 0, 4, 7, 13]) {
          const uno = [nota(paso, valor, alt, ligada)];
          assert.deepEqual(
            parsearMelodia(melodiaAbc(uno)),
            uno,
            `${paso} · ${valor} · ${alt} · ${ligada}`
          );
        }
      }
    }
  }
});

test("la cabecera lleva el compás y el tono", () => {
  const abc = abcCompleto({ elementos: [nota(4, 2)], compas: "3/4", tono: "D" });
  assert.match(abc, /^X:1$/m);
  assert.match(abc, /^M:3\/4$/m);
  assert.match(abc, /^L:1\/8$/m);
  assert.match(abc, /^K:D$/m);
  assert.match(abc, /^G2$/m);
});

test("una melodía vacía no revienta: se dibuja un silencio", () => {
  // Sin esto, `abcjs` recibe un cuerpo vacío y no dibuja ni el pentagrama.
  assert.match(abcCompleto({ elementos: [] }), /z8/);
  assert.deepEqual(parsearMelodia(""), []);
});

test("al leer, la CABECERA no se confunde con notas", () => {
  // `K:C` acaba en C, y `M:4/4` tiene números: si se leyeran como notas, cada
  // melodía guardada saldría con basura al principio.
  const abc = abcCompleto({ elementos: [nota(4, 2), nota(6, 2)], titulo: "Prueba" });
  assert.deepEqual(parsearMelodia(abc), [nota(4, 2), nota(6, 2)]);
});

test("lo que no se entiende se SALTA, no se inventa", () => {
  // Una nota inventada se toca; un hueco se ve. Ante algo raro, mejor el hueco.
  const leido = parsearMelodia("G2 (3ABc {g} G2");
  assert.ok(leido.every((e) => e.tipo !== "nota" || Number.isFinite(e.paso)));
  assert.ok(leido.length >= 2, "al menos las dos notas normales se leen");
});

// ═══════════════════════════════════════════════════════════
// LA MELODÍA POR SECCIONES (O-57 R.2)
//
// 🔴 Por qué estas también hacen falta: el andamio y el reparto por secciones
// deciden **dónde acaba una sección y empieza otra**. Si eso se descuadrara, la
// melodía de la Intro le saldría al trompetista bajo la etiqueta del Coro — y
// eso **no da ningún error**: se dibuja igual de bien, en el sitio equivocado.
// ═══════════════════════════════════════════════════════════

const { tramosDe, melodiaDeTramos, andamioDeMelodia, tieneMelodia } = await cargar("melodia");

const ACORDES = [
  "[Intro]",
  "C | G",
  "",
  "[A (Cada vez...)]",
  "Amaj7:2 E/G#:2 | F#m7:2 E7:2",
  "",
  "[Coro]",
  "D | A",
].join("\n");

test("el andamio trae TODAS las secciones de los acordes, vacías", () => {
  const andamio = andamioDeMelodia(ACORDES);
  const tramos = tramosDe(andamio);
  assert.deepEqual(
    tramos.map((t) => t.titulo),
    ["Intro", "A (Cada vez...)", "Coro"]
  );
  // Vacías: la melodía la pone Isaac, no una regla que yo me invente.
  assert.ok(tramos.every((t) => t.abc === ""));
});

test("el andamio NO decide cuáles llevan melodía", () => {
  // Isaac ya zanjó esto con las letras: «a veces se repiten estrofas, a veces
  // son instrumentales, a veces solos de guitarra, no es algo fijo».
  // La Intro es instrumental y aun así se ofrece: la que se quede vacía es que
  // no la toca la trompeta.
  assert.ok(andamioDeMelodia(ACORDES).includes("[Intro]"));
});

test("una canción sin secciones no da andamio, y no revienta", () => {
  assert.equal(andamioDeMelodia("C | G | Am | F"), "");
  assert.equal(andamioDeMelodia(""), "");
});

test("🔴 IDA Y VUELTA por secciones: los tramos vuelven igual", () => {
  const tramos = [
    { titulo: "Intro", abc: "G2 G2 A2 G2" },
    { titulo: "A (Cada vez...)", abc: "c2 B4 z2 |" },
    { titulo: "Coro", abc: "" },
  ];
  assert.deepEqual(tramosDe(melodiaDeTramos(tramos)), tramos);
});

test("cada tramo se queda con SU melodía, no con la del vecino", () => {
  // Este es el fallo que no daría ningún error: la Intro dibujada bajo el Coro.
  const t = tramosDe(melodiaDeTramos([
    { titulo: "Intro", abc: "C2" },
    { titulo: "Coro", abc: "G2" },
  ]));
  assert.equal(t.find((x) => x.titulo === "Intro").abc, "C2");
  assert.equal(t.find((x) => x.titulo === "Coro").abc, "G2");
});

test("una melodía en varios renglones significa lo mismo que en uno", () => {
  // Es lo que permite reusar `parseSections`: en ABC el espacio ES el separador.
  const enUno = tramosDe("[A]\nC2 D2 E2 F2");
  const enTres = tramosDe("[A]\nC2 D2\nE2 F2");
  assert.equal(enUno[0].abc, enTres[0].abc);
});

test("vacía es vacía: ni tramos fantasma ni «tiene melodía»", () => {
  // `parseSections("")` devuelve una sección con un espacio (contrato real,
  // O-44). Sin filtrarlo se pintaría un pentagrama de la nada.
  assert.deepEqual(tramosDe(""), []);
  assert.deepEqual(tramosDe("   "), []);
  assert.equal(tieneMelodia(""), false);
  assert.equal(tieneMelodia(null), false);
  assert.equal(tieneMelodia("[A]\n"), false, "una seccion sin notas no es melodia");
  assert.equal(tieneMelodia("[A]\nC2"), true);
});
