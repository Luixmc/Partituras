// ─────────────────────────────────────────────────────────────
// Cómo se reparte una sección larga entre las casillas de la rejilla (O-52).
//
// Isaac, 2026-08-29: «que si es posible que tenga cuatro compases mínimos, o
// las que pueda para que aproveche lo máximo los espacios, no que quede tan
// estrecho pero si los que pueda la página».
//
// 🔴 POR QUÉ ESTO VIVE EN `lib/` Y NO DENTRO DEL COMPONENTE: es lógica pura, y
// así la cubren las pruebas del CI en vez de un arnés suelto. Es lo mismo que
// se hizo con `music.ts`, `acordes.ts` y `figuras.ts`. Y hace falta: si la
// cuenta falla **no se ve un error**, se ve una canción repartida raro — y eso
// solo lo nota quien la está tocando.
// ─────────────────────────────────────────────────────────────

/**
 * A partir de cuántos compases una sección se puede repartir.
 *
 * Isaac pidió «cuatro compases mínimos, **si es posible**». Ese «si es posible»
 * resultó ser la parte importante: cuando en una fila solo caben tres, forzar
 * cuatro hace que el bloque envuelva, y eso es peor que un bloque de tres.
 * → Aquí el 4 se usa para dos cosas: **por debajo de 4 una sección no se parte
 * nunca**, y por encima el tamaño lo decide lo que quepa de verdad.
 */
export const MINIMO_POR_BLOQUE = 4;

/**
 * En cuantos trozos como MUCHO se parte una seccion.
 *
 * 🔴 POR QUE EXISTE, y lo enseno el telefono de Isaac (2026-09-01): **en un
 * movil en vertical solo cabe UN compas por fila**. Sin este tope, una seccion
 * de 10 se partia en **diez tarjetas**, cada una con su cabecera — mucho peor
 * que dejarla entera. Y no se veia probando anchos de ordenador: hubo que mirar
 * lo que mide un telefono de verdad.
 *
 * 📌 La idea de fondo: **repartir sirve para llevar la continuacion a la
 * casilla de al lado.** Si hicieran falta mas de cuatro trozos, la pantalla es
 * demasiado estrecha para que eso signifique nada, y la seccion se queda entera
 * envolviendo dentro de su caja — que es como se ha visto siempre.
 */
export const MAXIMO_BLOQUES = 4;

/**
 * De cuántos compases es cada bloque, dado lo que cabe de verdad en una fila.
 *
 * `cabenEnUnaFila` sale de MEDIR el dibujo, no de un número escrito a mano: un
 * número fijo acierta en una pantalla y falla en las otras tres, que es lo que
 * ya se pagó con el hueco de las figuras (O-53) y con las listas de duraciones
 * (O-49).
 *
 * Dos reglas, y la segunda es la que no es obvia:
 *
 * 1. **Nunca menos de `minimo`.** Si en una fila caben 2 compases, partir de 2
 *    en 2 rompería la sección en muchos trozos diminutos repartidos por la
 *    pantalla. Con el mínimo, el bloque envuelve por dentro —que se lee
 *    izquierda→derecha, como siempre— en vez de fragmentarse.
 *
 * 2. 🔴 **Se reparte PAREJO, no llenando hasta arriba.** Con 8 compases y sitio
 *    para 6, lo bruto sería `6 + 2`: la primera casilla llena y la segunda casi
 *    vacía. Eso es justo el hueco desperdiciado que Isaac no quiere. Se hace
 *    `4 + 4`, que además es **exactamente como él lo parte a mano**.
 *
 * @param total  Cuántos bloques visuales tiene la sección (compases y recuadros)
 * @param cabenEnUnaFila  Cuántos caben, medido en pantalla
 * @returns Los tamaños de cada bloque. Un solo elemento = no hay que partir
 */
export function repartirBloques(
  total: number,
  cabenEnUnaFila: number,
  minimo: number = MINIMO_POR_BLOQUE
): number[] {
  if (total <= 0) return [];

  // Ante la duda, NO se toca: un ancho que no se ha medido todavia, o absurdo,
  // deja la seccion entera. Es preferible que se vea como siempre a repartirla
  // por un numero inventado.
  if (!Number.isFinite(cabenEnUnaFila) || cabenEnUnaFila < 1) return [total];
  const cabe = Math.floor(cabenEnUnaFila);

  // Cabe entera en una fila: no se toca. El caso normal de casi todas.
  if (total <= cabe) return [total];

  // 🔴 Una seccion CORTA **tambien** se parte, y esto lo corrigio Isaac el
  // 2026-09-01 con «Su Presencia»: su «Intro Sinte» son DOS compases que
  // envolvian dentro de la caja, y el los queria uno al lado del otro.
  // Sus palabras: «son dos compases diferentes, o sea no estan en el mismo
  // compas, y no se pone en el lado derecho para seguir el orden de la
  // lectura». → **Si envuelve, se reparte. Sin excepcion por tamano.**
  // (`minimo` se queda para la otra regla, la que el todavia esta comparando.)
  void minimo;

  // 🔴 LA REGLA QUE MANDA: **ningun bloque puede envolver dentro de si mismo.**
  //
  // Lo vio Isaac el 2026-09-01 poniendo la pagina a media pantalla: los bloques
  // salian de 5 compases donde solo cabian 3, asi que cada uno se partia en dos
  // filas — una llena y otra a medias y estirada. Sus palabras: «cuando la
  // pagina ocupa la pantalla completa sale bien, pero cuando lo pongo para que
  // ocupe la mitad de la pantalla mira como sale».
  //
  // 📌 **Eso corrige la version anterior, que ponia el minimo de 4 por delante.**
  // El minimo obligaba a hacer POCOS bloques, y pocos bloques significa bloques
  // grandes — que es justo lo que no cabia. El «si es posible» de su encargo
  // («que SI ES POSIBLE tenga cuatro compases minimos, **o las que pueda** para
  // que aproveche lo maximo los espacios») es lo que decide el empate: cuando
  // en una fila caben 3, cuatro no es posible, y forzarlo es lo que dejaba la
  // pantalla como el la vio.
  //
  // Se hacen los MENOS bloques que evitan el envolvimiento, asi que cada bloque
  // sale **lo mas grande que la pantalla permite** — que es «aprovechar el
  // espacio».
  //
  // ⚠️ Y es LA UNICA regla de tamano, a proposito. La primera version tenia
  // ademas un suelo —«nunca bloques de un solo compas»— y las dos se peleaban:
  // con 5 compases y sitio para 2, el suelo obligaba a `3 + 2`, y ese 3 volvia
  // a envolver. **Lo cazaron las pruebas, no la pantalla.** Dos reglas de
  // tamano tirando en sentidos opuestos siempre tienen un caso donde una gana y
  // rompe a la otra; con una sola, no hay empate que resolver.
  const bloques = Math.ceil(total / cabe);

  // 🔴 Y el tope: si haria falta trocear en mas de `MAXIMO_BLOQUES`, la pantalla
  // es demasiado estrecha para que repartir gane nada. Se deja entera.
  if (bloques > MAXIMO_BLOQUES) return [total];


  // Se reparte PAREJO, para que no quede un ultimo bloque suelto de uno o dos.
  // Con 10 compases en 4 bloques salen `3+3+2+2`, no `3+3+3+1`.
  // Lo que sobra va a los primeros: se empieza lleno.
  const base = Math.floor(total / bloques);
  const resto = total % bloques;

  return Array.from({ length: bloques }, (_, i) => base + (i < resto ? 1 : 0));
}


/**
 * La otra regla posible: **bloques de `minimo` como poco, aunque envuelvan.**
 *
 * Se conserva para poder ENSENARLE las dos a Isaac una al lado de la otra, que
 * es lo unico que decide en algo que se juzga con los ojos. Cuando elija, la
 * que pierda se borra.
 *
 * La diferencia se ve en pantallas estrechas: aqui una seccion de 12 con sitio
 * para 2 sale `4+4+4` —tres bloques que envuelven por dentro—, mientras que
 * `repartirPorFila` saca `2x6` —seis bloques que no envuelven ninguno—.
 */
export function repartirConMinimo(
  total: number,
  cabenEnUnaFila: number,
  minimo: number = MINIMO_POR_BLOQUE
): number[] {
  if (total <= 0) return [];
  if (!Number.isFinite(cabenEnUnaFila) || cabenEnUnaFila < 1) return [total];
  const cabe = Math.floor(cabenEnUnaFila);
  if (total <= cabe) return [total];

  // El minimo pone un TECHO a cuantos bloques caben.
  const bloques = Math.min(Math.floor(total / minimo), Math.ceil(total / cabe));
  if (bloques <= 1 || bloques > MAXIMO_BLOQUES) return [total];

  const base = Math.floor(total / bloques);
  const resto = total % bloques;
  return Array.from({ length: bloques }, (_, i) => base + (i < resto ? 1 : 0));
}

/** Cual de las dos reglas se usa. */
export type Regla = "porFila" | "minimo";

/**
 * Lo mismo, pero en cortes `[desde, hasta)` listos para recortar la sección.
 */
export function cortesDe(
  total: number,
  cabenEnUnaFila: number,
  regla: Regla = "porFila"
): [number, number][] {
  const reparte = regla === "minimo" ? repartirConMinimo : repartirBloques;
  const cortes: [number, number][] = [];
  let i = 0;
  for (const t of reparte(total, cabenEnUnaFila)) {
    cortes.push([i, i + t]);
    i += t;
  }
  return cortes;
}
