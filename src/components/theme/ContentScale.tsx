"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

// Aplica el tamaño de letra (zoom) SOLO al contenido de la página, no a la
// barra lateral ni a la navegación. Usamos `zoom` para que el escalado reacomode
// el layout (a diferencia de transform: scale) y para que afecte también a las
// utilidades en rem (text-sm, etc.), que de otro modo ignoran el font-size del
// contenedor.
export default function ContentScale({ children }: { children: React.ReactNode }) {
  const { fontScale } = useTheme();
  return (
    <div className="flex-1 overflow-y-auto" style={{ zoom: fontScale }}>
      {children}
    </div>
  );
}
