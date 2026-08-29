// ─────────────────────────────────────────────────────────────
// Partir una canción en secciones.
//
// 🔴 Esta función estuvo ESCRITA DOS VECES hasta el 2026-08-28 —P-09—, y eso
// fue lo que dejó la pantalla de crear canción sin secciones (O-44): al no
// haber una función común, esa tercera pantalla no tenía a cuál llamar y
// acabó pintando la canción entera de golpe, con las etiquetas `[Intro]`
// dibujadas dentro de la rejilla como si fueran acordes.
//
// Ahora es una sola, y estas pruebas están para que siga siéndolo: si alguien
// cambia el comportamiento, salta aquí antes de llegar a tres pantallas.
// ─────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const { parseSections } = await cargar("sections");

describe("qué delimita una sección", () => {
  test("solo los corchetes en su propia línea", () => {
    const s = parseSections("[Coro]\nC G Am");
    assert.equal(s.length, 1);
    assert.equal(s[0].title, "Coro");
  });

  test("🔴 «<...>» NO parte sección: es texto centrado de la canción", () => {
    // Es la notación de Isaac para «<Conteo 1, 2, 3, Sube!>». Si partiera
    // sección, esa canción se rompería en pedazos.
    const s = parseSections("[A]\nC <Conteo 1, 2, 3> G");
    assert.equal(s.length, 1);
    assert.ok(s[0].content.includes("<Conteo 1, 2, 3>"));
  });

  test("los corchetes con algo delante o detrás tampoco parten", () => {
    const s = parseSections("[A]\nC [Coro] G");
    assert.equal(s.length, 1, "«[Coro]» en medio de una línea es contenido");
  });

  test("lo que va ANTES de la primera etiqueta es su propia sección, sin título", () => {
    const s = parseSections("C G Am\n[Coro]\nF C");
    assert.equal(s.length, 2);
    assert.equal(s[0].title, undefined);
    assert.equal(s[1].title, "Coro");
  });
});

describe("LA CANCIÓN DE LA CAPTURA DE ISAAC (O-44)", () => {
  // Tal cual la estaba escribiendo el 2026-08-28 en «crear canción», donde
  // todo esto salía en una sola cuadrícula.
  const CONTENIDO = [
    "[Intro Drum (Algo bueno viene....)]",
    "|: 4/4 F | % | % | C :|",
    "",
    "[A Rock]",
    "|: 4/4 Dm | Bb | F | A7 :|",
    "",
    "[B (Lo porvenir...)]",
    "|: 4/4 Dm | Bb | F | C :| C:1 z:3",
    "",
    "[ ]",
    "",
    "[Puente]",
    "",
    "[Final]",
    "Gm^  | Dm^",
  ].join("\n");

  const secciones = parseSections(CONTENIDO);

  test("salen SEIS secciones, no una sola", () => {
    assert.equal(secciones.length, 6);
  });

  test("cada una con su título", () => {
    assert.deepEqual(
      secciones.map((s) => s.title),
      ["Intro Drum (Algo bueno viene....)", "A Rock", "B (Lo porvenir...)", " ", "Puente", "Final"]
    );
  });

  test("los acordes van dentro de su sección, no sueltos", () => {
    assert.ok(secciones[0].content.includes("F"));
    assert.ok(secciones[1].content.includes("A7"));
    assert.ok(secciones[5].content.includes("Gm^"));
  });

  test("una sección sin nada debajo se queda vacía, y eso está bien", () => {
    // «[Puente]» sin acordes: Isaac las deja así a propósito mientras arma la
    // canción. No puede desaparecer ni arrastrar lo de la siguiente.
    assert.equal(secciones[4].title, "Puente");
    assert.equal(secciones[4].content.trim(), "");
  });
});

describe("no se rompe con lo raro", () => {
  test("texto vacío devuelve UNA sección vacía, no una lista vacía", () => {
    // 🔴 Esto lo cazó esta misma prueba al escribirla, y se deja documentado
    // en vez de «arreglado»: la función la usan SIETE pantallas y su contrato
    // lleva meses así. Quien la pinte tiene que filtrar lo que no tiene ni
    // título ni contenido — es lo que hace la pantalla de crear canción, o
    // saldría una cuadrícula vacía nada más abrirla.
    const s = parseSections("");
    assert.equal(s.length, 1);
    assert.equal(s[0].title, undefined);
    assert.equal(s[0].content.trim(), "");
  });

  test("solo etiquetas, sin contenido", () => {
    const s = parseSections("[A]\n[B]\n[C]");
    assert.equal(s.length, 3);
    assert.ok(s.every((x) => x.content.trim() === ""));
  });

  test("no se pierde ninguna línea por el camino", () => {
    const texto = "C G\n[Coro]\nF C\nAm\n[Final]\nG";
    const juntas = parseSections(texto).map((s) => s.content).join(" ");
    for (const acorde of ["C", "G", "F", "Am"]) {
      assert.ok(juntas.includes(acorde), `falta ${acorde}`);
    }
  });
});
