import type { Metadata } from "next";

import { TANDAS, type Cambio } from "@/lib/novedades";

// ─────────────────────────────────────────────────────────────
// El comunicado de cambios para los músicos, PÚBLICO.
//
// Vive fuera del panel y está en las rutas públicas del middleware,
// como los cultos compartidos: la abre cualquiera, sin cuenta.
//
// 🔴 Por qué existe esta página, para que nadie la borre creyéndola de
// más: Isaac pidió un comunicado para el grupo de la iglesia. Se
// probó primero con un enlace de Claude y **NO SIRVE** — él mismo lo
// abrió en incógnito y salía «Page not found» con un botón de iniciar
// sesión. Los músicos no tienen cuenta de Claude. Este es el sitio que
// sí funciona: el dominio que ya conocen (O-29).
//
// El contenido vive en `lib/novedades.ts`: añadir una tanda es escribir
// una entrada allí, sin tocar esto.
// ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Novedades · Partituras",
  description: "Lo que ha ido cambiando en las partituras del Centro Cristiano La Casa de mi Padre.",
  // Para que al pegar el enlace en WhatsApp salga un adelanto decente
  // en vez de la dirección pelada.
  openGraph: {
    title: "Qué cambió en Partituras",
    description: "Lo nuevo y lo arreglado, contado para los músicos.",
    type: "article",
  },
};

/** Los textos traen <strong>, <em> y <code>: son nuestros, no vienen de fuera. */
function Texto({ html, className }: { html: string; className?: string }) {
  return <p className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Marca({ tipo }: { tipo: NonNullable<Cambio["tipo"]> }) {
  const nuevo = tipo === "nuevo";
  return (
    <span
      className={
        "self-start rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider " +
        (nuevo
          ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
          : "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300")
      }
    >
      {nuevo ? "Nuevo" : "Arreglado"}
    </span>
  );
}

function Comparativa({ tabla }: { tabla: NonNullable<Cambio["tabla"]> }) {
  return (
    <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {tabla.cabecera.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap border-b border-slate-200 px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.filas.map((fila, i) => (
            <tr key={i}>
              {fila.map((celda, j) => (
                <td
                  key={j}
                  className={
                    "whitespace-nowrap border-b border-slate-200 px-3 py-2 last:border-0 dark:border-slate-700 " +
                    // La del medio es lo que decía ANTES: tachada y apagada.
                    (j === 1
                      ? "text-slate-400 line-through dark:text-slate-500"
                      : j === 2
                        ? "font-semibold text-slate-900 dark:text-slate-100"
                        : "text-slate-600 dark:text-slate-300")
                  }
                >
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function NovedadesPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
          Centro Cristiano La Casa de mi Padre
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 md:text-5xl dark:text-slate-50" style={{ textWrap: "balance" }}>
          Qué cambió en Partituras
        </h1>
      </header>

      {TANDAS.map((tanda, t) => (
        <article key={tanda.iso} className="mt-8 flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <time dateTime={tanda.iso} className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {tanda.fecha}
            </time>
            <Texto html={tanda.entrada} className="text-slate-600 dark:text-slate-300" />
            {/* Se dice UNA vez, arriba, que todo vale en los dos aparatos.
                Antes iba suelto por las secciones y el texto acababa sonando
                a que la página era solo para el teléfono (2026-08-21). */}
            {tanda.nota && (
              <Texto
                html={tanda.nota}
                className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
              />
            )}
          </div>

          {/* EL MAPA. Isaac, leyendo la página el 2026-08-21: «el orden mejor
              sería mencionar los cambios por secciones y que de ahí se
              desglosen los demás… soy yo y veo que hay algunos enredos».
              Tenía razón: la página soltaba las 5 secciones y sus ~28 cambios
              abiertos de una vez, que en un teléfono es un muro de texto.
              Aquí se ve la forma entera de un vistazo, y cada línea dice si
              te interesa entrar. */}
          <nav className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Lo que cambió, por partes
            </p>
            <ol className="flex flex-col gap-3">
              {tanda.secciones.map((seccion) => (
                <li key={seccion.titulo} className="flex flex-col gap-0.5">
                  <p className="flex items-baseline gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    {seccion.titulo}
                    <span className="ml-auto whitespace-nowrap text-xs font-semibold tabular-nums text-slate-400 dark:text-slate-500">
                      {seccion.cambios.length}
                    </span>
                  </p>
                  <Texto
                    html={seccion.resumen}
                    className="text-sm text-slate-500 dark:text-slate-400"
                  />
                </li>
              ))}
            </ol>
          </nav>

          {/* Cada sección se despliega. Se usa <details>, que es HTML del
              navegador: no hace falta ni una línea de JavaScript, funciona
              con el dedo y sin cuenta, y si algo fallara el contenido sigue
              estando ahí.

              La PRIMERA va abierta a propósito: si se abriera todo cerrado,
              quien entra por el enlace de WhatsApp vería cinco rayas y
              pensaría que la página está vacía. */}
          {tanda.secciones.map((seccion, s) => (
            <details
              key={seccion.titulo}
              // Abierta SOLO la primera seccion del dia mas reciente. Con
              // tres tandas, abrir la primera de cada una volvia a llenar la
              // pagina de dias viejos — que es justo lo que se queria evitar.
              open={t === 0 && s === 0}
              className="group border-b border-slate-200 pb-5 dark:border-slate-700"
            >
              <summary className="flex cursor-pointer list-none items-baseline gap-3 py-1 font-display text-2xl font-semibold text-slate-900 marker:content-none dark:text-slate-50 [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden
                  className="select-none text-base text-slate-400 transition-transform group-open:rotate-90 dark:text-slate-500"
                >
                  ▸
                </span>
                {seccion.titulo}
                <span className="ml-auto whitespace-nowrap text-xs font-semibold tabular-nums text-slate-400 dark:text-slate-500">
                  {seccion.cambios.length} {seccion.cambios.length === 1 ? "cambio" : "cambios"}
                </span>
              </summary>

              <ul className="mt-5 flex flex-col gap-6">
                {seccion.cambios.map((cambio, i) => (
                  <li key={i} className="flex flex-col gap-1.5">
                    {cambio.tipo && <Marca tipo={cambio.tipo} />}
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{cambio.titulo}</p>
                    {cambio.detalle?.map((d, j) => (
                      <Texto key={j} html={d} className="text-slate-600 dark:text-slate-300" />
                    ))}
                    {cambio.tabla && <Comparativa tabla={cambio.tabla} />}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </article>
      ))}

      <aside className="mt-12 rounded-lg border border-l-4 border-slate-200 border-l-brand-500 bg-white p-5 dark:border-slate-700 dark:border-l-brand-400 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-300">
          <strong className="font-semibold text-slate-900 dark:text-slate-100">
            Si abres la página y sigues viendo lo de antes
          </strong>
          , recárgala manteniendo <strong className="font-semibold">Ctrl</strong> y pulsando{" "}
          <strong className="font-semibold">F5</strong>. En el teléfono, cierra la pestaña y vuelve a
          abrirla. El navegador guarda la versión vieja para que cargue rápido, y a veces se queda con
          ella.
        </p>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Si algo se ve raro o no funciona como esperabas,{" "}
          <strong className="font-semibold text-slate-900 dark:text-slate-100">dilo</strong> — casi
          todo lo de esta lista salió de alguien que se fijó en un detalle.
        </p>
      </aside>

      <footer className="mt-10 border-t border-slate-200 pt-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Partituras · Centro Cristiano La Casa de mi Padre
      </footer>
    </main>
  );
}
