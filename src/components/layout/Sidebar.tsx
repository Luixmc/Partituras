"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, LayoutGrid, LogOut, PlusCircle, Settings } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import ReadingControls from "@/components/theme/ReadingControls";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { Profile } from "@/types";

const navItems = [
  { href: "/catalog", label: "Canciones", icon: LayoutGrid, roles: ["admin", "musician", "viewer"] },
  { href: "/sheets/new", label: "Nueva cancion", icon: PlusCircle, roles: ["admin"] },
  { href: "/admin", label: "Administrar", icon: Settings, roles: ["admin"] },
];

export default function Sidebar({
  profile,
  collapsed = false,
}: {
  profile: Profile | null;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useTheme();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const visibleItems = navItems.filter(
    (item) => !profile || item.roles.includes(profile.role)
  );

  return (
    <div className="flex h-full w-full flex-col border-r border-brand-900 bg-brand-950 text-white">
      <div className={cn("border-b border-brand-900", collapsed ? "p-3" : "p-6")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0">
                <h1 className="font-display font-bold leading-tight text-white">Canciones</h1>
                <p className="text-xs leading-tight text-brand-400">La Casa de mi Padre</p>
              </div>
              <button
                type="button"
                onClick={toggleSidebar}
                className="ml-auto flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-brand-300 transition-colors hover:bg-brand-900 hover:text-white"
                title="Plegar menú"
                aria-label="Plegar menú"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="mt-3 flex w-full items-center justify-center rounded-lg py-1.5 text-brand-300 transition-colors hover:bg-brand-900 hover:text-white"
            title="Desplegar menú"
            aria-label="Desplegar menú"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className={cn("flex-1 space-y-1", collapsed ? "p-2" : "p-4")}>
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center rounded-xl text-sm font-medium transition-all",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                active ? "bg-brand-500 text-white" : "text-brand-300 hover:bg-brand-900 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t border-brand-900", collapsed ? "p-2" : "p-4")}>
        {/* Lectura: tamaño de letra y modo claro/oscuro (afecta solo al contenido). */}
        {!collapsed && (
          <div className="mb-3 px-1">
            <ReadingControls variant="dark" />
          </div>
        )}
        <div
          className={cn(
            "mb-2 flex items-center",
            collapsed ? "justify-center py-2" : "gap-3 px-3 py-2"
          )}
        >
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold"
            title={collapsed ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() : undefined}
          >
            {profile?.first_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {profile?.first_name} {profile?.last_name ?? ""}
              </p>
              <p className="text-xs capitalize text-brand-400">{profile?.role ?? "viewer"}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          title={collapsed ? "Cerrar sesión" : undefined}
          className={cn(
            "flex w-full items-center rounded-xl text-sm text-brand-300 transition-all hover:bg-brand-900 hover:text-white",
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && "Cerrar sesion"}
        </button>
      </div>
    </div>
  );
}
