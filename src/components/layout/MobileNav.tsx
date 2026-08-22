"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { seccionesDe } from "@/lib/navegacion";
import type { UserRole } from "@/types";


export default function MobileNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  // La lista es la MISMA que la del ordenador (`lib/navegacion.ts`): antes
  // estaba escrita aquí aparte, y por eso «Letras» salía en el ordenador
  // y no en el teléfono.
  const visible = seccionesDe(role);

  return (
    <nav className="safe-area-pb flex border-t border-slate-200 bg-white md:hidden dark:border-slate-700 dark:bg-slate-900">
      {visible.map(({ href, corto, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors",
              active
                ? "text-brand-600 dark:text-brand-300"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
            {corto}
          </Link>
        );
      })}
    </nav>
  );
}
