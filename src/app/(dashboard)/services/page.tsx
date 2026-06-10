import Link from "next/link";
import { CalendarDays, Music2, Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { SERVICE_TYPE_META, formatServiceDate } from "@/lib/services";
import type { Service } from "@/types";

type ServiceRow = Service & { service_songs: { count: number }[] };

export default async function ServicesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const isAdmin = profile?.role === "admin";

  const { data } = await supabase
    .from("services")
    .select("*, service_songs(count)")
    .order("service_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const services = (data ?? []) as ServiceRow[];

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-5 md:px-8 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
              Cultos
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Setlists de canciones por servicio
            </p>
          </div>
          {isAdmin && (
            <Link
              href="/services/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Nuevo culto
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8">
        {services.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((s) => {
              const meta = SERVICE_TYPE_META[s.service_type] ?? SERVICE_TYPE_META.otro;
              const count = s.service_songs?.[0]?.count ?? 0;
              const dateText = formatServiceDate(s.service_date);
              return (
                <Link
                  key={s.id}
                  href={`/services/${s.id}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-brand-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      {meta.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                      <Music2 className="h-3.5 w-3.5" />
                      {count}
                    </span>
                  </div>
                  <h2 className="font-display text-lg font-semibold leading-tight text-slate-900 group-hover:text-brand-700 dark:text-slate-50 dark:group-hover:text-brand-300">
                    {s.name}
                  </h2>
                  {dateText && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm capitalize text-slate-500 dark:text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {dateText}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <CalendarDays className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="mb-1 font-display text-lg font-semibold text-slate-700 dark:text-slate-200">
              Sin cultos
            </h3>
            <p className="mb-4 text-sm text-slate-400 dark:text-slate-500">
              {isAdmin ? "Crea tu primer culto para empezar." : "Aun no hay cultos disponibles."}
            </p>
            {isAdmin && (
              <Link
                href="/services/new"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <Plus className="h-4 w-4" />
                Nuevo culto
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
