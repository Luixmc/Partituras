"use client";

import { figuraDe } from "@/lib/figuras";

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
  // 📌 Todo sale de la FIGURA BASE. Los puntillos no cambian la forma: una
  // negra con doble puntillo sigue siendo una negra —rellena, con plica y sin
  // corchete—, solo que con dos puntos detrás.
  const { base, puntillos } = figuraDe(beats);
  const filled = base <= 1; // la blanca y la redonda van huecas
  const hasStem = base !== 4; // la redonda no lleva plica
  const hasFlag = !beamed && base <= 0.5; // corchea y semicorchea
  const hasDoubleFlag = !beamed && base <= 0.25; // la semicorchea, dos corchetes

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
      {/* Un punto por puntillo, separados. Antes solo cabía uno porque la
          duración se comparaba contra una lista de valores fijos. */}
      {Array.from({ length: puntillos }, (_, i) => (
        <circle key={i} cx={19 + i * 4} cy="21" r="1.8" fill="currentColor" />
      ))}
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
 * Figura de silencio según los tiempos.
 *
 * 🔴 Hasta el 2026-08-29 solo había TRES formas —redonda, blanca y negra— y
 * **todo lo que bajara de 2 se dibujaba como silencio de negra**. Así que
 * `Z:0.5` y `Z:0.25` se veían igual que `Z:1`: un silencio de corchea leído
 * como negra, **el doble de tiempo**. Eso no es un detalle de estilo, es un
 * dato musical equivocado en la pantalla desde la que se toca.
 * Lo pidió Isaac (O-49) y de paso salieron las dos figuras que faltaban.
 *
 * Como en las notas, la FIGURA BASE decide la forma y los puntillos solo
 * añaden puntos.
 */
export function RestFigure({ beats, className }: FigureProps) {
  const { base, puntillos } = figuraDe(beats);

  // Los puntos van a la derecha de la figura, a su altura.
  const puntos = (x: number, y: number) =>
    Array.from({ length: puntillos }, (_, i) => (
      <circle key={i} cx={x + i * 4} cy={y} r="1.9" fill="currentColor" />
    ));

  return (
    <svg
      viewBox="0 0 24 30"
      className={className}
      style={{ height: "1em", width: "auto", display: "block" }}
      fill="none"
      aria-hidden="true"
    >
      {base >= 4 ? (
        // Redonda: bloque COLGANDO de la línea.
        <>
          <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.6" />
          <rect x="8" y="12" width="8" height="5" fill="currentColor" />
          {puntos(19, 15)}
        </>
      ) : base >= 2 ? (
        // Blanca: bloque APOYADO sobre la línea. La diferencia con la redonda
        // es a qué lado de la línea cae el bloque, y es la de toda la vida.
        <>
          <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1.6" />
          <rect x="8" y="13" width="8" height="5" fill="currentColor" />
          {puntos(19, 15.5)}
        </>
      ) : base >= 1 ? (
        // Negra: el «3» con la pata recta que eligió Isaac sobre el dibujo
        // (O-47, variante D2 de la página desechable). Ver el porqué del
        // método en §9.2 — tres intentos por descripción escrita fallaron.
        <>
          <path
            d="M8 7.5 C 13.5 5.5, 17 8.5, 13 11.2 C 17.5 11.8, 17 15.5, 13.2 16.4 L 8.5 22"
            stroke="currentColor"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {puntos(19, 15)}
        </>
      ) : (
        // Corchea y semicorchea: la barra diagonal con uno o dos ganchos.
        // El de semicorchea lleva el segundo gancho más arriba, igual que la
        // nota lleva su segundo corchete.
        <>
          <line x1="15" y1="7" x2="8" y2="22" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <circle cx="9.5" cy="9.5" r="2.1" fill="currentColor" />
          <path
            d="M9.5 9.5 C 12.5 8.5, 14.5 7.5, 15 7"
            stroke="currentColor"
            strokeWidth="1.7"
            fill="none"
            strokeLinecap="round"
          />
          {base <= 0.25 && (
            <>
              <circle cx="12" cy="15.5" r="2.1" fill="currentColor" />
              <path
                d="M12 15.5 C 14.5 14.5, 16 13.5, 16.5 13"
                stroke="currentColor"
                strokeWidth="1.7"
                fill="none"
                strokeLinecap="round"
              />
            </>
          )}
          {puntos(18.5, 15)}
        </>
      )}
    </svg>
  );
}

