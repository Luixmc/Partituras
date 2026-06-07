"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LayoutGrid, LogOut, PlusCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

const navItems = [
  { href: "/catalog", label: "Canciones", icon: LayoutGrid, roles: ["admin", "musician", "viewer"] },
  { href: "/sheets/new", label: "Nueva cancion", icon: PlusCircle, roles: ["admin", "musician"] },
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
    <div className="flex h-full w-full flex-col border-r border-brand-900 bg-brand-950 text-white">
      <div className="border-b border-brand-900 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold leading-tight text-white">
              Canciones
            </h1>
            <p className="text-xs leading-tight text-brand-400">
              La Casa de mi Padre
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-brand-500 text-white"
                  : "text-brand-300 hover:bg-brand-900 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-brand-900 p-4">
        <div className="mb-2 flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold">
            {profile?.first_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {profile?.first_name} {profile?.last_name ?? ""}
            </p>
            <p className="text-xs capitalize text-brand-400">
              {profile?.role ?? "viewer"}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-brand-300 transition-all hover:bg-brand-900 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}
