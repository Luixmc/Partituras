import { notFound } from "next/navigation";
import { CalendarDays, LogIn, Music2, Play } from "lucide-react";
import Link from "next/link";

import ServicePdfButton from "@/components/services/ServicePdfButton";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ContentScale from "@/components/theme/ContentScale";
import ReadingControls from "@/components/theme/ReadingControls";
import { createClient } from "@/lib/supabase/server";
import { formatServiceDate, metaDeCulto } from "@/lib/services";

export default async function PublicServicePage(
  props: {
    params: Promise<{ token: string }>;
  }
) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select(
      "id, name, service_type, service_date, notes, public_token, service_songs(sheet_id, position, key_override, sheet_key:sheet_keys(key_signature), sheet:sheets(title, composer, key_signature))"
    )
    .eq("public_token", params.token)
    .eq("is_public", true)
    .single();

  if (!service) notFound();

  // Esta página es pública, pero eso no quiere decir que quien la abre sea un
  // desconocido: puede ser un músico con su cuenta iniciada que ha recibido el
  // enlace por WhatsApp. A ese no hay por qué dejarlo encallado en la lista
  // —puede abrir el culto entero y cada canción—, así que se mira si hay sesión
  // y se le enseña la puerta (O-23). Al que no tiene cuenta no le cambia nada.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tieneCuenta = Boolean(user);

  const meta = metaDeCulto(service.service_type);
  const dateText = formatServiceDate(service.service_date);

  const songs = (service.service_songs ?? [])
    .filter((r: any) => r.sheet)
    .sort((a: any, b: any) => a.position - b.position)
    .map((r: any) => ({
      sheet_id: r.sheet_id,
      title:    r.sheet.title,
      composer: r.sheet.composer ?? null,
      key:      r.sheet_key?.key_signature || r.key_override || r.sheet.key_signature || null,
    }));

  return (
    // El invitado también puede elegir claro/oscuro y el tamaño de letra
    // (O-25). Esta página vive fuera del panel, que es donde normalmente se
    // monta el tema, así que se monta aquí.
    //
    // Va solo en la LISTA: el modo presentación tiene su propio ajuste de
    // tamaño (O-06) y dos ajustes encima del mismo texto se estorban.
    <ThemeProvider>
      <div className="flex min-h-dvh flex-col bg-slate-50 dark:bg-slate-950">
        <ContentScale>
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="mb-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: meta.color }}
            >
              {meta.label}
            </span>
            {dateText && (
              <span className="flex items-center gap-1.5 text-sm capitalize text-slate-500 dark:text-slate-400">
                <CalendarDays className="h-3.5 w-3.5" />
                {dateText}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50">
            {service.name}
          </h1>
          {service.notes && (
            <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
              {service.notes}
            </p>
          )}
        </div>

        {/* Quien llega con su cuenta iniciada puede ir más allá de la lista
            (O-23). Al que no tiene cuenta no le sale nada de esto. */}
        {tieneCuenta && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 p-3 dark:border-brand-900 dark:bg-brand-950/40">
            <p className="text-sm text-brand-800 dark:text-brand-200">
              Tienes tu cuenta iniciada, asi que puedes ver el culto completo y abrir
              cada cancion.
            </p>
            <Link
              href={`/services/${service.id}`}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <LogIn className="h-4 w-4" />
              Abrir el culto completo
            </Link>
          </div>
        )}

        {songs.length > 0 && (
          <div className="mb-6 flex items-center gap-2">
            <Link
              href={`/s/${service.public_token}/present`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <Play className="h-4 w-4" />
              Modo presentacion
            </Link>
            <ServicePdfButton href={`/s/${service.public_token}/imprimir`} />
          </div>
        )}

        <ol className="space-y-2">
          {songs.map((s: any, i: number) => {
            // Con cuenta, cada canción lleva a su página; sin cuenta se queda en
            // texto, porque el catálogo pediría iniciar sesión (O-23).
            const Fila: any = tieneCuenta ? Link : "li";
            const propsFila = tieneCuenta
              ? { href: `/catalog/${s.sheet_id}` }
              : {};
            return (
            <Fila
              key={i}
              {...propsFila}
              className={
                "flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900" +
                (tieneCuenta ? " transition-colors hover:border-brand-400" : "")
              }
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-slate-900 dark:text-slate-100">
                  {s.title}
                </span>
                {s.composer && (
                  <span className="block truncate text-xs text-slate-400">{s.composer}</span>
                )}
              </span>
              {s.key && (
                <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {s.key}
                </span>
              )}
            </Fila>
            );
          })}
          {songs.length === 0 && (
            <li className="flex flex-col items-center justify-center py-12 text-center text-sm text-slate-400">
              <Music2 className="mb-2 h-6 w-6 text-slate-300" />
              Este culto no tiene canciones.
            </li>
          )}
        </ol>

        <p className="mt-8 text-center text-xs text-slate-300 dark:text-slate-600">
          La Casa de mi Padre · Partituras
        </p>
      </div>
        </ContentScale>

        {/* Controles flotantes: tamaño de letra y claro/oscuro. */}
        <div className="fixed bottom-4 right-4 z-30">
          <ReadingControls className="shadow-lg" />
        </div>
      </div>
    </ThemeProvider>
  );
}
