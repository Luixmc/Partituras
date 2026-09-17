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
// 🔴 LO QUE SE PINTA ES LA BANDA DE LA SECCIÓN, NO LA LETRA (O-84).
// Isaac, 2026-09-17, con la app delante: *«que pinte la línea donde está el
// texto de la sección, no como tal el texto, es para que se pueda diferenciar
// bien entre sección y sección»*. **Esto SUPERA** lo que él mismo eligió el
// 2026-09-13 —«solo la etiqueta»—, que se decidió sobre dibujos de texto y no
// sobre la pantalla.
//
// 📌 Y el porqué manda sobre el gusto: esto se usa **tocando, con la tablet a
// un metro**. Un nombre de sección de 13 px en verde no separa nada a esa
// distancia; una banda de color sí. El color aquí no decora: **es el corte
// entre un bloque y el siguiente**.
//
// Lo que NO cambia: **los acordes siguen negros sobre blanco** —eso sí lo
// decidió y sigue valiendo—, el PDF sigue sin color, y sigue eligiendo cada
// músico.
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

/**
 * La clase de FONDO de la banda de cada sección, en claro y en oscuro.
 *
 * `null` = **no se pinta**: la banda se queda con el gris de siempre. Es lo que
 * llevan «sin nombre» y «otras», y las letras en la paleta de los extremos.
 */
type Colores = Record<ClaveSeccion, string | null>;

export type Paleta = {
  id: string;
  nombre: string;
  /** Una línea para el músico, en su idioma. */
  pista: string;
  colores: Colores;
};

// `null` = **no se pinta**: la cabecera se queda **exactamente** con las clases
// que ya tenía, así que «el color está apagado» y «esta paleta no pinta esta
// sección» se ven idénticos. Lo usa la paleta de los extremos.
const SIN_PINTAR = null;

// 🔴 O-85 · LA SECCIÓN SIN ETIQUETA TAMBIÉN SE PINTA, y con una banda NEUTRA.
//
// Isaac, 2026-09-17, viendo r79: *«en la sección en la que no tiene nada
// escrito para categorizar no tiene un color representativo»*. Tenía razón, y
// esto corrige un razonamiento mío que era bueno para otra cosa: dejé sin
// pintar la clave más frecuente —129 de unas 500— pensando que pintar lo más
// común es ruido. **Eso vale cuando el color adorna.** Aquí el color SEPARA, y
// una banda gris entre bandas de color es justo el hueco donde el ojo se
// pierde.
//
// 📌 Por qué NEUTRA y no un color más:
//  · `sinNombre` y `otras` significan lo mismo —esto no está categorizado—, así
//    que darles dos tonos distintos diría que son cosas distintas. Comparten.
//  · Los siete tonos que salen JUNTOS en una canción ya están bien separados
//    entre sí (L-291); meter un octavo color los acercaría a todos.
//  · Y neutra no es «sin pintar»: la pizarra es bastante más oscura que el
//    fondo de la cabecera, así que **se ve pintada**, que es lo que él pedía.
const SIN_CATEGORIA = "bg-slate-300 dark:bg-slate-600";

/**
 * Las paletas, elegidas por Isaac en tres opciones hechas y no en doce
 * selectores de color: *«un toque en la tablet en vez de doce»*.
 *
 * 🔴 Los dos tonos de cada banda NO son decoración: la página tiene modo
 * oscuro. Un fondo claro (100/300) sobre la página blanca deja leer el nombre
 * en gris oscuro; el mismo fondo en modo oscuro sería una pared blanca con la
 * letra clara encima, ilegible. Por eso cada clase lleva su `dark:` con el tono
 * **hundido** (900/700), que en oscuro se lee con la letra clara de siempre.
 * Sin esto, media iglesia —la que toca con la tablet en oscuro— no vería nada.
 *
 * 📌 Y por eso la letra NO se toca: el nombre se queda con las clases grises
 * que ya tenía, que son las que el proyecto ya garantiza legibles en los dos
 * modos. Pintar banda Y letra obligaría a cuadrar contrastes a pares.
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
    pista: "Bandas de color suave, para que no canten más que los acordes.",
    colores: {
      intro: "bg-emerald-100 dark:bg-emerald-900",
      a: "bg-red-100 dark:bg-red-900",
      b: "bg-blue-100 dark:bg-blue-900",
      c: "bg-amber-100 dark:bg-amber-900",
      d: "bg-violet-100 dark:bg-violet-900",
      e: "bg-cyan-100 dark:bg-cyan-900",
      f: "bg-lime-100 dark:bg-lime-900",
      coro: "bg-orange-100 dark:bg-orange-900",
      puente: "bg-teal-100 dark:bg-teal-900",
      coda: "bg-pink-100 dark:bg-pink-900",
      final: "bg-fuchsia-100 dark:bg-fuchsia-900",
      sinNombre: SIN_CATEGORIA,
      otras: SIN_CATEGORIA,
    },
  },
  {
    id: "fuerte",
    nombre: "Fuertes",
    pista: "Bandas bien marcadas, para separarlas de un vistazo desde lejos.",
    colores: {
      intro: "bg-emerald-300 dark:bg-emerald-700",
      a: "bg-red-300 dark:bg-red-700",
      b: "bg-blue-300 dark:bg-blue-700",
      c: "bg-amber-300 dark:bg-amber-700",
      d: "bg-violet-300 dark:bg-violet-700",
      e: "bg-cyan-300 dark:bg-cyan-700",
      f: "bg-lime-300 dark:bg-lime-700",
      coro: "bg-orange-300 dark:bg-orange-700",
      puente: "bg-teal-300 dark:bg-teal-700",
      coda: "bg-pink-300 dark:bg-pink-700",
      final: "bg-fuchsia-300 dark:bg-fuchsia-700",
      sinNombre: SIN_CATEGORIA,
      otras: SIN_CATEGORIA,
    },
  },
  {
    id: "extremos",
    nombre: "Solo el principio y el final",
    pista: "Pinta la intro, la coda y el final. Las partes A, B, C… se quedan como están.",
    colores: {
      intro: "bg-emerald-300 dark:bg-emerald-700",
      a: SIN_PINTAR,
      b: SIN_PINTAR,
      c: SIN_PINTAR,
      d: SIN_PINTAR,
      e: SIN_PINTAR,
      f: SIN_PINTAR,
      coro: "bg-orange-300 dark:bg-orange-700",
      puente: "bg-teal-300 dark:bg-teal-700",
      coda: "bg-pink-300 dark:bg-pink-700",
      final: "bg-red-300 dark:bg-red-700",
      sinNombre: SIN_PINTAR,
      otras: SIN_PINTAR,
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
 * La clase de FONDO de la banda de una sección con una paleta dada.
 *
 * Devuelve `undefined` cuando no hay que pintar —color apagado, paleta
 * desconocida, o una sección que esa paleta deja sin pintar— para que quien la
 * use deje la banda de siempre. **Nunca devuelve una cadena vacía**: una clase
 * vacía y «no pintar» son la misma cosa vista desde fuera, pero mezclarlas
 * obliga a comprobarlo dos veces.
 */
export function bandaDeEtiqueta(etiqueta?: string | null, paletaId?: string | null): string | undefined {
  const paleta = paletaPorId(paletaId);
  if (!paleta) return undefined;
  return paleta.colores[claveDe(etiqueta)] ?? undefined;
}
