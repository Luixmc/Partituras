"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, PlusCircle, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const navItems = [
  { href: "/catalog", label: "Canciones", icon: LayoutGrid, roles: ["admin", "musician", "viewer"] },
  { href: "/sheets/new", label: "Nueva", icon: PlusCircle, roles: ["admin"] },
  { href: "/admin", label: "Admin", icon: Settings, roles: ["admin"] },
];

export default function MobileNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const visible = navItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="safe-area-pb flex border-t border-slate-200 bg-white md:hidden dark:border-slate-700 dark:bg-slate-900">
      {visible.map(({ href, label, icon: Icon }) => {
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
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
