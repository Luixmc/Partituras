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

// 🔴 Aqui hubo un `MAXIMO_BLOQUES = 4` y **lo tumbo Isaac** el 2026-09-02:
// *«no importa que el que pase sea solamente uno, eso no importa»*. Lo puse yo
// mirando una captura de su telefono donde una seccion salia en diez tarjetas y
// me parecio feo — pero eso no era una decision mia. Queda escrito para que
// nadie lo vuelva a meter creyendo que es una mejora.

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

  // 🔴 SIN TOPE. Lo habia —cuatro trozos como mucho— y **Isaac lo tumbo** el
  // 2026-09-02: *«AUN NO SE HA ARREGLADO LO DE QUE PASEN LOS COMPASES, NO
  // IMPORTA QUE EL QUE PASE SEA SOLAMENTE UNO, ESO NO IMPORTA»*.
  //
  // 📌 El tope lo puse yo mirando una captura de su telefono donde una seccion
  // salia en diez tarjetas y me parecio feo. **Pero eso no es una decision mia**:
  // el pidio que lo que no cabe pase a la casilla siguiente, punto. Y ahora la
  // rejilla usa el ancho entero de la pantalla, asi que el caso de las diez
  // tarjetas casi no aparece.

  // Se reparte PAREJO, para que no quede un ultimo bloque suelto de uno o dos.
  // Con 10 compases en 4 bloques salen `3+3+2+2`, no `3+3+3+1`.
  // Lo que sobra va a los primeros: se empieza lleno.
  const base = Math.floor(total / bloques);
  const resto = total % bloques;

  return Array.from({ length: bloques }, (_, i) => base + (i < resto ? 1 : 0));
}


/**
 * Lo mismo, pero en cortes `[desde, hasta)` listos para recortar la sección.
 *
 * ✅ ISAAC ELIGIO LA REGLA 1 el 2026-09-03, viendo las dos en pantalla:
 * **los bloques mas grandes que quepan ENTEROS en una fila, sin que ninguno se
 * parta por dentro.** La otra —«nunca menos de cuatro compases»— se borro ese
 * mismo dia, con su tipo `Regla` y la prop del componente.
 *
 * 📌 Y se borra a proposito en vez de dejarla «por si acaso»: dos reglas vivas
 * para lo mismo son dos formas de que la pantalla haga cosas distintas segun
 * quien monte el componente. La que perdio esta en el historial de git si
 * alguna vez hace falta — no hace falta que estorbe aqui.
 *
 * ⚠️ El motivo de que perdiera, para no reabrirlo: con el minimo de cuatro, a
 * media pantalla —donde caben 3— salian bloques de 5 que **se partian por
 * dentro en dos filas**, una llena y otra a medias. Es lo que Isaac vio mal el
 * 2026-09-01, y estaba en su propia frase: «cuatro compases minimos, **o las
 * que pueda**». Cuando caben 3, cuatro no es posible.
 */
export function cortesDe(total: number, cabenEnUnaFila: number): [number, number][] {
  const cortes: [number, number][] = [];
  let i = 0;
  for (const t of repartirBloques(total, cabenEnUnaFila)) {
    cortes.push([i, i + t]);
    i += t;
  }
  return cortes;
}

// ─────────────────────────────────────────────────────────────
// O-65 · REPARTIR POR ANCHO, no por cuenta
//
// 🔴 EL FALLO QUE ESTO ARREGLA, y es de los que se ven solo con casillas:
// `repartirBloques` reparte contando —`ceil(total / caben)`— y eso **solo es
// valido si todos los bloques miden lo mismo**. No lo miden. Medido sobre la
// seccion C de «Es Por Tu Gracia», con la fila a 526 px:
//
//     bloques normales ... 104 a 161 px
//     casilla `{}1` ...... 251 px
//     casilla `{}2` ...... 526 px  ← ocupa ella sola la fila entera
//
// Con `caben = 4` repartia `4 + 4`, y el segundo grupo media **1.052 px en una
// fila de 526**: envolvia por dentro. Que es exactamente lo que la regla 1 de
// Isaac prohibe —«los bloques mas grandes que quepan ENTEROS en una fila»—.
// El navegador, dejado solo, hacia `4 + 3 + 1`.
//
// 📌 Contar predice el espacio **solo cuando todas las piezas son iguales**. En
// cuanto una mide cinco veces mas que otra, la cuenta miente.
// ─────────────────────────────────────────────────────────────

/**
 * ¿Caben estos anchos en trozos de `tope` como mucho, usando `grupos` o menos?
 *
 * Un bloque MAS ANCHO que la fila no cabe en ningun reparto —una casilla que
 * llena la fila entera, por ejemplo—: se acepta solo, en su propio trozo.
 */
function cabenEn(anchos: number[], tope: number, grupos: number, anchoFila: number): boolean {
  return agrupar(anchos, tope, anchoFila).length <= grupos;
}

/**
 * El reparto greedy: se van metiendo bloques mientras quepan en `tope`.
 *
 * 🔴 Con DOS techos, y el segundo es el que no se puede saltar: `tope` es el
 * objetivo de equilibrado, y `anchoFila` es el limite fisico. Sin el segundo,
 * un objetivo mal calculado mete dos bloques que no caben y **la fila envuelve
 * igual que antes**. Lo cazo una prueba con 200 combinaciones, no la pantalla.
 */
function agrupar(anchos: number[], tope: number, anchoFila: number): number[] {
  const tamanos: number[] = [];
  let enEste = 0;
  let acumulado = 0;
  const cerrar = () => {
    if (enEste > 0) tamanos.push(enEste);
    enEste = 0;
    acumulado = 0;
  };
  for (const a of anchos) {
    if (a > anchoFila) {
      // No cabe en ninguna fila: va solo y envolvera por dentro. No hay nada
      // mejor que se pueda hacer con el.
      cerrar();
      tamanos.push(1);
      continue;
    }
    if (enEste > 0 && (acumulado + a > tope || acumulado + a > anchoFila)) cerrar();
    enEste += 1;
    acumulado += a;
  }
  cerrar();
  return tamanos;
}

/**
 * Cuantos bloques va en cada trozo, repartiendo por el ANCHO real de cada uno.
 *
 * @param anchos     Lo que mide cada bloque en pantalla, en pixeles
 * @param anchoFila  Lo que mide la fila donde tienen que caber
 * @returns Los tamaños de cada trozo. Un solo elemento = no hay que partir
 */
export function repartirPorAncho(anchos: number[], anchoFila: number): number[] {
  const total = anchos.length;
  if (total <= 0) return [];

  // Ante la duda, NO se toca: sin medida fiable la seccion se queda entera. Es
  // preferible que se vea como siempre a repartirla por un numero inventado.
  if (!Number.isFinite(anchoFila) || anchoFila <= 0) return [total];
  if (anchos.some((a) => !Number.isFinite(a) || a <= 0)) return [total];

  // 1. Los MENOS trozos posibles sin que ninguno desborde. Es lo mismo que hace
  //    el navegador al envolver, y es la regla 1 que eligio Isaac.
  const grupos = agrupar(anchos, anchoFila, anchoFila).length;
  if (grupos <= 1) return [total];

  // 2. Con ese numero, se EQUILIBRA: se busca el trozo mas ancho mas pequeño
  //    posible que siga cabiendo en `grupos` trozos.
  //
  // 📌 Esto es lo que conserva lo que pidio Isaac —«que aproveche lo maximo los
  // espacios, no que quede tan estrecho»— pero medido en PIXELES y no en numero
  // de compases, que es lo que de verdad significaba. Y con bloques iguales da
  // exactamente lo mismo que la cuenta de antes: 8 con sitio para 6 son `4+4`.
  let bajo = 1;
  let alto = anchoFila;
  while (bajo < alto) {
    const medio = Math.floor((bajo + alto) / 2);
    if (cabenEn(anchos, medio, grupos, anchoFila)) alto = medio;
    else bajo = medio + 1;
  }

  const tamanos = agrupar(anchos, bajo, anchoFila);
  return tamanos.length ? tamanos : [total];
}

/** Lo mismo, pero en cortes `[desde, hasta)` listos para recortar la seccion. */
export function cortesPorAncho(anchos: number[], anchoFila: number): [number, number][] {
  const cortes: [number, number][] = [];
  let desde = 0;
  for (const n of repartirPorAncho(anchos, anchoFila)) {
    cortes.push([desde, desde + n]);
    desde += n;
  }
  return cortes;
}
