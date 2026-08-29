// ─────────────────────────────────────────────────────────────
// Genera la cookie de sesión de la cuenta de prueba.
//
// Sin esto, comprobar cualquier pantalla protegida —el catálogo, los cultos,
// las letras, el panel— es imposible: `curl` a pelo siempre devuelve el login.
// Y hasta hoy la cookie se sacaba a mano cada vez, así que **se perdía cada
// vez que caducaba o que alguien cerraba la sesión** — que es justo lo que
// pasó al probar P-01.
//
// 🔴 LAS CREDENCIALES SALEN DE `.env.local`, NUNCA DEL CÓDIGO.
// Ese archivo está en `.gitignore` desde el primer día (comprobado con
// `git check-ignore`), y **este repositorio es PÚBLICO**. Si algún día alguien
// mueve la contraseña a un archivo del repositorio, queda publicada en GitHub
// para cualquiera.
//
// ⚠️ Y la regla de uso, que no la impone el código sino Isaac (D-14):
// **con esta cuenta SOLO SE MIRA.** No se tocan datos sin permiso expreso suyo.
//
// Uso:
//   node pruebas/sesion.mjs                 → la escribe en .sesion (ignorado)
//   node pruebas/sesion.mjs --mostrar       → la imprime, para usarla al vuelo
// ─────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from "node:fs";

const RAIZ = new URL("..", import.meta.url);
const env = Object.fromEntries(
  readFileSync(new URL(".env.local", RAIZ), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const { NEXT_PUBLIC_SUPABASE_URL: URL_BASE, NEXT_PUBLIC_SUPABASE_ANON_KEY: ANON,
        PRUEBA_EMAIL, PRUEBA_PASSWORD } = env;

if (!PRUEBA_EMAIL || !PRUEBA_PASSWORD) {
  console.error("  Faltan PRUEBA_EMAIL / PRUEBA_PASSWORD en .env.local");
  console.error("  (se ponen ahí a propósito: el repositorio es público)");
  process.exit(1);
}

const r = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: ANON, "Content-Type": "application/json" },
  body: JSON.stringify({ email: PRUEBA_EMAIL, password: PRUEBA_PASSWORD }),
});
const sesion = await r.json();

if (!r.ok || !sesion.access_token) {
  console.error(`  No se pudo entrar (${r.status}): ${sesion.error_description ?? sesion.msg ?? "?"}`);
  // El caso más probable, y conviene decirlo en vez de dejar un error seco:
  if (r.status === 400) console.error("  ¿La cuenta está desactivada, o cambió la contraseña?");
  process.exit(1);
}

// `@supabase/ssr` guarda la sesión en una cookie `sb-<ref>-auth-token` con el
// JSON en base64 y el prefijo `base64-`. Si pasa de ~3180 caracteres la parte
// en `.0`, `.1`… — por eso se trocea igual que hace la librería.
const ref = new URL(URL_BASE).hostname.split(".")[0];
const valor = "base64-" + Buffer.from(JSON.stringify(sesion)).toString("base64");
const TROZO = 3180;

const cookies = [];
if (valor.length <= TROZO) {
  cookies.push(`sb-${ref}-auth-token=${valor}`);
} else {
  for (let i = 0, n = 0; i < valor.length; i += TROZO, n++) {
    cookies.push(`sb-${ref}-auth-token.${n}=${valor.slice(i, i + TROZO)}`);
  }
}
const cookie = cookies.join("; ");

if (process.argv.includes("--mostrar")) {
  console.log(cookie);
} else {
  writeFileSync(new URL(".sesion", RAIZ), cookie, "utf8");
  console.log(`  sesión de ${PRUEBA_EMAIL} guardada en .sesion`);
  console.log(`  úsala así:  COOKIE_FILE=.sesion node pruebas/pantallas.mjs`);
}
