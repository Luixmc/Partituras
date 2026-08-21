# CLAUDE.md — Memoria técnica de Partituras

> **ÚNICO documento de referencia del proyecto. Se actualiza en el MISMO cambio que el
> código, sin pedir permiso.** Tiene que permitir abrir un chat nuevo, decir «lee el
> CLAUDE.md y continúa», y seguir sin que Isaac explique nada otra vez.

> ### Las dos reglas que se pierden si no se ven al leer el proyecto
>
> **REGLA 0 — Lo que Isaac dicta se escribe ANTES de programarlo.** En la sección que le
> toca, no solo en el historial. Aunque no se vaya a hacer hoy, aunque sea una opinión o un
> descarte, aunque sea una corrección a una respuesta mía. Lo que quede **pendiente va a §9,
> nunca solo a §13**. Si la conversación se corta, lo escrito es lo único que sobrevive.
>
> **REGLA DEL COMUNICADO — cada cambio que se PUBLICA se anota en `CAMBIOS.md`**, en la
> sección de su fecha y **en lenguaje de usuario**: qué nota quien abre la página, no qué archivo
> se tocó. Isaac lo pidió el 2026-08-20 para poder avisar a la gente de la iglesia de lo que va
> cambiando. Es un documento **para leer**, no un historial técnico — ese es §13 de aquí.
>
> **REGLA DE LA CARPETA COMPARTIDA — se repasa CADA tanda y se dice cuáles de los cuatro
> archivos se tocaron**, o que no había nada que tocar. Callarse no vale.
> `C:\Users\TECSISTEMAS\Documents\_CLAUDE-COMPARTIDO\` → `LECCIONES.md`, `PROYECTOS.md`,
> `CONVENCIONES.md`, `NUEVO-PROYECTO.md`.

---

## 1 · Guía rápida para la IA (léeme primero)

**Qué es.** Cancionero web con acordes del **Centro Cristiano La Casa de mi Padre**. No es
notación de pentagrama: es un **editor de acordes en cuadrícula**, donde cada celda es un
acorde con su figura musical.

**Para quién.** Los músicos de la iglesia. El caso de uso real es **tocar en el culto leyendo
desde una tablet**.

**La pregunta que responde.** *«¿Qué tocamos este domingo, en qué tono, y cómo lo leo mientras
toco?»*

**Arquitectura en una línea.** Next.js 14 (App Router) + React 18 + TypeScript + Tailwind
sobre Supabase (Postgres + Auth + RLS), desplegado en Vercel con publicación automática en
cada push a `main`.

### ⚠️ Lo que hay que comprobar ANTES de tocar código

1. **El repositorio es de su primo (`Luixmc`), pero QUIEN MANTIENE LA PÁGINA AHORA ES ISAAC.**
   Isaac le pidió permiso para encargarse de las actualizaciones y su primo se lo dio: **el
   primo ya no va a hacer correcciones** (aclarado por Isaac el 2026-08-20). Aun así el dueño
   del repositorio, del hosting y de la base sigue siendo el primo → **Nunca `push --force`,
   nunca reescribir historial, nunca borrar ramas. Nunca `commit` ni `push` sin pedírselo a
   Isaac** (ver §11). Que Isaac sea el mantenedor **no** convierte el permiso en permanente.
2. **Cada push a `main` PUBLICA en producción en menos de un minuto**, sin que nadie apriete
   nada, y sin que Isaac pueda ver los logs (§6). Un push a `main` es un despliegue.
3. **La base de datos de producción tiene datos reales en uso** (~75 canciones, 2 cultos).
   No ejecutar nada contra ella sin decírselo a Isaac (D-04).
4. **Las migraciones del repositorio NO son la fuente de la verdad de la base de datos.**
   No coinciden (T-01). Antes de razonar sobre permisos, comprobar las políticas reales.
5. **No hay ni una prueba, ni CI.** 7.029 líneas de TypeScript sin red de seguridad.

### Cuándo se puede decir que algo quedó corregido

No basta con que compile. Hacen falta las tres:

1. `npm run build` termina sin errores.
2. Se prueba el flujo completo **en el navegador** (`npm run dev`), como lo haría un músico.
3. Si el cambio afecta a lo que ve el usuario final, **se comprueba en
   `https://partituras-blush.vercel.app` después del despliegue** — y recargando con
   **Ctrl+F5**, porque el service worker cachea (T-02). Reportar el resultado de las tres.

---

## 2 · Cómo se ejecuta y cómo se prueba

### 2.1 Comandos exactos

```bash
cd C:\Users\TECSISTEMAS\Documents\Partituras\repo
npm install          # 524 paquetes, 350–500 MB la primera vez
npm run dev          # http://localhost:3000
npm run build        # comprobación real de que no se rompió nada
npm run lint
npm start            # sirve el build de producción en local
npm run export       # copia de seguridad de los datos a JSON (§12.1)
```

⚠️ **`npm run dev` y `npm run build` NO se ejecutan a la vez**: comparten la carpeta `.next` y
el build deja al servidor de desarrollo roto (T-04). **Para comprobar que algo compila con el
servidor encendido: `npm run verificar`**, que compila aparte.

No hay `npm test`: **no existe ninguna prueba** (P-11).

### 2.2 El `.env.local` (no se sube: `.gitignore:9`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://pcayahwnxbigiuhvtwhd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clave anon — pública, va en el navegador>
SUPABASE_SERVICE_ROLE_KEY=<clave maestra — FALTA, ver §9>
```

- La `anon` es **pública por diseño** y ya está puesta en el `.env.local` local.
- La **`service_role` se salta TODA la seguridad de filas**. Sale del panel de Supabase →
  Settings → API. Solo la usa `/admin` para crear usuarios
  (`src/lib/supabase/server.ts:32-38`). Sin ella el resto de la app funciona.

### 2.3 Cómo VER una página protegida sin navegador (para verificar de verdad)

Casi todo el proyecto exige sesión, así que `curl` a pelo siempre devuelve el login y no se
puede comprobar nada. Existe **una cuenta de prueba creada por Isaac el 2026-08-20**
(`pruebaclaude@gmail.com`, rol **lector**; la contraseña la tiene él y **no se escribe aquí**,
porque este archivo va a un repositorio **público**).

Con ella se puede entrar por línea de comandos:

1. `POST /auth/v1/token?grant_type=password` contra Supabase con el correo y la contraseña →
   devuelve la sesión en JSON.
2. `@supabase/ssr` guarda esa sesión en una cookie llamada `sb-<ref>-auth-token`, con el JSON
   **codificado en base64 y con el prefijo `base64-`** (si pasa de ~3180 caracteres, se parte en
   `.0`, `.1`…).
3. Con esa cookie, `curl -b cookies.txt http://localhost:3000/catalog` ya devuelve la página
   real y se puede contar lo que haya que contar.

⚠️ **Al comprobar si una página falló, NO buscar `404: This page could not be found`**: ese
texto está en el HTML de **todas** las páginas del App Router —es la plantilla de «no
encontrado» que Next incluye siempre— y da un **falso positivo**. Pasó en la Fase B. Buscar
`Application error`, o mejor, comprobar que **sí está** lo que se espera ver.

### 2.4 El contrato del despliegue (aquí no hay `.exe`)

Este proyecto **no genera un ejecutable**: el entregable es el sitio web. La regla de
verificación en el `.exe` de los otros proyectos de Isaac se traduce aquí a:
**lo que vale es lo que se ve en `partituras-blush.vercel.app`, no lo que compila en local.**

---

## 3 · Regla de verificación

**Nada está arreglado hasta verlo funcionando en el sitio publicado, recargando con Ctrl+F5.**

El motivo no es ceremonia: entre «hice el push» y «el músico lo ve» hay **tres capas** que
pueden mentir —el build de Vercel (que Isaac no puede ver, §6), el caché de Vercel y el
**service worker** (T-02)—. Un cambio puede estar desplegado y perfecto, y aun así el
navegador del músico seguir enseñando lo viejo.

Si el cambio toca la presentación en el culto, además hay que **simular el flujo completo**:
entrar → abrir el culto → modo presentación → pantalla completa → pasar canciones.

---

## 4 · Estructura del proyecto

★ = leer antes de tocar el núcleo.

```
repo/
  src/
    middleware.ts ★              Sesión y rutas públicas. Se ejecuta en CADA navegación
    app/
      (auth)/login/              Único punto de entrada. /signup NO existe (P-08)
      (dashboard)/               Todo lo que exige sesión
        layout.tsx               Carga el perfil y monta barra lateral + tema
        catalog/                 Las ~75 canciones: búsqueda y filtro por categoría
        catalog/[id]/            Ver / editar una canción
        sheets/new/              Crear canción (solo admin)
        services/                Cultos (setlists)
        services/[id]/           Editor del culto
        services/[id]/present/   Modo presentación
        services/actions.ts ★    Server actions de cultos. requireAdmin() vive aquí
        admin/                   Gestión de usuarios (solo admin) + actions.ts
      s/[token]/                 Culto compartido, PÚBLICO y sin cuenta
      s/[token]/present/         Presentación del culto compartido
    components/
      sheets/
        TablaturePreview.tsx ★   EL CORAZÓN (566 líneas): texto → cuadrícula de acordes
        MusicFigures.tsx         Figuras y silencios en SVG
        SongDetailEditor.tsx     Editor + vista de una canción (674 líneas)
        SongKeyVersions.tsx      Versiones de la canción en otras tonalidades
        ChordToolbar.tsx         Botonera de acordes
        ImportControls.tsx       Importar PDF / imagen (OCR) / texto
      services/
        ServiceEditor.tsx        Armar el culto (786 líneas)
        PresentationView.tsx ★   Modo presentación (450 líneas). Lo último que se tocó
    lib/
      music.ts ★                 Transposición de acordes
      sections.ts                Partir el contenido en secciones "[Coro]"
      chordInput.ts              Escribir acordes respetando espacios
      songImport.ts              Extraer texto de PDF / OCR / texto plano
      supabase/{client,server}.ts  Clientes de navegador y de servidor
    types/index.ts               Tipos del dominio
  supabase/migrations/           14 migraciones ⚠️ desincronizadas con la BD (T-01)
  public/sw.js                   Service worker ⚠️ causa de T-02
  layout.tsx                     ⚠️ HUÉRFANO en la raíz, no lo usa nadie (P-10)
```

### El formato de acordes (la sintaxis REAL, no la del README)

⚠️ **El `README.md` está desactualizado y se equivoca en esto** (P-07). Lo que vale:

| Elemento | Sintaxis | Dónde se implementa |
|---|---|---|
| Acorde | `C`, `Dm7`, `Gsus4`, `C/G` | `TablaturePreview.tsx:192` |
| Disminuido | se escribe **`dim`** / **`dim7`** · se dibuja **`°`** / **`°7`** (D-08b) | `ChordToolbar.tsx` · `formatSuffix` |
| Duración | `:0.25` `:0.5` `:1` `:1.5` `:2` `:3` `:4` | `TablaturePreview.tsx:196` |
| Silencio | `Z:4`, `Z:2`… | `TablaturePreview.tsx:185` |
| Barra de compás | `\|` | `TablaturePreview.tsx:118` |
| Repetición | `\|:` … `:\|` | `TablaturePreview.tsx:108-117` |
| Casilla 1ª/2ª vez | `{` … `}1` / `}2` | `TablaturePreview.tsx:93-107` |
| **Sección** | **`[Coro]`** ← corchetes, NO `<Coro>` | `sections.ts:12` |
| **Texto amarillo** | **`<lo que sea>`** ← se dibuja como un acorde | `TablaturePreview.tsx:163` |
| Letra bajo el acorde | `(aleluya)` | `TablaturePreview.tsx:171` |
| Repetir acorde | `%` | `TablaturePreview.tsx:149` |
| Ligadura | `~` suelto, o pegado (`C~`) | `TablaturePreview.tsx:131,143` |
| **Ligadura sobre varios acordes** | **encadenar**: `C~ D~ E` → **UN arco** de `C` a `E`, por encima del `D`. Con los que hagan falta en medio | **D-19** |
| Calderón | `^` pegado (`E^`) | `TablaturePreview.tsx:138` |
| **Staccato** | **`!` pegado** (`C:1!`) | D-08 · O-03. ✅ **Hecho** |
| **Paso por semitonos** | **`-`** entre dos acordes: se va tocando cromático del uno al otro. Ej.: `F# ~ - D` | Isaac, 2026-08-20. **No estaba escrito en ninguna parte** |
| Salto de fila | `;` | `TablaturePreview.tsx:124` |
| Cambio de compás | `6/8` inline | `TablaturePreview.tsx:155` |

---

## 5 · Decisiones y por qué

| # | Decisión | Por qué | Fecha |
|---|---|---|---|
| **D-01** | **Nunca `commit` ni `push` sin pedírselo a Isaac.** Cada permiso es para un trabajo concreto, **nunca permanente** | El repositorio es del primo y no quiere pisarle nada | 2026-08-19 |
| **D-02** | **Nunca `push --force`, ni reescribir historial, ni borrar ramas** | Igual: repositorio compartido | 2026-08-19 |
| **D-03** | **Se trabaja en rama aparte, no sobre `main`** | Un push a `main` es un despliegue a producción (§6) | 2026-08-19 |
| **D-04** | **Una migración existente NO se modifica: se añade una nueva.** Y no se ejecuta nada contra la BD de producción sin decírselo | Las viejas ya están aplicadas en una base con datos reales | 2026-08-19 |
| **D-05** | **Que la base de datos la comparta el proyecto de cartas (`tcg_*`) NO es un problema.** DESCARTADO como asunto a resolver | Decisión explícita de Isaac: *«si pero eso no importa»* | 2026-08-19 |
| **D-06** | **Se le pide al primo que invite a Isaac al proyecto de Vercel** | Sin eso Isaac publica a ciegas: no ve logs, ni variables, ni puede revertir (§6) | 2026-08-19 |
| **D-07** | La rama de trabajo se llama **`isaac/arranque`** | Deja claro de quién es y que no toca lo del primo | 2026-08-19 |
| **D-08** | **El staccato se escribe con `!` pegado al token** (`C:1!`) | Isaac delegó la elección. **El punto `.` queda DESCARTADO**: chocaría con `:1.5` y `:0.25` y volvería ambiguas las 75 canciones ya escritas. `!` no se usa hoy para nada y sigue el patrón del calderón `^` (O-03) | 2026-08-20 |
| ~~**D-09**~~ | ~~El tamaño de presentación se guarda en la base de datos, por canción~~ | **SUPERADA el 2026-08-20 por D-09b.** Se había entendido «para todos los que abran ese culto» como un valor único compartido | 2026-08-20 |
| **D-08b** | **Se ESCRIBE `dim`, se LEE `°`.** El botón dice «dim», escribe `dim`, y la cuadrícula dibuja `°`. **El símbolo NO se teclea nunca** | Isaac lo pidió así el 2026-08-20: *«que arriba en la edición y donde se escribe a mano diga dim, pero que en la lectura aparezca °»*. Antes se había hecho al revés (el botón escribía `°`) y **dejó de reconocer el botón**, porque lo busca por su nombre. **Esto supera lo que decía D-08 sobre el disminuido**; lo del staccato con `!` sigue en pie | 2026-08-20 |
| **D-09b** | **El tamaño de presentación se guarda POR MÚSICO Y POR CANCIÓN, en el navegador** (`localStorage`) | Isaac aclaró: *«quería que cada músico pudiese guardar a su manera el tamaño»*. Al ser de cada uno, **ya no hace falta migración ni tocar producción**, y funciona para lectores y músicos, que no tienen permiso de escritura. Además el tamaño ideal depende de la **pantalla** (tablet, móvil, PC), así que guardarlo por aparato es más correcto que sincronizarlo | 2026-08-20 |
| **D-11** | **La exportación de datos se guarda en JSON**, un archivo por tabla más uno completo | Isaac lo delegó (*«guárdalo como lo veas mejor y para compatibilidad»*) y aclaró que el JSON de sus otros proyectos venía heredado, no elegido. JSON porque se lee sin herramientas, permite volver a cargar los datos y cumple su regla de «que no quede atrapado» | 2026-08-20 |
| **D-12** | **El icono es el `.ico` sin fondo para la pestaña y el `.png` de 500×500 transparente para la app del móvil** | De los cuatro archivos que pasó Isaac, el `.ico` «removebg» trae **6 tamaños con transparencia** (16, 32, 48, 64, 128, 256) generados a medida → pestaña nítida. **Descartados:** el `.jpeg` (compresión con pérdida y **esquinas negras**) y el `.ico` con fondo negro (se vería un cuadrado negro en pestañas de tema oscuro) | 2026-08-20 |
| **D-18** | **Se mantiene `CAMBIOS.md`**, un comunicado en lenguaje de usuario con lo que va cambiando en la página | Isaac, 2026-08-20: *«ve anotando todos los cambios que se están haciendo desde el día de hoy, ya que quiero hacerle como un comunicado… en la que notifique los cambios que se han hecho de la página»*. → Se escribe **para los músicos**, no para programadores: nada de nombres de archivo ni de migraciones. Lo de dentro va en un apartado aparte y corto | 2026-08-20 |
| **D-16** | **El número de himno NO se muestra ni se busca en ninguna pantalla** | Isaac, 2026-08-20: *«quiero quitarle a las tarjetas el Nº, borra todo rastro, que no salga en la información de las canciones»*. **Ampliado ese mismo día: también se borra de la BASE** (*«bórrala de todo, pero que quede la canción claro está»*). Migración `20240016`. ⚠️ **Se pierde un dato**: «Amado de mi Alma» tenía `hv-018`. La canción no se toca | 2026-08-20 |
| **D-17** | **Los 6 borradores NO se publican** | Isaac, 2026-08-20: *«se van a dejar así, hasta que algo lo necesite, por ahora no»*. → **No tocar su estado.** Siguen invisibles para músicos y lectores, y visibles para administradores | 2026-08-20 |
| **D-13** | **Isaac maneja la página él solo.** Los 6 borradores los puso él; nadie más toca el contenido | Lo aclaró el 2026-08-20: *«yo soy el que puso las canciones en borradores, nadie más, yo soy el que maneja la página totalmente»*. → **No suponer que hay otras manos**: si aparece algo raro en los datos, es suyo y tendrá su motivo. Preguntarle antes de «corregir» nada | 2026-08-20 |
| **D-14** | **La cuenta de prueba se queda en ADMINISTRADORA**, para ver lo mismo que ve Isaac | Decisión suya del 2026-08-20: *«te voy a dejar la cuenta en administrador... cuando necesites algo en lector o músico me dices»*. Sigue en pie: **con esa cuenta solo se MIRA**, no se tocan datos sin permiso | 2026-08-20 |
| **D-15** | **En la pantalla completa, «la siguiente» respeta el filtro de categoría** | Isaac, 2026-08-20: *«teniendo filtrada la categoría, la siguiente que debe mostrar es la que estaba viendo en la categoría, no del catálogo entero»* (O-16) | 2026-08-20 |
| **D-10** | **El PDF del culto se hace con la impresión del navegador**, no rehaciendo el dibujo | Reutiliza el render que ya existe, sale idéntico a la pantalla y no crea un segundo motor de dibujo que mantener (O-08) | 2026-08-20 |

---

## 6 · Dónde quedan los datos y quién los puede ver

### El despliegue (comprobado con evidencia el 2026-08-19)

| Cosa | Valor |
|---|---|
| Repositorio | `github.com/Luixmc/Partituras`, **público**, rama `main`, **sin protección de rama** |
| Isaac en GitHub | `isaacmtx45-dot`, permiso **write** (`admin: false`) |
| Proyecto Vercel | `partituras`, en el equipo **`luixmcs-projects`** (cuenta del primo) |
| **Sitio real** | **https://partituras-blush.vercel.app** |
| Despliegue automático | **SÍ, activo.** 30 despliegues, uno por commit, ~40 s después del push |

⚠️ **`partituras.vercel.app` (sin `-blush`) NO es esta app**: es la plantilla por defecto de
`create-next-app`, de otra persona. No confundirse al comprobar un cambio.

**Isaac SÍ puede publicar** haciendo push a `main`, sin avisar a nadie. **Lo que NO puede**
(hasta que D-06 se cumpla) es entrar al panel de Vercel: ver logs de un build fallido, ver o
cambiar variables de entorno, forzar un redespliegue o revertir.

### La base de datos

| Cosa | Valor |
|---|---|
| Proyecto Supabase | **`pcayahwnxbigiuhvtwhd`** («Partituras»), región us-west-2, ACTIVE |
| Organización | **«Luixmc's Org»** — del primo — plan **Free** |
| Inquilino extra | El proyecto de cartas `tcg_*` comparte esta misma base (D-05) |

**Quién ve qué, según la interfaz:**

| | admin | musician | viewer | sin cuenta |
|---|---|---|---|---|
| Ver catálogo y cultos | Sí | Sí | Sí | No |
| Modo presentación | Sí | Sí | Sí | Solo por enlace `/s/<token>` |
| Crear/editar canciones y cultos | **Sí** | No | No | No |
| Panel `/admin` | **Sí** | No | No | No |

⚠️ **`musician` y `viewer` hacen hoy exactamente lo mismo**: el rol de músico no sirve de
nada desde la migración 011. **Confirmado por Isaac el 2026-08-20**: *«los dos son lo mismo»*.

⚠️ **Eso es lo que hace la INTERFAZ. La base de datos es más permisiva** — ver P-02 y P-03.

---

## 7 · Verificado contra datos reales

Todo esto es del **2026-08-19**, leyendo el repositorio y el proyecto vivo.

| Dato | Cifra |
|---|---|
| Commits, todos del primo | **44** (29-abr-2026 → 12-jun-2026) |
| Líneas de TypeScript en `src/` | **7.029** |
| Pruebas automáticas | **0** |
| Migraciones en el repositorio | **14** |
| Migraciones registradas en la BD | **18**, y **no coinciden** con las del repo (T-01) |
| **Canciones (CONTADAS, 2026-08-20)** | **75 = 69 publicadas + 6 en borrador** |
| **Caracteres de acordes transcritos** | **28.203** — el trabajo que hay que proteger |
| **Categorías (CONTADAS)** | **14** |
| **Vínculos canción↔categoría** | **94** |
| Cultos / canciones en cultos | **2** / **9** |
| Versiones por tonalidad | **6** |
| Usuarios registrados | ~3 (estimación; no se han leído los perfiles) |
| Despliegues automáticos registrados | **30**, todos `success` |
| Retraso push → publicado | **~40 segundos** (r30: push 02:05:11 → deploy 02:05:51 UTC) |
| `npm install` | **481 paquetes en 1 minuto**, `node_modules` = **526 MB** |
| `npm run build` | ✅ **compila limpio**, sin errores ni avisos de tipos. 13 rutas |
| `npm run dev` | ✅ **arranca en 2 s**; `/` → 307 a `/login`, `/login` sirve bien, `/catalog` → 307 a `/login` sin sesión |
| Vulnerabilidades de dependencias | **15** (13 altas). Solo una importa de verdad: P-13 |
| **Fase A · lógica de figuras** | ✅ **8 de 8 casos correctos**, evaluando la expresión real leída del archivo: `:0.25` `:0.5` `:0.75` `:1` `:1.5` rellenas · `:2` `:3` `:4` huecas · corchete hasta `:0.75` |
| **Fase A · `formatSuffix`** | ✅ **8 de 8**: `maj7`→`Δ` · `dim`→`°` · `dim7`→`°7` · `DIM`→`°` · `maj7/B`→`Δ/B` · `m7b5`, `m7`, `sus4` **intactos** |
| **Fase A · navegador (local)** | ✅ Culto público `/s/<token>/present` → **HTTP 200**, 14 figuras dibujadas (3 rellenas, 11 huecas), **sin errores** |
| **Fase A · iconos (local)** | ✅ `/favicon.ico` 200 · `/icon-192.png` 200 · `/icon-512.png` 200 · `/manifest.json` **200 tras arreglar P-14** (antes 307) |
| Canciones afectadas por O-04 | **1** (`Babel`, la única con `dim`) |
| Canciones afectadas por O-02 | **2** (`Es Por Fe`, `Tu Bondad`, las únicas con `:1.5`) |
| **Fase A · PUBLICADA** | push `30aef42..76f571b` → **Vercel: `success`** · despliegue creado **~70 s después** del push |
| **Fase A · CI estrenado** | ✅ **verde a la primera**, 1 min 10 s (`Comprobar que compila`) |
| **Fase B · consulta del catálogo** | ✅ **69 canciones** (antes el tope dejaba **50**) · **13** enseñan dos categorías · 0 sin categoría · 0 repetidas · **ya no se pide `content`** |
| **Fase B · peso de la pantalla** | El catálogo bajó de **108 kB a 97,1 kB** de JavaScript, y dejó de traer el texto de acordes de las 69 canciones |
| **Fase H · pasar de canción en modo vista** | ✅ Con filtro **Ofrenda**: «Bendecido» sale **2/4**, con Amigo De Dios detrás y Canta Y Danza delante · la primera muestra **1/4** y el botón «anterior» **deshabilitado** · sin filtro, **12/75** con Babel y Cada Vez de vecinas |
| **Fase H · atajos** | ✅ Enganchados en las dos pantallas, y **protegidos**: no actúan si el foco está en un campo de escritura |
| **Fase G · «la siguiente» respeta el filtro** | ✅ Filtrando por **Ofrenda** (4 canciones), abrir «Bendecido» a pantalla completa da **2/4**, con las 4 de la categoría y **ninguna de fuera**. Sin filtro, la misma canción da **12/75** |
| **Fase G · el filtro viaja** | ✅ El enlace de la tarjeta y el botón de pantalla completa llevan `?categories=…` |
| **Fase C · en PRODUCCIÓN** | ✅ Vercel `success` · culto compartido y canción suelta con sus acordes, sin errores · catálogo bien |
| **Fase C · panel de administración** | ✅ **Verificado en producción**: `/admin` responde **200**, están los **7 usuarios**, **el lápiz de O-14 aparece**, y el aviso de la clave **no** sale (allí sí la hay) |
| **Fase D · las 75 canciones, antes y después** | ✅ Se parsearon las **75 canciones (2.524 compases)** con el parser viejo y con el nuevo: **solo cambia 1**, `Renueva Mi Espíritu`, y es justo el arreglo pedido. Las otras 74, idénticas |
| **Fase D · la botonera** | ✅ `[C] [:1] [!]` → `C:1!` · `[G] [!]` → `G!` · y lo de antes sin tocar (`E^`, `Am7`, `C:1`) |
| **Fase C · lógica del tamaño guardado** | ✅ **10 de 10 casos**: guarda por canción sin pisar otras · el botón «ajustar» borra solo la suya · valor fuera de rango se ignora · almacén corrupto no rompe nada |
| **Fase C · las 3 pantallas de presentación** | ✅ Culto con sesión, culto compartido y canción suelta: **HTTP 200, sin errores**, con sus acordes · **los 7 ids de canción del culto llegan al visor** por las dos vías |
| **Fase B · CON SESIÓN (la pantalla de verdad)** | ✅ **69 tarjetas** y el contador dice «69 canciones encontradas» · **56 tarjetas con 1 categoría y 13 con 2** (`Amigo De Dios` → Ofrenda + Alabanzas) · **0 miniaturas de acordes** · **0 contadores de «partes»** |
| **Fase B · botón y pantalla completa** | ✅ Botón presente con su enlace · `/catalog/[id]/present` abre la canción con título, compositor, secciones y acordes · como el usuario de prueba es **lector**, ve `Vista · Pantalla completa` **sin Edición**, que es lo correcto |
| **Fase B · rutas** | ✅ `/catalog/[id]/present` montada en el build · las cuatro rutas responden 307 a `/login` sin sesión, como debe ser |
| **Fase A · producción** | `/login` 200 · culto público 200 y **renderiza igual que en local** (3 rellenas, 11 huecas, sin errores) · `/favicon.ico` 200 · `/manifest.json` **200** (antes 307) · iconos 192 y 512 servidos |

✅ **Corregido el 2026-08-20: estas cifras ya son un recuento real**, no estimaciones. Las
anteriores venían de las estadísticas de Postgres y **eran muy malas**: decían «1 categoría»
cuando hay **14**. → **Nunca dar por buena la cuenta de filas que devuelve `list_tables`:
es una estimación del planificador, no un `count(*)`.**

---

## 8 · Trampas encontradas

**T-01 · Las migraciones del repositorio no son la base de datos.**
*Síntoma:* razonar sobre permisos leyendo `supabase/migrations/` y equivocarse.
*Causa:* la BD registra 18 migraciones con nombres y fechas propios (`20260429191313
extensions_types`, `mosaics_songs_sections`, `sheet_keys_created_by_default`…), mientras el
repositorio tiene 14 con nombres `20240001…`. **`sheet_categories` (010) y `admin_only_sheets`
(011) no constan como aplicadas** — aunque el registro solo ve lo aplicado con la CLI, así que
podrían haberse ejecutado a mano en el SQL Editor y no constar.
*Cómo se resuelve:* antes de tocar permisos, **comprobar las políticas reales** (`pg_policies`),
no los archivos.

**T-02 · El service worker hace que un despliegue correcto parezca que no se aplicó.**
*Síntoma:* «se puede subir el cambio, pero no se aplica de inmediato en Vercel» — lo que le
dijo el primo a Isaac.
*Causa:* `public/sw.js` cachea **todo GET del mismo origen** y se registra desde
`PWARegister.tsx:14`. El despliegue sí ocurre (~40 s), pero el navegador sigue sirviendo lo
cacheado.
*Cómo se resuelve:* recargar con **Ctrl+F5**. De raíz, versionar el `CACHE` del service
worker en cada despliegue — **pendiente, ver §9**.

**T-09 · Mover una dirección sin dejar la vieja redirigiendo rompe lo que la gente tiene abierto.**
*Síntoma:* Isaac recargó la pestaña que tenía y le salió **404**.
*Causa:* la hoja del PDF se movió de sitio y la dirección anterior dejó de existir. Él la tenía
en el historial.
*Cómo se evita:* al mover una ruta, **dejar la vieja redirigiendo a la nueva**. Cuesta cinco
líneas y evita que se rompa lo que otros tienen guardado.

**T-10 · `100vh` al imprimir mide la PANTALLA en el móvil, no la hoja.**
*Síntoma:* el PDF salía con **el doble de páginas** (7 canciones → 14 hojas, la mitad casi
vacías). **Solo en el teléfono**; en el ordenador salía bien.
*Causa:* se había puesto `min-height: 100vh` para que el fondo llegara abajo. El navegador del
móvil calcula `vh` con la pantalla del teléfono —alta y estrecha—, no con la hoja horizontal.
*Cómo se resuelve:* no usar `vh` para la altura de una página impresa. El fondo lo pinta el
`<html>`, que sí cubre la hoja entera.

**T-08 · Un servidor de desarrollo viejo se queda con el puerto y el nuevo se va a otro, callado.**
*Síntoma:* la página devuelve **HTTP 500** en `localhost:3000` justo después de un cambio, y
parece que el cambio la rompió.
*Causa:* el servidor anterior seguía vivo. Next ve el puerto ocupado, avisa **en su propio
registro** —`Port 3000 is in use, trying 3001 instead`— y arranca en el **3001**. Como en el 3000
sigue el viejo, lo que se está mirando es **la versión de antes**, a veces con la carpeta de
compilación a medias.
*Cómo se resuelve:* **matar todos los procesos de Node antes de arrancar**, y **comprobar en qué
puerto quedó** leyendo la línea `Local:` del registro. Si además se compiló por el medio, borrar
`.next` (T-04).
*Pasó dos veces el 2026-08-20.*

**T-07 · Borrar una columna que el código PUBLICADO todavía usa rompe la página al instante.**
*Síntoma:* el catálogo en producción se quedó **vacío** —«Sin resultados», 0 canciones—, sin
ningún error visible. La página respondía 200.
*Causa:* se ejecutó la migración que borra `hymn_number` **antes** de publicar el código que
había dejado de pedirla. Producción seguía con el código anterior, que la incluía en el `select`,
así que la consulta fallaba entera y devolvía cero filas. **La base estaba bien; el que no
encajaba era el código que había arriba.**
*Cómo se resolvió:* publicar de inmediato el código nuevo. **Duró unos 3 minutos.** No se perdió
ningún dato.
*Cómo se evita, y es una regla de orden:* **primero se publica el código que deja de usar la
columna, y DESPUÉS se borra de la base.** Nunca al revés. Añadir es seguro en cualquier orden;
**quitar solo es seguro cuando ya nadie lo pide** (L-103).
*Pasó el 2026-08-20.*

**T-06 · Una canción en tono menor mostraba mal su tonalidad en la presentación.**
*Síntoma:* en pantalla completa, una canción en **`Bm`** salía como **`B`** en la barra de
arriba, junto a los botones de subir y bajar tono. Pasaba en el culto y en el catálogo.
*Causa:* al transponer solo se mueve **la nota**. `keyToPitch("Bm")` devuelve la altura de si, y
al volver a escribirla se perdía la `m`. **`B` y `Bm` son tonalidades distintas**, así que lo que
se leía estaba mal.
*Cómo se resuelve:* el modo se lleva aparte (`esMenor` en `music.ts`) y se vuelve a pegar al
final. **Afectaba a 17 de las 75 canciones** (las que están en Dm, Bm, Em, G#m, Am o Cm).
*Encontrado por Isaac usando la app el 2026-08-20.*

**T-11 · El mismo sitio, el mismo día: una canción en `Bb` mostraba `A#`.**
*Síntoma:* en pantalla completa, «Cristo Es Mi Roca» ponía **`A#` arriba** mientras **debajo
todos los acordes eran `Bb`, `F7`, `Cm7`** — bemoles. La barra se contradecía con la partitura.
*Causa:* `flats = prefersFlats(song.target_key)`. `target_key` es **el tono del culto**, y desde
el catálogo **no hay culto: llega `null`**. Sin él, `prefersFlats` devuelve `false` y la etiqueta
se reescribía con la tabla de sostenidos: `Bb` → `A#`. Los acordes no cambiaban porque **no hay
transposición** (0 semitonos), así que solo mentía la etiqueta.
*Cómo se resuelve, dos cosas:*
1. Los bemoles se miran en `target_key` **o, si no hay, en el de la canción**.
2. **Si no se ha movido el tono, se enseña el guardado tal cual, sin recalcular.** Recalcular
   obliga a elegir entre `Bb` y `A#`, y **esa elección ya la tomó quien escribió la canción**.
*Afecta a 4 de las 75:* Cristo Es Mi Roca, Canción Feliz, Casa De Mi Padre, Gozo Pegajoso — las
cuatro en `Bb`. Comprobado con `scratchpad/tono.mjs`, que **compila `music.ts` con el TypeScript
del proyecto** y pasa las 75 (las 75 tienen tono guardado, ninguna vacío).
🔴 **Y fíjate en el patrón, que es el mismo que T-06 y ya van dos:** el tono se **recalculaba**
teniendo el bueno escrito al lado. **Un dato que el usuario ya escribió no se deduce: se enseña.**
*Encontrado por Isaac usando la app el 2026-08-20.*

**T-05 · «supabaseKey is required» en el panel de administración, solo en el equipo de casa.**
*Síntoma:* en `localhost`, cualquier acción de `/admin` —crear usuario, cambiar nombre, rol,
contraseña o activar— falla con `supabaseKey is required`. **En la página publicada funciona.**
*Causa:* `SUPABASE_SERVICE_ROLE_KEY` está **vacía** en el `.env.local`, y **las cinco acciones
del panel** pasan por `createAdminClient()`. En Vercel la clave sí está configurada, de ahí que
allí no pase.
*Cómo se resuelve:* poner la clave en `.env.local` (§9.1). **No hay nada que arreglar en el
código.**
*Mejorado el 2026-08-20:* ahora el mensaje explica qué falta y de dónde se saca, en vez del
`supabaseKey is required` de la librería, que no dice nada.

**T-04 · `npm run build` con el servidor de desarrollo abierto rompe el servidor.**
*Síntoma:* la página deja de cargar y sale un **Server Error** rojo diciendo
`Cannot find module './vendor-chunks/@supabase.js'`, con una lista de rutas de `.next/server`.
Asusta, pero **no es el código**: el repositorio está intacto y producción no se entera.
*Causa:* `npm run dev` y `npm run build` **escriben en la misma carpeta `.next`**. El build de
producción sustituye los archivos que el servidor de desarrollo tenía cargados, y este se queda
buscando piezas que ya no existen.
*Cómo se resuelve:* parar el servidor, **borrar `.next`** y volver a lanzar `npm run dev`.
*Cómo se evita, desde el 2026-08-20:* **`npm run verificar`**, que compila en `.next-verificar`
y **no toca el `.next` del servidor**. `npm run build` se queda como está —es lo que ejecuta
Vercel— y ya no hace falta usarlo para comprobar que algo compila.
🔴 **La regla «acuérdate de parar el servidor» falló TRES veces**, la última el mismo día que se
escribió esta trampa y a sabiendas de que existía. La tercera fue la que convenció: **una regla
que depende de acordarse no es una solución, es una deuda.** Se cambió por un script que no
puede equivocarse. `next.config.js` lee `NEXT_DIST_DIR` solo si está definida, así que el
despliegue no cambia en nada.
*Un detalle:* la primera vez que se ejecuta, Next **reformatea `tsconfig.json`** y le añade
`.next-verificar/types/**/*.ts` al `include`. Se comprobó que **es una sola vez**: a partir de
ahí no lo vuelve a tocar. El cambio va en el commit, no es basura.
*Pasó el 2026-08-20*, y el que se lo encontró en pantalla fue Isaac mientras probaba.

**T-03 · `partituras.vercel.app` no es esta app.**
*Síntoma:* comprobar un cambio y ver «Welcome to Next.js!».
*Causa:* ese subdominio es de otro proyecto ajeno. El bueno es `partituras-blush`.

---

### D-19 · La ligadura sobre varios acordes: UN arco largo, no una cadena de arquitos

Isaac, el **2026-08-20**: *«hay canciones de estas que los ligamentos comienza con un acorde,
pasa por otro acorde y se conecta con el siguiente acorde, ¿hay manera de que esto se pueda
implementar, o tocaría hacer dos ligamentos uniendo los acordes en cadena?»*.

**No hacía falta programar nada: ya funcionaba.** Se midió con `scratchpad/cadena.mjs`:

| Escribe | Sale |
|---|---|
| `C~ D~ E` | **un solo arco** de `C` a `E`, por encima del `D` |
| `C~ D~ E~ F` | **un solo arco** de `C` a `F`, por encima de `D` y `E` |
| `C~ D E~ F` | **dos arcos sueltos**: `C⌒D` y `E⌒F` |

O sea: **la cadena se funde en un arco largo**, no dibuja un arquito por pareja. Y vale igual si
la cadena cruza la barra de compás.

**Se le preguntó** —porque en partitura el arco largo (expresión) y la cadena de arquitos
(unión) no significan lo mismo, y esto es musical, no técnico— y **eligió el arco largo**, que
es lo que ya hacía. → **No se toca. Y no se implementa la cadena de arquitos.**

📌 **Por qué está escrito aunque no cambie una línea de código:** la pregunta va a volver. Sin
esto, el siguiente que la lea se pone a programar algo que ya existe, o peor, cambia el arco
largo por una cadena creyendo que la arregla.

## 9 · Pendientes

### 9.1 Dependen de Isaac

- [ ] ⚠️ **La invitación a Vercel probablemente NO SE PUEDE** — comprobado en la documentación
      oficial el 2026-08-20 (`vercel.com/docs/plans/hobby`): en el plan **Hobby (gratis)** la
      fila «**Team collaboration features**» está **vacía**, y los roles (Owner/Member/Viewer)
      figuran como **N/A**. Invitar a alguien exige **Pro: 20 USD por persona al mes** (unos
      **80.000 pesos**), y **Isaac no quiere pagar nada** — es una constante de todos sus
      proyectos. Además el plan Hobby es **solo para uso no comercial**, cosa que el cancionero
      cumple.
      → **Hay que confirmarlo mirando el panel del primo** (puede tener un plan distinto).
      → **Alternativas si no se puede, en orden de preferencia:**
      **(a) el CI de GitHub Actions** (§12.4-①): gratis, se monta hoy, y da la señal que más
      falta —si el build falla, un ❌ en el commit— **sin depender de Vercel**;
      **(b) transferir el proyecto de Vercel a la cuenta de Isaac**, que ya es el mantenedor.
      ⚠️ **Antes de intentarlo hay que averiguar si el dominio `partituras-blush.vercel.app`
      sobrevive a la transferencia**: si cambia, los músicos pierden el enlace que ya usan.
      **(c) dejarlo como está** y pedirle al primo que mire cuando algo falle.
- [ ] 🔴 **Conseguir la clave `service_role`** (solo puede sacarla el primo, hasta que invite a
      Isaac a su organización). **Subió de prioridad el 2026-08-20:** sin ella, **NINGUNA acción
      del panel de administración funciona en el equipo de Isaac** —ni crear usuarios, ni cambiar
      nombres, roles o contraseñas— y por tanto **O-14 no se puede probar en local** (T-05).
      En la página publicada sí funciona.
- [x] ~~Aclarar con qué cuenta está conectado Supabase~~ → ✅ **RESUELTO y CONFIRMADO el
      2026-08-20 por el propio Isaac: «yo Supabase ni siquiera tengo una cuenta».** La sesión
      conectada a Claude es **la de su primo**, sin lugar a dudas. Encaja con la evidencia: veía
      una sola organización, «Luixmc's Org», y ningún proyecto suyo.
- [x] ~~Crear su propia cuenta de Supabase~~ → ✅ **HECHA el 2026-08-20**, vinculada a su
      GitHub (`isaacmtx45-dot`), con organización propia llamada **«Quaker»** (Personal, plan
      Free). **No creó ningún proyecto dentro**, y es lo correcto: para Partituras no hace falta
      —basta con que el primo lo invite a «Luixmc's Org»— y un proyecto sin usar se pausa solo
      por inactividad. El proyecto de GestionDineroTrabajo se creará cuando esa fase arranque.
- [ ] **Que el primo lo invite a «Luixmc's Org»** para poder entrar a Partituras con su cuenta.
- [ ] **Reconectar el conector de Supabase de Claude con la cuenta de Isaac** *una vez que el
      primo lo haya invitado*. Hoy sigue enlazado a la sesión del primo. ⚠️ Si se reconecta
      **antes** de la invitación, se pierde el acceso a Partituras por esa vía (no es grave: el
      respaldo ya está hecho y el desarrollo usa `.env.local`).
- [x] ~~Mandar el logo~~ → **entregado el 2026-08-20**, cuatro archivos, elegidos por D-12.
- [x] ~~Confirmar «una canción por página»~~ → **confirmado**: es del PDF; el catálogo las
      muestra todas (O-10).
- [x] ~~Decidir quién guarda el tamaño~~ → **cada músico el suyo** (D-09b). Deja de tocar la
      base de datos.
- [x] ~~Dónde va el botón de pantalla completa~~ → **junto a «Vista / Edición»** dentro de cada
      canción, para los tres roles (O-11).
- [ ] 🔴 **La cuenta `pruebaclaude@gmail.com` es ADMINISTRADORA desde el 2026-08-20.** Isaac se
      lo cambió en producción para que se pudieran verificar el panel y el editor. Con ese rol se
      pueden **borrar canciones, cambiar roles y desactivar usuarios**. → **Bajarla a lector, o
      cerrarla, en cuanto no haga falta.** Mientras tanto: **no se toca ningún dato con ella sin
      permiso expreso de Isaac**; solo se usa para MIRAR pantallas.
- [ ] ⚠️ **Desactivar la cuenta `pruebaclaude@gmail.com` cuando ya no haga falta** (Admin →
      Desactivar). Tiene una contraseña sencilla y es una cuenta real en un sitio abierto a
      internet. **Recordatorio: hoy desactivar un usuario NO le impide entrar** (P-01) — hasta
      que P-01 esté arreglado, para cerrarla de verdad hay que **cambiarle la contraseña**.
- [ ] **Contestar las preguntas abiertas (❓) que queden en §9.2** — sin ellas, O-01, O-03,
      O-06 y O-08 no se pueden empezar sin inventarse una regla.
- [x] ~~Aprobar el orden de fases~~ → **APROBADO el 2026-08-20**, con la Fase 0 por delante.

### 9.2 EL ENCARGO DE ISAAC (dictado 2026-08-19, respondido y ampliado 2026-08-20)

> **Estado: FASES APROBADAS el 2026-08-20, sin empezar.** Isaac puso una condición: **primero
> la Fase 0** (los pendientes de §9.1). Hasta que esa esté hecha no se toca código. Cada punto lleva el análisis contra el código real, con archivo y línea.
> La lista original traía 12 puntos con 2 repetidos → **10 distintos (O-01…O-10)**. El
> 2026-08-20 Isaac contestó las 8 preguntas abiertas y **añadió 5 órdenes más (O-11…O-15)**.

#### Las 10 primeras

**O-01 · Que la duración y la ligadura no dependan de que haya un acorde delante.**
📌 **Dato que apareció al revisar las ligaduras (2026-08-20):** el guion `-` de
`F# ~ - D`, en «Si Dios Dice Que Si», **no era un resto**: Isaac lo puso para decir que **se
va tocando por semitonos** de F# hasta D. Es notación suya que no estaba documentada, y por
poco se borra por creerla basura. → **Un símbolo raro en los datos del usuario se pregunta,
no se limpia.**
Hoy una duración suelta (`:1`) **no funciona**: el parser solo la reconoce pegada a un acorde
(`TablaturePreview.tsx:196`) y un `:1` suelto cae en el `else` y se pinta como texto gris
(`:203`). La ligadura igual: `~` exige un acorde previo (`:131-135`). Además la botonera pega
la duración al token anterior sin espacio (`chordInput.ts:30`).
✅ **RESPUESTA (2026-08-20):**
- **La ligadura SUMA las duraciones** — es *ligadura de valor*: negra ligada a negra ocupa dos
  tiempos. ⚠️ Esto **no es solo dibujo**: hay que tocar el reparto de tiempos del compás
  (`TablaturePreview.tsx:405`, `totalBeats`) y el agrupado por vigas (`:349`).
- **La duración suelta se dibuja arriba, en el mismo sitio que las figuras de los acordes
  (`:295-302`), pero sola**, sin acorde debajo.

**O-02 · La negra con puntillo se dibuja como blanca con puntillo.** ✅ **Causa encontrada.**
`MusicFigures.tsx:20`: `const filled = beats <= 1`. La negra con puntillo es `1.5`, así que
sale con la cabeza hueca — y hueca + puntillo **es** una blanca con puntillo. **Corrección:
`<= 1` → `<= 1.5`.**
⚠️ **Segundo fallo de la misma familia al lado:** `hasFlag = !beamed && beats <= 0.5` (`:22`),
así que la **corchea con puntillo** (`:0.75`) sale **sin corchete**. Se arregla en la misma
pasada subiendo el umbral a `0.75`.

**O-03 · Añadir el staccato** (punto debajo de la figura). Toca parser
(`TablaturePreview.tsx`), dibujo (`MusicFigures.tsx`) y botonera (`ChordToolbar.tsx`).
✅ **RESPUESTA:** Isaac lo delega — *«como tú creas que sea mejor, siempre y cuando sea un
método fácil»*.
→ **DECISIÓN (D-08): se usa `!` pegado al final del token** (`C:1!`, `C!`). Motivos: **el punto
`.` queda descartado** porque chocaría con los decimales de la duración (`:1.5`, `:0.25`) y
volvería ambiguas las 75 canciones ya escritas; `!` no se usa hoy para nada, no aparece en
ningún contenido existente, y es el mismo patrón que ya usa el calderón con `^`
(`TablaturePreview.tsx:138`). Además va a tener botón propio, así que casi nunca se escribirá
a mano.

**O-04 · Que `dim` se muestre como `°`.** Sencillo y con precedente: `formatSuffix`
(`TablaturePreview.tsx:219`) ya hace lo mismo con `maj7` → `Δ`. Cambia solo **cómo se ve**; el
texto guardado sigue diciendo `dim`, así que ninguna canción existente se toca.
✅ **RESPUESTA:** `dim` → `°` y **`dim7` → `°7`**. **`m7b5` se queda como está**, escrito tal cual.

**O-05 · Quitar la vista previa de acordes de la sección «Canciones».**
Es `SheetCard.tsx:34-38` (miniatura con `TablaturePreview`).
✅ **RESPUESTA:** se quita la miniatura **y también el contador de «N partes»**
(`SheetCard.tsx:17,77-82`). La tarjeta debe quedarse con **el nombre, el tipo de canción
(categoría), la tonalidad y las demás características** que ya muestra.
✅ **Esto hace posible la O-10:** sin miniatura ni contador, el catálogo ya no necesita traer el
campo `content` de las 75 canciones (`catalog/page.tsx:42`) — que es justo la razón del tope.

**O-06 · Que el tamaño ajustado en el modo presentación se quede guardado.**
Hoy `fontScale` es estado local que muere al salir (`PresentationView.tsx:30`) y el auto-ajuste
lo pisa al cambiar de canción (`:68`).
✅ **RESPUESTA FINAL (2026-08-20): por canción y POR MÚSICO** — *«quería que cada músico
pudiese guardar a su manera el tamaño de cómo ve las canciones con su estructura»*.
⚠️ **Esto SUPERA lo que se había entendido el día anterior.** En la primera respuesta dijo «para
todos los que abran ese culto», y de ahí salió D-09 (guardarlo en la base de datos, con
migración). Con la aclaración, **manda D-09b**: se guarda en el **navegador de cada uno**
(`localStorage`), por canción.
✅ **Consecuencias, todas buenas:**
- **Ya no hace falta migración y no se toca producción** → O-06 **sale de la fase E** y baja de
  riesgo por completo.
- **Funciona para lectores y músicos**, que no tienen permiso de escritura en las canciones. Con
  el diseño anterior el botón no les habría servido (habría sido el botón mentiroso de P-01).
- Es **más correcto**: el tamaño que se necesita depende de la **pantalla** —no es lo mismo una
  tablet que un móvil que un PC—, así que guardarlo por aparato acierta más que sincronizarlo.
- Ya existe el sitio donde guardarlo: la clave `reading-prefs` de `localStorage`
  (`layout.tsx:45`).
→ Isaac confirmó además que **hoy no lo guarda nadie**, porque la función no existe.

**O-07 · Que en «Canciones» salgan TODAS las categorías de cada canción.**
Hoy el catálogo solo trae la principal (`catalog/page.tsx:42`) y la tarjeta pinta una
(`SheetCard.tsx:59-66`).
✅ **Comprobado que se puede:** la tabla `sheet_categories` **existe en la base y tiene datos**
(~94 filas). Eso **cierra media duda de T-01**: la migración 010 está aplicada.

**O-08 · Que el PDF del culto traiga las canciones completas —acordes y estructura— en
horizontal.** Hoy `ServicePdfButton.tsx` genera solo la lista (título, compositor, tono).
✅ **RESPUESTA: se usa la impresión del navegador**, en horizontal — *«aunque también ten en
cuenta que hay personas que usan el teléfono»*.
→ Es decir: `window.print()` con estilos `@media print` y `@page { size: landscape }`,
reutilizando **el render que ya existe**. Sale idéntico a la pantalla y «Guardar como PDF» ya
viene en el diálogo de impresión.
→ ⚠️ **Lo del teléfono hay que probarlo de verdad, no suponerlo:** Chrome en Android ofrece
«Guardar como PDF» al imprimir y Safari en iPhone también, pero **el resultado en móvil hay que
verlo** antes de dar el punto por cerrado. Va en la lista de comprobación de esa fase.
→ **Una canción por página** (ver O-10 y la nota de ambigüedad).

**O-09 · Poder meter la misma canción varias veces en un culto.**
✅ Ya detectado por mi cuenta como P-05. **Causa:** la clave primaria de `service_songs` es
`(service_id, sheet_id)` (`20240012_services.sql:56`), y además `cleanInput`
(`services/actions.ts:56-58`) borra los duplicados **en silencio** antes de guardar.
✅ **RESPUESTA (ampliada el 2026-08-20):** *«que si quiero que me salga tres veces en la lista,
que me deje»* — **las veces que uno quiera**, no solo dos.
⚠️ **Necesita migración nueva** (D-04: no se toca la 012) que cambie la clave primaria, más
ajustar el editor y la acción de guardado. ❗ **Toca producción: requiere el OK explícito de
Isaac y aviso al primo.**
→ Nota: hoy el tono se guarda por canción-en-culto (`key_override`), así que **cada repetición
podrá llevar su propio tono**, que es justo lo que Isaac pedía en la lista original.

**O-10 · En «Canciones» solo salen 50, y ya hay más.** ✅ **Causa encontrada, una línea:**
`.limit(50)` en `catalog/page.tsx:45`. En la base hay ~75 → **faltan unas 25**.
✅ **RESPUESTA (2026-08-20, repetida y explícita):** *«en la página solamente salen 50, a pesar
de que hay 75; arréglalo para que aparezcan TODAS»*. → **Se quita el tope: salen todas.**
⚠️ **AMBIGÜEDAD REGISTRADA, PENDIENTE DE CONFIRMAR:** a la pregunta «¿todas o se pagina?» Isaac
contestó *«se pagina, una canción por página»*. Eso **no puede referirse al catálogo** —serían
75 páginas para ver la lista— y **contradice** su propia orden de que salgan todas, dicha en el
mismo mensaje. **Interpretación aplicada:** «una canción por página» va con **O-08, el PDF del
culto** (cada canción en su hoja); y el **catálogo las muestra todas**.
✅ **CONFIRMADO por Isaac el 2026-08-20**: *«en el punto 2 es así como dices»*.

#### Las 5 nuevas (dictadas el 2026-08-20)

**O-11 · Un botón en el catálogo para ver una canción a pantalla completa**, como el modo
presentación de los cultos.
→ Es de las más agradecidas: `PresentationView` ya recibe una **lista** de canciones
(`PresentationView.tsx:18`), así que se le puede pasar **una sola**. Hace falta una ruta nueva
(`/catalog/[id]/present`, copiando el patrón de `services/[id]/present/page.tsx`, 27 líneas) y
el botón en la canción.
✅ **RESPUESTA (2026-08-20): va en cada canción, en la barra de «Vista / Edición»**
(`SongDetailEditor.tsx:368-382`) — *«al lado de esos dos, o de uno en caso tal para los que son
lector y músico»*. Es decir: el administrador verá **Vista · Edición · Pantalla completa**, y el
lector y el músico verán **Vista · Pantalla completa**. El botón es para **los tres roles**.
→ Si la canción tiene versiones en otros tonos (`sheet_keys`), ¿se presenta la base o se puede
elegir? Detalle menor, se puede dejar la base de momento.

**O-12 · (repetida) Que salgan todas las canciones** → es **O-10**. Isaac la repitió, así que
sube de prioridad.

**O-13 · (repetida) Repetir la misma canción en un culto** → es **O-09**, con la precisión de
«las veces que uno quiera».

**O-14 · Poder cambiar el nombre de una cuenta desde Administración, sin que a esa persona la
saque de la página.**
→ Hoy **no existe**: `admin/actions.ts` tiene crear, contraseña, rol y activar/desactivar, pero
**ninguna acción para editar el nombre** de un usuario ya creado. Hay que añadirla, más el
campo en `AdminUsers.tsx`.
✅ **Su preocupación tiene respuesta tranquilizadora, y es un hecho técnico:** cambiar el nombre
**no cierra la sesión de nadie**. El nombre vive en la tabla `profiles`, mientras que la sesión
vive en `auth.users` y en la cookie del navegador; cambiar una fila de `profiles` no las toca.
Lo que **sí** cerraría sesión sería cambiar el **correo** o la **contraseña** — y eso no es lo
que se pide.

**O-15 · Que en la pestaña del navegador salga el logotipo de la iglesia.**
→ **Confirmado que hoy no hay ninguno:** `/favicon.ico` devuelve **404** en producción, y no
existe `src/app/icon.*` ni `favicon.ico`. Por eso se ve el globo gris del navegador. El único
icono del proyecto es `public/icon.svg`, que es **una corchea blanca sobre fondo azul marino**
—un dibujo genérico, no el logo de la iglesia— y solo lo usa el manifiesto de la PWA.
✅ **DESBLOQUEADO el 2026-08-20: Isaac dejó cuatro archivos** en
`C:\Users\TECSISTEMAS\Documents\Partituras\`. El logo es un **sello circular** con el tejado
rojo, «Casa de mi Padre», el libro abierto y la cruz. Elegidos por **D-12**:
- **Pestaña** → `WhatsApp_Image_...-removebg-preview.ico` (6 tamaños **con transparencia**),
  que irá a `src/app/favicon.ico`.
- **App del móvil** → `WhatsApp_Image_...-removebg-preview.png` (500×500 con transparencia),
  que sustituirá a `public/icon.svg` en el manifiesto.
⚠️ **Observación honesta:** el logo tiene mucho detalle (el texto, el libro, la cruz). **A 16×16
píxeles, que es el tamaño de la pestaña, se va a ver como una mancha de color** — le pasa a
cualquier logo detallado. El `.ico` es lo que mejor lo resuelve, porque sus tamaños pequeños
están generados uno a uno en vez de encogidos al vuelo.
→ Con Next.js App Router basta con dejar el archivo en `src/app/icon.png` y el propio framework
lo sirve como icono de pestaña, sin configurar nada. Conviene cambiar también `public/icon.svg`
para que la app instalada en el móvil use el mismo logo.

#### Las 4 nuevas (dictadas el 2026-08-20, después de probar la Fase C)

**O-16 · Desde la pantalla completa de una canción, poder pasar a la SIGUIENTE del catálogo.**
Hoy `catalog/[id]/present` le pasa al visor **una sola canción**, así que las flechas y el
deslizar no llevan a ninguna parte. `PresentationView` ya sabe manejar una lista —es lo que hace
en los cultos—, así que se trata de darle **todo el catálogo** y decirle por cuál empezar.
✅ **RESPUESTA (2026-08-20): respeta el filtro** (D-15). Si el músico estaba viendo «Alabanzas»,
la siguiente es la siguiente **de Alabanzas**, no del catálogo entero.
→ **Lo que obliga a hacer:** arrastrar el filtro y la búsqueda desde el catálogo hasta la
pantalla completa, pasando por la tarjeta y por la vista de la canción. Y como esa pantalla
tiene que repetir **la misma consulta** que el catálogo, la búsqueda se saca a un sitio común en
vez de copiarla (si no, serían dos consultas que se separan con el tiempo, P-09).

**O-17 · Al tocar un acorde, ver cómo se toca en piano, bajo, guitarra y trompeta.**
Isaac ya avisó: *«esto último si ves que es muy complicado puedes dejarlo en pendiente»*.
→ **Es complicado, y conviene decir por qué antes de prometer nada.** No es un trabajo, son
cuatro, y solo dos se parecen:
- **Piano** — el más asequible: las notas del acorde **se calculan** a partir de la raíz y la
  calidad, y se pintan sobre un teclado. Sin datos externos.
- **Bajo** — asequible: normalmente basta la fundamental (y quizá quinta y octava) sobre un
  mástil de 4 cuerdas.
- **Guitarra** — el más pesado: hace falta una **tabla de digitaciones** (qué dedo en qué
  traste) para cada acorde, y el proyecto no la tiene. Son decenas de formas, y para acordes
  como `B°` o `Dm7` hay varias posiciones válidas: **hay que elegir cuál se enseña**.
- **Trompeta** — ⚠️ **el que hay que hablar antes de programar**: la trompeta **toca una nota a
  la vez, no acordes**, así que «el acorde en trompeta» no significa nada por sí solo. Y encima
  **es un instrumento transpositor (en Si♭)**: lo que el trompetista lee está **un tono por
  encima** de lo que suena. Si se le enseña la digitación sin tener eso en cuenta, **estaría mal
  y sonaría mal en el culto**.
→ Además hay que hacer que **los acordes respondan al clic**, y eso toca `TablaturePreview`, que
es el corazón del proyecto (§4).
→ 💡 **RECOMENDACIÓN: por fases, y empezando por piano y bajo**, que se calculan solos y sirven
para ver si de verdad se usa. Guitarra después. Trompeta, solo tras aclarar qué debe mostrar.
→ **PENDIENTE, sin empezar.**

**O-18 · Una sección de LETRAS de las canciones, para las cantantes.** `[PENDIENTE]`
→ ❓ Hoy la letra vive suelta dentro de los acordes, entre paréntesis y recortada
(`(Dios le dijo a-)`), y existe una columna `sheets.lyrics` **que está sin usar y a 0**. Habría
que decidir **de dónde sale la letra**: ¿se escribe aparte en esa columna, o se saca de lo que ya
hay entre paréntesis? Son dos proyectos distintos.

**O-19 · Una sección para TROMPETAS.** `[PENDIENTE]`
→ ❓ Hay que preguntar qué necesita ver un trompetista que no le sirva del cancionero actual:
¿su línea de notas?, ¿solo su parte del arreglo?, ¿la misma canción transpuesta a su tono? Va de
la mano de la duda de O-17 sobre el instrumento transpositor.

#### Las 2 nuevas (dictadas el 2026-08-20, tras probar O-16)

**O-20 · Pasar de canción también en MODO VISTA, con las flechas ← →.**
Isaac: *«algo parecido a lo de pasar las canciones en pantalla completa, es que lo pueda hacer
también en modo vista, y que pueda permitirlo hacerlo usando las flechas tanto izquierda como
derecha»*.
→ Es O-16 llevada a `/catalog/[id]`: la página ya recibe el filtro, así que puede calcular
**cuál es la anterior y cuál la siguiente** dentro de la lista que se estaba viendo.
→ ⚠️ **Cuidado con el teclado:** en **modo edición** las flechas mueven el cursor dentro del
texto de los acordes. Los atajos solo pueden actuar en **modo vista** y **nunca** cuando el foco
está en un campo de escritura.

**O-21 · Las teclas `+` y `−` cambian el tamaño de letra.**
Isaac: *«sería bueno que las teclas + y − permitan configurar el tamaño de las letras en pantalla
completa, pero no sé si para modo vista pueda servir»*.
→ **En pantalla completa** es directo: ya existe el ajuste (y ya guarda por canción, O-06); solo
hay que engancharlo al teclado, donde ya se escuchan las flechas y la `F`.
→ **En modo vista SÍ sirve, y conviene**: esa pantalla ya tiene su propio control de tamaño —el
del `90%` de la esquina—, así que las mismas teclas harían lo mismo que ese control. Queda
coherente: las mismas teclas hacen lo mismo en las dos pantallas.
→ ⚠️ Mismo cuidado que O-20: en un campo de escritura, `+` y `−` tienen que escribir su
carácter, no cambiar el tamaño.

#### O-22 · Avisar por WhatsApp — ✅ **ELEGIDA LA OPCIÓN (a) e IMPLEMENTADA**

Isaac trasladó el 2026-08-20 una idea que le había mandado a su primo:

> *«que tal que haya una manera en la que cuando por ejemplo se actualice el repertorio en la
> sección de culto le llegue un mensaje por ejemplo por WhatsApp que ya está el repertorio nuevo
> en la página de la iglesia»*

**Se puede, pero hay dos caminos y se parecen poco. La diferencia importa porque uno cuesta
dinero y el otro no:**

**(a) Un botón «Avisar por WhatsApp» en el culto — GRATIS, y se hace en un rato.**
El botón abre WhatsApp con el mensaje ya escrito y el enlace público del culto
(`/s/<token>`, que **ya existe**), e Isaac elige a quién se lo manda: el grupo de músicos, una
persona, lo que sea. Es un enlace `wa.me`, no hace falta ni servidor ni cuenta de empresa ni
permisos. **Coste: 0.** Lo único «manual» es que él pulse el botón y elija el grupo — que es
justo el momento en el que sabe que el repertorio ya está listo.

**(b) Que el mensaje salga SOLO, sin que nadie pulse nada — es otro proyecto.**
Necesita la **API de WhatsApp Business** de Meta: cuenta de empresa verificada, plantillas de
mensaje aprobadas por ellos una a una, y **facturación por conversación** (hay un tramo gratis
mensual, pero es una cuenta que hay que vigilar). Además hay que guardar los teléfonos de los
músicos —datos personales— y que cada uno acepte recibirlos. Y el aviso saldría **cada vez que
se guarde** el culto, así que habría que decidir qué pasa si se guarda cinco veces seguidas
mientras se arma el repertorio.

✅ **DECISIÓN DE ISAAC (2026-08-20): la (a), el botón.** Y su motivo es el que la hace mejor,
no solo más barata: *«para cerciorarme que lo estoy enviando bien al grupo que es»*. Con un envío
automático **no vería a dónde va**; con el botón, WhatsApp le enseña el destinatario antes de
enviar. → **Hecho:** botón **«Avisar»** junto a «Copiar», en el bloque del enlace público del
culto. Solo aparece si el enlace público está activado, que es lo único que hace falta para que
el mensaje sirva de algo.

→ 💡 **La recomendación era la (a).** Resuelve lo que él quiere —que los músicos se enteren de que el
repertorio está— sin cuentas, sin permisos y sin gastar un peso. Si un día se queda corta, la
(b) sigue estando ahí.
→ ❓ **PREGUNTAR:** ¿le vale con pulsar un botón, o quiere de verdad que salga solo?
→ Alternativas más baratas que la (b) si lo quiere automático: **Telegram** (API gratis y
sencilla) o los **avisos del propio navegador** — la app ya es instalable, así que podría avisar
sin depender de nadie.

#### Las 2 nuevas (dictadas el 2026-08-20, tras probar el botón de WhatsApp)

**O-23 · Que el enlace compartido distinga a quien TIENE cuenta de quien no.**
Isaac: *«ese link sirve, como se lee al copiarlo, para "compartir el culto con quien no tiene
cuenta"… no sé si para los que tienen cuenta no solamente les permita llegar por el link, sino
que le muestre el resto»*.
→ Hoy `/s/<token>` enseña **la misma página a todo el mundo**: la lista de canciones y ya. Quien
tiene cuenta llega ahí y **se queda encallado**, aunque podría ver el culto entero y abrir cada
canción.
→ **Se puede** porque esa página, aunque sea pública, puede mirar si hay sesión.
→ ❓ **PREGUNTAR, porque hay dos maneras y cambian bastante:**
  **(a)** Que al abrir el enlace con sesión **lleve directamente** al culto completo
  (`/services/<id>`). Más directo, pero se pierde el «me han compartido esto» y, si alguien
  quería enseñarle la vista pública a otro, no la ve.
  **(b)** Que se quede en la misma página **pero con más cosas**: un botón «Abrir el culto
  completo» y las canciones **pinchables** hacia el catálogo. No le quita nada a nadie.
✅ **RESPUESTA (2026-08-20): la (b)**, y confirmada después de probarla: *«de hecho está mejor de
lo que pensaba»*. El enlace sigue siendo **el mismo para todos**; quien tiene cuenta ve además un
botón «Abrir el culto completo» y **las canciones pinchables**. Al invitado no le cambia nada.

**O-25 · Que el invitado también pueda cambiar el tema y el tamaño de letra.** `[del mismo día]`
Isaac, al probar la (b): *«para el modo invitado quiero que le dejes la opción de modo claro y
modo oscuro, y así mismo el tamaño»*.
→ **Por qué falta:** la página compartida vive **fuera** del grupo `(dashboard)`, que es donde se
monta el sistema de tema. Hereda el tema guardado —el guion del layout raíz lo aplica antes de
pintar— pero **no tiene los controles para cambiarlo**.
→ ⚠️ **Solo en la lista, no en la presentación:** el modo presentación **ya tiene su propio
ajuste de tamaño** (O-06), y meterle otro encima se pisarían.

**O-24 · ~~Que los demás puedan compartir el enlace~~** — ❌ **DESCARTADA POR ISAAC el mismo día.**
Lo pidió creyendo que los músicos **ya veían** el enlace. Al comprobarlo resultó que **no**: su
vista de solo lectura nunca lo ha enseñado. Con ese dato cambió de idea en el momento: *«no, pero
si no les salía déjalo así, pensé que les salía; es mejor así, mejor que a ellos no les aparezca,
solo al admin»*.
→ **Queda como está: el enlace público es cosa del administrador y solo él lo ve.** Se llegó a
implementar y **se deshizo**; en `ShareBox` queda escrito para que nadie lo «arregle» otra vez
pensando que es un olvido.
→ 📌 **Lo que enseña:** la petición nacía de una suposición sobre cómo funcionaba la app, no de
una molestia real. **Comprobar el comportamiento actual antes de programar** convirtió una
funcionalidad nueva en un descarte de dos minutos.

#### Las 2 nuevas (dictadas el 2026-08-20, probando la Fase D)

**O-26 · Otra forma de leer las columnas en pantalla completa.** ✅ **HECHO y PUBLICADO el
2026-08-20** (`0f5c6cf`, r39). Confirmado por Isaac: *«lo de las columnas también»*.
`[la pidió un músico del grupo]`
Isaac: *«que además de una, dos y tres columnas, haya para leer de izquierda, luego derecha,
luego debajo izquierda… (que es como se venía haciendo), y que la otra sea: si son dos columnas
se lee primero la primera columna entera de arriba abajo, y luego la segunda»*.
→ Es decir, **dos maneras de recorrer la misma rejilla**: por FILAS (lo de ahora) o por
COLUMNAS. En una hoja de acordes las dos tienen sentido según cómo esté escrita la canción, y
quien lo pidió es alguien que la lee tocando.
→ **Hecho así:** botón nuevo en la barra de la presentación, **solo visible con 2 ó 3 columnas**
—con una no hay nada que elegir—. Se guarda en el navegador de cada músico
(`localStorage: presentacion-recorrido`), igual que el tamaño de letra: es preferencia de quien
lee, no de la canción, así que **no hay migración**.

🔴 **NO se hizo con `grid-auto-flow: column`, que era el plan escrito aquí.** Al ir a hacerlo se
vio el problema: el grid por columnas **obliga a fijar cuántas filas hay**, y como las secciones
miden distinto —un puente no ocupa lo que un coro— alinear las filas deja huecos grandes.
→ Se usó **multi-columna de CSS** (`column-count`), que reparte por altura y equilibra sola.
`break-inside: avoid` en cada sección impide lo único malo que podía hacer: **partir una sección
entre dos columnas**. `column-count` **no está en la fase de impresión**: el PDF sigue con su
propia rejilla de dos columnas, sin tocar.
→ El auto-ajuste de tamaño se rehace al cambiar el recorrido: la altura del contenido cambia.

**O-27 · «Cancionero» → «Partituras».** ✅ **HECHO el 2026-08-20.**
Isaac: *«que así es como manejamos nosotros el lenguaje»*. Cambiado en el pie de la página
compartida, en el nombre de la app instalada y en la descripción de la página. **No quedaba
ningún otro sitio.**

### 9.2-bis · Las fases — ✅ APROBADAS por Isaac el 2026-08-20

> *«los apruebo, pero primero vamos a hacer lo que está pendiente primero (como supabase, la
> clave y demás), para que después no haya problemas»*. → **La Fase 0 es obligatoria y va
> antes que todo lo demás.**

| Fase | Qué | Riesgo |
|---|---|---|
| **0** | ✅ ~~respaldar las 75 canciones~~ · ✅ ~~exportador a JSON (D-11)~~ · ⬜ clave `service_role` · ⬜ cuenta propia de Supabase · ⬜ acceso a Vercel | Ninguno, y **quita el riesgo de todo lo demás**. **Lo crítico ya está hecho** (§12.1) |
| **A** | ✅ **HECHA Y PUBLICADA (2026-08-20)** — O-02 · O-04 · O-15 · +P-14 · +P-10 | Salió limpia. Commits `1bdf61e` (r31) y `76f571b`. Verificada en producción |
| **B** | ✅ **HECHA Y PUBLICADA (2026-08-20)** — O-05 · O-10 · O-07 · O-11 | Commit `36ba65d` (r32). Verificada **con sesión** en la pantalla real (§7) |
| **C** | ✅ **HECHA Y PUBLICADA (2026-08-20)** — O-14 · O-06 · +T-05 | Commit `73bb508` (r34). O-06 confirmado por Isaac; el panel de O-14 verificado en producción |
| **D** | ✅ **HECHA Y PUBLICADA (2026-08-20)** — O-03 (staccato) · duración suelta de O-01 · **la ligadura, los 3 fallos** (§9.2-ter) · **D-19** | Commit `0f5c6cf` (r39). Confirmada por Isaac: *«está perfecto lo del ligamento»*. **20 ligaduras, 0 perdidas** |
| **E** | ✅ **HECHA Y PUBLICADA (2026-08-20)** — O-09 · migración `20240015` aplicada | Commit `21575e2` (r36). Las 9 filas del repertorio intactas y la clave ya es `id` |
| **F** | ✅ **HECHA (2026-08-20)** — O-08 · el PDF completo del culto | Confirmada por Isaac en PC **y en teléfono**: *«todo perfecto»* |
| **G** | ✅ **HECHA, CONFIRMADA y PUBLICADA (2026-08-20)** — O-16 respetando el filtro (D-15) | *«funciona bien lo de pasar las canciones tanto sin filtro como con filtro»*. Publicada en `0f5c6cf` (r39) |
| **H** | ✅ **HECHA y PUBLICADA (2026-08-20)** — O-20 · O-21 | Verificada con datos reales (§7). Publicada en `0f5c6cf` (r39) |
| **—** | O-17 (acordes en los 4 instrumentos) · O-18 (letras) · O-19 (trompetas) | **Sin fase asignada: pendientes.** Los tres son grandes y tienen preguntas abiertas |

**Antes de la fase D es obligatorio** guardar el `content` de las 75 canciones y comparar el
render antes y después (§12.5). **La fase 0 cubre eso de paso.**

### 9.2-ter · 🔴 LA LIGADURA — dónde quedó exactamente (2026-08-20)

> Isaac, el 2026-08-20: *«haz primero lo de las ligaduras y luego el modo de lectura»*.
> **El código está escrito, pero NO está comprobado. Nada de esto se puede dar por bueno.**

**Los 3 fallos que él vio** (mirando las 8 canciones que llevan `~`):

1. **El arco se quedaba corto cuando los acordes miden distinto** (`F ~ G7`): el arco se
   colocaba «la mitad del grupo hacia dentro» por porcentaje, y eso solo acierta si todos los
   acordes son igual de anchos.
2. **El arco moría en el guion** de `F# ~ - D` («Si Dios Dice Que Si»), en vez de pasar por
   encima hasta el `D`.
3. **La ligadura que cruza la barra de compás** (`Ebmaj7 ~ | %`) no se dibujaba: cada compás
   es su propia caja y el arco no cabe. Pasa en **«Canción Feliz»**, **«Hay Poder En La
   Alabanza»** y **«Yo Bien Sé Quien Soy»**.

**Lo que se escribió** (todo en `src/components/sheets/TablaturePreview.tsx`):

| Cambio | Qué hace |
|---|---|
| `TieGroup` con `useLayoutEffect` + `ResizeObserver` | **Mide** dónde está cada acorde en pantalla y pone el arco del centro del primero al centro del último. Sustituye al cálculo por porcentaje → arregla ① |
| `data-celda="nota" \| "texto"` en `NoteCell` | Marca qué celda **suena** y cuál solo se lee. El arco solo mide las que suenan → arregla ② |
| `tieSegments`: `while (j < n-1 && (chords[j].tieNext \|\| !suena(chords[j+1]))) j++` | La cadena **salta los textos intermedios** y llega al siguiente acorde. Con recorte al final para que el arco no cuelgue si el compás acaba en texto |
| `saleLigado` / `entraLigado` en `MeasureBlock` | **Medio arco** al borde de cada compás, como en la partitura de verdad → arregla ③ |
| `terminaLigado(m)` | Mira el último elemento que suena de un compás para saber si va ligado al siguiente |

**Lo comprobado (2026-08-20):**

1. ✅ **Compila.** El `npm run build` se había quedado colgado 10 minutos: era el servidor de
   desarrollo sujetando `.next` (**T-04**). Se mató, se borró `.next` y compiló limpio.
2. ✅ **Las 75 canciones por el parser:** solo cambia `Renueva Mi Espíritu`, que es el arreglo
   pedido. Las otras 74, idénticas.
3. ✅ **Arnés nuevo `scratchpad/ligaduras.mjs`** — 🔴 **hacía falta, y no existía.** El arnés
   del parser **no cubre `tieSegments`**, que es donde estaba el cambio de verdad: da igual que
   el parser lea bien si el arco se agrupa mal. El arnés nuevo saca `tieSegments` y
   `terminaLigado` del `.tsx` y comprueba, canción por canción, **de qué acorde a qué acorde va
   cada arco**. Resultado: **13 arcos dentro del compás + 7 que cruzan = 20, ninguna perdida.**
   → **Cazó un fallo mío antes de que Isaac lo viera:** en `F# ~ - D` el arco se quedaba en el
   `F#` solo. La cadena avanzaba una vez y el recorte la devolvía al principio. Reescrita para
   que salte al **siguiente que suene** en vez de avanzar-y-recortar.
4. ✅ **Isaac miró las 8 canciones:** *«está perfecto lo del ligamento»*.
5. ✅ **Publicado con su permiso** (*«publica, está todo perfecto»*), commit `0f5c6cf` (r39).
   El permiso valía para ese trabajo: **el siguiente push se le vuelve a pedir.**

**Las 20 ligaduras, para poder revisarlas:**

| Canción | Compás | Arco |
|---|---|---|
| Cristo Es Mi Roca | 11 · 12 · 13 | `Cm7⌒F7` · `F/A⌒Gm7` · `Cm7⌒F7` |
| Fiesta | 1 · 2 · 4 · 5 · 7 · 8 | `Bm⌒D` · `Em7⌒A7` · `Bm7⌒D` · `Em7⌒A7` · `Bm⌒D` · `Em7⌒A7` |
| Nadie Robará Mi Gozo | 6 | `Dm7:2⌒Bb:2` |
| Tengo Victoria | 4 · 5 | `Am7:2⌒Em7:2` · `F:2⌒G7:2` |
| **Si Dios Dice Que Si** | 1 | `F#⌒D` **pasando por encima del `-`** ← el caso raro |
| **Canción Feliz** | 28 · 30 · 33 · 34 · 35 | **cruzan compás** (33→34→35→36 es una cadena de `%`) |
| **Yo Bien Sé Quien Soy** | 29 | **cruza compás** (`A:1⌒`) |
| **Hay Poder En La Alabanza** | 35 | **cruza compás** (`A⌒`) |

**Y después de la ligadura, O-26** (los dos modos de leer las columnas), que es lo que él pidió
a continuación, en ese orden.

### 9.3 Dependen de Claude (a la espera de que Isaac decida)

Ninguno en marcha. **No se toca nada de esto hasta que Isaac lo dicte** (fue explícito:
«no propongas cambios, no reorganices nada y no escribas una línea de código hasta que yo te
lo confirme»).

Esto **no** es el encargo de Isaac (§9.2): son los problemas que encontré yo leyendo el
código, ordenados por lo que más puede morder. **Ninguno está aprobado.**

- [ ] **P-01 · Desactivar un usuario no lo desactiva.** `admin/actions.ts:121-136` escribe
      `profiles.active`, y **nadie lo lee nunca más**: ni el middleware, ni el layout, ni una
      sola política RLS. El usuario «desactivado» entra igual. *(Es L-36 de la carpeta
      compartida, en otra pila.)*
- [ ] **P-02 · Los cultos no compartidos son legibles por cualquiera.**
      `services_select_all` (`20240012:71`) es `using (true)` **sin `to authenticated`**. El
      filtro `is_public` solo está en el código (`s/[token]/page.tsx:22`), no en la BD. Con la
      clave `anon` —pública— cualquiera lista todos los cultos. Igual con `sheets`,
      `categories`, `sheet_tags`, `sheet_categories`: **el catálogo entero es legible desde
      internet**.
- [ ] **P-03 · «Solo el admin edita» puede ser solo apariencia.** Depende de si la migración
      011 está aplicada de verdad (T-01). Si no lo está, un `musician` puede crear y editar
      canciones llamando a la API directamente, aunque no vea el botón.
- [ ] **P-04 · Editar un culto puede dejarlo vacío.** `services/actions.ts:83-93` borra todas
      las canciones y reinserta **sin transacción**. Si el insert falla, el culto se queda sin
      canciones — y eso pasaría un domingo por la mañana.
- [ ] **P-05 · Una canción no se puede repetir en un culto.** PK `(service_id, sheet_id)` en
      `20240012:56`, y `services/actions.ts:56-58` de-duplica **en silencio**. Abrir y cerrar
      con el mismo coro es imposible y nadie explica por qué.
- [ ] **P-06 · El OCR depende de un CDN externo.** `songImport.ts:74-77` carga worker, WASM e
      idiomas de `cdn.jsdelivr.net` y `tessdata.projectnaptha.com`. Sin internet no funciona,
      en una app que se vende como instalable.
- [ ] **P-07 · El README miente en la sintaxis.** Dice `<Coro>` para las secciones; son
      `[Coro]`. Tampoco menciona cultos, presentación, enlaces públicos, PWA ni versiones por
      tono, y lista 10 migraciones de 14. Está congelado en ~r10.
- [ ] **P-08 · El enlace «Regístrate» del login da 404.** `login/page.tsx:83` → `/signup`, que
      no existe (comprobado en producción). El middleware la trata como pública
      (`middleware.ts:35`).
- [ ] **P-09 · `parseSections` está duplicado** en `lib/sections.ts:4` y
      `SongDetailEditor.tsx:33`. El día que cambie una, el editor y la presentación dejarán de
      enseñar lo mismo.
- [~] **P-10 · Higiene** — ✅ **`tsconfig.tsbuildinfo` RESUELTO en la Fase A**: añadido a
      `.gitignore` y sacado del control de versiones. Era la fuente número uno de conflictos al
      trabajar dos personas. **Queda pendiente el resto:** `tsconfig.tsbuildinfo` (112 KB) commiteado y cambiando en casi cada
      commit; `layout.tsx` huérfano en la raíz; `"strict": false` en `tsconfig.json`; y el
      CORS de `next.config.js:6-9` fija `Allow-Origin` a su propio dominio con
      `Allow-Credentials: true` sobre `/catalog/*` y `/sheets/*`, que son páginas HTML, no una
      API: no hace nada útil y miente el día que cambie el dominio.
- [ ] **P-11 · Ni una prueba, ni CI.** Sin `.github/`, sin un solo archivo de test.
- [ ] **P-12 · Versionar el caché del service worker** para cerrar T-02 de raíz.
- [x] ~~**P-14 · El middleware bloqueaba `/manifest.json`**~~ → ✅ **ARREGLADO en la Fase A.**
      El `matcher` de `middleware.ts:59` excluía imágenes y `favicon.ico` pero **no el
      manifiesto**, así que `/manifest.json` respondía **307 hacia `/login`**. El navegador lo
      pide **sin sesión** al instalar la app: sin él, la aplicación instalada en el móvil se
      queda **sin icono y sin nombre**. Apareció al poner el logo (O-15): el favicon funcionaba
      y el manifiesto no. Se añadieron `manifest.json`, `sw.js` y la extensión `.ico` a las
      exclusiones.
- [ ] **P-13 · `pdfjs-dist` permite ejecutar JavaScript arbitrario al abrir un PDF
      malicioso.** De las 15 vulnerabilidades que reporta `npm audit`, **esta es la única que
      importa de verdad**: las demás son de herramientas de desarrollo (eslint, glob,
      minimatch) que no llegan al navegador del usuario. Y aquí sí llega: la app abre PDFs que
      trae el propio usuario (`songImport.ts:33-66`). Se arregla actualizando `pdfjs-dist` —
      y después hay que **regenerar el worker** con `npm run copy-pdf-worker`, o la
      importación de PDF deja de funcionar.

### 9.4 Resueltos

- [x] **Copia de seguridad antes de tocar nada** (2026-08-19). Bundle de 892 KB y ZIP de
      586 KB en `C:\Users\TECSISTEMAS\Documents\_RESPALDOS\`, con la fecha en el nombre y
      fuera de la carpeta de trabajo. El bundle verificado: *«records a complete history»*.
- [x] **Resuelta la duda del despliegue en Vercel** (2026-08-19) — ver §6 y T-02.

---

## 10 · Ideas futuras

Del `roadmap` del README, ninguna aprobada todavía:

- [PROPUESTA] Exportar/imprimir las canciones con acordes a PDF (`@react-pdf/renderer` ya
  está instalado; hoy solo exporta la lista del culto).
- [PROPUESTA] Etiquetas, favoritos e historial de versiones en la interfaz (las tablas ya
  existen y están a 0 filas).
- [PROPUESTA] Subida y visor del PDF original.
- [PROPUESTA] Sincronización con Google Drive (tablas preparadas, nunca empezado).
- [PROPUESTA] Terminar la PWA (hoy está a medias y causa T-02).
- [PROPUESTA] Darle sentido al rol `musician`, que hoy es idéntico a `viewer`.

---

## 11 · Convenciones

- **Español** en comentarios, mensajes de interfaz y textos. El código heredado mezcla inglés
  y español (los nombres de tabla y columna están en inglés): **no se renombra nada**, se
  escribe lo nuevo en el estilo de lo que hay al lado.
- **Comentarios que explican el porqué**, no el qué. El primo lo hace bien en
  `TablaturePreview.tsx` y `PresentationView.tsx`: seguir ese nivel.
- **Migraciones**: se añade una nueva, nunca se toca una existente (D-04). Numeración
  correlativa siguiendo `supabase/migrations/`.
- **Git**: rama aparte (D-03), nada de `commit`/`push` sin permiso concreto (D-01), jamás
  `--force` (D-02).
- No se comparte código con los otros proyectos de Isaac, solo criterio.

---

## 12 · Protocolo para publicar sin romper nada

> Pedido por Isaac el 2026-08-19: *«dame la lista completa de lo que veas necesario para que no
> se tenga problemas para publicar y hacer cambios»*. Esto es lo que hay que tener resuelto
> **antes** de empezar el encargo de §9.2.

### 12.1 ✅ RESUELTO — la copia de las canciones (era lo más urgente)

**Hecho el 2026-08-20.** Hasta ese día el repositorio estaba respaldado pero **las 75 canciones
no**: vivían solo en un proyecto Supabase en plan Free, sin copias automáticas, en la cuenta de
otra persona y compartido con un proyecto ajeno.

| Dónde | Qué |
|---|---|
| `_RESPALDOS\Partituras-datos-2026-08-20\` | Un JSON por tabla + `TODO-2026-08-20.json` |
| `_RESPALDOS\Partituras-datos-2026-08-20.zip` | **57 KB**, la misma copia comprimida |
| `scripts/export-datos.mjs` + `npm run export` | Para repetirlo cuando haga falta (D-11) |

**75 canciones · 28.203 caracteres de acordes · 6 versiones por tono · 14 categorías · 2 cultos.**

⚠️ **Dos cosas que hay que saber de esta copia:**

1. **Las 6 canciones en BORRADOR no las ve la clave pública.** Se bajaron aparte, por consulta
   directa, y se **verificaron con MD5 contra la base**: las seis son idénticas. Están en
   `sheets-borradores.json` y fundidas en `sheets-completo.json`. **Mientras no haya
   `service_role` en el `.env.local`, `npm run export` volverá a dejarse esas 6** — el propio
   script lo avisa al terminar.
2. 🔴 **El exportador funciona hoy porque existe el fallo P-02.** Baja los datos con la clave
   `anon` aprovechando que las políticas de lectura no exigen sesión. **El día que se arregle
   P-02, este script dejará de funcionar sin la `service_role`.** Están atados: si se cierra
   ese agujero, hay que poner la clave maestra antes.

### 12.2 Accesos que faltan

| # | Qué | Por qué bloquea |
|---|---|---|
| 1 | **Invitación al proyecto de Vercel** | Sin ella, si un build falla, el cambio no se publica y **nadie se entera**: no hay logs ni forma de revertir desde el panel |
| 2 | **Clave `service_role`** | Sin ella, `/admin` no puede crear usuarios en local |
| 3 | **Cuenta propia de Supabase + invitación a la organización** | Hoy se está usando la sesión del primo (§9.1) |
| 4 | **Un acuerdo con el primo sobre quién toca `main`** | ⚠️ **El que más se olvida.** Si los dos empujan a `main` sin avisarse, se pisan — y cada push publica. Basta con decidir: *«te aviso antes de subir»* |

### 12.3 El procedimiento, cada vez

1. **Nunca trabajar sobre `main`.** Rama aparte (D-03).
2. **Compilar en local antes de publicar.** Es la única red que hay hoy: si falla aquí, habría
   fallado en Vercel — y allí no se ve. **Con el servidor de desarrollo encendido, `npm run
   verificar`**, que compila aparte y no lo rompe (T-04).
3. **Probar el flujo completo en `npm run dev`**, como lo haría un músico.
4. **Pedirle permiso a Isaac** para el push (D-01). Cada permiso vale para ese trabajo.
5. Publicar y **esperar un minuto largo**.
6. **Comprobar en `https://partituras-blush.vercel.app` con Ctrl+F5** (§3). Sin el Ctrl+F5 no
   se está comprobando nada: se está mirando el caché (T-02).
7. **Si algo salió mal: `git revert`**, que crea un commit nuevo que deshace. **Nunca
   `git reset` ni `--force`** sobre una rama compartida (D-02). El revert se publica solo,
   igual que el error.

### 12.4 Lo que hay que arreglar para que publicar deje de dar miedo

Ninguna de estas cuatro cambia lo que ve el músico. Las cuatro evitan problemas:

- ✅ **① HECHO (2026-08-20) — CI en GitHub Actions** (`.github/workflows/build.yml`), verde a
  la primera en 1 min 10 s. Era **la pieza que más faltaba**: hoy, si alguien rompe el build, el sitio se queda con la versión anterior y
  no hay ningún aviso. Con un archivo de unas 15 líneas, GitHub pone un ✅ o un ❌ en cada
  commit — y eso funciona **aunque no se tenga acceso al panel de Vercel**, así que resuelve
  la mitad del problema del acceso 12.2-1.
- ✅ **② HECHO (2026-08-20) — `tsconfig.tsbuildinfo` fuera del repositorio** (P-10). Son 112 KB **generados** que
  cambian en casi cada commit. Con dos personas trabajando, **va a dar conflicto de merge una y
  otra vez**, siempre en un archivo que a nadie le importa. Se añade a `.gitignore` y se quita
  del seguimiento. Es la fricción número uno entre Isaac y su primo, y cuesta dos minutos.
- **③ Versionar el caché del service worker** (P-12). Mientras no esté, **cada cambio va a
  parecer que no se aplicó**, y se van a perder horas buscando el fallo donde no está.
- **④ Cuatro pruebas de las funciones puras** — `music.ts` (transposición), `chordInput.ts`
  (escribir acordes) y `sections.ts`. No son un capricho: **son justo los archivos que el
  encargo de §9.2 va a tocar** (O-01 y O-03 entran en el parser), y son funciones de entrada y
  salida, las más fáciles de probar que existen.

### 12.5 Riesgos concretos del encargo de §9.2

- ⚠️ **O-01 y O-03 cambian cómo se interpreta el texto de las canciones.** Las 75 que ya
  existen **tienen que seguir viéndose exactamente igual**. → **Antes de tocar el parser,
  guardar el `content` de las 75 y comparar el resultado antes/después.** Si no, el fallo se
  descubre en mitad de un culto.
- ⚠️ **El staccato con `.` rompería todas las canciones guardadas** (choca con `:1.5`). Ver la
  pregunta abierta en O-03.
- ⚠️ **O-09 es el único punto que toca la base de datos de producción.** Migración nueva
  (D-04), OK explícito de Isaac, aviso al primo y copia previa (12.1).
- ⚠️ **O-08 por el camino (a)** crearía un segundo motor de dibujo que mantener para siempre.
  Ver la recomendación.

---

## 13 · Historial

### 2026-08-20/21 · Tanda 28 — la ligadura, el modo de lectura, el tono con bemoles · 🚀 r39

**Publicado:** commit `0f5c6cf`, push `c5dea4e..0f5c6cf` a `main`. **CI verde**
(`runs/32446255909`). Comprobado en producción con `Cache-Control: no-cache`: el manifiesto
sirve `"Partituras con acordes…"`, texto que **solo existe en este commit** — es la prueba de que
lo desplegado es esto y no lo anterior. `/login` 200, los dos iconos 200.

**Lo que entró:**
- **La ligadura, los tres fallos** (§9.2-ter): arco medido en pantalla en vez de repartido por
  porcentaje, arco que salta los textos intermedios, y medio arco a cada lado de la barra cuando
  cruza de compás. **20 ligaduras en las 75 canciones, ninguna perdida.**
- **D-19:** encadenar (`C~ D~ E`) da **un arco largo**, no una cadena de arquitos. Ya funcionaba;
  se preguntó y se confirmó. **No se programó nada.**
- **O-26:** dos maneras de recorrer las columnas, con multi-columna de CSS (no `grid-auto-flow`,
  ver el porqué en O-26). Guardado por músico.
- **T-11:** una canción en `Bb` mostraba `A#`. 4 canciones afectadas.
- **O-27:** «Cancionero» → «Partituras».
- **`npm run verificar`:** compila aparte y ya no rompe el servidor de desarrollo (T-04).

**Tres arneses nuevos en el `scratchpad`,** todos sacando el código del archivo real:
`ligaduras.mjs` (dónde empieza y acaba cada arco), `cadena.mjs` (qué hace encadenar) y
`tono.mjs` (compila `music.ts` con el TypeScript del proyecto y comprueba la etiqueta de tono).
🔴 **`ligaduras.mjs` cazó un fallo mío que el arnés viejo no podía ver** — L-104.

**Lecciones a la carpeta compartida:** L-104, L-105, L-106, L-107.

### 2026-08-20 · Tanda 27 — FASE D: staccato y duración suelta (falta la ligadura)

La fase de más riesgo, la única que podía estropear canciones ya escritas. **La red de
seguridad valió la pena y cazó un fallo que no se veía de ninguna otra forma.**

**Cómo se hizo, y así hay que hacerlo la próxima vez:** antes de tocar nada, se sacó
`parseMeasures` del componente y se pasaron por él **las 75 canciones (2.524 compases)**,
guardando el resultado. Después de cada cambio, se repitió y se comparó.

- 🔴 **Lo que cazó:** «Es Por Fe» tiene la etiqueta `<Conteo 1, 2, 3, Sube!>` — **con signo de
  exclamación dentro del texto**. El staccato nuevo **se lo comía**. En la cuadrícula se habría
  visto «Sube» con un punto raro debajo, y nadie lo habría notado hasta un culto. Arreglado: el
  `!` no se toca dentro de `<…>` ni de `(…)`.
- ✅ **Hallazgo bonito:** «Renueva Mi Espíritu» ya tenía escrito `Bb:2 :1 z:1`, con una
  **duración suelta** que **nunca funcionó** —salía como texto gris—. Alguien la escribió
  esperando que sirviera. Ahora sirve. **Es la única de las 75 que cambia**, y cambia para bien.
- ✅ **O-03 · Staccato**, con `!` (D-08): punto debajo del acorde, botón propio en la botonera y
  el `!` pegado al acorde al escribir.
- ✅ **O-01 · Duración suelta**: `:1` sin acorde delante dibuja su figura sola, en el mismo sitio
  donde va la de los acordes. Y la ligadura `~` ya engancha también con una duración suelta.

⛔ **PENDIENTE de O-01: qué debe hacer exactamente la ligadura al «unir las duraciones».** Hay
dos lecturas y no se puede adivinar: (a) dibujar las dos notas con el arco y que el compás
cuente la suma —que es lo que ya pasa—, o (b) fundirlas en **una sola figura** con la duración
sumada (negra + negra ligadas = una blanca). Preguntado a Isaac con un ejemplo.

### 2026-08-20 · Tanda 26 — FASE F: el PDF del culto, con sus acordes

El botón PDF bajaba solo la lista de canciones. Ahora se lleva el culto entero: cada canción en
su hoja, con sus acordes, en el tono del culto, en horizontal o vertical y en claro u oscuro.

**Cuatro fallos por el camino, y ninguno se vio compilando:**

1. 🔴 **La hoja estaba dentro del panel**, que usa altura fija y `overflow: hidden`. Con eso el
   navegador **no puede paginar**: salía **1 página** en vez de 7, cortada, y con la barra de
   navegación impresa dentro del PDF. Se movió a `/imprimir/culto/[id]`, fuera del panel.
   → Y al moverla **se rompió la dirección vieja**, que Isaac tenía abierta: 404. **Al mover una
   ruta hay que dejar la vieja redirigiendo** (T-09).
2. 🔴 **El modo claro salía ilegible**: se forzó el color del texto a negro pero **los fondos
   siguieron oscuros**. Negro sobre azul marino. Se arregló dejando de pintar colores a mano y
   **encendiendo o apagando el modo oscuro de la propia página**, que ya sabe pintarse sola.
3. 🔴 **El marco blanco del PDF en modo oscuro.** El margen de página **es papel que no se puede
   pintar**: se puso a cero y el aire se hace por dentro, con relleno.
4. 🔴 **En el móvil salían 14 páginas en vez de 7.** Se había puesto que cada canción midiera
   `100vh`; el navegador del teléfono calcula eso con **la pantalla del móvil**, no con la hoja,
   así que cada canción ocupaba dos páginas (T-10).

📌 **La orientación no se puede imponer en el móvil** —Brave y Chrome en Android usan el sistema
de impresión de Android—, así que se añadió un **selector Horizontal/Vertical**. Se midió: en
hoja vertical **dos columnas siguen cabiendo** (7 páginas), mientras que con una sola las
canciones largas se parten (10 páginas). Van dos columnas siempre.

🧰 **Lo más útil de esta tanda no es código: ahora se pueden generar los PDF desde aquí**, con
Edge en segundo plano, y contar páginas, orientación y colores **antes** de pasarle nada a Isaac.
Hasta ahora el PDF solo lo veía él. Los parámetros `?fondo=` y `?hoja=` existen para eso —y de
paso sirven para mandar un enlace ya en un modo concreto.

⚠️ **Y dos veces mintió mi propia comprobación**, que es lo que más despista: el detector de
color no encontraba el fondo oscuro porque el PDF escribe `.0588` **sin el cero delante**; y el
`@media print and (orientation: portrait)` **se aplicaba al revés**, generando 11 páginas.

### 2026-08-20 · Tanda 25 — Se crea el comunicado de cambios (D-18)

Isaac quiere avisar a la gente de la iglesia de lo que va cambiando, así que se crea
**`CAMBIOS.md`**: lo mismo que el historial de aquí, pero **contado para quien usa la página**.

- Agrupado por **dónde se nota** (canciones, acordes, cultos, cuentas, móvil), no por fases.
- Sin nombres de archivo, sin migraciones, sin fases: eso vive en este documento.
- Con **las cifras que se entienden solas**: «salían 50 de 69», «afectaba a 17 de las 75».
- Lo de dentro —copia de seguridad, comprobación automática— va en un apartado corto al final,
  porque a él sí le interesa aunque no se vea.

**A partir de ahora se actualiza en cada publicación**, como el `CLAUDE.md`. Ver la regla nueva
en la cabecera.

### 2026-08-20 · Tanda 24 — El enlace compartido distingue quién lo abre (O-23, O-25)

- ✅ **O-23 (b) hecha y confirmada por Isaac**: *«de hecho está mejor de lo que pensaba»*. El
  **mismo** enlace enseña ahora dos cosas distintas según quién entre: al invitado, lo de
  siempre; a quien tiene su cuenta iniciada, además un botón **«Abrir el culto completo»** y las
  **canciones pinchables**. Comprobado: **0 canciones pinchables sin cuenta, 7 con cuenta**.
- ✅ **O-25 · El invitado ya puede elegir claro/oscuro y el tamaño de letra.** La página
  compartida vive fuera del panel, que es donde se monta el tema, así que se monta ahí mismo.
  **Solo en la lista**: el modo presentación tiene su propio ajuste (O-06) y dos controles sobre
  el mismo texto se estorban. Comprobado que la presentación **no** lleva el control nuevo.

🔧 **Dos veces seguidas salió HTTP 500 y NO era el código (T-08):** quedaban servidores de
desarrollo viejos ocupando el puerto 3000, así que el nuevo arrancaba **en el 3001, en silencio**,
y se estaba midiendo el viejo.

📌 **Y un detector mío que mentía:** para comprobar que la presentación NO llevaba el control
nuevo se buscaba el texto «Reducir letra»… que **el propio modo presentación ya usaba** en su
botón. Se distinguió buscando «Modo oscuro/claro», que solo tiene el control de lectura.

### 2026-08-20 · Tanda 23 — O-22 confirmada · O-24 pedida y descartada en el momento

- ✅ **O-22 funciona**: Isaac mandó el aviso y enseñó la captura del mensaje recibido. Se dio
  cuenta él solo de que el enlace salía con `localhost` **porque lo probó en su equipo**.
- ❌ **O-24 descartada por él** al ver que partía de una suposición equivocada (ver §9.2).
  Se implementó y se deshizo en la misma tanda.
- 🧹 **Queda de ganancia el componente `ShareBox`**: el bloque del enlace público salió de
  `ServiceEditor` —que pasa de 800 líneas— a su propio archivo. El comportamiento es **el mismo
  de antes**: solo lo ve el administrador.
- 📌 **O-23 registrada y a la espera de respuesta**: si quien abre el enlace compartido tiene
  cuenta, ¿se le lleva directo al culto completo, o se le deja en la misma página con un botón y
  las canciones pinchables? Recomendada la segunda.

### 2026-08-20 · Tanda 22 — El botón de avisar por WhatsApp (O-22)

- ✅ **O-09 confirmada por Isaac**: *«lo de repetir canciones está bien, lo probé y funciona»*.
- ✅ **O-22 · Botón «Avisar»** junto a «Copiar», en el bloque del enlace público. Abre WhatsApp
  con el aviso ya escrito —nombre del culto, fecha y enlace— y **deja que Isaac elija el grupo**.
  Sin cuenta de empresa, sin plantillas, sin pagar nada.
- 🔧 Dos tropiezos al escribirlo, los dos cazados al compilar: un `
` que se convirtió en salto
  de línea real al pasar por el guion, y el bloque colocado **antes** de la variable que usa.

📌 **Punto ciego nuevo de la verificación:** el botón **no sale en el HTML del servidor**, porque
la dirección pública se arma en el navegador (`window.location.origin`). **«Copiar», que lleva
ahí desde antes, tampoco sale.** Así que ninguno de los dos se puede comprobar por línea de
comandos: **hay que mirarlos en el navegador**. Es el tercer punto ciego distinto que aparece
—los otros dos eran el panel de administración y la botonera del editor—.

### 2026-08-20 · Tanda 21 — Las dos migraciones aplicadas · y rompí el catálogo 3 minutos

Isaac da el OK. Se hizo en este orden: copia fresca → migraciones → publicar.

**Copia previa** (`_RESPALDOS\Partituras-datos-2026-08-20-16h09`), comprobando antes que
guardaba lo que se iba a perder: **`hv-018` está a salvo**, y los 6 borradores **no se han tocado
desde el 2 de julio**, así que la copia de la mañana sigue valiendo para ellos.

- ✅ **Migración `20240015`** (repetir canción en un culto). Comprobado: **9 filas de repertorio
  intactas**, ninguna sin identificador, y la clave primaria ya es `id`.
- ✅ **Migración `20240016`** (fuera el número de himno). **Falló al primer intento, y sin borrar
  nada**: la vista `sheet_catalog` dependía de la columna. La vista **no la usa la app**, pero no
  se borró —eso no lo había pedido nadie—: se rehízo sin ese campo, **devolviéndole sus
  permisos**, porque `create or replace view` no deja quitar columnas y hay que borrarla y
  crearla. Comprobado después: **75 canciones**, «Amado de mi Alma» sigue ahí, la columna ya no
  existe, la vista devuelve sus 69 filas y conserva sus 14 permisos.
- ✅ **T-06 · Tono menor** publicado y verificado: «Jericó» muestra **`Am`**, no `A`.

🔴 **UN ERROR MÍO, y de los que enseñan (T-07):** ejecuté la migración que borra la columna
**antes** de publicar el código que dejaba de pedirla. Durante unos **3 minutos** el catálogo
salió **vacío** en producción —«Sin resultados»— porque el código que había arriba seguía
pidiendo un campo que ya no existía. Se arregló publicando de inmediato. **No se perdió ningún
dato**, pero la página estuvo inservible para cualquiera que entrara.
→ **La regla que faltaba: primero se publica el código, después se borra de la base.** Añadir es
seguro en cualquier orden; quitar solo es seguro cuando ya nadie lo pide.

### 2026-08-20 · Tanda 20 — Tono menor arreglado · dos migraciones esperando OK

- ✅ **T-06 · Arreglado el tono menor.** `Bm` salía como `B` en la barra de la presentación —y
  son tonalidades distintas—. El modo se lleva aparte y se devuelve al final (`esMenor` en
  `music.ts`). **Afectaba a 17 de las 75 canciones.** Probado con las tonalidades reales del
  cancionero: 12 casos, todos correctos. Se arregla en un solo sitio, así que vale para el culto
  **y** para el catálogo, como pidió.
- ✅ **Migración `20240016` escrita** para quitar `hymn_number` de la base (D-16 ampliada).
- 📌 **O-22 · La idea de avisar por WhatsApp, registrada con sus dos caminos y sus costes.**
  Resumen: **con un botón sale gratis y hoy mismo**; que salga solo necesita la API de empresa de
  Meta, con verificación, plantillas aprobadas y **facturación por conversación**.

⛔ **DOS MIGRACIONES ESCRITAS Y SIN EJECUTAR**, las dos esperando el OK expreso de Isaac (D-04):
`20240015` (repetir canción en un culto) y `20240016` (quitar el número de himno). Antes de
ejecutarlas: **`npm run export` fresco**.

### 2026-08-20 · Tanda 19 — Fuera el Nº · FASE E a medias (falta la migración)

- ✅ **D-16 · Fuera el número de himno.** Quitado de la tarjeta, del `select` del catálogo y de
  la búsqueda. ⚠️ **La columna se queda en la base**: «Amado de mi Alma» la tiene rellena y
  borrarla perdería ese dato. Está fuera de la vista, no de la base.
- ✅ **D-17 · Los 6 borradores no se publican.** Anotado para no tocarlos.
- 🟡 **FASE E · O-09 · código hecho, migración pendiente de ejecutar:**
  - **Migración nueva `20240015_service_songs_repetidas.sql`**: la clave primaria de
    `service_songs` deja de ser `(service_id, sheet_id)` y pasa a ser un **identificador propio
    de cada fila**. Eso es lo que impedía repetir una canción.
  - **El editor identifica cada fila por una clave suya (`uid`)**, no por `sheet_id`. Era lo que
    hacía falta para que dos filas de la misma canción no se pisaran: cada aparición conserva
    **su posición, su tono y su nota**.
  - **El buscador ya no esconde las canciones que están puestas**: ahora avisa con un «ya está»
    (y «ya está ×2»…) pero **deja añadirlas otra vez**.
  - **La acción de guardar deja de borrar las repetidas en silencio**, que era lo que hacía.
  - ⚠️ **La migración NO se ha ejecutado.** Toca la base de producción y necesita el OK expreso
    de Isaac (D-04). Antes conviene un `npm run export` fresco.

### 2026-08-20 · Tanda 18 — FASE H hecha (sin publicar): navegar y ampliar con el teclado

Isaac confirma O-16 (*«funciona bien... tanto sin filtro como con filtro»*) y pide llevar la
misma idea al modo vista.

- ✅ **O-20 · Pasar de canción en modo vista.** Botones **‹ ›** con el contador (`2/4`) junto a
  Vista/Edición, y las flechas **← →** del teclado. Respeta el filtro igual que O-16: las
  vecinas son las de la lista que se estaba viendo.
- ✅ **O-21 · Teclas `+` y `−` para el tamaño de letra.** En pantalla completa mueven el tamaño
  de la canción (y por tanto **lo guardan**, O-06). En modo vista mueven el zoom de lectura, el
  mismo que el control del `90%` de la esquina — así **las mismas teclas hacen lo mismo en las
  dos pantallas**. Se aceptan `+`, `=` y las del pad numérico.
- ⚠️ **Los atajos NO actúan si se está escribiendo** (input, textarea, select o campo editable),
  ni con Ctrl/Cmd/Alt. En modo edición las flechas siguen moviendo el cursor por los acordes y
  el `+` se escribe, como debe ser.

📌 **Coste que conviene tener presente:** la vista de una canción hace ahora **una consulta más**
—la lista del catálogo— para saber cuáles son sus vecinas. Es ligera (sin el texto de los
acordes, O-05), pero está ahí.

### 2026-08-20 · Tanda 17 — O-14 confirmada · FASE G hecha (sin publicar)

- ✅ **O-14 confirmada por Isaac en producción**: *«ahora sí me dejó cambiar el nombre»*, con el
  mensaje «Nombre actualizado». **T-05 queda demostrada de las dos caras**: falla en local por
  falta de clave, funciona publicada.
- ✅ **D-13, D-14, D-15 anotadas** (ver §5). La más importante para no meter la pata: **la página
  la maneja Isaac él solo**; los 6 borradores los puso él.
- ✅ **FASE G · O-16 hecha**: desde la pantalla completa de una canción se pasa a la siguiente
  **de la lista que el músico estaba viendo**, respetando su filtro de categoría y su búsqueda.
  - El filtro viaja del catálogo → tarjeta → vista de la canción → pantalla completa.
  - `PresentationView` acepta ahora `startIndex`, para empezar en la canción que se abrió.
  - El enlace de «volver al catálogo» también conserva el filtro.
- 🧹 **La consulta del catálogo se sacó a `src/lib/catalogo.ts`**, porque ahora la necesitan
  **dos** pantallas y tienen que devolver **la misma lista en el mismo orden**. Copiarla habría
  garantizado que con el tiempo «la siguiente» dejara de coincidir con la lista (P-09).

### 2026-08-20 · Tanda 16 — FASE C PUBLICADA · y se cierra el punto ciego del panel

**Publicada:** commit `73bb508` (**r34**). Vercel `success`.

**Verificado en producción:** el culto compartido y la canción suelta siguen dibujando sus
acordes sin errores, el catálogo bien, y **`/admin` responde 200 con los 7 usuarios y el lápiz
de O-14 en su sitio**.

🔑 **El punto ciego del panel se cerró, pero por una razón que hay que vigilar:** Isaac subió la
cuenta de prueba a **administradora** —lo hizo en producción, porque en local no podía (T-05)—.
Gracias a eso se pudo comprobar `/admin`. **Pero esa cuenta ahora puede borrar canciones y
cambiar roles**, así que queda anotado en §9.1: **solo se usa para mirar**, y hay que bajarla a
lector cuando no haga falta.

📌 **Dato que se aclaró de paso:** con esa cuenta el catálogo enseña **75** canciones y no 69,
porque **un administrador ve también los 6 borradores**. Para los músicos y lectores siguen
siendo **69**. Los borradores **siguen sin publicar**.

🔧 **Y un fallo mío de proceso, el segundo del mismo tipo:** paré el servidor de desarrollo para
compilar (T-04) y **no lo volví a levantar**, así que Isaac se lo encontró caído. **Regla: después
de compilar, relanzarlo siempre.**

### 2026-08-20 · Tanda 15 — Isaac prueba la Fase C y dicta 4 órdenes nuevas

**Lo que probó:**
- ✅ **O-06 funciona**, confirmado por él en el culto **y** en el catálogo, probando las cuatro
  maneras: *«lo del tamaño de letra y guardado va súper»*.
- ⚠️ **O-14 le dio `supabaseKey is required`** en local. **No es un fallo del código:** falta la
  clave `service_role` en su `.env.local` → documentado como **T-05**. Él mismo dio con la
  pista buena: *«en la página que está subido sí pude cambiar el rol»*, porque allí Vercel sí la
  tiene. **O-14 se queda sin probar hasta que haya clave, o hasta publicarlo.**
- 🔧 **Mejorado el mensaje de error** (`supabase/server.ts`): ahora dice qué clave falta, para
  qué sirve y de dónde se saca.

**Lo que dictó (§9.2, «Las 4 nuevas»):** **O-16** (pasar a la siguiente canción desde la pantalla
completa del catálogo), **O-17** (ver el acorde en piano, bajo, guitarra y trompeta), **O-18**
(sección de letras para las cantantes) y **O-19** (sección para trompetas). Las tres últimas
quedan **pendientes**, como él mismo propuso para O-17.

📌 **De O-17 salió una duda musical que hay que resolver antes de programar nada:** la trompeta
**no toca acordes** y **es un instrumento transpositor en Si♭** —lee un tono por encima de lo
que suena—. Enseñarle una digitación sin tener eso en cuenta sería enseñarle algo **incorrecto**.
La misma duda afecta a O-19.

### 2026-08-20 · Tanda 14 — FASE C hecha (sin publicar)

- ✅ **O-14 · Cambiar el nombre de una cuenta.** `setNameAction` nueva en `admin/actions.ts`
  (con `requireAdmin`), y en `AdminUsers.tsx` un lápiz junto a cada nombre que abre dos campos
  —nombre y apellido— con Guardar y Cancelar. **No cierra la sesión de nadie**: el nombre vive en
  `profiles` y la sesión en `auth.users` + la cookie.
- ✅ **O-06 · El tamaño de letra se guarda por canción y por músico** (D-09b), en el navegador
  de cada uno.
  - Ajustar con **+/−** guarda el tamaño de esa canción.
  - El botón **«Ajustar a pantalla»** lo borra y devuelve la canción al automático.
  - Al abrir una canción, si tiene tamaño guardado se usa; si no, se auto-ajusta.
  - **Cambiar de columnas o entrar en pantalla completa ya NO pisan el tamaño fijado**: antes
    forzaban el automático. Si el músico fijó un tamaño, manda el suyo.
  - Vale en las **tres** pantallas de presentación: culto, culto compartido y canción suelta.

**Para poder guardarlo hizo falta que la canción llevara su id hasta el visor:** `PresentSong`
tiene ahora `id`, `mapPresentSongs` lo rellena y las dos consultas de presentación piden
`sheet_id`. **Comprobado que los 7 ids del culto llegan por las dos vías.**

📌 **Detalle de acabado:** el efecto que aplica el tamaño guardado va en `useLayoutEffect` y
**antes** del auto-ajuste. Con un efecto normal se veía un parpadeo: la canción aparecía un
instante con el tamaño calculado y saltaba al guardado.

⚠️ **Punto ciego, otra vez el mismo:** `/admin` es solo para administradores y la cuenta de
prueba es **lectora** —comprobado: rebota a `/catalog`—, así que **O-14 no se ha visto
funcionando**. La acción existe, compila y comprueba permisos; el resto lo tiene que mirar
Isaac. Es el mismo hueco que con la botonera (L-100).

### 2026-08-20 · Tanda 13b — La carpeta compartida la escriben dos conversaciones a la vez

Al corregir la lección del disminuido apareció un lío en `LECCIONES.md`: **había lecciones que no
eran mías** —una marcada `[GDT]`—, así que **otra conversación de Isaac, en otro proyecto,
estuvo escribiendo en la carpeta compartida mientras trabajábamos aquí**. Sus números
(L-96, L-97, L-98) chocaron con los míos, y al sustituir mi lección cortando «hasta la siguiente
L-98» el corte **duplicó un bloque suyo**, porque esa L-98 estaba *antes*, no después.

**Reparado sin perder nada de la otra conversación:** quitado el bloque duplicado, quitada mi
versión errónea de L-97, y **mis tres lecciones renumeradas a L-99, L-100 y L-101**. Las suyas
intactas. Copia del estado roto en `_RESPALDOS\LECCIONES-roto-2026-08-20.md` por si acaso.

📌 De aquí sale **L-102**, que es la de fondo: la carpeta compartida **cambia mientras trabajas**,
así que hay que releerla justo antes de escribir, calcular el máximo real —no el del final, que
no está ordenada— y comprobar que no quedan duplicados.

### 2026-08-20 · Tanda 13 — El disminuido, bien entendido esta vez (D-08b)

Isaac aclara lo que quería desde el principio: **«que arriba en la edición y donde se escribe a
mano diga dim, pero que en la lectura aparezca °»**. Es decir, lo contrario de lo que se hizo en
la tanda 11.

**Dónde estuvo mi error, y no fue el que creí:** en la Fase A cambié también **la etiqueta del
botón** a `°`. Isaac busca ese botón por su nombre —«dim»—, así que al cambiarlo **dejó de
encontrarlo**, y eso es lo que reportaba con *«no me sale lo del dim»*. Lo interpreté como que
el botón escribía algo distinto de lo que enseñaba, y «arreglé» haciendo que escribiera `°`:
me alejé más.

**Cómo queda (D-08b):**
- El botón **dice `dim`** y **escribe `dim`** (igual que antes de la Fase A).
- La cuadrícula **dibuja `°`**, que es la única parte que él pidió cambiar.
- `maj7` sigue como venía del primo: botón `Δ`, escribe `maj7`, dibuja `Δ`.
- Se quitaron `°` y `°7` de los modificadores: ya no hay botón que los inserte.

**Verificado sobre el código real:** botón `dim` → escribe `Bdim` → se lee `B°`; `dim7` →
`Bdim7` → `B°7`; `Δ` → `Cmaj7` → `CΔ`; `m7b5` y `sus4` intactos; y escrito a mano `Bdim:2` se
lee `B°:2` sin tocar la duración. **«Jericó», que tiene `°` a mano, se sigue viendo igual.**

⚠️ **Compilado con el servidor de desarrollo parado**, aplicando T-04.

### 2026-08-20 · Tanda 12 — Servidor de desarrollo roto por compilar encima (T-04)

Isaac abre Jericó en `localhost` para comprobar la botonera y le sale un **Server Error**:
`Cannot find module './vendor-chunks/@supabase.js'`.

**No era el código.** Al verificar el arreglo del `°` se lanzó `npm run build` **con el servidor
de desarrollo abierto**; los dos escriben en `.next`, y el build dejó al servidor buscando
archivos que ya no estaban. Documentado como **T-04**, con el síntoma exacto para reconocerlo, y
avisado junto a los comandos de §2.1.

**Resuelto:** servidor parado, `.next` borrada, servidor relanzado. Comprobado: Jericó carga
(HTTP 200), **`B°` se dibuja** y **no queda rastro de «dim»**. El repositorio no se tocó y
producción nunca se enteró.

📌 El aviso de *«Next.js 14.2.35 is outdated»* de esa pantalla es un recordatorio del propio
Next, no tiene que ver con el fallo. Actualizar Next es una decisión aparte y no urgente.

### 2026-08-20 · Tanda 11 — El botón del disminuido decía una cosa y escribía otra

Isaac, usando el editor en «Jericó», avisa de que **el `°` no le sale «como las otras
opciones»**. Tenía razón, y era un fallo mío de la Fase A: **la O-04 se hizo a medias**.

**El fallo:** se cambió cómo se DIBUJA el acorde (`dim` → `°`) y también la etiqueta del botón,
pero **no lo que el botón ESCRIBE**. Al pulsarlo se tecleaba la palabra `dim`, así que en el
editor aparecía `Bdim` mientras al lado, en la misma canción, ya había `B°` escrito a mano. En
la cuadrícula las dos se veían igual — el fallo **solo se notaba escribiendo**, que es
justamente lo que yo no podía probar.

**Arreglado:** el botón escribe ahora el símbolo `°` (y `°7`) directamente
(`ChordToolbar.tsx`), y se añadieron `°` y `°7` a los modificadores que se pegan al acorde sin
espacio (`chordInput.ts`) — sin eso habría salido `B °` en vez de `B°`. **`dim` se mantiene
aceptado**: hay una canción (`Babel`) que lo usa y se sigue viendo `°`.

**Verificado:** pulsar `[B] [°] [:2]` produce exactamente `B°:2` — probado sobre la función real
del archivo, con 8 casos, todos correctos. `formatSuffix`: `°`→`°`, `dim`→`°`, `dim7`→`°7`,
`m7b5` intacto. En la pantalla de «Jericó», `B°` se dibuja y **ya no aparece «dim» por ningún
lado**.

⚠️ **Lo que sigue sin poderse verificar aquí: la botonera.** Solo existe en modo edición, y el
usuario de prueba es **lector**. Para comprobarla hace falta una cuenta de administrador, o
mirarlo en `localhost`.

**Las dos formas conviven a propósito:** `°` es lo que se escribe de ahora en adelante, y `dim`
se sigue entendiendo para lo ya escrito. **Ninguna canción hubo que tocarla.**

### 2026-08-20 · Tanda 10 — FASE B PUBLICADA · y por fin se puede verificar la pantalla

Isaac avisa de que no ve los cambios. **No era el caché: la Fase B no estaba publicada** —le
había pedido permiso y quedamos ahí—. Se comprueba con evidencia (el `catalog/page.tsx` de
`origin/main` aún tenía `.limit(50)`), y **crea una cuenta de prueba** para que se pueda
verificar la interfaz.

- ✅ **Publicada la Fase B**: commit `36ba65d` (**r32**).
- ✅ **Verificada la pantalla de verdad, con sesión** (§7): 69 tarjetas, 13 con dos categorías,
  cero miniaturas, el botón en su sitio y la pantalla completa abriendo la canción.
- ✅ **Documentado cómo entrar por línea de comandos** para verificar páginas protegidas (§2.3).
  Hasta ahora **eso era el agujero de todas las verificaciones**: se comprobaban datos, rutas y
  compilación, pero nunca la pantalla.
- 🔧 **Falso positivo detectado y anotado:** `404: This page could not be found` aparece en el
  HTML de **todas** las páginas de Next, así que no sirve para detectar errores. Casi se reporta
  como fallo la pantalla completa, que funcionaba bien.
- 📌 **Isaac preguntó cómo ver los cambios ANTES de publicar.** Respuesta: **`npm run dev` y
  `localhost:3000`**. Queda como el orden de trabajo a partir de ahora: cambio → él lo mira en
  local → publicar. Las vistas previas de Vercel **no sirven** porque están protegidas y él no
  tiene acceso al panel.

### 2026-08-20 · Tanda 9 — FASE B hecha (sin publicar)

Isaac autoriza la Fase B y pide **una copia antes, por si algo sale mal**. Hecha:
`_RESPALDOS\Partituras-antes-faseB-2026-08-20.bundle` (1,3 MB, historial completo con r31
dentro) y `.zip` (2,4 MB, el código sin `node_modules`).

- ✅ **O-05 · Fuera la miniatura de acordes de la tarjeta.** `SheetCard.tsx` reescrito: se
  quitaron el `TablaturePreview` en miniatura **y el contador de «N partes»**, como pidió. La
  tarjeta se queda con **título, compositor, categorías, tonalidad, compás y estado**.
  → Se añadió también el **número de himno** cuando existe («Nº …»), por lo de *«y demás cosas
  para saber las características»*. **Si no lo quiere, se quita en una línea.**
- ✅ **O-10 · Salen todas.** Fuera el `.limit(50)` de `catalog/page.tsx`. **Comprobado contra la
  base: la consulta devuelve 69**, que son las publicadas. ⚠️ **Las 6 en borrador siguen sin
  aparecer**, y es correcto: están sin publicar. Para que salgan hay que marcarlas como
  publicadas una a una en su editor — **decisión de Isaac, no se ha tocado ninguna**.
- ✅ **O-07 · Todas las categorías.** El catálogo trae ahora
  `sheet_categories(category:categories(...))` en la misma consulta —sin viajes extra— y la
  tarjeta las pinta todas, con **la principal primero** y sin repetir. **13 canciones publicadas
  enseñan dos categorías** (19 contando las de borrador).
- ✅ **O-11 · Pantalla completa por canción.** Ruta nueva `catalog/[id]/present/page.tsx` que
  reutiliza `PresentationView` con **una sola canción**, y botón **«Pantalla completa»** junto a
  Vista/Edición (`SongDetailEditor.tsx`), **para los tres roles**, solo si la canción tiene
  acordes. Se presenta en su tonalidad original; el músico la mueve con los ± de siempre.

**Efecto secundario bueno:** quitar la miniatura dejó de cargar el visor de acordes en el
catálogo — **de 108 kB a 97,1 kB** de JavaScript— y de traer el texto de las 69 canciones. Ese
texto era justo lo que obligaba al tope de 50: **O-05 es lo que hizo barata a O-10**.

⚠️ **Lo que NO se ha podido verificar aquí:** la pantalla en sí. `/catalog` exige sesión y no
hay usuario de prueba, así que **la tarjeta nueva y el botón no se han visto con los ojos**.
Verificado: que compila, que la ruta existe en el build, que las rutas responden, y **la
consulta contra los datos reales**. Lo visual tiene que mirarlo Isaac.

📌 **Observación para más adelante (no urgente):** el filtro por categorías sigue haciendo una
consulta aparte a `sheet_categories` y metiendo los ids en un `id.in.(...)`
(`catalog/page.tsx`). Con 94 vínculos la URL ya ronda los 3.000 caracteres; si el repertorio
crece mucho puede llegar a estorbar. Ahora que las categorías vienen en la consulta principal,
ese filtro **se podría hacer sin la consulta extra**. No se tocó para no cambiar de golpe algo
que funciona.

### 2026-08-20 · Tanda 8 — FASE A PUBLICADA · primer despliegue de Isaac

Isaac autoriza el push. **Es el primer cambio que publica él en este proyecto**, y el primero
de cualquiera desde el 12 de junio.

**Publicado:** `30aef42..76f571b` en `main`, dos commits:
- `1bdf61e` **r31** — la app (O-02, O-04, O-15, P-14). Sigue la numeración `rXX` del primo.
- `76f571b` — notas, exportador y CI.

**Verificado en producción** (§3 y §7): Vercel `success`, despliegue **~70 segundos** después del
push · `/login` 200 · el culto público renderiza **idéntico a local**, sin errores ·
`/manifest.json` pasó de **307 a 200** · los tres iconos se sirven.

**De propina, dos mejoras de §12.4 que ya no hacen falta pedir:**
- ✅ **CI de GitHub Actions**, verde a la primera en **1 min 10 s**. A partir de ahora, si
  alguien rompe el build, sale una ✗ en el commit — **y eso se ve sin entrar a Vercel**, que es
  justo lo que Isaac no puede hacer.
- ✅ **`tsconfig.tsbuildinfo` fuera del repositorio**: era la fuente número uno de conflictos.

⚠️ **Un detalle del reparto de commits, para que nadie se despiste al leer el historial:** el
borrado de `tsconfig.tsbuildinfo` acabó **dentro del commit r31**, no en el segundo, porque el
`git rm --cached` ya estaba en el índice al hacer el primer commit. El contenido es correcto y
**no se reescribió el historial para arreglarlo** (D-02): la explicación está en el commit
siguiente y aquí.

⚠️ **Vercel: la invitación probablemente no sea posible** — ver §9.1. El plan gratuito **no
tiene funciones de equipo**; invitar cuesta **20 USD/persona al mes**. Por eso el CI pasó de
«mejora recomendable» a **la vía principal** para saber si un despliegue falló.

### 2026-08-20 · Tanda 7 — FASE A hecha (sin publicar)

Isaac da la orden de arrancar la Fase A. **Los tres puntos hechos y verificados; falta su
permiso para publicar.**

- ✅ **O-02 · La negra con puntillo.** `MusicFigures.tsx:20`: `filled = beats <= 1` → `<= 1.5`.
  Y el **mismo fallo al lado**, que Isaac no había reportado: la **corchea con puntillo**
  (`:0.75`) salía sin corchete → `hasFlag` de `<= 0.5` a `<= 0.75`.
- ✅ **O-04 · `dim` → `°`, `dim7` → `°7`.** En `formatSuffix`, junto al `maj7`→`Δ` que ya había.
  **`m7b5` se deja tal cual**, como pidió. Cambia solo cómo se ve: el texto guardado sigue
  diciendo `dim`, así que **ninguna canción existente se toca**.
  → Además la **botonera ahora enseña el mismo símbolo** que la cuadrícula, reusando
  `formatSuffix` (ahora exportada) en vez de copiar la regla — para que no se separen (P-09).
- ✅ **O-15 · El logo.** `src/app/favicon.ico` (el `.ico` sin fondo, D-12) y
  `public/icon-192.png` + `icon-512.png` reescalados desde el PNG transparente. `manifest.json`
  actualizado. **`public/icon.svg` (la corchea genérica) queda sin uso** — se deja por ahora;
  decisión menor pendiente de Isaac.
- 🔧 **P-14 encontrado y arreglado de paso:** `/manifest.json` devolvía **307 a `/login`**
  porque el middleware lo interceptaba. Sin manifiesto, **la app instalada en el móvil se queda
  sin icono y sin nombre** — o sea, O-15 habría quedado a medias sin que se notara en el PC.

**Verificado** (§7): compila limpio · lógica probada contra el código real, 16 casos, todos
correctos · la página pública del culto renderiza sin errores · los cuatro archivos de icono se
sirven bien. ⚠️ **Lo que NO se pudo probar visualmente:** una negra con puntillo de verdad, porque
las dos canciones que la usan (`Es Por Fe`, `Tu Bondad`) **no están en el único culto público** y
el resto necesita sesión. Queda comprobado por lógica; verlo con los ojos es lo primero que hay
que hacer al publicar.

**PENDIENTE: el permiso de Isaac para el commit y el push.**

### 2026-08-20 · Tanda 6 — Isaac ya tiene cuenta propia de Supabase

- ✅ **Cuenta de Supabase creada**, vinculada a su GitHub, con organización propia **«Quaker»**
  (Personal, Free). Cierra el riesgo de L-89.
- ✅ **No creó proyecto dentro, a propósito.** Para Partituras no sirve de nada —lo que hace
  falta es la invitación del primo a «Luixmc's Org»— y un proyecto sin usar se pausa solo.
- ⚠️ Al crear el proyecto se vio la casilla **«Automatically expose new tables»**, marcada por
  defecto: **es el origen del tipo de fallo P-02**. Anotado en `NUEVO-PROYECTO.md` para que
  GestionDineroTrabajo no nazca con él.

**Estado de la Fase 0:** solo quedan cosas que **dependen del primo** (invitación a Vercel,
invitación a la organización, clave `service_role`). **Nada de eso bloquea la Fase A.**

### 2026-08-20 · Tanda 5 — FASE 0: las canciones ya están a salvo

Isaac avisa de que **no tiene cuenta de Supabase**, así que no puede entrar al panel a sacar la
copia. Se resuelve por otra vía y **se cumple lo más urgente del proyecto**.

**Hecho:**

- ✅ **RESPALDO COMPLETO DE LAS 75 CANCIONES** (§12.1), sin necesitar cuenta ni clave maestra:
  se bajaron con la **clave pública**, la misma que usa la web. **28.203 caracteres de acordes**
  a salvo, en JSON y en un ZIP de 57 KB.
- ✅ **Rescatadas las 6 canciones en BORRADOR** que la clave pública no ve, por consulta directa,
  y **verificadas una a una con MD5 contra la base**: las seis idénticas.
- ✅ **Montado `npm run export`** (`scripts/export-datos.mjs`), que usa la `service_role` si
  está y avisa por pantalla de lo que se deja si no está.
- 🔧 **Corregido un fallo del propio exportador nada más aparecer:** escribía en una carpeta con
  el nombre del día, así que al ejecutarlo dos veces **pisó la copia buena**. Ahora, si ya hay
  una copia de hoy, añade la hora. Un respaldo no puede destruir lo que viene a proteger (L-94).
- ✅ **Cifras de §7 corregidas a recuento real.** Las estimaciones de Postgres eran malas: decían
  «1 categoría» cuando hay **14**, y «~75 canciones» que resultaron ser exactamente 75, pero por
  casualidad.
- ✅ **Confirmado que la cuenta de Supabase es la del primo** — lo dijo Isaac: no tiene cuenta.
- ⚠️ **Anotada una atadura incómoda:** el exportador funciona hoy **porque existe el fallo
  P-02**. Cuando se cierre ese agujero, hará falta la `service_role` para respaldar.

**Qué quedó pendiente:** de la Fase 0, la clave `service_role`, la cuenta propia de Isaac y el
acceso a Vercel. **Lo crítico ya no bloquea: se puede empezar la Fase A cuando él diga.**

### 2026-08-20 · Tanda 4 — Se cierran las dudas, se aprueban las fases, llega el logo

**Hecho, sin tocar una línea de código de la app:**

- ✅ **Fases APROBADAS**, con una condición de Isaac: **primero la Fase 0** (los pendientes de
  §9.1) *«para que después no haya problemas»*.
- ⚠️ **D-09 quedó SUPERADA por D-09b**, y es el cambio más importante de la tanda. Isaac aclaró
  que el tamaño de presentación lo quiere **por músico**, no compartido. Con eso **O-06 deja de
  necesitar migración**, sale de la fase E y baja a la C. De paso evita un botón que a músicos y
  lectores no les habría funcionado (P-01, L-87).
- ✅ **Corregido el contexto del primo** en §1: **Isaac es quien mantiene la página ahora**; el
  primo le dio el permiso y no va a hacer correcciones. Las reglas de git no cambian.
- ✅ **Logo recibido y elegido (D-12)**: el `.ico` sin fondo para la pestaña —trae 16/32/48
  generados a medida— y el `.png` de 500×500 transparente para la app del móvil. Descartados el
  `.jpeg` (con pérdida y esquinas negras) y el `.ico` de fondo negro.
- ✅ **D-11**: la exportación será en **JSON**. Isaac aclaró que el JSON de sus otros proyectos
  era heredado, no una preferencia, y delegó el formato.
- ✅ **O-11 ubicado**: junto a «Vista / Edición» dentro de cada canción, para los tres roles.
- ✅ **O-10 confirmada**: el catálogo las muestra todas; «una canción por página» era del PDF.
- 🔧 **Corregido un error propio en `LECCIONES.md`** (le volvió a pasar en la tanda 13, ver
  L-102): las lecciones nuevas se habían numerado L-62…L-68 y **esos números ya estaban
  usados**. Renumeradas a **L-86…L-92**, con las
  referencias arregladas en `PROYECTOS.md`, `NUEVO-PROYECTO.md` y este archivo. De paso se
  detectaron **18 duplicados preexistentes** (L-46…L-61, L-78, L-79) que **no** se han tocado:
  son de otros proyectos y renumerarlos afectaría referencias en cuatro sitios. Decisión de
  Isaac.

**Lo que Isaac dictó:** la aclaración de D-09b, el contexto del primo, la ubicación de O-11,
la confirmación de O-10, la delegación de D-11 y D-12, y la aprobación de las fases con la
Fase 0 por delante.

**Qué quedó pendiente:** la Fase 0 entera (§9.1) antes de tocar código.

### 2026-08-20 · Tanda 3 — Isaac responde las preguntas y añade 5 órdenes

Isaac contesta las 8 preguntas abiertas, **añade 5 órdenes nuevas (O-11…O-15)** y pide saber
qué le falta hacer a él y con qué textos.

**Hecho, sin tocar una línea de código de la app:**

- **§9.2 reescrita** con las respuestas incorporadas orden por orden, y las 5 nuevas.
- **Tres decisiones cerradas: D-08** (el staccato se escribe `!`, descartado el `.` porque
  rompería las canciones existentes), **D-09** (el tamaño de presentación va en la base de
  datos, por canción) y **D-10** (el PDF por impresión del navegador).
- **Comprobado que O-15 está bloqueado por falta del archivo del logo:** `/favicon.ico` da
  **404** en producción y no existe `src/app/icon.*`; el único icono es una **corchea genérica**
  sobre fondo azul, que además solo usa la PWA.
- **Comprobado que O-14 no existe hoy**: `admin/actions.ts` no tiene ninguna acción para
  cambiar el nombre. Y confirmado que **cambiar el nombre NO cierra la sesión de nadie** —el
  nombre vive en `profiles`, la sesión en `auth.users` y la cookie—, que era lo que a Isaac le
  preocupaba.
- **Registrada una contradicción** entre «se pagina, una canción por página» y «que aparezcan
  todas», con la interpretación aplicada y marcada para confirmar (O-10).
- **Detectado que O-06 subió de tamaño**: al pedirlo «para todos», deja de ser cosa del
  navegador y pasa a necesitar migración. Se agrupa con O-09 en la misma fase y el mismo aviso.
- **§9.2-bis: fases A–F actualizadas** con las cinco órdenes nuevas.

**Lo que Isaac dictó:** las respuestas R1–R8 y las órdenes O-11 a O-15. **Nada aprobado para
programar todavía.**

**Qué quedó pendiente:** todo §9, y en cabeza el logo (§9.1) y la aprobación de las fases.

### 2026-08-19 · Tanda 2 — Isaac dicta el encargo; se guarda sin programar nada

Isaac entrega **la lista de órdenes que le había dado a su primo** (12 puntos, 2 repetidos →
**10 distintos**) para dejarla guardada y continuar en otro momento, y pide además la lista de
lo que hace falta para publicar y hacer cambios sin problemas.

**Hecho, sin tocar una línea de código de la app:**

- **§9.2 nueva: el encargo completo (O-01…O-10)**, cada punto contrastado contra el código
  real, con archivo y línea. **Dos causas encontradas de una vez:** O-02 es `filled = beats <= 1`
  en `MusicFigures.tsx:20` (la negra con puntillo es 1.5, se queda hueca y parece blanca) y
  O-10 es el `.limit(50)` de `catalog/page.tsx:45`.
- **Ocho preguntas abiertas (❓) marcadas** en O-01, O-03, O-04, O-05, O-06, O-08 y O-10. Sin
  respuesta no se empieza: habría que inventarse una regla.
- **§9.2-bis: borrador de fases A–F**, sin aprobar.
- **§12 nueva: protocolo para publicar**, con lo más urgente de todo — **nadie tiene copia de
  las 75 canciones** (§12.1).
- **Confirmado que `sheet_categories` SÍ existe** en la base con datos: eso cierra media
  duda de T-01 y hace viable O-07.

**Lo que Isaac dictó:** las 10 órdenes. **Nada aprobado para programar todavía.**

**Qué quedó pendiente:** todo §9. Nada de código.

### 2026-08-19 · Tanda 1 — Retomar el proyecto, entender y responder lo de Vercel

Isaac retoma el proyecto, parado desde el **13 de junio de 2026**. Encargo: copia de
seguridad, entender el proyecto entero, y resolver si él puede publicar sin depender de su
primo. Orden explícita de **no tocar ni una línea de código** hasta su visto bueno.

**Hecho:**

- Copia de seguridad (bundle + ZIP con fecha, fuera de la carpeta de trabajo) → §9.3.
- Leídos el repositorio entero, las 14 migraciones y el README.
- **Resuelta la duda de Vercel con evidencia**: el despliegue automático **sí** está activo
  (30 despliegues, uno por commit, ~40 s). Isaac **puede publicar** con un push a `main`; lo
  que no puede es entrar al panel, que está en la cuenta del primo → D-06. Y se encontró la
  causa probable de lo que dijo el primo: **el service worker** (T-02).
- Descubierto que **`partituras.vercel.app` no es esta app** (T-03); la buena es `-blush`.
- Descubierto que **las migraciones del repo y las de la BD no coinciden** (T-01).
- Documentados 12 problemas (P-01…P-12), sin arreglar ninguno.
- Creada la rama `isaac/arranque` (D-07) y el `.env.local` con URL y clave anon.
- **El proyecto queda levantado en el equipo de Isaac** y verificado: `npm install` (481
  paquetes, 526 MB), `npm run build` limpio y `npm run dev` sirviendo bien el login y las
  redirecciones. Falta solo la clave `service_role` (§9.1).
- Documentado P-13 tras revisar las 15 vulnerabilidades de `npm audit`.
- **Carpeta compartida: se tocaron los CUATRO archivos**, más el `CLAUDE.md` global.
  `LECCIONES.md` → L-62 a L-65 y sección 7 nueva («Publicar en la web»). `PROYECTOS.md` →
  ficha del proyecto y regla 2 nueva. `CONVENCIONES.md` → en código ajeno manda la convención
  que ya está. `NUEVO-PROYECTO.md` → dos preguntas nuevas («¿de quién es la cuenta?», «¿hay
  alguien más en el repositorio?») y cómo se traduce la regla de verificación en una web.
- **Aclarada la cuenta de Supabase, y no era la que Isaac creía** (§9.1).

**Lo que Isaac dictó en esta tanda:** D-01 a D-07. Confirmó que la interpretación del
proyecto era correcta, y **descartó** el asunto de la base de datos compartida con el proyecto
de cartas (D-05).

**Qué quedó pendiente:** todo §9. Nada de código.
