# Partituras — Gestor de Canciones

Aplicación web para gestionar, editar y compartir el repertorio de canciones con acordes de **Centro Cristiano La Casa de mi Padre**.

Construida con **Next.js 16 (App Router) · React 18 · TypeScript · Tailwind CSS · Supabase**,
desplegada en Vercel con publicación automática en cada push a `main`.

---

## ¿Qué hace?

- **Catálogo** de las ~75 canciones, con búsqueda por título, compositor **y letra**, y filtro por
  categorías. Los administradores pueden filtrar además por estado (publicada / borrador / archivada).
- **Editor de acordes en cuadrícula** (no es notación de pentagrama): escribes acordes con botones o
  a mano y se renderizan en compases, con sus figuras musicales, ligaduras, repeticiones y casillas.
- **Diagramas de acordes**: pulsa cualquier acorde y se abre cómo se toca en **piano, bajo o
  guitarra** — el que elijas, y se recuerda. Cubre los 1.894 acordes del repertorio.
- **Modo trompeta**: quien toca un instrumento en Bb ve la canción **ya transpuesta a su tono**, con
  los dos tonos a la vista (el que suena y el que lee).
- **Pantalla completa** para tocar desde la tablet: pasar de canción, transponer, tamaño de letra
  guardado por canción y dos maneras de recorrer las columnas.
- **Cultos (setlists)**: repertorio ordenado arrastrando, con tono por canción, estado
  (borrador / publicado / archivado), **PDF con las canciones completas** y enlace público para
  quien no tiene cuenta.
- **Letras** de las canciones: escribirlas, leerlas, buscarlas y alternarlas con los acordes a
  pantalla completa.
- **Melodía en pentagrama** *(en preparación, solo administradores)*: se escribe **con el ratón**
  sobre el pentagrama —o a mano en notación ABC—, sección por sección, y se lee **como suena** o
  **como la lee la trompeta** (un tono arriba). A pantalla completa hay un botón que rota
  **acordes → letra → melodía**. Se dibuja con [`abcjs`](https://www.abcjs.net/), cargado de forma
  diferida y **solo en esa pantalla**.
- **Importar canciones desde archivos**: PDF (texto), imagen escaneada (OCR con `tesseract.js`) o
  texto plano. Extrae el contenido y sugiere el título.
- **Vista de lectura** con tamaño de letra ajustable y modo claro/oscuro (se recuerdan en el navegador).
- **Aviso de cambios sin guardar** al salir del editor, de la letra o al cerrar la pestaña.
- **Autenticación y roles** (admin / músico / lector) con Supabase Auth + Row Level Security.
- **`/novedades`**: página pública con lo que va cambiando, contado para los músicos.
- **Instalable como app (PWA)**: se instala desde el propio navegador —sin tienda— y se abre con su
  icono y sin barra de direcciones. El caché del *service worker* lleva el id del despliegue, así
  que cada publicación limpia el anterior; y es *network-first*, o sea que **con internet siempre se
  ve lo último**.
  ⚠️ **No funciona sin conexión**: el *service worker* no toca las peticiones a Supabase, a
  propósito, y las canciones viven ahí. La app abre y no carga nada.
  📌 **`orientation` es `any`** (2026-09-04): la app **sigue al aparato**. Estuvo en
  `portrait-primary` y eso dejaba la app instalada **clavada en vertical**, que es justo al revés de
  como se lee tocando. Ese campo **solo aplica a la app instalada** —en el navegador no hace nada— y
  **iOS lo ignora**; además se lee **al instalar**, así que cambiarlo obliga a reinstalar.

### Formato de notación (texto en `sheets.content`)

El texto plano se parsea a compases en `TablaturePreview`:

> ⚠️ **Esta tabla estuvo mal desde `r10` hasta `r45`**: decía que las secciones se escribían
> `<Coro>`, cuando los corchetes son lo que parte sección y `<...>` es texto centrado. Si vienes de
> una versión vieja del README, lo que vale es esto.

| Elemento | Sintaxis | Ejemplo |
|---|---|---|
| Acorde raíz | `A`–`G` | `C`, `G` |
| Alteración / calidad (pegada) | `#` `b` `m` `7` `maj7` `m7b5` `dim` `sus4` `add9`… | `Dm7`, `Gsus4` |
| Bajo invertido | `/` | `C/G` |
| **Sección** | **`[Coro]`**, en su propia línea — **con corchetes** | `[Intro]`, `[A (Anhelo...)]` |
| **Texto centrado** | **`<lo que sea>`** — se dibuja como un acorde, no parte sección | `<Conteo 1, 2, 3>` |
| Duración | `:0.25` `:0.5` `:0.75` `:1` `:1.5` `:2` `:3` `:4` — también **suelta**, sin acorde | `C:2 G:2`, `:1` |
| Silencio | `Z` con duración | `C:2 Z:2` |
| Barra de compás | `\|` | `C \| G` |
| Repetición | `\|:` … `:\|` | `\|: C G :\|` |
| Casilla 1ª / 2ª vez | `{` … `}1` / `}2` | `\|: C \|: F G :\| { Am }1 { C }2` |
| **Ligadura** | **`~`** suelto o pegado. Encadenar da **un solo arco largo** | `C~ D~ E` |
| **Calderón** | **`^`** pegado | `E^` |
| **Staccato** | **`!`** pegado | `C:1!` |
| **Repetir acorde** | **`%`** | `C \| % \| %` |
| **Paso cromático** | **`-`** entre dos acordes: se va tocando por semitonos | `F# ~ - D` |
| **Salto de fila** | **`;`** — y ademas **impide que la pagina reparta esa seccion**: ahi mandas tu | `C G ; Am F` |
| **Cambio de compás** | el compás en medio de la línea | `\|: 4/4 C \| 6/8 G :\|` |
| Letra bajo el acorde | `(...)` | `(Aleluya)` |

**Disminuido:** se **escribe** `dim` / `dim7` y se **dibuja** `°` / `°7`. El símbolo no se teclea nunca.

**Las secciones largas se reparten solas.** No hay que partir una sección en dos a mano para que
quepa: se escribe entera y, en la presentación, la página mide cuántos compases caben en una fila
y la reparte entre las casillas de la rejilla — **sin bajar nunca de 4 compases por bloque**. Lo
que sigue cae en la casilla siguiente, respetando el recorrido que haya elegido el músico (por
filas o por columnas). Si en una sección se escribe un `;`, esa no se reorganiza: el corte es de
quien lo escribió.

La duración controla el ancho relativo de cada acorde dentro del compás, de modo que el reparto del tiempo se ve en la cuadrícula. Varios acordes entre barras (`\|F G\|`) se muestran juntos, sin líneas divisorias entre ellos. La duración se dibuja como **figura musical** (corchea/negra/blanca/redonda) encima del acorde, y los silencios se dibujan con su figura correspondiente. Toda la notación (figuras y silencios) se renderiza en SVG en `components/sheets/MusicFigures.tsx`.

---

## Puesta en marcha (desarrollo)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de variables de entorno (ver más abajo)
#    .env.local

# 3. Arrancar el servidor de desarrollo
npm run dev      # http://localhost:3000
```

| Script | Para qué |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:3000` |
| `npm test` | Las 139 pruebas |
| `npm run build` | Compilación de producción (es lo que ejecuta Vercel) |
| `npm run verificar` | **Compila SIN romper el servidor de desarrollo**, en otra carpeta |
| `npm start` | Sirve el build de producción en local |
| `npm run export` | Copia de seguridad de los datos a JSON |
| `npm run copy-pdf-worker` | Regenera el *worker* de PDF tras actualizar `pdfjs-dist` |

> ⚠️ **`npm run dev` y `npm run build` no se ejecutan a la vez**: comparten la carpeta `.next` y el
> build deja al servidor de desarrollo roto. Con el servidor encendido, usa **`npm run verificar`**.

---

## Variables de entorno (`.env.local`)

```env
# Supabase (requerido)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> Nota: la sincronización con Google Drive figura en el roadmap pero **aún no está implementada** en el código. Las variables `GOOGLE_*` no son necesarias todavía.

---

## Migraciones de base de datos

Todas viven en `supabase/migrations/` y se aplican en orden. **Hoy son 21**, y **las dos últimas
todavía no están aplicadas**: `20240020` (que un usuario desactivado tampoco pueda leer por la API)
y `20240021` (la columna `sheets.melody`).

> 🔴 **El código publicado NO las necesita, a propósito.** La sección de melodía detecta que la
> columna no existe y lo **dice** —«todavía no se puede guardar»— en vez de fingir que guardó; y la
> melodía se pide en una consulta **aparte**, para que una columna ausente no pueda vaciar la
> pantalla del culto.

> ⚠️ **Una migración ya aplicada no se modifica: se añade una nueva.** La base tiene datos reales en
> uso. Y el orden importa: **primero se publica el código y después se toca la base** — quitar una
> columna que el código publicado todavía pide deja la página vacía sin ningún error visible.

### Con Supabase CLI

```bash
npm install -g supabase
supabase link --project-ref <your-project-ref>
supabase db push
```

### Manualmente (Dashboard → SQL Editor)

Ejecuta en orden:

- `20240001_extensions_types.sql`
- `20240002_profiles.sql`
- `20240003_categories_tags.sql`
- `20240004_sheets.sql`
- `20240005_versions_tags_favorites.sql`
- `20240006_storage_drive.sql`
- `20240007_search_views.sql`
- `20240008_songs.sql` *(tabla `songs` — del módulo de mosaicos, hoy sin uso en la app)*
- `20240009_song_categories.sql` *(idem)*
- `20240010_sheet_categories.sql` *(varias categorías por canción; **aplícala** para usar la multi-categoría en el editor)*

---

## Bucket de almacenamiento

Tras las migraciones, crea el bucket en Supabase Dashboard → **Storage**:

| Campo | Valor |
|---|---|
| Nombre | `sheets` |
| Público | **OFF** (privado, solo URLs firmadas) |
| Límite de tamaño | `20 MB` |
| MIME permitidos | `application/pdf, image/jpeg, image/png, image/webp` |

---

## Esquema de base de datos

```
profiles          ← extiende auth.users (roles: admin / musician / viewer)
categories        ← Himnos, Coros, Adoración, Especiales, Instrumental...
tags              ← etiquetas libres
sheets            ← tabla principal: contenido de acordes + refs a PDF
sheet_versions    ← historial de revisiones por canción
sheet_tags        ← relación N:N sheets ↔ tags
sheet_categories  ← relación N:N sheets ↔ categorías (varias categorías por canción)
favorites         ← marcadores por usuario
drive_sync_log    ← (preparado para sincronización con Drive)
drive_folders     ← (mapea categoría → carpeta de Drive)
songs             ← tabla del antiguo módulo de mosaicos (sin uso en la app)
```

---

## Estructura del proyecto

```
src/
  middleware.ts             → sesión y rutas públicas. Se ejecuta en CADA navegación
  app/
    (auth)/login            → único punto de entrada (no hay registro abierto)
    (dashboard)/            → todo lo que exige sesión
      catalog               → catálogo + búsqueda y filtros
      catalog/[id]          → vista / edición / letra de una canción
      catalog/[id]/present  → pantalla completa de una canción
      sheets/new            → crear canción
      services              → cultos, y services/[id] su editor
      services/[id]/present → modo presentación del culto
      letras                → sección de letras (hoy solo admin)
      melodias              → sección de melodía (hoy solo admin)
      admin                 → gestión de usuarios
    s/[token]               → culto compartido, PÚBLICO y sin cuenta
    imprimir/culto/[id]     → hoja imprimible del culto (fuera del panel, para paginar bien)
    novedades               → comunicado público de cambios
  components/
    sheets/
      TablaturePreview.tsx  → EL CORAZÓN: texto → cuadrícula de acordes
      MusicFigures.tsx      → figuras y silencios en SVG
      SongDetailEditor.tsx  → editor + vista de una canción
      ChordPopover.tsx      → el desplegable al pulsar un acorde
      PianoDiagram · BassDiagram · GuitarDiagram
      LetraPanel.tsx        → escribir y leer la letra
      EditorMelodia.tsx     → escribir la melodía PINCHANDO sobre el pentagrama
      Pentagrama.tsx        → la partitura grabada (carga `abcjs` de forma diferida)
      MelodiaPanel.tsx      → la melodía dentro de la canción, sección por sección
      SeccionRepartida.tsx  → mide y reparte una sección larga entre varios cuadros
    services/
      ServiceEditor.tsx     → armar el culto (arrastrando)
      PresentationView.tsx  → modo presentación
  lib/
    music.ts                → transposición y ortografía de tonos
    sections.ts             → partir la canción en secciones  ← LA ÚNICA, no copiar
    acordes.ts · guitarra.ts → qué notas tiene un acorde y cómo se toca
    transpositores.ts       → instrumentos en Bb (trompeta)
    catalogo.ts             → la consulta del catálogo  ← compartida por 3 pantallas
    melodia.ts              → el modelo de la melodía y su notación ABC  ← LÓGICA PURA
    melodiaBase.ts          → leer la melodía de la base, tolerando que la columna falte
    figuras.ts · reparto.ts → qué figura es cada duración · cómo se reparte una sección
    cultos.ts · letras.ts · navegacion.ts · novedades.ts
    chordInput.ts · songImport.ts · utils.ts
    supabase/               → clientes (navegador / servidor)
  types/index.ts            → tipos del dominio
pruebas/                    → las 187 pruebas (ver más abajo)
supabase/migrations/        → 21 migraciones (las 2 últimas, sin aplicar)
```

> 🔴 **`sections.ts` y `catalogo.ts` son de uso COMPARTIDO a propósito.** Las dos estuvieron
> duplicadas y las dos costaron un fallo en producción: cuando una tercera pantalla necesitó la
> lógica, no supo a cuál de las dos copias llamar. **No las copies: impórtalas.**

> ⚠️ **Y `lib/melodia.ts` no puede importar Supabase.** Todo lo de `src/lib` que esté en la lista
> `MODULOS` de `pruebas/preparar.mjs` lo compila `tsc` a secas para el CI; en cuanto importara un
> cliente, dejaría de compilar allí. Por eso el acceso a la base vive aparte, en `melodiaBase.ts`
> — igual que `catalogo.ts` nunca entró en esa lista.

---

## Roadmap

**Hecho**

- [x] Esquema de BD + RLS
- [x] Autenticación (login) y roles
- [x] Catálogo: explorar, filtrar por categorías, buscar
- [x] Editor de acordes en cuadrícula con vista previa en vivo
- [x] Importar canciones desde PDF, imagen (OCR) o texto, con título sugerido
- [x] Signos de repetición, duraciones (como figura musical), silencios y secciones
- [x] Varias categorías por canción (requiere migración `20240010`)
- [x] Panel de administración (`/admin`, solo admins): crear usuarios, cambiar contraseña y rol, activar/desactivar
- [x] Modo claro/oscuro y tamaño de letra en lectura (persistidos)

- [x] **PDF del culto** con las canciones completas, una por hoja, en horizontal o vertical
- [x] **PWA / instalable** en móvil, con el logo de la iglesia
- [x] **Cultos**: repertorio ordenado arrastrando, tono por canción, estado y enlace público
- [x] **Diagramas de acordes**: piano, bajo y guitarra, con el instrumento recordado
- [x] **Modo trompeta** (instrumentos en Bb): la canción ya transpuesta a su tono
- [x] **Letras** de las canciones: escribir, leer, buscar y alternar con los acordes
- [x] **Pruebas automáticas** (139) y CI en cada push
- [x] `/novedades`: comunicado público de cambios

**Pendiente**

- [ ] Etiquetas, favoritos e historial de versiones en la UI (las tablas ya existen)
- [ ] Subida y visor de PDF original + miniaturas
- [ ] Sincronización con Google Drive
- [ ] Darle sentido al rol `musician`, que hoy hace lo mismo que `viewer`

---

## Deuda técnica conocida

- **`pdfjs-dist`**: el *worker* se sirve desde `public/pdf.worker.min.mjs` (copia local). Si actualizas `pdfjs-dist`, regenera la copia con `npm run copy-pdf-worker`.
- **Tabla `songs`** (migraciones `20240008`/`20240009`, del antiguo módulo de mosaicos) sigue en el esquema pero no se usa en la app.
- **`@react-pdf/renderer`** está instalado y **ya no lo usa nadie**: el PDF del culto se hace con la
  impresión del navegador. Quitarlo es seguro, y de paso desbloquea React 19.
- **El catálogo es legible sin sesión** con la clave pública (`sheets`, `categories`,
  `service_songs`). Los cultos y los borradores **sí** están cerrados. Cerrarlo del todo exige tener
  antes la clave `service_role`, porque `npm run export` depende de esa lectura.
- **Desactivar un usuario no le impide entrar**: `profiles.active` se escribe y no lo lee nadie.
- **`eslint-config-next` sigue en la 14** con Next 16: subirlo exige migrar a ESLint 9. No afecta ni
  a la app ni al CI, que ejecuta `npm test` y `npm run build`.
- **`"strict": false`** en `tsconfig.json`.

---

## Pruebas

```bash
npm test        # 187 pruebas, sin dependencias externas (usa el runner de Node)
```

Compilan `src/lib` con el TypeScript del proyecto y **prueban el archivo real**, no una copia. El CI
las ejecuta en cada push, **antes** del build.

Cubren lo que más ha roto: el tono y su ortografía, las notas de cada acorde, que las posturas de
guitarra **suenen**, la separación en secciones, quién ve qué culto, la cuenta de la trompeta, el
reparto de compases entre cuadros y **la ida y vuelta de la melodía** — que una nota escrita se
guarde y se vuelva a leer con su misma duración y su misma alteración.

📌 Esa última tiene motivo: si al guardar se perdiera un sostenido, **no salta ningún error**. La
partitura se dibuja igual de bien con la nota equivocada, y quien lo descubre es quien la toca.

⚠️ Las 75 canciones reales **no están en el repositorio** (es público). Los arneses que las usan
viven fuera y leen de una copia local.

---

## Historial de versiones

El primo numeraba las publicaciones `r1`…`r30` y mantuvo este archivo hasta `r10`. Desde `r31` lo
retoma Isaac. Lo que ve un músico está contado en **[`CAMBIOS.md`](CAMBIOS.md)** y en la página
pública `/novedades`; esto es el resumen técnico.

| Versión | Qué entró |
|---|---|
| **r31** | Figuras con puntillo, `dim` → `°`, el logo de la iglesia, `/manifest.json` desbloqueado |
| **r32** | El catálogo deja de cortar en 50, todas las categorías por canción, pantalla completa por canción |
| **r34** | Cambiar el nombre de una cuenta; el tamaño de letra guardado por músico y canción |
| **r36** | Una canción puede ir varias veces en el mismo culto (migración `20240015`) |
| **r39** | Las ligaduras (3 fallos), dos maneras de leer las columnas, el tono con bemoles, staccato y duración suelta |
| **r40** | Los acordes se pulsan: diagramas de piano y bajo. Filtro por estado. `<select>` legible en oscuro |
| **r41** | Las notas del acorde, nombradas por grados: `Bb` es `Bb D F`, no `A# D F` |
| **r42** | `/novedades`, la página pública de cambios |
| **r43** | Las letras: escribir, leer, buscar y alternar con los acordes |
| **r44** | Guitarra en los diagramas · el culto tiene estado (migración `20240017`) · seis correcciones que salieron probando con cuenta de lector |
| **r45** | Next 14 → 16 · el caché del *service worker* versionado · `pdfjs-dist` actualizado · la ortografía al transponer la decide el tono destino · el culto no puede quedarse vacío al guardar (migraciones `20240018`/`20240019`) · **139 pruebas y CI** · modo trompeta · **este README, al día otra vez** |
| **r46** | Las secciones al crear una canción · el campo de la letra crece solo y ya no salta el scroll · un usuario desactivado no entra por la web · `parseSections` deja de estar duplicada · **el lint estaba roto desde Next 16** y nadie se enteraba · `strict` activado · el recorrido de pantallas mira **el reloj**, no solo el código |
| **r47** | El silencio de negra que eligió Isaac mirándolo · **doble puntillo** y los silencios de corchea y semicorchea, que no existían · `%` con duración · figuras a 1,6× y el hueco de la celda **calculado**, no escrito · las otras tonalidades en la tarjeta · **las secciones largas se reparten solas** entre los cuadros · la cuadrícula usa todo el ancho · el silencio deja de comerse el compás |
| **r48** | **La melodía en pentagrama** *(en preparación, solo administradores)*: escribirla con el ratón, leerla, la sección `/melodias`, la pestaña en la canción y el tercer modo a pantalla completa. Entra `abcjs` como dependencia, cargada de forma diferida. **187 pruebas** |
