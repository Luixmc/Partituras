"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Music, BookOpen, LayoutGrid, Settings, LogOut, PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/catalog",  label: "Catálogo",  icon: LayoutGrid,  roles: ["admin","musician","viewer"] },
  { href: "/mosaics",  label: "Canciones",  icon: Music,       roles: ["admin","musician","viewer"] },
  { href: "/sheets/new", label: "Nueva cancion", icon: PlusCircle, roles: ["admin","musician"] },
  { href: "/admin",    label: "Administrar", icon: Settings,  roles: ["admin"] },
];

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const visibleItems = navItems.filter(
    (item) => !profile || item.roles.includes(profile.role)
  );

  return (
    <div className="flex flex-col w-full h-full bg-brand-950 text-white border-r border-brand-900">
      {/* Logo */}
      <div className="p-6 border-b border-brand-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white leading-tight">Partituras</h1>
            <p className="text-brand-400 text-xs leading-tight">La Casa de mi Padre</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-brand-500 text-white"
                  : "text-brand-300 hover:bg-brand-900 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-brand-900">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-brand-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            {profile?.first_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {profile?.first_name} {profile?.last_name ?? ""}
            </p>
            <p className="text-brand-400 text-xs capitalize">{profile?.role ?? "viewer"}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-brand-300
                     hover:bg-brand-900 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
