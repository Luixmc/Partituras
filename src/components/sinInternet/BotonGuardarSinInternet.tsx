"use client";

import { useState, useSyncExternalStore } from "react";
import { Download, RefreshCw, Trash2 } from "lucide-react";

import { fechaCorta, leerGuardado } from "@/lib/sinInternet";
import {
  borrarCopias,
  guardadoEnCrudo,
  guardarTodo,
  progresoActual,
  puedeGuardar,
  suscribirGuardado,
} from "@/lib/guardarSinInternet";

// ─────────────────────────────────────────────────────────────
// «Guardar para tocar sin internet» (O-96, Fase 3). Va en el catálogo y en
// los cultos. Isaac eligió guardar TODO EL CATÁLOGO (2026-10-22): las 98
// canciones son ~8–10 MB en el aparato.
// ─────────────────────────────────────────────────────────────

function suscribirRed(cambio: () => void) {
  window.addEventListener("online", cambio);
  window.addEventListener("offline", cambio);
  return () => {
    window.removeEventListener("online", cambio);
    window.removeEventListener("offline", cambio);
  };
}

/**
 * iPad y iPhone: Safari borra lo guardado de una página que lleva 7 días sin
 * abrirse, salvo que esté INSTALADA en la pantalla de inicio. Un músico usa
 * iPad (Isaac, 2026-10-22), así que se le dice cómo evitarlo.
 */
function esIOSSinInstalar(): boolean {
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const instalada =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return ios && !instalada;
}

/** «hoy» y «ayer» se cuentan desde que se abrió la página (React no deja leer el reloj al dibujar). */
const CARGADA = Date.now();

/** «1 culto», «3 cultos»: el músico lee esto, no un programador. */
function cuantos(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

function megas(kb: number): string {
  return (kb / 1024).toLocaleString("es-CO", { maximumFractionDigits: 1 }) + " MB";
}

export default function BotonGuardarSinInternet({ usuario }: { usuario: string }) {
  // `null` en el servidor y al hidratar: así lo de este aparato se pinta después
  // y no choca con lo que mandó el servidor.
  const crudo = useSyncExternalStore(suscribirGuardado, guardadoEnCrudo, () => null);
  const progreso = useSyncExternalStore(suscribirGuardado, progresoActual, () => null);
  const enLinea = useSyncExternalStore(suscribirRed, () => navigator.onLine, () => true);
  const [mensaje, setMensaje] = useState<{ error: boolean; texto: string } | null>(null);

  if (crudo === null || !puedeGuardar()) return null;

  const leido = leerGuardado(crudo);
  // Lo guardado por otra cuenta en esta tablet no es de quien mira ahora.
  const guardado = leido && leido.usuario === usuario ? leido : null;

  function guardar() {
    setMensaje(null);
    guardarTodo(usuario)
      .then((r) =>
        setMensaje({
          error: false,
          texto:
            `Listo: ${cuantos(r.canciones, "canción", "canciones")} y ${cuantos(r.cultos, "culto", "cultos")} guardados (${megas(r.kb)}).` +
            (r.fallidas ? ` ${r.fallidas} no se pudieron bajar; pulsa «Actualizar» para intentarlo otra vez.` : ""),
        })
      )
      .catch((e: Error) => setMensaje({ error: true, texto: e.message }));
  }

  function borrar() {
    setMensaje(null);
    borrarCopias().then(() =>
      setMensaje({ error: false, texto: "Se borró lo guardado en este aparato." })
    );
  }

  const boton =
    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50";

  return (
    <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 sm:flex-1">
          <p className="font-semibold text-slate-800 dark:text-slate-100">Para tocar sin internet</p>
          {progreso ? (
            <p className="text-slate-500 dark:text-slate-400">
              Guardando… {progreso.hechas} de {progreso.total}
            </p>
          ) : guardado ? (
            <p className="text-slate-500 dark:text-slate-400">
              Guardado: {cuantos(guardado.canciones, "canción", "canciones")} y{" "}
              {cuantos(guardado.cultos, "culto", "cultos")} ·{" "}
              {fechaCorta(guardado.fecha, CARGADA)} · {megas(guardado.kb)}
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">
              Guarda el catálogo y los cultos en este aparato (unos 10 MB) para abrirlos sin conexión.
            </p>
          )}
        </div>
        {!progreso && (
          <div className="flex flex-wrap gap-2">
            {guardado ? (
              <>
                <button
                  type="button"
                  onClick={guardar}
                  disabled={!enLinea}
                  className={`${boton} bg-brand-600 text-white hover:bg-brand-700`}
                >
                  <RefreshCw className="h-4 w-4" /> Actualizar
                </button>
                <button
                  type="button"
                  onClick={borrar}
                  className={`${boton} bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`}
                >
                  <Trash2 className="h-4 w-4" /> Borrar
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={guardar}
                disabled={!enLinea}
                className={`${boton} bg-brand-600 text-white hover:bg-brand-700`}
              >
                <Download className="h-4 w-4" /> Guardar para tocar sin internet
              </button>
            )}
          </div>
        )}
      </div>
      {progreso && progreso.total > 0 && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${Math.round((progreso.hechas / progreso.total) * 100)}%` }}
          />
        </div>
      )}
      {!enLinea && !progreso && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Sin conexión: lo guardado sigue abriendo; para guardar o actualizar hace falta internet.
        </p>
      )}
      {mensaje && (
        <p className={`mt-2 text-xs ${mensaje.error ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
          {mensaje.texto}
        </p>
      )}
      {esIOSSinInstalar() && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          En iPad o iPhone: instala la página (Compartir → «Añadir a pantalla de inicio») y entra desde ahí
          con tu cuenta. Si no, Safari borra lo guardado cuando pasan 7 días sin abrirla.
        </p>
      )}
    </section>
  );
}
