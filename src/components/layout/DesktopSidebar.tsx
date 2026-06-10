"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

// Envoltura cliente de la barra lateral de escritorio: lee el estado "plegada"
// del tema para cambiar el ancho del <aside>. El zoom de lectura NO se aplica
// aquí, así que la barra mantiene su tamaño al ampliar el contenido.
export default function DesktopSidebar({ profile }: { profile: Profile | null }) {
  const { sidebarCollapsed } = useTheme();
  return (
    <aside
      className={cn(
        "hidden flex-shrink-0 md:flex transition-[width] duration-200",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      <Sidebar profile={profile} collapsed={sidebarCollapsed} />
    </aside>
  );
}
