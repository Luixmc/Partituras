// ─────────────────────────────────────────────────────────────
// El REPRODUCTOR de la melodía, la parte que se puede probar (O-75, fase 2).
//
// Isaac, 2026-09-10: «que tenga unos botones de reproducir, pausar, metrónomo
// y demás herramientas que tiene por ejemplo la página de flat.io». Y el mismo
// día, con la fase 1 oída: «adelante con la fase 2».
//
// 🔴 POR QUÉ ESTO VIVE EN `lib/`: son las cuentas que pueden estar MAL sin que
// nadie se entere. Si la nota resaltada va un tiempo por detrás de lo que
// suena, el trompetista cree que lee mal; si la presentación suena en el tono
// del instrumento y no en el del culto, suena un tono desplazada. Aquí las
// cubre el CI. Lo que toca el audio (`lib/reproductor.ts`) no se puede probar
// sin navegador.
//
// 📌 LA MELODÍA VA POR SECCIONES, y cada sección se DIBUJA aparte: es lo que
// Isaac aprobó en R.2. Para no cambiarlo, lo que SUENA es un solo ABC con las
// secciones seguidas, y la nota que se resalta se busca por su sección y su
// orden dentro de ella.
// ─────────────────────────────────────────────────────────────

import { melodiaAbc, type Elemento } from "@/lib/melodia";

/**
 * El tempo, en negras por minuto.
 *
 * ⚠️ 80 es solo el valor con el que ARRANCA: la columna `sheets.tempo` existe
 * pero **ninguna de las 85 canciones la tiene** (medido el 2026-09-10). Se cambia
 * con los botones, y si algún día la canción trae tempo, manda ese.
 */
export const TEMPO_POR_DEFECTO = 80;
export const TEMPO_MINIMO = 40;
export const TEMPO_MAXIMO = 200;

/** Un tempo cualquiera, metido en el rango que se puede tocar. */
export function tempoValido(tempo: number | null | undefined): number {
  if (!tempo || !Number.isFinite(tempo)) return TEMPO_POR_DEFECTO;
  return Math.min(TEMPO_MAXIMO, Math.max(TEMPO_MINIMO, Math.round(tempo)));
}

/**
 * Cuánto dura una corchea —la unidad de la melodía, `L:1/8`— a un tempo dado.
 * A 60 negras por minuto la negra dura un segundo y la corchea medio.
 */
export function msPorCorchea(tempo: number): number {
  return 60000 / tempoValido(tempo) / 2;
}

/**
 * Un momento de la melodía: QUÉ se dibuja y CUÁNDO suena.
 *
 * `orden` es la posición de la nota **entre las notas y silencios de su
 * sección** — las barras no cuentan —, que es exactamente como las cuenta
 * `abcjs` al dibujarlas. `inicio` y `duracion` van en corcheas.
 */
export type Momento = { tramo: number; orden: number; inicio: number; duracion: number };

/**
 * La línea de tiempo entera: cada nota y cada silencio, con su momento.
 *
 * 📌 Las secciones vacías no suenan ni ocupan tiempo — son las que la trompeta
 * no toca (lo decidió Isaac con las letras) —, pero **conservan su número**,
 * porque así se llama el pentagrama que hay que resaltar.
 * ⚠️ Una nota LIGADA sigue siendo dos: `abcjs` dibuja dos cabezas, y se resalta
 * cada una cuando le toca.
 */
export function lineaDeTiempo(tramos: Elemento[][]): Momento[] {
  const linea: Momento[] = [];
  let t = 0;
  tramos.forEach((elementos, tramo) => {
    let orden = 0;
    for (const e of elementos) {
      if (e.tipo === "barra") continue;
      linea.push({ tramo, orden, inicio: t, duracion: e.duracion });
      t += e.duracion;
      orden++;
    }
  });
  return linea;
}

/** Cuánto dura todo, en corcheas. */
export function duracionTotal(linea: Momento[]): number {
  const ultimo = linea[linea.length - 1];
  return ultimo ? ultimo.inicio + ultimo.duracion : 0;
}

/**
 * Qué suena en la corchea `t` (puede llevar decimales). `null` antes de
 * empezar o después de acabar.
 */
export function momentoEn(linea: Momento[], t: number): Momento | null {
  // Búsqueda binaria: se llama en cada cuadro de pantalla, y una canción larga
  // tiene cientos de notas.
  let lo = 0;
  let hi = linea.length - 1;
  while (lo <= hi) {
    const mitad = (lo + hi) >> 1;
    const m = linea[mitad];
    if (t < m.inicio) hi = mitad - 1;
    else if (t >= m.inicio + m.duracion) lo = mitad + 1;
    else return m;
  }
  return null;
}

/**
 * Cómo se cuenta un compás: cuántos golpes lleva y cuánto dura cada uno, en
 * corcheas.
 *
 * 📌 En 6/8 el pulso es la negra con puntillo: **dos** golpes, no seis — es
 * como se cuenta un 6/8 tocando. En 2/2, dos blancas. Los compases del
 * repertorio son 2/2, 4/4 y 6/8 (medido el 2026-09-10). Lo que no se entienda,
 * como 4/4.
 */
export function pulsoDe(compas: string | null | undefined): { golpes: number; corcheas: number } {
  const [n, d] = (compas ?? "").split("/").map(Number);
  const valido = Number.isInteger(n) && Number.isInteger(d) && n > 0 && [1, 2, 4, 8, 16].includes(d);
  const num = valido ? n : 4;
  const den = valido ? d : 4;
  if (den === 8 && num > 3 && num % 3 === 0) return { golpes: num / 3, corcheas: 3 };
  return { golpes: num, corcheas: 8 / den };
}

/** Cuánto dura un compás, en corcheas: 8 en 4/4 y 2/2, 6 en 3/4 y 6/8. */
export function corcheasPorCompas(compas: string | null | undefined): number {
  const { golpes, corcheas } = pulsoDe(compas);
  return golpes * corcheas;
}

/**
 * Lo que dura la CUENTA DE ENTRADA, en corcheas (O-75, fase 3): un compás, o
 * nada si está apagada.
 *
 * 📌 Un compás, como flat.io: es lo que cuenta un director —«un, dos, tres,
 * cuatro»— antes de que entre el grupo. Es un valor de arranque, no una regla.
 */
export function corcheasDeEntrada(compas: string | null | undefined, entrada: boolean): number {
  return entrada ? corcheasPorCompas(compas) : 0;
}

/**
 * El VOLUMEN, en tanto por ciento (O-75, fase 3).
 *
 * 📌 **100 % es como sonaba antes de que existiera el botón**: con la colección
 * `FluidR3_GM/`, `abcjs` multiplica por **3,0** (`create-synth.js:52-53`).
 * Por encima satura, así que el tope es 100.
 */
export const VOLUMEN_POR_DEFECTO = 100;
export const VOLUMEN_MINIMO = 10;
export const VOLUMEN_MAXIMO = 100;
const MULTIPLICADOR_DE_ABCJS = 3;

export function volumenValido(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return VOLUMEN_POR_DEFECTO;
  return Math.min(VOLUMEN_MAXIMO, Math.max(VOLUMEN_MINIMO, Math.round(v / 10) * 10));
}

/** El número que entiende `abcjs` (`soundFontVolumeMultiplier`). */
export function multiplicadorVolumen(v: number): number {
  return (MULTIPLICADOR_DE_ABCJS * volumenValido(v)) / 100;
}

/**
 * El METRÓNOMO, escrito como una segunda voz de percusión: un golpe por pulso,
 * el primero de cada compás en el bloque de madera agudo (`e` = 76) y los
 * demás en el grave (`f` = 77).
 *
 * 🔴 POR QUÉ NO SE USA EL METRÓNOMO DE `abcjs` (`drum`), que era el plan: ese
 * **solo marca en las barras de compás ESCRITAS** (`abc_midi_flattener.js`,
 * `writeDrum`). La primera melodía real —la Intro de Agnus Dei, `^F2 G2 A2 B2
 * A2`— no tiene ninguna, y el metrónomo se quedó **mudo**: medido el
 * 2026-09-10, ni un golpe pedido al servidor. Aquí los golpes salen de la
 * cuenta del tiempo, haya barras o no.
 * 📌 Con `clef=perc`, `abcjs` la toca como percusión y **no la transporta** con
 * el tono del culto (`abc_midi_sequencer.js:171-182`).
 * 🔴 **Pero la armadura SÍ le llega**: medido el 2026-09-10, en Re pidió `E5` y
 * **`Gb5`** — el fa se volvió fa#, que en percusión es OTRO instrumento (78, la
 * cuica). Por eso los golpes van con **becuadro** (`=e`, `=f`): así dan 76 y 77
 * en cualquier tono.
 *
 * 📌 **La cuenta de entrada (fase 3) es el mismo metrónomo, un compás antes**:
 * suena aunque el metrónomo esté apagado, y entonces se calla al entrar la
 * melodía.
 *
 * @param total  Lo que dura la melodía, en corcheas: se cubre entera.
 */
export function vozMetronomo(
  compas: string | null | undefined,
  total: number,
  opciones: { entrada?: boolean; metronomo?: boolean } = {}
): string {
  const { entrada = false, metronomo = true } = opciones;
  const { golpes, corcheas } = pulsoDe(compas);
  const dur = corcheas === 1 ? "" : String(corcheas);
  const cuantos = (entrada ? golpes : 0) + (metronomo ? Math.max(1, Math.ceil(total / corcheas)) : 0);
  const partes: string[] = [];
  for (let i = 0; i < cuantos; i++) {
    partes.push((i % golpes === 0 ? "=e" : "=f") + dur);
    if (i % golpes === golpes - 1) partes.push("|");
  }
  // `!mp!`: más suave que la melodía, que es lo que se quiere oír.
  return "!mp! " + partes.join(" ");
}

/**
 * El ABC que SUENA: todas las secciones seguidas.
 *
 * 🔴 ENTRE SECCIÓN Y SECCIÓN VA UNA BARRA, si la anterior no acaba ya en una.
 * No es estética: en el editor cada sección empieza **sin alteraciones
 * arrastradas** —cada una es su propio pentagrama—, y la barra hace que al
 * sonar pase lo mismo. Sin ella, un fa# del final de la A seguiría sonando
 * sostenido al principio de la B.
 * ⚠️ Y no se pone dos veces: `| |` es un compás vacío en medio de la melodía.
 */
export function abcParaSonar(opciones: {
  tramos: Elemento[][];
  compas?: string | null;
  tono?: string | null;
  tempo?: number | null;
  /** Añadir el metrónomo como segunda voz (ver `vozMetronomo`). */
  metronomo?: boolean;
  /** Un compás de cuenta antes de la melodía (fase 3). */
  entrada?: boolean;
}): string {
  const cuerpo: string[] = [];
  for (const elementos of opciones.tramos) {
    if (!elementos.some((e) => e.tipo !== "barra")) continue;
    const anterior = cuerpo[cuerpo.length - 1];
    if (anterior && !anterior.trimEnd().endsWith("|") && elementos[0]?.tipo !== "barra") {
      cuerpo.push("|");
    }
    cuerpo.push(melodiaAbc(elementos));
  }
  const cabecera = [
    "X:1",
    `M:${opciones.compas || "4/4"}`,
    "L:1/8",
    `Q:1/4=${tempoValido(opciones.tempo)}`,
    `K:${opciones.tono || "C"}`,
  ];
  // La cuenta: la melodía calla un compás entero, y la barra de después hace
  // que ese silencio no se mezcle con el primer compás de verdad.
  const entrada = Boolean(opciones.entrada);
  const silencio = entrada ? `z${corcheasPorCompas(opciones.compas)} | ` : "";
  const melodia = silencio + (cuerpo.join(" ") || "z8");
  if (!opciones.metronomo && !entrada) return [...cabecera, melodia].join("\n");
  const total = duracionTotal(lineaDeTiempo(opciones.tramos));
  const golpes = vozMetronomo(opciones.compas, total, { entrada, metronomo: Boolean(opciones.metronomo) });
  return [...cabecera, "V:1", melodia, "V:2 clef=perc", golpes].join("\n");
}

/**
 * Cuánto se mueve lo que SUENA en la presentación.
 *
 * 🔴 Y NO es lo mismo que lo que se DIBUJA. El pentagrama de la presentación
 * se mueve con el tono del culto, los ± del músico **y su instrumento**; lo que
 * suena, **solo con los dos primeros**: el grupo toca en el tono del culto, y
 * la trompeta que lee un tono arriba **suena** en el de todos. Si el
 * instrumento entrara aquí, la trompeta oiría su parte un tono desplazada.
 *
 * Se coge la dirección más corta, como hace el dibujo: bajar un semitono no
 * puede convertirse en subir once.
 */
export function semitonosQueSuenan(tonoDelCulto: number, delMusico: number): number {
  const n = (((tonoDelCulto + delMusico) % 12) + 12) % 12;
  return n > 6 ? n - 12 : n;
}
