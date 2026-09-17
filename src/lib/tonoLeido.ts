// ─────────────────────────────────────────────────────────────
// EN QUÉ TONO SE LEE UNA CANCIÓN, y cómo se escribe ese tono.
//
// 🔴 ESTO VIVE AQUÍ PORQUE LO CALCULAN DOS PANTALLAS, y el día que se
// separen nadie se va a enterar. La pantalla completa lo hacía en línea desde
// agosto; el PDF del culto lo necesita igual desde O-86 (2026-09-17), porque
// el trompetista quiere llevárselo **en papel ya transpuesto**.
//
// Copiarlo habría sido la cuarta vez que este proyecto escribe la misma cosa
// dos veces —pasó con `parseSections` (P-09) y con la tabla de nombres de nota,
// que estaba en `music.ts` **y** copiada dentro de `PresentationView`—. Y aquí
// el precio de que se separen no es cosmético: **el PDF diría un tono y la
// tablet otro, en mitad de un culto**.
//
// 📌 Lo que hace, en una línea: junta el tono del culto, el ajuste manual y el
// instrumento de quien lee, y devuelve **las cuatro cosas que salen de ahí** —
// cuánto transponer, con qué ortografía, qué tono se lee y cuál suena— para
// que ninguna se pueda calcular por su cuenta y contradecir a las otras (T-14).
// ─────────────────────────────────────────────────────────────

import { esMenor, keyToPitch, ortografiaDe, prefersFlats, semitonesBetween } from "@/lib/music";

// Los nombres de cada altura. 🔴 Estaban en `music.ts` y **copiados** dentro de
// `PresentationView`; se quedan en un solo sitio, que es este.
const PITCH_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const PITCH_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export type TonoLeido = {
  /** Cuántos semitonos hay que transponer el contenido escrito. */
  semitonos: number;
  /**
   * Solo los del culto: de la tonalidad original a la elegida para el servicio,
   * **sin** el ajuste manual ni el instrumento.
   *
   * 🔴 Lo necesita el REPRODUCTOR, y por un motivo que conviene no olvidar: lo
   * que suena por el altavoz tiene que ir en el tono del GRUPO. Si se le
   * pasaran los semitonos de lectura, la melodía sonaría un tono por encima
   * cuando el trompetista tiene su instrumento elegido — o sea, desafinada
   * respecto a todos los demás.
   */
  semitonosDelCulto: number;
  /** La ortografía con la que escribirlo: `true` = bemoles. */
  bemoles: boolean;
  /** El tono que se LEE. Es el que hay que enseñar y con el que van los acordes. */
  seLee: string | null;
  /**
   * El tono que SUENA, para enseñarlo al lado.
   *
   * 🔴 `null` cuando no hay instrumento transpositor, y eso es deliberado: sin
   * desplazamiento lo que se lee y lo que suena **son lo mismo**, y enseñar dos
   * veces el mismo tono solo añade ruido. Solo aparece cuando hay algo que
   * aclarar.
   */
  suena: string | null;
};

/**
 * El tono en el que se lee una canción, con todo lo que influye.
 *
 * `original` es el tono en el que está escrita; `destino`, el del culto;
 * `ajuste`, los semitonos que el músico haya movido a mano; `desplazamiento`,
 * los de su instrumento (`semitonosDe()` de `lib/transpositores.ts`).
 */
export function tonoLeido(opciones: {
  original: string | null | undefined;
  destino: string | null | undefined;
  ajuste?: number;
  desplazamiento?: number;
}): TonoLeido {
  const { original, destino, ajuste = 0, desplazamiento = 0 } = opciones;

  const base = semitonesBetween(original, destino) ?? 0;
  const semitonos = (((base + ajuste + desplazamiento) % 12) + 12) % 12;

  const tonoBase = destino || original || null;
  const menor = esMenor(tonoBase);
  const alturaBase = keyToPitch(destino) ?? keyToPitch(original);

  // El que SUENA: sin el instrumento. Es el tono del que habla el grupo.
  const alturaQueSuena =
    alturaBase === null ? null : (((alturaBase + ajuste) % 12) + 12) % 12;
  // El que se LEE: con el instrumento. Es el que manda para escribir los acordes.
  const alturaQueSeLee =
    alturaQueSuena === null ? null : (((alturaQueSuena + desplazamiento) % 12) + 12) % 12;

  // ¿Bemoles o sostenidos? **Lo decide el tono AL QUE SE LLEGA.**
  //
  // 🔴 Antes se heredaba del tono de PARTIDA, más un «si baja, bemoles» que es
  // falso: bajar de F da E, de C da B, de G da F#, y las tres son de
  // sostenidos. Bajar no tiene nada que ver con los bemoles.
  //
  // Y si no se ha movido nada, **se respeta lo escrito** (T-11): elegir entre
  // `Bb` y `A#` solo toca cuando hay que reescribir de verdad, y esa elección
  // ya la tomó quien escribió la canción.
  const bemoles =
    !ajuste && !desplazamiento && tonoBase
      ? prefersFlats(tonoBase)
      : alturaQueSeLee === null
        ? false
        : ortografiaDe(alturaQueSeLee, menor);

  const nombrar = (altura: number | null, conBemoles: boolean) => {
    if (altura === null) return tonoBase;
    const nota = (conBemoles ? PITCH_FLAT : PITCH_SHARP)[altura];
    return menor ? `${nota}m` : nota;
  };

  // Sin mover nada se enseña el tono TAL COMO ESTÁ ESCRITO: recalcularlo
  // obligaría a elegir entre `Bb` y `A#` y podría contradecir a los acordes,
  // que en ese caso tampoco se tocan (T-14).
  const seLee =
    !ajuste && !desplazamiento && tonoBase ? tonoBase : nombrar(alturaQueSeLee, bemoles);

  const suena = !desplazamiento
    ? null
    : !ajuste && tonoBase
      ? tonoBase
      : nombrar(alturaQueSuena, alturaQueSuena === null ? false : ortografiaDe(alturaQueSuena, menor));

  return { semitonos, semitonosDelCulto: base, bemoles, seLee, suena };
}
