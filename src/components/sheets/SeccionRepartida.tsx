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
import { repartirPorAncho } from "@/lib/reparto";
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
  mostrarMedida = false,
}: Props) {
  const { total } = bloquesVisuales(notes);

  // 🔴 Lo MEDIDO ya no es «cuántos caben» sino EL ANCHO DE CADA BLOQUE y el de
  // la fila (O-65). `null` = todavía sin medir.
  //
  // Contar solo predice el espacio cuando todas las piezas miden lo mismo, y no
  // lo miden: en la sección C de «Es Por Tu Gracia», con la fila a 526 px, los
  // bloques normales miden 104–161 px y la casilla `{}2` mide **526 ella sola**.
  // Con la cuenta salían dos trozos de 4, y el segundo medía 1.052 px en una
  // fila de 526 — envolvía por dentro, que es justo lo que la regla 1 prohíbe.
  // 🔴 SE GUARDA EL REPARTO YA CALCULADO, no los anchos. Y ese es EL FRENO.
  //
  // La primera version guardaba los anchos en pixeles, con decimales, y eso
  // cerraba un lazo: anchos → reparto → alto del contenido → **el auto-ajuste
  // cambia `fontScale`** → anchos otra vez. Con decimales nunca se estabiliza
  // —siempre hay una milesima de diferencia— y las canciones se ponian a
  // BAILAR a pantalla completa. Isaac lo vio a los minutos de publicarlo y
  // hubo que revertir.
  //
  // 📌 Lo que habia antes era un ENTERO («caben 4»), y ese entero no era una
  // imprecision: **era el freno**. Un valor discreto solo cambia cuando el
  // cambio es grande, asi que el lazo no llega a arrancar. Aqui se recupera esa
  // propiedad guardando algo aun mas grueso: el reparto `[4,3,1]`. Si al
  // re-medir sale el mismo, **no se re-dibuja nada**.
  // Van JUNTOS en el estado —no en un `ref`— porque los dos se leen al
  // dibujar, y leer un `ref` durante el render es un fallo de React de verdad:
  // el componente puede no re-dibujarse cuando cambie. Lo caza el lint.
  // Y los dos estan REDONDEADOS, asi que comparar por igualdad es estable.
  const [reparto, setReparto] = useState<{ tamanos: number[]; fila: number } | null>(null);
  const [alto, setAlto] = useState<number | null>(null);
  const sondaRef = useRef<HTMLDivElement>(null);
  const celdaRef = useRef<HTMLDivElement>(null);

  // Se reparte si hay algo que repartir. Con un solo bloque no lo hay; con dos
  // ya sí — lo pidió Isaac con el «Intro Sinte» de «Su Presencia».
  //
  // 📌 Aquí había además una excepción: si él marcaba los cortes a mano con ";"
  // la página no reorganizaba nada. **Murió con el salto de línea (O-62)**, y la
  // razón es suya: el reparto mide lo que cabe en CADA aparato, y eso no se
  // puede acertar a mano para todos los tamaños a la vez.
  const repartible = total >= 2;

  /**
   * Mide la sonda: agrupa los hijos de la rejilla por su posición vertical y
   * cuenta los de la PRIMERA fila. Eso es «lo que cabe» de verdad.
   */
  const medirDeVerdad = () => {
    const sonda = sondaRef.current;
    if (!sonda) return;
    const rejilla = sonda.querySelector<HTMLElement>("[data-rejilla-compases]");
    if (!rejilla) return;

    // 🔴 NO se filtra por `offsetHeight > 0`, y conviene que siga escrito:
    // así era antes, y convertia la medida en una apuesta —si el navegador
    // devolvia 0 para todos, la lista salia vacia, `medir` se rendia y la
    // seccion **no se repartia nunca**—. Isaac lo vio el 2026-09-02: en su
    // navegador salia «caben SIN MEDIR» en todas.
    // *(Aquí se descartaban además los saltos manuales por su marca; ya no hay
    // saltos que descartar — O-62.)*
    const items = Array.from(rejilla.children) as HTMLElement[];
    if (!items.length) return;

    // Se REDONDEA a unidades gruesas antes de repartir: una milesima de pixel
    // no puede cambiar el resultado. Es la segunda mitad del freno.
    const REJILLA = 8;
    const redondear = (n: number) => Math.max(REJILLA, Math.round(n / REJILLA) * REJILLA);
    const anchos = items.map((h) => redondear(h.getBoundingClientRect().width));
    const fila = redondear(rejilla.getBoundingClientRect().width);
    const nuevo = repartirPorAncho(anchos, fila);
    // 🔴 Solo se guarda si el REPARTO cambia. Si sale el mismo, no hay
    // re-dibujo, y sin re-dibujo el lazo no puede realimentarse.
    setReparto((antes) =>
      antes &&
      antes.fila === fila &&
      antes.tamanos.length === nuevo.length &&
      antes.tamanos.every((v, i) => v === nuevo[i])
        ? antes
        : { tamanos: nuevo, fila }
    );

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
    // 🔴 SOLO se re-mide si cambia el ANCHO. El ALTO lo cambia el propio
    // reparto —al partir en mas cuadros, la celda crece o mengua—, asi que
    // reaccionar a el es realimentarse a si mismo. Es la cuarta pata del freno,
    // y sin ella el `ResizeObserver` reabre el lazo que hacia bailar la pagina.
    let anchoVisto = celda.getBoundingClientRect().width;
    const ro = new ResizeObserver(() => {
      const ancho = celda.getBoundingClientRect().width;
      if (Math.abs(ancho - anchoVisto) < 1) return;
      anchoVisto = ancho;
      medir();
    });
    ro.observe(celda);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [repartible, medir, notes, fontScale]);

  // Sin medir todavía, o nada que repartir: una sola casilla, como siempre.
  const cortes: [number, number][] = [];
  if (repartible && reparto) {
    let desde = 0;
    for (const n of reparto.tamanos) {
      cortes.push([desde, desde + n]);
      desde += n;
    }
  }
  if (!cortes.length) cortes.push([0, total]);

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
                ? `${total}→${cortes.map(([a, b]) => b - a).join("+")} · fila ${reparto?.fila ?? 0}px`
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
                  ? `${total} → ${cortes.map(([a, b]) => b - a).join("+")} · fila ${reparto ? reparto.fila + "px" : "SIN MEDIR"} · alto ${alto ?? "?"}px`
                  : `${total} · no se reparte`}
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
