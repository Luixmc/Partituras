// ─────────────────────────────────────────────────────────────
// El reproductor de la melodía: las cuentas (O-75, fase 2).
//
// 🔴 POR QUÉ IMPORTA: si la nota resaltada va un tiempo por detrás de lo que
// suena, o la presentación suena en el tono del instrumento en vez del del
// culto, **no salta ningún error**. Suena, se ve, y está mal. El trompetista
// cree que el que lee mal es él.
// ─────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const {
  lineaDeTiempo,
  duracionTotal,
  momentoEn,
  msPorCorchea,
  tempoValido,
  pulsoDe,
  vozMetronomo,
  abcParaSonar,
  semitonosQueSuenan,
  corcheasPorCompas,
  corcheasDeEntrada,
  volumenValido,
  multiplicadorVolumen,
  TEMPO_POR_DEFECTO,
} = await cargar("reproduccion");
const { parsearMelodia } = await cargar("melodia");

test("la línea de tiempo: cada nota empieza donde acaba la anterior, y las barras no ocupan", () => {
  const linea = lineaDeTiempo([parsearMelodia("C2 D2 | E4")]);
  assert.deepEqual(
    linea.map((m) => [m.orden, m.inicio, m.duracion]),
    [
      [0, 0, 2],
      [1, 2, 2],
      [2, 4, 4],
    ]
  );
  assert.equal(duracionTotal(linea), 8);
});

test("el ORDEN vuelve a cero en cada sección, y el tiempo sigue corriendo", () => {
  // Cada sección es un pentagrama aparte: la nota N se busca dentro del suyo.
  const linea = lineaDeTiempo([parsearMelodia("C2 D2"), parsearMelodia("E2 z2")]);
  assert.deepEqual(
    linea.map((m) => [m.tramo, m.orden, m.inicio]),
    [
      [0, 0, 0],
      [0, 1, 2],
      [1, 0, 4],
      [1, 1, 6],
    ]
  );
});

test("una sección VACÍA no suena, pero no le roba el número a las demás", () => {
  // La de en medio es la que la trompeta no toca: la tercera sigue siendo la 2.
  const linea = lineaDeTiempo([parsearMelodia("C2"), [], parsearMelodia("D2")]);
  assert.deepEqual(
    linea.map((m) => [m.tramo, m.inicio]),
    [
      [0, 0],
      [2, 2],
    ]
  );
});

test("los silencios y las ligaduras cuentan como las dibuja abcjs", () => {
  // Una ligada son DOS cabezas en el pentagrama: se resalta cada una.
  const linea = lineaDeTiempo([parsearMelodia("C2- C2 z4")]);
  assert.equal(linea.length, 3);
  assert.deepEqual(linea.map((m) => m.inicio), [0, 2, 4]);
});

test("qué suena en cada instante, incluidos los bordes", () => {
  const linea = lineaDeTiempo([parsearMelodia("C2 D/2 E4")]);
  assert.equal(momentoEn(linea, 0).orden, 0);
  assert.equal(momentoEn(linea, 1.99).orden, 0);
  assert.equal(momentoEn(linea, 2).orden, 1, "justo al acabar una, ya es la siguiente");
  assert.equal(momentoEn(linea, 2.4).orden, 1);
  assert.equal(momentoEn(linea, 2.5).orden, 2);
  assert.equal(momentoEn(linea, 6.5), null, "después del final, nada");
  assert.equal(momentoEn(linea, -1), null);
  assert.equal(momentoEn([], 0), null);
});

test("el tempo: a 60 la corchea dura medio segundo, y lo que no se puede tocar se acota", () => {
  assert.equal(msPorCorchea(60), 500);
  assert.equal(msPorCorchea(120), 250);
  assert.equal(tempoValido(null), TEMPO_POR_DEFECTO);
  assert.equal(tempoValido(0), TEMPO_POR_DEFECTO);
  assert.equal(tempoValido(5), 40);
  assert.equal(tempoValido(999), 200);
  assert.equal(tempoValido(92.6), 93);
});

test("el pulso de cada compás: 4 negras en 4/4, 2 blancas en 2/2, 2 negras con puntillo en 6/8", () => {
  assert.deepEqual(pulsoDe("4/4"), { golpes: 4, corcheas: 2 });
  assert.deepEqual(pulsoDe("3/4"), { golpes: 3, corcheas: 2 });
  assert.deepEqual(pulsoDe("2/2"), { golpes: 2, corcheas: 4 });
  // 🔴 6/8 se cuenta en dos, no en seis: así lo lleva quien toca.
  assert.deepEqual(pulsoDe("6/8"), { golpes: 2, corcheas: 3 });
  assert.deepEqual(pulsoDe("3/8"), { golpes: 3, corcheas: 1 });
  assert.deepEqual(pulsoDe(null), { golpes: 4, corcheas: 2 });
  assert.deepEqual(pulsoDe("basura"), { golpes: 4, corcheas: 2 });
  assert.deepEqual(pulsoDe("4/3"), { golpes: 4, corcheas: 2 }, "un denominador imposible, como 4/4");
});

test("el metrónomo: un golpe por pulso, el primero de cada compás distinto, y cubre TODA la melodía", () => {
  // La Intro de Agnus Dei dura 10 corcheas en 4/4: hacen falta 5 golpes.
  assert.equal(vozMetronomo("4/4", 10), "!mp! =e2 =f2 =f2 =f2 | =e2");
  assert.equal(vozMetronomo("6/8", 12), "!mp! =e3 =f3 | =e3 =f3 |");
  assert.equal(vozMetronomo("3/8", 3), "!mp! =e =f =f |");
  assert.equal(vozMetronomo("2/2", 1), "!mp! =e4", "aunque sea una sola nota, suena un golpe");
});

test("🔴 el metrónomo NO depende de que haya barras escritas (el de abcjs sí, y se quedaba mudo)", () => {
  const abc = abcParaSonar({ tramos: [parsearMelodia("^F2 G2 A2 B2 A2")], tono: "D", metronomo: true });
  const lineas = abc.split("\n");
  assert.ok(lineas.includes("V:1"));
  assert.ok(lineas.includes("V:2 clef=perc"), "percusión: sin armadura y sin transportar");
  assert.equal(lineas[lineas.length - 1], "!mp! =e2 =f2 =f2 =f2 | =e2");
  // 🔴 Con becuadro: en Re, un `f` a secas sonaba fa# = OTRO instrumento de percusión (medido).
  assert.ok(!/(^|\s)[ef]\d?(\s|$)/.test(lineas[lineas.length - 1].replace("!mp!", "")), "ningún golpe sin becuadro");
  // Sin metrónomo, una sola voz, como siempre.
  assert.ok(!abcParaSonar({ tramos: [parsearMelodia("C2")] }).includes("V:"));
});
test("el ABC que suena: las secciones seguidas, con UNA barra entre ellas", () => {
  const abc = abcParaSonar({
    tramos: [parsearMelodia("^F2 G2"), [], parsearMelodia("F2 A2 |")],
    compas: "3/4",
    tono: "D",
    tempo: 90,
  });
  const lineas = abc.split("\n");
  assert.ok(lineas.includes("M:3/4"));
  assert.ok(lineas.includes("K:D"));
  assert.ok(lineas.includes("Q:1/4=90"));
  // La barra hace que el ^F de la primera no se arrastre a la tercera — en el
  // editor cada sección empieza limpia, y al sonar tiene que pasar lo mismo.
  assert.equal(lineas[lineas.length - 1], "^F2 G2 | F2 A2 |");
});

test("si una sección ya acaba en barra, no se pone otra (sería un compás vacío)", () => {
  const abc = abcParaSonar({ tramos: [parsearMelodia("C2 D2 |"), parsearMelodia("E2")] });
  assert.equal(abc.split("\n").pop(), "C2 D2 | E2");
  assert.ok(!/\|\s*\|/.test(abc));
});

test("sin nada escrito, el ABC sigue siendo válido", () => {
  assert.equal(abcParaSonar({ tramos: [[], []] }).split("\n").pop(), "z8");
});

test("lo que SUENA en la presentación: el tono del culto y los ± del músico, nunca el instrumento", () => {
  assert.equal(semitonosQueSuenan(0, 0), 0);
  assert.equal(semitonosQueSuenan(2, 0), 2);
  assert.equal(semitonosQueSuenan(3, -1), 2);
  // Bajar un semitono no se convierte en subir once.
  assert.equal(semitonosQueSuenan(11, 0), -1);
  assert.equal(semitonosQueSuenan(0, -1), -1);
  assert.equal(semitonosQueSuenan(7, 0), -5);
  assert.equal(semitonosQueSuenan(6, 0), 6);
});

// ── FASE 3 · la cuenta de entrada y el volumen ──

test("un compás dura 8 corcheas en 4/4 y 2/2, 6 en 3/4 y 6/8, 3 en 3/8", () => {
  assert.equal(corcheasPorCompas("4/4"), 8);
  assert.equal(corcheasPorCompas("2/2"), 8);
  assert.equal(corcheasPorCompas("3/4"), 6);
  assert.equal(corcheasPorCompas("6/8"), 6);
  assert.equal(corcheasPorCompas("3/8"), 3);
  assert.equal(corcheasDeEntrada("4/4", true), 8);
  assert.equal(corcheasDeEntrada("4/4", false), 0, "sin cuenta, la melodía empieza en cero");
});

test("la CUENTA: un compás de golpes antes, y la melodía calla ese compás", () => {
  const abc = abcParaSonar({ tramos: [parsearMelodia("^F2 G2 A2 B2 A2")], tono: "D", entrada: true });
  const lineas = abc.split("\n");
  // La melodía: un compás de silencio y su barra, y después lo escrito.
  assert.equal(lineas[lineas.indexOf("V:1") + 1], "z8 | ^F2 G2 A2 B2 A2");
  // 🔴 Con el metrónomo APAGADO, la cuenta suena igual, y después se calla.
  assert.equal(lineas[lineas.length - 1], "!mp! =e2 =f2 =f2 =f2 |");
});

test("la cuenta con el metrónomo encendido: los golpes siguen sin cortarse", () => {
  const abc = abcParaSonar({ tramos: [parsearMelodia("C2 D2")], entrada: true, metronomo: true });
  assert.equal(abc.split("\n").pop(), "!mp! =e2 =f2 =f2 =f2 | =e2 =f2");
});

test("la cuenta en 6/8 se cuenta en dos, como el metrónomo", () => {
  const abc = abcParaSonar({ tramos: [parsearMelodia("C3 D3")], compas: "6/8", entrada: true });
  const lineas = abc.split("\n");
  assert.equal(lineas[lineas.indexOf("V:1") + 1], "z6 | C3 D3");
  assert.equal(lineas[lineas.length - 1], "!mp! =e3 =f3 |");
});

test("el volumen: 100 % es como sonaba antes, y no se pasa de ahí ni baja de 10", () => {
  assert.equal(multiplicadorVolumen(100), 3, "el 3,0 que abcjs usa con FluidR3_GM");
  assert.equal(multiplicadorVolumen(50), 1.5);
  assert.equal(volumenValido(null), 100);
  assert.equal(volumenValido(0), 10);
  assert.equal(volumenValido(150), 100, "más arriba satura");
  assert.equal(volumenValido(74), 70, "de 10 en 10");
});