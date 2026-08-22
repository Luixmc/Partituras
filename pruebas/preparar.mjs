// ─────────────────────────────────────────────────────────────
// Compila el código de `src/lib` para que las pruebas lo ejecuten.
//
// 🔴 POR QUÉ HACE FALTA ESTE PASO, para que nadie lo quite creyéndolo de más:
// el CI corre con **Node 20**, que NO sabe ejecutar TypeScript. Así que las
// pruebas no pueden importar los `.ts` directamente: hay que compilarlos
// antes, con el mismo TypeScript del proyecto.
//
// Y se compila **el archivo de verdad**, no una copia pegada aquí. Es la regla
// que ya seguían los arneses del `scratchpad` y la que hace que una prueba
// sirva de algo: si probara una copia, seguiría en verde el día que el archivo
// original cambie.
//
// Lo único que se toca al copiar son las rutas `@/...`, que las entiende el
// empaquetador de Next pero no `tsc` a secas.
// ─────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..");
export const SALIDA = join(RAIZ, ".pruebas-tmp");

/** Los módulos que se prueban. Añadir uno es escribir su nombre aquí. */
const MODULOS = [
  "music",
  "acordes",
  "guitarra",
  "cultos",
  "sections",
  "chordInput",
  "letras",
];

function preparar() {
  rmSync(SALIDA, { recursive: true, force: true });
  mkdirSync(join(SALIDA, "src"), { recursive: true });

  // Los tipos del dominio van tal cual: así `cultos.ts` y `letras.ts` compilan
  // con los tipos REALES y no con un remedo que podría desviarse.
  writeFileSync(
    join(SALIDA, "src", "types.ts"),
    readFileSync(join(RAIZ, "src", "types", "index.ts"), "utf8"),
    "utf8"
  );

  const entradas = [join(SALIDA, "src", "types.ts")];
  for (const m of MODULOS) {
    const texto = readFileSync(join(RAIZ, "src", "lib", `${m}.ts`), "utf8")
      .split('from "@/lib/').join('from "./')
      .split('from "@/types"').join('from "./types"');
    const destino = join(SALIDA, "src", `${m}.ts`);
    writeFileSync(destino, texto, "utf8");
    entradas.push(destino);
  }

  execFileSync(
    "npx",
    // A CommonJS y no a modulos ES: `tsc` emite `from "./acordes"` SIN la
    // extension .js, y Node en modo ES la exige. Con CommonJS y `require` se
    // resuelve sola. Es lo mismo que hacian los arneses del scratchpad.
    ["tsc", ...entradas, "--outDir", join(SALIDA, "js"),
     "--target", "es2020", "--module", "commonjs", "--skipLibCheck"],
    { cwd: RAIZ, shell: true, stdio: "inherit" }
  );

  // Se deja dicho que esta carpeta es CommonJS: `tsc` emite imports sin la
  // extension .js y Node en modo ES los rechaza.
  writeFileSync(join(SALIDA, "js", "package.json"), '{ "type": "commonjs" }\n', "utf8");
}

const require = createRequire(import.meta.url);

/** Carga un módulo ya compilado. Lo usan todas las pruebas. */
export async function cargar(nombre) {
  const ruta = join(SALIDA, "js", `${nombre}.js`);
  if (!existsSync(ruta)) {
    throw new Error(`Falta ${nombre}.js — ejecuta primero 'node pruebas/preparar.mjs'`);
  }
  return require(ruta);
}

// Ejecutado directamente (`node pruebas/preparar.mjs`) compila; importado, solo
// ofrece `cargar`.
if (process.argv[1] && process.argv[1].endsWith("preparar.mjs")) {
  preparar();
  console.log(`  compilados ${MODULOS.length} modulos de src/lib en .pruebas-tmp/`);
}
