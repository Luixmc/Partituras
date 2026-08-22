// ─────────────────────────────────────────────────────────────
// `npm test`: compila lo que hace falta y lanza las pruebas.
//
// 🔴 POR QUÉ ESTE ARCHIVO EXISTE, en vez de un `node --test pruebas/` en el
// `package.json`: **la forma de decirle a Node qué probar cambia con la
// versión**, y aquí conviven dos.
//
//   · `node --test pruebas/`            → va en Node 20; en Node 24 se queja
//                                          («Cannot find module …/pruebas»)
//   · `node --test "pruebas/*.test.mjs"` → los globs llegaron en Node 21, así
//                                          que en el CI, que usa **Node 20**,
//                                          no valdría
//
// Lo que funciona en las dos es **pasar los archivos uno a uno**. Se listan
// aquí leyendo la carpeta, así que añadir una prueba no obliga a tocar nada.
//
// No es un capricho: el equipo de Isaac tiene Node 24 y el CI Node 20. Una
// prueba que solo corre en uno de los dos no es una red de seguridad.
// ─────────────────────────────────────────────────────────────

import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));

// 1 · Compilar `src/lib` (el CI usa Node 20, que no ejecuta TypeScript).
const preparar = spawnSync(process.execPath, [join(AQUI, "preparar.mjs")], {
  stdio: "inherit",
});
if (preparar.status !== 0) process.exit(preparar.status ?? 1);

// 2 · Lanzar todas las pruebas de la carpeta.
const archivos = readdirSync(AQUI)
  .filter((f) => f.endsWith(".test.mjs"))
  .sort()
  .map((f) => join(AQUI, f));

if (!archivos.length) {
  console.error("  no hay ningun archivo *.test.mjs en pruebas/");
  process.exit(1);
}

const pruebas = spawnSync(process.execPath, ["--test", ...archivos], {
  stdio: "inherit",
});
process.exit(pruebas.status ?? 1);
