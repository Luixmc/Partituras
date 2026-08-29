"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Ajusta la altura del textarea al contenido escrito.
 *
 * 🔴 EL PASO QUE PARECE DE MÁS Y ES EL IMPORTANTE: guardar y devolver el
 * scroll. Para medir cuánto ocupa el texto hay que **colapsar el campo un
 * instante** (`height: auto`) y leer su `scrollHeight`. En ese instante la
 * página se encoge, y si el campo era más alto que la pantalla, **el navegador
 * reajusta el scroll y te sube al principio**.
 *
 * Isaac lo vio el 2026-08-28 escribiendo letras: *«hay veces que se mueve la
 * pantalla y me sube a lo más arriba»*. Y era «a veces» porque solo pasa
 * cuando el campo ya no cabe entero — o sea, **cuanto más has escrito, más te
 * salta**, que es justo cuando peor viene.
 *
 * ⚠️ Y se devuelve el scroll de los ANCESTROS, no el de la ventana: en el panel
 * de esta app el `<main>` lleva `overflow-hidden` y quien se desplaza es un
 * contenedor de dentro. Mirar solo `window.scrollY` no habría arreglado nada.
 *
 * Todo va seguido y sin esperas: el navegador no llega a pintar el estado
 * colapsado, así que no se ve ningún parpadeo.
 */
export function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;

  // Quién se está desplazando ahora mismo por encima de este campo.
  const guardados: [Element, number][] = [];
  for (let nodo = el.parentElement; nodo; nodo = nodo.parentElement) {
    if (nodo.scrollTop > 0) guardados.push([nodo, nodo.scrollTop]);
  }
  const ventana = window.scrollY;

  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;

  for (const [nodo, arriba] of guardados) nodo.scrollTop = arriba;
  if (ventana) window.scrollTo(0, ventana);
}

/**
 * Textarea que crece automáticamente a lo alto según el texto escrito (sin
 * scroll interno ni tirador de redimensión). Reenvía la ref al <textarea>.
 */
const AutoTextarea = forwardRef<HTMLTextAreaElement, Props>(function AutoTextarea(
  { onInput, value, style, ...rest },
  ref
) {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

  // Re-ajusta cuando cambia el valor (también ante cambios programáticos).
  useEffect(() => {
    autoGrow(innerRef.current);
  }, [value]);

  return (
    <textarea
      ref={innerRef}
      value={value}
      onInput={(e) => {
        autoGrow(e.currentTarget);
        onInput?.(e);
      }}
      style={{ overflow: "hidden", resize: "none", ...style }}
      {...rest}
    />
  );
});

export default AutoTextarea;
