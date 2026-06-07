# Partituras — Gestor de Canciones

Aplicación web para gestionar, editar y compartir el repertorio de canciones con acordes de **Centro Cristiano La Casa de mi Padre**.

Construida con **Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Supabase**.

---

## ¿Qué hace?

- **Catálogo** de canciones con búsqueda (título / compositor / número de himno) y filtro por categorías.
- **Editor de acordes en cuadrícula** (no es notación de pentagrama): escribes acordes con botones o a mano y se renderizan en compases.
- **Importar canciones desde archivos**: PDF (texto), imagen escaneada (OCR con `tesseract.js`) o texto plano (`.txt`/`.md`). Extrae el contenido y sugiere el título automáticamente.
- **Vista de lectura** con tamaño de letra ajustable y modo claro/oscuro (se recuerdan en el navegador).
- **Aviso de cambios sin guardar** al salir del modo edición o cerrar la pestaña.
- **Autenticación y roles** (admin / músico / lector) con Supabase Auth + Row Level Security.

### Formato de notación (texto en `sheets.content`)

El texto plano se parsea a compases en `TablaturePreview`:

| Elemento | Sintaxis | Ejemplo |
|---|---|---|
| Acorde raíz | `A`–`G` | `C`, `G` |
| Alteración / calidad (pegada) | `#` `b` `m` `7` `maj7` `m7b5` `dim` `sus4` `add9`… | `Dm7`, `Gsus4` |
| Bajo invertido | `/` | `C/G` |
| Duración (divide el compás) | `:n` → `:0.5` `:1` `:2` `:3` `:4` | `C:2 G:2` |
| Silencio | `Z` con duración → `Z:4` `Z:2` `Z:1` | `C:2 Z:2` |
| Barra de compás | `\|` | `C \| G` |
| Repetición | `\|:` … `:\|` | `\|: C G :\|` |
| Sección | `<Intro>` `<Verso>` `<Coro>`… (en su línea) | `<Coro>` |
| Texto/letra (legado) | `(...)` | `(Aleluya)` |

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

Scripts disponibles: `npm run dev`, `npm run build`, `npm start`, `npm run lint`.

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

Todas viven en `supabase/migrations/` y se aplican en orden.

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
  app/
    (auth)/login            → inicio de sesión
    (dashboard)/
      catalog               → catálogo + búsqueda y filtros
      catalog/[id]          → vista/editor de una canción (SongDetailEditor)
      sheets/new            → crear canción nueva
    layout.tsx, page.tsx
  components/
    layout/                 → Sidebar, MobileNav
    sheets/
      TablaturePreview.tsx  → render de la cuadrícula de acordes
      MusicFigures.tsx      → figuras musicales SVG (notas y silencios)
      SongDetailEditor.tsx  → editor + vista de una canción
      ChordToolbar.tsx      → barra de botones de acordes (compartida)
      ImportControls.tsx    → botón de importar archivo (PDF/imagen/texto)
      SheetCard.tsx         → tarjeta del catálogo
      CatalogFilters.tsx    → filtros por categoría
  lib/
    supabase/               → clientes (browser/server)
    chordInput.ts           → lógica compartida para escribir acordes
    songImport.ts           → extracción de texto de PDF/imagen/texto
    utils.ts                → cn()
  middleware.ts             → refresco de sesión / protección de rutas
  types/index.ts            → tipos del dominio
```

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
- [x] Modo claro/oscuro y tamaño de letra en lectura (persistidos)

**Pendiente**

- [ ] Panel de administración (`/admin`)
- [ ] Exportar / imprimir a PDF (`@react-pdf/renderer` ya está instalado, sin usar)
- [ ] Etiquetas, favoritos e historial de versiones en la UI (las tablas ya existen)
- [ ] Subida y visor de PDF original + miniaturas
- [ ] Sincronización con Google Drive
- [ ] PWA / instalable en móvil

---

## Deuda técnica conocida

- **`pdfjs-dist`** carga su *worker* desde un CDN (cdnjs); conviene servirlo localmente para que la importación funcione sin conexión.
- **Tabla `songs`** (migraciones `20240008`/`20240009`, del antiguo módulo de mosaicos) sigue en el esquema pero no se usa en la app.
- **`@react-pdf/renderer`** está instalado pero aún sin usar (pensado para exportar/imprimir).
