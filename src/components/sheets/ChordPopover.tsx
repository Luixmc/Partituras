"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import PianoDiagram from "@/components/sheets/PianoDiagram";
import BassDiagram from "@/components/sheets/BassDiagram";
import GuitarDiagram from "@/components/sheets/GuitarDiagram";
import { posicionDe } from "@/lib/guitarra";
import { leerAcorde } from "@/lib/acordes";

// ─────────────────────────────────────────────────────────────
// Pulsas un acorde de la cuadrícula y sale cómo se toca, flotando
// justo al lado — como en CifraClub, que es lo que pidió Isaac el
// 2026-08-21 enseñando una captura.
//
// Va por CONTEXTO y no por props porque el acorde está enterrado seis
// niveles dentro de `TablaturePreview` (sección → compás → grupo de
// ligadura → grupo de vigas → celda). Pasar la función a mano por toda
// esa cadena obligaría a tocar cada uno de esos componentes.
//
// Y se dibuja con un PORTAL al `body`: los compases tienen
// `overflow: hidden` para recortar lo que sobra, y dentro de ahí el
// desplegable saldría cortado.
// ─────────────────────────────────────────────────────────────

type Abrir = (escrito: string, ancla: DOMRect) => void;

const Ctx = createContext<Abrir | null>(null);

/** Lo usa la celda del acorde. Devuelve `null` si los acordes no son pulsables. */
export function useAbrirAcorde() {
  return useContext(Ctx);
}

type Estado = { escrito: string; ancla: DOMRect } | null;

/** Los instrumentos del desplegable, en el orden en que se ensenan. */
type Instrumento = "piano" | "bajo" | "guitarra";
const INSTRUMENTOS: { id: Instrumento; nombre: string }[] = [
  { id: "piano",    nombre: "Piano" },
  { id: "bajo",     nombre: "Bajo" },
  { id: "guitarra", nombre: "Guitarra" },
];

// La eleccion se guarda POR MUSICO, en su navegador: es preferencia de quien
// lee, no de la cancion, asi que no toca la base de datos. Es lo mismo que ya
// hacen el tamano de letra (D-09b) y el modo de leer las columnas (O-26).
const CLAVE_INSTRUMENTO = "acorde-instrumento";

function leerInstrumento(): Instrumento | null {
  try {
    const v = window.localStorage.getItem(CLAVE_INSTRUMENTO);
    return INSTRUMENTOS.some((i) => i.id === v) ? (v as Instrumento) : null;
  } catch {
    return null; // ventana privada o almacenamiento bloqueado: se sigue sin guardar
  }
}

function guardarInstrumento(id: Instrumento) {
  try {
    window.localStorage.setItem(CLAVE_INSTRUMENTO, id);
  } catch {
    /* almacenamiento lleno o bloqueado */
  }
}

/**
 * Hasta donde puede llegar el desplegable por abajo (O-41).
 *
 * Devuelve la parte de arriba de lo que haya pegado al fondo -marcado con
 * `data-suelo`-, o el alto de la ventana si no hay nada: pantalla completa,
 * impresion, o el ordenador, donde la barra de abajo no existe.
 */
function suelo(): number {
  const vh = window.innerHeight;
  let tope = vh;
  document.querySelectorAll<HTMLElement>("[data-suelo]").forEach((el) => {
    const r = el.getBoundingClientRect();
    // Solo cuenta si se ve y esta de verdad abajo: un elemento apagado por CSS
    // (`md:hidden`) mide 0 y no puede hundir el suelo hasta arriba del todo.
    if (r.height > 0 && r.top > vh / 2) tope = Math.min(tope, r.top);
  });
  return tope;
}

export function ChordPopoverProvider({
  children,
  bemoles = false,
  activo = true,
}: {
  children: ReactNode;
  /** La canción va en bemoles: `Cm7` se lee «C Eb G Bb», no «C D# G A#». */
  bemoles?: boolean;
  /** En edición y al imprimir se apaga: ahí el clic es para otra cosa. */
  activo?: boolean;
}) {
  const [estado, setEstado] = useState<Estado>(null);
  const abrir = useCallback<Abrir>((escrito, ancla) => {
    setEstado((a) => (a && a.escrito === escrito && a.ancla.top === ancla.top ? null : { escrito, ancla }));
  }, []);
  const cerrar = useCallback(() => setEstado(null), []);

  // Se cierra con Escape y al rodar la página: el desplegable va anclado a una
  // posición medida, así que al desplazarse dejaría de apuntar a su acorde.
  useEffect(() => {
    if (!estado) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", tecla);
    window.addEventListener("scroll", cerrar, true);
    window.addEventListener("resize", cerrar);
    return () => {
      window.removeEventListener("keydown", tecla);
      window.removeEventListener("scroll", cerrar, true);
      window.removeEventListener("resize", cerrar);
    };
  }, [estado, cerrar]);

  return (
    <Ctx.Provider value={activo ? abrir : null}>
      {children}
      {estado && <Panel escrito={estado.escrito} ancla={estado.ancla} bemoles={bemoles} onCerrar={cerrar} />}
    </Ctx.Provider>
  );
}

const ANCHO = 300;

function Panel({
  escrito,
  ancla,
  bemoles,
  onCerrar,
}: {
  escrito: string;
  ancla: DOMRect;
  bemoles: boolean;
  onCerrar: () => void;
}) {
  const cajaRef = useRef<HTMLDivElement>(null);
  const acorde = leerAcorde(escrito);

  // ── Dónde se coloca ──
  //
  // 🔴 Se MIDE, no se estima. Antes había un `260` a ojo —la altura que
  // tenía cuando solo llevaba piano y bajo—, y al añadir la guitarra el
  // panel creció y **se salía por debajo de la pantalla**: los acordes de
  // la mitad de abajo de la canción enseñaban el diagrama cortado. Lo vio
  // Isaac (2026-08-21).
  //
  // Un número fijo para la altura de algo que crece **caduca en cuanto
  // alguien le añade contenido**, y falla en silencio.
  const [sitio, setSitio] = useState<{ left: number; top: number; maxAlto: number } | null>(null);

  // Que instrumento se esta viendo (O-42). Arranca en piano y el guardado se
  // lee ya en el navegador: leerlo en el estado inicial romperia el render del
  // servidor, donde no hay `localStorage`. Mismo cuidado que en O-26.
  const [instrumento, setInstrumento] = useState<Instrumento>("piano");
  useEffect(() => {
    const guardado = leerInstrumento();
    if (guardado) setInstrumento(guardado);
  }, []);

  function elegirInstrumento(id: Instrumento) {
    setInstrumento(id);
    guardarInstrumento(id);
  }

  useLayoutEffect(() => {
    const caja = cajaRef.current;
    if (!caja) return;

    const margen = 8;
    const vw = window.innerWidth;
    // El suelo NO es el alto de la ventana (O-41). Abajo hay cosas que no son
    // la ventana: la barra de navegacion del movil y el control flotante de
    // lectura -el del 90% y el sol-. El panel les caia encima y tapaba botones
    // que ya no se podian usar; lo vio Isaac con dos capturas, una del telefono
    // y otra del PC con la ventana a media pantalla.
    //
    // Se MIDE en vez de restar un numero a ojo: la barra del movil no esta en
    // el ordenador, el control flotante no esta en pantalla completa, y el
    // `safe-area` del iPhone cambia la altura. Un numero fijo acierta en una
    // pantalla y falla en las otras tres.
    const vh = suelo();
    // `scrollHeight` y no `offsetHeight`: lo que mide es la altura NATURAL,
    // sin recortar por el `max-height` que se le pone justo después.
    const alto = caja.scrollHeight;
    const maxAlto = vh - margen * 2;

    const left = Math.min(
      Math.max(margen, ancla.left + ancla.width / 2 - ANCHO / 2),
      Math.max(margen, vw - ANCHO - margen)
    );

    // Debajo si cabe; si no, encima; y si no cabe en ninguno de los dos
    // —una pantalla baja, o un móvil en horizontal—, pegado abajo y con
    // desplazamiento propio. Nunca cortado.
    const debajo = vh - ancla.bottom - margen;
    const encima = ancla.top - margen;
    const top =
      alto <= debajo
        ? ancla.bottom + 6
        : alto <= encima
          ? ancla.top - alto - 6
          : Math.max(margen, vh - Math.min(alto, maxAlto) - margen);

    setSitio({ left, top, maxAlto });
  }, [ancla, escrito, instrumento]);

  // Las salidas tempranas van DESPUÉS de todos los hooks, nunca en medio.
  if (!acorde) return null;

  // La guitarra solo se ofrece si se sabe la postura: `posicionDe` devuelve
  // null cuando la calidad no tiene forma, y una postura inventada la tocaria
  // alguien en un culto.
  const hayGuitarra = Boolean(posicionDe(acorde));

  return createPortal(
    <>
      {/* Capa para cerrar al tocar fuera. Transparente: no oscurece la canción,
          que es lo que el músico está leyendo. */}
      <div className="fixed inset-0 z-[60]" onClick={onCerrar} aria-hidden />
      <div
        role="dialog"
        aria-label={`Cómo se toca ${escrito}`}
        className="fixed z-[61] rounded-xl bg-white p-3 shadow-xl ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
        ref={cajaRef}
        style={{
          left: sitio?.left ?? 0,
          top: sitio?.top ?? 0,
          width: ANCHO,
          maxHeight: sitio?.maxAlto,
          overflowY: "auto",
          // Hasta que no está medido no se enseña, para que no se vea saltar.
          visibility: sitio ? "visible" : "hidden",
        }}
      >
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="font-display text-lg leading-none text-slate-800 dark:text-slate-100">{escrito}</span>
          <span className="truncate text-xs text-slate-500">
            {acorde.desconocida ? "forma desconocida" : acorde.notas.join(" · ")}
          </span>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="-mr-1 -mt-1 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Las pestañas de instrumento (O-42).

            Antes se apilaban los TRES diagramas. El hermano de Isaac propuso
            elegir el instrumento cada vez; Isaac no lo veía por el paso extra.
            Los dos tenían razón en una mitad: sobra información —un músico
            toca UN instrumento— pero elegir cada vez son dos toques por
            acorde, y un acorde se mira docenas de veces en un culto.

            Así que se ve UNO y **la elección se guarda en el navegador de cada
            músico**: el guitarrista la pone una vez y a partir de ahí pulsa un
            acorde y ve la guitarra, directamente, siempre. Es lo mismo que ya
            hacen el tamaño de letra y el modo de leer las columnas.

            🔴 Y de paso el panel pasa de tres diagramas a uno, que es lo que
            hacía que se saliera de la pantalla (O-41). */}
        <div className="mb-2 flex gap-1" role="tablist" aria-label="Instrumento">
          {INSTRUMENTOS.map((ins) => {
            // La guitarra solo se ofrece si se sabe la postura: `posicionDe`
            // devuelve null cuando la calidad no tiene forma, y una postura
            // inventada la tocaría alguien en un culto.
            if (ins.id === "guitarra" && !hayGuitarra) return null;
            const activo = ins.id === instrumento;
            return (
              <button
                key={ins.id}
                type="button"
                role="tab"
                aria-selected={activo}
                onClick={() => elegirInstrumento(ins.id)}
                className={`flex-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                  activo
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                }`}
              >
                {ins.nombre}
              </button>
            );
          })}
        </div>

        {instrumento === "piano" && <PianoDiagram acorde={acorde} className="mx-auto" />}

        {instrumento === "bajo" && (
          <>
            <div className="text-xs text-slate-500">bajo: {acorde.bajo}</div>
            <BassDiagram acorde={acorde} className="mt-1" />
          </>
        )}

        {instrumento === "guitarra" && hayGuitarra && (
          <GuitarDiagram acorde={acorde} className="mx-auto" />
        )}
      </div>
    </>,
    // 🔴 A `document.fullscreenElement` cuando lo hay, y NO siempre al
    // `body`. La pantalla completa de verdad —la del navegador— solo
    // enseña el subárbol del elemento al que se le pidió; un portal al
    // `body` queda FUERA de ese subárbol, así que el panel existe y es
    // invisible. Isaac lo vio con la cuenta de lector el 2026-08-21, y
    // justo en la pantalla que se usa tocando (O-30).
    document.fullscreenElement ?? document.body
  );
}
