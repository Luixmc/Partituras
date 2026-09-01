// ─────────────────────────────────────────────────────────────
// Recorrer TODAS las pantallas y comprobar que responden.
//
// 🔴 POR QUÉ EXISTE: es lo que cazó que **Next 16 dejaba la aplicación rota
// con el build en verde** (2026-08-22). Las páginas sin parámetro respondían
// bien y **todas las que llevan `[id]` o `[token]` daban 404** — ninguna
// canción, ningún culto, ningún enlace compartido. Compilaba limpio.
//
// Hasta hoy esto se hacía a mano cada vez. Ahora es un comando.
//
// ⚠️ NO va en `npm test` ni en el CI, y no es pereza: para entrar a las
// pantallas protegidas hace falta **una sesión de verdad**, y meter unas
// credenciales en el CI de un repositorio PÚBLICO no se hace. Esto se ejecuta
// a mano, contra el servidor de casa, antes de publicar algo gordo.
//
// Uso:
//   1. npm run build && npm start          (o npm run dev)
//   2. COOKIE_FILE=<ruta a la cookie> node pruebas/pantallas.mjs
//
// La cookie se saca como explica §2.3 del CLAUDE.md.
// ─────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3000";
const COOKIE = process.env.COOKIE_FILE
  ? readFileSync(process.env.COOKIE_FILE, "utf8").trim()
  : null;

// 🔴 A partir de cuántos segundos una pantalla se considera LENTA.
//
// Esto se añadió el 2026-08-29, después de que la página estuviera inservible
// con todas las comprobaciones en verde. El middleware tardaba **13 segundos**
// con sesión y aun así respondía 200: yo miré el código de respuesta, no el
// reloj, y di el cambio por bueno. Vercel corta a los 25 s, así que aquello
// era un 504 esperando a pasar.
//
// **Un 200 no dice nada si tarda trece segundos.**
const LENTO = 5;

/** Una petición, devolviendo el código, el cuerpo y lo que tardó. */
async function pedir(ruta, conSesion) {
  const cabeceras = { "Cache-Control": "no-cache" };
  if (conSesion && COOKIE) cabeceras.Cookie = COOKIE;
  const t0 = Date.now();
  const r = await fetch(BASE + ruta, { headers: cabeceras, redirect: "manual" });
  const texto = r.status < 400 ? await r.text() : "";
  return { codigo: r.status, texto, segundos: (Date.now() - t0) / 1000 };
}

/** Busca en la base los identificadores reales que hacen falta. */
async function identificadores() {
  const env = Object.fromEntries(
    readFileSync(new URL("../.env.local", import.meta.url), "utf8")
      .split(/\r?\n/).filter((l) => l.includes("="))
      .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
  );
  const cab = {
    apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    Authorization: "Bearer " + env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const uno = async (tabla, campos) =>
    (await (await fetch(`${url}/rest/v1/${tabla}?select=${campos}&limit=1`, { headers: cab })).json())[0];

  const cancion = await uno("sheets", "id");
  const culto = await uno("services", "id,public_token");

  // 🔴 Para las rutas `/s/<token>` hace falta un culto CON EL ENLACE PUBLICO
  // ACTIVADO, y no vale el primero que salga: el 2026-08-29 aparecio uno nuevo
  // sin enlace publico, el script lo cogio por ser el primero, y las tres rutas
  // compartidas dieron 404 — un fallo de la PRUEBA, no de la pagina. Ese 404
  // es justo lo que debe pasar cuando el enlace esta apagado.
  const publico = await uno("services", "public_token&is_public=eq.true");

  return {
    cancion: cancion?.id,
    culto: culto?.id,
    token: publico?.public_token ?? culto?.public_token,
  };
}

const { cancion, culto, token } = await identificadores();
if (!cancion || !culto) {
  console.error("  No se pudieron leer identificadores de la base. ¿Está el .env.local?");
  process.exit(1);
}

// ── Lo que se comprueba ──
// `sesion`: si hace falta cookie · `espera`: código esperado · `debe`: texto
// que TIENE que estar (comprobar el 200 no basta: una página puede responder
// bien y venir vacía, que es como se rompió el catálogo 3 minutos en T-07).
const PANTALLAS = [
  // Públicas, sin cuenta
  ["/login",                              false, 200, "Iniciar sesión"],
  ["/novedades",                          false, 200, "Qué cambió en Partituras"],
  ["/manifest.json",                      false, 200, "Partituras"],
  ["/sw.js",                              false, 200, "partituras-"],
  [`/s/${token}`,                         false, 200, null],
  [`/s/${token}/present`,                 false, 200, null],
  [`/s/${token}/imprimir`,                false, 200, null],

  // Protegidas SIN sesión: tienen que rebotar
  ["/catalog",                            false, 307, null],
  ["/services",                           false, 307, null],
  ["/letras",                             false, 307, null],
  ["/admin",                              false, 307, null],
  ["/sheets/new",                         false, 307, null],
  [`/catalog/${cancion}`,                 false, 307, null],
  [`/services/${culto}`,                  false, 307, null],

  // Con sesión
  ["/catalog",                            true,  200, "canciones"],
  ["/services",                           true,  200, "Cultos"],
  ["/letras",                             true,  200, null],
  ["/admin",                              true,  200, null],
  ["/sheets/new",                         true,  200, null],
  ["/services/new",                       true,  200, null],
  [`/catalog/${cancion}`,                 true,  200, null],
  [`/catalog/${cancion}/present`,         true,  200, null],
  [`/catalog/${cancion}?ver=letra`,       true,  200, null],
  [`/services/${culto}`,                  true,  200, null],
  [`/services/${culto}/present`,          true,  200, null],
  [`/imprimir/culto/${culto}`,            true,  200, null],
];

console.log("");
console.log(`  Recorriendo ${PANTALLAS.length} pantallas en ${BASE}`);
if (!COOKIE) console.log("  ⚠️ Sin COOKIE_FILE: las de sesión se SALTAN\n");
else console.log("");

let bien = 0, mal = 0, saltadas = 0, peor = 0;
for (const [ruta, sesion, espera, debe] of PANTALLAS) {
  if (sesion && !COOKIE) { saltadas++; continue; }
  const corta = ruta.length > 46 ? ruta.slice(0, 44) + "…" : ruta;
  let codigo, texto, segundos;
  try {
    ({ codigo, texto, segundos } = await pedir(ruta, sesion));
  } catch (e) {
    console.log(`  ✖ ${corta.padEnd(46)} ${sesion ? "con sesión" : "sin cuenta"}  no responde`);
    mal++;
    continue;
  }
  const problemas = [];
  if (codigo !== espera) problemas.push(`esperaba ${espera}, dio ${codigo}`);
  if (debe && codigo === 200 && !texto.includes(debe)) problemas.push(`falta «${debe}»`);
  if (segundos > LENTO) problemas.push(`LENTA: ${segundos.toFixed(1)} s`);
  if (problemas.length) {
    console.log(`  ✖ ${corta.padEnd(46)} ${sesion ? "con sesión" : "sin cuenta"}  ${problemas.join(" · ")}`);
    mal++;
  } else {
    bien++;
  }
  if (segundos > peor) peor = segundos;
}

console.log("");
console.log(`  ${bien} bien · ${mal} mal · la más lenta: ${peor.toFixed(1)} s` + (saltadas ? ` · ${saltadas} saltadas (sin sesión)` : ""));
process.exit(mal ? 1 : 0);
