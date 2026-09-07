"use client";

// ─────────────────────────────────────────────────────────────
// El corazón de cada canción (O-73). Marca y desmarca el favorito del músico
// que lo pulsa.
//
// ⚠️ VA FUERA DEL ENLACE de la tarjeta, no dentro. La tarjeta entera es un
// `<Link>` (O-35), así que un botón por dentro abriría la canción además de
// marcar. Se coloca por encima, en la esquina, y se para la propagación.
// ─────────────────────────────────────────────────────────────

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

import { alternarFavorito } from "@/app/(dashboard)/catalog/actions";
import { cn } from "@/lib/utils";

export default function BotonFavorito({
  sheetId,
  favorito,
  titulo,
}: {
  sheetId: string;
  favorito: boolean;
  /** El nombre de la canción, para que el botón diga de cuál habla. */
  titulo: string;
}) {
  // Se pinta lo que el músico acaba de pulsar, sin esperar al servidor: en una
  // tablet con datos flojos, un corazón que tarda un segundo en encenderse se
  // pulsa dos veces.
  const [marcado, setMarcado] = useState(favorito);
  const [enCurso, empezar] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={marcado}
      aria-label={marcado ? `Quitar «${titulo}» de mis favoritos` : `Guardar «${titulo}» en mis favoritos`}
      title={marcado ? "Quitar de mis favoritos" : "Guardar en mis favoritos"}
      disabled={enCurso}
      onClick={(e) => {
        // La tarjeta entera es un enlace: sin esto, marcar abriría la canción.
        e.preventDefault();
        e.stopPropagation();
        const quiero = !marcado;
        setMarcado(quiero);
        empezar(async () => {
          const r = await alternarFavorito(sheetId, quiero);
          // Si el servidor no pudo, el corazón vuelve a donde estaba. Mentir
          // aquí es peor que tardar: el músico creería que quedó guardado.
          if (!r.ok) setMarcado(r.favorito);
        });
      }}
      className={cn(
        "absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        marcado ? "text-rose-500" : "text-slate-300 dark:text-slate-600"
      )}
    >
      <Heart className="h-5 w-5" fill={marcado ? "currentColor" : "none"} />
    </button>
  );
}
