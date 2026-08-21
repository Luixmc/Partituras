"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Printer, RectangleHorizontal, RectangleVertical, Sun } from "lucide-react";

import TablaturePreview from "@/components/sheets/TablaturePreview";
import { parseSections } from "@/lib/sections";
import { prefersFlats, semitonesBetween, transposeContent } from "@/lib/music";
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

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:px-4 sm:py-2.5"
        >
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Guardar en PDF</span>
          <span className="sm:hidden">PDF</span>
        </button>
      </div>

      <div className="envoltorio w-full p-4">
        {songs.map((song, i) => {
          // Cada canción sale en el tono con el que va a sonar en el culto, no
          // en el suyo original.
          const semis = semitonesBetween(song.original_key, song.target_key) ?? 0;
          const bemoles = prefersFlats(song.target_key);
          const contenido = song.content
            ? transposeContent(song.content, semis, bemoles)
            : "";
          const secciones = contenido ? parseSections(contenido) : [];
          const tono = song.target_key || song.original_key;

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
                  {tono && <span className="text-sm font-bold">Tono: {tono}</span>}
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
