"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { WifiOff, X } from "lucide-react";

import { esCopia, fechaCorta, hayQueRefrescar } from "@/lib/sinInternet";
import { BUILD, guardadoActual, guardarTodo, puedeGuardar } from "@/lib/guardarSinInternet";

// ─────────────────────────────────────────────────────────────
// El aviso de «esto es una copia» y «sin conexión» (O-96, Fase 2), y el
// guardado AUTOMÁTICO y callado de todo (O-97).
//
// 📌 Lo que se avisa y lo que no: Isaac no quiere ningún aviso de que se
// guardó (O-97). Este componente SOLO habla cuando lo que se ve es una copia o
// no hay red — eso no es un aviso de guardado, es el del riesgo de estar
// tocando una versión vieja, y se queda.
//
// 🔴 POR QUÉ EL AVISO NO ES UN ADORNO: sin internet se ve la copia del último
// día que se abrió con internet. Si Isaac corrige una canción el domingo
// temprano, quien está sin señal ve la de antes — y sin aviso, creería que es
// la buena. Es la misma confusión de T-02, solo que a propósito.
//
// 📌 Cómo sabe que es una copia: el servidor le pasa la hora a la que armó la
// página (`generado`). Si al cargarla esa hora tiene más de 5 minutos, la página
// salió de lo guardado. Se mira UNA vez, al cargar: el layout no se vuelve a
// armar al navegar dentro de la app, así que más tarde la hora sería vieja
// aunque la página no lo fuera.
// ─────────────────────────────────────────────────────────────

/** Cuándo se cargó esta página en el navegador (al evaluarse este archivo). */
const CARGADA = Date.now();

function suscribirRed(cambio: () => void) {
  window.addEventListener("online", cambio);
  window.addEventListener("offline", cambio);
  return () => {
    window.removeEventListener("online", cambio);
    window.removeEventListener("offline", cambio);
  };
}

const nada = () => () => {};

export default function AvisoSinInternet({
  generado,
  usuario,
}: {
  /** Hora (ISO) a la que el servidor armó la página. */
  generado: string;
  /** Con sesión: de quién es lo guardado, para refrescarlo solo si es suyo. */
  usuario?: string;
}) {
  const enLinea = useSyncExternalStore(suscribirRed, () => navigator.onLine, () => true);
  const copia = useSyncExternalStore(nada, () => esCopia(generado, CARGADA), () => false);
  const [cerrado, setCerrado] = useState<"copia" | "red" | null>(null);

  // O-97: se guarda solo al abrir la página — si esta cuenta no tiene copia, si
  // hay despliegue nuevo o si tiene más de un día — y sin decir nada. Se espera
  // un poco para no competir con la carga de la página.
  useEffect(() => {
    if (!usuario || copia || !puedeGuardar()) return;
    const t = setTimeout(() => {
      if (!navigator.onLine) return;
      if (hayQueRefrescar(guardadoActual(), BUILD, usuario, Date.now())) {
        guardarTodo(usuario).catch(() => {
          /* se intentará la próxima vez que se abra con internet */
        });
      }
    }, 8000);
    return () => clearTimeout(t);
  }, [usuario, copia]);

  let tipo: "copia" | "red" | null = null;
  if (copia) tipo = "copia";
  else if (!enLinea) tipo = "red";
  if (!tipo || cerrado === tipo) return null;

  // `bottom-36` en el teléfono: más abajo tapaba los botones de tamaño de letra
  // (ReadingControls, `bottom-20`) y la barra de secciones.
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-36 z-[70] mx-auto flex w-fit max-w-[92vw] items-start gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 shadow-lg print:hidden md:bottom-4 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
    >
      <WifiOff className="mt-0.5 h-4 w-4 flex-shrink-0" />
      {tipo === "copia" ? (
        <div>
          <p className="font-semibold">Copia guardada · {fechaCorta(generado, CARGADA)}</p>
          <p className="text-xs opacity-80">
            Sin internet o la red no respondió: puede no ser la última versión.
          </p>
        </div>
      ) : (
        <p className="font-semibold">Sin conexión · lo guardado sigue abriendo</p>
      )}
      <button
        type="button"
        onClick={() => setCerrado(tipo)}
        className="ml-1 rounded-lg p-0.5 opacity-70 hover:opacity-100"
        aria-label="Cerrar aviso"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
