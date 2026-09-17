"use client";

import { figuraDe } from "@/lib/figuras";

// 🔴 EL TAMAÑO DE LAS FIGURAS SALE DE DOS VARIABLES CSS, no de números sueltos.
//
// Isaac (O-51): «no se logra diferenciar el doble puntillo o que es una
// semicorchea; me toca poner zoom al 300 %». Y tenía razón medida: con
// `height: 1em` sobre un viewBox de 24×30 y el texto a ~14 px, **el puntillo
// quedaba en menos de 2 píxeles de diámetro** y los dos corchetes de la
// semicorchea se fundían en uno.
//
//   --figura-alto    cuánto mide la figura respecto al texto
//   --figura-escala  cuánto se refuerzan los puntos y los trazos
//
// Están como variables y no como constantes para poder **probar tamaños sin
// tocar el código** (así se eligió, sobre el dibujo). Los valores por defecto
// son los que se decidieron mirándolo.
// 1.6 es LA «C» que eligió Isaac mirando las cinco opciones al tamaño real
// (O-51). A 1 el puntillo medía menos de 2 px y no se distinguía del doble.
//
// 🔴 Es un NÚMERO, no una medida, y esa es la parte que importa: quien coloca
// la figura necesita **calcular** con él para reservarle el hueco justo. Con
// `1.6em` no se podía multiplicar, así que el hueco era una constante escrita
// aparte… y al crecer la figura se quedó corta y las figuras acabaron encima
// de los acordes (O-53). Ahora el hueco SALE DE AQUÍ y no se pueden separar.
export const FIGURA_ALTO = "var(--figura-alto, 1.6)";
const ALTO = `calc(${FIGURA_ALTO} * 1em)`;

// 🔴 EL SILENCIO TIENE SU PROPIO ALTO, Y NO ES UN CAPRICHO (O-54 ②).
//
// Isaac: *«el silencio sobresale para abajo»* y *«sobra hueco arriba y abajo»*.
// **Medido en la página real antes de tocar nada:** su caja mide 24 px y el
// dibujo 48, así que se salía **12 px por abajo —encima del acorde— y 12 por
// arriba**; y dentro del lienzo de 30 unidades **la tinta ocupaba 6**, con
// 12,5 de hueco arriba y 11,5 abajo. O sea: un lienzo enorme casi vacío.
//
// El lienzo se recortó a la tinta de VERDAD de las cinco figuras —de y=5,4 la
// negra a y=24,5 la semicorchea—, que es `viewBox="0 5 24 20"`. Pero recortar
// el lienzo **agranda el dibujo** si no se toca el alto: 20 unidades repartidas
// en el mismo alto son unidades más grandes. Por eso el alto se multiplica por
// **20/30**, y así el signo se ve EXACTAMENTE igual que antes en los tres
// sitios donde se usa —la cuadrícula, la barra de acordes y el editor de
// melodía—, pero su caja ya no arrastra el vacío.
//
// 📌 La regla, que es la que se saltó la primera vez: **la caja de un dibujo
// tiene que medir lo que se ve**. Mientras el lienzo llevaba 24 unidades de
// aire, cualquier número que se escribiera para colocarlo estaba colocando
// aire, no el signo.
const ALTO_SILENCIO = `calc(${FIGURA_ALTO} * 1em * 20 / 30)`;
const ESC = "calc(var(--figura-escala, 1))";

/** Un grosor de trazo, reforzado por `--figura-escala`. */
function trazo(base: number) {
  return `calc(${base} * var(--figura-escala, 1))`;
}

/** El radio de un puntillo, reforzado igual. */
function radioPunto(base: number) {
  return `calc(${base} * var(--figura-escala, 1))`;
}

// Figuras musicales dibujadas en SVG (más fiables que los caracteres Unicode
// musicales, que no se ven en muchas fuentes). Usan `currentColor`, así que
// heredan el color del texto del contenedor.

type FigureProps = {
  beats: number;
  className?: string;
};

/**
 * Figura de nota según los tiempos:
 *  0.5 = corchea · 1 = negra · 2 = blanca · 3 = blanca con puntillo · 4 = redonda
 *
 * `beamed`: la nota va unida por viga a sus vecinas, así que NO dibuja sus
 * corchetes (la viga la dibuja el contenedor del grupo).
 */
export function NoteFigure({ beats, className, beamed = false }: FigureProps & { beamed?: boolean }) {
  // 📌 Todo sale de la FIGURA BASE. Los puntillos no cambian la forma: una
  // negra con doble puntillo sigue siendo una negra —rellena, con plica y sin
  // corchete—, solo que con dos puntos detrás.
  const { base, puntillos } = figuraDe(beats);
  const filled = base <= 1; // la blanca y la redonda van huecas
  const hasStem = base !== 4; // la redonda no lleva plica
  const hasFlag = !beamed && base <= 0.5; // corchea y semicorchea
  const hasDoubleFlag = !beamed && base <= 0.25; // la semicorchea, dos corchetes

  return (
    <svg
      viewBox="0 0 24 30"
      className={className}
      style={{ height: ALTO, width: "auto", display: "block" }}
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="8"
        cy="21"
        rx="6.2"
        ry="4.5"
        transform="rotate(-22 8 21)"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={trazo(1.7)}
      />
      {hasStem && <line x1="13.7" y1="20" x2="13.7" y2="3.5" stroke="currentColor" strokeWidth={trazo(1.7)} />}
      {hasFlag && (
        <path
          d="M13.7 3.5 C 19 6, 19.5 11, 15.5 13.5"
          stroke="currentColor"
          strokeWidth={trazo(1.7)}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {hasDoubleFlag && (
        // Segundo corchete de la semicorchea, un poco más abajo.
        <path
          d="M13.7 8 C 19 10.5, 19.5 15.5, 15.5 18"
          stroke="currentColor"
          strokeWidth={trazo(1.7)}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {/* Un punto por puntillo, separados. Antes solo cabía uno porque la
          duración se comparaba contra una lista de valores fijos.

          🔴 O-69 · Y CABEN LOS DOS, que no es lo que pasaba. Iban en
          `19 + i*4.5`, así que el segundo llegaba a **25,3** en una caja que
          acaba en **24**: el navegador le recortaba el 36 % y salía como una
          medialuna. Se vio ampliando 9× la blanca con doble puntillo de
          «Simplemente Alaba» (`C/G:3.5`), la única del repertorio que lo usa.
          Isaac: «fíjate que el signo no sale bien».
          ⚠️ Se corrige METIENDO LOS PUNTOS, no ensanchando la caja: el SVG va
          con `width: auto`, así que una caja más ancha haría el glifo más ancho
          — y el ancho de la figura entra en el del compás, que es la entrada
          del reparto (O-66) y del lazo de auto-ajuste (L-231). Así el dibujo se
          arregla sin mover ni un píxel de lo medido. */}
      {Array.from({ length: puntillos }, (_, i) => (
        <circle key={i} cx={18 + i * 4} cy="21" r={radioPunto(1.8)} fill="currentColor" />
      ))}
    </svg>
  );
}

/**
 * Ligadura / ligado musical: arco curvo que une dos acordes por arriba. Se
 * estira al ancho del contenedor (preserveAspectRatio="none") manteniendo el
 * grosor del trazo constante.
 */
export function SlurFigure({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 12"
      className={className}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", display: "block" }}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 10 Q 50 0 98 10"
        stroke="currentColor"
        strokeWidth={trazo(1.6)}
        fill="none"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * Calderón (fermata): arco con punto, para acordes de pausa/alargación.
 *
 * 🔴 O-82 · EL PUNTO TIENE QUE TENER AIRE POR DEBAJO DEL ARCO, y ese aire se
 * calcula, no se mira. Isaac, 2026-09-13: *«sale la línea curva pero no el
 * punto»*. **El punto se dibujaba**: lo que pasaba es que estaba PEGADO al
 * arco y al tamaño real los dos se funden en un churro.
 *
 * Medido en la versión vieja: el arco `Q 12 1` tenía la cima en **y=7** y con
 * un trazo de 1,8 su borde de abajo llegaba a **7,9**; el punto ocupaba de
 * **7,7 a 11,3** (cy 9,5 · r 1,8). **Se solapaban.** Ampliado x9 el punto
 * colgaba del arco como una gota; a 25 px de alto, que es como se ve en la
 * tablet, no se distinguía nada.
 *
 * → Ahora el arco sube (cima en **y=5,5**, borde de abajo en 6,4) y el punto
 * baja y adelgaza (cy 10,3 · r 1,7, borde de arriba en 8,6): quedan **2,2
 * unidades de aire**, que al tamaño real son unos 3 px y **sí se ven**.
 * Elegido sobre el dibujo, como el silencio de negra (O-47), no por
 * descripción escrita.
 *
 * ⚠️ La pista falsa que costó un rato: `circle.r.baseVal.value` da **0** aquí,
 * porque `radioPunto` pasa un `calc()` y `baseVal` lee el ATRIBUTO. El
 * navegador lo resuelve igual como propiedad CSS de geometría —medido, 5,76 px
 * de diámetro, lo mismo que con un número—. **Para comprobar si un punto se ve,
 * `getBoundingClientRect()`, no `baseVal`.**
 */
export function FermataFigure({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={className}
      style={{ height: ALTO, width: "auto", display: "block" }}
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 13 Q 12 -2 21 13" stroke="currentColor" strokeWidth={trazo(1.8)} fill="none" strokeLinecap="round" />
      <circle cx="12" cy="10.3" r={radioPunto(1.7)} fill="currentColor" />
    </svg>
  );
}

/**
 * Figura de silencio según los tiempos.
 *
 * 🔴 Hasta el 2026-08-29 solo había TRES formas —redonda, blanca y negra— y
 * **todo lo que bajara de 2 se dibujaba como silencio de negra**. Así que
 * `Z:0.5` y `Z:0.25` se veían igual que `Z:1`: un silencio de corchea leído
 * como negra, **el doble de tiempo**. Eso no es un detalle de estilo, es un
 * dato musical equivocado en la pantalla desde la que se toca.
 * Lo pidió Isaac (O-49) y de paso salieron las dos figuras que faltaban.
 *
 * Como en las notas, la FIGURA BASE decide la forma y los puntillos solo
 * añaden puntos.
 */
export function RestFigure({ beats, className }: FigureProps) {
  const { base, puntillos } = figuraDe(beats);

  // Los puntos van a la derecha de la figura, a su altura.
  //
  // 🔴 O-69 · La separación es 4 y no 4.5, y el primero va en 18: con 4.5 el
  // segundo punto llegaba a 25,4 en una caja que acaba en 24, y **el navegador
  // lo recortaba**. Aquí no se veía —ninguna canción usa un silencio con doble
  // puntillo— pero estaba igual de roto que en las notas, y se arregla igual.
  const puntos = (x: number, y: number) =>
    Array.from({ length: puntillos }, (_, i) => (
      <circle key={i} cx={x + i * 4} cy={y} r={radioPunto(1.9)} fill="currentColor" />
    ));

  return (
    <svg
      // 0 5 24 20: el lienzo recortado a la tinta (O-54 ②). Antes era
      // "0 0 24 30" y el 33 % de arriba y abajo estaba vacío.
      viewBox="0 5 24 20"
      className={className}
      style={{ height: ALTO_SILENCIO, width: "auto", display: "block" }}
      fill="none"
      aria-hidden="true"
    >
      {base >= 4 ? (
        // Redonda: bloque COLGANDO de la línea.
        <>
          <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth={trazo(1.6)} />
          <rect x="8" y="12" width="8" height="5" fill="currentColor" />
          {puntos(18, 15)}
        </>
      ) : base >= 2 ? (
        // Blanca: bloque APOYADO sobre la línea. La diferencia con la redonda
        // es a qué lado de la línea cae el bloque, y es la de toda la vida.
        <>
          <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth={trazo(1.6)} />
          <rect x="8" y="13" width="8" height="5" fill="currentColor" />
          {puntos(18, 15.5)}
        </>
      ) : base >= 1 ? (
        // Negra: el «3» con la pata recta que eligió Isaac sobre el dibujo
        // (O-47, variante D2 de la página desechable). Ver el porqué del
        // método en §9.2 — tres intentos por descripción escrita fallaron.
        <>
          <path
            d="M8 7.5 C 13.5 5.5, 17 8.5, 13 11.2 C 17.5 11.8, 17 15.5, 13.2 16.4 L 8.5 22"
            stroke="currentColor"
            strokeWidth={trazo(2.4)}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {puntos(18, 15)}
        </>
      ) : (
        // Corchea y semicorchea, con la forma de imprenta (𝄾 y 𝄿), que es la
        // que mandó Isaac en dos imágenes (O-51).
        //
        // 🔴 La BOLITA VA ARRIBA A LA IZQUIERDA, y de ella sale un trazo corto
        // hacia arriba-derecha; de ahí baja la pata en diagonal. Mi primer
        // intento la puso abajo, colgando del trazo, y así **no se reconoce**:
        // la bolita es de donde arranca el signo.
        //
        // La semicorchea es la misma forma con DOS bolitas —la segunda más
        // abajo— y la pata más larga, igual que la nota lleva dos corchetes.
        <>
          {/* la pata: baja en diagonal hacia la izquierda */}
          <line
            x1={base <= 0.25 ? "17" : "16"}
            y1={base <= 0.25 ? "8.5" : "9"}
            x2={base <= 0.25 ? "7" : "8"}
            y2={base <= 0.25 ? "23.5" : "22"}
            stroke="currentColor"
            strokeWidth={trazo(1.9)}
            strokeLinecap="round"
          />
          {/* primera bolita, arriba a la izquierda, con su trazo de salida */}
          <circle cx="9.5" cy="10.5" r={radioPunto(2.2)} fill="currentColor" />
          <path
            d="M9.5 10.5 C 12.5 10, 14.5 9.5, 16 9"
            stroke="currentColor"
            strokeWidth={trazo(1.7)}
            fill="none"
            strokeLinecap="round"
          />
          {base <= 0.25 && (
            // segunda bolita de la semicorchea, más abajo y a la derecha
            <>
              <circle cx="12" cy="16" r={radioPunto(2.2)} fill="currentColor" />
              <path
                d="M12 16 C 15 15.5, 16.5 15, 18 14.5"
                stroke="currentColor"
                strokeWidth={trazo(1.7)}
                fill="none"
                strokeLinecap="round"
              />
            </>
          )}
          {/* 18, no 18.5: con 18.5 el segundo punto llegaba a 24,4 y la caja
              acaba en 24 — el mismo recorte de O-69, medio punto en vez de un
              tercio, pero recorte igual. */}
          {puntos(18, 15)}
        </>
      )}
    </svg>
  );
}

