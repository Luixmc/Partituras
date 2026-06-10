"use client";

// Figuras musicales dibujadas en SVG (más fiables que los caracteres Unicode
// musicales, que no se ven en muchas fuentes). Usan `currentColor`, así que
// heredan el color del texto del contenedor.

type FigureProps = {
  beats: number;
  className?: string;
};

/**
 * Figura de nota según los tiempos:
 *  0.5 = corchea · 1 = negra · 2 = blanca · 3 = blanca con puntillo · 4 = redonda
 */
export function NoteFigure({ beats, className }: FigureProps) {
  const filled = beats <= 1; // negra/corchea/semicorchea con cabeza rellena
  const hasStem = beats !== 4; // la redonda no lleva plica
  const hasFlag = beats <= 0.5; // corchea (un corchete)
  const hasDoubleFlag = beats <= 0.25; // semicorchea (dos corchetes)
  const hasDot = beats === 3 || beats === 1.5 || beats === 0.75; // puntillo

  return (
    <svg
      viewBox="0 0 24 30"
      className={className}
      style={{ height: "1em", width: "auto", display: "block" }}
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="8"
        cy="21"
        rx="6.2"
        ry="4.5"
        transform="rotate(-22 8 21)"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
      />
      {hasStem && <line x1="13.7" y1="20" x2="13.7" y2="3.5" stroke="currentColor" strokeWidth="1.7" />}
      {hasFlag && (
        <path
          d="M13.7 3.5 C 19 6, 19.5 11, 15.5 13.5"
          stroke="currentColor"
          strokeWidth="1.7"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {hasDoubleFlag && (
        // Segundo corchete de la semicorchea, un poco más abajo.
        <path
          d="M13.7 8 C 19 10.5, 19.5 15.5, 15.5 18"
          stroke="currentColor"
          strokeWidth="1.7"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {hasDot && <circle cx="19" cy="21" r="1.8" fill="currentColor" />}
    </svg>
  );
}

/**
 * Ligadura / ligado musical: arco curvo que une dos acordes por arriba. Se
 * estira al ancho del contenedor (preserveAspectRatio="none") manteniendo el
 * grosor del trazo constante.
 */
export function SlurFigure({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 12"
      className={className}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", display: "block" }}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 10 Q 50 0 98 10"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Calderón (fermata): arco con punto, para acordes de pausa/alargación. */
export function FermataFigure({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={className}
      style={{ height: "1em", width: "auto", display: "block" }}
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 13 Q 12 1 21 13" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="9.5" r="1.8" fill="currentColor" />
    </svg>
  );
}

/**
 * Figura de silencio según los tiempos:
 *  4 = silencio de redonda · 2 = de blanca · 1 (o menos) = de negra
 */
export function RestFigure({ beats, className }: FigureProps) {
  return (
    <svg
      viewBox="0 0 24 30"
      className={className}
      style={{ height: "1em", width: "auto", display: "block" }}
      fill="none"
      aria-hidden="true"
    >
      {beats >= 4 ? (
        // Silencio de redonda: bloque colgando de la línea.
        <>
          <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.6" />
          <rect x="8" y="12" width="8" height="5" fill="currentColor" />
        </>
      ) : beats >= 2 ? (
        // Silencio de blanca: bloque apoyado sobre la línea.
        <>
          <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1.6" />
          <rect x="8" y="13" width="8" height="5" fill="currentColor" />
        </>
      ) : (
        // Silencio de negra: trazo en zigzag. Con puntillo si beats === 1.5
        // (silencio de negra con puntillo) ó 0.75.
        <>
          <path
            d="M9 6 C 13 9, 10 11, 13 13 C 16 15, 11 16, 14 19 C 12 18, 10 19, 12.5 22"
            stroke="currentColor"
            strokeWidth="2.1"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {(beats === 1.5 || beats === 0.75) && <circle cx="18.5" cy="14" r="1.9" fill="currentColor" />}
        </>
      )}
    </svg>
  );
}
