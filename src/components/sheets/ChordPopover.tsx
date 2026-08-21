"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import PianoDiagram from "@/components/sheets/PianoDiagram";
import BassDiagram from "@/components/sheets/BassDiagram";
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
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  if (!montado) return null;

  const acorde = leerAcorde(escrito, bemoles);
  if (!acorde) return null;

  // Se coloca debajo del acorde y centrado en él, pero sin salirse por los
  // lados ni por abajo: en el móvil un acorde del borde derecho dejaría medio
  // panel fuera de la pantalla.
  const margen = 8;
  const izquierda = Math.min(
    Math.max(margen, ancla.left + ancla.width / 2 - ANCHO / 2),
    window.innerWidth - ANCHO - margen
  );
  const cabeDebajo = ancla.bottom + 260 < window.innerHeight;
  const arriba = cabeDebajo ? ancla.bottom + 6 : Math.max(margen, ancla.top - 266);

  return createPortal(
    <>
      {/* Capa para cerrar al tocar fuera. Transparente: no oscurece la canción,
          que es lo que el músico está leyendo. */}
      <div className="fixed inset-0 z-[60]" onClick={onCerrar} aria-hidden />
      <div
        role="dialog"
        aria-label={`Cómo se toca ${escrito}`}
        className="fixed z-[61] rounded-xl bg-white p-3 shadow-xl ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
        style={{ left: izquierda, top: arriba, width: ANCHO }}
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

        <PianoDiagram acorde={acorde} className="mx-auto" />

        <div className="mt-3 text-xs text-slate-500">bajo: {acorde.bajo}</div>
        <BassDiagram acorde={acorde} className="mt-1" />
      </div>
    </>,
    document.body
  );
}
