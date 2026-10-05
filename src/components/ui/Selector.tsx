"use client";

// El menú desplegable de la página, en lugar del `<select>` del navegador (O-91).
//
// Se usa igual que un `<select>` controlado: `value` y `onChange(valor)`, y las
// opciones en una lista —con grupos si hacen falta, como «Mayores / Menores»—.
// Lo que se conserva del `<select>`, porque los músicos ya lo usan así:
//   · el teclado: ↑ ↓ Inicio Fin para moverse, Intro o Espacio para elegir,
//     Esc para salir, y una letra salta a la primera opción que empieza por ella;
//   · las opciones desactivadas se ven pero no se pueden elegir;
//   · dentro de un `<label>`, pulsar el texto también lo abre.
// La caja que se abre (y la hoja del teléfono) es `Flotante`.

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import Flotante from "@/components/ui/Flotante";
import { cn } from "@/lib/utils";

export type OpcionSelector = { value: string; label: string; disabled?: boolean };
export type GrupoSelector = { grupo: string; opciones: OpcionSelector[] };

type Props = {
  value: string;
  onChange: (valor: string) => void;
  options: (OpcionSelector | GrupoSelector)[];
  /** Clases del BOTÓN: el borde, el fondo y el ancho de cada sitio se quedan como estaban. */
  className?: string;
  title?: string;
  "aria-label"?: string;
  disabled?: boolean;
  /** Lo que dice el botón si el valor no es ninguna opción. */
  placeholder?: string;
};

const esGrupo = (o: OpcionSelector | GrupoSelector): o is GrupoSelector => "grupo" in o;

/** Para el salto por letra: sin tildes y sin mayúsculas. */
const plano = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function Selector({
  value,
  onChange,
  options,
  className,
  title,
  "aria-label": ariaLabel,
  disabled = false,
  placeholder = "Elegir…",
}: Props) {
  const id = useId();
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);

  // Las opciones en fila, sin los grupos: es sobre lo que se mueve el teclado.
  const planas = useMemo(
    () => options.flatMap((o) => (esGrupo(o) ? o.opciones : [o])),
    [options]
  );
  const elegida = planas.find((o) => o.value === value);
  // Las mismas opciones con su posición en `planas`, para pintarlas en sus grupos.
  const filas = useMemo(() => {
    type Fila = { o: OpcionSelector; i: number };
    let i = -1;
    return options.map((o): Fila | { grupo: string; opciones: Fila[] } =>
      esGrupo(o)
        ? { grupo: o.grupo, opciones: o.opciones.map((op) => ({ o: op, i: ++i })) }
        : { o, i: ++i }
    );
  }, [options]);

  const cerrar = useCallback(() => {
    setAbierto(false);
    boton.current?.focus();
  }, []);

  const cerrarFuera = useCallback(() => setAbierto(false), []);

  const abrir = () => {
    if (disabled) return;
    const i = planas.findIndex((o) => o.value === value && !o.disabled);
    setActivo(i >= 0 ? i : planas.findIndex((o) => !o.disabled));
    setAbierto(true);
  };

  const elegir = (o: OpcionSelector) => {
    if (o.disabled) return;
    if (o.value !== value) onChange(o.value);
    cerrar();
  };

  // Al abrir, el foco va a la lista para que el teclado funcione.
  // ⚠️ En el cuadro SIGUIENTE: en el primero la caja aún está invisible
  // mientras `Flotante` la coloca, y un elemento invisible no toma el foco
  // (se quedaba en el botón y las flechas volvían a abrir el menú).
  useEffect(() => {
    if (!abierto) return;
    const raf = requestAnimationFrame(() => lista.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [abierto]);

  // La opción señalada siempre a la vista.
  useEffect(() => {
    if (!abierto || activo < 0) return;
    document.getElementById(`${id}-${activo}`)?.scrollIntoView({ block: "nearest" });
  }, [abierto, activo, id]);

  /** La siguiente opción que se puede elegir, en la dirección dada. */
  const mover = (desde: number, paso: 1 | -1) => {
    for (let i = desde + paso; i >= 0 && i < planas.length; i += paso) {
      if (!planas[i].disabled) return i;
    }
    return desde;
  };

  const teclaLista = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActivo((a) => mover(a, 1));
        return;
      case "ArrowUp":
        e.preventDefault();
        setActivo((a) => mover(a, -1));
        return;
      case "Home":
        e.preventDefault();
        setActivo(mover(-1, 1));
        return;
      case "End":
        e.preventDefault();
        setActivo(mover(planas.length, -1));
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (planas[activo]) elegir(planas[activo]);
        return;
      case "Escape":
        e.preventDefault();
        cerrar();
        return;
      case "Tab":
        setAbierto(false);
        return;
    }
    // Una letra: salta a la siguiente opción que empiece por ella.
    if (e.key.length === 1 && /\S/.test(e.key)) {
      const letra = plano(e.key);
      for (let k = 1; k <= planas.length; k++) {
        const i = (activo + k) % planas.length;
        if (!planas[i].disabled && plano(planas[i].label).startsWith(letra)) {
          setActivo(i);
          break;
        }
      }
    }
  };

  const pintar = ({ o, i }: { o: OpcionSelector; i: number }) => {
    const sel = o.value === value;
    return (
      <div
        key={`${o.value}-${i}`}
        id={`${id}-${i}`}
        role="option"
        aria-selected={sel}
        aria-disabled={o.disabled || undefined}
        onPointerMove={() => !o.disabled && activo !== i && setActivo(i)}
        onClick={() => elegir(o)}
        className={cn(
          "flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 sm:py-1.5",
          o.disabled && "cursor-default opacity-40",
          i === activo && !o.disabled && "bg-brand-50 dark:bg-brand-950/60",
          sel ? "font-semibold text-brand-700 dark:text-brand-200" : "text-slate-700 dark:text-slate-200"
        )}
      >
        <Check className={cn("h-4 w-4 shrink-0", sel ? "opacity-100" : "opacity-0")} aria-hidden="true" />
        <span className="whitespace-nowrap">{o.label}</span>
      </div>
    );
  };

  return (
    <>
      <button
        ref={boton}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={abierto ? `${id}-lista` : undefined}
        aria-label={ariaLabel}
        title={title}
        disabled={disabled}
        onClick={() => (abierto ? cerrar() : abrir())}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
            e.preventDefault();
            abrir();
          }
        }}
        className={cn(
          "inline-flex items-center justify-between gap-1.5 text-left disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <span className="truncate">{elegida?.label ?? placeholder}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 opacity-60 transition-transform", abierto && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <Flotante
        abierto={abierto}
        ancla={boton}
        panel={panel}
        // Tocar fuera cierra SIN devolver el foco al botón: quien tocó otra
        // cosa quiere estar allí. Esc y elegir sí lo devuelven.
        onCerrar={cerrarFuera}
        titulo={ariaLabel ?? title}
        anchoDelAncla
      >
        <div
          ref={lista}
          id={`${id}-lista`}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel ?? title}
          aria-activedescendant={activo >= 0 ? `${id}-${activo}` : undefined}
          onKeyDown={teclaLista}
          className="outline-none"
        >
          {filas.map((o, g) =>
            "grupo" in o ? (
              <div key={`g-${g}`} role="group" aria-label={o.grupo}>
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {o.grupo}
                </p>
                {o.opciones.map(pintar)}
              </div>
            ) : (
              pintar(o)
            )
          )}
        </div>
      </Flotante>
    </>
  );
}
