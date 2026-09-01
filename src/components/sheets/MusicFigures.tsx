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
 *
 * `beamed`: la nota va unida por viga a sus vecinas, así que NO dibuja sus
 * corchetes (la viga la dibuja el contenedor del grupo).
 */
export function NoteFigure({ beats, className, beamed = false }: FigureProps & { beamed?: boolean }) {
  // La cabeza va rellena hasta la NEGRA CON PUNTILLO (1.5): el puntillo alarga
  // la figura pero no la convierte en blanca. Con el corte en 1 la negra con
  // puntillo salía hueca y se leía como una blanca con puntillo (O-02).
  const filled = beats <= 1.5;
  const hasStem = beats !== 4; // la redonda no lleva plica
  // Corchea (0.5) y corchea con puntillo (0.75) llevan corchete. Con el corte
  // en 0.5 la corchea con puntillo salía sin él (mismo fallo que arriba).
  const hasFlag = !beamed && beats <= 0.75;
  const hasDoubleFlag = !beamed && beats <= 0.25; // semicorchea (dos corchetes)
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
 *  4 = de redonda · 3 = de blanca con puntillo · 2 = de blanca · 1 (o menos) = de negra
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
        // Silencio de blanca: bloque apoyado sobre la línea (con puntillo si beats === 3).
        <>
          <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1.6" />
          <rect x="8" y="13" width="8" height="5" fill="currentColor" />
          {beats === 3 && <circle cx="18.5" cy="15.5" r="1.9" fill="currentColor" />}
        </>
      ) : (
        // Silencio de negra: EL «7» MANUSCRITO, que es como se escribe a mano.
        //
        // 🔴 Antes era un zigzag de curvas Bézier, y lo cortó Isaac (O-47):
        // «el signo de la página no tiene forma de silencio». Tenía razón — no
        // se parecía ni al de imprenta (𝄽) ni al de papel, y esto se lee
        // TOCANDO: un símbolo que «casi» se parece no vale, porque hay que
        // reconocerlo de un vistazo y sin pensar.
        //
        // Dos trazos rectos: el travesaño de arriba, con una caída ligera hacia
        // la derecha, y la pata bajando en diagonal hacia la izquierda. Recto y
        // no curvo a propósito: es como sale al escribirlo con un lápiz.
        //
        // Va más grueso que las demás figuras (2.4 frente a 1.6) porque es un
        // trazo suelto sin cabeza ni plica: con el grosor de una línea se
        // perdería junto a los acordes.
        <>
          <path
            d="M7.5 8 L16.5 9.5 L9 21.5"
            stroke="currentColor"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {(beats === 1.5 || beats === 0.75) && <circle cx="18.5" cy="15" r="1.9" fill="currentColor" />}
        </>
      )}
    </svg>
  );
}
