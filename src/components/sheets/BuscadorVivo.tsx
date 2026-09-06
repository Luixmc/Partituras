"use client";

// ─────────────────────────────────────────────────────────────
// La caja de búsqueda que busca MIENTRAS SE ESCRIBE (O-71).
//
// Isaac, 2026-09-05: «apenas vaya escribiendo letra por letra ya vaya haciendo
// la búsqueda y que no tenga necesidad obligatoriamente de darle al enter».
//
// 🔴 POR QUÉ ES UN COMPONENTE Y NO TRES: la misma caja estaba copiada en
// `/catalog`, `/letras` y `/melodias`, cada una con su `<form>`. Tres copias de
// lo mismo acaban separándose —ya pasó con `parseSections` (P-09) y con la
// duración en cuatro sitios (O-70)—, y aquí encima habría que corregir el
// mismo detalle tres veces.
//
// ⚠️ **El Enter se sigue pudiendo pulsar**: sigue habiendo un formulario de
// verdad, así que si alguien lo pulsa —o escribe con el teclado del móvil y le
// da a «buscar»— funciona igual que siempre. Se AÑADE una forma, no se quita
// la otra. Y sin JavaScript, el formulario también sirve.
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Props = {
  /** A qué pantalla se busca: `/catalog`, `/letras`, `/melodias`. */
  base: string;
  /** Lo que ya venía escrito en la dirección. */
  q?: string;
  placeholder: string;
  /** Los demás filtros de la dirección, que NO se pueden perder al escribir. */
  extra?: Record<string, string | undefined>;
};

/**
 * Cuánto se espera desde la última tecla antes de buscar.
 *
 * 📌 No es un número puesto a ojo: cada búsqueda es una vuelta al servidor y a
 * la base **en Oregón**. Sin espera, escribir «esperare» dispararía OCHO. Con
 * 300 ms, quien teclea de corrido dispara **una**, y quien duda ve el resultado
 * antes de acabar la palabra — que es justo lo que pidió.
 */
const ESPERA_MS = 300;

export default function BuscadorVivo({ base, q = "", placeholder, extra }: Props) {
  const router = useRouter();
  const [texto, setTexto] = useState(q);

  // Si la dirección cambia por fuera —el botón de atrás, o al limpiar un
  // filtro—, la caja se pone al día. Sin esto, «atrás» dejaría la caja con lo
  // viejo y la lista con lo nuevo.
  //
  // 📌 Se ajusta DURANTE EL DIBUJO y no con un efecto, que es la forma que
  // recomienda React para esto. Con `useEffect` el lint avisa —«setState dentro
  // de un efecto encadena dibujados»— y la caja parpadearía un cuadro con el
  // valor viejo.
  const [qVisto, setQVisto] = useState(q);
  if (q !== qVisto) {
    setQVisto(q);
    setTexto(q);
  }

  // Los demás filtros de la dirección, en texto: así el efecto de abajo no se
  // vuelve a lanzar en cada dibujado solo porque el objeto sea nuevo.
  const otros = new URLSearchParams(
    Object.entries(extra ?? {}).filter(([, v]) => v) as [string, string][]
  ).toString();

  const irA = useCallback(
    (busqueda: string) => {
      const params = new URLSearchParams(otros);
      const limpia = busqueda.trim();
      if (limpia) params.set("q", limpia);
      const query = params.toString();
      // `replace` y no `push`: escribiendo «esperare» se crearían ocho entradas
      // en el historial, y el botón de atrás habría que pulsarlo ocho veces
      // para volver a donde estaba.
      router.replace(`${base}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [base, otros, router]
  );

  useEffect(() => {
    // Lo que hay en la caja ya es lo que pide la dirección: no hay nada que
    // buscar. Esto es lo que corta el lazo después de cada búsqueda.
    if (texto.trim() === q.trim()) return;
    const t = setTimeout(() => irA(texto), ESPERA_MS);
    return () => clearTimeout(t);
  }, [texto, q, irA]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <form
        onSubmit={(e) => {
          // Ya se está buscando al escribir; el Enter solo adelanta la espera.
          // Se evita que recargue la página entera.
          e.preventDefault();
          irA(texto);
        }}
      >
        <input
          name="q"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          type="search"
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-xl bg-slate-100 py-2.5 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
        />
      </form>
    </div>
  );
}
