// ─────────────────────────────────────────────────────────────
// Un color por cada sección de la canción (O-83).
//
// Lo pidió **Carlos, el líder de alabanza**, a través de Isaac el 2026-09-13:
// *«que se pueda pintar con color diferente para cada sección de una canción,
// es decir, que intro tenga color verde, la parte A con color rojo y así»*.
// Es el primer encargo que no viene de Isaac.
//
// 🔴 EL COLOR SE ATA A LA PRIMERA PALABRA DE LA ETIQUETA, NO A LA ETIQUETA.
// Esto no es una simplificación: es lo que dijeron los datos. Contadas las
// etiquetas `[...]` de las 87 canciones de producción, hay **más de 300
// distintas** y casi todas aparecen UNA vez, porque llevan pegado el primer
// verso — `[A (cuando nadie me ve...)]`, `[C coro (un gozo pegajoso...)]`,
// `[Intro sinte guitar]`. Un color por etiqueta habría dado 300 colores.
// Su primera palabra, en cambio, es un conjunto CERRADO de dieciséis:
//
//     (sin nombre) 129 · final 85 · a 85 · intro 84 · b 81 · c 71 · d 37
//     e 15 · coda 8 · coro 3 · puente 2 · f 2 · bombo · pitos · banda · cosa
//
// Doce de ellas cubren el 99 %. Las cuatro rarezas —una vez cada una— caen en
// `otras` y se quedan del color de siempre: **lo desconocido no se pinta, y
// sobre todo no revienta**. Si mañana alguien escribe `[Puente 2]` o
// `[Intro 3]`, entra por su inicial sin que nadie toque este archivo.
//
// 🔴 LAS CLASES SE ESCRIBEN ENTERAS, NUNCA ARMADAS A CACHOS. Nada de
// `` `text-${color}-600` ``: Tailwind lee el código como TEXTO y solo genera
// las clases que encuentra escritas. Una clase compuesta en tiempo de
// ejecución no existe en el CSS y el color **no sale**, sin ningún error.
// ⚠️ Y por eso mismo `./src/lib/**` tuvo que entrar en `content` de
// `tailwind.config.ts`: hasta hoy solo se escaneaban `components`, `app` y
// `pages`, así que estas clases, viviendo aquí, no se habrían generado.
//
// LO QUE SE PINTA ES SOLO LA ETIQUETA, y lo eligió Isaac el 2026-09-13
// teniendo delante las tres opciones: los acordes se quedan negros sobre
// blanco. Un fondo de color detrás de los acordes se ve de más lejos, pero se
// lee peor, y esto se usa tocando en el culto.
// ─────────────────────────────────────────────────────────────

/** El tipo de sección, sacado de la primera palabra de su etiqueta. */
export type ClaveSeccion =
  | "intro"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "coro"
  | "puente"
  | "coda"
  | "final"
  | "sinNombre"
  | "otras";

/**
 * La clave de una etiqueta de sección.
 *
 * `[A (cuando nadie me ve...)]` → `a` · `[Intro sinte guitar]` → `intro` ·
 * `[]` y `undefined` → `sinNombre` · `[Bombo]` → `otras`.
 */
export function claveDe(etiqueta?: string | null): ClaveSeccion {
  const limpia = (etiqueta ?? "").trim().toLowerCase();
  if (!limpia) return "sinNombre";

  // La primera palabra, sin lo que lleve pegado: `a (cuando...` → `a`,
  // `b-champeta` → `b`. Se corta por lo que NO es letra ni número, que es
  // como están escritas las etiquetas de verdad.
  const primera = limpia.split(/[^\p{L}\p{N}]+/u).find(Boolean) ?? "";

  const conocidas: Record<string, ClaveSeccion> = {
    intro: "intro",
    a: "a",
    b: "b",
    c: "c",
    d: "d",
    e: "e",
    f: "f",
    coro: "coro",
    puente: "puente",
    coda: "coda",
    final: "final",
  };
  return conocidas[primera] ?? "otras";
}

/** Lo que se le pone a la etiqueta: su clase de color, en claro y en oscuro. */
type Colores = Record<ClaveSeccion, string>;

export type Paleta = {
  id: string;
  nombre: string;
  /** Una línea para el músico, en su idioma. */
  pista: string;
  colores: Colores;
};

// El color «de siempre», para lo que no se pinta. Es el que tiene hoy la
// cabecera, así que apagar el color y caer aquí se ven exactamente igual.
const NEUTRO = "text-slate-800 dark:text-slate-100";

/**
 * Las paletas, elegidas por Isaac en tres opciones hechas y no en doce
 * selectores de color: *«un toque en la tablet en vez de doce»*.
 *
 * 🔴 Los dos tonos de cada color NO son decoración: la página tiene modo
 * oscuro, y un verde que se lee sobre blanco desaparece sobre gris oscuro. Por
 * eso cada clase lleva su `dark:`, y el tono oscuro es más CLARO que el claro
 * (600 sobre blanco, 300 sobre negro). Sin eso, media iglesia —la que toca con
 * la tablet en oscuro— no vería nada.
 *
 * Los dos colores que pidió Carlos por su nombre —**intro verde** y
 * **parte A roja**— son los mismos en las tres paletas. Lo demás se repartió
 * por tonos bien separados entre sí.
 *
 * ⚠️ **Y «bien separados» se comprobó MIRÁNDOLO, no eligiendo a ojo en la
 * tabla.** El primer reparto daba `final` en índigo, y en la captura del culto
 * —donde `Intro · A · B · C · D · Final` salen todas a la vez— el índigo de
 * «Final» y el azul de «B» se confundían. `final` pasó a fucsia, que no se
 * parece a ninguno de los otros seis. Lo que hay que mirar no es si dos colores
 * son distintos, sino si **se distinguen los que aparecen JUNTOS en una
 * canción**, que son la intro, las letras y el final.
 */
export const PALETAS: Paleta[] = [
  {
    id: "suave",
    nombre: "Suaves",
    pista: "Colores discretos, para que no canten más que los acordes.",
    colores: {
      intro: "text-emerald-600 dark:text-emerald-400",
      a: "text-red-600 dark:text-red-400",
      b: "text-blue-600 dark:text-blue-400",
      c: "text-amber-600 dark:text-amber-400",
      d: "text-violet-600 dark:text-violet-400",
      e: "text-cyan-600 dark:text-cyan-400",
      f: "text-lime-600 dark:text-lime-400",
      coro: "text-orange-600 dark:text-orange-400",
      puente: "text-teal-600 dark:text-teal-400",
      coda: "text-pink-600 dark:text-pink-400",
      final: "text-fuchsia-600 dark:text-fuchsia-400",
      sinNombre: NEUTRO,
      otras: NEUTRO,
    },
  },
  {
    id: "fuerte",
    nombre: "Fuertes",
    pista: "Más saturados, para distinguirlos de un vistazo desde lejos.",
    colores: {
      intro: "text-emerald-700 dark:text-emerald-300",
      a: "text-red-700 dark:text-red-300",
      b: "text-blue-700 dark:text-blue-300",
      c: "text-amber-700 dark:text-amber-300",
      d: "text-violet-700 dark:text-violet-300",
      e: "text-cyan-700 dark:text-cyan-300",
      f: "text-lime-700 dark:text-lime-300",
      coro: "text-orange-700 dark:text-orange-300",
      puente: "text-teal-700 dark:text-teal-300",
      coda: "text-pink-700 dark:text-pink-300",
      final: "text-fuchsia-700 dark:text-fuchsia-300",
      sinNombre: NEUTRO,
      otras: NEUTRO,
    },
  },
  {
    id: "extremos",
    nombre: "Solo el principio y el final",
    pista: "Pinta la intro, la coda y el final. Las partes A, B, C… se quedan como están.",
    colores: {
      intro: "text-emerald-700 dark:text-emerald-300",
      a: NEUTRO,
      b: NEUTRO,
      c: NEUTRO,
      d: NEUTRO,
      e: NEUTRO,
      f: NEUTRO,
      coro: "text-orange-700 dark:text-orange-300",
      puente: "text-teal-700 dark:text-teal-300",
      coda: "text-fuchsia-700 dark:text-fuchsia-300",
      final: "text-red-700 dark:text-red-300",
      sinNombre: NEUTRO,
      otras: NEUTRO,
    },
  },
];

// ── Dónde se guarda la elección ───────────────────────────────
//
// 🔴 EN EL APARATO DEL MÚSICO, NO EN LA BASE. Isaac lo dijo al encargarlo:
// *«lo mismo que con el tamaño de la pantalla completa, que cada músico pueda
// elegir si quiere o no esto»*. Es una preferencia de quien LEE, como el tamaño
// de letra o el recorrido de la presentación, no un dato de la canción → **ni
// migración, ni permiso, ni que la elección de uno le cambie la pantalla a
// otro**.
//
// ⚠️ Y se lee SIEMPRE dentro de una función, nunca al cargar el módulo: en el
// servidor no hay `localStorage`, y leerlo en el estado inicial de un
// componente rompe el render del servidor. Es la misma trampa que ya está
// documentada en `PresentationView` con el recorrido.

/** La clave en el almacén del navegador. Sin valor = apagado. */
export const CLAVE_PALETA = "secciones-paleta";

/** La paleta que eligió este músico, o `null` si no eligió ninguna. */
export function leerPaleta(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const guardada = localStorage.getItem(CLAVE_PALETA);
    // Una paleta que ya no existe vale lo mismo que ninguna.
    return paletaPorId(guardada) ? guardada : null;
  } catch {
    // Almacenamiento bloqueado (modo privado, permisos): se sigue sin color.
    return null;
  }
}

/** Guarda la elección; con `null` la borra y vuelve a la página de siempre. */
export function guardarPaleta(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) localStorage.setItem(CLAVE_PALETA, id);
    else localStorage.removeItem(CLAVE_PALETA);
  } catch {
    /* almacenamiento lleno o bloqueado: se sigue sin guardar */
  }
}

/** `null` cuando el color está apagado o la paleta no existe: no se pinta. */
export function paletaPorId(id?: string | null): Paleta | null {
  if (!id) return null;
  return PALETAS.find((p) => p.id === id) ?? null;
}

/**
 * La clase de color de una etiqueta con una paleta dada.
 *
 * Devuelve `undefined` cuando no hay que pintar —color apagado, paleta
 * desconocida— para que quien la use deje su color de siempre. **Nunca
 * devuelve una cadena vacía**: una clase vacía y «no pintar» son la misma
 * cosa vista desde fuera, pero mezclarlas obliga a comprobarlo dos veces.
 */
export function colorDeEtiqueta(etiqueta?: string | null, paletaId?: string | null): string | undefined {
  const paleta = paletaPorId(paletaId);
  if (!paleta) return undefined;
  return paleta.colores[claveDe(etiqueta)];
}
