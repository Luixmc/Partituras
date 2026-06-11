"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Ajusta la altura del textarea al contenido escrito. */
export function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
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
