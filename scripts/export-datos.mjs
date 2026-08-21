// Exporta a JSON todo lo que la gente ha escrito en la aplicación: canciones,
// versiones por tonalidad, categorías y cultos. Es la copia de seguridad de lo
// único que no se puede volver a generar (el código sí está en git).
//
//   npm run export
//
// Lee las claves de .env.local. Con la clave `anon` basta para las canciones
// publicadas; si además hay SUPABASE_SERVICE_ROLE_KEY, se incluyen también las
// que están en BORRADOR, que la clave pública no puede ver por la seguridad de
// filas (RLS). Solo LEE: no escribe nada en la base.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Lee .env.local a mano para no depender de ningún paquete extra. */
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

const env = { ...leerEnv(), ...process.env };
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_BASE || !ANON) {
  console.error("Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local");
  process.exit(1);
}

// ── Con qué permisos se baja ──────────────────────────────────
//
// Hay TRES maneras, de mejor a peor:
//
//  1. `SUPABASE_SERVICE_ROLE_KEY` — la clave maestra. Se ve todo. No la
//     tenemos: es del primo (§12.2 del CLAUDE.md).
//  2. `SUPABASE_ACCESS_TOKEN` — la sesión de un usuario ADMINISTRADOR. Ve lo
//     mismo que ve él en la página, **incluidos los borradores**. Se saca
//     entrando y copiando el `access_token`. Añadido el 2026-08-21, cuando se
//     vio que el respaldo se dejaba fuera 8 canciones.
//  3. Solo la clave pública — se deja fuera lo que esté en borrador.
const TOKEN = env.SUPABASE_ACCESS_TOKEN;
const CLAVE = SERVICE || ANON;
const AUTORIZACION = SERVICE || TOKEN || ANON;
const COMPLETO = Boolean(SERVICE || TOKEN);

// `profiles` se deja fuera a propósito: son datos personales de los usuarios y
// no forman parte del trabajo que hay que proteger.
const TABLAS = [
  "sheets",
  "sheet_keys",
  "sheet_categories",
  "categories",
  "services",
  "service_songs",
  "tags",
  "sheet_tags",
];

async function descargarTabla(tabla) {
  const filas = [];
  const PASO = 1000;
  for (let desde = 0; ; desde += PASO) {
    const res = await fetch(`${URL_BASE}/rest/v1/${tabla}?select=*`, {
      headers: {
        // `apikey` identifica al proyecto; `Authorization` dice QUIÉN pide.
        // Con una sesión de administrador ahí, la base aplica sus permisos.
        apikey: CLAVE,
        Authorization: `Bearer ${AUTORIZACION}`,
        Range: `${desde}-${desde + PASO - 1}`,
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`);
    }
    const lote = await res.json();
    filas.push(...lote);
    if (lote.length < PASO) break;
  }
  return filas;
}

const destino = process.argv[2] || join(RAIZ, "..", "..", "_RESPALDOS");
const fecha = new Date().toISOString().slice(0, 10);

// Si ya hay una copia de hoy NO se pisa: se le añade la hora. Un respaldo que
// sobrescribe al anterior puede destruir justo lo que venía a proteger — pasó
// la primera vez que se ejecutó esto.
//
// 🔴 Y volvió a pasar el 2026-08-21: la hora sola NO basta. Dos ejecuciones en
// el mismo minuto dieron el mismo nombre, y la segunda —incompleta, sin los
// borradores— **pisó a la primera, que sí los traía**. Ahora se busca el
// primer nombre LIBRE, así que ninguna copia puede borrar a otra.
let carpeta = join(destino, `Partituras-datos-${fecha}`);
if (existsSync(carpeta)) {
  const hora = new Date().toTimeString().slice(0, 8).replace(/:/g, "h");
  carpeta = join(destino, `Partituras-datos-${fecha}-${hora}`);
  // Y si aun así coincide, se numera. Nunca se escribe encima de nada.
  let n = 2;
  while (existsSync(carpeta)) carpeta = join(destino, `Partituras-datos-${fecha}-${hora}-${n++}`);
}
mkdirSync(carpeta, { recursive: true });

const COMO = SERVICE ? "TODO (clave maestra)"
  : TOKEN ? "TODO (sesion de administrador)"
  : "solo lo publicado (clave publica)";
console.log("");
console.log("Exportando " + COMO);
console.log("");

const datos = {};
for (const tabla of TABLAS) {
  try {
    const filas = await descargarTabla(tabla);
    datos[tabla] = filas;
    writeFileSync(join(carpeta, `${tabla}.json`), JSON.stringify(filas, null, 2), "utf8");
    console.log(`  OK  ${tabla.padEnd(18)} ${String(filas.length).padStart(5)} filas`);
  } catch (e) {
    datos[tabla] = { error: String(e.message) };
    console.log(`  --  ${tabla.padEnd(18)} FALLO: ${e.message}`);
  }
}

writeFileSync(
  join(carpeta, `TODO-${fecha}.json`),
  JSON.stringify(
    { exportado: new Date().toISOString(), proyecto: URL_BASE, completo: COMPLETO, datos },
    null,
    2
  ),
  "utf8"
);

console.log("\nGuardado en:", carpeta);
if (!COMPLETO) {
  console.log(
    "\nAVISO: sin SUPABASE_SERVICE_ROLE_KEY faltan las canciones en BORRADOR.\n" +
      "Ponla en .env.local y vuelve a ejecutar para una copia completa."
  );
}
