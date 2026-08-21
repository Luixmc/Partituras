import { Mic2, Search } from "lucide-react";
import Link from "next/link";

import CatalogFilters from "@/components/sheets/CatalogFilters";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { puedeVerLetras } from "@/lib/letras";
import { buscarCanciones, categoriasElegidas, estadoElegido, filtrosAQuery, type FiltrosCatalogo } from "@/lib/catalogo";
import type { Category } from "@/types";

// ─────────────────────────────────────────────────────────────
// «Letras»: la sección propia que pidió Isaac el 2026-08-21.
//
// Idea suya, y es la correcta: **quien canta no quiere acordes nunca**.
// Si la letra fuera solo una pestaña dentro de la canción, aterrizaría
// en los acordes cada vez y tendría que cambiar. Con entrada propia,
// empieza donde le toca.
//
// 🔴 PERO NO ES UN SEGUNDO CATÁLOGO (D-21). Usa `buscarCanciones`, la
// misma consulta que `/catalog` y que la pantalla completa. Tener dos
// listas que hacen lo mismo termina en dos listas que YA NO hacen lo
// mismo — es P-09, y en este proyecto ya se pagó dos veces.
// Lo único suyo: a dónde llevan las tarjetas y qué se enseña.
//
// La ven los TRES roles; sin cuenta no se llega, porque vive dentro del
// panel.
// ─────────────────────────────────────────────────────────────

export const metadata = { title: "Letras · Partituras" };

export default async function LetrasPage({ searchParams }: { searchParams: FiltrosCatalogo }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const esAdmin = profile?.role === "admin";

  // 🔴 Se comprueba AQUÍ, en el servidor, no solo escondiendo el botón del
  // menú: esconder no es un permiso, y cualquiera puede escribir /letras en
  // la barra de direcciones (L-87 `[PART]`).
  if (!puedeVerLetras(profile?.role)) redirect("/catalog");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, color")
    .eq("active", true)
    .order("sort_order");

  const filtros: FiltrosCatalogo = esAdmin ? searchParams : { ...searchParams, estado: undefined };
  const canciones = await buscarCanciones(supabase, filtros);

  // Qué canciones tienen letra. Se pide APARTE y solo el `id`: traerse el
  // texto de las 75 en la lista es justo lo que obligó al tope de 50 en su
  // día con los acordes (O-05/O-10). Aquí no se repite.
  const { data: conLetra } = await supabase.from("sheets").select("id").not("lyrics", "is", null);
  const tienenLetra = new Set((conLetra ?? []).map((s) => s.id as string));

  const escritas = canciones.filter((c) => tienenLetra.has(c.id)).length;
  const filtro = filtrosAQuery(filtros);

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-5 md:px-8 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">Letras</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">{escritas}</span>{" "}
            de {canciones.length} con letra escrita
          </p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <form>
            <input
              name="q"
              defaultValue={searchParams.q}
              type="search"
              placeholder="Buscar por titulo, autor o por lo que dice la letra..."
              className="w-full rounded-xl bg-slate-100 py-2.5 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:text-slate-100"
            />
          </form>
        </div>

        <CatalogFilters
          categories={(categories ?? []) as Category[]}
          selectedIds={categoriasElegidas(filtros)}
          q={searchParams.q}
          esAdmin={esAdmin}
          estado={estadoElegido(filtros)}
          base="/letras"
        />
      </div>

      <div className="flex-1 p-4 md:p-8">
        {canciones.length === 0 ? (
          <p className="py-16 text-center text-slate-500 dark:text-slate-400">Sin resultados.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {canciones.map((c) => {
              const tiene = tienenLetra.has(c.id);
              return (
                <li key={c.id}>
                  {/* Se abre la canción DIRECTAMENTE en su letra. */}
                  <Link
                    href={`/catalog/${c.id}?ver=letra${filtro ? "&" + filtro.slice(1) : ""}`}
                    className="flex h-full flex-col gap-2 rounded-xl bg-white p-4 ring-1 ring-slate-200 transition-shadow hover:shadow-md dark:bg-slate-800 dark:ring-slate-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-50">{c.title}</span>
                      <Mic2
                        className={
                          "h-4 w-4 shrink-0 " +
                          (tiene ? "text-brand-500" : "text-slate-300 dark:text-slate-600")
                        }
                        aria-hidden
                      />
                    </div>
                    {c.composer && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">{c.composer}</span>
                    )}
                    <span
                      className={
                        "mt-auto text-xs font-semibold " +
                        (tiene
                          ? "text-brand-600 dark:text-brand-400"
                          : "text-slate-400 dark:text-slate-500")
                      }
                    >
                      {tiene ? "Con letra" : "Sin escribir"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
