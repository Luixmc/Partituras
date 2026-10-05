// ─────────────────────────────────────────────────────────────
// La revisión de duraciones: qué compases están mal medidos.
// La usan `npm run duraciones` (scripts/duraciones.mjs) y su prueba.
//
// 🔴 POR QUÉ SE LEE EL CÓDIGO DE LA PÁGINA en vez de reescribir el lector
// aquí: la pregunta es «¿lo que escribió Isaac lo entiende LA PÁGINA como él
// cree?». Un lector propio contestaría otra cosa. Por eso se transpilan al vuelo
// el `parseMeasures` de `TablaturePreview.tsx`, `duracionDe` de `lib/figuras.ts`
// y `parseSections` de `lib/sections.ts`, los archivos de verdad.
//
// Y si alguien mueve las marcas con que se recorta `parseMeasures`, esto PARA
// con un mensaje claro — y la prueba falla en el CI — en vez de revisar con un
// lector a medias y decir que todo está bien.
//
// Nació el 2026-10-05 en el scratchpad, para la lista que Isaac corrigió a
// mano (`docs/REVISION-DURACIONES.md`), y se trajo aquí cuando pidió poder
// repetirla.
// ─────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(RAIZ, "package.json"));
const ts = require("typescript");

/** Transpila un trozo de TypeScript y lo ejecuta como CommonJS. */
function cargarTs(codigo, parametros = {}) {
  const js = ts.transpileModule(codigo, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  new Function("exports", ...Object.keys(parametros), js)(exports, ...Object.values(parametros));
  return exports;
}

const leer = (ruta) => readFileSync(join(RAIZ, ruta), "utf8");

const { duracionDe, DURACION } = cargarTs(leer("src/lib/figuras.ts"));
const { parseSections } = cargarTs(leer("src/lib/sections.ts"));

const tsx = leer("src/components/sheets/TablaturePreview.tsx");
const INICIO = "const SP = ";
const FINAL = "return measures;\n}";
const ini = tsx.indexOf(INICIO);
const fin = tsx.indexOf(FINAL, ini);
if (ini < 0 || fin < 0) {
  throw new Error(
    `No se encontró parseMeasures en TablaturePreview.tsx (se busca desde «${INICIO}» hasta «return measures; }»). ` +
      "Si se movió o se renombró, hay que ajustar las marcas en scripts/duraciones-revisar.mjs"
  );
}
const { parseMeasures } = cargarTs(tsx.slice(ini, fin + FINAL.length), { duracionDe, DURACION });

// Las 15 figuras: redonda, blanca, negra, corchea y semicorchea, sin puntillo,
// con uno y con dos.
const FIGURAS = [4, 6, 7, 2, 3, 3.5, 1, 1.5, 1.75, 0.5, 0.75, 0.875, 0.25, 0.375, 0.4375];
const esFigura = (d) => FIGURAS.some((v) => Math.abs(v - d) < 1e-4);
const tiemposDe = (compas) => {
  const [n, d] = compas.split("/").map(Number);
  return (n * 4) / d;
};
const redondo = (x) => +x.toFixed(4);

/** Los cuatro tipos de hallazgo, con el nombre que se le enseña a Isaac. */
export const TIPOS = {
  1: "duración que no es ninguna figura",
  2: "duración que la página no lee",
  3: "compás medido que no suma",
  4: "lo medido ya se pasa del compás",
};

/**
 * Revisa el texto de una canción (o de una versión) y devuelve lo que no cuadra.
 * `compasBase` es el de la ficha (`time_signature`); un `6/8` escrito dentro
 * del texto lo cambia desde ahí, también para las secciones siguientes —como
 * en la página—.
 */
export function revisar(contenido, compasBase) {
  const hallazgos = [];
  let compas = compasBase || "4/4";
  for (const seccion of parseSections(contenido ?? "")) {
    const sec = seccion.title ?? "(sin sección)";
    const compases = parseMeasures(seccion.content);
    compases.forEach((m, i) => {
      for (const n of m.notes) if (n.timeSig) compas = n.timeSig;
      const suenan = m.notes.filter((n) => n.root || n.rest || n.repeat || n.soloFigura);
      const crudo = m.notes.map((n) => n.raw).join(" ");
      const anota = (tipo, que) => hallazgos.push({ tipo, sec, n: i + 1, compas, crudo, que });

      // ① Una duración que no es ninguna de las 15 figuras: la página dibuja
      //    la más parecida sin avisar.
      for (const n of suenan) {
        if (n.duration != null && !esFigura(n.duration)) {
          anota(1, `«${n.raw}» = ${n.duration} tiempos: no es ninguna figura`);
        }
      }

      // ② Una duración escrita de forma que la página no la lee (`D:1,5`,
      //    `F;2`): queda pegada al acorde o suelta como texto. El `F;2` se
      //    escapaba al principio, porque la página bota el `;` y deja un «2».
      for (const n of m.notes) {
        if (n.raw.startsWith("<") || n.raw.startsWith("(")) continue;
        const pegada = n.root && /[:;,]|\.\d/.test(n.suffix) && !/^\/?[#b]?\d/.test(n.suffix.replace(/^[^:;,]*/, ""));
        const suelta = !n.root && n.text && /[:;,]\s*\d|^:|^\d+([.,]\d+)?\.{0,2}$/.test(n.text);
        if (pegada || suelta) anota(2, `«${n.raw}»: la página no lo lee como duración`);
      }

      const medidos = suenan.filter((n) => n.duration != null);
      const suma = medidos.reduce((a, n) => a + n.duration, 0);
      const debe = tiemposDe(compas);

      // ④ Compás a medio medir donde lo medido ya se pasa: los acordes sin
      //    duración no tendrían sitio.
      if (medidos.length && medidos.length < suenan.length && suma > debe + 1e-4) {
        anota(4, `lo que lleva duración ya suma ${redondo(suma)} de ${debe} tiempos, y hay acordes sin duración`);
      }

      // ③ Compás medido entero cuya suma no da el compás. Puede ser bueno
      //    (anacrusa, final, casilla): se da la pista y decide Isaac.
      if (suenan.length && medidos.length === suenan.length && Math.abs(suma - debe) > 1e-4) {
        const pista = [
          i === 0 ? "primer compás de la sección (¿anacrusa?)" : "",
          m.boxLabel != null ? `dentro de la casilla ${m.boxLabel}` : "",
          i === compases.length - 1 ? "último compás de la sección" : "",
        ].filter(Boolean).join(" · ");
        anota(3, `suma ${redondo(suma)} de ${debe} tiempos${pista ? " — " + pista : ""}`);
      }
    });
  }
  return hallazgos;
}

/** Cuántos compases tienen acordes, y cuántos los llevan medidos enteros. */
export function contarCompases(contenido) {
  let conAcordes = 0;
  let medidos = 0;
  for (const seccion of parseSections(contenido ?? "")) {
    for (const m of parseMeasures(seccion.content)) {
      const suenan = m.notes.filter((n) => n.root || n.rest || n.repeat || n.soloFigura);
      if (!suenan.length) continue;
      conAcordes++;
      if (suenan.every((n) => n.duration != null)) medidos++;
    }
  }
  return { conAcordes, medidos };
}
