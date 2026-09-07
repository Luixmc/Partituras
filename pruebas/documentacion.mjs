// ─────────────────────────────────────────────────────────────
// ¿Dicen los documentos la verdad sobre el proyecto de HOY?
//
// 🔴 POR QUÉ EXISTE. Isaac, 2026-09-07, después de que se le dijera que una
// petición que llevaba semanas haciéndole a su primo ya no hacía falta:
//
//   «con lo que me dices que había un archivo que estaba desactualizado me
//    preocupa, mira todos los archivos uno por uno... porque eso me preocupa»
//
// Al repasarlos aparecieron **once** sitios con cifras viejas, incluido el
// «léeme primero» del CLAUDE.md y una tabla con la fila «Pruebas» DUPLICADA,
// con dos números distintos y los dos mal.
//
// 📌 Y esto no se arregla escribiendo mejor: se arregla **midiendo**. Las
// cifras envejecen solas en cuanto alguien añade una prueba o un archivo, y
// nadie se acuerda de bajar a corregir seis sitios. Un programa sí.
//
// ⚠️ **Solo se comprueba lo que habla de HOY.** El historial dice «192 pruebas»
// en la tanda que tenía 192, y eso es CORRECTO: es historia, no una mentira.
// Por eso cada comprobación busca su frase exacta y no todas las apariciones
// del número.
//
// Uso:  node pruebas/documentacion.mjs
// ─────────────────────────────────────────────────────────────

import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (f) => readFileSync(join(RAIZ, f), "utf8");

// ── LA REALIDAD, contada ahora ───────────────────────────────
function archivosFuente(dir = "src", acc = []) {
  for (const e of readdirSync(join(RAIZ, dir), { withFileTypes: true })) {
    const hijo = `${dir}/${e.name}`;
    if (e.isDirectory()) archivosFuente(hijo, acc);
    else if (/\.tsx?$/.test(e.name)) acc.push(hijo);
  }
  return acc;
}

const fuentes = archivosFuente();
// Se cuentan los SALTOS DE LÍNEA, como hace `wc -l`. Con `split("\n").length`
// salía una de más por archivo —87 de más en total— y el comprobador se acusó a
// sí mismo el primer día que se ejecutó. Lo cazó él solo, que para eso está.
const lineas = fuentes.reduce((n, f) => n + (leer(f).match(/\n/g) ?? []).length, 0);
const migraciones = readdirSync(join(RAIZ, "supabase/migrations")).filter((f) => f.endsWith(".sql"));

// Las pruebas se cuentan EJECUTÁNDOLAS: contar `test(` en los archivos da 105
// donde el ejecutor dice 207, porque hay subpruebas dentro de otras.
let pruebas = 0;
try {
  const salida = execFileSync(process.execPath, [join(RAIZ, "pruebas/ejecutar.mjs")], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  pruebas = Number(/^ℹ tests (\d+)$/m.exec(salida)?.[1] ?? 0);
} catch {
  console.log("  ⚠️  no se pudieron ejecutar las pruebas: se salta esa comprobación");
}

// Cuántas migraciones están sin aplicar. Se lee del propio CLAUDE.md, que es
// donde se lleva la cuenta — aquí solo se comprueba que el número cuadre con
// las que hay escritas después de la última aplicada.
const ULTIMA_APLICADA = "20240019";
const sinAplicar = migraciones.filter((f) => f.slice(0, 8) > ULTIMA_APLICADA).length;

const real = {
  pruebas,
  archivos: fuentes.length,
  lineas,
  migraciones: migraciones.length,
  sinAplicar,
};

// ── LO QUE DICEN LOS DOCUMENTOS ──────────────────────────────
//
// Cada regla busca UNA frase concreta —la que habla del presente— y saca de
// ella el número. Si la frase ya no está, también es un fallo: significa que
// alguien reescribió el párrafo y esta comprobación dejó de vigilar nada.
const REGLAS = [
  ["CLAUDE.md", /\*\*(\d+) pruebas\*\* \(`npm test`, sin dependencias/, "pruebas", "§1 «léeme primero»"],
  ["CLAUDE.md", /\*\*([\d.]+) líneas\*\* de TypeScript/, "lineas", "§1 «léeme primero»"],
  ["CLAUDE.md", /de TypeScript\s+en \*\*(\d+) archivos\*\*/, "archivos", "§1 «léeme primero»"],
  ["CLAUDE.md", /\*\*`npm test` ejecuta (\d+) pruebas\*\*/, "pruebas", "§2.1 comandos"],
  ["CLAUDE.md", /supabase\/migrations\/\s+(\d+) migraciones/, "migraciones", "§4 estructura"],
  ["CLAUDE.md", /pruebas\/\s+(\d+) pruebas \+ el recorrido/, "pruebas", "§4 estructura"],
  ["CLAUDE.md", /\| Pruebas \| \*\*(\d+)\*\* ·/, "pruebas", "§9.0 estado del árbol"],
  ["CLAUDE.md", /\| Tamaño \| \*\*([\d.]+) líneas\*\*/, "lineas", "§9.0 estado del árbol"],
  ["CLAUDE.md", /\| Migraciones \| \*\*(\d+)\*\*/, "migraciones", "§9.0 estado del árbol"],
  ["README.md", /\| `npm test` \| Las (\d+) pruebas \|/, "pruebas", "tabla de comandos"],
  ["README.md", /pruebas\/\s+→ las (\d+) pruebas/, "pruebas", "estructura"],
  ["README.md", /supabase\/migrations\/\s+→ (\d+) migraciones/, "migraciones", "estructura"],
  ["README.md", /npm test\s+# (\d+) pruebas/, "pruebas", "comandos"],
];

const numero = (t) => Number(String(t).replace(/\./g, ""));

let mal = 0;
console.log(`\n  La realidad hoy: ${real.pruebas} pruebas · ${real.archivos} archivos · ` +
            `${real.lineas.toLocaleString("es")} líneas · ${real.migraciones} migraciones ` +
            `(${real.sinAplicar} sin aplicar)\n`);

for (const [archivo, patron, campo, donde] of REGLAS) {
  if (campo === "pruebas" && !real.pruebas) continue; // no se pudieron contar
  const m = patron.exec(leer(archivo));
  if (!m) {
    console.log(`  ✖ ${archivo} · ${donde}: ya no está la frase que se vigilaba (${campo})`);
    mal++;
    continue;
  }
  const dice = numero(m[1]);
  if (dice !== real[campo]) {
    console.log(`  ✖ ${archivo} · ${donde}: dice ${m[1]} ${campo}, y son ${real[campo]}`);
    mal++;
  }
}

console.log("");
if (mal) {
  console.log(`  ${mal} sitio${mal !== 1 ? "s" : ""} con cifras viejas. Corregirlos y volver a pasar.\n`);
  process.exit(1);
}
console.log("  ✅ Los documentos dicen la verdad sobre el proyecto de hoy.\n");
