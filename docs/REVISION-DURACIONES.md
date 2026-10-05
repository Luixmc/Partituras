# Revisión de duraciones — 2026-10-05

> Pedido de Isaac (2026-10-05): *«quiero me digas que canciones tienen las duraciones mal escrita para
> corregirlas»*. **Las corrige él**; aquí no se tocó la base. Copia leída: `_RESPALDOS\Partituras-datos-2026-10-05-09h28h36`.

## Cómo se buscó

Con **el mismo `parseMeasures` de la página** (sacado de `TablaturePreview.tsx` y compilado al vuelo) y el
mismo `duracionDe`, sobre las **93 canciones y 26 versiones**: **2.359 compases con acordes**, de los que
**466** llevan duración en todos sus acordes. Tres criterios:

1. **Duración que no es ninguna de las 15 figuras** (`:1.25`, `:5`…) → **ninguna**.
2. **Duración que la página no lee** (`C:1,5`, `F;2`…) → **ninguna**.
3. **Compás con todo medido cuya suma no da el compás** → **20 compases en 7 canciones**.

El detector se probó antes con errores puestos a propósito (`C:1.25`, `D:1,5`, `F;2`, compases cortos y
largos, 6/8): los cazó todos — el `F;2` solo después de arreglarlo, porque la página bota el `;` y deja un
«2» suelto.

⚠️ **Lo que NO se puede revisar así:** los **1.893 compases sin duración** (un acorde que ocupa el compás
entero no tiene suma que comprobar). Ahí solo vale mirarlos con las figuras.

## Lo que salió

| Canción | Dónde | Está escrito | Qué pasa | Probable arreglo (lo decide Isaac) |
|---|---|---|---|---|
| **La Bondad De Dios** | A (Te amo Dios…), compás 5 | `C7:2 Dm7:2 Bb:2 F:1 C/E:1` | **8 tiempos en un compás de 4** | Falta una barra: `C7:2 Dm7:2 \| Bb:2 F:1 C/E:1` |
| **Cielos Abiertos** | C Interludio c.4 · D c.1 y c.3 | `A7:3 F#m7:3` · `Em7:3 A/C#:3` · `%:3 z:3` | En **6/8** el compás entero son **3 tiempos** (`:3` = blanca con puntillo). Dos `:3` son **dos compases** | Si cada acorde es **medio compás**: `:1.5` (negra con puntillo). Parece contado en corcheas |
| **Simplemente Alaba** | Intro, compás 2 | `C/G:3.5 G:0.25` | **3,75 de 4** | ¿`G:0.5`? (3,5 + 0,5 = 4) |
| **Simplemente Alaba** | A (Dios no rechaza…), toda | `G:2 G/B:2`, `C:3 F:1`… | Suman 4, pero la sección **no dice `4/4`** y queda en el **`2/4`** con que acaba la Intro | **No es de duraciones**: poner `4/4` al empezar A, como en B, C, D y E |
| **Quiero Conocer A Jesús (Yeshúa)** | F (Nuestro Dios…), c.6–7 | `G:3 \| G/B:1` | 3 en un compás y 1 en el siguiente | ¿Sobra la barra? `G:3 G/B:1` en uno |
| **Dios Ha Sido Fiel** | Intro, compás 1 | `2/4 C:0.5 B:0.5` | **1 de 2** tiempos | ¿Anacrusa, o `C:1 B:1`? |
| **Dios Ha Sido Fiel** | A (Puede oscurecer…), c.11 | `Am7:2` | **2 de 4**, solo | ¿Falta el otro acorde, o es un compás de 2/4? |
| **Cada Vez** | C (Porque todo…), casilla 2 | `Amaj7:2 E7:1` | **3 de 4** | ¿`E7:2`? |
| **Es Por Fe** | Final Coda | `Bm7:0.5 Bm7:0.25 z:1.5` | **2,25 de 4**, último compás | Un final puede quedar corto; ¿el `:0.25` es `:0.5`? |

## Segunda pasada, después de que Isaac corrigiera (2026-10-05, 9:43)

Copia `Partituras-datos-2026-10-05-09h43h01`. Solo cambiaron **esas 7 canciones**.

| Canción | Qué hizo | Queda |
|---|---|---|
| La Bondad De Dios | puso la barra: `C7:2 Dm7:2 \| Bb:2 F:1 C/E:1` | ✅ |
| Cielos Abiertos | los `:3` → `:1.5` en los tres compases | ✅ |
| Simplemente Alaba | `G:0.25` → `G:0.5`, y `4/4` al empezar A | ✅ |
| Quiero Conocer A Jesús | quitó la barra: `G:3 G/B:1` | ✅ |
| Cada Vez | casilla 2: `Amaj7:3 E7:1` | ✅ |
| Es Por Fe | `Bm7:0.5 Bm7:0.25 z:0.25 z:3` | ✅ |
| Dios Ha Sido Fiel | A c.11 → `Am7` entero ✅ · y `D/D:2` → `G/D:2` (eso lo vio él) · **la Intro**: quitó el `2/4` y `C:0.5 B:0.5` vale 1 de 4 | ✅ **es anacrusa** (Isaac, 2026-10-05: *«es anacrusa la canción»*) |

## Si se quiere volver a pasar

**`npm run duraciones`** (desde el 2026-10-05, lo pidió Isaac). Lee la base en vivo; con una copia,
`npm run duraciones -- <carpeta>`. La anacrusa de «Dios Ha Sido Fiel» sale como **ya vista**, no como error.
