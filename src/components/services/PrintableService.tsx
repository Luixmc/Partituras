"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Printer, RectangleHorizontal, RectangleVertical, Sun } from "lucide-react";

import TablaturePreview from "@/components/sheets/TablaturePreview";
import { parseSections } from "@/lib/sections";
import { tonoLeido } from "@/lib/tonoLeido";
import Pentagrama from "@/components/sheets/Pentagrama";
import { tramosDe } from "@/lib/melodia";
import {
  TRANSPOSITORES,
  TRANSPOSITOR_POR_DEFECTO,
  guardarTranspositor,
  leerTranspositor,
  semitonosDe,
} from "@/lib/transpositores";
import { transposeContent } from "@/lib/music";
import type { PresentSong } from "@/types";

// Hoja del culto para guardar en PDF: TODAS sus canciones con sus acordes y su
// estructura, una por página y en horizontal (O-08).
//
// Se hace con la impresión del navegador en vez de generar el PDF por dentro
// (D-10). El motivo no es la pereza: la cuadrícula de acordes está hecha con
// HTML y SVG, y el generador de PDF tiene sus propios elementos, así que habría
// que dibujarla DOS VECES y mantener las dos para siempre. Así sale exactamente
// lo que se ve en pantalla.
//
// ⚠️ Esta pantalla NO va dentro del panel: allí el layout usa altura fija y
// `overflow: hidden`, y con eso el navegador **no puede paginar** — salía todo
// en una sola hoja y con la barra de navegación dentro del PDF.

type Props = {
  title: string;
  typeLabel: string;
  dateText: string | null;
  songs: PresentSong[];
  backHref: string;
};

export default function PrintableService({
  title,
  typeLabel,
  dateText,
  songs,
  backHref,
}: Props) {
  // Claro u oscuro para el PDF. Isaac pidió poder guardarlo en oscuro porque
  // «imprimirse nunca va a suceder»: el PDF es para leerlo en el teléfono, y
  // ahí el fondo oscuro cansa menos. Se guarda para la próxima vez.
  const [oscuro, setOscuro] = useState(false);
  useEffect(() => {
    try {
      // Se puede forzar por la dirección (…?fondo=oscuro). Sirve para mandarle
      // a alguien el enlace ya en el modo que se quiere, y para comprobarlo sin
      // depender de lo que tenga guardado cada navegador.
      const pedido = new URLSearchParams(window.location.search).get("fondo");
      if (pedido === "oscuro" || pedido === "claro") {
        setOscuro(pedido === "oscuro");
        return;
      }
      setOscuro(localStorage.getItem("pdf-oscuro") === "1");
    } catch {
      /* sin almacenamiento: se queda en claro */
    }
  }, []);
  // El truco está aquí: en vez de forzar cada color a mano —que fue el error
  // de la primera versión: se puso el texto en negro pero los fondos siguieron
  // oscuros, y quedó negro sobre azul marino—, se enciende o se apaga el modo
  // oscuro DE LA PÁGINA. Así la cuadrícula pinta sus propios colores, los
  // mismos que ya usa en pantalla, y todo cuadra solo.
  useEffect(() => {
    const html = document.documentElement;
    const teniaOscuro = html.classList.contains("dark");
    html.classList.toggle("dark", oscuro);
    html.classList.toggle("fondo-pdf-oscuro", oscuro);
    html.classList.toggle("fondo-pdf-claro", !oscuro);
    return () => {
      html.classList.toggle("dark", teniaOscuro);
      html.classList.remove("fondo-pdf-oscuro", "fondo-pdf-claro");
    };
  }, [oscuro]);

  // Orientación de la hoja. En el ordenador se respeta lo que se pida aquí;
  // el navegador del MÓVIL, en cambio, guarda siempre en vertical y no hay
  // manera de obligarlo. Por eso, además de poder elegir, el contenido se
  // adapta solo a la hoja que salga (ver los estilos de más abajo).
  // ── El instrumento de quien se lleva el papel (O-86, fase ①) ──
  //
  // 🔴 LEE LA MISMA PREFERENCIA QUE LA PANTALLA COMPLETA (`lectura-transpositor`),
  // no una suya. El trompetista ya eligió «Trompeta» una vez tocando; pedírselo
  // otra vez aquí sería tratar dos pantallas como dos aplicaciones distintas. Y
  // si lo cambia aquí, lo cambia para las dos, que es lo que él espera.
  //
  // Se lee DESPUÉS de montar, como el fondo y la hoja: en el servidor no hay
  // `localStorage`, y leerlo en el estado inicial rompe el primer dibujo.
  const [transpositor, setTranspositor] = useState(TRANSPOSITOR_POR_DEFECTO);
  useEffect(() => {
    // Igual que `?fondo=` y `?hoja=`: se puede forzar por la dirección, para
    // mandar el enlace ya puesto y para comprobarlo sin depender de lo que
    // tenga guardado cada navegador.
    try {
      const pedido = new URLSearchParams(window.location.search).get("instrumento");
      if (pedido && TRANSPOSITORES.some((i) => i.id === pedido)) {
        setTranspositor(pedido);
        return;
      }
    } catch {
      /* sin dirección legible: se usa lo guardado */
    }
    setTranspositor(leerTranspositor());
  }, []);
  const desplazamiento = semitonosDe(transpositor);
  const cambiarInstrumento = (id: string) => {
    setTranspositor(id);
    guardarTranspositor(id);
  };

  // ── Imprimir SIN que el pentagrama salga en blanco (O-86, fase ②) ──
  //
  // 🔴 `abcjs` dibuja DESPUÉS de que cargue la página, y encima se baja sola
  // la primera vez (carga diferida, ~136 KB). Si alguien le da a «Guardar en
  // PDF» antes de que termine, **el PDF sale con los pentagramas en blanco** y
  // no hay ningún error que lo avise: el papel simplemente no los lleva.
  //
  // Por eso el botón no imprime a lo bruto: cuenta cuántos pentagramas tiene
  // que haber, espera a que estén dibujados —hasta 5 segundos— y solo entonces
  // imprime. Si pasan los 5 segundos igualmente imprime: más vale un PDF con
  // los acordes que un botón que no hace nada.
  const [esperandoMelodia, setEsperandoMelodia] = useState(false);
  const pentagramasEsperados = songs.reduce(
    (n, s) => n + (s.melody ? tramosDe(s.melody).filter((tr) => tr.abc).length : 0),
    0
  );
  const imprimir = async () => {
    if (pentagramasEsperados > 0) {
      setEsperandoMelodia(true);
      const hasta = Date.now() + 5000;
      while (Date.now() < hasta) {
        if (document.querySelectorAll(".melodia svg").length >= pentagramasEsperados) break;
        await new Promise((listo) => setTimeout(listo, 120));
      }
      setEsperandoMelodia(false);
    }
    window.print();
  };

  const [vertical, setVertical] = useState(false);
  useEffect(() => {
    try {
      const pedido = new URLSearchParams(window.location.search).get("hoja");
      if (pedido === "vertical" || pedido === "horizontal") {
        setVertical(pedido === "vertical");
        return;
      }
      setVertical(localStorage.getItem("pdf-vertical") === "1");
    } catch {
      /* se queda en horizontal */
    }
  }, []);
  const cambiarHoja = (v: boolean) => {
    setVertical(v);
    try {
      localStorage.setItem("pdf-vertical", v ? "1" : "0");
    } catch {
      /* da igual */
    }
  };

  const cambiarFondo = (v: boolean) => {
    setOscuro(v);
    try {
      localStorage.setItem("pdf-oscuro", v ? "1" : "0");
    } catch {
      /* da igual: solo se pierde la preferencia */
    }
  };

  return (
    <div className={oscuro ? "pdf-oscuro" : "pdf-claro"}>
      <style>{`
        /* Horizontal y SIN margen de papel.
           El margen de la página es papel en blanco que no se puede pintar: por
           mucho fondo oscuro que se ponga, queda un marco blanco alrededor. Se
           deja en cero y el aire se hace por dentro, con relleno de la hoja, que
           SÍ va sobre el fondo. Así el oscuro llega hasta el borde sin tener que
           tocar «Márgenes: Ninguno» a mano en el diálogo de impresión. */
        @page { size: ${vertical ? "portrait" : "landscape"}; margin: 0; }

        /* ⚠️ Aquí había un "@media print and (orientation: portrait)" para
           adaptar las columnas solo. NO se puede usar: al imprimir, la
           orientación que reporta el navegador no coincide con la hoja que sale
           de verdad —se aplicaba al revés y cada canción ocupaba dos páginas
           (7 canciones salían en 11 hojas)—.
           Y tampoco hacen falta: se midió, y en hoja VERTICAL dos columnas
           siguen cabiendo —7 canciones, 7 páginas—, mientras que con una sola
           columna las canciones largas se parten y salen 10. Así que van dos
           columnas siempre; lo único que cambia con la orientación es el tamaño
           de la hoja. */

        .hoja { break-after: page; page-break-after: always; }
        .hoja:last-child { break-after: auto; page-break-after: auto; }
        /* Que no se parta una sección por la mitad entre dos páginas. */
        .seccion { break-inside: avoid; page-break-inside: avoid; }

        /* El fondo va en el <html>: si no, en el PDF sale la hoja con su color
           y el RESTO de la página en blanco — media hoja blanca debajo. */
        html.fondo-pdf-oscuro, html.fondo-pdf-oscuro body { background: #0f172a; }
        html.fondo-pdf-claro,  html.fondo-pdf-claro  body { background: #e2e8f0; }

        /* En papel, el amarillo de las etiquetas no se lee: se oscurece. En
           pantalla oscura se queda como está. */
        html.fondo-pdf-claro .etiqueta { color: #b45309 !important; }

        @media print {
          .no-imprimir { display: none !important; }
          /* Sin esto el navegador quita los fondos al imprimir y el modo
             oscuro no serviría de nada. */
          html, body, .hoja, .hoja * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Cada canción ocupa su hoja entera, para que el color llegue abajo
             y no quede media página en blanco. */
          .hoja {
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            /* ⚠️ NADA de 'min-height: 100vh' aquí. En el ordenador funciona,
               pero el navegador del MÓVIL calcula 'vh' con la pantalla del
               teléfono —alta y estrecha—, no con la hoja: cada canción ocupaba
               más de una página y el PDF salía con el DOBLE de hojas, la mitad
               casi vacías (7 canciones → 14 páginas).
               El fondo no lo necesita: lo pinta el <html>, y eso sí cubre la
               página entera. */
            padding: 8mm 9mm !important;
          }
          /* El envoltorio no debe meter espacio propio: dejaría una franja
             sin color arriba de todo. */
          .envoltorio { padding: 0 !important; }
        }
      `}</style>

      {/* Barra de arriba: no sale en el PDF. */}
      <div className="no-imprimir sticky top-0 z-10 flex flex-nowrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:gap-3 sm:px-4 sm:py-3 dark:border-slate-700 dark:bg-slate-900">
        <Link
          href={backHref}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-bold text-slate-900 dark:text-slate-50">{title}</p>
          {/* Se oculta en pantallas pequeñas: en el móvil se partía en cuatro
              líneas y dejaba la barra enorme. Y decía "horizontal" fijo, aunque
              estuviera elegida la hoja vertical. */}
          <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
            {songs.length} cancion{songs.length !== 1 ? "es" : ""} · una por hoja ·{" "}
            {vertical ? "vertical" : "horizontal"}
          </p>
        </div>

        {/* Fondo del PDF: claro para papel, oscuro para leerlo en el móvil. */}
        <div className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => cambiarFondo(false)}
            title="Fondo claro (para imprimir en papel)"
            className={
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold sm:px-2.5 " +
              (!oscuro ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200")
            }
          >
            <Sun className="h-4 w-4" />
            <span className="hidden sm:inline">Claro</span>
          </button>
          <button
            type="button"
            onClick={() => cambiarFondo(true)}
            title="Fondo oscuro (para leerlo en el teléfono)"
            className={
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold sm:px-2.5 " +
              (oscuro ? "bg-slate-950 text-white shadow-sm ring-1 ring-slate-600" : "text-slate-500 hover:text-slate-800")
            }
          >
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">Oscuro</span>
          </button>
        </div>

        {/* Orientación de la hoja. */}
        <div className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => cambiarHoja(false)}
            title="Hoja horizontal (caben dos columnas)"
            className={
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold sm:px-2.5 " +
              (!vertical
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200")
            }
          >
            <RectangleHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Horizontal</span>
          </button>
          <button
            type="button"
            onClick={() => cambiarHoja(true)}
            title="Hoja vertical (una columna; es como guarda el telefono)"
            className={
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold sm:px-2.5 " +
              (vertical
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200")
            }
          >
            <RectangleVertical className="h-4 w-4" />
            <span className="hidden sm:inline">Vertical</span>
          </button>
        </div>

        {/* El instrumento de quien se lleva el papel (O-86).
            Va antes del botón de guardar a propósito: es lo último que hay que
            decidir **antes** de guardar, y así se lee en ese orden. */}
        <div className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
          {TRANSPOSITORES.map((ins) => (
            <button
              key={ins.id}
              type="button"
              onClick={() => cambiarInstrumento(ins.id)}
              title={ins.ejemplos}
              aria-pressed={ins.id === transpositor}
              className={
                "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold sm:px-2.5 " +
                (ins.id === transpositor
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200")
              }
            >
              {ins.nombre}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void imprimir()}
          disabled={esperandoMelodia}
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:px-4 sm:py-2.5"
        >
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">
            {esperandoMelodia ? "Dibujando la melodía…" : "Guardar en PDF"}
          </span>
          <span className="sm:hidden">{esperandoMelodia ? "…" : "PDF"}</span>
        </button>
      </div>

      <div className="envoltorio w-full p-4">
        {songs.map((song, i) => {
          // Cada canción sale en el tono con el que va a sonar en el culto —no
          // en el suyo original— y, desde O-86, **ya desplazada al instrumento
          // de quien se lleva el papel**.
          //
          // 🔴 La cuenta NO se hace aquí: sale de `lib/tonoLeido.ts`, el mismo
          // sitio que usa la pantalla completa. Copiarla habría dejado dos
          // cuentas vivas, y el día que se separaran el papel diría un tono y
          // la tablet otro — descubriéndose en mitad de un culto.
          const tono = tonoLeido({
            original: song.original_key,
            destino: song.target_key,
            desplazamiento,
          });
          const contenido = song.content
            ? transposeContent(song.content, tono.semitonos, tono.bemoles)
            : "";
          const secciones = contenido ? parseSections(contenido) : [];
          const tramosMelodia = song.melody ? tramosDe(song.melody).filter((tr) => tr.abc) : [];
          // 🔴 El pentagrama necesita el desplazamiento CON SIGNO, no el
          // normalizado a 0..11 que usan los acordes. Para los acordes da
          // igual —un acorde no tiene octava—, pero +10 en una partitura sube
          // casi una octava donde se quería bajar dos semitonos.
          const semitonosMelodia = tono.semitonos > 6 ? tono.semitonos - 12 : tono.semitonos;

          return (
            <article
              key={`${song.id}-${i}`}
              className="hoja mx-auto mb-4 max-w-[1600px] rounded-lg bg-white p-5 text-slate-900 print:mb-0 print:rounded-none dark:bg-slate-950 dark:text-slate-50"
            >
              <header className="mb-3 border-b border-slate-300 pb-2 dark:border-slate-700">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-2xl font-bold">
                    {i + 1}. {song.title}
                  </h2>
                  {/* 🔴 LOS DOS TONOS cuando hay instrumento transpositor (D-28).
                      Si el papel enseñara solo el suyo, el trompetista diría
                      «estamos en E» y el resto «no, en D» — discutiendo el tono
                      en mitad del culto, que es justo lo que esto vino a evitar
                      en la pantalla. En papel el riesgo es mayor: ahí nadie
                      puede tocar un botón para comprobarlo. */}
                  {tono.seLee && (
                    <span className="text-sm font-bold">
                      Tono: {tono.seLee}
                      {tono.suena && (
                        <span className="ml-1 font-normal opacity-70">· suena {tono.suena}</span>
                      )}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs opacity-70">
                  {[song.composer, typeLabel, dateText, title].filter(Boolean).join(" · ")}
                </p>
              </header>

              {secciones.length > 0 ? (
                // Dos columnas en la hoja horizontal: caben más compases sin
                // encoger la letra, que es de lo que se trata al tocar.
                <div className="columnas grid grid-cols-2 items-start gap-x-5 gap-y-2">
                  {secciones.map((sec, j) => (
                    <div key={j} className="seccion">
                      <TablaturePreview notes={sec.content} label={sec.title} dense />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm opacity-60">Esta cancion no tiene acordes escritos.</p>
              )}
              {/* LA MELODÍA (O-86, fase ②).
                  Va DEBAJO de los acordes, no al lado: el papel se lee de
                  arriba abajo y los acordes son lo que se mira tocando. Solo
                  sale si esta canción tiene melodía escrita —hoy, 1 de 87— y si
                  a este rol le toca verla; si no, el PDF queda exactamente
                  igual que antes.
                  🔴 Y se transpone con `tono.semitonos`, EL MISMO número que los
                  acordes: si el pentagrama fuera por su cuenta, el trompetista
                  leería los acordes en un tono y la melodía en otro. */}
              {tramosMelodia.length > 0 && (
                <div className="melodia mt-3 border-t border-slate-300 pt-2 dark:border-slate-700">
                  {tramosMelodia.map((tramo, j) => (
                    <section key={j} className="mb-1">
                      {tramo.titulo && (
                        <h3 className="mb-0.5 text-[0.7rem] font-semibold uppercase tracking-wider opacity-70">
                          {tramo.titulo}
                        </h3>
                      )}
                      <Pentagrama
                        abc={tramo.abc}
                        compas={song.time_signature || "4/4"}
                        tono={song.original_key || "C"}
                        transponer={semitonosMelodia}
                      />
                    </section>
                  ))}
                </div>
              )}
            </article>
          );
        })}

        {songs.length === 0 && (
          <p className="p-8 text-center text-slate-500">Este culto no tiene canciones.</p>
        )}
      </div>
    </div>
  );
}
