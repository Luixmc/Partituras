"use client";

// La caja que se abre al pulsar un menú (`Selector`) o una fecha (`SelectorFecha`).
//
// 🔴 O-91 (2026-10-04) · Isaac: «todos los menus de la pagina tenga el diseño de
// la pagina no del navegador, tanto en pc como en teléfono». Un `<select>` o un
// `<input type="date">` abren una lista que **dibuja el navegador**: en oscuro
// salía con letra blanca sobre blanco (T-12), en el teléfono es la ruleta del
// sistema, y en cada aparato se ve distinto. Esta caja la dibuja la página.
//
// Cómo se comporta, que es lo que no se ve leyendo el JSX:
//   · En el PC sale PEGADA al botón, debajo; si abajo no cabe y arriba hay más
//     sitio, encima. Se recoloca al desplazar la página o cambiar el tamaño.
//   · En el TELÉFONO (menos de 640 px) sale como HOJA DESDE ABAJO, con el
//     título del menú y el fondo oscurecido: una lista pegada a un botón chico
//     no se acierta con el dedo, y la hoja es lo que la gente ya conoce.
//   · Se cierra tocando fuera o con Esc, y el foco vuelve al botón.
//   · Va en un portal al `<body>` y con `position: fixed`: así no la recorta
//     ninguna tarjeta con `overflow: hidden` (la barra del culto lo tiene).

import { useEffect, useLayoutEffect, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

const TELEFONO = "(max-width: 639px)";

/** ¿Pantalla de teléfono? Se recalcula si gira o cambia el tamaño. */
export function useEsTelefono(): boolean {
  const [es, setEs] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(TELEFONO);
    const cambia = () => setEs(mq.matches);
    cambia();
    mq.addEventListener("change", cambia);
    return () => mq.removeEventListener("change", cambia);
  }, []);
  return es;
}

type Props = {
  abierto: boolean;
  /** El botón que la abre: se coloca junto a él y no cuenta como «fuera». */
  ancla: RefObject<HTMLElement>;
  /** La caja misma, para que quien la usa pueda mover el foco dentro. */
  panel: RefObject<HTMLDivElement>;
  onCerrar: () => void;
  /** Encabezado de la hoja del teléfono (en el PC no se enseña). */
  titulo?: string;
  /** Igualar al menos el ancho del botón (la lista sí; el calendario no). */
  anchoDelAncla?: boolean;
  children: ReactNode;
};

type Sitio = { top?: number; bottom?: number; left: number; minWidth?: number; maxHeight: number };

export default function Flotante({
  abierto,
  ancla,
  panel,
  onCerrar,
  titulo,
  anchoDelAncla = false,
  children,
}: Props) {
  const telefono = useEsTelefono();
  const [sitio, setSitio] = useState<Sitio | null>(null);

  // Colocarla junto al botón (solo en el PC).
  useLayoutEffect(() => {
    if (!abierto || telefono) return;
    const colocar = () => {
      const a = ancla.current;
      if (!a) return;
      const r = a.getBoundingClientRect();
      const abajo = window.innerHeight - r.bottom - 8;
      const arriba = r.top - 8;
      const haciaArriba = abajo < 240 && arriba > abajo;
      const ancho = panel.current?.offsetWidth ?? 0;
      // Que no se salga por la derecha: si no cabe, se corre a la izquierda.
      const left = Math.max(8, Math.min(r.left, window.innerWidth - 8 - ancho));
      setSitio({
        ...(haciaArriba ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
        left,
        minWidth: anchoDelAncla ? r.width : undefined,
        maxHeight: Math.max(160, Math.min(340, haciaArriba ? arriba : abajo)),
      });
    };
    colocar();
    // Una segunda vez cuando ya se sabe su ancho de verdad.
    const raf = requestAnimationFrame(colocar);
    window.addEventListener("resize", colocar);
    window.addEventListener("scroll", colocar, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", colocar);
      window.removeEventListener("scroll", colocar, true);
    };
  }, [abierto, telefono, ancla, panel, anchoDelAncla]);

  // Tocar fuera la cierra. En el teléfono lo hace el fondo oscurecido.
  useEffect(() => {
    if (!abierto || telefono) return;
    const fuera = (e: PointerEvent) => {
      const t = e.target as Node;
      if (ancla.current?.contains(t) || panel.current?.contains(t)) return;
      onCerrar();
    };
    document.addEventListener("pointerdown", fuera, true);
    return () => document.removeEventListener("pointerdown", fuera, true);
  }, [abierto, telefono, ancla, panel, onCerrar]);

  if (!abierto || typeof document === "undefined") return null;

  // 🔴 En PANTALLA COMPLETA solo se ve el elemento que la pidió —la
  // presentación pide la suya sobre su caja, no sobre la página—, y lo que
  // cuelgue del `<body>` queda detrás, invisible. Ahí van dos de estos menús
  // (los colores de sección y el instrumento): se cuelga de ese elemento.
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  const destino = (document.fullscreenElement ?? doc.webkitFullscreenElement ?? document.body) as HTMLElement;

  if (telefono) {
    return createPortal(
      <>
        <div
          className="fixed inset-0 z-[200] bg-slate-900/50"
          onPointerDown={(e) => {
            e.preventDefault();
            onCerrar();
          }}
          aria-hidden="true"
        />
        <div
          ref={panel}
          className="fixed inset-x-0 bottom-0 z-[201] flex max-h-[75vh] flex-col rounded-t-2xl border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true" />
          {titulo && (
            <p className="shrink-0 px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {titulo}
            </p>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">{children}</div>
        </div>
      </>,
      destino
    );
  }

  return createPortal(
    <div
      ref={panel}
      style={{
        position: "fixed",
        top: sitio?.top,
        bottom: sitio?.bottom,
        left: sitio?.left ?? -9999,
        minWidth: sitio?.minWidth,
        maxHeight: sitio?.maxHeight,
        maxWidth: "calc(100vw - 16px)",
        // Hasta saber dónde va, invisible: si no, parpadea en la esquina.
        visibility: sitio ? "visible" : "hidden",
      }}
      className="z-[201] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 text-sm text-slate-800 shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    >
      {children}
    </div>,
    destino
  );
}
