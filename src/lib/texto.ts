// ─────────────────────────────────────────────────────────────
// Comparar texto como lo escribe la gente, no como está guardado (O-72).
//
// Isaac, 2026-09-05: «quiero que las canciones con tildes me aparezcan
// buscándolo así sea sin tilde; por ejemplo, si busco "Aquí Te Esperaré" pero
// no lo busco así sino "aqui" o "esperare", me salga la canción».
//
// 🔴 POR QUÉ ESTO VIVE EN `lib/` Y NO DENTRO DE CADA BUSCADOR: hay **cuatro**
// —catálogo, letras, melodías y el editor de cultos— y ya se pagó una vez tener
// la misma lógica repetida en varios sitios (P-09, `parseSections` duplicada, y
// la duración en cuatro copias en O-70). Aquí, además, la cubre el CI.
//
// 📌 Y por qué no lo hace la base de datos, que sería lo natural: `ilike` **no
// ignora las tildes**, y para que las ignore hace falta la extensión `unaccent`
// — o sea, una MIGRACIÓN, que hoy está bloqueada (§9.1). Con 72 canciones,
// filtrar aquí cuesta 39 KB por búsqueda, medido. Cuando el día de mañana haya
// acceso a la base, esto se puede mover allí sin que cambie lo que ve nadie.
// ─────────────────────────────────────────────────────────────

/**
 * El mismo texto, sin tildes, sin mayúsculas y sin espacios de sobra.
 *
 * `"Aquí Te Esperaré"` → `"aqui te esperare"`.
 *
 * ⚠️ **La `ñ` se conserva a propósito.** `normalize("NFD")` la parte en `n` +
 * virgulilla y quitarla convertiría «año» en «ano», que en un cancionero de
 * iglesia es exactamente lo que no se quiere. Se rescata antes de quitar el
 * resto de acentos.
 */
export function sinTildes(texto: string): string {
  return texto
    .normalize("NFD")
    // La ñ/Ñ se recompone antes de barrer los acentos.
    .replace(/ñ/g, "ñ")
    .replace(/Ñ/g, "Ñ")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * ¿`texto` contiene `busqueda`, mirando sin tildes ni mayúsculas?
 *
 * Con la búsqueda vacía devuelve `true`: «no ha escrito nada» significa «sale
 * todo», que es lo que espera quien borra la caja de búsqueda.
 *
 * 📌 Se busca por TROZO, no por palabra entera —«naveg» encuentra «navegaré»—,
 * que es como se busca cuando uno se acuerda a medias de una frase. Eso ya era
 * así con `ilike %…%` y no se cambia.
 */
export function contiene(texto: string | null | undefined, busqueda: string): boolean {
  const aguja = sinTildes(busqueda);
  if (!aguja) return true;
  return sinTildes(texto ?? "").includes(aguja);
}

/**
 * ¿Alguno de estos campos contiene la búsqueda? Los vacíos se ignoran.
 *
 * Es el caso de siempre: una canción se busca por título, por autor **y por lo
 * que dice la letra** (J.3) — *«¿cómo se llama la que dice…?»* es la pregunta
 * que más se hace en un grupo de alabanza.
 */
export function algunoContiene(campos: (string | null | undefined)[], busqueda: string): boolean {
  if (!sinTildes(busqueda)) return true;
  return campos.some((campo) => campo && contiene(campo, busqueda));
}
