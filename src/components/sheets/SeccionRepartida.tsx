"use client";

// ─────────────────────────────────────────────────────────────
// Una sección que, si no cabe, se reparte entre varias casillas (O-52).
//
// Isaac, 2026-08-29: «quiero ver si es posible que yo escriba la sección
// completa; por ejemplo en esta canción la parte C la divido en dos para que
// ocupe bien en la pantalla», y al ver el ejemplo: «la opción a, es a lo que me
// refiero, pero que si es posible que tenga cuatro compases mínimos, o las que
// pueda para que aproveche lo máximo los espacios».
//
// 🔴 LO QUE HACE, Y POR QUÉ NO ES UN NÚMERO ESCRITO A MANO: se MIDE cuántos
// compases caben de verdad en una fila de la casilla, y se parte por ahí. Un
// número fijo acierta en una pantalla y falla en las otras tres — el tamaño de
// letra lo cambia cada músico (D-09b), las columnas también (O-26), y no es lo
// mismo una tablet que un teléfono que un PC.
//
// Devuelve VARIOS hermanos, no un envoltorio: cada bloque tiene que ser una
// casilla de la rejilla del padre para que el siguiente caiga arriba-derecha o
// abajo-izquierda según el recorrido que eligió el músico.
// ─────────────────────────────────────────────────────────────

import { Fragment, useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import TablaturePreview, { bloquesVisuales } from "@/components/sheets/TablaturePreview";
import { cortesDe, type Regla } from "@/lib/reparto";
import { cn } from "@/lib/utils";

type Props = {
  notes: string;
  label?: string;
  fontScale?: number;
  dense?: boolean;
  /** Clases de cada casilla (las pone la pantalla que dibuja la rejilla). */
  claseCelda?: string;
  /** Estilo de cada casilla (multi-columna necesita `breakInside`). */
  estiloCelda?: CSSProperties;
  /** Cual de las dos reglas de reparto. Temporal, mientras Isaac elige. */
  regla?: Regla;
  /**
   * Ensena la medida EN PANTALLA, debajo del cuadro.
   *
   * 🔴 Solo la usa la pagina desechable, y hace falta: el reparto se decide en
   * el navegador, asi que cuando Isaac dice «en el telefono no se aplica» no
   * hay forma de saber si es que no midio, si midio mal, o si esta viendo una
   * version vieja. Con esto lo dice la propia pantalla y basta una captura.
   */
  mostrarMedida?: boolean;
};

export default function SeccionRepartida({
  notes,
  label,
  fontScale = 1,
  dense = false,
  claseCelda,
  estiloCelda,
  regla = "porFila",
  mostrarMedida = false,
}: Props) {
  const { total, conSaltoManual } = bloquesVisuales(notes);

  // Cuántos caben en una fila. `null` = todavía sin medir.
  const [caben, setCaben] = useState<number | null>(null);
  const [alto, setAlto] = useState<number | null>(null);
  const sondaRef = useRef<HTMLDivElement>(null);
  const celdaRef = useRef<HTMLDivElement>(null);

  // 🔴 Se reparte SOLO si hay algo que repartir y si Isaac no marcó ya los
  // cortes con ";". Si los marcó, manda él: lo automático es la comodidad, no
  // la ley. Y de paso, las canciones que ya usan ";" no cambian de aspecto.
  // Con un solo bloque no hay nada que repartir; con dos ya si —lo pidio Isaac
  // con el «Intro Sinte» de «Su Presencia», que son dos compases—.
  const repartible = !conSaltoManual && total >= 2;

  /**
   * Mide la sonda: agrupa los hijos de la rejilla por su posición vertical y
   * cuenta los de la PRIMERA fila. Eso es «lo que cabe» de verdad.
   */
  const medirDeVerdad = () => {
    const sonda = sondaRef.current;
    if (!sonda) return;
    const rejilla = sonda.querySelector<HTMLElement>("[data-rejilla-compases]");
    if (!rejilla) return;

    // 🔴 Los saltos manuales se descartan por su MARCA, no por su alto.
    // Antes se filtraba con `offsetHeight > 0`, y eso convertia la medida en
    // una apuesta: si el navegador devolvia 0 para todos —cosa que pasa segun
    // como quede la caja oculta—, la lista salia vacia, `medir` se rendia y la
    // seccion **no se repartia nunca**. Isaac lo vio el 2026-09-02: en su
    // navegador salia «caben SIN MEDIR» en todas.
    const items = (Array.from(rejilla.children) as HTMLElement[]).filter(
      (h) => !h.hasAttribute("data-salto")
    );
    if (!items.length) return;

    const arriba = items[0].offsetTop;
    // Un margen de 1 píxel: los redondeos del navegador con la letra a escala
    // hacen que dos items de la misma fila no siempre den el mismo `offsetTop`.
    const enLaPrimeraFila = items.filter((h) => Math.abs(h.offsetTop - arriba) <= 1).length;

    setCaben((antes) => (antes === enLaPrimeraFila ? antes : enLaPrimeraFila));

    // Solo para la pagina desechable: el ALTO real del cuadro, para poder
    // comparar de un vistazo que secciones se salen y cuales no.
    const celda = celdaRef.current;
    if (celda) {
      const h = Math.round(celda.getBoundingClientRect().height);
      setAlto((a) => (a === h ? a : h));
    }
  };

  const medir = useCallback(() => {
    try {
      medirDeVerdad();
    } catch {
      // Ante cualquier cosa rara del navegador, la seccion se queda entera —
      // que es como se ha visto siempre. Nunca se rompe la pagina por esto.
    }
  }, []);

  useLayoutEffect(() => {
    if (!repartible) return;
    medir();

    // El ancho de la casilla cambia al girar el teléfono, al cambiar de
    // columnas o al entrar en pantalla completa. Y el alto del contenido
    // cambia con el tamaño de letra. Se vuelve a medir en los dos casos.
    // Un reintento tras pintar: la primera pasada puede llegar antes de que las
    // fuentes esten listas, y entonces la medida saldria de otro ancho.
    const raf = requestAnimationFrame(() => medir());

    const celda = celdaRef.current;
    if (!celda || typeof ResizeObserver === "undefined") {
      return () => cancelAnimationFrame(raf);
    }
    const ro = new ResizeObserver(() => medir());
    ro.observe(celda);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [repartible, medir, notes, fontScale]);

  // Sin medir todavía, o nada que repartir: una sola casilla, como siempre.
  const cortes =
    repartible && caben != null ? cortesDe(total, caben, regla) : [[0, total] as [number, number]];

  return (
    <>
      {cortes.map(([desde, hasta], i) => (
        <Fragment key={i}>
          <div
            ref={i === 0 ? celdaRef : undefined}
            className={cn(repartible && "relative", claseCelda)}
            style={estiloCelda}
            // 🔴 El rastro del reparto, y NO es un resto de depuración: esto
            // ocurre entero en el navegador, así que sin él **no hay forma de
            // comprobarlo desde fuera**. Es el punto ciego que este proyecto
            // lleva anotado media docena de veces —el arrastre, el desplegable,
            // el salto al escribir—: «no deja rastro en el HTML» y solo lo puede
            // mirar Isaac. Con esto se puede medir, y de hecho fue lo que cazó
            // que una sección se estaba partiendo en tres.
            // Formato: «total→4+4». Un atributo `data-` no pinta nada.
            // Formato: «10→3+3+2+2 · caben 3». Con los dos numeros se comprueba
            // desde fuera lo unico que importa: que NINGUN bloque pase de lo que
            // cabe en una fila, que es el fallo que Isaac vio a media pantalla.
            data-reparto={
              i === 0
                ? `${total}→${cortes.map(([a, b]) => b - a).join("+")} · caben ${caben ?? "?"}`
                : undefined
            }
          >
            <TablaturePreview
              notes={notes}
              // Sin partir, se dibuja entera: así una sección normal no paga
              // absolutamente nada por que esto exista.
              segmentos={cortes.length > 1 ? [desde, hasta] : undefined}
              // 🔴 El trozo siguiente lleva etiqueta CORTA: «C (sigue)», no
              // «C (Porque todo...) (sigue)». Hace falta una —con el recorrido
              // por columnas el trozo puede aterrizar arriba de la otra columna,
              // lejos del primero— pero repetir el titulo entero es peor: en una
              // seccion partida en seis, las cabeceras ocupaban tanto como la
              // musica. Se ve en la captura de media pantalla del 2026-09-01.
              label={i === 0 ? label : etiquetaCorta(label)}
              fontScale={fontScale}
              dense={dense}
            />

            {/* ── La sonda ──
                Dibuja la sección ENTERA, a la anchura real de la casilla, para
                poder contar cuántos compases caben en una fila.

                🔴 Va oculta y en posición absoluta a propósito: así no ocupa
                sitio ni se ve, pero el navegador SÍ la coloca, que es lo único
                que hace falta para medirla. Y como siempre dibuja la sección
                entera, la medida no depende de cómo haya quedado repartida —
                si dependiera, cada reparto cambiaría la medida y la medida el
                reparto, y se quedaría dando vueltas. */}
            {mostrarMedida && i === 0 && (
              <div className="mt-0.5 text-[10px] font-mono text-brand-600 dark:text-brand-400">
                {repartible
                  ? `${total} → ${cortes.map(([a, b]) => b - a).join("+")} · caben ${caben ?? "SIN MEDIR"} · alto ${alto ?? "?"}px`
                  : `${total} · no se reparte${conSaltoManual ? " (tiene « ; »)" : ""}`}
              </div>
            )}

            {repartible && i === 0 && (
              <div
                ref={sondaRef}
                aria-hidden
                // ⚠️ SIN `height: 0` ni `overflow: hidden` a proposito: al ser
                // absoluta ya no ocupa sitio en la casilla, y forzarle el alto
                // era justo lo que hacia que el navegador midiera 0.
                className="pointer-events-none absolute inset-x-0 top-0 -z-10"
                style={{ visibility: "hidden" }}
              >
                <TablaturePreview notes={notes} label={label} fontScale={fontScale} dense={dense} />
              </div>
            )}
          </div>
        </Fragment>
      ))}
    </>
  );
}

/** «C (Porque todo...)» → «C (sigue)». Solo el nombre de la seccion. */
function etiquetaCorta(label?: string): string | undefined {
  if (!label) return undefined;
  // El nombre es lo que va antes del parentesis con la pista de la letra.
  const nombre = label.split("(")[0].trim() || label.trim();
  return `${nombre} (sigue)`;
}
