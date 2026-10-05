"use client";

// El calendario de la página, en lugar del `<input type="date">` (O-91).
//
// Isaac lo pidió junto con los menús (2026-10-04: «también»): el de fecha lo
// dibuja el navegador, y en el teléfono es la ruleta del sistema.
//
// El valor es el MISMO texto que daba el `<input type="date">` —`AAAA-MM-DD`, o
// vacío si no hay fecha—, así que lo que se guarda en la base no cambia.
// 📌 Las fechas se arman con `new Date(año, mes, día)` (hora local) y nunca con
// `new Date("2026-10-04")`, que es medianoche UTC: en Colombia eso es el día
// ANTERIOR a las 7 de la noche. Es lo mismo que cuida `formatServiceDate`.
//
// Teclado: ← → un día, ↑ ↓ una semana, RePág/AvPág un mes, Intro elige, Esc sale.

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import Flotante from "@/components/ui/Flotante";
import { cn } from "@/lib/utils";

type Props = {
  value: string; // "AAAA-MM-DD" o ""
  onChange: (valor: string) => void;
  className?: string;
  "aria-label"?: string;
  placeholder?: string;
};

// La semana empieza el DOMINGO, como en los calendarios de Colombia.
const DIAS = ["D", "L", "M", "X", "J", "V", "S"];

const aTexto = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function deTexto(v: string): Date | null {
  const [y, m, d] = v.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}

const mismoDia = (a: Date | null, b: Date | null) => !!a && !!b && aTexto(a) === aTexto(b);

function sumarDias(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** El mismo día en otro mes; si no existe (31 de febrero), el último del mes. */
function sumarMeses(d: Date, n: number) {
  const ultimo = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), ultimo));
}

export default function SelectorFecha({
  value,
  onChange,
  className,
  "aria-label": ariaLabel = "Fecha",
  placeholder = "Sin fecha",
}: Props) {
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);
  const elegida = deTexto(value);
  // El día que tiene el foco del teclado; el mes que se ve es el suyo.
  const [foco, setFoco] = useState<Date>(() => elegida ?? new Date());

  const cerrar = useCallback(() => {
    setAbierto(false);
    boton.current?.focus();
  }, []);
  const cerrarFuera = useCallback(() => setAbierto(false), []);

  const abrir = () => {
    const hoy = new Date();
    setFoco(elegida ?? new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));
    setAbierto(true);
  };

  const elegir = (d: Date | null) => {
    onChange(d ? aTexto(d) : "");
    cerrar();
  };

  // El foco sigue al día señalado.
  // En el cuadro siguiente, por lo mismo que en `Selector`: al abrir, la caja
  // está invisible un instante mientras se coloca y no admite el foco.
  useEffect(() => {
    if (!abierto) return;
    const raf = requestAnimationFrame(() =>
      panel.current
        ?.querySelector<HTMLButtonElement>(`[data-dia="${aTexto(foco)}"]`)
        ?.focus({ preventScroll: true })
    );
    return () => cancelAnimationFrame(raf);
  }, [abierto, foco]);

  const tecla = (e: React.KeyboardEvent) => {
    const mov: Record<string, () => Date> = {
      ArrowLeft: () => sumarDias(foco, -1),
      ArrowRight: () => sumarDias(foco, 1),
      ArrowUp: () => sumarDias(foco, -7),
      ArrowDown: () => sumarDias(foco, 7),
      PageUp: () => sumarMeses(foco, -1),
      PageDown: () => sumarMeses(foco, 1),
    };
    if (mov[e.key]) {
      e.preventDefault();
      setFoco(mov[e.key]());
    } else if ((e.key === "Enter" || e.key === " ") && (e.target as HTMLElement).dataset.dia) {
      // Intro o Espacio sobre un día lo elige. Se hace aquí y no dejando que el
      // botón lo convierta en clic: así es igual en todos los navegadores.
      e.preventDefault();
      elegir(foco);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cerrar();
    }
  };

  // Las celdas del mes: desde el domingo de la semana del día 1.
  const primero = new Date(foco.getFullYear(), foco.getMonth(), 1);
  const inicio = sumarDias(primero, -primero.getDay());
  const semanas = Math.ceil((primero.getDay() + new Date(foco.getFullYear(), foco.getMonth() + 1, 0).getDate()) / 7);
  const celdas = Array.from({ length: semanas * 7 }, (_, i) => sumarDias(inicio, i));
  const hoy = new Date();
  // «Octubre de 2026»: mayúscula solo la primera (con `capitalize` salía «De»).
  const mesLargo = foco.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  const mes = mesLargo.charAt(0).toUpperCase() + mesLargo.slice(1);

  const texto = elegida
    ? elegida.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : placeholder;

  return (
    <>
      <button
        ref={boton}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-label={`${ariaLabel}: ${texto}`}
        onClick={() => (abierto ? cerrar() : abrir())}
        className={cn("inline-flex items-center justify-between gap-2 text-left", className)}
      >
        <span className={cn("truncate", !elegida && "text-slate-400 dark:text-slate-500")}>{texto}</span>
        <CalendarDays className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
      </button>

      <Flotante abierto={abierto} ancla={boton} panel={panel} onCerrar={cerrarFuera} titulo={ariaLabel}>
        <div role="dialog" aria-label={ariaLabel} onKeyDown={tecla} className="mx-auto w-full max-w-xs p-2">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setFoco(sumarMeses(foco, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{mes}</p>
            <button
              type="button"
              onClick={() => setFoco(sumarMeses(foco, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center" role="grid">
            {DIAS.map((d) => (
              <span key={d} className="py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500" role="columnheader">
                {d}
              </span>
            ))}
            {celdas.map((d) => {
              const delMes = d.getMonth() === foco.getMonth();
              const sel = mismoDia(d, elegida);
              const esHoy = mismoDia(d, hoy);
              return (
                <button
                  key={aTexto(d)}
                  type="button"
                  data-dia={aTexto(d)}
                  tabIndex={mismoDia(d, foco) ? 0 : -1}
                  onClick={() => elegir(d)}
                  aria-pressed={sel}
                  aria-label={d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
                  className={cn(
                    "h-9 rounded-lg text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500",
                    sel
                      ? "bg-brand-600 font-semibold text-white"
                      : delMes
                        ? "text-slate-700 hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-brand-950/60"
                        : "text-slate-300 hover:bg-slate-50 dark:text-slate-600 dark:hover:bg-slate-700/50",
                    esHoy && !sel && "font-bold text-brand-600 ring-1 ring-brand-300 dark:text-brand-300 dark:ring-brand-700"
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 dark:border-slate-700">
            <button
              type="button"
              onClick={() => elegir(null)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Sin fecha
            </button>
            <button
              type="button"
              onClick={() => elegir(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()))}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950/60"
            >
              Hoy
            </button>
          </div>
        </div>
      </Flotante>
    </>
  );
}
