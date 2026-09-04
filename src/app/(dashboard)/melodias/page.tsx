import { Music4, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import CatalogFilters from "@/components/sheets/CatalogFilters";
import {
  buscarCanciones,
  categoriasElegidas,
  estadoElegido,
  filtrosAQuery,
  type FiltrosCatalogo,
} from "@/lib/catalogo";
import { puedeVerMelodia } from "@/lib/melodia";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types";

// ─────────────────────────────────────────────────────────────
// «Melodía»: la sección propia de la trompeta (O-57 R.2).
//
// Isaac la pidió calcada a «Letras»: *«que tenga una sección aparte como las
// letras pero que sea oculta también hasta que funcione bien»*. Y el motivo es
// el mismo que allí: **quien toca la trompeta no quiere acordes**, así que si
// la melodía fuera solo una pestaña dentro de la canción aterrizaría en los
// acordes cada vez y tendría que cambiar.
//
// 🔴 NO ES UN TERCER CATÁLOGO (D-21). Usa `buscarCanciones`, la misma consulta
// que `/catalog`, que `/letras` y que la pantalla completa. Tres listas que
// hacen lo mismo terminan siendo tres listas que YA NO hacen lo mismo — es
// P-09, y en este proyecto ya se pagó tres veces.
// ─────────────────────────────────────────────────────────────

export const metadata = { title: "Melodía · Partituras" };

/**
 * Qué canciones tienen melodía escrita.
 *
 * 🔴 AGUANTA QUE LA COLUMNA TODAVÍA NO EXISTA, y no es precaución de más: entre
 * publicar este código y ejecutar la migración `20240021` hay un rato en el que
 * producción pregunta por una columna que no está. Si eso reventara, la
 * pantalla saldría **vacía y sin error visible** — que es exactamente T-07, los
 * 3 minutos que el catálogo estuvo en blanco.
 *
 * → Sin columna: ninguna canción tiene melodía. Que es la verdad.
 */
async function conMelodia(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ ids: Set<string>; hayColumna: boolean }> {
  const { data, error } = await supabase.from("sheets").select("id").not("melody", "is", null);
  // `42703` es «esa columna no existe» en Postgres.
  if (error) return { ids: new Set(), hayColumna: error.code !== "42703" };
  return { ids: new Set((data ?? []).map((s) => s.id as string)), hayColumna: true };
}

export default async function MelodiasPage(props: { searchParams: Promise<FiltrosCatalogo> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const esAdmin = profile?.role === "admin";

  // 🔴 Se comprueba AQUÍ, en el servidor. Esconder la entrada del menú no es un
  // permiso: cualquiera puede escribir /melodias en la barra de direcciones
  // (L-87 `[PART]`).
  if (!puedeVerMelodia(profile?.role)) redirect("/catalog");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, color")
    .eq("active", true)
    .order("sort_order");

  const filtros: FiltrosCatalogo = esAdmin ? searchParams : { ...searchParams, estado: undefined };
  const canciones = await buscarCanciones(supabase, filtros);
  const { ids: tienen, hayColumna } = await conMelodia(supabase);

  const escritas = canciones.filter((c) => tienen.has(c.id)).length;
  const filtro = filtrosAQuery(filtros);

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-5 md:px-8 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">Melodía</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">{escritas}</span>{" "}
            de {canciones.length} con melodía escrita
          </p>
        </div>

        {/* ⚠️ Se avisa en vez de fingir que funciona. Un botón que parece hacer
            algo y no lo hace es el fallo que más caro salió aquí (P-01, el
            «desactivar usuario» que no desactivaba). */}
        {!hayColumna && (
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <b>Todavía no se puede guardar.</b> Falta añadir la columna de melodía en la base de
            datos. Puedes escribir y ver el pentagrama, pero al guardar dará error.
          </p>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <form>
            <input
              name="q"
              defaultValue={searchParams.q}
              type="search"
              placeholder="Buscar por titulo o autor..."
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
          base="/melodias"
        />
      </div>

      <div className="flex-1 p-4 md:p-8">
        {canciones.length === 0 ? (
          <p className="py-16 text-center text-slate-500 dark:text-slate-400">Sin resultados.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {canciones.map((c) => {
              const tiene = tienen.has(c.id);
              return (
                <li key={c.id}>
                  {/* Se abre la canción DIRECTAMENTE en su melodía. */}
                  <Link
                    href={`/catalog/${c.id}?ver=melodia${filtro ? "&" + filtro.slice(1) : ""}`}
                    className="flex h-full flex-col gap-2 rounded-xl bg-white p-4 ring-1 ring-slate-200 transition-shadow hover:shadow-md dark:bg-slate-800 dark:ring-slate-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-50">{c.title}</span>
                      <Music4
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
                      {tiene ? "Con melodía" : "Sin escribir"}
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
