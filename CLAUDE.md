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
> **REGLA DEL «CONTINÚA» — cuando Isaac dice «continúa con el trabajo», ES OTRO DÍA.**
> Acordado el 2026-09-02 al cerrar la jornada: *«mañana continuamos; cuando te diga que continúes
> con el trabajo es porque ya es mañana»*. → **No se hereda la fecha de la conversación anterior:
> se pregunta el reloj** (regla de abajo) y se sigue por **lo que esté en §9 como pendiente**, no
> por lo último que se dijo. Lo que quedó a medias tiene que poder retomarse leyendo este archivo.
>
> **REGLA DE LA FECHA — se pregunta el reloj, NO se hereda la del principio de la conversación.**
> Isaac lo corrigio el 2026-08-22: *«los cambios que se hicieron desde hoy es para el 22 de agosto,
> estoy viendo los archivos y marcan 21 de agosto, o sea el dia de ayer»*. Tenia razon: una sesion
> larga cruza la medianoche y todo lo de la madrugada y la mañana siguiente se seguia fechando con
> el dia en que arranco. → **Antes de escribir una fecha, `date`.** Y si hay que reconstruir lo ya
> escrito, **la verdad esta en `git log --date=format:'%Y-%m-%d %H:%M'`**: los commits llevan la
> hora real. Para el comunicado manda **la fecha en que el musico lo puede ver**, no la de cuando
> se tecleo — la Fase L se escribio la noche del 21 y se publico el 22, asi que va en el 22.
> ⚠️ Ojo tambien con `npm run export`: **fecha en UTC**, asi que a partir de las 19:00 en Colombia
> la carpeta lleva ya el dia siguiente.
>
> **REGLA DEL README — el `README.md` se mantiene al dia, como hacia el primo.**
> Isaac, 2026-08-28: *«los cambios que se hacen, agregalos al readme, para tener todo ahi como
> venia haciendo mi primo»*. Y tenia razon en lo de «como venia haciendo»: **el primo lo actualizo
> hasta `r10` y ahi se quedo** —comprobado con `git log --follow README.md`—, asi que llevaba
> **veinte versiones** describiendo una app que ya no existe. Era P-07.
> → **Son TRES documentos y cada uno tiene su lector:** `README.md` **para quien abre el
> repositorio** (que es publico) y quiere saber que es esto y como se levanta · `CAMBIOS.md` y
> `/novedades` **para el musico** · `CLAUDE.md` **para quien programa**. Un cambio que altere lo
> que la app **hace** o **como se usa** toca el README; uno que solo cambie por dentro, no.
>
> **REGLA DEL COMUNICADO — cada cambio que se PUBLICA se anota en `CAMBIOS.md` Y en
> `/novedades`**, en la sección de su fecha y **en lenguaje de usuario**: qué nota quien abre la
> página, no qué archivo se tocó.
> 🔴 **Y son DOS sitios, no uno.** Se incumplió el 2026-08-22 con lo de la trompeta: se publicó,
> se escribió aquí —D-28, D-29, §9.2-nonies— y **se olvidó el comunicado**. Lo vio Isaac:
> *«lo subiste pero no lo documentaste en los archivos y en la página de novedades»*.
> **Documentar en el `CLAUDE.md` no es documentar para el músico**: este archivo lo lee quien
> programa, y el que toca no entra aquí. Si el cambio se nota usando la página —y lo de la
> trompeta se nota mucho—, **no está terminado hasta que está en los dos.** Isaac lo pidió el 2026-08-20 para poder avisar a la gente de la iglesia de lo que va
> cambiando. Es un documento **para leer**, no un historial técnico — ese es §13 de aquí.
>
> **REGLA DE LA CARPETA COMPARTIDA — se repasa CADA tanda y se dice cuáles de los cuatro
> archivos se tocaron**, o que no había nada que tocar. Callarse no vale.
> `C:\Users\TECSISTEMAS\Documents\_CLAUDE-COMPARTIDO\` → `LECCIONES.md`, `PROYECTOS.md`,
> `CONVENCIONES.md`, `NUEVO-PROYECTO.md`.

---

## 1 · Guía rápida para la IA (léeme primero)

**Qué es.** Partituras con acordes del **Centro Cristiano La Casa de mi Padre**. No es
notación de pentagrama: es un **editor de acordes en cuadrícula**, donde cada celda es un
acorde con su figura musical.

**Para quién.** Los músicos de la iglesia. El caso de uso real es **tocar en el culto leyendo
desde una tablet**.

**La pregunta que responde.** *«¿Qué tocamos este domingo, en qué tono, y cómo lo leo mientras
toco?»*

**Arquitectura en una línea.** Next.js 16 (App Router) + React 18 + TypeScript + Tailwind
sobre Supabase (Postgres + Auth + RLS), desplegado en Vercel con publicación automática en
cada push a `main`.

### ⚠️ Lo que hay que comprobar ANTES de tocar código

1. **El repositorio es de su primo (`Luixmc`), pero QUIEN MANTIENE LA PÁGINA AHORA ES ISAAC.**
   Isaac le pidió permiso para encargarse de las actualizaciones y su primo se lo dio: **el
   primo ya no va a hacer correcciones** (aclarado por Isaac el 2026-08-20). Aun así el dueño
   del repositorio, del hosting y de la base sigue siendo el primo → **Nunca `push --force`,
   nunca reescribir historial, nunca borrar ramas. Nunca `commit` ni `push` sin pedírselo a
   Isaac** (ver §11). Que Isaac sea el mantenedor **no** convierte el permiso en permanente.
   🟢 **UNA EXCEPCIÓN, DADA POR ÉL (2026-09-10, noche): LO DE LA MELODÍA se sube sin pedir permiso.**
   *«sube, no me pidas permiso para esto de la melodia»*. Vale para los cambios de la **sección de
   melodía** —el editor (`EditorMelodia`, `MelodiaPanel`), el pentagrama, el reproductor, el sonido,
   `lib/melodia.ts`, `lib/reproduccion.ts`, `lib/reproductor.ts`, `lib/sonido.ts`— y su
   comunicado/documentación. **NO** vale para nada más: ni migraciones ni base de datos, ni otras
   pantallas, ni borrar o reescribir historial. Se sube **después** de las comprobaciones de siempre
   (pruebas, lint, build, navegador) y se le **dice** qué se subió.
   ⚠️ **Si en el árbol hay a la vez algo que SÍ necesita permiso, lo de la melodía no se puede subir
   suelto**: las cifras que vigila `npm run docs` en el CI (archivos, líneas, pruebas) son las del
   árbol entero, y un commit parcial las deja mintiendo. → **Publicar lo de la melodía antes de
   empezar otra cosa**, o pedir el OK de todo junto. Pasó el 2026-09-10 con O-81 y O-74.
2. **Cada push a `main` PUBLICA en producción en menos de un minuto**, sin que nadie apriete
   nada, y sin que Isaac pueda ver los logs (§6). Un push a `main` es un despliegue.
3. **La base de datos de producción tiene datos reales en uso** (85 canciones, 3 cultos — contados el 2026-09-10).
   No ejecutar nada contra ella sin decírselo a Isaac (D-04).
   👥 **Dos cuentas de Claude, desde el 2026-09-11** (Isaac): pagó **Claude Pro en la SUYA** —la
   vinculada a su GitHub y a su Supabase— y cuando se le acaba el límite sigue con **la de su
   hermano**. Una conversación puede venir de cualquiera de las dos; lo que hace falta para trabajar
   (la llave local de Supabase, git, `.env.local`) está en este PC y no cambia.
   🔑 **Cómo se entra, desde el 2026-09-10:** conector local `supabase-partituras`, **solo lectura**,
   con la llave personal de Isaac en `SUPABASE_ACCESS_TOKEN`. **NO** el conector de claude.ai: esa
   cuenta es **de su hermano**. Estado y primeros pasos en §9.0 (fila 0-bis) y §12.2-ter.
4. **Las migraciones del repositorio NO son la fuente de la verdad de la base de datos.**
   No coinciden (T-01). Antes de razonar sobre permisos, comprobar las políticas reales.
5. ✅ **SÍ hay red de seguridad, y hay que usarla.** **240 pruebas** (`npm test`, sin dependencias
   nuevas) y **CI en cada push** que ejecuta pruebas → lint → build. **18.022 líneas** de TypeScript
   en **94 archivos**. *(Contado el 2026-09-10, y lo vigila `npm run docs`. Estas tres cifras cambian cada tanda: **antes de
   citarlas, contarlas**.)*
   ⚠️ *Esto decía lo contrario —«no hay ni una prueba, ni CI»— hasta el 2026-09-04, y llevaba
   equivocado desde el 22 de agosto. Un chat nuevo lo leía aquí, en la sección que se llama «léeme
   primero», y actuaba como si no hubiera nada que le cubriera las espaldas.*

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
npm run docs         # ¿los documentos dicen la verdad sobre el proyecto de HOY?
```

⚠️ **`npm run dev` y `npm run build` NO se ejecutan a la vez**: comparten la carpeta `.next` y
el build deja al servidor de desarrollo roto (T-04). **Para comprobar que algo compila con el
servidor encendido: `npm run verificar`**, que compila aparte.

⚠️ **`next-env.d.ts` va y viene según cuál de los dos compiló de último**: `npm run build` lo deja
apuntando a `.next/types/…` y `npm run verificar` a `.next-verificar/types/…`. **Lo genera Next, no
se edita a mano y no debe entrar en un commit** — si `git status` lo saca, `git checkout --
next-env.d.ts`. En el repositorio está la versión de `verificar`. *(Visto el 2026-09-04 al cerrar
O-63: salió como archivo modificado sin que nadie lo tocara.)*

**`npm test` ejecuta 240 pruebas** y no necesita nada instalado aparte (usa el ejecutor de Node).
Compila `src/lib` con el TypeScript del proyecto y prueba **el archivo real**, no una copia.
⚠️ Aquí ponía *«no existe ninguna prueba»* hasta el 2026-09-04: P-11 se cerró el 22 de agosto y esta
línea se quedó atrás.

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

🔑 **Desde el 2026-08-28 la sesión se saca sola: `node pruebas/sesion.mjs`.**
Isaac dio la contraseña y propuso él mismo dónde guardarla: *«como no vas a tener la contraseña en
los archivos que están públicos, ponlo en un archivo aparte, ¿no?»*. → **Va en `.env.local`**
(`PRUEBA_EMAIL` / `PRUEBA_PASSWORD`), que está en `.gitignore` **desde el primer día** —comprobado
con `git check-ignore` antes de escribirla— y es donde ya viven las demás claves. La cookie se
guarda en `.sesion`, también ignorado.
→ **Por qué importa que sea un script y no un apunte:** la cookie **muere** cuando caduca o cuando
alguien cierra la sesión — y eso acaba de pasar al probar P-01, que dejó sin poder comprobar
ninguna pantalla protegida. Ahora se regenera en un segundo.
→ ⚠️ **La contraseña NO se escribe en este archivo ni en ningún otro del repositorio**, que es
público. Y con esa cuenta **solo se mira** (D-14).

👥 **Desde el 2026-09-10 hay DOS cuentas de prueba** (Isaac: *«para que tengas dos una admin, y otra
musico»*): `pruebaclaude@gmail.com` —**administradora**: con ella entran `npm run export` y
`pruebas/pantallas.mjs`— y `pruebaclaude2@gmail.com` —**músico**: para probar lo que ve y hace un
músico—. Las dos en `.env.local` (`PRUEBA_*` y `PRUEBA_MUSICO_*`). ⚠️ **Si la de administrador deja
de serlo, la copia sale sin los borradores** —el exportador ahora lo dice en grande— y el recorrido
no puede abrir las pantallas de administrador.

Por dentro, el script hace esto (por si algún día hay que repetirlo a mano):

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

### 2.3-bis 🔬 Cómo MEDIR lo que solo se veía mirando (2026-09-04)

Media docena de defectos están anotados aquí como *«esto no deja rastro en el HTML, solo lo puede
mirar Isaac»*: el reparto de las secciones, el arrastre, el desplegable. **Sí se pueden medir**, y
así se cazó O-66:

1. **La página se carga de verdad**, con su React y su JavaScript, en **Brave sin ventana**:
   `brave.exe --headless=new --disable-gpu --no-sandbox --window-size=A,B --virtual-time-budget=40000 --dump-dom <url>`
2. **Sin sesión**: por el **enlace público del culto** (`/s/<token>/present`), que el middleware deja
   pasar. No hace falta cookie ni contraseña.
3. **La página que mide va en `public/s/`** —así el middleware también la deja pasar— y **carga la
   presentación en un `<iframe>`**. Como es el **mismo origen**, puede leer dentro: medir cajas con
   `getBoundingClientRect()`, leer los `data-` que deja el componente, y hasta **pasar de canción**
   mandando `ArrowRight` a `marco.contentWindow`.
4. Lo medido se escribe en un `<pre>` y se recoge del `--dump-dom`.

⚠️ **Dos trampas que costaron un rato:**
- `next start` sirve `public/` **desde el build**: un archivo nuevo ahí **no se sirve hasta
  recompilar**. Da 404 y parece un problema de ruta.
- Fuera de `/s/`, `/novedades`, `/login` y `/salir`, el middleware **redirige a `/login`** (307).

📌 **Desde el 2026-09-10 hay otra forma, sin página desechable:** manejar Brave sin ventana por su
**protocolo de depuración** (`--remote-debugging-port=9333`) desde un script de Node en el
`scratchpad`, con la cookie de la cuenta de prueba: pulsa botones, hace clics de ratón reales
(`Input.dispatchMouseEvent`), apunta qué cambia en pantalla con su hora y qué pide a la red, y saca
capturas. Así se midió todo el reproductor (O-75) y O-77/O-78/O-79. Dos cosas que saber:
**`Runtime.evaluate` no devuelve elementos** (se pregunta `!!document.querySelector(…)`), y **el ancho
de teléfono sí se puede**: `Emulation.setDeviceMetricsOverride({ width: 400 })` — con
`--window-size` no baja de ~500 px.

🔴 **Y la página se BORRA al terminar.** Han existido seis desechables y **ninguna ha llegado a
producción**; esta vivió en `public/s/medir-o66.html` y se borró en el mismo cambio.

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
        catalog/                 Las ~80 canciones: búsqueda y filtro por categoría
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
        TablaturePreview.tsx ★   EL CORAZÓN (961 líneas): texto → cuadrícula de acordes
        MusicFigures.tsx         Figuras y silencios en SVG
        SongDetailEditor.tsx     Editor + vista de una canción (886 líneas): vista, edición, letra y melodía
        SongKeyVersions.tsx      Versiones de la canción en otras tonalidades
        ChordToolbar.tsx         Botonera de acordes
        BuscadorVivo.tsx         La caja que busca al escribir (O-71)
        BotonFavorito.tsx        El corazón (O-73)
        ImportControls.tsx       Importar PDF / imagen (OCR) / texto
        MelodiaPanel.tsx         La melodía por secciones: escribirla, oírla, guardarla (O-57, O-75)
        Pentagrama.tsx           Dibuja la melodía con abcjs, y colorea la nota que suena
        Reproductor.tsx          La barra ▶ ⏸ ⏹ · tempo · metrónomo · repetir (O-75 fase 2)
        NotaPrivada.tsx          «Mis notas»: la nota privada de quien mira, en la ficha (O-74)
      services/
        ServiceEditor.tsx        Armar el culto (876 líneas), arrastrando
        PresentationView.tsx ★   Modo presentación (1.016 líneas): acordes ↔ letra ↔ melodía
    lib/
      music.ts ★                 Transposición de acordes
      texto.ts                   Comparar sin tildes: las cuatro búsquedas (O-72)
      favoritos.ts               Los favoritos de cada músico (O-73)
      figuras.ts                 Qué figura es cada duración · `duracionDe()` (O-70)
      sections.ts                Partir el contenido en secciones "[Coro]"
      chordInput.ts              Escribir acordes respetando espacios
      melodia.ts                 La melodía en ABC y QUÉ nota suena (`alturaMidi`) — con pruebas
      reproduccion.ts            Las cuentas del reproductor: cuándo suena cada nota, el metrónomo — con pruebas
      reproductor.ts             El motor: el sintetizador de abcjs y el reloj del audio (sin pruebas: es audio)
      sonido.ts                  Tocar una nota suelta y el instrumento elegido (O-75 fase 1)
      notas.ts                   Quién tiene notas privadas (admin, músico) y cómo se guardan — con pruebas
      notasBase.ts               Leer y guardar las notas en `notas_musico` (la base solo da las propias)
      songImport.ts              Extraer texto de PDF / OCR / texto plano
      supabase/{client,server}.ts  Clientes de navegador y de servidor
    types/index.ts               Tipos del dominio
  supabase/migrations/           24 migraciones ⚠️ con otros nombres en la BD (T-01)
                                 ✅ TODAS aplicadas (de la 020 a la 024, el 2026-09-10)
  public/sw.js                   Service worker ⚠️ causa de T-02
  pruebas/                       240 pruebas + el recorrido de las 26 pantallas
  docs/                          Lo que salió de este archivo al recortarlo (2026-09-11): historial,
                                 encargos cerrados, trampas, ideas y accesos. Se lee cuando se cita
```

### El formato de acordes (la sintaxis REAL, no la del README)

📌 **El `README.md` dice HOY lo mismo que esta tabla, y se comprueba cada vez que cambia la
sintaxis.** *Aquí ponía «el README está desactualizado y se equivoca en esto» hasta el 2026-09-07, y
llevaba equivocado desde el 2026-08-28, que es cuando se cerró P-07.* Lo que vale:

| Elemento | Sintaxis | Dónde se implementa |
|---|---|---|
| Acorde | `C`, `Dm7`, `Gsus4`, `C/G` | `TablaturePreview.tsx:192` |
| Disminuido | se escribe **`dim`** / **`dim7`** · se dibuja **`°`** / **`°7`** (D-08b) | `ChordToolbar.tsx` · `formatSuffix` |
| Duración | `:0.25` `:0.5` `:1` `:1.5` `:2` `:3` `:4` · **y con puntillos: `:2.` `:2..`** (O-70) | `lib/figuras.ts` → `duracionDe()` |
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
| Cambio de compás | `6/8` inline | `TablaturePreview.tsx:155` |
| ~~Salto de fila~~ | 🗑️ **`;` ELIMINADO el 2026-09-04 (O-62).** Se acepta y **se descarta en silencio**, por los borradores que no se pueden leer | — |

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
| Migraciones registradas en la BD | **18**, y **no coinciden** con las del repo (T-01) · *el 2026-09-10: **23**, leídas con el conector* |
| **Canciones (CONTADAS en la base, 2026-09-10)** | **85 = 76 publicadas + 9 sin publicar** · 14 categorías · 3 cultos · 7 usuarios. *El 2026-09-04 eran 80 = 72 + 8.* |
| *Canciones (2026-09-04)* | *80 = 72 publicadas + 8 en borrador.* ⚠️ **Isaac sigue montando canciones**: eran 69+6 el 20-ago, 67+8 el 21-ago y 72+8 hoy. → **Cualquier respaldo tiene días contados, y cualquier cifra escrita aquí también.** Antes de citarla, contarla |
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

> 📦 **Este archivo se RECORTÓ el 2026-09-11** (de 566 KB y 8.413 líneas a lo que dice §13),
> siguiendo `_CLAUDE-COMPARTIDO\PROMPT-RECORTAR-CLAUDE-MD.md` (L-256). **Nada se reescribió ni se
> borró: se MOVIÓ**, con un script que comprobó que cada línea sale exactamente una vez. Las
> referencias viejas siguen valiendo, solo que ahora apuntan a otro archivo:
>
> | Si un texto cita… | Está en |
> |---|---|
> | **T-01…T-18** (trampas, antes §8) | `docs/TRAMPAS.md` — aquí queda el índice |
> | **§9.0 viejo, §9.1, §9.2 y todas sus variantes, §9.3, §9.4** (el encargo, sus fases, las O-xx y P-xx) | `docs/ENCARGOS_CERRADOS.md` |
> | **§10** (ideas futuras) | `docs/IDEAS.md` |
> | **§12.1, §12.2, §12.2-ter, §12.2-bis, §12.4, §12.5** (accesos, la mudanza, riesgos) | `docs/ACCESOS.md` |
> | **§13** (historial, tanda por tanda) | `docs/HISTORIAL.md` |
> | Copia íntegra de antes del recorte | `git show b984c91:CLAUDE.md` (y fuera del repositorio, `Partituras\CLAUDE-antes-del-recorte-2026-09-11.md`) |

## 8 · Trampas encontradas

> Las trampas enteras (síntoma, causa y cómo se resuelve) están en **`docs/TRAMPAS.md`**. Aquí solo
> el índice, para saber que existen. **Antes de tocar algo que suene a una de estas, leerla allí.**

- **T-01** · Las migraciones del repositorio no son la base de datos.
- **T-02** · El service worker hace que un despliegue correcto parezca que no se aplicó.
- **T-09** · Mover una dirección sin dejar la vieja redirigiendo rompe lo que la gente tiene abierto.
- **T-10** · `100vh` al imprimir mide la PANTALLA en el móvil, no la hoja.
- **T-08** · Un servidor de desarrollo viejo se queda con el puerto y el nuevo se va a otro, callado.
- **T-07** · Borrar una columna que el código PUBLICADO todavía usa rompe la página al instante.
- **T-06** · Una canción en tono menor mostraba mal su tonalidad en la presentación.
- **T-18** · `SUPABASE_ACCESS_TOKEN` significa DOS cosas, y el 2026-09-10 chocaron.
- **T-17** · El middleware se ejecuta en CADA navegacion: ir a la base desde ahi tumba la pagina.
- **T-16** · «Compila» comprobado con un `grep` MIENTE: el build falla despues de decir «Compiled successfully».
- **T-14** · Al transponer, los acordes se escribían con la ortografía del tono DE PARTIDA.
- **T-11** · El mismo sitio, el mismo día: una canción en `Bb` mostraba `A#`.
- **T-05** · «supabaseKey is required» en el panel de administración, solo en el equipo de casa.
- **T-04** · `npm run build` con el servidor de desarrollo abierto rompe el servidor.
- **T-03** · `partituras.vercel.app` no es esta app.
- **T-12, T-13 y T-15** se escribieron dentro del encargo, no aquí: están en `docs/ENCARGOS_CERRADOS.md`
  (busca «T-12 ·», «T-13 ·» y «T-15 ·»): el `<select>` en oscuro, las notas por GRADOS, y que
  `revoke … from public` no revoca lo concedido a un rol.

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

> 🔴 **CERRAR ALGO INCLUYE SACARLO DE AQUÍ, en el mismo cambio.** La regla 0 dice que lo pendiente
> entra en §9; esta es su otra mitad, y se aprendió el 2026-09-04: el respaldo de `replaceSongs`
> estaba **hecho desde el 2026-08-28** y siguió siete días en la lista, hasta que Isaac preguntó
> *«¿qué hay con lo del respaldo?»*. **Un pendiente ya hecho no es un despiste inofensivo**: hace
> perder el tiempo a quien lee la lista y le quita crédito a los que sí están vivos.

### 9.0 🔜 POR DÓNDE SE SIGUE (reescrito el 2026-09-11, al recortar)

**Lo primero que hay que leer al retomar.** Isaac: *«mañana continuamos; cuando te diga que
continúes con el trabajo es porque ya es mañana»*. → **Se pregunta el reloj** y se sigue por esta
tabla, no por lo último que se dijo en el chat anterior.

📌 **Aquí solo va lo ABIERTO.** Lo que se cierra se **mueve** a `docs/ENCARGOS_CERRADOS.md` en el
mismo cambio (arriba del todo), y aquí se borra su fila. Nada tachado, nada «✅ hecho» en esta tabla.

#### Lo que falta

| # | Qué | De quién / dónde está el detalle |
|---|---|---|
| 1 | **Abrir las LETRAS (37 de 85 escritas) y la MELODÍA (1) a todos los roles** | **De Isaac**, cuando las tenga escritas: es cambiar `ROLES_LETRAS` (`lib/letras.ts`) y `ROLES_MELODIA` (`lib/melodia.ts`), una línea cada uno (D-22) |
| 2 | **O-54 ②, el ALTO del silencio**: *«sobresale para abajo»* y sobra hueco arriba y abajo | **Sin mirar.** `RestFigure` y el hueco de la celda. Detalle en `docs/ENCARGOS_CERRADOS.md` (busca «El ② (el alto)») |
| 3 | **P.3 · El PDF del culto en el tono del instrumento** (trompeta) | **A decidir por Isaac.** P.1 y P.2 hechas. Detalle en `docs/ENCARGOS_CERRADOS.md` (busca «**P.3**») |
| 4 | **El PDF del culto con la melodía** | Todavía no: Isaac no lo ha pedido. Se anota para no olvidarlo |
| 5 | **`pruebaclaude` es ADMINISTRADORA con una contraseña sencilla** | **Isaac lo asume.** Desactivarla (o pasarla a músico) el día que no haga falta. La contraseña vive **solo** en `.env.local` |
| 6 | **¿Hay que pedir permiso para subir lo que NO es melodía?** Los documentos se contradicen: §11 dice que desde el 2026-09-05 se sube sin preguntar; `PROYECTOS.md` y la memoria dicen «lo demás, con permiso cada vez» | **Preguntárselo a Isaac** y dejar escrita solo la que valga. Mientras tanto, **se pregunta** (lo más prudente). El recorte lo subió con su «ok» del 2026-09-11 |
| 7 | **Que Isaac vea en uso lo último publicado** (r74–r76: notas privadas, tempo guardado, P-02) | Dijo *«están bien todo»* tras r74; si algo aparece usándolo, vuelve aquí |

👥 **Dos cuentas de Claude** desde el 2026-09-11 (§1): cuando se acaba el límite de una, sigue con la
otra. **Por eso esta tabla tiene que estar siempre al día**: la otra cuenta no ve este chat.

#### Estado del árbol — **2026-09-10 (noche), todo PUBLICADO en r76**

> 🔴 **Esta tabla se reescribe entera al cerrar cada tanda, y se CUENTA, no se recuerda.** El
> 2026-09-07 tenía **la fila «Pruebas» DUPLICADA** —197 en una y 192 en otra— y las dos estaban mal.
> Lo cazó Isaac pidiendo revisar todos los archivos.

| | |
|---|---|
| Último commit publicado | el que sigue a **r76**: el exportador que avisa si la copia sale incompleta, y la documentación de las dos cuentas de prueba (sin cambios en la página). `git log -1` da el hash. **Árbol limpio** |
| Última versión | **r76** — sin cuenta ya no se leen las canciones (P-02, paso 2: migración 024). Antes, **r75**: el enlace público del culto por su función (P-02, paso 1); **r74**: las notas privadas (O-74) y el tempo guardado con la canción (O-81); **r73**: las pestañas de la canción ya no se salen en el teléfono (O-80); **r72**: la barra del editor de melodía, más ancha que alta (O-79); **r71**: las 15 duraciones y los botones grandes (O-78); **r70**: la armadura en el pentagrama del editor (O-77); **r69**: cuenta de entrada y volumen del reproductor (O-75 fase 3); **r68**: el reproductor de la melodía (O-75 fase 2); **r67**: el logo en el login (O-76); **r66**: migraciones aplicadas, la melodía se guarda, exportador arreglado (T-18) |
| Pruebas | **240** · lint **0 errores, 60 avisos** · build **0** |
| Tamaño | **18.022 líneas** de TypeScript en **94 archivos** |
| CI | verde · **26 de 26 pantallas** comprobadas en producción |
| Migraciones | **24**, **todas aplicadas** (de la 020 a la 024, el 2026-09-10) |
| Páginas desechables | **ninguna viva.** Han existido **seis** y **ninguna ha llegado nunca a producción** |
| `abcjs` | **dependencia de verdad** desde r48, cargada de forma diferida y **fuera del paquete compartido** (medido en `build-manifest.json`) |


➡️ **Lo que había aquí antes** —la tabla vieja de «lo que hay que hacer», «Isaac lo miró todo», «lo
publicado hoy» (r48–r58), y **§9.1 a §9.4 enteras** (el encargo del 2026-08-19 con todas sus fases,
las O-xx y P-xx)— está **tal cual** en **`docs/ENCARGOS_CERRADOS.md`**.

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
- **El push se hace así**, desde `isaac/arranque`, y publica en producción:
  ```bash
  git push origin isaac/arranque:main
  ```
- 🔴 **DESDE EL 2026-09-05, ISAAC NO QUIERE QUE SE LE PIDA PERMISO PARA CADA PUSH.**
  Sus palabras: *«apenas hagas estos cambios sube todo enseguida, no me pidas permiso»*.
  → **Esto SUPERA la parte de D-01 que decía «cada permiso vale para ese trabajo».** Manda esto.
  **Qué significa exactamente**, para no estirarlo:
  * **Se sube sin preguntar** el trabajo normal: código que él pidió, su documentación, el
    comunicado. **Y se le dice qué se subió**, siempre.
  * ⚠️ **Lo que NO cubre, y se sigue preguntando:** ejecutar **migraciones** o cualquier cosa que
    **escriba** en la base de producción (D-04), y **nada** de `--force` ni de reescribir historial
    (D-02) — eso no se hace ni con permiso.
  * **Sigue valiendo la regla 2:** se sube **comprobado** (pruebas, lint, build, las 26 pantallas y,
    si es un dibujo, mirándolo). «Enseguida» es sin preguntar, no sin comprobar.
  * **Es revocable:** el día que diga lo contrario, vuelve D-01 tal cual.
  📌 *Lo de abajo —«cada push se le pide»— queda como historia de cómo se trabajó hasta hoy.*
- 🔴 **Desde el 2026-09-04 el entorno de Claude tiene una regla que PERMITE ese comando**
  (`Bash(git push origin isaac/arranque:main)` en `C:\Users\TECSISTEMAS\.claude\settings.json`).
  **Eso NO sustituye el permiso de Isaac.** La regla solo evita que el entorno corte el comando;
  **D-01 sigue mandando: cada push se le pide, y cada permiso vale para ese trabajo.** Que ahora
  sea técnicamente posible empujar sin preguntar es exactamente el motivo por el que queda escrito
  aquí.
  ⚠️ **Y es una regla de comando EXACTO:** `git push origin isaac/arranque:main | tail -5` **no
  casa** y el entorno lo bloquea. Se ejecuta a secas, con el `cd` en una llamada aparte.
- No se comparte código con los otros proyectos de Isaac, solo criterio.

---

## 12 · Protocolo para publicar sin romper nada

> Pedido por Isaac el 2026-08-19: *«dame la lista completa de lo que veas necesario para que no
> se tenga problemas para publicar y hacer cambios»*. Esto es lo que hay que tener resuelto
> **antes** de empezar el encargo de §9.2.


> Movido a **`docs/ACCESOS.md`**, tal cual: **§12.1** (la copia de las canciones), **§12.2** (accesos
> que faltaban), **§12.2-ter** (lo que se le pidió al primo, y cómo llegó el acceso a la base),
> **§12.2-bis** (la mudanza), **§12.4** y **§12.5**. Aquí queda lo que se usa cada vez: **cómo se
> aplica una migración**, el **procedimiento** para publicar (12.3) y **las cifras vigiladas** (12.6).

  #### 🔧 CÓMO SE APLICA UNA MIGRACIÓN (desde el 2026-09-10)

  El conector se queda **siempre en solo lectura**. Para escribir se usa **la misma llamada que el
  `apply_migration` del conector** —leída en su código, `dist/chunk-*.js`—, directamente con la llave:
  `POST https://api.supabase.com/v1/projects/pcayahwnxbigiuhvtwhd/database/migrations` con
  `{"name": "...", "query": "<el .sql>"}` y `Authorization: Bearer $SUPABASE_ACCESS_TOKEN`. Queda
  **registrada** en `supabase_migrations.schema_migrations` con la fecha del día (así se ve con
  `list_migrations`). Isaac eligió esta vía el 2026-09-10 («si la b es para que lo hagas entonces la b»).
  **Cada vez:** OK expreso de Isaac → `npm run export` completo → guardar cómo deshacerla con las
  definiciones leídas de producción → aplicar **de una en una** la que toque permisos → comprobar en
  la base **y** con una sesión real (admin activo y sin sesión).
  ⚠️ En Windows, Node puede terminar con `Assertion failed … async.c` **después** del `HTTP 200`: es
  del propio Node al cerrarse, no de la base. Se comprueba siempre leyendo la base.

⚠️ **Y un aviso de la misma documentación, que hay que tener presente:** Supabase recomienda *no*
conectar el MCP a producción, o hacerlo en modo **solo lectura**. Partituras **es** producción. Aquí
se mantiene lo de siempre: **las migraciones y cualquier escritura en la base se le preguntan a Isaac
antes** (D-04, §11), y **antes de cada migración se saca la copia** con `npm run export`.

### 12.3 El procedimiento, cada vez

1. **Nunca trabajar sobre `main`.** Rama aparte (D-03).
2. **Compilar en local antes de publicar.** Es la única red que hay hoy: si falla aquí, habría
   fallado en Vercel — y allí no se ve. **Con el servidor de desarrollo encendido, `npm run
   verificar`**, que compila aparte y no lo rompe (T-04).
3. **Probar el flujo completo en `npm run dev`**, como lo haría un músico.
4. ~~**Pedirle permiso a Isaac** para el push (D-01). Cada permiso vale para ese trabajo.~~
   → 🔴 **SUPERADO el 2026-09-05: «no me pidas permiso».** Se sube sin preguntar y **se le dice qué
   se subió**. Las excepciones —migraciones, escribir en la base, `--force`— siguen igual. El
   detalle, en §11.
5. Publicar y **esperar un minuto largo**.
6. **Comprobar en `https://partituras-blush.vercel.app` con Ctrl+F5** (§3). Sin el Ctrl+F5 no
   se está comprobando nada: se está mirando el caché (T-02).
7. **Si algo salió mal: `git revert`**, que crea un commit nuevo que deshace. **Nunca
   `git reset` ni `--force`** sobre una rama compartida (D-02). El revert se publica solo,
   igual que el error.

## 12.6 🔢 LAS CIFRAS DE LOS DOCUMENTOS LAS VIGILA UN PROGRAMA

**`npm run docs`**, y también **en el CI de cada subida** desde el 2026-09-07.

#### Por qué existe

Isaac, el 2026-09-07, después de que se le dijera que una petición que llevaba **semanas**
haciéndole a su primo ya no hacía falta: *«con lo que me dices que había un archivo que estaba
desactualizado me preocupa, mira todos los archivos uno por uno… porque eso me preocupa»*.

Al repasarlos aparecieron **once sitios con cifras viejas**. Entre ellos:

| Dónde | Decía | Era |
|---|---|---|
| **§1, el «léeme primero»** | 192 pruebas · 15.114 líneas · 82 archivos | **207 · 15.960 · 87** |
| **§9.0, el estado del árbol** | la fila «Pruebas» **DUPLICADA**: 197 en una, 192 en otra | **las dos mal** |
| §4, la estructura | 21 migraciones, «las DOS últimas sin aplicar» | **22, las TRES** |
| §4 | *«el README está desactualizado y se equivoca en la sintaxis»* | **falso desde el 2026-08-28** |
| README | 192 pruebas (×3) · 21 migraciones · dos ideas ya descartadas | — |

🔴 **Y el fondo del asunto: esto no se arregla escribiendo mejor.** Las cifras envejecen **solas** en
cuanto alguien añade una prueba o un archivo, y nadie se acuerda de bajar a corregir seis sitios.
**Un programa sí.**

#### Qué vigila, y qué NO

* **Vigila lo que habla de HOY**: las pruebas, las líneas, los archivos y las migraciones, en los
  **trece sitios** donde el documento afirma el estado actual.
* ⚠️ **NO toca el historial.** Que la tanda 43 diga «192 pruebas» es **correcto**: allí había 192.
  Por eso cada regla busca **su frase exacta** y no todas las apariciones del número.
* **Si alguien reescribe el párrafo y la frase desaparece, también falla** — si no, la comprobación
  se quedaría vigilando el vacío sin que nadie se entere. Es lo mismo que le pasó al lint en Next 16.

📌 **Y se acusó a sí mismo el primer día**: contaba una línea de más por archivo —87 de más— porque
usaba `split("
").length` en vez de contar saltos, como hace `wc -l`. **La primera cosa que cazó
fue su propio fallo**, que es la mejor señal de que mide de verdad.

---

## 13 · Historial


> 🔴 **REGLA DESDE EL 2026-09-11 (el recorte, L-256): el historial NO vive aquí.**
> * Cada tanda nueva se escribe **ARRIBA del todo de `docs/HISTORIAL.md`** (lo más nuevo primero), y
>   aquí **solo una fila** en la tabla de abajo. Si la tabla pasa de ~10 filas, se quitan las viejas.
> * Lo que se **cierra** de §9 se **mueve** a `docs/ENCARGOS_CERRADOS.md` (arriba del todo).
> * Una trampa nueva va a `docs/TRAMPAS.md`, y su título al índice de §8.
> * **Por qué:** este archivo llegó a **566 KB y 8.413 líneas**, y se reenvía entero en cada paso de
>   cada conversación. Cuando pase de ~100 KB, se vuelve a recortar igual: moviendo, no reescribiendo.

| Fecha | Tanda |
|---|---|
| 2026-09-11 | **El recorte de este archivo: de 566 KB a 56 KB (762 líneas)** · dos cuentas de Claude (§1) |
| 2026-09-10 (noche) | Dos cuentas de prueba (admin y músico); el exportador pregunta el rol (L-255) |
| 2026-09-10 (noche) | 🚀 r75–r76 **P-02**: sin cuenta no se lee ninguna tabla; el enlace del culto por `culto_por_enlace` |
| 2026-09-10 (noche) | 🚀 r73 pestañas en el teléfono · 🚀 r74 notas privadas (O-74) y tempo guardado (O-81) |
| 2026-09-10 (noche) | 🚀 r70–r72 armadura en el editor (O-77), 15 duraciones (O-78), barra ancha (O-79) |
| 2026-09-10 | 🚀 r66–r69 migraciones 020–022, el logo en el login (O-76), el reproductor de la melodía |

Todo lo demás, tanda por tanda desde el 2026-08-19: **`docs/HISTORIAL.md`**.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
