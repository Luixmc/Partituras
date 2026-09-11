"use client";

// ─────────────────────────────────────────────────────────────
// Que la melodía SUENE (O-75, fase 1).
//
// Isaac, 2026-09-10: «que se pueda escuchar si correctamente esa es la nota que
// se está colocando». Eligió él: los sonidos **del servidor de fuera** —como
// con el OCR (P-06), 0 MB en el repositorio— y el instrumento **a elegir**.
//
// 📌 NO HAY DEPENDENCIA NUEVA: `abcjs`, que ya dibuja el pentagrama desde r48,
// trae el sintetizador entero. Se carga igual que en `Pentagrama.tsx`: con
// `import()` diferido, para que no entre en el paquete que baja todo el mundo.
//
// ⚠️ Los sonidos van **uno por nota**, ~25 KB cada uno (trompeta y piano,
// medido el 2026-09-10), desde `paulrosen.github.io` —el autor de `abcjs`—. La
// primera vez que suena una nota se baja; después queda en la caché del
// navegador. **Sin internet no suena**, y eso lo aceptó Isaac a sabiendas.
//
// Este archivo NO entra en las pruebas del CI: toca el audio del navegador. La
// cuenta de QUÉ nota suena —que es lo que puede estar mal sin que nadie se
// entere— vive en `lib/melodia.ts` (`alturaMidi`), y esa sí está probada.
// ─────────────────────────────────────────────────────────────

import { useSyncExternalStore } from "react";

import { VOLUMEN_POR_DEFECTO, volumenValido } from "@/lib/reproduccion";

export type Instrumento = "trompeta" | "piano" | "silencio";

/**
 * Los instrumentos que se pueden elegir.
 *
 * `programa` es el número General MIDI —trompeta 56, piano 0—, que es con lo
 * que `abcjs` decide qué sonidos pedir (`trumpet`, `acoustic_grand_piano`).
 * «Sin sonido» existe a propósito: oír cada nota que se toca es lo que Isaac
 * pidió, pero en un ensayo o en el culto tiene que poder callarse.
 */
export const INSTRUMENTOS: { id: Instrumento; nombre: string; icono: string; programa: number | null }[] = [
  { id: "trompeta", nombre: "Trompeta", icono: "🎺", programa: 56 },
  { id: "piano", nombre: "Piano", icono: "🎹", programa: 0 },
  { id: "silencio", nombre: "Sin sonido", icono: "🔇", programa: null },
];

export const INSTRUMENTO_POR_DEFECTO: Instrumento = "trompeta";

/**
 * De dónde salen los sonidos, FIJADO A MANO.
 *
 * 🔴 Y no es un capricho: el 2026-09-10 se midió la colección `abcjs/` —97 KB
 * por nota— y se le dijo a Isaac. **Era la equivocada.** El registro de red
 * del navegador enseñó que el reproductor pide `FluidR3_GM/`, que pesa
 * **~25 KB por nota**: la cuarta parte. Se fija aquí para que lo que se midió
 * sea lo que se usa, y para que una versión nueva de `abcjs` no cambie de
 * colección —y de peso— sin avisar.
 */
export const SONIDOS = "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/";

// La elección se guarda POR MÚSICO, en su navegador, como el transpositor
// (D-28) y el instrumento del acorde (O-42). Sin migración.
const CLAVE = "melodia-sonido";
const AVISO = "melodia-sonido-cambio";

function leer(): Instrumento {
  try {
    const v = window.localStorage.getItem(CLAVE);
    return INSTRUMENTOS.some((i) => i.id === v) ? (v as Instrumento) : INSTRUMENTO_POR_DEFECTO;
  } catch {
    return INSTRUMENTO_POR_DEFECTO; // ventana privada o almacenamiento bloqueado
  }
}

export function guardarInstrumento(id: Instrumento) {
  try {
    window.localStorage.setItem(CLAVE, id);
  } catch {
    /* almacenamiento lleno o bloqueado: se sigue sin guardar */
  }
  // Avisa a los editores abiertos en ESTA pestaña; el evento `storage` solo
  // llega a las otras.
  window.dispatchEvent(new Event(AVISO));
}

function suscribir(avisar: () => void) {
  window.addEventListener(AVISO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(AVISO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

/**
 * El instrumento elegido, leído de forma que el servidor y el navegador no se
 * contradigan al pintar.
 *
 * 📌 Con `useState` + un efecto que leyera `localStorage`, el lint avisa
 * —«setState dentro de un efecto»— y el botón parpadearía un cuadro con el
 * valor por defecto. `useSyncExternalStore` es la forma que tiene React para
 * leer algo que vive fuera de él.
 */
export function useInstrumento(): Instrumento {
  return useSyncExternalStore(suscribir, leer, () => INSTRUMENTO_POR_DEFECTO);
}

// ── El VOLUMEN y la CUENTA DE ENTRADA (O-75, fase 3) ──
//
// Se recuerdan igual que el instrumento: en el navegador de cada músico, y con
// el mismo aviso para que todo lo abierto en la pestaña se entere.
const CLAVE_VOLUMEN = "melodia-volumen";
const CLAVE_ENTRADA = "melodia-cuenta";

function leerTexto(clave: string): string | null {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function guardarTexto(clave: string, valor: string) {
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    /* almacenamiento lleno o bloqueado: se sigue sin guardar */
  }
  window.dispatchEvent(new Event(AVISO));
}

const leerVolumen = () => {
  const v = leerTexto(CLAVE_VOLUMEN);
  return v == null ? VOLUMEN_POR_DEFECTO : volumenValido(Number(v));
};

export function useVolumen(): number {
  return useSyncExternalStore(suscribir, leerVolumen, () => VOLUMEN_POR_DEFECTO);
}

export function guardarVolumen(v: number) {
  guardarTexto(CLAVE_VOLUMEN, String(volumenValido(v)));
}

export function useEntrada(): boolean {
  return useSyncExternalStore(suscribir, () => leerTexto(CLAVE_ENTRADA) === "si", () => false);
}

export function guardarEntrada(si: boolean) {
  guardarTexto(CLAVE_ENTRADA, si ? "si" : "no");
}

/**
 * Toca UNA nota, corta, con el instrumento elegido.
 *
 * ⚠️ **Nunca rompe el editor.** Si el navegador no tiene audio, si no hay
 * internet o si el servidor de los sonidos no contesta, simplemente no suena:
 * escribir la melodía tiene que seguir funcionando igual.
 *
 * @param midi         La altura, en números MIDI (60 = do central)
 * @param instrumento  El elegido; con «silencio» no hace nada
 * @param volumen      De 10 a 100 %, el mismo del reproductor (fase 3)
 */
export async function tocarNota(
  midi: number,
  instrumento: Instrumento,
  volumen: number = VOLUMEN_POR_DEFECTO
): Promise<void> {
  const inst = INSTRUMENTOS.find((i) => i.id === instrumento);
  if (!inst || inst.programa == null) return;
  try {
    const abcjs = await import("abcjs");
    if (!abcjs.synth.supportsAudio()) return;
    // Media redonda en un compás de 1,2 s = 0,6 s: lo justo para reconocer la
    // nota sin que se monte con la siguiente si se colocan deprisa.
    await abcjs.synth.playEvent(
      // 80 es la fuerza que tenía desde la fase 1: el 100 % suena igual que antes.
      [{ pitch: midi, instrument: inst.programa, duration: 0.5, volume: Math.round((80 * volumenValido(volumen)) / 100), start: 0, gap: 0 }],
      undefined,
      1200,
      SONIDOS
    );
  } catch {
    /* sin sonido: no hay nada que hacer y el editor sigue */
  }
}
