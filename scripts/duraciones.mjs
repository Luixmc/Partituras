// Revisa las duraciones de TODAS las canciones y sus versiones por tonalidad,
// y dice qué compases no cuadran, para que Isaac los corrija en la página.
//
//   npm run duraciones                       ← lee la base, ahora mismo
//   npm run duraciones -- <carpeta-de-copia> ← lee una copia de `npm run export`
//
// Solo LEE: no escribe nada en la base ni deja archivos. Pedido por Isaac el
// 2026-10-05 para poder repetir la revisión después de corregir. Qué se busca y
// por qué, en `scripts/duraciones-revisar.mjs`.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { revisar, contarCompases, TIPOS } from "./duraciones-revisar.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

// ── Lo que Isaac ya miró y dio por bueno ──────────────────────
//
// Un compás que no suma puede estar bien (una anacrusa, un final corto). Lo
// que él confirma va aquí y sale aparte, no como error. Se reconoce por la
// canción, la sección y lo escrito en el compás: **si cambia lo escrito,
// vuelve a salir**, porque lo que él aprobó era aquello.
const ACEPTADOS = [
  {
    titulo: "Dios Ha Sido Fiel",
    sec: "Intro",
    crudo: "C:0.5 B:0.5",
    porque: "es anacrusa (Isaac, 2026-10-05)",
  },
];
const aceptado = (titulo, h) =>
  ACEPTADOS.find((a) => a.titulo === titulo && a.sec === h.sec && a.crudo === h.crudo);

// ── De dónde salen las canciones ─────────────────────────────

/** Lee .env.local a mano, como `scripts/export-datos.mjs`. */
function leerEnv() {
  const ruta = join(RAIZ, ".env.local");
  if (!existsSync(ruta)) return {};
  const env = {};
  for (const linea of readFileSync(ruta, "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

/** Una copia de `npm run export`: cada tabla en su JSON. */
function desdeCopia(carpeta) {
  const tabla = (nombre) => {
    const j = JSON.parse(readFileSync(join(carpeta, `${nombre}.json`), "utf8"));
    return j.rows ?? j;
  };
  return { sheets: tabla("sheets"), keys: tabla("sheet_keys"), origen: `la copia ${carpeta}`, completa: true };
}

/**
 * La base en vivo, con la cuenta de prueba (administradora). Desde la
 * migración 024 sin sesión no se lee nada, y sin ser administradora no se ven
 * los borradores: se pregunta el rol y se avisa, como en `npm run export`.
 */
async function desdeLaBase() {
  const env = { ...leerEnv(), ...process.env };
  const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
  const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!URL_BASE || !ANON || !env.PRUEBA_EMAIL || !env.PRUEBA_PASSWORD) {
    console.error(
      "Faltan datos en .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,\n" +
        "PRUEBA_EMAIL y PRUEBA_PASSWORD. O pásale una copia: npm run duraciones -- <carpeta>"
    );
    process.exit(1);
  }
  const entrar = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email: env.PRUEBA_EMAIL, password: env.PRUEBA_PASSWORD }),
  });
  if (!entrar.ok) {
    console.error(`No se pudo entrar con la cuenta de prueba: HTTP ${entrar.status}`);
    process.exit(1);
  }
  const token = (await entrar.json()).access_token;
  const cabeceras = { apikey: ANON, Authorization: `Bearer ${token}` };

  const leerTabla = async (consulta) => {
    const res = await fetch(`${URL_BASE}/rest/v1/${consulta}`, { headers: cabeceras });
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`);
    return res.json();
  };
  const rol = await fetch(`${URL_BASE}/rest/v1/rpc/get_my_role`, {
    method: "POST",
    headers: { ...cabeceras, "Content-Type": "application/json" },
    body: "{}",
  }).then((r) => (r.ok ? r.json() : "desconocido"), () => "desconocido");

  return {
    sheets: await leerTabla("sheets?select=id,title,content,time_signature,status&order=title"),
    keys: await leerTabla("sheet_keys?select=sheet_id,key_signature,content"),
    origen: "la base, ahora mismo",
    completa: rol === "admin",
    rol,
  };
}

// ── La revisión ──────────────────────────────────────────────

const carpeta = process.argv[2];
if (carpeta && !existsSync(join(carpeta, "sheets.json"))) {
  console.error(`En «${carpeta}» no hay un sheets.json: no parece una copia de npm run export.`);
  process.exit(1);
}
const { sheets, keys, origen, completa, rol } = carpeta ? desdeCopia(carpeta) : await desdeLaBase();

const conAlgo = [];
const yaVistos = [];
let compases = 0;
let medidos = 0;
const repasar = (titulo, extra, contenido, compasBase) => {
  const c = contarCompases(contenido);
  compases += c.conAcordes;
  medidos += c.medidos;
  const hallazgos = [];
  for (const h of revisar(contenido, compasBase)) {
    const a = aceptado(titulo, h);
    if (a) yaVistos.push({ titulo, extra, h, porque: a.porque });
    else hallazgos.push(h);
  }
  if (hallazgos.length) conAlgo.push({ titulo, extra, hallazgos });
};
for (const s of sheets) repasar(s.title, "", s.content, s.time_signature);
for (const k of keys) {
  const s = sheets.find((x) => x.id === k.sheet_id);
  if (s) repasar(s.title, `versión en ${k.key_signature}`, k.content, s.time_signature);
}

// ── Lo que se le enseña ──────────────────────────────────────

const lugar = (h) => `${h.sec}, compás ${h.n} (${h.compas})`;
console.log("");
console.log(`Revisión de duraciones — ${origen}`);
console.log(`${sheets.length} canciones y ${keys.length} versiones · ${compases} compases con acordes, ${medidos} con todas sus duraciones escritas`);
if (!completa) {
  console.log(`⚠️  La cuenta de prueba es «${rol}», no administradora: FALTAN las canciones en borrador.`);
}
console.log("");

if (!conAlgo.length) {
  console.log("✅ Todo cuadra: ningún compás medido que no sume, ni duraciones raras.");
} else {
  for (const { titulo, extra, hallazgos } of conAlgo) {
    console.log(`■ ${titulo}${extra ? ` (${extra})` : ""}`);
    for (const h of hallazgos) {
      console.log(`    ${lugar(h)}:  ${h.crudo}`);
      console.log(`      → ${h.que}`);
    }
    console.log("");
  }
  const total = conAlgo.reduce((a, c) => a + c.hallazgos.length, 0);
  const porTipo = Object.entries(TIPOS)
    .map(([t, nombre]) => [nombre, conAlgo.reduce((a, c) => a + c.hallazgos.filter((h) => h.tipo === +t).length, 0)])
    .filter(([, n]) => n)
    .map(([nombre, n]) => `${n} ${nombre}`)
    .join(" · ");
  console.log(`${total} cosas que mirar en ${conAlgo.length} canciones o versiones: ${porTipo}`);
}

if (yaVistos.length) {
  console.log("");
  console.log("Ya vistas y dadas por buenas (no cuentan como error):");
  for (const { titulo, extra, h, porque } of yaVistos) {
    console.log(`    ${titulo}${extra ? ` (${extra})` : ""} · ${lugar(h)}: ${h.crudo} — ${porque}`);
  }
}
console.log("");
console.log("⚠️  Los compases sin duraciones escritas no se pueden revisar así: ahí solo vale mirarlos con las figuras.");
