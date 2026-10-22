// ─────────────────────────────────────────────────────────────
// Ver la página sin internet (O-96): lo que se guarda y cuándo.
//
// 🔴 POR QUÉ IMPORTA QUE ESTO ESTÉ PROBADO: si `cancionesEn` deja de ver un
// enlace, esa canción no se guarda y el domingo, sin señal, sale «no está
// guardada» — sin que ningún error lo avise antes. Y si `hayQueRefrescar`
// se equivoca hacia el «sí», cada músico baja ~1 MB de datos en CADA
// apertura sin enterarse (O-97: se guarda solo y sin aviso); hacia el «no»,
// ve canciones viejas sin saberlo.
// ─────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./preparar.mjs";

const {
  PREFIJO_CACHE,
  nombreCache,
  cancionesEn,
  cultosEn,
  paginasAGuardar,
  estaticosEn,
  leerGuardado,
  hayQueRefrescar,
  REFRESCO_MS,
  esCopia,
  COPIA_VIEJA_MS,
  fechaCorta,
} = await cargar("sinInternet");

const A = "5c44c6f4-5ed1-43d6-b9a8-deda69085ce1";
const B = "8708d5b4-aa23-4c70-9934-19eb2b541faf";

test("el nombre de la copia lleva el despliegue y el prefijo propio (L-373)", () => {
  assert.equal(nombreCache("868f8ad"), "partituras-868f8ad");
  assert.ok(nombreCache("x").startsWith(PREFIJO_CACHE));
});

test("canciones del catálogo: de los enlaces y del texto de React, sin repetir", () => {
  // Así llegan de verdad: en el `href` y otra vez en el texto escapado para React,
  // a veces con el filtro detrás.
  const html =
    `<a href="/catalog/${A}">x</a><a href="/catalog/${B}?categories=1">y</a>` +
    `self.__next_f.push([1,"{\\"href\\":\\"/catalog/${A}\\"}"])`;
  assert.deepEqual(cancionesEn(html).sort(), [A, B].sort());
});

test("no confunde /catalog con otras rutas ni con ids a medias", () => {
  const html = `<a href="/catalog">c</a><a href="/sheets/new">n</a><a href="/catalog/abc">roto</a>`;
  assert.deepEqual(cancionesEn(html), []);
});

test("cultos: los ids de /services, y /services/new NO", () => {
  const html = `<a href="/services/new">n</a><a href="/services/${B}">c</a><a href="/services/${B}\\">c</a>`;
  assert.deepEqual(cultosEn(html), [B]);
});

test("qué se guarda: catálogo, cultos, cada canción y cada culto CON su presentación", () => {
  assert.deepEqual(paginasAGuardar([A], [B]), [
    "/catalog",
    "/services",
    `/catalog/${A}`,
    `/services/${B}`,
    `/services/${B}/present`,
  ]);
});

test("📌 la pantalla completa de cada canción NO se guarda (233 KB × 98 ≈ 23 MB)", () => {
  const paginas = paginasAGuardar([A], []);
  assert.ok(!paginas.some((p) => p.endsWith(`/catalog/${A}/present`)));
});

test("los archivos del programa: de las etiquetas y del texto escapado, sin la barra del escape", () => {
  const html =
    `<script src="/_next/static/immutable/chunks/05amhdh3pdrhv.js" async></script>` +
    `<link rel="stylesheet" href="/_next/static/immutable/chunks/02s4nvhl1v2fo.css"/>` +
    `"[\\"/_next/static/immutable/chunks/0as93-hrkv5ee.js\\"]"` +
    `<script src="/_next/static/immutable/chunks/05amhdh3pdrhv.js"></script>`;
  assert.deepEqual(estaticosEn(html).sort(), [
    "/_next/static/immutable/chunks/02s4nvhl1v2fo.css",
    "/_next/static/immutable/chunks/05amhdh3pdrhv.js",
    "/_next/static/immutable/chunks/0as93-hrkv5ee.js",
  ]);
});

const BIEN = { fecha: "2026-10-22T16:40:00.000Z", build: "868f8ad", usuario: "u1", canciones: 98, cultos: 3, kb: 9800 };

test("lo guardado se lee, y lo roto o ajeno no rompe nada", () => {
  assert.deepEqual(leerGuardado(JSON.stringify(BIEN)), BIEN);
  assert.equal(leerGuardado(null), null);
  assert.equal(leerGuardado(""), null);
  assert.equal(leerGuardado("{no es json"), null);
  assert.equal(leerGuardado(JSON.stringify({ fecha: "ayer", build: "x", usuario: "u" })), null);
  assert.equal(leerGuardado(JSON.stringify({ build: "x" })), null);
});

test("🔴 O-97 · se guarda SOLO: sin copia de esta cuenta, despliegue nuevo o más de un día", () => {
  const ahora = Date.parse(BIEN.fecha) + 60 * 60 * 1000; // una hora después
  // Isaac, 2026-10-22: «quiero que lo guarde apenas uno abra la pagina». Ya no hay botón.
  assert.equal(hayQueRefrescar(null, "868f8ad", "u1", ahora), true, "primera vez en este aparato: se guarda");
  assert.equal(hayQueRefrescar(BIEN, "868f8ad", "u2", ahora), true, "otra cuenta en la misma tablet: la suya");
  assert.equal(hayQueRefrescar(BIEN, "868f8ad", "u1", ahora), false, "mismo despliegue, de hace una hora");
  assert.equal(hayQueRefrescar(BIEN, "aaaaaaa", "u1", ahora), true, "despliegue nuevo: lo viejo se borra con él");
  assert.equal(hayQueRefrescar(BIEN, "868f8ad", "u1", Date.parse(BIEN.fecha) + REFRESCO_MS + 1), true, "más de un día");
});

test("¿es una copia?: más de 5 minutos entre la hora del servidor y la del aparato", () => {
  const generado = "2026-10-22T16:40:00.000Z";
  const t = Date.parse(generado);
  assert.equal(esCopia(generado, t + 2000), false, "recién llegada");
  assert.equal(esCopia(generado, t + COPIA_VIEJA_MS - 1), false, "un reloj atrasado unos minutos no avisa");
  assert.equal(esCopia(generado, t + COPIA_VIEJA_MS + 1), true);
  assert.equal(esCopia(generado, t - 60 * 60 * 1000), false, "reloj del aparato atrasado: no es copia");
  assert.equal(esCopia("basura", t), false);
});

test("la fecha de la copia se dice como la diría una persona", () => {
  const ahora = new Date(2026, 9, 22, 11, 40).getTime();
  assert.match(fechaCorta(new Date(2026, 9, 22, 8, 15).toISOString(), ahora), /^hoy, 8:15/);
  assert.match(fechaCorta(new Date(2026, 9, 21, 20, 15).toISOString(), ahora), /^ayer, 8:15/);
  const vieja = fechaCorta(new Date(2026, 9, 18, 19, 40).toISOString(), ahora);
  assert.match(vieja, /18/);
  assert.match(vieja, /oct/);
  // «dom 18 de oct, 7:40 p. m.»: el día sin los puntos de «dom.» y «oct.» (la hora sí los lleva).
  assert.doesNotMatch(vieja.split(",")[0], /\./, "sin los puntos de las abreviaturas");
  assert.equal(fechaCorta("basura", ahora), "");
});
