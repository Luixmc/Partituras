"use client";

// ─────────────────────────────────────────────────────────────
// El PENTAGRAMA de verdad: dibuja la melodía grabada como una partitura.
//
// Isaac autorizó meter `abcjs` como dependencia el 2026-09-03 («la opción a»),
// después de ver el número: el repositorio crece **12 líneas** —`node_modules`
// no se sube— y el navegador se baja ~136 KB comprimidos, y solo aquí.
//
// 🔴 SE CARGA CON `import()` DENTRO DEL EFECTO, y eso no es un adorno:
//   · **no entra en el paquete del servidor** — `abcjs` toca `document` al
//     dibujar, así que en el servidor reventaría;
//   · **no la paga quien no abre esta pantalla.** El catálogo se mira docenas
//     de veces al día y la melodía casi nunca: cargarla siempre sería hacerle
//     pagar a todos el peso de una pantalla que no usan.
//
// 📌 Y por qué NO se dibuja a mano, aunque el editor sí lo haga: el editor pinta
// una rejilla regular **para pinchar**. Esto es la partitura que se LEE tocando
// —vigas, espaciado real, armadura, líneas adicionales—, y hacer eso a mano es
// escribir un motor de grabado musical y mantenerlo para siempre.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

import { abcCompleto, type Elemento } from "@/lib/melodia";
import { cn } from "@/lib/utils";

type Props = {
  /** Los elementos de la melodía, o el ABC ya montado. */
  elementos?: Elemento[];
  abc?: string;
  compas?: string;
  tono?: string;
  titulo?: string;
  /**
   * Semitonos que se SUMAN a lo que se lee, sin cambiar lo que suena.
   *
   * 🔴 Para la trompeta son **+2**, y no es un número inventado aquí: es
   * exactamente lo que ya calcula `lib/transpositores.ts` desde agosto (D-28).
   * Si algún día entra otro instrumento, el número sale de allí.
   */
  transponer?: number;
  escala?: number;
  className?: string;
};

export default function Pentagrama({
  elementos,
  abc,
  compas = "4/4",
  tono = "C",
  titulo,
  transponer = 0,
  escala = 1,
  className,
}: Props) {
  const caja = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");

  const texto = abc ?? abcCompleto({ elementos: elementos ?? [], compas, tono, titulo });

  useEffect(() => {
    let vivo = true;

    (async () => {
      try {
        const abcjs = await import("abcjs");
        // Entre el `await` y aquí el componente puede haberse desmontado —
        // pasar de canción, por ejemplo—. Sin esta guarda se dibujaría sobre
        // un nodo que ya no está en la página.
        if (!vivo || !caja.current) return;
        abcjs.renderAbc(caja.current, texto, {
          responsive: "resize",
          scale: escala,
          visualTranspose: transponer,
          paddingtop: 4,
          paddingbottom: 4,
          paddingleft: 0,
          paddingright: 0,
        });
        setEstado("listo");
      } catch {
        // ⚠️ Un ABC a medio escribir —o la librería que no llega— NO puede
        // tumbar la pantalla. Se avisa y se sigue, que es lo mismo que hace el
        // reparto de secciones cuando el navegador le devuelve algo raro.
        if (vivo) setEstado("error");
      }
    })();

    return () => {
      vivo = false;
    };
  }, [texto, transponer, escala]);

  return (
    <div className={cn("relative", className)}>
      <div ref={caja} data-pentagrama={estado} className="abcjs-container" />
      {estado === "cargando" && (
        <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Dibujando el pentagrama…
        </p>
      )}
      {estado === "error" && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          No se pudo dibujar esta melodía. Revisa las notas, o recarga la página.
        </p>
      )}
    </div>
  );
}
