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
| **Canciones (CONTADAS, 2026-08-21)** | **75 = 67 publicadas + 8 en borrador** ⚠️ el 2026-08-20 eran 69 + 6: Isaac pasó dos a borrador, así que **el respaldo de ese día está desfasado** |
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
**quitar solo es seguro cuando ya nadie lo pide** (L-103 `[PART]`).
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

**T-17 · El middleware se ejecuta en CADA navegacion: ir a la base desde ahi tumba la pagina.**
*Sintoma:* Isaac, 2026-08-28, entrando desde casa: **`504: GATEWAY_TIMEOUT` ·
`MIDDLEWARE_INVOCATION_TIMEOUT`** en `/catalog`. La pagina inservible **para quien tiene cuenta**.
*Y su observacion fue la que encuadro el fallo:* *«yo use la pagina hoy para el ayuno y me
funcionaba sin problemas, y cuando voy a mirar ahora que estoy en mi casa no funciona»*. **No se
habia roto sola: se rompio cuando lo publique yo**, esa misma noche.

*Causa, y la puse yo con P-01:* la comprobacion de `profiles.active` se metio **en el middleware**.
Ahi parecia el sitio correcto —cubre todas las rutas y puede cerrar cookies— pero el middleware
corre **en el borde** y se ejecuta **en cada navegacion de cada usuario**, asi que anadia un
**segundo viaje a la base** —que esta en Oregon— encima del `getUser()` que ya hacia.

**Medido en produccion, con sesion y sin ella:**

| | Sin cuenta | Con sesion |
|---|---|---|
| `/catalog` | 0,4 s | **13,0 s** la primera · 2,1 s · 1,7 s |

→ Por eso **un visitante no lo notaba**: sin usuario no se consultaba nada. Lo sufria justo quien
tiene cuenta, que son los musicos.

*Como se resolvio:* la comprobacion se fue a **`(dashboard)/layout.tsx`**, que **ya cargaba el
perfil entero** (`select("*")`) — o sea, **cero consultas nuevas**. Y como un componente de
servidor no puede escribir cookies, cerrar la sesion se hace en una ruta nueva, **`/salir`**, que
si puede: comprobado que devuelve la cookie con `Max-Age=0`.

📌 **La regla, y vale para cualquier cosa que se quiera meter ahi:** *lo que cuesta 200 ms en el
middleware, cuesta 200 ms **siempre**, en cada clic de cada persona.* **No es sitio para ir a la
base de datos.** Un coste que en una pantalla es aceptable, ahi se multiplica por todo lo que hace
el usuario.

🔴 **Y lo que enseña de mi forma de comprobar, que es peor que el fallo:** probe P-01 con `curl`
y di por bueno el resultado —307, cookie cerrada, todo correcto—. **Lo que no mire fue el
TIEMPO.** La respuesta era correcta y la pagina inservible. **Un 200 no dice nada si tarda 13
segundos**, y ninguna de mis comprobaciones miraba el reloj.

✅ **ARREGLADO el 2026-08-29: `pruebas/pantallas.mjs` ya mira el reloj.** Una pantalla que tarde mas
de **5 segundos** cuenta como fallo aunque responda bien, y el resumen dice siempre **cual fue la
mas lenta**. Con la pagina sana da **«26 bien · 0 mal · la mas lenta: 1,3 s»**; con el middleware de
anoche habria cantado las de sesion.

#### Y el desenlace: era Supabase, y NO era solo mio (2026-08-29)

Despues de publicar el arreglo, la pagina **seguia dando 504**. Al medir los dos servicios de
Supabase por separado aparecio la segunda causa, y no era nuestra:

| | |
|---|---|
| **PostgREST** (los datos) | ✅ **0,8 s** |
| **GoTrue** (la sesion) | 🔴 **no respondia**: 30 s y corte |

→ Cada pagina con cuenta pregunta «¿quien eres?» a ese servicio, asi que se quedaban colgadas.
**Colgaba igual desde el equipo de casa contra la misma base**, o sea que no era Vercel ni el
despliegue. Y Supabase lo tenia **reconocido en su pagina de estado** como incidente activo
(«API Gateway — Degraded Performance»).

⚠️ **Y una trampa al vigilarlo, que casi me hace cantar victoria:** el servicio **iba y venia**. Una
comprobacion dio `200` y se dio por recuperado; a los cinco intentos: `5,0 s · 13,7 s · cuelga ·
cuelga · cuelga`. → **Para dar por bueno un servicio que se recupera hay que exigirle varias
respuestas seguidas Y RAPIDAS**, no una.

**Cerrado el 2026-08-29**, con Isaac avisando de que ya funcionaba: sesion en **0,3 s** (cinco de
cinco), `/catalog` en **1,2 s**, y **26 de 26 pantallas en produccion**. No hubo que tocar nada mas.

📌 **Las dos causas se juntaron, y conviene separarlas al contarlo:** el middleware era un fallo mio
real —13 s medidos con la base sana— y estaba bien quitarlo; la caida de Supabase era
independiente. Al principio parecian lo mismo.

**T-16 · «Compila» comprobado con un `grep` MIENTE: el build falla despues de decir «Compiled successfully».**
*Sintoma:* durante toda una tanda, la comprobacion de compilacion dio verde y **el build estaba
fallando**. Se descubrio de rebote, porque `npm start` no arrancaba: faltaba
`.next/prerender-manifest.json`.
*Causa:* el filtro que se venia usando era `npm run build | grep "Compiled successfully"`. Pero
**«✓ Compiled successfully» es una fase INTERMEDIA**: despues vienen la comprobacion de tipos, el
prerender de las paginas estaticas y el cierre del build. El build reventaba en el **prerender de
`/login`** —por un `useSearchParams` en una pagina estatica, que exige `<Suspense>`— y aun asi
imprimia esa linea antes de morir.
*Medido:* `npm run build; echo $?` devolvia **1**, y el `grep` encontraba su linea igual.

🔴 **Lo que salva aqui es el CI, y es exactamente para lo que se puso.** El CI usa el **codigo de
salida**, no un grep, asi que lo publicado esta bien: el fallo vivia solo en los cambios locales.
Si el CI hubiera comprobado como yo, esto llega a produccion.

*Como se comprueba a partir de ahora:*
```bash
npm run build > /tmp/b.log 2>&1; echo $?     # 0 = bien. Lo demas es mentira
```
📌 **La regla, que vale mas alla de esto:** cuando una herramienta ya te dice si fue bien
—el codigo de salida—, **no lo deduzcas de su texto**. Un mensaje intermedio no es un veredicto, y
el dia que el programa cambie una linea de su salida, tu comprobacion se vuelve decorativa sin que
nadie se entere.

**T-14 · Al transponer, los acordes se escribían con la ortografía del tono DE PARTIDA.**
*Síntoma:* Isaac bajó «Anhelo Conocerte» de **F a E** y la barra decía **«Tono: E»** —correcto—,
pero debajo los acordes salían `Dbm`, `Gbm7`, `Abm7`, `Ab/C`, `Gbm`, `Eb`, `Ab7`, `Dbm7`. En **E**
esos acordes son `C#m`, `F#m7`, `G#m7`, `G#/C`, `F#m`, `D#`, `G#7`, `C#m7`.
Sus palabras (2026-08-22): *«transporté la canción a E siendo que original está en F, y los acordes
no son en E sino en Fb, y se sabe que en vez de Fb es mejor decir E y tocar en la tonalidad de E
para más comodidad. Arregla esto para todas las canciones y todas las tonalidades»*.

📌 **Su lectura es exacta:** la etiqueta decía E, pero los acordes estaban escritos **como si el
tono fuera Fb**. Y nadie toca en Fb.

*Causa,* `PresentationView.tsx:365`, **dos fallos en una línea**:

```ts
const flats = prefersFlats(song?.target_key || song?.original_key) || liveOffset < 0;
```

1. **La ortografía se heredaba del tono de PARTIDA.** Sin culto, `original_key` es `F` —tono de
   bemoles— así que todo salía en bemoles **aunque el destino fuera E**, que es de sostenidos.
2. **`|| liveOffset < 0` es una heurística falsa:** «si bajas el tono, usa bemoles». Bajar de F da
   E, de C da B, de G da F# — **las tres son de sostenidos**. Bajar no tiene nada que ver con los
   bemoles.

*Cómo se resuelve:* **la ortografía la decide el tono DESTINO, no el de partida.** Y no hace falta
inventar la regla: `KEY_OPTIONS` y `KEY_OPTIONS_MINOR` (`music.ts:29,47`) **ya la tienen escrita**,
con su campo `flats` por tonalidad — es el círculo de quintas de toda la vida. Solo faltaba
**preguntarle a la tabla por el tono al que se llega**, en vez de por el de salida.
→ Función nueva `ortografiaDe(pitch, menor)` en `music.ts`, y `keyLabel` y los acordes pasan a
usar **el mismo tono efectivo**: antes la etiqueta y la partitura lo calculaban por caminos
distintos, que es lo que permitía que se contradijeran.

🔴 **Se respeta T-11, que manda por encima:** **si el músico no ha movido el tono, no se recalcula
nada.** Se enseña lo que está escrito, letra por letra. Elegir entre `Bb` y `A#` solo se hace
cuando hay que reescribir de verdad; **esa elección, si ya la tomó quien escribió la canción, no se
le toca.**

*Dónde NO estaba el fallo, comprobado uno por uno:* `SongKeyVersions.tsx:33` y
`PrintableService.tsx:272` ya preguntaban por el **tono destino**, así que estaban bien. Y el modo
vista no transpone. **Era un solo sitio**, aunque se viera en todas las canciones.

📌 **Y es la tercera vez que muerde lo mismo** —T-06 (se perdía la `m` de `Bm`), T-11 (`Bb` salía
`A#`) y ahora esta—: **el tono se estaba deduciendo de la información equivocada.** Las tres veces
el dato bueno estaba al lado.

**Medido con `scratchpad/tono2.mjs`, que compila `music.ts` con el TypeScript del proyecto y pasa
las 75 canciones reales por las 22 transposiciones posibles:**

| | |
|---|---|
| Casos probados | **1.650** (75 canciones x 22) |
| **Cambian de ortografia** | **913 - el 55,3 %** |
| Tonalidades imposibles que salen (Fb, Cb, E#, B#) | **0** |

🔴 **Mas de la mitad de las transposiciones estaban mal escritas.** No era un caso raro: le pasaba
a cualquiera que tocara los botones de subir o bajar tono.

**El caso exacto de la captura de Isaac, «Anhelo Conocerte», de F a E:**

| | Acordes |
|---|---|
| **Antes** | `E  Dbm  Gbm7  B7  B  Ab/C  A  Abm7  Gbm  D7  Eb  Ab7` |
| **Ahora** | `E  C#m  F#m7  B7  B  G#/C  A  G#m7  F#m  D7  D#  G#7` |

**Las cuatro combinaciones, comprobadas una a una:**

| Tono del culto | Movio los +/- | Que hace |
|---|---|---|
| no | no | **no transpone**: se enseña lo escrito (T-11) |
| no | si | ortografia del **tono destino** ← *era el fallo* |
| si | no | ortografia del **tono del culto** — ya estaba bien |
| si | si | ortografia del **destino** (culto + ajuste) |

⚠️ **Lo que NO se puede comprobar desde aqui:** el fallo solo aparece **pulsando los +/-**, que es
JavaScript del navegador. Lo que si se midio: la funcion real con las 75 canciones, y que **el
culto que ya tenia tono cambiado sigue igual** (`Santo Por Siempre` F→D, presentacion 200, **ni un
bemol**) — que era el riesgo de tocar esto.


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

### 9.0 🔜 POR DÓNDE SE SIGUE MAÑANA (escrito el 2026-09-02 al cerrar)

**Lo primero que hay que leer al retomar.** Isaac dijo: *«mañana continuamos; cuando te diga que
continúes con el trabajo es porque ya es mañana»*.

| Orden | Qué | Estado |
|---|---|---|
| **1** | 🔴 **O-57 · R.0 — la MIGRACIÓN de la columna `sheets.melody`** | 🔴 **Isaac dio el OK el 2026-09-03 y la copia está hecha — pero NO SE PUEDE EJECUTAR: el conector de Supabase ya no apunta a Partituras.** Ver §9.1. La migración está escrita (`20240021`) y esperando una vía |
| **2** | ~~**O-57 · R.1 — el editor de melodía CON EL RATÓN**~~ | ✅ **HECHO el 2026-09-03**, sin tocar la base. Poner, arrastrar, borrar, insertar, deshacer, `#`/`b`/`♮`, silencios, ligaduras, barras y las 8 duraciones. 180 pruebas · 26 de 26 pantallas. **Falta que Isaac lo pruebe con la mano** — el ratón no deja rastro en el HTML |
| **3** | ~~**O-57 · R.2 — leerla**~~ | ✅ **HECHO el 2026-09-03.** Sección «Melodía» en el menú, ruta `/melodias`, pestaña en la canción y selector Como suena / Trompeta. **Escrito para aguantar que la columna no exista** |
| **3b** | ~~**O-57 · R.3 — escribir por texto**~~ | ✅ **HECHO el 2026-09-03.** Botón «Escribir a mano», sobre el mismo texto que escribe el ratón |
| **4** | ~~**O-57 · R.4** — la melodía en la presentación~~ | ✅ **HECHO el 2026-09-03.** Un botón que rota **acordes → letra → melodía** a pantalla completa, con la melodía pedida APARTE para que la columna ausente no pueda vaciar el culto. Mirado en captura, con trompeta incluida. **El PDF sigue descartado por ahora**, decisión suya |
| **4** | ~~**O-52 · regla 1 ó regla 2**~~ | ✅ **CERRADA el 2026-09-03: eligió la regla 1**, la que ya estaba publicada. La perdedora está **borrada**, no comentada |
| **5** | ~~**EL PUSH**~~ | ✅ **PUBLICADO el 2026-09-03 con su permiso** (*«sube lo que queda pendiente»*), `48990b1..d59a9de` (**r48**), en tres commits. CI **verde**, **26 de 26 pantallas en producción**, y las tres desechables **307** — ninguna llegó. **El permiso valía para ese trabajo: el siguiente push se le vuelve a pedir** |
| **6** | ⬜ **Que Isaac lo pruebe CON LA MANO, y en la tablet** | El ratón no deja rastro en el HTML: arrastrar una nota, `Supr`, deshacer y el botón de los tres modos **solo se comprueban tocando** |
| **7** | ~~**O-59 — usar la página como app**~~ | ✅ **INSTALADA el 2026-09-04**, en el menú de aplicaciones y sin escudo. 🔴 **Y salió el porqué de que fallara: BRAVE no fabrica la app, da un acceso directo y no lo dice.** Se instala **con Chrome**. Siguen anotadas las dos cosas que no hace —el aviso de «hay versión nueva» y que **sin internet no hay canciones**—; la tercera (la orientación) se arregló en r49 |
| **8** | ~~**El ICONO**~~ | ✅ **DECIDIDO el 2026-09-04: SE QUEDA COMO ESTÁ** (*«deja el icono así»*), o sea la **A**, `purpose: "any"` y el PNG transparente de D-12. **No se vuelve a proponer.** Si algún día cambia de idea, la **C** está descrita abajo con su aviso del margen |

**Estado del árbol al cerrar el 2026-09-02:**
- ✅ **Todo lo de O-52 / O-54 / O-55 / O-56 está PUBLICADO** (`48990b1`), CI verde, 26 de 26 pantallas
  en producción, y el comunicado en `CAMBIOS.md` y `/novedades`.
- 📄 **Sin subir, solo en el equipo:** todo O-57 (R.1 a R.4) — `lib/melodia.ts`,
  `lib/melodiaBase.ts`, `EditorMelodia.tsx`, `Pentagrama.tsx`, `MelodiaPanel.tsx`, la sección
  `/melodias`, el tercer modo de `PresentationView`, la migración `20240021` y
  `pruebas/melodia.test.mjs` —todo eso SÍ es código de la app y sube cuando toque—, más **TRES
  páginas desechables** con su línea del middleware: `/secciones-prueba`, `/pentagrama-prueba` y
  `/melodia-prueba`.
  ⚠️ **Las tres se BORRAN antes de publicar**, con sus líneas del middleware, como las cuatro
  anteriores. **Ninguna ha llegado nunca a producción.**
  📌 **`/melodia-prueba` existe por un motivo que se va con ella:** mientras la columna no exista,
  ninguna canción tiene melodía y **el tercer modo no se puede alcanzar** por el camino normal. Esa
  página le pasa a `PresentationView` una canción con melodía puesta a mano, para poder mirarlo.
- ⚠️ **`abcjs` viene de un CDN en la página de prueba, a propósito.** Si O-57 sigue adelante hay que
  decidir si entra como dependencia de verdad — y eso es **meter un paquete en el repositorio del
  primo**, así que se le pregunta (es lo mismo que se hizo con P-06).

### 9.1 Dependen de Isaac

- [x] 🟢 **DESCARTADO el 2026-08-21 — la invitación a Vercel deja de perseguirse.** Isaac
      preguntó para qué hacía falta si no había dado problemas, y **al revisarlo tenía razón**:
      4 de los 5 motivos ya están cubiertos por otra vía (CI, `git revert`, comprobar el
      despliegue por contenido) y el 5.º —los registros de producción— es pequeño: **el único
      susto real (T-07) no lo habrían pillado**. Súmale los 20 USD/persona/mes. **Ya no es un
      bloqueante; el detalle completo, en §12.2.** Si algún día hace falta una variable de
      entorno nueva, entonces sí hay que pedírsela al primo (hoy las 4 que usa ya están puestas).
      *Lo de abajo se conserva porque es la investigación que sostiene la decisión.*
- [ ] ⚠️ ~~La invitación a Vercel probablemente NO SE PUEDE~~ — comprobado en la documentación
      oficial el 2026-08-20 (`vercel.com/docs/plans/hobby`): en el plan **Hobby (gratis)** la
      fila «**Team collaboration features**» está **vacía**, y los roles (Owner/Member/Viewer)
      figuran como **N/A**. Invitar a alguien exige **Pro: 20 USD por persona al mes** (unos
      **80.000 pesos**), y **Isaac no quiere pagar nada** — es una constante de todos sus
      proyectos. Además el plan Hobby es **solo para uso no comercial**, cosa que la página
      cumple.
      → **Hay que confirmarlo mirando el panel del primo** (puede tener un plan distinto).
      → **Alternativas si no se puede, en orden de preferencia:**
      **(a) el CI de GitHub Actions** (§12.4-①): gratis, se monta hoy, y da la señal que más
      falta —si el build falla, un ❌ en el commit— **sin depender de Vercel**;
      **(b) transferir el proyecto de Vercel a la cuenta de Isaac**, que ya es el mantenedor.
      ⚠️ **Antes de intentarlo hay que averiguar si el dominio `partituras-blush.vercel.app`
      sobrevive a la transferencia**: si cambia, los músicos pierden el enlace que ya usan.
      **(c) dejarlo como está** y pedirle al primo que mire cuando algo falle.
- [ ] 🟡 **La clave `service_role` — PEDIDA el 2026-08-22, y el primo dijo que sí.** Isaac se lo
      pidió con el texto que se le preparó; **la manda cuando llegue del trabajo a la casa.**
      → **Ya no hay que perseguirlo: hay que estar pendiente de que llegue.** En cuanto esté:
      ponerla en `.env.local` (línea `SUPABASE_SERVICE_ROLE_KEY=`, que **no se sube**, está en
      `.gitignore`), rehacer `npm run export` para tener por fin **la copia completa** —hoy se deja
      las 8 canciones en borrador y **2 de los 3 cultos**, medido— y con eso ya se puede cerrar
      P-02.
      ⚠️ **Cuando llegue, no se pega en ningún chat de grupo ni en ningún documento compartido**:
      esa clave se salta todas las políticas de la base.
      *Lo de abajo es la investigación que sostiene por qué hacía falta.*
- [ ] 🔴 ~~Conseguir la clave `service_role`~~ — **es lo ÚNICO que sigue bloqueando de verdad.**
      (Solo puede sacarla el primo, hasta que invite a Isaac a su organización.)
      **Revisado el 2026-08-21, y sube otra vez de prioridad.** Tres motivos, el tercero es el
      importante:
      1. **La copia de seguridad se deja las 6 canciones en BORRADOR.** El `npm run export`
         normal las pierde y lo avisa. Las de hoy se rescataron **a mano, una sola vez**.
      2. Ninguna acción de `/admin` funciona en el equipo de Isaac (**T-05**). En producción sí.
      3. 🔴 **Medido el 2026-08-21 contra la base real, sin sesión y con la clave pública:
         devuelve 69 canciones y 3 cultos** (0 borradores). Es **P-02**. Y **`npm run export`
         funciona hoy gracias a ese agujero** — el día que se tape, la copia deja de funcionar.
         **No se puede cerrar P-02 sin tener antes la clave.**
      📌 **El encuadre, que es lo que se olvida:** GitHub guarda el programa; **Supabase guarda
      el trabajo de la iglesia** —75 canciones, cuenta ajena, plan gratuito, sin copias
      automáticas—. La dependencia gorda nunca fue Vercel.
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
- [x] ~~**Reconectar el conector de Supabase de Claude con la cuenta de Isaac**~~ →
      🔴 **YA PASO, Y PASO LO QUE ESTABA AVISADO AQUI: SE PERDIO EL ACCESO A PARTITURAS.**
      Comprobado el **2026-09-03**: el conector lista **un solo proyecto, «Sistema Biometrico»**
      (organizacion `fjaivddkmynlqjusvsxn`, region us-east-2, INACTIVE) — **Partituras
      (`pcayahwnxbigiuhvtwhd`) no aparece**, y cualquier consulta contra el devuelve
      *«You do not have permission to perform this action»*.

      📌 **El aviso estaba escrito aqui palabra por palabra** —*«si se reconecta antes de la
      invitacion, se pierde el acceso a Partituras por esa via»*—, y se cumplio. Lo que **no**
      se dimensiono bien es la ultima parte: se dijo *«no es grave»* porque el respaldo estaba
      hecho y el desarrollo usa `.env.local`. **Y es cierto para LEER, pero no para MIGRAR.**

      | Que se puede hacer hoy contra la base | |
      |---|---|
      | **Leer y escribir FILAS** (la app, el exportador, las pruebas) | ✅ **funciona** — va por `.env.local` con la clave publica. Comprobado: `sheets` responde 200 |
      | **Cambiar el ESQUEMA** (`alter table`) | 🔴 **NO hay via.** PostgREST no ejecuta DDL ni con la `service_role`, y el conector ya no llega a este proyecto |

      → **Esto bloquea R.0 y cualquier migracion futura**, incluida la `20240020` que ya estaba
      esperando. **Las tres salidas, para que Isaac elija:**
      1. **Que el primo lo invite a «Luixmc's Org»** y reconectar el conector a la cuenta de
         Isaac. Es la que ya estaba pedida y la que arregla esto para siempre.
      2. **Que el primo ejecute el SQL** desde el panel de Supabase. Son 3 lineas y estan
         escritas en `supabase/migrations/20240021_sheet_melody.sql`.
      3. **Volver a conectar el conector a la cuenta del primo**, que es como estaba.
- [ ] 🔴 **CONSECUENCIA: ninguna migracion se puede ejecutar hasta que esto se resuelva.**
      Hay **dos esperando**: `20240020` (usuario desactivado, §9.3) y `20240021` (la columna
      `melody`, con el OK de Isaac ya dado y la copia hecha).

      #### 🔴 «¿Y si dejo los datos publicos?» — NO sirve, y hay que saber por que (2026-09-04)

      Isaac lo ofrecio: *«tu me dices que la migracion no se puede hacer porque hay unas cosas de la
      base de datos que no puedes pasar porque no estan publicas; si es asi, yo las puedo dejar
      publicas y lo haces, corrigeme si me equivoco»*.

      **Se equivoca, y la culpa es de como se lo explique.** El bloqueo **nunca fue de LECTURA**.

      **Medido contra la base real ese mismo dia, con la clave publica:**

      | Que se probo | Resultado |
      |---|---|
      | `GET /rest/v1/sheets` — **leer datos** | ✅ **HTTP 200** — ya funciona, y lleva funcionando siempre |
      | `select melody` | `42703` · *«column sheets.melody does not exist»* |
      | `POST /rpc/exec_sql` y `/rpc/sql` — **ejecutar SQL** | **404 · NO EXISTEN** |

      🔴 **Ahi esta la respuesta: leer ya funciona.** Lo que falta no es permiso sobre los datos,
      **es poder cambiar la ESTRUCTURA de la base** — anadir una columna (`alter table`).

      📌 **Y eso no se puede por la via que usa la app, HAGA LO QUE HAGA CON LOS PERMISOS.** La API
      que Supabase expone por internet (PostgREST) solo sabe hacer cosas con **FILAS**: leer,
      insertar, cambiar y borrar. **Crear o modificar COLUMNAS no esta expuesto ahi** — ni con la
      clave publica, ni con la `service_role`, ni poniendolo todo publico. No es un permiso que
      falte: **es una puerta que no existe**.

      **Las cuatro vias que SI pueden cambiar la estructura, y que le falta a cada una:**

      | Via | Que hace falta |
      |---|---|
      | **El SQL Editor del panel** de Supabase | Entrar a la cuenta del primo, o que invite a Isaac |
      | **La API de gestion** (lo que usaba el conector) | Un token con acceso al proyecto — el conector **ya no llega** |
      | **Conexion directa a Postgres** (puerto 5432) | **La contrasena de la base**, que esta en el panel del primo |
      | **La CLI de Supabase** | Un token de acceso, otra vez del primo |

      → **Las cuatro pasan por el primo.** Y **ninguna se arregla haciendo publicos los datos**.

      ⚠️ **Ademas, y por si acaso: hacer publico lo que hoy no lo es seria un PASO ATRAS.** Los
      borradores y los cultos sin publicar estan cerrados a proposito (migracion `20240017`, D-25),
      y abrirlos **no acercaria la migracion ni un milimetro** — solo dejaria ver a cualquiera lo
      que hoy solo ve el. **No se hace.**

      📌 **La leccion de como lo conte:** yo escribi *«el conector ya no llega al proyecto»*, y el
      lo tradujo a *«no estan publicas»*, que es lo unico que el puede tocar. **Cuando el bloqueo es
      de una via de ACCESO y no de un permiso, hay que decirlo con lo que el puede hacer al
      respecto** —«pidele esto a tu primo»— y no con el sintoma tecnico.
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
- [x] ~~El push de la tanda 33~~ → ✅ **HECHO el 2026-08-21 con su permiso** (*«adelante sube todo
      lo que no está subido, y en el orden que dices»*), commit `c1b4b40` (r44). Verificado en
      producción. **El permiso valía para ese trabajo: el siguiente push se le vuelve a pedir.**
- [x] ~~La migración `20240017`~~ → ✅ **APLICADA el 2026-08-21**, después de que Isaac autorizara
      la herramienta (*«hagamos la segunda opción que dices, te autorizo la herramienta»*). El
      primer intento lo bloqueó el entorno de Claude, **no** un permiso suyo; **no se buscó una vía
      alternativa a propósito** — saltarse ese bloqueo es justo lo que no hay que hacer.
      **Comprobado contra la base, antes y después:**

      | | antes | después |
      |---|---|---|
      | Cultos | 3 | **3** |
      | …publicados | — | **3** |
      | …no publicados | — | **0** |
      | Filas de repertorio | 17 | **17** |
      | Columna `status` | no existía | **existe**, defecto `draft` **solo para los nuevos** |
      | Política de lectura | `services_select_all :: true` | **`services_select_viewer :: status='published' or created_by=auth.uid() or is_admin()`** |

      **Y que no rompió nada, que era el riesgo:** con la **clave pública y sin sesión**, la base
      sigue devolviendo **los 3 cultos** (Escuela Dominical, asd, Ayuno), los tres publicados. La
      app contra la base ya migrada: lista **200 con 3 cultos y 0 etiquetas de estado** —correcto,
      están los tres publicados—, detalle **200** con el control diciendo «Publicado: lo ven los
      músicos y los lectores», y las 8 asas de arrastre en su sitio.
- [x] ~~Medir la otra mitad de O-31~~ → ✅ **CERRADA el 2026-08-21, y la cerró Isaac.** Puso «asd»
      en **borrador** y «Ayuno» en **archivado** con el botón nuevo, y **lo probó él mismo con una
      cuenta de LECTOR en incógnito**: *«acabo de hacer la prueba y sí funciona correctamente»*.
      🔴 **Y medido donde importa, que no es la pantalla:** con la **clave pública y sin sesión**
      —el caso más estricto, el que ni siquiera pasa por la app— `services` devuelve **1 de 3**:
      solo «Escuela Dominical», la publicada. **La base esconde el borrador y el archivado**, no
      los esconde la interfaz. O-31 queda comprobada **por las dos caras**.
      📌 Y de paso queda probado el **botón de cambiar estado**, que era lo único de la tanda que
      no se había podido ejercitar desde aquí.
- [x] ~~Decidir si se migra a Next 16~~ → ✅ **HECHO Y PUBLICADO el 2026-08-22**, commit `fb77141`.
      Isaac pidió la prueba con copia previa; salió bien **después de arreglar lo que rompía**, y
      la aprobó tras mirarla en local: *«está todo bien en lo que me dices para buscar, adelante»*.
      **Vulnerabilidades: de 15 a 8**, y **`next` y `pdfjs-dist` desaparecen** — las 6 altas que
      quedan son de herramientas de desarrollo y no llegan a ningún navegador.
      🔴 **La lección va a la carpeta compartida como L-122**, y es la más cara de la noche:
      **compiló limpio y la app estaba rota entera.** El detalle, arriba.
- [ ] ⬜ **Quitar el respaldo de `replaceSongs`** (`services/actions.ts`). Es el borrar-e-insertar
      de siempre, que se dejó para que publicar el código no rompiera nada mientras la migración
      `20240018` esperaba permiso. **Ya no se usa nunca**: la función existe desde el 2026-08-22.
      Se quita cuando lleve unos días en pie. **Está anotado aquí a propósito**: un respaldo
      temporal sin dueño se queda para siempre.
- [x] ~~Contestar las preguntas abiertas de §9.2~~ → ✅ **las de O-03, O-06 y O-08 se cerraron el
      2026-08-20**, y **O-01 y O-19 el 2026-08-22** (§9.2-nonies). O-01 se cerró **sin programar
      nada**; de O-19 quedó una propuesta de diseño esperando el visto bueno.
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

#### 📊 Medido el 2026-08-21, antes de proponer nada (O-17 / O-18)

Con `scratchpad/inventario.mjs` y `letras.mjs`, sobre las **75 canciones reales**:

| Dato | Número | Qué significa |
|---|---|---|
| Acordes escritos | **1.894** | |
| **Calidades distintas** | **solo 32** | Y **5 cubren el 94 %**: mayor (873), `m7` (378), `7` (287), `m` (181), `maj7` (68) |
| Acordes con bajo (`/`) | **~91** | Justo lo que le importa al bajista |
| Secciones con etiqueta | 574 | |
| …con un trozo de letra `(...)` | **284**, de **17 caracteres de media** | Son **pistas** —«(Mi orgullo...)»—, **no la letra** |
| Canciones con la columna `lyrics` | **0 de 75** | **No existe ninguna letra escrita** |

**Lo que esto decide:**
- **O-17 (piano y bajo) es MUCHO más pequeño de lo que parecía.** No hay que cubrir «todos los
  acordes posibles»: hay que cubrir **32**, y con **5** ya funcionan 9 de cada 10. Se calculan a
  partir de la raíz y la calidad, **sin datos externos**.
- 🔴 **O-18 no es un trabajo de programar, es de TECLEAR.** La letra **no existe en ninguna
  parte**: ni en la columna, ni en el contenido. Los 284 paréntesis son la primera frase de cada
  sección, para reconocerla. Programar la pantalla son horas; **escribir la letra de 75 canciones
  lo tiene que hacer una persona**, y hay que decidir quién y cuándo. **Decirlo antes de empezar,
  no después.**

#### ✅ Los 8 acordes raros — RESUELTOS por Isaac el 2026-08-21

**Ninguno era una errata.** Todos significan algo, y lo importante es que **la barra `/` NO
siempre quiere decir bajo**:

| Escrito | Qué significa | Qué toca el BAJO | Qué toca el PIANO |
|---|---|---|---|
| `F#m7/b5` · `Bm7/b5` · `E#m2/b5` | La `b` de `b5` es **bemol de quinta**. Es el **semidisminuido** | **la fundamental** (`F#`) | **el acorde completo**, con la quinta bemol |
| `A4` | **`Asus4`** | `A` | `Asus4` |
| `Bbmaj7/#9` | **`Bbmaj7` más la novena sostenida (aumentada)** | `Bb` | `Bbmaj7` + `#9` |
| `A/G#m` | **Acorde de transición, dos manos:** derecha `A`, izquierda `G#m` **en octavas** | **`G#`** | `A` arriba + `G#m` abajo |
| `B°` (Jericó) | Correcto. **Isaac lo cambiará él a `dim`** para igualarlo al resto (D-08b). **No tocar el dato** | | |

🔴 **LA REGLA QUE SALE DE AQUÍ, y hace falta para dibujar los acordes (fase I):**
**lo que va detrás de `/` puede ser dos cosas distintas**, y hay que distinguirlas:

1. **Un nombre de nota** (`F/A`, `Bb/F`, `A/G#m`) → **es el bajo**. Puede traer modo (`G#m`),
   y entonces es un **acorde sobre otro acorde**: el bajo toca **solo la fundamental del de
   abajo** (`G#`), y el piano reparte los dos entre las manos.
2. **Una alteración** (`b5`, `#9`) → **NO es un bajo, es una nota añadida al acorde**. El bajo
   toca **la fundamental de siempre**.

Confundirlas hace que el bajista toque una nota que no existe. *(Se comprobó de paso que el
transpositor **sí** los mueve bien: `b5` y `#9` los deja quietos porque no empiezan por nota, y
`A/G#m` +1 da `A#/Am`, correcto. **Ahí no hay nada que arreglar.**)*

📌 **Y por segunda vez en dos días, lo mismo:** lo que parecía basura en los datos era notación
suya sin documentar — como el `-` de «Si Dios Dice Que Si». **En este proyecto, un símbolo raro
se pregunta. Siempre.**

⚠️ Queda una duda menor, **sin tocar**: en `E#m2/b5` («No Hay Lugar Más Alto») el `m2` no encaja
con nada; lo normal sería `m7`. Isaac lo metió en el mismo saco que los otros `b5`. **Se dibuja
la quinta bemol y la calidad `m2` se deja como desconocida, sin inventar.**

**O-18 · Una sección de LETRAS de las canciones, para las cantantes.** `[PENDIENTE]`
✅ **La duda de «quién la escribe» está resuelta (2026-08-21): LAS ESCRIBE ISAAC.** Sus palabras:
*«las letras las hago yo, ten en cuenta eso siempre»*. → **O-18 es viable**: se programa la
pantalla y él va rellenando. Lo que hay que darle es **una forma cómoda de escribirlas**, porque
son 75 canciones y las teclea una sola persona.
→ ❓ Hoy la letra vive suelta dentro de los acordes, entre paréntesis y recortada
(`(Dios le dijo a-)`), y existe una columna `sheets.lyrics` **que está sin usar y a 0**. Habría
que decidir **de dónde sale la letra**: ¿se escribe aparte en esa columna, o se saca de lo que ya
hay entre paréntesis? Son dos proyectos distintos.

**O-19 · Una sección para TROMPETAS.** `[PENDIENTE]`
→ ❓ Hay que preguntar qué necesita ver un trompetista que no le sirva de la página actual:
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

**O-27 · «Cancionero» → «Partituras».** ✅ Hecho el 2026-08-20 · 🔴 **REPETIDO el 2026-08-22.**

🔴 **SE VOLVIÓ A COLAR, y lo colé yo.** Al escribir el aviso nuevo del login (Fase L) puse
*«Pídesela a quien lleva el cancionero»*, e Isaac tuvo que pedirlo por segunda vez:
*«te dije que quites todo lo que sea relacionado a cancionero y lo cambies por Partituras, o en su
caso página o algo así, pero cancionero no por favor»*.

→ **La palabra `cancionero` NO SE ESCRIBE.** Ni en la pantalla, ni en los comentarios del código,
ni en este documento. Se dice **«Partituras»**, **«la página»** o **«las partituras»**.
→ **Barrido entero el 2026-08-22:** quedan **0 en `src/`, `public/` y el README**. Las dos únicas
que sobreviven son **las citas de esta misma regla** —aquí y en `CAMBIOS.md`—, y se quedan a
propósito: si se borran, desaparece el motivo, y el siguiente que escriba un texto vuelve a
ponerla. **Que es exactamente lo que pasó.**
→ 📌 **La lección:** una regla de estilo que solo vive en el historial se incumple sola. Por eso
sube aquí, en negrita, y no en la línea de una tanda vieja.
Isaac: *«que así es como manejamos nosotros el lenguaje»*. Cambiado en el pie de la página
compartida, en el nombre de la app instalada y en la descripción de la página. **No quedaba
ningún otro sitio.**

#### La nueva (dictada el 2026-08-21)

**O-28 · Filtrar el catálogo por ESTADO, y solo para administradores.** ✅ **HECHO y VERIFICADO
el 2026-08-21** (sin publicar). Isaac: *«el filtro está bien, al igual que el estado»*.
Isaac: *«quiero que haya una opción solamente para las cuentas que son admin, en las que aparezca
en el catálogo, además de adoraciones, alabanzas y demás, que le salga borrador, archivado y
publicado»*.
→ **Va junto a los filtros de categoría que ya hay**, en su propia fila, y **solo lo ve un
administrador**. A músicos y lectores la pantalla no les cambia en nada.
→ **Los tres estados YA EXISTEN en la base** (`sheet_status`: `draft`, `published`, `archived`,
desde la migración `20240001`). **No hace falta migración.** Hoy se usan dos: **69 publicadas y
6 en borrador**; de `archived` no hay ninguna todavía.
→ **Sale gratis en la pantalla completa:** la consulta es la compartida de `lib/catalogo.ts`, así
que «la siguiente canción» respeta el estado igual que respeta la categoría (D-15).
⚠️ **Esto NO es una barrera de seguridad, es una comodidad.** Que un lector no vea los borradores
ya lo garantizan las políticas de la base —medido: con la clave pública salen **0 borradores**—.
El filtro solo le ahorra a Isaac tener que buscarlos a ojo.

**Verificado con datos reales, como ADMINISTRADOR:**

| Filtro | Canciones |
|---|---|
| sin filtro | **75** |
| `?estado=published` | **67** |
| `?estado=draft` | **8** |
| `?estado=archived` | **0** (no hay ninguna) |
| `?estado=inventado` | **75** — se ignora, no rompe |

**Y verificado COMO LECTOR** — Isaac bajó la cuenta de prueba a lector el 2026-08-21 para poder
comprobarlo, que era el trato:
- **No ve la fila «Estado».**
- Escribiendo `?estado=draft` **a mano** en la dirección: **67 canciones, ningún borrador**.
- `/admin` le **rebota** (307).

🔴 **DATO QUE CAMBIÓ: ya no son 69 publicadas y 6 borradores, son 67 y 8.** Isaac pasó dos
canciones a borrador después del respaldo del 2026-08-20. → **El respaldo está desfasado**; hace
falta un `npm run export` nuevo. Las cifras de §7 quedan corregidas.

**T-12 · La lista de un `<select>` sale en blanco sobre blanco en modo oscuro.**
*Síntoma:* al desplegar el rol de un usuario en `/admin`, **solo se lee la opción señalada**; las
demás parecen vacías. Isaac lo vio el 2026-08-21 y mandó la captura.
*Causa:* **esa lista no la dibuja la página, la dibuja el navegador.** El CSS le daba letra clara,
pero el fondo de la lista lo elige el navegador, y elegía blanco porque nadie le había dicho que
la página está en oscuro.
*Cómo se resuelve:* **`color-scheme` en la hoja global** — `light` en `:root` y `dark` en
`html.dark`. Es la forma de decirle al navegador de qué color va la página.
→ **Se arregló en la hoja global a propósito, no en ese desplegable:** hay **8 `<select>` en 5
archivos** (roles, tonalidad, tipo de culto, categoría…) y **todos tenían el mismo problema**. De
paso arregla las barras de desplazamiento y los selectores de fecha.
→ Además se le puso color propio a cada `<option>` del selector de roles, por si algún navegador
ignora `color-scheme`.
⚠️ **No se puede comprobar desde aquí:** esa lista la pinta el navegador y **no aparece en el
HTML**. Lo verificado es que `color-scheme: light` y `dark` **llegan a la hoja que sirve la
página y al CSS compilado de producción**. Verlo abierto le toca a Isaac.

**O-29 · Una página PÚBLICA con el comunicado de cambios, en el propio dominio.** ✅ **HECHA el
2026-08-21** — `/novedades`. Isaac: *«está bien, súbelo»*.
Isaac pidió el 2026-08-21 un texto con lo cambiado desde que se retomó la página, **sin nada de
administración** —*«no lo van a usar ellos»*— para avisar a los músicos.

🔴 **Lo primero que se intentó NO SIRVE, y lo comprobó él:** se publicó como artefacto de Claude
(`claude.ai/code/artifact/…`). **En una ventana de incógnito sale «Page not found» y un botón de
iniciar sesión.** → **Un enlace de Claude no vale para gente sin cuenta de Claude.** Para avisar a
un grupo de WhatsApp de la iglesia, eso lo descarta por completo.
📌 Yo no podía comprobarlo desde aquí: sin sesión, la dirección devuelve **HTTP 200** y una página
vacía que carga el contenido después. **Parecía pública y no lo era.** Lo resolvió él en dos
minutos abriendo incógnito. *(Otra vez lo mismo: hay cosas que solo se ven en un navegador de
verdad — como T-12.)*

**La propuesta que sí funciona:** una ruta **`/novedades`** en la propia página, pública como
`/s/<token>`.
- **La abre cualquiera**, sin cuenta y sin instalar nada. Es el dominio que los músicos ya conocen.
- **No caduca ni depende de un servicio de fuera**; vive en el repositorio con el resto.
- Cuando haya más cambios, se añaden ahí y **el enlace de siempre sigue valiendo**.
- Es una página de solo texto: **sin base de datos y sin migración**. Hay que añadirla a las rutas
  públicas del middleware, igual que se hizo con `/manifest.json` (P-14).

**Lo decidido:** dirección **`/novedades`** · **sin enlace desde dentro** de la página, solo el que
Isaac mande · **pública del todo**, sin token.

**Cómo quedó montada:**
- `src/lib/novedades.ts` — **el contenido**, aparte del dibujo. Añadir una tanda es escribir una
  entrada ahí: fecha, secciones, y cada cambio con su etiqueta. **La página no se toca.**
- `src/app/novedades/page.tsx` — el dibujo. Apila las tandas por fecha, así que **el enlace que se
  mande hoy sigue valiendo dentro de un año**.
- `middleware.ts` — `/novedades` en las rutas públicas, junto a `/s/`.
- **Metadatos de `openGraph`**, para que al pegar el enlace en WhatsApp salga «Qué cambió en
  Partituras» y no la dirección pelada.

**Cada cambio lleva etiqueta de NUEVO o ARREGLADO**, y no es adorno: al músico le dice lo único
que necesita de un vistazo — si tiene que buscar un botón nuevo, o si algo que fallaba ya no falla.

🔴 **DOS CORRECCIONES DE ISAAC, y las dos son la misma:** el texto estaba escrito **como si todo se
leyera en el teléfono**.
1. *«aquí deberías aclarar que es también para PC, porque hace creer que es solamente en
   teléfono»* — por el título «En el teléfono».
2. *«el icono también funciona en el PC, porque antes la pestaña salía el mundo ese gris… y en la
   sección del PDF mencionas solo el teléfono también. Los cambios se hicieron pensados tanto para
   PC como para teléfono, modifícalo en las secciones que sean pertinentes.»*
→ **Repasado entero**, no solo donde él señaló. Quedó **9 menciones al teléfono y 9 al computador**
—medido—, más una **nota arriba que lo dice una sola vez**: *«todo lo de aquí vale igual en el
teléfono, en la tablet y en el computador; donde algo cambie según el aparato, se dice»*.
→ El peor era **el PDF**: contado entero desde el móvil, cuando se baja igual desde el computador
y ahí la hoja horizontal sale sola. Se separó lo que depende del aparato (horizontal/vertical) de
lo que depende del uso (claro para papel, oscuro para pantalla).
📌 **Y su detalle del «mundito gris» entró tal cual.** Nadie recuerda «no había favicon»; **todos
se acuerdan del globo gris**. El usuario nombra las cosas como se reconocen.

**El texto ya está escrito**, en `Documents\Partituras\comunicado-musicos.md` — **fuera del
repositorio a propósito**, para que no se publique sin querer. De ahí sale el contenido de la ruta.

### 9.2-quinquies · FASE J — O-18, la sección de LETRAS · ⬜ PROPUESTA, a la espera del visto bueno

Isaac dijo *«vamos con lo de O-18»* el **2026-08-21**. Antes de proponer nada se midieron los
datos reales, y salieron **tres cosas que cambian el planteamiento**:

**① El trabajo de teclear es la MITAD de lo que parecía.** No son las 574 secciones:

| | |
|---|---|
| Secciones que **se cantan** (traen la pista entre paréntesis) | **284** |
| Secciones **instrumentales** (Intro, Final, Coda, vacías) | **252** — no llevan letra |
| Secciones **a decidir** (`A`, `B`, `C`… sin pista) | **38** — ❓ pregunta para Isaac |

→ Son **unas 4 estrofas por canción**, no 8.

**② Cada sección cantable YA TRAE su primera frase.** Las 284 pistas —«(Mueve el estanque...)»,
«(Ven señor...)»— son **el andamio**: la pantalla de escritura puede venir **rellena** con las
etiquetas y el arranque de cada estrofa, y él solo continúa. **Eso es lo que hace barato el
trabajo**, y es la razón de que O-18 sea viable ahora y no antes.

**③ La columna `sheets.lyrics` YA ESTÁ INDEXADA para búsqueda en español**
(`20240004_sheets.sql:85` y `20240007_search_views.sql:49`). Existe desde el principio y **nadie
la usa**. 🔴 **Pero el buscador del catálogo NO la aprovecha:** `lib/catalogo.ts` solo hace
`title.ilike` y `composer.ilike`. → **Buscar por letra es un cambio aparte**, y es lo que le da
sentido a teclear: *«¿cómo se llama la que dice…?»* es la pregunta que más se hace en un grupo de
alabanza.

#### El diseño

**Dónde se guarda: en `sheets.lyrics`, texto plano, CON LAS MISMAS ETIQUETAS DE SECCIÓN que los
acordes** (`[A]`, `[Coro]`…). Tres motivos, y los tres pesan:
- **No hace falta migración**: la columna existe. Ninguna trampa de esquema (T-07).
- **Ya está en el índice de búsqueda**, así que buscar por letra no exige nada nuevo en la base.
- **`parseSections` ya existe**, así que emparejar cada estrofa con su sección de acordes
  **sale gratis** — el que canta ve la letra del coro donde está el coro.

| Sub | Qué | Riesgo |
|---|---|---|
| **J.1** | **Escribir.** Pestaña «Letra» en el editor, solo admin, **rellenada con el andamio** (etiquetas + la pista de cada estrofa) | Bajo: pantalla nueva, no toca el editor de acordes |
| **J.2** | **Leer.** Pestaña «Letra» en la vista de la canción, para todos. Sin acordes, letra grande | Bajo |
| **J.3** | **Buscar por letra.** El buscador del catálogo mira también la letra | Medio: toca la consulta compartida (`lib/catalogo.ts`), que usan dos pantallas |
| **J.4** | *(opcional)* La letra en la presentación y en el PDF del culto | A decidir |

#### ✅ Las 4 respuestas de Isaac (2026-08-21)

**1. Las 38 secciones sin pista NO se pueden clasificar.** Sus palabras: *«a veces se repiten
estrofas a cantar, a veces son instrumentales, a veces solos de guitarra, etc., no es algo fijo»*.
→ 🔴 **Consecuencia de diseño, y es la importante:** el andamio **NO decide** cuáles llevan letra.
Se ofrecen **todas** las secciones, y **la que se quede vacía es que no se canta**. El dato lo pone
él al escribir, no una regla que yo me invente. *(Es la regla del `-` otra vez: no adivinar sobre
sus datos.)*

**2. La letra la ven SOLO quienes tengan cuenta**, con cualquiera de los tres roles.
→ **No sale en el enlace compartido del culto** (`/s/<token>`), que lo abre gente sin cuenta.
→ Sale gratis: el panel ya exige sesión, y la barra lateral ya filtra por rol.

**3. Sección propia en la barra lateral**, como «Canciones», «Cultos» o «Administrar» — idea suya,
y **es la correcta**: *quien canta no quiere acordes nunca*. Si la letra fuera solo una pestaña
dentro de la canción, aterrizaría en los acordes cada vez y tendría que cambiar. Con entrada
propia, empieza donde le toca. **Y también la pestaña dentro de la canción**, para quien ya está
ahí — él dijo las dos, y las dos tienen usuario distinto.

**4. Alternar acordes ↔ letra a pantalla completa: sí** (J.4).

#### D-20 · La letra se guarda en `sheets.lyrics`, con las mismas etiquetas de sección

Sin migración (la columna existe desde `20240004`), ya está en el índice de búsqueda en español, y
`parseSections` la parte gratis para emparejar cada estrofa con su sección de acordes.

#### D-21 · `/letras` reutiliza la consulta del catálogo, NO se copia

🔴 **El riesgo de la sección propia es acabar con DOS catálogos que se separan con el tiempo** —es
exactamente P-09, y ya se pagó dos veces en este proyecto (`parseSections` duplicado, y la consulta
del catálogo que hubo que sacar a `lib/catalogo.ts` en la fase G)—.
→ `/letras` usa **`buscarCanciones` de `lib/catalogo.ts`**, la misma que `/catalog` y que la
pantalla completa. Lo único suyo es **a dónde llevan las tarjetas** y **qué se enseña**.

#### El plan, ya con las respuestas

| Sub | Qué | Toca |
|---|---|---|
| **J.1** | **Escribir** — pestaña «Letra» en el editor (solo admin), rellenada con el andamio de secciones + la pista de cada una | `SongDetailEditor`, pantalla nueva |
| **J.2** | **Leer** — entrada **«Letras»** en la barra lateral (los 3 roles) + pestaña dentro de la canción | `Sidebar`, ruta `/letras` nueva |
| **J.3** | **Buscar por letra** en el catálogo | `lib/catalogo.ts` — la comparten dos pantallas |
| **J.4** | **Alternar acordes ↔ letra** a pantalla completa | `PresentationView` |

#### ~~Lo que había que preguntarle antes de empezar~~ — CONTESTADO

1. **Las 38 secciones `A`, `B`, `C` sin pista: ¿se cantan o son instrumentales?** Él lo sabe de
   memoria; adivinarlo sería inventar.
2. **¿La letra la ve todo el mundo, o solo quien tenga cuenta?** ¿Y en el enlace compartido del
   culto, que lo abre gente sin cuenta?
3. **¿La letra en pantalla aparte, o junto a los acordes?** Para quien canta, aparte y grande.
   Para quien toca y canta a la vez, junta. **Puede que hagan falta las dos.**
4. **¿En la presentación a pantalla completa, poder alternar acordes ↔ letra?**

#### ✅ FASE J HECHA (2026-08-21) — O-18, las letras

| Sub | Qué | Estado |
|---|---|---|
| **J.1** | Escribir la letra, con el **andamio** | ✅ |
| **J.2** | Sección **«Letras»** + pestaña dentro de la canción | ✅ |
| **J.3** | **Buscar por letra** | ✅ **probado con datos reales** |
| **J.4** | Alternar **acordes ↔ letra** a pantalla completa | ✅ |

**J.3 verificado de verdad**, en cuanto Isaac escribió dos letras:
`?q=temporada` → **Aceleración** (está en la letra, no en el título) · `?q=aleluya` → **Agnus Dei**
y **Aleluya** · `?q=aceler` → por título y con trozo de palabra · `?q=xyzynoexiste` → ninguna.

#### 🔴 Dos fallos que Isaac encontró USANDO la pantalla completa

**① El modo letra se perdía al pasar de canción.** *«Paso a la otra canción y me muestra los
acordes, tengo que darle otra vez al botón.»* → **Era una decisión mía, y equivocada**: puse que
volviera a acordes para no dejar una pantalla vacía si la siguiente no tenía letra. Pero **quien
canta, canta el repertorio entero**.
→ Ahora **se mantiene**, y el caso vacío se resuelve sin perder su elección: si una canción no
tiene letra salen sus acordes, y **en cuanto llega otra que sí la tiene, vuelve sola a la letra**.
📌 **La lección:** el caso raro —una canción sin letra— me llevó a estropear el caso normal. Se
arregla **degradando**, no reiniciando.

**② La letra no respetaba las columnas ni el recorrido.** Estaba siempre en multi-columna, así que
«por filas» (O-26) no hacía nada. → Ahora usa **exactamente la misma lógica que los acordes**.

#### 🔴 El andamio metía anotaciones de arreglo como si fueran versos

Isaac probó en «Aceleración» y el andamio le puso **«Brass x4» como un verso**, bajo la Intro. Entre
paréntesis hay **dos cosas mezcladas**, y se midió sobre las 75 canciones:

| | |
|---|---|
| Paréntesis que **acaban en puntos suspensivos** | **276** — son frases CORTADAS: el arranque de la letra |
| Los que **no** | **8** — `Brass`, `Brass x4`, `Voces`… y 4 que sí son letra corta |

→ **Solo se rellena si acaba en puntos.** ⚠️ **El precio, asumido a propósito: 4 secciones pierden
su relleno** («El señor está sentado», «Su gloria está aquí», «Pedimos gracias», «Jeeee»).
**Contenido equivocado que parece escrito es peor que un hueco vacío**, porque el hueco se ve y el
error no — y además contaba como estrofa cantada y le salía a quien canta.

#### D-22 · Las letras son SOLO DEL ADMIN hasta que estén todas escritas

Isaac, 2026-08-21: *«quiero primero montar las letras y luego que todo el panel de la letra se haga
público… mientras tanto que aparezca solo al admin, como la sección de ajustes»*. Tiene razón: una
sección donde 73 de 75 dicen «sin escribir» no ayuda, y hace dudar de la página.

🔴 **UN INTERRUPTOR ÚNICO, en `lib/letras.ts`:**

```ts
export const ROLES_LETRAS: UserRole[] = ["admin"];
//  para abrirlo:  ["admin", "musician", "viewer"]
```

**Los CUATRO sitios miran ahí** —barra lateral, pestaña de la canción, pantalla `/letras` y botón
de la presentación—, así que abrirlo es **cambiar esa línea y nada más**.

⚠️ **Y no es solo esconder botones:**
- `/letras` **lo comprueba en el SERVIDOR** y redirige. Esconder el botón del menú no es un
  permiso — es **L-87 `[PART]`**, que aquí ya se pagó con el botón de «desactivar usuario».
- **La letra ni siquiera sale del servidor** para quien no debe verla: las dos pantallas de
  presentación solo la piden y la pasan si el rol la ve. No es que el botón no aparezca; **el texto
  no viaja**.

**Probado por las dos caras**, aprovechando que Isaac cambió el rol de la cuenta de prueba:
- **Con LECTOR:** `/letras` **307**, sin entrada en el menú, sin pestaña, sin botón.
- **Con ADMIN:** `/letras` **200**, entrada, pestaña y botón, los tres presentes.

#### Las 6 nuevas (dictadas el 2026-08-21, PROBANDO CON UNA CUENTA DE LECTOR)

📌 **Isaac las sacó todas de una sola sesión con la cuenta en LECTOR.** Es la primera vez que
prueba la página como la ve un músico, y salieron **seis cosas que desde el admin no se ven**.
→ **Probar con el rol del usuario final encuentra en diez minutos lo que no encuentra ninguna
comprobación desde la cuenta que lo tiene todo.**

**O-30 · A pantalla completa NO salen los diagramas del acorde.** 🔴 **Fallo, y de los que
importan: la pantalla completa es LA pantalla del culto.**
→ **Causa encontrada:** el desplegable se dibuja con un **portal a `document.body`** (fase I),
y la pantalla completa de verdad —la del navegador— **solo enseña el subárbol del elemento al que
se le pidió**. El panel se pinta **fuera de ese subárbol**, así que existe y es invisible.
→ **Arreglo:** el portal va a `document.fullscreenElement ?? document.body`.

**O-31 · Los cultos tienen ESTADO, igual que las canciones.** ✅ **RESPONDIDA por Isaac el
2026-08-21**, y su respuesta cierra la duda de las tres lecturas que había aquí:

> *«que sea como las canciones, que yo puedo crear una, pero por ejemplo si está en archivado o
> borrador que no lo pueda ver ni el lector ni el músico, solamente el admin, y ya si está
> público que lo puedan ver los otros dos roles»*

→ Es decir, **NO es «activar/desactivar»** (dos estados) ni es «apagar el enlace público» —eso ya
existe y es otra cosa (`is_public`, migración 013)—. Son **los mismos tres estados de las
canciones**: `draft` · `published` · `archived`.

| | admin | musician | viewer | sin cuenta (enlace `/s/<token>`) |
|---|---|---|---|---|
| `published` | ve | **ve** | **ve** | ve, si además `is_public` |
| `draft` / `archived` | ve | **no** | **no** | **no** |

⚠️ **Necesita MIGRACIÓN**: la tabla `services` (`20240012:23-32`) **no tiene ninguna columna para
eso** — solo `name`, `service_type`, `service_date`, `notes`, `is_public`, `public_token` y las de
auditoría. Toca la base de producción → **OK expreso de Isaac** (D-04) y **copia previa**.

#### D-23 · El estado del culto reutiliza el enum `sheet_status`, no se crea uno nuevo

Los tres valores son **los mismos tres** y significan lo mismo. Un `service_status` paralelo sería
un segundo sitio que mantener, y el día que se añada un cuarto estado habría que acordarse de
tocar los dos. El nombre del tipo dice «sheet» y el tipo lo usan dos tablas: **se prefiere eso a
tener dos enums que se separen** (es P-09 aplicado al esquema).

#### D-24 · Los cultos que YA existen nacen `published`, aunque el defecto de la columna sea `draft`

🔴 **Esto no es un detalle: es evitar T-07 otra vez.** Si la columna se añadiera con
`default 'draft'` y nada más, **los 3 cultos que hay en producción desaparecerían de golpe** para
músicos y lectores — sin error, sin aviso, igual que el catálogo vacío de los 3 minutos.
→ La migración añade la columna **y en la misma pasada pone `published` a todo lo que ya existía**.
El defecto `draft` solo afecta a los cultos **nuevos**, que es lo que Isaac pidió: los crea él y
los publica cuando estén armados.

#### D-25 · Se cierra también en la BASE, no solo escondiendo tarjetas

**L-87 `[PART]`: la interfaz no es un permiso.** Las canciones sí están protegidas en la base
(`sheets_select_viewer`, `20240004:98`), y Isaac pidió *«que sea como las canciones»*.
→ La política `services_select_all` (`20240012:64`, hoy `using (true)`) se sustituye por la misma
forma que la de canciones: `status = 'published' or created_by = auth.uid() or public.is_admin()`.
→ **Efecto secundario bueno:** un culto en borrador **deja de ser legible con la clave pública**,
que es media P-02.
→ ⚠️ **Efecto secundario que hay que saber:** `npm run export` con la clave pública **se dejará
los cultos en borrador**, igual que ya se deja las canciones en borrador. **La copia hay que
hacerla con la sesión de administrador** (`SUPABASE_ACCESS_TOKEN`), que ya lo admite desde r40.

#### El plan de O-31, por subfases

| Sub | Qué | Estado |
|---|---|---|
| **K.1** | **El código primero**, y que tolere que la columna todavía no exista: un culto **sin `status` se trata como `published`** (T-07) | ✅ **HECHO y comprobado** |
| **K.2** | **Migración `20240017`**: columna + relleno de los existentes + política nueva | ⬜ **ESCRITA, SIN EJECUTAR.** Espera el OK expreso de Isaac (D-04) |
| **K.3** | **El control en el editor** (solo admin) y la **etiqueta en la tarjeta** (solo admin, como O-32) | ✅ **HECHO** |

**Sin fila de filtro por estado en la lista de cultos, y es a propósito.** El plan escrito decía
«igual que O-28 en el catálogo», y al hacerlo se vio que no es igual: en el catálogo hay **75
canciones** y buscar los borradores a ojo era el trabajo que O-28 ahorraba; en cultos hay **3**, y
los que no están publicados ya se distinguen por su etiqueta. Una fila de filtros para tres
tarjetas es ruido. **Se añade el día que haya cultos de sobra**, no antes.

#### Cómo quedó montado

| Archivo | Qué |
|---|---|
| `src/lib/cultos.ts` **(nuevo)** | `estadoDe` y `puedeVerCulto`, **la regla en un solo sitio**. Los cuatro llamantes miran aquí |
| `services/page.tsx` | Filtra la lista y pinta la etiqueta **solo al admin** |
| `services/[id]/page.tsx` | **Redirige** al que no puede verlo, aunque escriba la dirección a mano |
| `services/[id]/present/page.tsx` | Lo mismo, y su `select` pasó a `*` para que entre `status` cuando exista |
| `services/actions.ts` | `setServiceStatusAction`, **aparte del botón de Guardar** |
| `EstadoCulto.tsx` **(nuevo)** | Los tres botones + **qué significa cada estado en la práctica** |
| `20240017_service_status.sql` | Columna + relleno + política. **Sin ejecutar** |

**Lo que NO hizo falta tocar, y conviene saber por qué:** `/s/<token>` (el enlace público) y
`/imprimir/culto/[id]` **no llevan ni una línea nueva**. En cuanto la política del paso 3 esté
aplicada, la base deja de devolverles un culto que no esté publicado, y las dos páginas ya
responden `notFound()` cuando no hay fila. **El permiso está en la capa que toca**, y no hay dos
sitios que se puedan separar con el tiempo.

#### Comprobado (2026-08-21, con la base TODAVÍA SIN la columna)

Y eso es justo lo que había que comprobar: **producción va a estar así** entre el push y la
migración.

- **`/services` como admin → 200 y los 3 cultos**, sin ninguna etiqueta de estado. Correcto: sin
  columna, `estadoDe` los cuenta publicados. **Si esto fallara, los músicos se habrían quedado
  sin cultos** — es T-07 evitada, medida.
- **El detalle del culto → 200**, con los tres botones y «Publicado: lo ven los músicos y los
  lectores» debajo.
- **La presentación del culto → 200.**
- **Arnés `scratchpad/cultos.mjs`, 10 de 10 casos**, sacando la lógica del `.ts` real: las seis
  casillas de la tabla de Isaac, más los cuatro casos de «la columna todavía no está»
  (`{}`, `null`, valor raro, culto nulo) → **los cuatro se ven, ninguno revienta**.
- **`comentarios.mjs` sobre las 5 páginas tocadas: 0 con comentarios a la vista.**
- **`npm run verificar`: compila limpio**, 19 rutas.

⬜ **Lo que NO se ha podido comprobar aquí, y es la mitad del encargo:** que un **lector o músico
de verdad** no vea un culto en borrador. La cuenta de prueba está en **admin** (D-14), y sin la
columna no hay ningún culto en borrador que probar. → **Se comprueba después de la migración**,
y hay una forma que no necesita segunda cuenta: **consultar `services` con la clave pública**
(sin sesión, que es el caso más estricto) y contar. Es lo mismo que se midió para P-02.

#### Copia de seguridad hecha antes de proponer la migración

`_RESPALDOS\Partituras-datos-2026-08-22\` — **3 cultos y 17 filas de repertorio**, que es
**exactamente lo que esta migración puede estropear**. Las 8 canciones en borrador no van (falta
la `service_role`, §12.2), pero **la migración 017 no toca `sheets`**; para eso sigue valiendo la
copia completa del 2026-08-21-17h49h42.

**O-32 · La etiqueta de estado (PUBLICADA / BORRADOR / ARCHIVADO) solo para el admin.**
A un lector o a un músico no le dice nada —él solo ve lo publicado— y le mete ruido en cada
tarjeta. Es lo mismo que O-28 con el filtro: **el estado es cosa de quien administra**.

**O-33 · Desde un culto, «la siguiente canción» enseña TODO el catálogo, no el repertorio.**
🔴 **Fallo, y muy visible tocando:** se abre el culto → una canción → pantalla completa, y las
flechas recorren las 75 canciones en vez de las 7 del culto. En mitad de un servicio eso es
justo lo contrario de lo que hace falta.
→ **Causa:** desde `ServiceEditor` la canción se abre con `/catalog/<id>` **a secas**
(`ServiceEditor.tsx:394`), sin decir de dónde viene. La vista y la pantalla completa solo saben
del filtro del catálogo (D-15), y sin nada, cogen el catálogo entero.

**O-34 · El botón «atrás» del navegador vuelve al catálogo, no al culto.**
Es la otra cara de O-33: como se entró por `/catalog/<id>`, el «volver» de la propia página
lleva al catálogo. **Se arregla con lo mismo**: que la canción sepa que viene de un culto.

**O-35 · Las tarjetas del catálogo desaprovechan el espacio.**
Sobra hueco dentro de cada tarjeta. Se ajusta el alto y el reparto para que quepan más de un
vistazo, sin quitar información.

**O-36 · Desde el editor del culto, el admin tampoco puede abrir una canción.** ✅ **HECHO.**
Isaac, 2026-08-21, probando O-33/O-34: *«fíjate que yo como admin no me permite darle clic a
cualquier canción que esté en la lista para que me lleve a modo vista como los otros roles, ni en
pc ni en teléfono»*.

**Tenía razón, y no es un fallo de O-33: es un hueco que venía de antes.** El culto se dibuja con
**dos listas distintas** en el mismo componente:

| Rol | Cómo se ve el repertorio | ¿Se puede pulsar? |
|---|---|---|
| lector · músico | tarjetas de solo lectura (`ServiceEditor.tsx:411`) | **sí**, enlace a la canción |
| **admin** | filas de editor: selector de tono, subir, bajar, quitar (`:620`) | **no** — el título era texto suelto |

→ O-33 y O-34 arreglaron el enlace **de la lista del lector**, que es la que se estaba mirando.
La del admin nunca lo tuvo, así que el único que **no** podía abrir una canción desde su culto era
justo el que más entra ahí.

📌 **Y es la segunda vez en dos días que el fallo está en «la otra copia de la misma lista»** —la
primera fue «Letras», que salía en el ordenador y no en el teléfono porque la barra de navegación
estaba escrita dos veces (P-09, lo arregló `lib/navegacion.ts`). **Aquí las dos listas se quedan**:
no son lo mismo —una edita y la otra no—, pero **lo que sí tiene que ser igual es el enlace**.

**Cómo se hizo, y los tres cuidados que hacían falta:**
1. **Enlace SOLO en el bloque del texto** (título, categoría, compositor), **no en la fila entera**:
   dentro hay un `<select>` y tres botones, y un enlace envolviéndolos se comería sus clics.
2. **Lleva `?culto=<id>`**, igual que la lista del lector, para que las flechas recorran **el
   repertorio y no las 75 canciones**, y el «volver» apunte al culto (O-33, O-34).
3. **Los cambios sin guardar quedan protegidos solos, y esto conviene saberlo:** el editor ya
   intercepta **cualquier clic en un `<a>`** cuando hay cambios pendientes (`:214-232`) y saca el
   diálogo de guardar/descartar. Al ser un `<Link>` de verdad, el enlace nuevo **entra en esa red
   sin escribir una línea**. Si se hubiera hecho con un `onClick` + `router.push`, se habría
   saltado el aviso y **se perderían los cambios en silencio**.
4. **En un culto que todavía no se ha guardado no hay enlace**, a propósito: `service` es `null`,
   así que no hay culto al que volver ni repertorio guardado que recorrer.

**Comprobado con datos reales (2026-08-21), en el culto de 8 canciones:**
**8 filas → 8 enlaces** con su `?culto=`, y **los 8 tríos de botones intactos**. Abriendo una desde
ahí, las vecinas son **`22e71fb0` y `2b94850f`** —las dos del repertorio— y el botón dice **«Volver
al culto»**; la MISMA canción abierta sin culto trae **`10f0c130` y `23640b82`**, que son sus
vecinas alfabéticas del catálogo, y dice **«Volver al catalogo»**.


**O-37 · Ordenar el repertorio ARRASTRANDO, y fuera los botones de subir y bajar.**
Isaac, 2026-08-21: *«quiero quitar los botones de subir y bajar las canciones que sirven para
cambiar el orden de la lista y que tenga para poder arrastrar, no quiero esos botones más, con el
arrastre es más fácil»*.
→ **Los botones se van.** No se quedan «por si acaso»: lo dijo dos veces en la misma frase.

🔴 **LA DECISIÓN TÉCNICA QUE DECIDE SI ESTO FUNCIONA O NO: se hace con `PointerEvent`, NO con el
arrastrar-y-soltar de HTML5** (`draggable` + `dragstart` + `drop`).

Y no es una preferencia de estilo — es que **el de HTML5 no funciona con el dedo.** En un móvil,
`draggable` no dispara nada: el navegador se queda con el gesto para hacer scroll o para el
menú de copiar. Sería exactamente el fallo que Isaac ya cazó dos veces —**funciona en el PC y no
en el teléfono**—, y él arma los cultos desde el móvil. `PointerEvent` es un solo camino para
ratón, dedo y lápiz.

**Lo que hace falta para que el dedo arrastre de verdad, y las tres se olvidan:**
1. **`touch-action: none` en el asa.** Sin esto el navegador se queda el gesto para hacer scroll
   y la fila no se mueve: el dedo baja y lo que baja es la página.
2. **`setPointerCapture`.** Sin esto, en cuanto el dedo se sale del asa —que mide 28 píxeles— se
   deja de recibir el movimiento y el arrastre se corta a mitad.
3. **`pointercancel`**, no solo `pointerup`: una llamada entrante o un gesto del sistema cancelan
   el puntero sin soltarlo, y sin escucharlo la fila se quedaría pegada al dedo para siempre.

**Se reordena EN VIVO** —la lista se recoloca mientras se arrastra, no al soltar—: es lo que se
espera hoy, y de paso evita tener que dibujar una fila fantasma flotando.

**Y el orden nuevo es `splice`, no un intercambio.** El `move` de los botones **intercambiaba**
dos filas, que es lo correcto para «sube una», pero al arrastrar la 1 hasta la 5 dejaría la 5 en
el sitio 1. Arrastrar es **sacar la fila e insertarla donde está el dedo**, y las de en medio
corren un puesto.

**Sin librería nueva.** Son unas 30 líneas; una dependencia de arrastrar-y-soltar trae su propio
peso y su propia forma de romperse.

**Se conserva el teclado, sin devolver los botones:** el asa recibe el foco y **↑ / ↓ mueven la
fila**. Quien no pueda arrastrar sigue pudiendo ordenar, y en pantalla no aparece ningún botón
más — que es lo que él pidió.

**Comprobado en la pantalla real (2026-08-21):** **0 botones de «Subir» y «Bajar»** · **8 asas**,
una por canción · **8 `touch-none`** · y lo demás **sin tocar**: 8 botones de quitar, 8 enlaces a
la canción y el selector de tono con sus grupos. Compila limpio y el arnés de comentarios da 0.

⬜ **Lo que NO se puede comprobar desde aquí, y es justo el gesto:** que la fila siga al dedo. El
arrastre lo pinta el navegador y **no deja rastro en el HTML**, así que **hay que probarlo con la
mano — y sobre todo en el teléfono**, que es el motivo de haberlo hecho con `PointerEvent`. Es el
mismo punto ciego que el botón de WhatsApp y el `<select>` en modo oscuro (T-12).

📌 **Un detalle que no cambia:** arrastrar deja el culto **con cambios sin guardar**, igual que
hacían los botones. Hay que darle a «Guardar», y si se sale antes sigue saliendo el aviso.


**O-38 · `/novedades` soltaba todo abierto de golpe: mapa arriba y secciones plegables.**
✅ **HECHO.** Isaac, 2026-08-21, **leyendo la página ya publicada**: *«creo que el orden mejor sería
mencionar los cambios por secciones y que de ahí se desglosen los demás… lo digo como para que haya
un orden en la que el grupo cuando lea esto lo pueda entender bien, porque soy yo y veo que hay
algunos enredos»*.

📌 **Y lo dejó a mi criterio** —*«en esta permito, si crees que no es buena idea lo puedes
omitir»*—. **Se hizo igualmente, y el motivo es él mismo:** si el que escribió los cambios se
enreda leyéndolos, un músico que no sabe qué se tocó se enreda más. **Es el mejor lector de prueba
que tiene el proyecto.**

**El problema, medido:** la página pintaba **5 secciones y ~28 cambios abiertos a la vez**, cada
uno con uno o dos párrafos. En un teléfono eso es un muro de texto sin forma: no se ve cuánto hay,
ni por dónde empezar, ni qué te importa.

**Lo que se hizo, dos cosas:**
1. **Un mapa arriba** — las secciones con **cuántos cambios** trae cada una y **una línea de qué vas
   a encontrar**. Campo `resumen` nuevo en `Seccion`. Sin esa línea sería una lista de títulos que
   no dice si merece la pena entrar.
2. **Cada sección se despliega**, con `<details>` de HTML. **Ni una línea de JavaScript**: funciona
   con el dedo, sin cuenta, y si algo fallara **el texto sigue estando ahí** — de hecho sigue
   entero en el HTML, solo plegado.

🔴 **La primera sección va ABIERTA a propósito.** Con todo cerrado, quien entra por el enlace de
WhatsApp vería cinco rayas y pensaría que la página está vacía — que es justo el fallo que ya se
pagó una vez con el enlace de Claude (O-29): **parecía que funcionaba y para el que no tenía cuenta
no había nada**.

**Comprobado:** los 5 `<details>`, **solo el primero con `open`** · el mapa con sus 5 resúmenes ·
y el texto de la tanda **sigue completo en el HTML**, no se perdió nada al plegar.

#### 🔴 Tercera corrección suya: la tabla tachaba el dato bueno

Isaac, 2026-08-22, mirando la tabla de la trompeta: la columna **«TÚ LEES»** salía **tachada y
apagada** — justo el dato por el que existe esa tabla.

*Causa:* el dibujo de la tabla tachaba **la columna del medio, por POSICIÓN**, porque las tres
tablas que había hasta entonces eran de tipo «antes / ahora» y ahí la del medio **es** lo viejo.
En cuanto llegó una tabla de datos normales —«la canción va en · tú lees · cuántas hay»—, el estilo
siguió aplicándose y **tachó lo importante**.

*Cómo se resuelve:* **tachar pasa a pedirse**, con `comparativa: true` en la tabla. Y el valor por
defecto es **no tachar**: un efecto especial tiene que ser explícito, para que la siguiente tabla
que alguien añada **no salga rara por sorpresa**. Las dos comparativas que había se marcaron.

📌 **La lección, que vale para cualquier tabla o lista:** **un estilo que se aplica por la POSICIÓN
del dato es una bomba de relojería.** Funciona mientras todos los datos tengan la misma forma, y
miente el día que llega uno distinto — sin error, sin aviso, solo un dato tachado que no debía
estarlo. El estilo tiene que depender de **lo que el dato significa**, no de dónde cae.

**Comprobado:** quedan **5 celdas tachadas** y son exactamente las que deben —`Dbm`, `Gbm7`,
`Ab/C`, `A# · D · F` y `G · A# · D`—; la tabla de la trompeta, limpia.

#### 🔴 Y una segunda corrección suya, el 2026-08-22: las tandas mentían de fecha

Isaac: *«como pusiste los cambios de hoy y ayer, ten en cuenta que los cambios que se mencionan de
ayer en realidad una parte son del 20 de agosto… sería bueno que se muestre bien, así como es el
archivo de cambios en el GitHub»*.

**Tenía razón, y él mismo dio la referencia:** `CAMBIOS.md` **ya estaba bien partido** por días —
22, 21 y 20 — mientras que `/novedades` tenía **una sola tanda del 21** con dentro todo lo del 20.
Al haber sacado la del 22, la del 21 se quedó llevando dos días de trabajo.

**Cómo se hizo, y esto importa más que el resultado:** no se cortó y pegó texto a mano. Se
**cargó el contenido real ya compilado**, se repartió **por título** según lo que dice `CAMBIOS.md`,
se regeneró el archivo, y **se contó antes y después**:

| | |
|---|---|
| Cambios antes de repartir | **35** |
| Cambios después | **35** |
| **22 de agosto** | 2 secciones · **4** cambios |
| **21 de agosto** | 3 secciones · **9** |
| **20 de agosto** | 5 secciones · **22** |

📌 **Repartir texto a mano pierde cosas y no se nota.** Contar las dos veces es lo que convierte
«creo que están todos» en «están los 35».

→ **Y un ajuste que salió de ahí:** con tres tandas se abrían **tres** secciones (la primera de
cada una), y la página volvía a ser larga — justo lo que O-38 vino a arreglar. Ahora **solo se abre
la primera sección del día más reciente**.

**O-39 · En la tarjeta del culto tienen que salir LOS TRES estados, «Publicado» incluido.**
✅ **HECHO.** Isaac, 2026-08-21, viendo la pantalla ya con un borrador y un archivado:

> *«solo pal admin le sale si está publicada, archivada o en borrador las canciones, y le sale
> cualquiera de esos estados en la tarjeta de cada canción; así mismo en las tarjetas de culto
> salga para el publicado, porque sale el archivado y el borrador»*

🔴 **Corrige una decisión mía, y tiene razón.** Yo había escondido la etiqueta de «Publicado» en
los cultos —`estadoDe(s) !== "published"`— pensando en no meter ruido: si casi todos van a estar
publicados, la etiqueta se repite en todas y no informa.
**Pero eso rompía la coherencia con las canciones**, donde sí salen los tres (O-32), y sobre todo:
**un hueco vacío no dice «está publicado», dice «no sé».** Quien administra mira la tarjeta para
saber en qué estado está, y la ausencia de etiqueta obliga a deducirlo. → **Salen los tres.**

📌 **Es el mismo patrón que ya salió con el modo letra:** una decisión mía de «quitar ruido» que
**le quitaba información al usuario**. La diferencia entre las dos pantallas no la vi yo, la vio él
mirándolas juntas.

**Comprobado:** como admin, las tres tarjetas enseñan **una etiqueta cada una** —Publicado,
Borrador y Archivado— y siguen saliendo los 3 cultos.

**O-40 · Al salir de pantalla completa, quedarse en la canción en la que estabas.**
Isaac, 2026-08-21: *«si la primera canción fue "x", y en la pantalla quedamos en la canción "y",
cuando le demos para salir del modo pantalla que nos deje en el modo vista de la canción "y"»*.
→ Hoy la **X** va a un `backHref` **fijo**, el de la canción por la que se entró
(`catalog/[id]/present/page.tsx:91`). Si pasaste tres canciones, salir te devuelve tres atrás — y
además **se pierde por dónde ibas**, que en mitad de un culto es lo peor que puede pasar.
→ **Solo afecta a la pantalla completa DE UNA CANCIÓN.** Entrando por «Presentar» desde el culto,
la X vuelve al culto y eso está bien: ahí no entraste por una canción concreta.
→ ⚠️ **La plantilla del enlace se pasa como DATOS, no como función:** `PresentationView` es
componente de cliente y quien lo monta es de servidor, así que una función no se puede pasar
—no es serializable—. Se pasa `{ base, sufijo }` y el componente arma la dirección con el id de
la canción que se está viendo.

**O-41 · El desplegable del acorde no puede pasar por debajo del panel de abajo.**
Isaac, 2026-08-21, con dos capturas —una del teléfono y otra del PC con la ventana a media
pantalla—: *«que cuando se le dé al acorde no salga por encima del panel de abajo, o mejor dicho,
que no baje más del margen del panel de abajo, para que se vea bien, ya que con el zoom y el modo
claro y oscuro que sale para teléfono ya ahí no se puede hacer más nada»*.
→ **Causa:** el desplegable se coloca contra el **alto de la ventana** (`vh`), y ahí abajo hay dos
cosas que no son la ventana: la **barra de navegación del móvil** y el **control flotante de
lectura** (el del `90%` y el sol). El panel les cae encima y tapa unos botones que **ya no se
pueden usar**.
→ **Arreglo:** el suelo deja de ser `vh` y pasa a ser **lo más alto de lo que haya pegado abajo**,
medido en el momento. Las dos barras se marcan con `data-suelo` y el desplegable las mide; si no
hay ninguna —pantalla completa, PDF—, el suelo vuelve a ser la ventana.
📌 **Por qué medirlo y no restar un número fijo:** la barra del móvil no está en el ordenador, el
control flotante no está en pantalla completa, y el `safe-area` del iPhone cambia la altura. Un
número a ojo acierta en una pantalla y falla en las otras tres.

**O-42 · El desplegable enseña UN instrumento, con pestañas — y se acuerda de cuál elegiste.**
Idea del **hermano de Isaac**: *«sería mejor que cuando se le dé a un acorde salgan primero el
instrumento, para luego darle clic a uno de esos y salga el diagrama de ese instrumento
solamente»*. Isaac la trasladó **sin comprársela** —*«a mí no me suena mucho la verdad… pero si tú
ves que es mejor, hazlo como veas conveniente»*— y la dejó a mi criterio.

**Se hizo, pero NI COMO LO PIDIÓ EL HERMANO NI DEJÁNDOLO COMO ESTABA. Los dos tienen razón en una
mitad:**

| Quién | En qué acierta | Qué falla en su propuesta |
|---|---|---|
| **El hermano** | Sobra información: **un músico toca UN instrumento**. El guitarrista no necesita ver el piano nunca | Elegir **cada vez** son dos toques por acorde, y un acorde se mira docenas de veces en un culto |
| **Isaac** | Que no estorbe un paso extra | Dejarlo como está sigue enseñándole tres diagramas a quien usa uno |

→ **La respuesta es la tercera: PESTAÑAS con MEMORIA.** Piano · Bajo · Guitarra arriba, **se ve
uno**, y **la elección se guarda en el navegador de cada músico** (`localStorage`). El guitarrista
la pone una vez y a partir de ahí **pulsa un acorde y ve la guitarra, directamente, siempre** — sin
el paso extra que temía Isaac y sin el ruido que señalaba su hermano.
→ **No es un invento para este caso:** es exactamente lo que ya hacen el tamaño de letra (D-09b) y
el modo de recorrer las columnas (O-26). **Preferencia de quien lee, guardada por aparato, sin
migración.**
→ 🔴 **Y arregla O-41 de raíz, que es lo que decide la cuestión:** el panel pasa de **tres
diagramas apilados a uno**. Lo que se salía de la pantalla era el alto acumulado. Con esto la
mitad del problema desaparece en vez de acotarse.

#### Comprobado de O-40 / O-41 / O-42 (2026-08-21)

- **Compila limpio** y el arnes de comentarios da **0 de 3 paginas** — que hacia falta, porque al
  marcar la barra del movil **se coló un `//` en zona JSX**, el fallo exacto de la tanda 29. Se vio
  y se corrigio antes de seguir: el comentario se subio por encima del `return (`.
- **Las dos barras quedan marcadas** con `data-suelo`: la de navegacion del movil y el control
  flotante de lectura.
- **La pantalla completa desde un culto sigue en pie** (200) y la X arranca apuntando a la cancion
  por la que se entro. **La presentacion del culto no se toco**: su X sigue volviendo al culto.

⬜ **Punto ciego, y hay que decirlo: las tres cosas se ven SOLO en el navegador.**
- **O-40** solo se distingue **pasando canciones**: al arrancar, la direccion nueva y la vieja
  coinciden, asi que el HTML del servidor no las separa.
- **O-42** el desplegable **no existe hasta que se pulsa un acorde**, asi que ni las pestañas ni la
  memoria salen en el HTML.
- **O-41** la altura depende de lo que mida cada pantalla.
→ **Lo prueba Isaac**, que es de donde salieron: pasar tres canciones y salir, pulsar un acorde
abajo del todo en el telefono, y cambiar de pestaña y volver a entrar para ver si se acuerda.

**O-43 · Pasar de canción NO puede sacarte de la pestaña en la que estás.** ✅ **HECHO.**
Isaac, 2026-08-22, **escribiendo letras**: *«cuando estoy en el modo letra colocando la letra a una
canción y le doy al botón siguiente o reversa para pasar de canción, me manda al modo vista de la
canción; arréglalo para todos los modos, y todas las canciones y secciones»*.

**Es el mismo fallo que la tanda 32 arregló en la PANTALLA COMPLETA, ahora en la vista.** Y allí
bastó con no reiniciar el estado, porque no se cambia de página; aquí **sí se cambia**, así que
había que llevarse el modo a la dirección.

*Cómo se resuelve:* el modo viaja en `?ver=`, **igual que ya viajan el filtro del catálogo y
`?culto=`**. Es el patrón que el proyecto ya usa para «por dónde vas», y de propina sobrevive a
recargar y al botón «atrás».
→ Vale para los **tres modos** (`view` · `edit` · `letra`), en los botones **y** en las flechas del
teclado, y **convive con el culto**: `?culto=…&ver=letra`.

#### 🔴 Y al mirarlo salieron DOS fallos peores que el que pidió

**① Escribir una letra y pulsar «siguiente» la perdía SIN AVISAR.**
El editor tiene un diálogo de «guardar o descartar» al salir con cambios… pero solo miraba
`mode !== "edit"`. **En modo letra no se activaba.** O sea: se escribe una estrofa, se pulsa la
flecha, y el texto se va sin decir nada.
→ 🔴 **Esto le podía estar costando trabajo AHORA MISMO**, que es justo cuando está tecleando las
75 letras. Corregido: el aviso cubre **edición y letra**.

**② «Descartar» descartaba todo MENOS la letra.**
`restoreSnapshot` devolvía título, autor, tono, compás, categorías, estado y acordes… **y no la
letra**, aunque la letra sí entra en el `snapshot` que decide si hay cambios. Así que el diálogo
decía «se descartaron los cambios» **y el texto seguía modificado**. Corregido.

📌 **Los dos son de la misma familia y por eso salieron juntos:** el modo «letra» se añadió en la
fase J **después** de que el editor ya tuviera su red de seguridad, y **la red no se extendió al
modo nuevo**. Cuando se añade un modo a una pantalla que ya protege datos, hay que **repasar qué
protecciones se quedaron mirando solo al modo viejo**.

**Comprobado (2026-08-22), con datos reales:**

| Situación | Los vecinos apuntan a |
|---|---|
| Modo vista | `/catalog/<id>` — **sin `ver=`**, como antes |
| Modo letra | `/catalog/<id>?ver=letra` |
| Modo edición | `/catalog/<id>?ver=edit` |
| Desde un culto **y** en letra | `/catalog/<id>?culto=…&ver=letra` — **los dos** |
| Desde la sección «Letras» | las tarjetas ya llevaban `?ver=letra`, y ahora **se conserva al pasar** |

Compila limpio · 128 pruebas verdes · arnés de comentarios 0 de 2.

**O-44 · Al crear una canción, la vista previa no partía por secciones.** ✅ **HECHO.**
Isaac, 2026-08-28, con una captura de `/sheets/new`: *«cuando estoy agregando una nueva canción,
no salen las secciones como deben ser; ya funciona cuando la canción ya se subió y voy a hacer
alguna modificación en el modo edición… arréglalo para que funcione tanto cuando se agregue una
nueva canción como cuando se edite una que ya exista»*.

**Lo que se veía en su captura:** la vista previa pintaba **la canción entera en una sola
cuadrícula**, con las etiquetas `[Intro Drum ...]`, `[A Rock]`, `[B ...]`, `[Puente]` y `[Final]`
**dibujadas dentro de la rejilla como si fueran acordes** — en vez de partir la canción en
secciones con su título encima, que es como se ve una vez guardada.

*Causa, una línea:* `sheets/new/page.tsx:346` pintaba `<TablaturePreview notes={tabNotes} />` con
**todo el texto de golpe**. El editor de una canción existente sí hace
`parseSections(content).map(...)` con `label` y `compact` (`SongDetailEditor.tsx:820`).

🔴 **Y la causa de fondo es P-09, que llevaba anotado desde el primer día:** `parseSections` estaba
**escrito dos veces** —en `lib/sections.ts` y dentro de `SongDetailEditor`—, así que la pantalla de
crear **no tenía una función común que usar**: o copiaba una tercera vez, o se quedaba sin
secciones. Se quedó sin secciones.

*Cómo se resuelve:* las **tres** pantallas pasan a usar `lib/sections.ts`.
→ **Comprobado antes de tocar que las dos copias eran idénticas**, línea por línea: solo cambiaba
el nombre de una variable (`currentSection` / `current`). Así que unificar **no cambia el
comportamiento de nadie** — que era el riesgo.
→ **P-09 queda CERRADO.** Era la tercera vez que muerde en este proyecto: primero la consulta del
catálogo (fase G), luego la lista de secciones del panel (`lib/navegacion.ts`), y ahora esta.

📌 **Y el patrón, que ya es una constante aquí:** *dos copias de la misma lógica no fallan el día
que se escriben; fallan el día que aparece una tercera pantalla y no sabe a cuál de las dos
llamar.*

**O-45 · El campo de la letra no crece solo.** ✅ **HECHO.**
Isaac, el mismo día: *«en la sección de letras, cuando estoy agregando la letra a una canción no
se va acomodando como lo hace cuando agrego una canción; tengo que extender la parte de abajo
para que me salga toda la letra»*.

*Causa:* `LetraPanel` usa un `<textarea>` normal con `min-h-[55vh]`. El editor de acordes usa
**`AutoTextarea`**, que ya existe en el proyecto (`components/ui/AutoTextarea.tsx`) y crece con el
texto, sin barra de desplazamiento interna ni tirador.
→ **Se cambia por `AutoTextarea`.** No hay que escribir nada nuevo: la pieza ya estaba, solo que
esta pantalla —que se hizo después, en la fase J— no la usó.

📌 **Es el mismo patrón que O-43:** la pantalla de letras se añadió **después** de que el editor ya
tuviera sus comodidades, y **no heredó ninguna**. Primero fue la red de cambios sin guardar, ahora
el campo que crece. → **Al añadir una pantalla parecida a otra, hay que repasar qué se quedó
atrás** — no solo lo que falla, también lo que estorba.

#### Comprobado (2026-08-28)

- **11 pruebas nuevas** (`pruebas/secciones.test.mjs`), total **139**. Entre ellas, **la canción
  exacta de la captura de Isaac**: sale en **6 secciones** —Intro Drum, A Rock, B, la vacía,
  Puente y Final— en vez de una sola, cada una con su título y sus acordes dentro.
- **P-09 cerrado, medido:** queda **una sola** definición de `parseSections` y la usan **siete**
  archivos.
- **El campo de la letra ya es `AutoTextarea`**: se sirve con `overflow:hidden` y `resize:none`,
  que es lo que hace que crezca en vez de pedir que lo estires.
- Compila limpio y **139 pruebas verdes**.

#### Y la prueba cazó algo al escribirla

`parseSections("")` **no devuelve una lista vacía**: devuelve **una sección con un espacio**. En la
pantalla de crear eso pintaba **una cuadrícula vacía nada más abrirla**, antes de escribir nada.

→ **Se arregló en la pantalla, no en `parseSections`.** La función la usan siete pantallas y su
contrato lleva meses así; cambiarlo **justo al unificarla** habría sido mover dos cosas a la vez, y
si algo se rompía no se sabría cuál fue. La pantalla de crear **filtra lo que no tiene ni título ni
contenido**, y la prueba **documenta el contrato real** en vez de esconderlo.
📌 Queda escrito para el día que alguien quiera limpiarlo: **es un cambio de una línea, pero hay
que pasar por las siete pantallas antes.**

**O-46 · Escribiendo la letra, la pantalla saltaba arriba del todo.** ✅ **HECHO.**
Isaac, 2026-08-28: *«cuando estoy escribiendo la letra sí se desplaza el texto, pero hay veces que
se mueve la pantalla y me sube a lo más arriba»*.

🔴 **Lo causé yo el día anterior, con O-45.** El campo que crece mide el texto **colapsándose un
instante** (`height: auto`) para leer su `scrollHeight`. En ese instante la página se encoge, y si
el campo ya era más alto que la pantalla, **el navegador reajusta el scroll y sube al principio**.

📌 **Y ahí está el «a veces» que él describió, que era la pista:** solo pasa **cuando el campo ya no
cabe entero**. O sea, **cuanto más llevas escrito, más te salta** — justo cuando peor viene. Un
fallo que empeora con el uso es de los que hay que arreglar de raíz, no acotar.

*Cómo se resuelve:* se **guarda el scroll antes de colapsar y se devuelve después**, todo seguido,
así que el navegador no llega a pintar el estado colapsado y no se ve ningún parpadeo.

⚠️ **Y el detalle que lo hace funcionar aquí:** se devuelve el scroll de los **ANCESTROS**, no el de
la ventana. En el panel de esta app el `<main>` lleva `overflow-hidden` y **quien se desplaza es un
contenedor de dentro**; mirar solo `window.scrollY` no habría arreglado nada.

**Sale gratis en los dos sitios:** `AutoTextarea` lo usan la letra **y** el editor de acordes, así
que el editor deja de saltar también — allí pasaba menos porque los acordes ocupan menos.

⬜ **Hay que probarlo con los ojos:** el salto lo hace el navegador y **no deja rastro en el HTML**.
Escribe una letra larga, hasta que el campo pase de la pantalla, y sigue escribiendo.

**O-47 · El silencio de negra se dibuja como un «7», no como un zigzag.**
Isaac, 2026-08-29, con dos capturas —la de la pagina y la que quiere—: *«quiero que modifiques el
signo de silencio de negra que aparece en la pagina, y quiero que pongas este otro, porque la
verdad el signo de la pagina no tiene forma de silencio»*.

**Y tiene razon.** Lo que habia (`MusicFigures.tsx`, `RestFigure`) era un trazo en zigzag hecho con
curvas Bezier que **no se parece a ningun silencio real**: ni al de imprenta (𝄽) ni al manuscrito.
El que el manda es **el «7»**, que es como se escribe a mano y como lo reconoce cualquiera que
lea musica en papel.

📌 **Es el mismo caso que el `dim` → `°` (O-04) y que el «mundito gris» de `/novedades`:** el
usuario nombra y reconoce las cosas por como se ven de verdad, no por como estan implementadas.
Un simbolo que «casi» se parece **no vale**, porque se lee tocando y de un vistazo.

**Alcance medido antes de tocar:** hay **12 silencios de negra en 5 canciones** de las 75. No es un
caso raro, pero tampoco toca a todo el repertorio.

⚠️ **Se ve en TRES sitios y sale gratis en los tres:** la vista de la cancion, la pantalla completa
y el PDF del culto usan el mismo `RestFigure`.

#### 🔴 Segunda pasada: NO era un «7», es un «3» con la pata recta (2026-08-29)

Isaac, viendo el primer intento: *«esta un poco mejor el signo pero puede estarlo aun mas, no es
tanto un siete sino como un tres que la parte debajo va bajando recto»*.

→ **La forma correcta:** arriba, **las dos curvas de un 3**; y abajo, en vez de cerrar la segunda
curva, **una diagonal recta que baja**. Es el silencio de negra manuscrito de toda la vida.
→ Mi «7» tenia el travesaño recto arriba, y eso es justo lo que no es.

📌 **Y aclaro un malentendido que pudo costar caro:** las capturas que mando **estaban ampliadas a
proposito** —*«ahi se ven grande porque queria complementar»*— y el tamaño **ya estaba bien**:
*«que sean del tamaño del acorde obvio»*. **No se toca el tamaño**, solo la forma.

#### 🔴 Tercera pasada, y AQUI SE CAMBIA DE METODO (2026-08-29)

Isaac, con una imagen mas grande y clara: *«aun falta por mejorar el signo, copialo tal cual como
te lo voy a dar mejor, en esta imagen»*.

🔴 **Tres intentos describiendo un dibujo por escrito es la senal de que el metodo esta mal.**
Yo **no puedo ver** como queda: compila igual sea cual sea la forma, y ninguna comprobacion
automatica sabe si eso parece un silencio de negra. Cada pasada era yo adivinando y el corrigiendo.

→ **Se hace lo que ya funciono con los diagramas de acordes (fase I):** una **pagina desechable**
con VARIAS formas dibujadas, a su tamano real y ampliadas, y **el elige la que es**. Alli esa
pantalla ahorro cuatro rehechos —las octavas, el recorte del teclado, la mano izquierda y la
leyenda—, y esta escrito en §9.2-quater que salio mucho mas barato que integrar y deshacer.

⚠️ **La pagina se BORRA antes de publicar nada**, igual que `/acordes-prueba`. Nunca llega a
produccion.

**El estado del dibujo, para no perderlo:**
1. Zigzag de curvas Bezier — el original del primo. *«No tiene forma de silencio»*.
2. Un «7» con el travesano recto — *«no es tanto un siete»*.
3. Un «3» con la pata recta — *«aun falta por mejorar»*.
4. **Primera ronda de la pagina de prueba (A–E):** *«la que mas se acerca es la D, pero la C
   tampoco se aleja del signo de silencio»*.
   → **D** = el «3» con la pata recta (lo que hay publicado) · **C** = el de imprenta (𝄽).
   📌 **Y eso acota mucho:** las tres que descarto —A, B y E— eran las de **trazo recto arriba**,
   la familia del «7». Queda claro que **la parte de arriba va CURVA**, y lo que se afina ahora es
   cuanto y como baja la pata.
5. **Segunda ronda (D, D1, D2, D3, C1):** ✅ **«nos vamos con D2, ese se queda».**
   → **`D2` = las dos curvas del «3» BIEN MARCADAS arriba, y la pata recta bajando.** Frente a la
   D original, las panzas salen mas hacia la derecha, asi que el «3» se reconoce de un vistazo —
   que es lo unico que importa en algo que se lee tocando.
   → **Path final:** `M8 7.5 C 13.5 5.5, 17 8.5, 13 11.2 C 17.5 11.8, 17 15.5, 13.2 16.4 L 8.5 22`
   con grosor **2.4**.

#### ✅ O-47 CERRADA (2026-08-29), y lo que dejo el metodo

**Dos rondas y esta.** Frente a **tres intentos por descripcion escrita, los tres fallidos**.

📌 **La leccion, y ya es la segunda vez que este proyecto la aprende** —la primera fue
`/acordes-prueba` en la fase I—: **cuando lo que se discute es un DIBUJO, describirlo por escrito
no converge.** Yo no puedo verlo, compila igual sea cual sea la forma, y ninguna comprobacion
automatica sabe si eso parece un silencio de negra. **Se ensena, no se cuenta.**
→ **La senal de que hay que cambiar de metodo son DOS correcciones seguidas sobre lo mismo.** A la
tercera ya se ha gastado el triple de tiempo del que cuesta montar la pagina desechable.

**La pagina `/silencio-prueba` ya esta BORRADA**, y con ella su linea del middleware. Comprobado:
la carpeta no existe, **no aparece en las rutas del build**, y la direccion devuelve
**`307 → /login`**. Nunca llego a produccion — igual que `/acordes-prueba`.

**Comprobado con D2 puesta:** en «Sube La Alabanza» —la que mas silencios de negra tiene, 8 de los
12— el trazo nuevo llega, **el anterior ya no aparece**, y los **98 acordes** siguen igual.
**26 de 26 pantallas**, build 0, lint 0, 139 pruebas.

**Lo que SI esta cerrado y no se vuelve a preguntar:** el **tamano** es correcto
(*«que sean del tamano del acorde»*), y sus capturas salen grandes **solo para que se vea la
forma**.

**Comprobado (2026-08-29)** en «Sube La Alabanza», que es la que mas tiene (8 de los 12): el trazo
nuevo llega a la pagina, **el zigzag viejo ya no aparece**, y los **98 acordes** de la cancion
siguen dibujandose igual. Lo mismo en la pantalla completa.

**Las 5 canciones donde se ve:** Sube La Alabanza (8) · Es Por Fe · Renueva Mi Espiritu ·
Me Llamaste A Conquistar · Casa De Mi Padre.

⬜ **Y hay que mirarlo con los ojos, que es lo unico que decide:** es un dibujo. Compila igual sea
cual sea la forma, asi que **ninguna comprobacion automatica puede decir si se parece a un silencio
de negra**. Eso solo lo dice quien lee musica.

**O-48 · En la tarjeta del catalogo, que salgan las OTRAS tonalidades de la cancion.**
Isaac, 2026-08-29: *«quiero tambien que en las tarjetas salgan las versiones que tiene cada
cancion, que marque la original pero que tambien muestre que otras tonalidades tiene»*.

**Medido antes de tocar:** hay **7 versiones**, en **7 canciones de las 70** — una cada una.

| Cancion | Original | Ademas |
|---|---|---|
| No Hay Lugar Mas Alto | `F#` | `F` |
| Trae El Cielo Aqui | `F` | `B` |
| Si Dios Dice Que Si | `D` | `G` |
| Incompresible Amor | `G#m` | `F#m` |
| Nadie Robara Mi Gozo | `F` | `E` |
| Gozo Pegajoso | `Bb` | `G` |
| Amado de mi Alma | `E` | `C` |

→ **Hay que distinguir cual es la original**, que es lo que el pidio expresamente. Se marca con un
punto y la otra va mas apagada: sin eso, dos tonos sueltos en una tarjeta **no dicen cual manda**.

⚠️ **Toca `lib/catalogo.ts`, que es la consulta COMPARTIDA** por el catalogo, la seccion de letras
y la pantalla completa (D-21). Traer `sheet_keys` cuesta **7 filas** — nada—, pero hay que
comprobar que **las otras dos pantallas siguen igual**, que es el riesgo real de tocar algo
compartido.

#### ✅ Comprobado (2026-08-29): **7 de 7** en el catalogo real

Las siete canciones ensenan su tono original y, al lado, el otro en gris con un punto delante.
Y **26 de 26 pantallas**, asi que las otras dos que comparten la consulta siguen igual.

#### 🔴 Dos fallos MIOS por el camino, y los dos del mismo tipo

**① El bloque acabo DENTRO del tono original en vez de al lado.** El guion que lo inserto buscaba
la linea del cierre `)}`… y **`{formatKey(sheet.key_signature)}` contiene `)}`**, asi que inserto
en medio del `<span>`. En pantalla salia el punto pegado al tono original y sin su valor.
📌 **La leccion:** *buscar un fragmento tan corto que aparece dentro de otra cosa*. Al insertar
codigo por guion hay que anclarse en **la linea entera**, no en dos caracteres.

**② Mi propia PRUEBA dio tres 404 que no eran fallos.** `pantallas.mjs` cogia **el primer culto**
para las rutas `/s/<token>`, y ese dia habia aparecido uno nuevo —«Culto de Caballeros»— **con el
enlace publico apagado**. El 404 era **correcto**: es lo que tiene que pasar cuando el enlace esta
apagado.
🔴 **Y lo importante es lo que NO se hizo:** no se toco la pagina. Se midio primero de quien era el
fallo —los cultos, con la clave publica— y resulto ser **de la prueba**. → Arreglada: ahora pide
explicitamente un culto con `is_public=true`.
📌 **Una prueba que depende de «el primero que salga» miente el dia que cambian los datos**, y en
este proyecto los datos los cambia Isaac constantemente.

**O-49 · El DOBLE PUNTILLO, y los silencios que faltaban.**
Isaac, 2026-08-29: *«necesito que agregues el signo con doble puntillo, porque hay una cancion que
lo pide, tanto las semicorcheas, corcheas, negra, blanca, etc»*, y en el mismo momento:
*«tambien agrega la semicorchea que tambien la necesito»*.

**El doble puntillo alarga la figura la mitad MAS un cuarto.** Las cinco que hacen falta:

| Figura | Normal | Con puntillo | **Con DOBLE puntillo** |
|---|---|---|---|
| Redonda | `:4` | `:6` | **`:7`** |
| Blanca | `:2` | `:3` | **`:3.5`** |
| Negra | `:1` | `:1.5` | **`:1.75`** |
| Corchea | `:0.5` | `:0.75` | **`:0.875`** |
| Semicorchea | `:0.25` | `:0.375` | **`:0.4375`** |

#### 🔴 Y al mirarlo salieron DOS agujeros que no habia pedido

**① Los SILENCIOS solo tienen tres formas.** `RestFigure` dibuja redonda (`>=4`), blanca (`>=2`) y
**todo lo demas como silencio de NEGRA**. O sea: **`Z:0.5` y `Z:0.25` se ven igual que `Z:1`** —
un silencio de corchea se lee como negra, que es el doble de tiempo. **Eso es un dato musical
equivocado en pantalla**, no un detalle de estilo.
→ Y en la botonera los silencios llegan **solo hasta `Z:1`**: `Z:0.5` y `Z:0.25` **no tienen boton**.
📌 **Ahi esta la «semicorchea» que pide.** En los ACORDES si existe `:0.25` con su boton; lo que
falta es **el silencio**.

**② La duracion se decide con LISTAS CERRADAS de numeros.**
`hasDot = beats === 3 || beats === 1.5 || beats === 0.75`, y lo mismo `filled`, `hasFlag` y
`hasDoubleFlag`. Cada figura nueva obliga a **acordarse de cuatro sitios**, y ya se pago una vez:
**O-02 fueron DOS fallos de esa misma familia** —la negra con puntillo salia hueca y la corchea con
puntillo sin corchete—, los dos por un umbral que no contemplaba el puntillo.
→ **Con el doble puntillo serian CINCO valores mas en cada lista.** Se cambia por lo que de verdad
es: **`figuraDe(beats)` deduce la figura base y CUANTOS puntillos lleva**, y de ahi salen el
relleno, la plica, los corchetes y los puntos. La figura base decide su forma; los puntillos solo
anaden puntos.

⚠️ **Toca el nucleo:** `MusicFigures` lo usan la vista, la pantalla completa y el PDF. **Hay que
medir las 79 canciones antes y despues**, como en la fase D (§12.5).

#### ✅ HECHO y COMPROBADO (2026-08-29)

**`figuraDe(beats)`, en `lib/figuras.ts`** — y va en `lib/` a proposito, no dentro del componente:
es logica pura, asi que **la cubren las pruebas del CI** en vez de un arnes suelto. Es lo mismo
que se hizo con `music.ts` y `acordes.ts`.

| Lo que entro | |
|---|---|
| **El doble puntillo** | Las 5 figuras, con sus dos puntos dibujados |
| **Silencio de corchea y semicorchea** | **No existian**: se dibujan por primera vez |
| **Sus botones** | 15 duraciones (5 figuras x 3) y 2 silencios nuevos |
| **`%:4`** (O-50) | La repeticion ya acepta duracion |
| **19 pruebas nuevas** | Total **158** |

🔴 **LA COMPROBACION QUE DE VERDAD VALIA, porque esto toca el nucleo:** se compararon **las 7
duraciones que las canciones usan hoy**, antes y despues, decision por decision (relleno, plica,
corchete, doble corchete y puntos):

| | |
|---|---|
| Duraciones usadas hoy | `0.25` `0.5` `1` `1.5` `2` `3` `4` |
| **Se dibujan igual que antes** | **7 de 7** |
| Cambian | **0** |

→ **Las 71 canciones se ven exactamente igual.** El cambio solo anade formas nuevas.

**Y para O-50, la misma comprobacion:** hay **252 `%` sueltos** escritos en las canciones y
**0 `%` con duracion** — logico, porque no funcionaba. Asi que **el cambio del parser no puede
alterar nada de lo ya escrito**: solo habilita algo que antes salia como texto.

⚠️ **El silencio de corchea NO corrige ninguna cancion de hoy**, y conviene decirlo: **ninguna usa
todavia `Z:0.5` ni `Z:0.25`**. Estaba mal dibujado, pero nadie lo habia escrito. Esto es **para lo
que Isaac vaya a escribir**, que es justo por lo que lo pidio.

#### 🔴 Y un tropiezo mio, del mismo tipo que ya esta escrito dos veces

La prueba nueva fallo con **«Falta figuras.js»**: `pruebas/preparar.mjs` compila **una LISTA FIJA**
de modulos, y se me olvido anadir `figuras`.
📌 **Es el patron de siempre en su version pequeña:** una lista que hay que mantener a mano se
olvida. → Se anadio el modulo **y se mejoro el aviso**, que decia «ejecuta preparar.mjs» —lo que
no era el problema— y ahora dice **«¿esta en la lista MODULOS?»**, que es la causa real.
→ **No se automatizo leyendo la carpeta**, y es a proposito: `src/lib` tiene modulos que **no
compilan solos** (`songImport` necesita el navegador, `catalogo` necesita Supabase). La lista
fija esta ahi por eso.

⬜ **Pendiente de decidir con Isaac: como se ESCRIBE a mano.** `:1.75` se teclea bien, pero
**`:0.4375` es impracticable**. **Con boton da igual** —como el staccato `!` (D-08), que casi nunca
se escribe a mano—, y por eso las 15 tienen boton. Pero si quiere escribirlo a mano hace falta una
forma corta, y **esa la elige el**.

**O-50 · La repeticion `%` no admite duracion: `%:4` sale como texto.**
Isaac, 2026-08-29, con una captura: *«mira que a la repeticion (%) cuando le voy a colocar la
duracion me sale asi»* — y en la imagen se ve **`%:4` escrito tal cual**, en el amarillo de los
textos, en vez de dibujarse la repeticion con su figura de redonda.

*Causa, y es de una linea:* `TablaturePreview.tsx:175` compara **`core === "%"`, exacto**. `%:4`
no coincide, asi que cae al `else` que lo pinta como texto. Y aunque coincidiera, la fila se
guarda con **`duration: null`** fijo: el `%` **nunca** ha podido llevar duracion.

📌 **Y esto importa mas de lo que parece:** el `%` significa «vuelve a tocar el acorde de antes», y
**cuanto dura ese golpe es justo lo que hay que decir**. Sin duracion, el compas no puede repartir
bien los tiempos — que es lo que hace la cuadricula.

**O-51 · Las figuras son DEMASIADO PEQUEÑAS para distinguirlas.**
Isaac, 2026-08-29, nada mas ver O-49 funcionando: *«los signos no se ven bien, o sea no se logra
diferenciar en este ejemplo el doble puntillo o que es una semicorchea; me toca poner zoom al
300 % para poder ver que es que»*.

**Y el numero le da la razon.** La figura se dibuja con `height: 1em` sobre un `viewBox` de
**24 x 30**, asi que con el texto a ~14 px la escala es **0,47**:

| Detalle | Tamaño dibujado | Lo que se ve en pantalla |
|---|---|---|
| El puntillo (`r="1.8"`) | radio 1,8 | **menos de 2 px de diametro** |
| El corchete de la corchea | trazo 1,7 | **0,8 px de grosor** |

→ **No es que se vea mal: es que no se puede ver.** Y esto se lee **tocando**, de un vistazo y a
un metro de la tablet.

🔴 **Y es la parte de O-49 que MAS importa, porque la agrava:** el doble puntillo son **dos puntos
separados 4 unidades** — a esa escala, **dos manchas de 2 px separadas 2 px**. Imposible distinguir
uno de dos. Lo mismo la semicorchea: sus **dos corchetes** se funden en uno.

#### El metodo: pagina desechable A LA PRIMERA, no a la tercera

📌 **Aqui se aplica lo aprendido en O-47 sin esperar a gastar dos correcciones.** Esta escrito que
*«cuando lo que se discute es un DIBUJO, describirlo por escrito no converge»* y que *«la senal de
cambiar de metodo son dos correcciones seguidas»*. → **Esto es un dibujo, asi que la pagina va
directa.** Aplicar la leccion a la primera es justo la mejora.

⚠️ Se BORRA antes de publicar, como `/acordes-prueba` y `/silencio-prueba`.

#### ✅ Isaac eligio la C, y corrigio los silencios cortos (2026-08-29)

> *«la C es la mejor, pero que los silencios de corcheas y semicorcheas sean como estas»*

**① El tamaño: la C — 1,6x.** Se descartan las de solo reforzar el trazo sin crecer: **el problema
era el tamaño, no el grosor**. A 1,6x el doble puntillo se distingue del simple sin ampliar.

**② Los silencios de corchea y semicorchea, con la forma de imprenta que mando en dos imagenes:**
la **bolita arriba a la izquierda**, un trazo corto que sale hacia arriba-derecha, y **la pata
bajando en diagonal**. La semicorchea, **dos bolitas** y la pata mas larga.
→ 🔴 **Mi primer dibujo tenia la bolita en el sitio equivocado** —abajo, colgando del trazo—, y
por eso no se reconocia. La bolita va **arriba**, que es de donde arranca el signo.

📌 **Y esta vez bastaron DOS mensajes**, no cuatro: la pagina se monto a la primera y el se limito
a elegir letra y a señalar la unica pieza que faltaba. **Enseñar el dibujo desde el principio es lo
que lo hizo corto.**

**El tamaño se fija en `MusicFigures.tsx`** como valor por defecto de `--figura-alto`, que se
introdujo justo para poder probarlo sin tocar el codigo. **Las variables se quedan**: el dia que
haya que reajustar, no hay que buscar numeros por el archivo.

#### ✅ O-51 CERRADA (2026-08-29) — *«subelo, esta bien»*

| | |
|---|---|
| **Tamaño** | **1,6x** (`--figura-alto: 1.6em`), en toda la app |
| **Silencio de corchea** | Forma de imprenta: bolita arriba a la izquierda, su trazo, y la pata bajando |
| **Silencio de semicorchea** | Lo mismo con **dos bolitas** y la pata mas larga |

**Comprobado:** las **34 figuras** de «Sube La Alabanza» salen a 1,6x y sus **98 acordes siguen
intactos** · **26 de 26 pantallas** · 158 pruebas · lint 0 · build 0.

**La pagina `/figuras-prueba` esta BORRADA**, con su linea del middleware. Comprobado que **no
aparece en las rutas del build**. Es la **tercera** pantalla desechable del proyecto —tras
`/acordes-prueba` y `/silencio-prueba`— y **ninguna de las tres llego a produccion**.

📌 **Y el metodo se paga solo, con numeros:** O-47 costo **tres intentos por descripcion + dos
rondas de pagina**. O-51, montando la pagina **a la primera**, costo **dos mensajes**: el eligio
letra y señalo la unica pieza que faltaba. **La leccion no era «hacer paginas de prueba», era
hacerlas ANTES de la primera corrección.**

**O-52 · Que una seccion larga se reparta SOLA, sin partirla a mano en dos.** ⬜ **PENDIENTE.**
Isaac, 2026-08-29, con dos capturas —la canción dibujada y su texto—:

> *«quiero ver si es posible que yo escriba la seccion completa; por ejemplo en esta cancion la
> parte C la divido en dos para que ocupe bien en la pantalla. Mi pregunta es si es posible que la
> pagina tome la seccion completa sin que yo tenga que hacer dos secciones de C, y la acomode bien
> dependiendo de la pantalla del dispositivo — que no quede todo junto y estrecho sino como la
> imagen en la que lo distribui»*

⚠️ **Lo dejo EN PENDIENTE porque el lo pidio asi:** *«si es asi, dejalo en pendiente ya que me
voy»*. **No se ha programado nada.**

#### ✅ SI ES POSIBLE, y lo que ya hay juega a favor

**Los compases YA envuelven solos.** La fila es `flex flex-wrap`
(`TablaturePreview.tsx:748`), asi que meter 8 compases en una seccion **no los apretaria en una
linea**: saltarian de fila cuando no quepan.

🔴 **Entonces el problema NO es que no envuelvan: es CUANTO MIDE LA CAJA de cada seccion.** En su
captura las secciones van en **dos columnas**, asi que cada una tiene **media pantalla**. Una
seccion de 8 compases en media pantalla **envuelve mal**: quedan filas descompensadas —muchos
arriba, uno abajo— y por eso el la parte en dos `[C]`, que es una manera de decirle a mano
«esta mitad va aqui y esta alli».

#### Los caminos, para decidir con el cuando vuelva

| Camino | Que haria | Coste / riesgo |
|---|---|---|
| **(a) Que una seccion LARGA ocupe las dos columnas** | Si la seccion tiene mas de N compases, se le da el ancho entero y envuelve con sitio | **El mas barato.** Es CSS, no toca el parser. Pero hay que elegir el N, y ese numero acierta en el PC y falla en el movil |
| **(b) Repartir por ANCHO MEDIDO**, no por cuenta de compases | Se mide lo que ocupa la seccion y se decide en el momento, como ya se hace con el suelo del desplegable (O-41) y con el tamaño de letra | Lo mas correcto y lo que mejor se adapta a cada aparato. **Mas trabajo**, y hay que rehacerlo al cambiar de columnas o de tamaño |
| **(c) Dejar que el marque el corte, pero SIN partir la seccion** | Ya existe el `;` (salto de fila). Seria usarlo dentro de una seccion en vez de crear dos | **Coste casi cero — puede que ya funcione.** ⚠️ **Hay que PROBARLO antes de proponer nada**: si el `;` ya reparte dentro de la seccion, esto no es programar, es enseñarselo |

🔴 **Lo primero que hay que hacer cuando se retome, y es medio trabajo:** **probar (c) con su
propia cancion**. Si el `;` ya hace lo que quiere, la respuesta es «escribelo asi» y no se toca ni
una linea — como paso con D-19 (las ligaduras encadenadas ya funcionaban) y con O-24. **Comprobar
lo que ya hace la app antes de programar** ha convertido dos peticiones en descartes de dos
minutos.

📌 **Y un dato suyo que hay que respetar:** el reparto que hizo a mano **es el bueno**, y es una
decision musical —parte donde la frase respira—. Si la pagina reparte sola, **tiene que dejarle
seguir mandando** cuando el quiera: lo automatico es la comodidad, no la ley.

#### 🔴 ACLARACION SUYA (2026-08-29), y CORRIGE mi analisis de arriba

Isaac, con **tres capturas de la misma cancion a tres tamaños distintos**:

> *«si por ejemplo agrando el tamaño en modo pantalla completa, que en vez de que lo que siga este
> debajo en la misma seccion, que siga en el orden que debe ser abajo izquierda… pero que se pueda
> ver bien, y que **los acordes que no puedan ocupar en una linea que pasen a la otra linea
> RESPETANDO LA LECTURA QUE TENGA EL MUSICO determinado, ya sea debajo izquierda o por lectura de
> columnas**»*

🔴 **Lo que yo habia entendido estaba incompleto.** Yo lo lei como un problema de **anchos**: que
una seccion larga no cabe en media pantalla. Y hay algo de eso, pero **lo que de verdad pide es
otra cosa**: que cuando los compases de una seccion **envuelvan a otra fila**, ese salto
**respete el modo de recorrido que el musico eligio en O-26** —por filas o por columnas—.

📌 **Es O-26 llevada DENTRO de la seccion.** Hoy el recorrido de O-26 decide como se recorren **las
secciones** entre si; lo que el pide es que decida tambien **como se leen los compases cuando una
seccion no cabe en una linea**. Sin eso, al agrandar la letra en pantalla completa el orden de
lectura **puede contradecir lo que el musico eligio** — y eso, tocando, es peor que apretado.

**Sus tres capturas son el enunciado, y conviene guardarlas como tal:**

| Tamaño | Que se ve |
|---|---|
| Letra pequeña | Cada seccion en **una sola fila**. Aqui no hay problema |
| Letra media | Los compases **envuelven dentro de su seccion**, 2-3 filas. Es lo que quiere que funcione bien |
| Letra grande (pantalla completa) | Envuelven mas, y ahi es donde **el orden importa de verdad** |

→ ⚠️ **Y lo que esto añade al analisis:** el camino **(a)** —dar mas ancho a las secciones largas—
**no resuelve lo que pide**. Alivia el apretado, pero no toca el orden de lectura. Los caminos
buenos son **(b) medir** y, sobre todo, **hacer que el envolver mire el ajuste de O-26**.

#### 🔬 LAS PRUEBAS, hechas el 2026-08-29 — *«sube lo pendiente y haz las pruebas»*

**① El `;` YA REPARTE DENTRO DE UNA SECCION. Media peticion no necesita programar nada.**

Medido con el **parser REAL** —extraido de `TablaturePreview.tsx` y compilado con el TypeScript
del proyecto, no con recortes de texto—, usando **su propia seccion C**:

| Lo que se escribe | Como sale |
|---|---|
| `Bb:3 Dm7:1 \| C7 \| Am7 \| Dm7 \| Gm7 \| C7 \| F \| %` | **8 compases en UNA fila** |
| `… \| Dm7 **;** Gm7 \| …` | **fila 1:** `Bb Dm7 · C7 · Am7 · Dm7` · **fila 2:** `Gm7 · C7 · F · %` |

→ **Puede escribir la seccion COMPLETA** y poner un `;` donde hoy la parte en dos `[C]`.
**Sin dos secciones, sin tocar codigo.**
✅ Y comprobado que llega a la pantalla: «Todo Lo Has Cambiado» tiene **2 saltos escritos** y en su
HTML salen **2 elementos de salto de fila**. Ya hay **2 canciones de 72** usandolo.

**② El orden de lectura: como esta montado hoy** (`PresentationView.tsx:718-741`)

| Recorrido | Las SECCIONES | Los COMPASES dentro de una seccion |
|---|---|---|
| **Por filas** | `grid-cols-2` — izquierda, derecha, y baja | `flex-wrap`: izquierda→derecha, luego abajo |
| **Por columnas** | `columnCount: 2` — llena la columna izquierda entera, luego la derecha | **igual**: `flex-wrap` |

→ **Dentro de una seccion siempre se lee izquierda→derecha**, en los dos modos. Y eso **es lo
correcto**: dentro de una frase musical no hay otra forma de leer.

#### ❓ LA PREGUNTA QUE QUEDA, y NO se responde por cuenta propia

Su frase admite **dos lecturas**, y llevan a trabajos distintos. **Ya me equivoque una vez
interpretandola**, asi que se le pregunta:

**(A) Que la seccion larga se PARTA SOLA en varios bloques**, y cada trozo ocupe **la siguiente
casilla** de la rejilla —arriba-derecha o abajo-izquierda segun el recorrido—. Es **exactamente lo
que el consigue a mano** creando dos `[C]`, y encaja con *«que siga en el orden que debe ser abajo
izquierda»*.

**(B) Que la seccion se quede en su caja** y solo se asegure de que, al envolver, **se lee en el
orden que el eligio**. Como dentro ya se lee izquierda→derecha en los dos modos, esto **quizas ya
funciona** y lo unico que falta es que **quepa mejor**.

📌 **La diferencia no es de tamaño: es de QUE ES UNA SECCION.** En (A) una seccion puede ocupar
dos casillas; en (B) una seccion es siempre una caja. La primera cambia como se dibuja la
pantalla entera; la segunda es un ajuste.

✅ **Su respuesta (2026-08-29):** *«mas o menos entiendo tus dos opciones, pero creo que mejor
hagamos el ejemplo con las dos opciones para ver»*.
→ **Pagina desechable con las dos, sobre su cancion de verdad** —«Santo Por Siempre», que es la de
sus capturas y la que tiene la C partida en dos—. **Es el metodo que ya funciono tres veces**, y
esta vez **lo propuso el**.

#### 🖥️ LA PAGINA ESTA MONTADA (2026-08-29) — `/secciones-prueba`, en local

**Cuatro paneles con la MISMA cancion**, y los controles arriba para moverlo todo: columnas
(1/2/3), recorrido (por filas / por columnas), **tamano** —que es donde el vio el problema—,
cuantos compases por bloque parte la A, y claro/oscuro.

| Panel | Que ensena |
|---|---|
| **Hoy** | Sus dos `[C]` a mano, tal cual estan en la base |
| **Ya funciona** | **Una sola** seccion con el `;`. Sin programar nada |
| **A** | Una sola seccion; **la pagina la parte** en bloques que ocupan la casilla siguiente |
| **B** | Una sola seccion; **no se parte nunca**, se le da el ancho entero cuando es larga |

**Comprobado sirviendola:** `HTTP 200` · los 4 paneles · **5 etiquetas `[C]` + 1 «(sigue)»**
—que es 2+1+2+1, exactamente lo que debe— · el salto del `;` sale **1 vez** (solo en su panel) ·
el ancho entero **1 vez** (solo en B) · **140 acordes** dibujados · build codigo de salida **0**.

📌 **Y un punto a favor de (A) que salio al montarlo, y que no habia visto:** al partir sola, los
signos de repeticion se quedan **donde tienen que estar** —`|:` abre en el primer bloque y `:|`
cierra en el ultimo—. Sus dos `[C]` a mano llevan **repeticion cada una**: son dos repeticiones
distintas, cuando musicalmente es **UNA** que abarca los ocho compases. **La pagina lo escribiria
mejor de lo que se puede a mano.**

⚠️ **Se BORRA antes de publicar nada**, como las tres anteriores. Y **la linea de
`/secciones-prueba` en el middleware se va con ella**.

#### ✅ ELIGIO LA (A), y le puso una condicion (2026-08-29)

> *«la opcion a, es a lo que me refiero, pero que si es posible que tenga cuatro compases minimos,
> o las que pueda para que aproveche lo maximo los espacios, no que quede tan estrecho pero si los
> que pueda la pagina»*

🔴 **Su condicion NO es «parte de cuatro en cuatro»: es «parte por lo que QUEPA».** Un numero fijo
acierta en una pantalla y falla en las otras tres — es justo lo que ya se pago con el hueco de las
figuras (O-53) y con las listas de duraciones (O-49). Lo que pide es que **la pagina mida**.

**La regla, tal como queda decidida:**

| | |
|---|---|
| **Cuantos compases por bloque** | **Los que quepan en una fila**, medidos en el momento |
| **Minimo** | **4** — *«cuatro compases minimos«*. Si caben menos de 4, se ponen 4 igual y envuelven dentro del bloque; asi una seccion no se rompe en muchos trozos diminutos |
| **Se reparte PAREJO, no a lo bruto** | 8 compases con sitio para 6 dan **4+4**, no 6+2. Un bloque final de 2 en media pantalla es justo el hueco desperdiciado que el no quiere |
| **Cuando NO se parte** | Si la seccion **cabe entera**, se deja como esta |
| 🔴 **Si el escribio un `;`, MANDA EL** | La pagina **no reorganiza** una seccion donde el marco el corte. *Lo automatico es la comodidad, no la ley* — y ademas asi **las 2 canciones que ya usan `;` no cambian** |

📌 **Y un punto a favor de (A) que salio al montar el ejemplo:** al partir sola, los signos de
repeticion se quedan **donde tienen que estar** —`|:` abre en el primer bloque y `:|` cierra en el
ultimo—. Sus dos `[C]` a mano llevan **repeticion cada una**: son dos repeticiones distintas cuando
musicalmente es **UNA** de ocho compases. **La pagina lo escribe mejor de lo que se puede a mano.**

⚠️ **Donde se aplica y donde NO, decidido a proposito:**
* ✅ **La presentacion** —pantalla completa y culto compartido—, que es *«LA pantalla del culto»*
  (O-30) y donde el vio el problema.
* ❌ **El modo vista y el editor**: ahi cada seccion ya ocupa el ancho entero, asi que no hay
  casilla siguiente que ocupar. No hay nada que repartir.
* ❌ **El PDF**: se dibuja para papel y **medir en impresion no es fiable** —lo mismo que enseno
  T-10 con el `100vh`—. El PDF se queda con su rejilla de dos columnas.

#### ✅ HECHO (2026-09-01) — y lo probo con SU cancion

🔴 **Isaac preparo el terreno el mismo dia**, y conviene saberlo porque es el dato que hace real
la prueba: *«te he dejado para la prueba la cancion cada vez, junte las secciones que parti y las
deje unidas en uno solo y solamente quedan las secciones como son a, b, c y asi»*. → **«Cada Vez»
ya esta escrita como el queria escribirla**, sin partir nada a mano.

**Como quedo montado:**

| Pieza | Que hace |
|---|---|
| `src/lib/reparto.ts` **(nuevo)** | La cuenta pura: `repartirBloques(total, cabenEnUnaFila)`. En `lib/` **a proposito**, para que la cubra el CI |
| `SeccionRepartida.tsx` **(nuevo)** | Mide, decide y devuelve **varios hermanos** — cada bloque es una casilla de la rejilla del padre |
| `TablaturePreview` | Prop `segmentos` para dibujar solo un tramo, y la rejilla marcada con `data-rejilla-compases` para poder medirla |
| `PresentationView` | Usa `SeccionRepartida` en vez de `TablaturePreview` |
| `pruebas/reparto.test.mjs` | **12 pruebas nuevas**, total **170** |

🔴 **La medida NO se estima, se mide:** la sonda dibuja la seccion entera **oculta y a la anchura
real de la casilla**, y se cuentan los compases que caen en la primera fila. Va oculta y en
posicion absoluta para no ocupar sitio, y **siempre dibuja la seccion entera** — si dependiera del
reparto, cada reparto cambiaria la medida y la medida el reparto, dando vueltas sin parar.

#### 🔴 Y un fallo que se cazo por medirlo, no por leerlo

Con la primera version, la seccion B de «Santo Por Siempre» —que tiene **5** bloques— salia
partida en **`3 + 2`**. Un bloque de 2 es exactamente el *«que no quede tan estrecho»* que el no
quiere.
→ **Corregido:** el minimo pone un **techo a cuantos bloques caben** (`floor(total / 4)`), asi que
con 5 compases **no se parte**: envuelve dentro de su caja. **Ningun bloque baja de cuatro, nunca**
—y hay una prueba que lo recorre con 60 x 15 combinaciones—.

#### 📊 Medido con Edge sin ventana, que es lo unico que puede verlo

🔴 **Esto ocurre ENTERO en el navegador**, asi que `curl` no ve nada: el HTML del servidor trae la
seccion sin partir y el reparto pasa despues. → Se dejo **`data-reparto` en el HTML** (`10→5+5`) y
se midio con Edge en modo sin ventana, el mismo truco de la fase F con los PDF.

**«Cada Vez», sus dos secciones largas** — la A tiene **10** bloques y la C **12** (los `4/4` de en
medio cuentan como bloque propio, cosa que no habia visto):

| | Seccion A | Seccion C |
|---|---|---|
| 1 columna, letra pequena | **10 → 10** *(no parte: cabe entera)* | **12 → 12** |
| 1 columna, normal | 10 → **5+5** | 12 → **4+4+4** |
| 2 columnas | 10 → **5+5** | 12 → **4+4+4** |
| 2 columnas, letra grande | 10 → **5+5** | 12 → **4+4+4** |
| 3 columnas | 10 → **5+5** | 12 → **4+4+4** |
| **Con `;` escrito por el** | — | **12 → 12** *(no se toca: manda el)* |

📌 **La primera fila es la que prueba que la medida funciona:** con sitio de sobra **no parte
nada**. Y en el resto **manda el minimo de cuatro**, que es lo que el pidio.

**Que no se rompio nada, y esto era el riesgo de verdad** —las ligaduras ya se rompieron tres
veces en este proyecto—. Con «Cancion Feliz», que lleva **5 ligaduras escritas**, comparando el
mismo dibujo a dos anchuras donde se parten **1 seccion y 6**:

| | a 1400 (parte 1) | a 700 (parte 6) |
|---|---|---|
| Arcos de ligadura | **50** | **50** |
| Acordes | **325** | **325** |

→ **Identicos.** Partir no pierde ni duplica nada. Y es por construccion: `saleLigado` y
`entraLigado` se calculan sobre la lista **entera** de compases, que no se recorta — solo se
recorta lo que se DIBUJA.

**Y en la presentacion de verdad** (el culto compartido, sin cuenta): **72 acordes** a 1400 y a
800, y a 800 una seccion de 8 se reparte en **4+4**.

**Lo demas:** 26 de 26 pantallas · **170 pruebas** · lint **0 errores** · build **codigo de salida
0**. *(El lint marca 60 avisos, y se comprobo guardando los cambios aparte que **ya eran 60 antes
de tocar nada**: mis archivos meten **cero**. El «57» que decia §9.2-undecies se quedo viejo.)*

#### 🔴 LO PROBO A MEDIA PANTALLA Y SALIA MAL (2026-09-01)

Isaac, con dos capturas: *«esta bien pero fijate que cuando la pagina ocupa la pantalla completa
sale bien, pero cuando lo pongo para que ocupe la mitad de la pantalla mira como sale»*.

**Y el fallo era EL MINIMO DE CUATRO**, justo lo que el habia pedido. A media pantalla en una fila
caben **3** compases, pero el minimo obligaba a hacer **pocos** bloques —y pocos bloques son
bloques grandes—, asi que salian de 5 y **cada bloque se partia por dentro en dos filas**: una
llena y otra a medias, estirada y con un hueco.

📌 **La clave estaba en su propia frase, en dos palabras que yo habia dejado de lado:** *«que **si
es posible** tenga cuatro compases minimos, **o las que pueda**»*. Cuando en una fila caben 3,
cuatro **no es posible** — y forzarlo es lo que dejaba la pantalla como el la vio.

#### 🖼️ Y AQUI CAMBIA COMO SE COMPRUEBA ESTO: se saca CAPTURA y se mira

Hasta ahora todo lo del navegador acababa en *«tiene que mirarlo Isaac»*. **Edge en modo sin
ventana saca captura** (`--screenshot`), igual que ya se usaba para contar paginas de los PDF en la
fase F — pero **mirandola**, no contandola.

🔴 **Y valio de inmediato: la primera captura enseño un fallo que los numeros NO decian.** El
reparto era correcto —ningun bloque envolvia— pero la seccion C salia en **seis tarjetas, cada una
con su cabecera «C (Porque todo...) (sigue)» repetida entera**. Las cabeceras ocupaban tanto como
la musica. → **La etiqueta de los trozos siguientes pasa a ser corta: «C (sigue)».**

#### ⬜ LAS DOS REGLAS, para que elija viendo

Las dos estan montadas en `/secciones-prueba`, una encima de otra:

| | Que hace | El precio |
|---|---|---|
| **Regla 1 · `porFila`** *(puesta por defecto)* | Los bloques mas grandes que quepan **enteros en una fila**. Ninguno se parte por dentro | En pantallas estrechas salen **mas bloques y mas pequenos** |
| **Regla 2 · `minimo`** | Los bloques **nunca bajan de 4** compases | Cuando caben menos de 4, **el bloque se parte por dentro** — lo que el vio mal |

**Medido a 950 px de ancho, 2 columnas** (la media pantalla suya):

| Seccion | Regla 1 | Regla 2 |
|---|---|---|
| A (10 bloques, caben 3) | **3+3+2+2** | 5+5 *(los dos envuelven)* |
| C (12 bloques, caben 2) | **2x6** | 4+4+4 *(los tres envuelven)* |

**A pantalla completa las dos dan lo mismo** —A `5+5`, C `4+4+4`— que es lo que el dijo que sale
bien. **La diferencia solo aparece cuando se estrecha.**

🔴 **Y un choque de reglas que cazaron las PRUEBAS, no la pantalla:** la primera version de la
regla 1 llevaba ademas un suelo —«nunca bloques de un solo compas»—, y con 5 compases y sitio para
2 el suelo obligaba a `3+2`… y ese 3 **volvia a envolver**. → **Una sola regla de tamano.** Dos
tirando en sentidos opuestos siempre tienen un caso donde una gana y rompe a la otra.

#### 🔴 TRES COSAS MAS QUE VIO EL, y dos eran fallos de verdad (2026-09-01)

**① El telefono partia una seccion en DIEZ tarjetas.** En un movil **en vertical solo cabe UN
compas por fila**, asi que «no envolver» obligaba a un cuadro por compas — con su cabecera cada
uno. **No se veia probando anchos de ordenador**: hubo que emular el tamano real de un telefono.
→ **Tope: `MAXIMO_BLOQUES = 4`.** Si hicieran falta mas trozos, la pantalla es demasiado estrecha
para que repartir gane nada y **la seccion se queda entera**, como se ha visto siempre.
📌 La idea que ordena todo: *repartir sirve para llevar la continuacion a la casilla de al lado*.
Mas de cuatro trozos ya no es eso.

**② Una seccion CORTA tambien tiene que repartirse.** Isaac, con «Su Presencia»: *«son dos
compases diferentes, o sea no estan en el mismo compas, y no se pone en el lado derecho para
seguir el orden de la lectura»*. Su «Intro Sinte» son **2** compases que envolvian dentro de la
caja.
→ **Se quito el «por debajo de 4 no se parte»**, que era mio y no suyo. Ahora **si envuelve, se
reparte**, sin excepcion por tamano. Un `2 → 1+1` es correcto: son dos casillas seguidas.

**③ Una cancion corta no crecia para llenar la pantalla.** Isaac, con «Avivamiento»: *«por mas que
quiera que se ponga grande para aprovechar el tamano de la pantalla y la poca estructura que
tiene, no se pone mas grande»*.
→ **Causa, un numero: `MAX_SCALE = 2`** en `PresentationView`. El auto-ajuste queria crecer y
chocaba contra el techo, dejando media pantalla vacia. **Subido a 4.** El techo no protegia de
nada: el auto-ajuste ya para solo cuando el contenido llena el alto, e itera hasta converger.
⚠️ **No es de O-52** —venia de antes— pero se arregla aqui porque se ve en la misma pantalla.

**Medido despues de las tres, con `data-reparto`:**

| | Seccion A (10) | Seccion C (12) | Secciones de 2 |
|---|---|---|---|
| PC completa | **5+5** (caben 6) | **4+4+4** (caben 5) | enteras |
| PC media pantalla | **3+3+2+2** (caben 3) | entera *(harian falta 6)* | enteras |
| **Telefono vertical** | **entera** *(harian falta 10)* | **entera** | **1+1** ← lo que pidio |

#### 🖼️ Y de aqui sale la forma de comprobar esto, que antes no existia

**Edge sin ventana con el tamano y el agente de un telefono** reproduce lo que el ve, y
`--screenshot` deja **mirarlo**. Fue asi como aparecio el ① —los numeros decian «reparto
correcto» y la imagen ensenaba diez cabeceras—.
→ Y en la pagina desechable hay ahora una **chapa a la vista**: `v4 · reparto medido · ventana
NNNxNNN`, mas la medida debajo de cada cuadro (`10 → 5+5 · caben 6`). Con una captura suya se sabe
si midio, que midio, y si le llego la version nueva.

#### 🔴 EL FALLO QUE LO EXPLICABA TODO: la sonda no medía (2026-09-02)

Isaac: *«aun hay canciones que no pasan al otro lado de la lectura a pesar de que dice (sigue)…
probe en el telefono y aun sale lo mismo»*. **Y sus capturas traian la respuesta**, gracias a la
medida que se habia puesto a la vista: en TODAS las secciones ponia **`caben SIN MEDIR`**.

*Causa:* `medir()` descartaba los saltos manuales filtrando por **`offsetHeight > 0`**, y la sonda
iba dentro de una caja con **`height: 0; overflow: hidden`**. Si el navegador devuelve 0 para todos
—cosa que depende de como quede esa caja—, **la lista sale vacia, `medir` se rinde y `caben` se
queda en `null` para siempre**: la seccion no se reparte nunca.

*Como se resolvio, tres cosas:*
1. **Los saltos se descartan por su MARCA**, `data-salto`, no por su alto. Un dato no se deduce de
   un efecto secundario del dibujo.
2. **La sonda deja de forzar `height: 0`.** Al ser absoluta ya no ocupa sitio; forzarle el alto era
   justo lo que hacia medir 0.
3. **Un reintento tras pintar** (`requestAnimationFrame`) y **`try/catch`**: ante cualquier cosa
   rara del navegador la seccion se queda entera, que es como se ha visto siempre, y la pagina
   nunca se rompe por esto.

📌 **La leccion de metodo, y es la que vale:** esto **funcionaba en mi navegador de pruebas y no en
el suyo**, asi que ninguna medida mia lo habria cazado. Lo caso **poner la medida a la vista en la
propia pantalla** y que el mandara una captura. → **Cuando algo solo ocurre en el navegador del
usuario, la instrumentacion va EN LA PANTALLA, no en el arnes.**
⚠️ Y el «1 Issue» rojo de sus capturas **NO era esto**: es un desajuste de hidratacion en las
clases de las FUENTES, del layout raiz, y viene de antes. Se comprobo antes de perseguirlo.

#### 🔴 Y el TOPE de cuatro trozos: lo tumbo el (2026-09-02)

> *«AUN NO SE HA ARREGLADO LO DE QUE PASEN LOS COMPASES, NO IMPORTA QUE EL QUE PASE SEA SOLAMENTE
> UNO, ESO NO IMPORTA»*

📌 **El tope lo puse yo mirando una captura de su telefono** donde una seccion salia en diez
tarjetas y me parecio feo. **Pero eso no era una decision mia**: el pidio que lo que no cabe pase a
la casilla siguiente, punto. → **Fuera.** Y con O-56 (la rejilla a pantalla completa) el caso de
las diez tarjetas casi ni aparece, porque caben muchos mas compases por fila.

📌 **La leccion, y ya van dos en dos dias:** *«se ve feo» no es motivo para poner un limite que el
usuario no pidio.* Si el resultado no gusta, se le enseña y decide el.

#### ✅ O-52 CERRADA (2026-09-03) — eligio la REGLA 1, y la otra ya esta borrada

> *«para la regla 1 ok»*

**Manda la regla 1:** los bloques mas grandes que quepan **enteros en una fila**; ninguno se parte
por dentro. Es la que ya estaba publicada, asi que **en produccion no cambia nada**.

**Borrado de verdad, no comentado:** `repartirConMinimo`, el tipo `Regla`, el parametro de
`cortesDe` y la prop del componente. Comprobado: **0 rastros** en `src/` y en `pruebas/`.
📌 **Y se borra a proposito en vez de dejarla «por si acaso»:** dos reglas vivas para lo mismo son
dos formas de que la pantalla haga cosas distintas segun quien monte el componente. **La que
perdio esta en el historial de git**; no hace falta que estorbe en el archivo.

**El motivo de que perdiera queda escrito en `reparto.ts`, para no reabrirlo:** con el minimo de
cuatro, a media pantalla —donde caben 3— salian bloques de 5 que **se partian por dentro en dos
filas**. Estaba en su propia frase: *«cuatro compases minimos, **o las que pueda**»*.

**Comprobado tras borrar:** 180 pruebas · lint 0 · build 0 · **26 de 26 pantallas**.

#### 🔴 Y un dato de la BASE que aparecio de rebote: los 4 cultos estaban en BORRADOR

Al pasar `pruebas/pantallas.mjs` fallo entera con *«No se pudieron leer identificadores»*. **No
era la prueba ni mi cambio**: con la clave publica, `services` devolvia **vacio** porque los
**cuatro** cultos —«Escuela Dominical» incluido— estaban en `draft`. Con ese estado, **ningun
musico ve ningun culto**.
→ Isaac lo devolvio a publico el mismo dia (*«ya puse en publico el de escuela dominical»*).
✅ **Arreglada la prueba igualmente:** si con la clave publica no sale ningun culto, lo vuelve a
pedir **con la cuenta de pruebas**, y si no hay ninguno publicado con enlace **se salta las tres
rutas `/s/<token>` avisando**, en vez de abortar sin comprobar nada. Con los cultos en borrador da
**«23 bien · 0 mal · 3 saltadas»**; con Escuela Dominical publicada, **26 de 26**.

⬜ **PENDIENTE de que lo mire con los ojos**, que es lo unico que decide. Esta en
`/secciones-prueba` con «Cada Vez», y admite `?cols=1&escala=1.8` para verlo sin pulsar botones.

#### 📱 Probarlo en el TELEFONO — lo pidio el 2026-09-01

*«necesito el local host para telefono para probarlo en telefono tambien»*.

**El servidor ya escucha en la red:** `npm run dev` levanta **`http://192.168.1.7:3000`** ademas de
`localhost`, y responde (comprobado, 200 en 0,2 s). La ruta `/secciones-prueba` es publica, asi que
no hace falta cuenta.

🔴 **PERO el cortafuegos lo va a bloquear, y hay que saber por que:** la red **«CR7» esta
clasificada como PUBLICA** en Windows, y en ese perfil el cortafuegos **rechaza toda conexion
entrante** por defecto. → Hace falta **una regla de entrada para el puerto 3000**, y eso es un
cambio en su sistema: **se le pide antes de tocarlo**.

```
netsh advfirewall firewall add rule name="Partituras dev 3000" ^
  dir=in action=allow protocol=TCP localport=3000 remoteip=localsubnet
```
`remoteip=localsubnet` la deja **solo para aparatos de su misma red**, no para todo. Se quita con
`netsh advfirewall firewall delete rule name="Partituras dev 3000"`.
⚠️ **La IP cambia si se reinicia el router**; se vuelve a mirar en la linea `Network:` que imprime
`npm run dev`.
⬜ **PENDIENTE su permiso para publicar.** Y al publicar, **el comunicado** (`CAMBIOS.md` y
`/novedades`): se nota mucho usando la pagina, asi que sin eso no esta terminado.

**O-57 · El PENTAGRAMA para la trompeta: escribir la melodia de las canciones.** ⬜ **PROPUESTA,
a la espera del visto bueno.**

Isaac, 2026-09-02: *«quisiera saber si hay una manera de poder implementar para la trompeta el
diagrama de pentagrama, mas que todo se pueda escribir la melodia de las canciones ahi»*, y tras
ver la pagina desechable con las dos formas: *«dejemoslo para todas las canciones que se montaron
y por las que se van a montar, que tenga una seccion aparte como las letras pero que sea oculta
tambien hasta que funcione bien, y que se pueda escribir la melodia y tambien las secciones para
que sepa por donde va»*.

#### ✅ Lo probado en `/pentagrama-prueba` (desechable, se borra)

Se le enseñaron **las dos formas de escribir**, y el hallazgo que decide el plan:

| | Que es | Como salio |
|---|---|---|
| **(a) Texto** | Notacion **ABC**: `G2 G2 A2 G2 c2 B4` — mayuscula la octava de abajo, minuscula la de arriba, el numero es la duracion | ✅ Dibuja el pentagrama de verdad |
| **(b) Raton** | Se pincha sobre el pentagrama para poner o mover una nota | ✅ Funciona |

🔴 **Y lo importante: LAS DOS ESCRIBEN EL MISMO TEXTO.** La (b) no es otra cosa que la (a) con el
raton, asi que **no hay que elegir una y tirar la otra** — se empieza por la (a), que es lo barato,
y la (b) se añade despues **sin rehacer nada**. Eso es lo que hace el plan de abajo por fases.

✅ **Y la trompeta sale gratis:** `abcjs` tiene `visualTranspose`, y **+2 es exactamente lo que ya
calcula `lib/transpositores.ts`** (D-28). En la prueba se ve el mismo pasaje dos veces —«como
suena» y «lo que lee la trompeta»—, y el segundo sale con sus **dos sostenidos** correctos.

#### El diseño propuesto

| Decision | Por que |
|---|---|
| **Se guarda en `sheets.melody`**, texto plano | 🔴 **Necesita MIGRACION** — no hay columna libre (`lyrics` esta ocupada). Toca produccion: **OK expreso de Isaac (D-04) y copia previa** |
| **Con las MISMAS etiquetas de seccion** que los acordes y las letras (`[A (Cada vez...)]`) | Es lo que el pidio —*«tambien las secciones para que sepa por donde va»*— y ademas **`parseSections` ya existe**: emparejar cada frase con su seccion **sale gratis** (igual que D-20 con las letras) |
| **Oculta hasta que este escrita**, con UN interruptor | `ROLES_MELODIA` en `lib/melodia.ts`, calcado de `ROLES_LETRAS` (D-22). Y como alli: **no es esconder botones** — la pantalla lo comprueba en el SERVIDOR y la melodia **no sale del servidor** para quien no debe verla |
| **`abcjs` cargado SOLO en esa pantalla** | **136 KB comprimido**, medido. Con carga diferida, quien no abra la melodia **no paga nada**. Hoy el catalogo son ~97 KB |
| 🔴 **SE ESCRIBE CON EL RATON — eligio la (b)** | Isaac, 2026-09-02: *«la opcion b»*. La de texto se queda **por debajo**: es el formato en el que se GUARDA, no la forma en que el escribe. Y como las dos producen el mismo ABC, tener la (a) montada no se tira — sirve de respaldo y para pegar o corregir a mano |

⚠️ **Y lo que hay que decir antes de empezar, igual que se dijo con las letras (O-18):**
🔴 **Esto no es un trabajo de programar, es de TECLEAR.** La melodia **no existe en ninguna parte**:
ni en la base, ni en los acordes. Programar la pantalla son dias; **escribir la melodia de 75
canciones lo hace una persona**, nota por nota — y una melodia tiene muchas mas notas que una letra
tiene palabras. Lo que si abarata el trabajo, como con las letras, es que **las secciones ya estan
escritas**: el andamio puede venir con sus etiquetas puestas y el solo rellena.

#### El plan por fases

🔴 **REORDENADO por su eleccion (2026-09-02):** el editor con el raton **sube a R.1**, porque es
la forma en que el va a escribir. El texto ABC no desaparece — es lo que se guarda en la base — pero
deja de ser la pantalla principal.

| Sub | Que | Riesgo |
|---|---|---|
| **R.0** | **Migracion**: columna `sheets.melody` | 🔴 Toca produccion. **OK expreso + copia previa** |
| **R.1** | 🔴 **Escribir CON EL RATON** — pinchar sobre el pentagrama para poner, mover y quitar notas. Pestaña «Melodia» en el editor, solo admin, **con el andamio de secciones ya puesto** | **El grueso del trabajo.** Lo que hay en la pagina desechable es un boceto: falta borrar una nota suelta, insertar en medio, deshacer, alteraciones (`#`/`b`), silencios y ligaduras |
| **R.2** | **Leer** — entrada «Melodia» en la barra lateral + pestaña en la cancion, **con el selector Como suena / Trompeta** | Bajo |
| **R.3** | **Escribir por texto**, como segunda via — para pegar, corregir a mano o arreglar algo raro | Bajo: ya esta probado |
| **R.4** | *(a decidir)* La melodia en la presentacion y en el PDF del culto | A decidir |

⬜ **PENDIENTE: el OK expreso para la migracion R.0.** El plan lo aprobo al elegir la (b).

#### ✅ R.1 HECHO (2026-09-03) — el editor con el raton, ya de verdad

**Sin tocar la base**, que es lo que permitio avanzar con R.0 todavia bloqueada.

| Pieza | Que hace |
|---|---|
| `src/lib/melodia.ts` **(nuevo)** | El modelo y el ABC. En `lib/` **a proposito**, para que lo cubra el CI — igual que `music.ts`, `figuras.ts` y `reparto.ts`. Aqui vive tambien `ROLES_MELODIA`, el interruptor unico (D-22) |
| `src/components/sheets/EditorMelodia.tsx` **(nuevo)** | El pentagrama donde se pincha. Con `PointerEvent`, por lo de O-37: el arrastre de raton **no funciona con el dedo**, y esto se va a usar en tablet |
| `pruebas/melodia.test.mjs` | **10 pruebas nuevas**, total **180** |

**Lo que ya sabe hacer, que era justo lo que le faltaba al boceto:** poner, **seleccionar**,
**arrastrar para afinar**, **borrar una nota concreta**, **insertar en medio**, **deshacer** (50
pasos), **sostenido / bemol / becuadro**, **silencios**, **ligaduras**, **barras de compas** y las
**8 duraciones** de la semicorchea a la redonda, con puntillo. Y teclado: `↑ ↓` afinan, `← →`
cambian de nota, `Supr` borra.

#### 📌 Tres decisiones que conviene no volver a discutir

1. **Se guarda en ABC, no en JSON.** Es texto que se lee, se pega y se corrige a mano, lo abre
   cualquier programa de partituras, y asi **la melodia no queda atrapada** el dia que algo se
   rompa. El editor de raton es solo una forma comoda de teclearlo.
2. **El pentagrama del editor NO es la partitura final, y es a proposito.** Es una rejilla regular
   —una nota por columna, todo del mismo ancho— hecha **para pinchar**. El dibujo bonito (vigas,
   espaciado real) lo hace el grabador con el ABC que sale de aqui. Mezclarlas obligaria a escribir
   un motor de partitura, que es justo lo que no se quiere mantener.
3. 🔴 **La prueba que de verdad protege es la de IDA Y VUELTA**, y recorre **las 8 duraciones x 4
   alteraciones x ligada o no x 6 alturas**. Motivo: si al guardar se perdiera una alteracion,
   **no salta ningun error** — la melodia se dibuja igual de bonita con la nota equivocada, y quien
   lo descubre es el trompetista tocandola en el culto. Es el mismo caso que la transposicion.

#### 🖼️ Y TRES FALLOS QUE SOLO ENSEÑO LA CAPTURA

Compilaba, las 180 pruebas pasaban, y **el pentagrama estaba mal dibujado en tres sitios**. Se
vieron mirando la imagen, no los numeros — que es la leccion de O-52 aplicada a la primera:

| Lo que se veia | La causa |
|---|---|
| **Las BLANCAS salian rellenas** — o sea, leidas como negras: **la mitad de tiempo** | `fill="white"` como atributo, con una clase de Tailwind `fill-slate-900` encima. **Una clase de CSS le gana siempre a un atributo de presentacion**, asi que el blanco no pintaba nada |
| **Todas las plicas para arriba**, con las notas agudas sacando un palo larguisimo | Faltaba lo mas basico de una partitura: **la plica cambia de lado en la linea del medio**. De la tercera linea hacia arriba baja por la izquierda |
| **El silencio, del tamaño de media pantalla** | `RestFigure` fija su alto con un estilo **en linea y en `em`**, y un `<svg>` anidado dentro de otro no lo respeta. → Va en un **`foreignObject`**, que le da una caja HTML donde ese `em` significa algo |

🔴 **Y el silencio es `RestFigure`, el que Isaac eligio mirandolo** (O-47 «D2» y O-51). Dibujar
aqui otro parecido habria sido tener el mismo signo escrito dos veces — **el patron P-09, que este
proyecto ya ha pagado tres veces**.

⚠️ **Un tropiezo mio del catalogo de siempre:** meti un comentario `{/* … */}` **dentro** de un
`{condicion && ( … )}`, y ahi las llaves ya no son un comentario de JSX sino un objeto. No compila.
Es primo hermano del `//` en zona JSX de la tanda 29.

**Comprobado:** 180 pruebas · lint **0 errores** · build **0** · **26 de 26 pantallas**.

#### ✅ `abcjs` ENTRA COMO DEPENDENCIA — Isaac, 2026-09-03: «vamos con la opcion a»

**Y el numero que lo hacia facil de decidir, medido antes de preguntar:**

| | |
|---|---|
| **Lo que crece el REPOSITORIO** | **12 lineas** (`package.json` + `package-lock.json`). `node_modules` **no se sube**, asi que los 5,7 MB del paquete se quedan en el equipo |
| Lo que se baja el navegador | **~136 KB comprimidos**, y **solo en la pantalla de la melodia** |
| Vulnerabilidades que anade | **0** |
| **¿Va en lo que carga TODA la app?** | 🔴 **NO, y esto es lo que habia que comprobar.** Se mide en `build-manifest.json`: los 7 archivos compartidos por todas las pantallas **no lo incluyen**. El catalogo no engorda ni un byte |

📌 **Por que el numero cambia la comparacion con P-06**, donde el eligio dejar el CDN: alli eran
**~20 MB** metidos en el repositorio de su primo. Aqui son **12 lineas**. No es la misma pregunta.

🔴 **Se carga con `import()` DENTRO del efecto, y son dos motivos, no uno:**
1. **No entra en el paquete del servidor** — `abcjs` toca `document` al dibujar, asi que en el
   servidor reventaria.
2. **No la paga quien no abre esa pantalla.** El catalogo se mira docenas de veces al dia y la
   melodia casi nunca.

**`src/components/sheets/Pentagrama.tsx` (nuevo)** es el que dibuja la partitura de verdad, con
`transponer` para la trompeta (+2, el numero sale de `lib/transpositores.ts`, D-28). Ante un ABC a
medio escribir **avisa y sigue**: no puede tumbar la pantalla.

#### ✅ LA MELODIA POR SECCIONES — la otra mitad del encargo (2026-09-03)

Isaac lo pidio en la misma frase que el pentagrama: *«y tambien las secciones para que sepa por
donde va»*. Para un trompetista eso no es adorno: es lo unico que le dice si lo que lee es la
Intro, el coro o el puente.

🔴 **REUSA `parseSections`, no escribe un tercer partidor.** Y aqui si vale —al reves que en la
letra, que necesito el suyo— porque `parseSections` junta las lineas con un espacio, y **en ABC el
espacio ES el separador**: una melodia en tres renglones significa lo mismo que en uno.

| Pieza | Que hace |
|---|---|
| `tramosDe(melodia)` | Parte la melodia guardada en tramos, uno por seccion |
| `melodiaDeTramos(tramos)` | El camino de vuelta, para guardar |
| `andamioDeMelodia(acordes)` | **Las secciones de la cancion, ya puestas y vacias** — no se arranca de una pantalla en blanco |
| `tieneMelodia(m)` | Si hay algo escrito de verdad |

⚠️ **Se ofrecen TODAS las secciones, sin decidir cuales llevan melodia.** Isaac ya zanjo esto con
las letras: *«a veces se repiten estrofas, a veces son instrumentales, a veces solos de guitarra,
no es algo fijo»*. **La que se quede vacia es que no la toca la trompeta** — el dato lo pone el.

⚠️ Y se filtran los tramos vacios porque **`parseSections("")` no devuelve una lista vacia**:
devuelve una seccion con un espacio (contrato real, documentado en O-44). Sin el filtro, una
melodia en blanco pintaria un pentagrama fantasma.

#### 🔴 Un tropiezo que ya esta escrito y volvio a pasar: los `
` del heredoc

Al escribir `melodia.ts` por consola, los `
` de dos plantillas **se convirtieron en saltos de
linea de verdad** y el archivo no compilaba. Es la trampa que ya se conocia —*«los heredoc pierden
las barras invertidas»*—.
📌 **La regla, para no repetirla:** cualquier texto con escapes (`
`, `	`, `\`) **se escribe con
la herramienta de edicion, no por consola.**

#### 🔜 R.0 — LA MIGRACION: escrita, con copia, SIN EJECUTAR

**`20240021_sheet_melody.sql`** — `alter table sheets add column if not exists melody text`.

🔴 **Es de las seguras, y conviene decir por que:** **anade, no quita** —T-07 fue por quitar— y
**nace NULL, sin `default`**, asi que **ninguna fila que ya existe cambia de significado** — que es
justo lo que enseño L-121 con el `status` de los cultos. Y **no toca ninguna politica**: quien
puede leer una cancion puede leer su melodia, igual que la letra.

**Copia previa hecha:** `_RESPALDOS\Partituras-datos-2026-09-03` — **72 canciones**, 14 categorias,
99 vinculos, 12 versiones por tono. *(Faltan las de borrador, por lo de siempre: la
`service_role`. No importa aqui: esta migracion no toca el contenido de ninguna fila.)*

#### ✅ R.2 HECHO (2026-09-03) — la seccion «Melodia», escrita para AGUANTAR que la columna no exista

**Y ese es el orden que manda T-07:** primero el codigo que tolera, despues la migracion.

| Pieza | Que hace |
|---|---|
| `lib/navegacion.ts` | La entrada **«Melodia»**, con `ROLES_MELODIA`. **Una sola linea** y sale en el ordenador Y en el telefono — que es para lo que se unifico esa lista (P-09) |
| `app/(dashboard)/melodias/page.tsx` **(nuevo)** | La seccion propia. **Reusa `buscarCanciones`** (D-21): no es un tercer catalogo |
| `components/sheets/MelodiaPanel.tsx` **(nuevo)** | El panel de dentro de la cancion: un tramo por seccion, andamio, y el selector Como suena / Trompeta |
| `SongDetailEditor.tsx` | Pestaña **«Melodia»** y modo `?ver=melodia`, calcado del modo letra (O-43) |
| `pruebas/melodia.test.mjs` | **7 pruebas mas** para las secciones. Total **187** |

#### 🔴 LA DECISION QUE EVITA UN DESASTRE: la melodia se guarda APARTE

**La letra viaja dentro del guardado general** — `SongDetailEditor` mete `lyrics` en el mismo
`update` que el titulo, los acordes y el resto. **Copiar eso con `melody` habria roto la app
entera:** mientras la columna no exista, ese `update` falla, y con el **falla guardar CUALQUIER
cancion** — titulo, acordes y letra incluidos.

📌 **O sea: el editor de acordes roto por una funcion que nadie esta usando todavia.** Es T-07 en
su version mas cara, y no se habria visto compilando.
→ **Boton propio, `update` propio.** Y lo mismo con la lectura: `melody` **no entra** en ninguna
consulta que traiga la cancion; se pide aparte, desde el panel.

#### 🔴 Y si la columna no esta, SE DICE. No se finge

Las dos pantallas —la lista y el panel— detectan el error `42703` («esa columna no existe») y
sacan un aviso: **«Todavía no se puede guardar. Falta añadir la columna…»**.

📌 **Por que importa tanto:** un boton que parece funcionar y no hace nada es **el fallo que mas
caro salio en este proyecto** — P-01, el «desactivar usuario» que no desactivaba, que estuvo meses
mintiendo. Guardar en silencio y perder la melodia seria exactamente eso.

**Comprobado en la captura, con la columna todavia sin crear:** sale el aviso amarillo, el boton de
guardar esta apagado —no hay cambios— y el hueco explica que pulsar. **Que es justo lo que tiene
que pasar.**

#### 🔴 Y el `
` del heredoc MORDIO OTRA VEZ, el mismo dia que se escribio la leccion

Al montar el ejemplo de acordes por consola, los `
` volvieron a convertirse en saltos de linea de
verdad y el build revento.
📌 **La regla ya estaba escrita y aun asi se repitio**, asi que sube de sitio: **cualquier texto con
escapes se escribe con la herramienta de edicion, no por consola.** Y mejor todavia: **usar una
plantilla de varias lineas**, que no necesita ni un `
` — que es como quedo.

**Comprobado:** **187 pruebas** · lint **0 errores** · build **0** · **26 de 26 pantallas** ·
`/melodias` **200 con admin** y el aviso de la columna saliendo.

⬜ **Lo que NO se ha podido probar aqui:** que a un **lector o musico** la seccion le rebote. La
cuenta de prueba es admin (D-14). El camino es **el mismo codigo que `/letras`**, que si se probo
por las dos caras el 2026-08-21.

#### ✅ R.3 HECHO (2026-09-03) — escribir tambien a mano

Boton **«Escribir a mano»** dentro del panel: cambia el pentagrama por un campo de texto con el
ABC. Sirve para **pegar una melodia de fuera** o **arreglar algo que el editor no deje hacer**.

🔴 **NO es un modo aparte con sus propios datos: es EL MISMO texto** que escribe el raton. Por eso
se puede escribir a mano, volver al pentagrama, y seguir con el raton donde se dejo. Dos almacenes
distintos habrian acabado pisandose el dia menos pensado.

⚠️ Usa **`AutoTextarea`**, que ya existe: crece con el texto y **no da el salto de scroll** que
costo O-45 y O-46. Es el mismo error que se cometio con la letra —una pantalla nueva que no hereda
las comodidades de la de al lado— y esta vez se evito mirando primero.

**Comprobado:** 187 pruebas · lint 0 errores · build 0 · 26 de 26 pantallas · y **mirado en
captura**: el boton sale y los textos ya llevan tilde.

#### 🔴 El `
` del heredoc, TRES veces en un dia

Se rompio en `melodia.ts`, en la pagina de prueba y en `MelodiaPanel`. La leccion estaba escrita
desde la primera.
📌 **Y lo que la hace cumplirse no es acordarse, es que no haga falta:** los textos de varias
lineas van en **plantilla** (`` ` `` de varias lineas), que **no lleva ni un escape**. Una regla que
depende de la memoria es una deuda — lo mismo que enseño T-04 con «acuerdate de parar el
servidor», que fallo tres veces hasta que se cambio por un script.

#### 🔴 O-58 · «TENGO QUE PINCHAR A UNA DISTANCIA» — el fallo que solo se veia usandolo

Isaac, 2026-09-03, con dos capturas: *«para hacer la melodia con el mouse tengo que hacerla con el
raton a una distancia, y cuando me acerco no puedo hacer nada»*.

**Y tenia toda la razon.** Eran DOS fallos en el mismo sitio, y los dos de la misma familia:
**recalcular a mano algo que el navegador ya sabe.**

**① La cuenta de donde se ha pinchado estaba MAL en la X.**
El SVG llevaba `preserveAspectRatio="… meet"`, que escala el dibujo por **la dimension que se
queda corta** —aqui la ALTURA, que esta fija— y luego lo **pega a la izquierda**. Asi que el dibujo
ocupaba solo una parte del ancho del elemento. Pero la cuenta hacia `viewBox.width / rect.width`,
o sea **daba por hecho que el dibujo se estiraba de lado a lado**. No se estiraba.

📌 **Y la Y acertaba DE CASUALIDAD**, porque la altura si era la dimension que mandaba. Por eso las
notas caian a la altura correcta y **solo el lado estaba desplazado** — que es exactamente lo que
hace este fallo tan raro de describir, y lo que el describio muy bien.

**Medido en el navegador, antes y despues, con una medida temporal puesta en la pagina:**

| Pinchando a 300 px del borde | Columna que daba |
|---|---|
| **Cuenta vieja** | **4** |
| **Cuenta nueva** | **6** |
| Desfase | **93 px** — y crece cuanto mas a la derecha |

→ **Arreglo: `getScreenCTM()`**, que es la matriz que usa el propio navegador para pintar. Ya lleva
dentro el `viewBox`, el `preserveAspectRatio` y cualquier transformacion de CSS. Reimplementarla a
mano es apostar a acertar las tres.

**② Y al medirlo aparecio un SEGUNDO fallo que el todavia no habia visto.**
El pentagrama iba a lo ancho del hueco, asi que **al pasar de unas 26 notas el dibujo entero
empezaba a hacerse pequeño** — justo cuando una melodia empieza a ser de verdad. Ademas quedaba
una franja en blanco a la derecha, sin pentagrama, que igualmente aceptaba clics.
→ **Ahora el pentagrama tiene su tamaño y la caja se desplaza de lado**, como una partitura en
papel. La nota mide lo mismo se escriban 5 o 50.

**Comprobado despues:** el desfase pasa de **93 px a 0**, y la escala se queda **constante en
0,867** en vez de encoger. 187 pruebas · lint 0 · build 0.

📌 **La leccion de metodo, y es la de siempre en otra piel:** *cuando la plataforma ya calcula algo
—una transformacion, un codigo de salida, una escala— no se recalcula: se le pregunta.* Es T-16
otra vez (deducir el resultado del build de su texto en vez del codigo de salida).
📌 **Y la de comprobacion:** esto no se caza mirando la captura —el pentagrama se dibujaba
perfecto— ni compilando. Se cazo **poniendo la cuenta vieja y la nueva a la vista en la pagina y
leyendo los dos numeros**. Es la misma tecnica que salvo O-52.

#### ✅ R.4 — lo que decidio Isaac (2026-09-03)

| Donde | Su respuesta |
|---|---|
| **La pantalla completa del culto** | ✅ **SI, un tercer modo.** Un boton que alterna **acordes ↔ letra ↔ melodia**, igual que ya se hizo con la letra (J.4). El trompetista lee su pentagrama tocando |
| **El PDF del culto** | ⬜ **Todavia no.** Primero que funcione en pantalla y haya melodias escritas |

🔴 **Y el riesgo que hay que esquivar al montarlo, que es T-07 en su sitio mas caro:** la letra
viaja **dentro del `select` de la pantalla del culto** (`sheet:sheets(…, lyrics)`). Meter ahi
`melody` mientras la columna no exista **haria fallar la consulta entera** — y entonces
**el culto sale VACIO en mitad del servicio**, sin error visible. Es exactamente el catalogo en
blanco de los 3 minutos.
→ **La melodia se pide APARTE y tolerando que la columna falte**, igual que en el panel.

⚠️ **Y NO va en el enlace publico del culto** (`/s/<token>`), por lo mismo que la letra (D-22): esa
pantalla la abre gente sin cuenta. Su `select` **ni siquiera pide `lyrics`** hoy — la melodia sigue
esa misma regla.

#### ✅ R.4 HECHO (2026-09-03) — el tercer modo, y el riesgo esquivado

**Un solo boton que rota `acordes → letra → melodia`**, no tres botones. Se lee tocando y con una
mano ocupada: tres sitios donde mirar en esa barra es peor que uno que va girando.

| Pieza | Que hace |
|---|---|
| `src/lib/melodiaBase.ts` **(nuevo)** | `melodiasDe(supabase, ids)` — pide las melodias **aparte** y devuelve un mapa. **Nunca lanza**: si la columna no existe, si la consulta falla o si no hay ids, devuelve vacio |
| `services/[id]/present/page.tsx` | La pide despues del `select` del culto, y **solo si el rol la puede ver** |
| `catalog/[id]/present/page.tsx` | Lo mismo para la pantalla completa de una cancion |
| `types/index.ts` | `PresentSong.melody`, hermano de `lyrics` |
| `PresentationView.tsx` | El tipo `Modo`, la rotacion `siguienteModo()`, el boton y la rama que dibuja |

🔴 **POR QUE VA EN UN ARCHIVO APARTE Y NO EN EL `select`, que es lo que costaba caro:** la letra
viaja **dentro** de la consulta del culto (`sheet:sheets(…, lyrics)`). Meter ahi `melody` mientras
la columna no exista **haria fallar la consulta entera**, y entonces **el culto sale VACIO en mitad
del servicio**, sin error visible. Es el catalogo en blanco de los 3 minutos (T-07) en la pantalla
que se usa tocando. → Se pide aparte, y si la columna no esta, **no hay melodias y punto**.

📌 **Y por que el coste es aceptable, que es la otra mitad:** es **una consulta, en una pantalla**,
y solo para quien puede ver la melodia. **No es el middleware** — alli un viaje a la base cuesta lo
mismo en cada clic de cada persona, y por eso tumbo la pagina (T-17).

⚠️ **`melodiaBase.ts` NO puede vivir en `lib/melodia.ts`**, y no es capricho: aquel es logica pura y
lo compila `pruebas/preparar.mjs` con `tsc` a secas para el CI. En cuanto importara el cliente de
Supabase dejaria de compilar. Es la misma razon por la que `catalogo.ts` nunca entro en esa lista.

⚠️ **NO va en el enlace publico del culto** (`/s/<token>`), por lo mismo que la letra (D-22): esa
pantalla la abre gente sin cuenta. Su `select` ni siquiera pide `lyrics` — la melodia sigue la
misma regla, y ademas **el texto no sale del servidor** para quien no debe verlo.

#### Las cuatro decisiones de dibujo, para no rediscutirlas

1. **El boton solo aparece si esa cancion tiene letra o melodia**, y la rotacion **salta lo que no
   existe**: sin melodia escrita va `acordes → letra → acordes`. *Un boton que lleva a una pantalla
   vacia es peor que no tenerlo.*
2. **La eleccion SE MANTIENE al pasar de cancion**, y si la siguiente no tiene lo elegido salen los
   acordes **sin perder la eleccion** — en cuanto llega otra que si lo tiene, vuelve sola. Es la
   correccion que Isaac ya hizo con la letra: *se degrada, no se reinicia*.
3. 🔴 **La melodia va a UNA COLUMNA SIEMPRE**, aunque el musico tenga puestas dos o tres. Un
   pentagrama estrecho no se lee: `abcjs` reparte sus renglones segun el ancho que se le de, asi que
   darle el ancho entero es lo que hace que quepan mas compases por linea (es O-56 otra vez).
4. **En melodia NO se auto-ajusta el tamaño.** `abcjs` se carga diferido y dibuja **despues** del
   efecto de ajuste, asi que ahi se mediria una caja vacia y la escala se iria al tope. El
   pentagrama usa la escala que haya, acotada a 0,8–2, y los `+`/`−` la siguen moviendo.

#### 🔴 Y un fallo que se caza SOLO si alguien baja el tono (L-225)

La melodia se mueve con **el mismo desplazamiento que los acordes** —tono del culto + los `±` del
musico + su instrumento—, porque si se moviera por su cuenta el trompetista leeria una cosa y el
grupo tocaria otra. Pero ese numero viene **normalizado a 0..11**, y eso **vale para nombrar un
acorde y miente para colocar una nota**: bajar un semitono se convertia en **subir once**, y la
melodia se iba al techo del pentagrama con lineas adicionales.
→ Se coge **la direccion mas corta** (`> 6` pasa a `− 12`).
⚠️ **Con la trompeta sola no se ve**: son +2, que esta por debajo de la mitad y sale bien. Solo
muerde combinando instrumento y `±`, que es justo lo que ningun caso de prueba tocaba.

#### 📸 COMPROBADO MIRANDOLO, que es lo unico que vale en un dibujo

🔴 **Y habia un problema para poder mirarlo: sin la columna en la base NINGUNA cancion tiene
melodia**, asi que el modo nuevo **no se puede alcanzar** por el camino normal. → Pagina desechable
**`/melodia-prueba`**, que le pasa a `PresentationView` —el componente de verdad, sin tocar— una
cancion con su melodia puesta a mano. Es la **cuarta** desechable del proyecto; se borra con su
linea del middleware antes de publicar, como las tres anteriores.

| Lo que se vio en la captura | |
|---|---|
| Modo acordes | la cuadricula de siempre, y el boton con el microfono |
| Modo letra | las estrofas, y el boton ya ofreciendo la melodia |
| **Modo melodia** | **dos pentagramas, uno por seccion**, con su titulo, a lo ancho, en 4/4 |
| **Modo melodia + Trompeta** | el tono pasa a **D** y el pentagrama sale con **dos sostenidos**, todo un tono arriba — **lo mismo que hacen los acordes** |

#### 🔴 Lo que enseño montar esa captura (L-224)

El primer intento pulsaba el boton **un numero fijo de veces**, con esperas de 400 ms. Salio **el
modo equivocado, y distinto en cada ejecucion**: la primera pulsacion caia **antes de que el
navegador terminara de hidratar**, asi que el clic no hacia nada y tampoco daba error.
→ **Se pulsa HASTA LLEGAR, mirando el estado real** —la etiqueta del propio boton, que dice a donde
lleva—, no un numero de veces.
📌 *Espera por el ESTADO, nunca por el tiempo ni por una cuenta de pasos.* Y aqui el agravante es
que lo que se estaba comprobando era **una captura**: una comprobacion de dibujo que enseña la
pantalla equivocada **no falla, engaña** — y encima con una imagen que parece una prueba.

#### Comprobado con la columna TODAVIA SIN CREAR, que es como va a estar produccion

Entre el push y la migracion, produccion va a estar exactamente asi. **Es la comprobacion que
importa**, no la del caso feliz:

| | |
|---|---|
| Tipos (`tsc --noEmit`) | **0 errores** |
| Lint | **0 errores** · 61 avisos — **los mismos 13 de `PresentationView` que ya habia**, medido contra la version publicada |
| Pruebas | **187 verdes** |
| Build | **codigo de salida 0** |
| Pantallas | **26 de 26** |
| Presentacion de una cancion | **200**, 33 acordes, 0 errores |
| Presentacion del culto | **200**, 37 acordes |
| **El boton de melodia** | **NO aparece** en ninguna — correcto: no hay ninguna escrita |
| `abcjs` en lo que carga TODA la app | **NO** (6 archivos compartidos, ninguno lo trae) |

⬜ **EL PUNTO CIEGO, y hay que decirlo:** el raton **no deja rastro en el HTML**. La captura prueba
que el pentagrama se DIBUJA bien; que arrastrar una nota la afine, que `Supr` borre la que toca y
que deshacer vuelva atras **solo se comprueba con la mano** — y hay que probarlo **tambien en la
tablet**, que es para lo que se hizo con `PointerEvent`.

**O-59 · Usar la pagina COMO APP, sin ir al navegador, y que se actualice sola.** ⬜ **ANOTADA.**
Isaac, 2026-09-03: *«hay una manera en la que se pueda usar como app tambien, pero que cada cambio
enseguida actualice en la app; he escuchado de que se puede usar la app desde el navegador, no se
como sea eso, pero seria super que se tenga una app que tener que ir al navegador»*.

🔴 **LO QUE PIDE YA EXISTE, y esa es la respuesta: la pagina YA ES INSTALABLE.** Se llama **PWA**,
y es exactamente lo que el habia escuchado. Comprobado en el codigo, no supuesto:

| Pieza | Estado |
|---|---|
| `public/manifest.json` | ✅ `display: standalone` (sin barra de direcciones), `start_url: /catalog`, nombre e iconos de 192 y 512 con el logo de la iglesia (D-12) |
| `public/sw.js` | ✅ registrado, **network-first** |
| `PWARegister.tsx` | ✅ lo registra **solo en produccion** |
| El caché versionado | ✅ desde r45 (P-12): se registra como `/sw.js?v=<commit>`, asi que cada despliegue **instala el nuevo y borra el viejo** |

**Como se instala** —esto es lo unico que hay que decirle, no hay que programar nada—:
* **Android (Chrome/Edge/Brave):** menu de tres puntos → *«Instalar aplicacion»* / *«Anadir a
  pantalla de inicio»*.
* **PC (Chrome/Edge):** un icono de instalar **en la barra de direcciones**, a la derecha.
* **iPhone:** ⚠️ **solo con Safari** — Compartir → *«Anadir a pantalla de inicio»*. En Chrome de
  iPhone **no se puede**, y no es cosa nuestra: lo prohibe Apple.

✅ **Y lo de «que cada cambio actualice enseguida» TAMBIEN esta resuelto**, y por dos motivos que
conviene no confundir:
1. El service worker es **network-first**: con internet **siempre pregunta al servidor primero**,
   asi que se ve lo ultimo. El caché es solo el respaldo de cuando la red falla.
2. El caché lleva **el id del despliegue**, asi que al publicar se limpia el anterior (P-12).

#### ⚠️ Las TRES cosas que hoy NO hace, dichas antes de que las descubra usandola

1. **Una app que se queda ABIERTA no se entera sola.** Si deja la app abierta y se publica algo, lo
   nuevo entra al navegar o al cerrarla y volver a abrirla, pero **no hay un aviso** de *«hay una
   version nueva»*. → Eso si seria programar: escuchar el `updatefound` del service worker y sacar
   una barrita con un boton de recargar. **Es lo unico de aqui que vale la pena hacer.**
2. 🔴 **SIN INTERNET NO HAY CANCIONES, aunque la app abra.** El service worker **no toca las
   peticiones a Supabase** —esta escrito asi a proposito— y las canciones viven ahi. Asi que sin
   red se ve la cascara y nada dentro. **Esto es lo que mas puede decepcionar**, porque «app
   instalada» suena a «funciona sin internet» y **no es el caso**.
   → Hacerlo de verdad es un trabajo aparte: guardar el repertorio del culto en el aparato.
3. ~~**`orientation: portrait-primary`** fuerza vertical.~~ ✅ **RESUELTO el 2026-09-04, y lo pidio
   el:** *«como se hace para que pueda leerse de manera horizontal, porque todos los que usamos
   dispositivo movil leemos de manera horizontal»*.
   → **Eligio «que siga al telefono» (`"orientation": "any"`)**, no «siempre horizontal».
   **Y es lo correcto**, aunque el titulo de su pregunta dijera «horizontal»: lo que pidio fue que
   **PUEDA** leerse asi. Con `landscape` a la fuerza, **el login, el catalogo y el panel de
   administracion** tambien saldrian de lado, y buscar una cancion o teclear una letra en horizontal
   es incomodo. Con `any` el que quiera horizontal gira el aparato y ya.

   ⚠️ **Tres cosas que hay que saber, porque explican por que esto no se habia notado nunca:**
   * **Esa linea solo manda en la app INSTALADA.** En el navegador **no hace nada** — ahi gira
     desde siempre. Por eso el fallo aparece **justo al instalarla**, que es lo que se le acababa de
     recomendar en O-59.
   * **En iPhone no manda de todas formas:** Safari **ignora** la orientacion del manifiesto. Esto
     afecta sobre todo a **Android**.
   * 🔴 **El manifiesto se lee AL INSTALAR.** Quien ya tenga la app puesta **no se entera del
     cambio**: hay que **desinstalarla y volver a instalarla**. Publicar no basta, y eso hay que
     decirselo o va a creer que no funciono.

📌 **Recomendacion, con su orden:** que **la instale hoy** —no cuesta nada y es lo que pedia—, y si
al usarla le molesta no enterarse de las novedades, se hace el punto 1, que es pequeño. El punto 2
solo si de verdad se queda sin datos en el templo, porque es el caro. **No se programa nada hasta
que el lo diga.**

#### ✅ INSTALADA (2026-09-04) — y por el camino salio POR QUE no le funcionaba

Isaac la instalo y **entro al menu de aplicaciones, sin escudo de navegador**. Pero al primer
intento le quedo mal, y el diagnostico vale para no volver a perder el rato:

🔴 **BRAVE NO FABRICA LA APP. Da un ACCESO DIRECTO y no lo dice.**
En Android, instalar una web de verdad genera un **WebAPK** —un paquete que fabrica un servicio de
Google—. Brave lo tiene desactivado por privacidad, asi que **cae en el acceso directo**: se queda
solo en el escritorio, **con el escudo de Brave encima del icono**, y abre dentro del navegador.

⚠️ **Y lo que lo hace tan dificil de ver: el menu de Brave ofrece las dos cosas juntas**
—«Install» y «Create shortcut»— y **aunque se pulse «Install», sale el acceso directo**. El dialogo
de «Install app» con el nombre y el icono correctos **aparece igual**, asi que parece que fue bien.

📌 **Como se distingue, y son las tres senales de la captura:**

| | Acceso directo (lo que daba Brave) | App de verdad (Chrome) |
|---|---|---|
| El aviso | «Add to Home screen? — 1 x 1», el del escritorio de Android | 🔴 **«Adding Partituras to the Home screen · Downloading»**, con barra de progreso — es el WebAPK fabricandose |
| El icono | **con el escudo del navegador** en la esquina | limpio |
| Donde queda | **solo en el escritorio** | **en el MENU DE APLICACIONES**, con las demas |

#### ¿Y POR QUE Chrome si y Brave no? — lo pregunto Isaac, y es lo que da sentido a todo

**Porque una app de Android tiene que estar FIRMADA, y una pagina web no puede firmarse a si misma.**

Para que algo entre en el menu de aplicaciones tiene que ser un **paquete de Android de verdad**,
con su nombre, su icono y su firma. Android no deja que una pagina se instale sola: alguien de
confianza tiene que **construir y firmar** ese paquete.

→ **Ese alguien es un servidor de Google.** Chrome le manda **el manifiesto** —nombre, iconos,
`start_url`, colores—, el servidor **fabrica el paquete, lo firma y lo devuelve**, y los servicios
de Google Play lo instalan. 📌 **Eso es literalmente lo que decia el aviso de su captura:
«Adding Partituras to the Home screen · Downloading»** — se estaba **bajando la app recien
fabricada**. No es que estuviera bajando la pagina.

→ **Brave no hace esa llamada, y es a proposito, no un fallo.** Todo el producto de Brave consiste
en no mandarle cosas a Google; **pedirle a un servidor suyo que te construya una app —mandandole de
paso que sitio estas visitando— es justo lo que evitan**. Sin esa pieza no hay paquete que
instalar, asi que **cae en lo unico que puede hacer solo: un acceso directo**.

⚠️ **Y por eso engaña tanto:** Brave es **Chromium por dentro**, asi que **el menu y los dialogos
son los mismos** —«Install app», con el nombre y el icono correctos—. Lo que falta esta **detras**,
y **degrada en silencio**: mismo boton, mismo cartel, resultado distinto.

📌 **No es «Brave esta roto»:** es un intercambio deliberado —privacidad a cambio de no poder
instalar ninguna web como app—. Pero hay que saberlo, porque **el que lo sufre cree que la culpa es
de la pagina**.

→ **La instruccion para Isaac y para cualquiera del grupo: se instala con CHROME.** Con Brave
—y con cualquier navegador que renuncie a los servicios de Google— sale el acceso directo.

⚠️ **Y antes de repetirlo hay que BORRAR el acceso directo anterior**, o quedan dos iconos y no se
sabe cual es cual.

#### El ICONO: se ofrecieron tres y se le enseñaron dibujadas

🔴 **Antes de esto yo le habia dicho que el circulo blanco «probablemente era culpa del icono», y
me equivoque.** Al generar las tres versiones y recortarlas como hace Android se vio que **no**:
el logo **ya es transparente** —es el mismo PNG «removebg» de la pestaña (D-12), comprobado:
512x512 RGB+alfa— y **el circulo lo pinta el lanzador**, porque un icono `purpose: "any"` no puede
usarse como forma de icono adaptativo.

| | Que sale |
|---|---|
| **A · como esta hoy** (`purpose: "any"`) | El sello **llena el recorte redondo**, y encaja porque **el logo ya es redondo**. Solo en el recorte cuadrado asoman las esquinas blancas |
| **B · maskable con fondo blanco** | 🔴 **PEOR.** Para que el recorte no muerda el aro gris hay que encoger el logo, y queda pequeño con mucho blanco muerto |
| **C · maskable con el azul de la app** (`#191c4d`) | Llena de borde a borde en las dos formas, con el sello centrado. Como WhatsApp o Instagram |

📌 **Y la leccion de metodo, que ya es la tercera vez que se aplica** (O-47, O-51): **esto es un
dibujo, asi que se ENSENA.** Se generaron las tres con `System.Drawing` desde el PNG original y se
compusieron **recortadas en circulo y en cuadrado redondeado**, que es lo que hace el lanzador.
Describirlo por escrito habria costado varias vueltas — y encima me habria dejado con mi suposicion
falsa, porque **fue el render el que la tumbo**.

⚠️ **Si algun dia se elige la C hay que generar el icono CON MARGEN**, no declarar `maskable` el que
hay: el lanzador recorta ~10 % por cada lado y **le comeria el aro gris al sello**. El logo va al
**66 %** dentro del lienzo. Las tres versiones estan generadas en el `scratchpad` de esa sesion; el
guion que las hace es media pagina.

#### ✅ ELIGIO LA A: se queda como esta (2026-09-04) — *«deja el icono asi»*

**Nada que programar.** El manifiesto sigue con `purpose: "any"` y el PNG transparente de D-12.
📌 **Y tiene sentido, no es conformarse:** su logo **ya es un sello redondo**, asi que encaja solo
con el recorte redondo de Android — que es el que usa su lanzador. En su menu de aplicaciones queda
**igual que Mi Claro, Nequi o Translate**, que tambien van sobre fondo claro. **No desentona.**
→ **No se vuelve a proponer.** Si algun dia lo pide, la C esta descrita arriba con su aviso.

**O-60 · TODOS los dialogos con el diseno de la app, no los del navegador.** ⬜ **PROPUESTA.**
Isaac, 2026-09-04, con dos capturas —el cartel gris del navegador al borrar un culto, y el dialogo
bonito de «Cambios sin guardar»—:

> *«quiero que modifiques el cuadro del dialogo que sale en la primera imagen para que sea como la
> segunda… ahora que no sea solamente para este caso, que sea para TODO en lo que vaya a saltar un
> cuadro de dialogo que salga con el diseno de la segunda imagen»*

**Medido antes de proponer nada — son TRES, y estan todos localizados:**

| Donde | Que pregunta | Que pasa si se acepta |
|---|---|---|
| `ServiceEditor.tsx:395` | *«¿Eliminar el culto "X"?»* | **Se borra el culto entero** — es el de su captura |
| `SongKeyVersions.tsx:113` | *«¿Eliminar la version en X?»* | Se borra esa version por tono |
| `SongKeyVersions.tsx:126` | *«¿Regenerar los acordes…?»* | 🔴 **Se pierden los arreglos manuales** de esa version |

→ **Los tres son DESTRUCTIVOS.** Ninguno es un simple aviso. Y **no hay ningun `alert()` ni
`prompt()`** en toda la app, comprobado — asi que con estos tres se acaba el trabajo.

#### 🔴 Y de propina, el hallazgo que hace que esto valga el doble: P-09 OTRA VEZ

**El dialogo bonito esta escrito DOS VECES**, en `ServiceEditor.tsx:513` y en
`SongDetailEditor.tsx:409`. **Comprobado que son identicos salvo UNA FRASE** —«en el culto»— igual
que se hizo antes de unificar `parseSections`.

📌 **Es la cuarta vez que muerde este patron en el proyecto** —la consulta del catalogo, la lista de
secciones del panel, `parseSections`, y ahora este—. Y aqui iba a morder otra vez de inmediato: sin
unificar, **atender esta peticion habria escrito una TERCERA copia**.

#### El plan, en un solo componente

**`src/components/ui/Dialogo.tsx` (nuevo)** — el cuadro con el diseno que el eligio, y **dos
formas de usarlo**:
* **Confirmar** (2 botones): el de sus tres `confirm()`.
* **Tres opciones**: el de «Cambios sin guardar», que ya existe y no cambia de aspecto.

#### ✅ SU DECISION (2026-09-04): boton ROJO en los que borran

Se le ofrecieron las dos —rojo de peligro o azul como el de guardar— y eligio **rojo**.
📌 **Y es lo correcto porque los tres casos son irreversibles:** con todo del mismo color, *borrar
el culto* se ve igual que *guardar cambios*. El color es la unica pista que se lee **antes** de
pulsar; despues ya no sirve de nada.
**El resto del dialogo no cambia**: es el mismo que el de «Cambios sin guardar», que es el que el
señalo en su captura.

⚠️ **Y lo que hay que respetar al cambiar un `confirm()` por esto, que no es cosmetico:**
`confirm()` **detiene el programa** hasta que el usuario contesta; un dialogo dibujado **no**. Asi
que la accion no puede seguir escrita debajo del `if`: tiene que **guardarse y ejecutarse cuando se
pulsa el boton**. Si se hace mal, **se borra el culto sin preguntar** — que es exactamente lo
contrario de lo que se pide.

#### ✅ O-60 HECHA (2026-09-04) — y son DOS rojos, no uno

**`src/components/ui/Dialogo.tsx` (nuevo)** — el cuadro de la app, con dos formas de usarlo:
`Dialogo` (los botones que se le pasen) y `DialogoConfirmar` (el caso de dos botones que sustituye
a `confirm()`).

| Sitio | Antes | Ahora |
|---|---|---|
| Borrar un culto | `confirm()` del navegador | **«Eliminar el culto»**, botón rojo |
| Borrar una versión por tono | `confirm()` | **«Eliminar esta versión»** |
| Regenerar los acordes | `confirm()` | **«Regenerar los acordes»**, avisando de que **se pierden los ajustes a mano** |
| «Cambios sin guardar» ×2 | **escrito a mano DOS VECES** | **el mismo componente** |

**Comprobado:** **0 `confirm()`, `alert()` ni `prompt()`** en `src/` —solo quedan menciones en
comentarios— y **0 copias del cuadro escritas a mano** fuera de `Dialogo.tsx`.

#### 🔴 Y un ajuste que solo enseñó la CAPTURA

La primera versión reusaba para «Eliminar» el rojo **contorneado** de «Descartar cambios». Compilaba,
y **estaba mal**: contorneado se lee como **secundario**, y ahí «Eliminar» es la acción **principal**
del diálogo. En la vista previa que se le enseñó a Isaac iba sólido.
→ **Dos rojos, y el motivo es el PAPEL del botón, no el color:**
* **`peligro`** — sólido. La acción principal («Eliminar», «Regenerar»).
* **`peligro-suave`** — contorneado. Una salida destructiva que **no** es la principal, como
  «Descartar cambios» junto a «Guardar y salir».

📌 **Se cazó mirando, no compilando** — quinta desechable del proyecto (`/dialogo-prueba`), borrada
con su línea del middleware antes de publicar. Y la captura del de tres botones sirvió para lo
contrario: **demostrar que unificar NO cambió nada** de lo que a él ya le gustaba.

⚠️ **Escape cierra el diálogo**, como hacía `confirm()`. Sin eso, lo nuevo se sentiría más atrapado
que lo que viene a sustituir. **No cierra mientras la acción está en curso** (`ocupado`), para no
dejar un borrado a medias sin pantalla.

**O-61 · Faltaba la red de seguridad en TRES sitios donde se pierde trabajo.** ⬜ **MEDIDO.**
Isaac, 2026-09-04, despues de O-60: *«tambien me sale el cuadro de dialogo para confirmar una
edicion de por ejemplo el orden de las canciones en un culto… fijate si sale en otros lugares,
sino, implementalos donde sea pertinente y lo subes enseguida»*.

📌 **El que el describe YA funciona** —el del culto, convertido en O-60—. Lo que pidio de verdad es
**buscar donde FALTA**. Y faltaba en tres, medido recorriendo todo lo que escribe en la base:

| Donde | Que pasa hoy | Que se pierde |
|---|---|---|
| 🔴 **`/sheets/new` · crear cancion** | **NADA. Ni dialogo ni aviso al cerrar la pestaña** | **La cancion entera**: titulo, tono, compas, categorias y **todos los acordes tecleados** |
| 🔴 **`MelodiaPanel`** | Sabe que esta `sucio` —lo usa para su boton— pero **nadie de fuera lo escucha** | La melodia escrita nota por nota |
| 🔴 **`SongKeyVersions`** | `patchLocal` cambia la version en local, con su propio «Guardar version» | Los acordes de esa version por tono |

🔴 **Y hay un cuarto, que es el mismo fallo de O-43 repetido:** el guardian de `SongDetailEditor`
solo actua si `mode === "edit" || mode === "letra"`. **El modo `melodia` NO esta en esa lista**, asi
que aunque la melodia entrara en el `snapshot`, el dialogo no saltaria.

📌 **Es literalmente la leccion de O-43, otra vez:** *cuando se anade un modo o un panel a una
pantalla que YA protege datos, hay que repasar que protecciones se quedaron mirando solo a lo
viejo.* Alli fue la letra; aqui, la melodia — que la escribi yo hace dos dias **sabiendo** que esto
habia pasado antes.

#### Lo que se hace

1. **`SongDetailEditor`** — el `snapshot` pasa a mirar tambien **la melodia** y **las versiones por
   tono**, y el modo `melodia` entra en la lista de modos protegidos.
2. **`MelodiaPanel` y `SongKeyVersions`** avisan hacia fuera cuando tienen algo sin guardar.
3. **`/sheets/new`** estrena la red entera: aviso al cerrar la pestaña **y** dialogo al salir.

⚠️ **En `/sheets/new` el dialogo es de DOS botones, no de tres, y es a proposito.** Alli «Guardar y
salir» **puede no ser posible** —sin titulo no se puede crear la cancion—, y un boton que a veces
no hace nada es **P-01, el fallo mas caro de este proyecto**. Se ofrece **«Salir y descartar»** en
rojo y **«Seguir escribiendo»**, que siempre son verdad.

#### ✅ O-61 HECHA (2026-09-04) — y por el camino salieron DOS huecos mas

| Sitio | Antes | Ahora |
|---|---|---|
| **`/sheets/new`** | 🔴 **Nada** | Aviso al cerrar la pestaña **y** dialogo al salir, interceptando **cualquier** enlace |
| **`MelodiaPanel`** | Sabia que estaba sucio y **no se lo decia a nadie** | `onSucio` → el editor lo protege |
| **`SongKeyVersions`** | Igual | `onSucio` → el editor lo protege |
| **El modo `melodia`** | 🔴 **Fuera de la lista de modos protegidos** | Dentro |
| 🔴 **Las pestañas Edicion / Letra / Melodia** | **Cambiaban de modo SIN pasar por la red** | Pasan por `requestLeave` |

🔴 **Los dos huecos que aparecieron al hacerlo, y que el no habia pedido:**

**① Solo la pestaña «Vista» pedia permiso para salir.** Las otras tres llamaban a `setMode`
directamente, asi que **ir de «Melodia» a «Letra» desmontaba el panel y se perdia lo escrito sin
decir nada**. → Las cuatro pasan ahora por `requestLeave`: *cambiar de pestaña es salir*.

**② Y un fallo que YO iba a introducir:** al desmontarse el panel, la marca de «sucio» se quedaba
puesta **para siempre**, asi que despues de descartar el editor creeria que hay cambios pendientes
hasta recargar. → Los dos paneles avisan `false` **al desmontarse**.

📌 **Y el aviso al cerrar la pestaña en `/sheets/new` merece su linea:** no es un dialogo nuestro,
es el del navegador —el unico que puede parar un cierre—. **Ahi si vale el del navegador**, porque
es el unico que existe; lo que Isaac no queria era el cartel gris **donde si podemos poner el
nuestro**. No son el mismo caso.

**Comprobado:** 187 pruebas · lint 0 · build 0 · **26 de 26 pantallas** · `/sheets/new` **200** y
**los cuatro modos de la cancion a 200** con sus 19 acordes.

⬜ **Y el punto ciego de siempre, que hay que decir:** esto **solo se ve usandolo**. Escribir media
cancion y pulsar «volver»; escribir una melodia y cambiar de pestaña; tocar una version por tono y
salir. **El HTML no dice si el dialogo salta** — lo prueba Isaac.

**O-56 · La rejilla no aprovechaba el ANCHO de la pantalla.** ✅ **HECHO (2026-09-02).**
Isaac, y es un hallazgo suyo de los buenos: *«ademas ahora que caigo en cuenta despues de tantos
meses, ¿por que las estructuras no aprovechan del ancho de la pantalla? porque mira que tambien
mucho espacio y no se aprovecha para nada»*.
*Causa, y llevaba ahi desde siempre:* la rejilla de la presentacion iba con **`max-w-6xl` /
`max-w-7xl`** —1152 y 1280 px—, asi que en un monitor ancho **todo lo que sobrara de ahi se
quedaba en blanco a los lados**.
📌 Un tope de ancho tiene sentido en un texto que se lee de corrido —lineas muy largas cansan—,
pero **esto es una cuadricula de acordes que se lee de un vistazo**: cuanto mas ancha, mas compases
por fila y menos hace falta envolver. → **Fuera los topes.** Y de rebote arregla medio O-52: con
mas ancho, muchas secciones ya caben enteras.

**O-55 · El nombre del AUTOR no sale en la presentacion.** ✅ **HECHO (2026-09-02).**
Isaac: *«quiero que quites el nombre del autor cuando sale en modo pantalla completa»*, y al ver que
lo habia atado solo a `isFullscreen`, con mayusculas: *«QUE NO SALGA EN EL MODO PANTALLA COMPLETA
PARA NADA, NI CUANDO NO SE PRESIONA F, NI CUANDO SE LE DA EL BOTON»*.
🔴 **Mi primera version estaba mal y la captura lo enseñaba:** la pantalla de presentacion se usa
tambien SIN pantalla completa del navegador, y ahi seguia saliendo. → **Fuera del modo presentacion
entero.** Sigue en la vista normal y en la tarjeta, que es donde informa.

**O-54 · Los COMPASES no reparten bien el ancho: el silencio se come la seccion.**
🟡 **MEDIO HECHO (2026-09-02).** La parte del ANCHO, arreglada y medida. La del ALTO, pendiente.

Isaac, 2026-09-02, con «Su Presencia» a pantalla completa:

> *«mira los silencios de blanca y fijate que **sobresale para abajo** en los compases, cuando
> tiene mucho espacio que no lo aprovecha… en la parte b y c que tiene silencio de blanca **coge
> mucho espacio tanto arriba y abajo como a los lados**; de la estructura b, el **75%** lo ocupa el
> compas del silencio, y el restante el acorde F#7; y en la c, el **60%** lo ocupa el silencio, y lo
> restante lo dividen la repeticion y el G#m7. Asi mismo tambien pasa con los que son `{}1 {}2`»*

**Son DOS cosas distintas y conviene no mezclarlas:**

| | Que pasa | Donde mirar |
|---|---|---|
| **① El ancho** | Un compas crece segun sus TIEMPOS (`flexGrow: totalBeats`) y su base es el nº de acordes (`flexBasis`). Un silencio de blanca son **2 tiempos con UN solo simbolo**, asi que **se lleva el doble de ancho que un acorde y lo deja vacio**. Lo mismo los recuadros `{}1 {}2`, que ademas suman su etiqueta | `MeasureBlock`, `flexGrow`/`flexBasis` |
| **② El alto** | El silencio *«sobresale para abajo»* y hay canciones con mucho hueco arriba y abajo sin aprovechar | `RestFigure` (el dibujo) y el hueco de la celda (O-53) |

#### ✅ El ① (el ancho), arreglado — y hubo que ir DOS veces mas lejos de lo que yo queria

🔴 **Version final: el ancho de un compas lo decide CUANTO HAY QUE DIBUJAR** —
`flexGrow = max(1, simbolos)`— y no los tiempos.

**Hicieron falta tres avisos suyos para llegar aqui, y conviene ver la secuencia** porque el error
de fondo fue mio en las dos primeras: intente **conservar** el diseño del primo (el ancho por
tiempos) poniendole parches, en vez de aceptar que se rompia justo donde mas se nota.

| Intento | Que hice | Que dijo el |
|---|---|---|
| 1 | `min(tiempos, simbolos x 1,5)` | *(lo tumbo la medicion: cambiaba 293 compases normales)* |
| 2 | `min(tiempos, simbolos x 2)` | *«AUN EL SILENCIO SE COME EL ESPACIO, LO MISMO AHORA OCURRE CON LAS SECCIONES QUE SE MARCAN EN AMARILLO Y CON LAS REPETICIONES DEL {}1{}2»* |
| **3** | **`max(1, simbolos)`** | ✅ El silencio ocupa lo de un acorde |

⚠️ **Lo que se pierde, dicho claro: el ancho deja de contar el tiempo.** Era el diseño del primo
—«la duracion controla el ancho relativo»—, y **se sacrifica a proposito**: el tiempo se sigue
leyendo donde de verdad se lee, en la **FIGURA** que va encima de cada acorde.

#### 🔴 Y hubo un CUARTO aviso: se me quedo el recuadro sin arreglar

Isaac, el mismo dia: *«mira que aun sale el problema de los espacios con los {}1{}2 y demas»*.

**Tenia razon y era un descuido mio:** cambie `MeasureBlock` —el compas suelto— y **deje el
envoltorio del recuadro con `flexGrow: segBeats`**. Su captura de «Aceleracion» lo enseña:
`{ C | Gm }1` y `{ Z:4 | Dm }2` — el segundo lleva un silencio de compas entero, asi que contaba
**cinco tiempos contra dos** y se llevaba media fila para dibujar lo mismo. **El mismo fallo, en
otro sitio.** → El recuadro pasa a medirse por **simbolos**, igual que el compas suelto.

📌 **La leccion:** cuando se cambia una regla de medida, hay que buscar **todos** los sitios que la
usaban. Aqui eran dos y solo mire uno — y el segundo lo encontro el usuario.

#### 🔴 Y un QUINTO aviso, este sobre el ALTO: *«cuando el compas tiene {}1{}2 sobresale abajo»*

Bajar el numero de casilla a `0.7em` **no basto**, y el se dio cuenta enseguida. La causa no era el
tamaño: era **donde estaba**.

*Causa:* el numero iba **ENCIMA de la caja, dentro del flujo**, asi que el recuadro medía
«etiqueta + caja» mientras un compas normal mide solo «caja». Como los compases de una fila se
alinean al mas alto (`items-stretch`), **el recuadro estiraba de alto la fila entera** — y por eso
en su captura `Dm` y `Bb`, que no tienen nada que ver, salian centrados con hueco arriba y abajo, y
la seccion B era el doble de alta que la A y la C.

*Arreglo:* el numero pasa a **posicion absoluta, en la esquina de la caja**, fuera del flujo. Con
eso **el recuadro mide exactamente lo mismo que un compas normal** y la fila deja de crecer.
Comprobado con la seccion de su captura: la B con sus `{}1{}2` queda **a la misma altura** que la
Intro y la C.

📌 **La leccion, y es la tercera vez en dos dias:** *un elemento decorativo que ocupa sitio en el
flujo deforma todo lo que tiene al lado.* Ya paso con la figura encima del acorde (O-53) y con la
sonda del reparto. **Lo que rotula va fuera del flujo; lo que es contenido, dentro.**

#### ✅ Y el SEXTO, que cerro el ②: el silencio medía mas que un acorde

Isaac, en cuanto los recuadros quedaron bien: *«ahora si funciona; lo que es que el silencio no se
comporta de la misma manera que lo hacen los {}1{}2»*.

*Causa, un numero:* el silencio se dibujaba a **`2.1em`** mientras un acorde va a **`1.5em`**. Su
celda salia mas alta que las de al lado, asi que **estiraba el compas y con el la fila entera** — y
encima la celda le reserva arriba el hueco de una figura que el silencio **no dibuja** (la figura
ES el silencio), asi que ese hueco era espacio muerto.
→ **Igualado a `1.5em`.** Comprobado con sus dos casos —un silencio dentro de un `{}2` y uno
suelto—: las tres secciones quedan **a la misma altura**.

📌 **Es el mismo fallo que el numero de casilla, en otra pieza**, y por eso salieron seguidos:
*algo que mide mas que sus vecinos estira todo lo que tiene al lado*. En una rejilla que se alinea
al mas alto, **el tamaño de una pieza no es asunto suyo: es de toda la fila.**

#### 📋 O-54, cerrada — las SEIS pasadas que costo

| # | Lo que arregle | Lo que dijo el |
|---|---|---|
| 1 | `min(tiempos, simbolos x 1,5)` | *(lo tumbo la medicion: 293 compases normales)* |
| 2 | `min(tiempos, simbolos x 2)` | *«AUN EL SILENCIO SE COME EL ESPACIO»* |
| 3 | **el ancho por SIMBOLOS** | ✅ el silencio suelto, resuelto |
| 4 | el recuadro `{}1{}2`, tambien por simbolos | *«aun sale el problema de los espacios»* — se me habia quedado |
| 5 | el numero de casilla, **fuera del flujo** | *«sobresale abajo»* — no era el tamaño, era el sitio |
| 6 | el silencio a `1.5em`, como un acorde | *«ahora si funciona; lo que es que el silencio no se comporta igual»* |
| **7** | **el silencio ABSOLUTO, fuera del flujo** | ✅ *«falta poco»* → medido: los 5 casos a **155 px clavados** |

#### 🔬 El septimo: y aqui hizo falta MEDIR EN PIXELES, no mirar

Isaac: *«aun no, falta por poco para que quede bien»*. A ojo ya casi estaba, asi que se puso el
**alto real de cada cuadro a la vista** en la pagina de prueba y se comparo con cinco casos
—normal, con silencio suelto, con recuadro, con recuadro Y silencio, y con figuras escritas—:

| Caso | Antes | Ahora |
|---|---|---|
| Normal | 155 px | **155** |
| Con silencio suelto | **171** | **155** |
| Con recuadro `{}1{}2` | 155 | **155** |
| Recuadro **con** silencio dentro | **175** | **155** |
| Con figuras escritas | 155 | **155** |

**Y los intentos que NO funcionaron, que es lo que hace falta saber:**
1. Bajar el silencio a `1.5em` → **quedaba ridiculo**: es una barrita dentro de un lienzo alto, asi
   que al encoger el lienzo el dibujo casi desaparece.
2. Caja con `height: 1.5em` y el dibujo desbordando → **seguia creciendo**. Medido subiendo el
   silencio de 2,1 a 3em: la celda pasaba de **160 a 181 px**. Un `height` no impide que un hijo
   normal cuente para el alto, ni con `min-height: 0`.
3. ✅ **El dibujo ABSOLUTO, centrado sobre una caja del tamaño de un acorde.** Lo absoluto no cuenta
   para el alto, y punto. **Es el mismo patron que la figura del acorde y que el numero de casilla.**

📌 **Y la leccion del metodo:** *«falta poco» no se arregla mirando —se arregla midiendo.* Poner el
alto en pixeles a la vista convirtio tres iteraciones a ojo en una comprobacion de una linea.

🔴 **Lo que enseña la lista:** las siete son **la misma causa** —una pieza que mide distinto que sus
vecinas— en seis sitios. Yo la arregle de una en una porque **miraba la captura que el mandaba en
vez de buscar todos los sitios que compartian la regla**. La proxima vez que aparezca algo asi:
**buscar la regla, no el sintoma.**

**Comprobado en «Fiesta»:** su seccion B —`… | A7 | z:4`— **cabe entera en una fila**, cuando antes
el silencio se llevaba el 80 % y forzaba el reparto en dos.

#### La medicion del intento 2, que sigue valiendo como aviso

**La cancion es «Fiesta»** (el «Su Presencia» de su captura es el COMPOSITOR, no el titulo), y su
seccion B acaba asi:

```
|: 4/4 Bm ~ D ~ F#m7 | Em7 ~ A7 :| A7 | z:4 (Haz fiesta en mi-)
```

→ **`A7` cuenta 1 tiempo y `z:4` cuenta 4**, asi que el silencio se llevaba **el 80 % de la fila**
para dibujar UN simbolo. Su «75 %» estaba bien contado.

📌 **La causa de fondo:** `totalBeats` mezcla dos cosas — cuando el compas trae duraciones escritas
son tiempos de verdad, y cuando no, **es el numero de acordes**. `A7` solo dura el compas entero
pero cuenta 1. Compararlos como si fueran lo mismo es lo que descuadra el reparto.

**Arreglo:** un TECHO al crecimiento segun cuantos simbolos hay que dibujar —
`flexGrow = min(totalBeats, simbolos x 2)`.

🔴 **Y el factor salio de MEDIRLO, no de elegirlo a ojo.** Sobre los **2.140 compases** de las 71
canciones:

| Factor | Compases que cambian de ancho | |
|---|---|---|
| **1,5** | **293 (13,7 %)** | ❌ Muerde compases **normales** de dos acordes (`F#:2 F#7:2`) |
| **2** | **23 (1,1 %)** | ✅ Solo los raros: `z:4`, `Z:4`, `Dmaj7:4`, `G:3` — **un simbolo con muchos tiempos** |
| 2,5 | 22 (1,0 %) | Practicamente igual que 2, sin ganar nada |

→ **Se quedo en 2.** El primer intento fue 1,5 y **la medicion lo tumbo**: se veia bien en «Fiesta»
y habria cambiado 293 compases de canciones que no tenian ningun problema.

**Comprobado:** 171 pruebas · lint 0 · build 0 · 26 de 26 pantallas · el culto compartido sigue con
sus **37 acordes** y los mismos repartos.

✅ **RESUELTO por el intento 3:** `A7 | z:4` queda **mitad y mitad**, que es lo correcto.

#### ⬜ El ② (el alto), sin tocar

Que el silencio *«sobresalga para abajo»* y que sobre hueco arriba y abajo. Va en `RestFigure` y en
el hueco de la celda (O-53). **No se ha mirado todavia.**

**O-53 · Al agrandar las figuras, se MONTAN ENCIMA de los acordes.** ⬜ **ANOTADO, SIN TOCAR.**
Isaac, 2026-08-29, con una captura de «Dios no rechaza oracion» ya publicada:
*«mira como salen los signos»*. Y su instruccion fue explicita:
**«anota solamente, y cuando te diga arregla, arreglas»** → **no se ha tocado ni una linea.**

🔴 **LO CAUSE YO, ayer mismo, con O-51.** Al subir las figuras de `1em` a **1,6em** crecieron —que
era lo que el pidio— **pero el hueco reservado para ellas NO crecio**, asi que ahora **se solapan
con el nombre del acorde**. En su captura las plicas atraviesan `G`, `C/G`, `Bm7`, `Am7` y `D7`.

*Donde esta, para no volver a buscarlo:* `TablaturePreview.tsx:390-392`. La figura va en un
`<span>` **absoluto**, pegado arriba de la celda:

```tsx
className="figura absolute inset-x-0 top-0 …"
style={{ fontSize: "0.85em", height: "0.95em" }}
```

📌 **Y ahi esta el fallo, en una linea:** `height: "0.95em"` es **el hueco**, y sigue valiendo lo
que valia cuando la figura media `1em`. Al pasar a `1,6em`, la figura **mide mas que su hueco** y
se sale por abajo, encima del acorde. Como es `absolute`, **no empuja nada**: simplemente se
superpone.

⚠️ **Es el mismo patron que O-49 vino a arreglar, y se me colo por otro sitio:** un numero fijo
—`0.95em`— que **daba por supuesto otro numero** que ha cambiado. Alli eran las listas de
duraciones; aqui es el alto reservado. **El hueco tiene que salir del tamaño de la figura, no de
una constante escrita al lado.**

**Cuando Isaac diga, esto es lo que hay que mirar:**
1. Que el hueco **se calcule desde `--figura-alto`**, para que no se separen nunca mas.
2. Que la celda **crezca de alto** si hace falta, en vez de que la figura se salga.
3. Y comprobarlo **en las canciones con figura en casi todos los compases**, que son donde peor se
   ve — la de su captura es una.

#### ✅ ARREGLADO (2026-08-29), cuando Isaac lo pidio: *«arregla lo de los signos»*

**El hueco ya NO se escribe: se CALCULA desde el tamaño de la figura.**

| | Antes | Ahora |
|---|---|---|
| El tamaño | `--figura-alto: 1.6em` | **`--figura-alto: 1.6`** — un NUMERO, para poder multiplicar |
| El hueco de la celda | `padding: 0.95em …` escrito a mano | **`calc(var(--figura-alto,1.6) * 0.85em + 0.12em)`** |
| Si mañana cambia el tamaño | el hueco se quedaba corto **en silencio** | **el hueco cambia solo** |

🔴 **Y ese es el arreglo de verdad, no el numero.** El fallo no fue poner `0.95em`: fue que
**el hueco y la figura eran dos numeros independientes que tenian que coincidir**. Mientras sea
asi, cualquiera que toque uno rompe el otro sin enterarse — que es exactamente lo que hice yo.
Ahora **salen del mismo sitio y no se pueden separar**.

📌 **El `0.85` que aparece en la cuenta no es magia:** es el `fontSize` del `<span>` que envuelve
la figura, asi que la figura ocupa `alto x 0.85em` de la celda. Esta escrito al lado para que no
se convierta en otro numero suelto.

**Comprobado en «Cada Vez»**, que es **la cancion con MAS duraciones escritas de las 71** (48) y
por tanto donde peor se veia: **64 celdas calculan su hueco**, **0 con el valor viejo**, y sus
**52 figuras y 55 acordes** siguen ahi. **26 de 26 pantallas**, 158 pruebas, lint 0, build 0.

⚠️ **El SILENCIO no tenia este problema y no se toco:** se dibuja **en linea normal**, no en
posicion absoluta, asi que al crecer empuja en vez de superponerse.

### 9.2-undecies · El lint estaba ROTO desde Next 16, y nadie se enteraba

Isaac, 2026-08-28: *«hazlo el lint»*. Salio al listar lo pendiente, y **no estaba en la lista**:
`npm run lint` contestaba **«Invalid project directory: .../lint»** desde la migracion a Next 16
del 2026-08-22. **El comando `next lint` desaparecio en Next 16.**

🔴 **Es T-16 otra vez, pero peor.** Alli una comprobacion mia miraba el texto en vez del codigo de
salida; aqui habia **un comando entero que decia comprobar el codigo y no comprobaba nada**, seis
dias. Un comando roto que nadie ejecuta no da error: da silencio.

#### Lo que hizo falta

**ESLint 8 → 9 y `eslint-config-next` 14 → 16**, que es cambiar al formato nuevo de configuracion
(«flat config», `eslint.config.mjs` en vez de `.eslintrc.json`).

⚠️ **Y una trampa por el camino:** el primer intento uso el puente de compatibilidad `FlatCompat`,
que es lo que dice casi toda la documentacion. **Revienta**, con un
`TypeError: Converting circular structure to JSON` que no menciona la causa por ningun lado.
→ `eslint-config-next` **16 ya viene en formato nuevo**: se importa directa
(`eslint-config-next/core-web-vitals`), sin puente.

#### Los 12 errores que saco a la primera, revisados UNO A UNO

| Regla | Cuantos | Que se hizo |
|---|---|---|
| `react-hooks/immutability` | **1** | ✅ **Arreglado.** `setLeavePrompt` se usaba en la linea 192 y se declaraba en la 199. Funcionaba —los efectos corren despues del render— pero leido de arriba abajo parecia que usaba algo sin declarar. Ahora va antes |
| `react-hooks/set-state-in-effect` | **9** | ⚠️ **A aviso, tras mirar los nueve.** Todos son el mismo patron: leer `localStorage` o `window.location` despues de montar. **En Next no hay alternativa** — el servidor no tiene ninguna de las dos, y leerlas durante el render romperia la pagina |
| `react-hooks/preserve-manual-memoization` | **2** | ⚠️ A aviso: es una nota de optimizacion, no un fallo |

🔴 **Lo importante de esa tabla es que se miraron los nueve, no que se bajaran a aviso.** Bajar
reglas hasta que el lint calle es la forma habitual de tener un lint decorativo — que es
exactamente de donde veniamos. Siguen saliendo en amarillo, asi que un caso nuevo se ve.

#### Y va al CI, delante del build

`npm test` → **`npm run lint`** → `npm run build`. **Es lo unico que garantiza que no vuelva a
romperse en silencio**: un comando que solo se ejecuta cuando alguien se acuerda, se rompe y no se
nota. Con el CI, cualquier subida que lo rompa sale con ✗.

**Estado al cerrar:** **0 errores** y **57 avisos** (46 de `any` y variables sin usar heredados, 11
del compilador de React). Pruebas **139 verdes**, build **codigo de salida 0**.

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

### 9.2-quater · FASE I — O-17 piano y bajo · ⬜ PROPUESTA, a la espera del visto bueno

Isaac eligió esto el **2026-08-21**, sobre las otras tres opciones (guitarra incluida, letras,
trompetas). **Guitarra, letras y trompetas siguen pendientes.**

**Qué se verá:** al pulsar un acorde de la cuadrícula, se abre debajo **cómo se toca en el
teclado y en el mástil del bajo**. Nada más: ni guitarra, ni trompeta.

| Sub | Qué | Toca |
|---|---|---|
| **I.1** | ✅ **HECHO** — `src/lib/acordes.ts`: calidad → intervalos, y la regla de la barra `/` | Archivo nuevo. No tocó nada |
| **I.2** | ✅ **HECHO** — `PianoDiagram.tsx` y `BassDiagram.tsx`, SVG con los dos temas | Archivos nuevos |
| **I.3** | ✅ **HECHO** — el acorde se pulsa y sale el desplegable | `TablaturePreview.tsx` + `ChordPopover.tsx` nuevo |
| **I.4** | ✅ **HECHO** — vista de la canción y presentación. **NO al imprimir ni en edición** | Comprobado: 28 · 28 · 0 · 0 |

#### I.3 · El desplegable, como CifraClub (2026-08-21)

Isaac enseñó una captura de **CifraClub** y dijo qué quería: *«que salga el diagrama tanto en modo
vista como en modo pantalla completa dándole tap o clic al acorde»*. Dio permiso para usar mi
alternativa si se complicaba —**no hizo falta**—.

| Decisión | Por qué |
|---|---|
| **Por CONTEXTO de React**, no por props | El acorde está **seis niveles** dentro de `TablaturePreview` (sección → compás → grupo de ligadura → grupo de vigas → celda). Pasar la función a mano obligaría a tocar todos esos componentes |
| **Con un PORTAL al `body`** | Los compases llevan `overflow: hidden` para recortar lo que sobra. Dentro de ahí el desplegable **saldría cortado** |
| **Se apaga solo donde no toca** | `useAbrirAcorde()` devuelve `null` si no hay proveedor → **en edición y al imprimir el acorde se dibuja exactamente como antes.** Es opt-in: montar el proveedor es lo que lo enciende |
| **Solo el acorde es pulsable** | Ni silencios, ni `%`, ni los textos amarillos, ni las etiquetas: no son acordes |
| ~~`bemoles` se pasa desde la tonalidad~~ | **SUPERADO por T-13:** el parámetro se quitó. El nombre de las notas sale del propio acorde |
| Se cierra con Escape, al tocar fuera, al rodar la página y al redimensionar | Va anclado a una posición **medida**: si la página se mueve, dejaría de apuntar a su acorde |
| La capa de cerrar es **transparente** | Oscurecer taparía la canción, que es lo que el músico está leyendo |

**Comprobado tras tocar el corazón** — los tres arneses sobre las 75 canciones:
**0 canciones cambian** de lectura · **20 ligaduras, ninguna perdida** · **0 trozos mal leídos**.
Y dónde aparece: vista **28** · pantalla completa **28** · **PDF 0** · edición **0**.

#### ✅ `E#m2/b5` resuelto — ya no queda ningún acorde sin dibujar

Isaac trajo la explicación el 2026-08-21: **`m2` es un menor con la segunda añadida** (la 2ª o 9ª),
y el `b5` es la quinta disminuida. → `E#m2/b5` = **`F` · `G` · `G#` · `B`**.
**Con eso se dibujan 1.894 de 1.894 acordes: el 100 %.**

🔧 **Y de paso salió un fallo de fondo:** `b5` y `#5` se estaban **añadiendo** encima del acorde en
vez de **sustituir a la quinta**, así que sonaban la quinta justa y la bemol a la vez. Ahora la
sustituyen, que es lo que significan.
⚠️ **Un matiz de la fuente que trajo:** lista fundamental, segunda y quinta disminuida, pero **no
la tercera menor**, aunque llama al acorde «menor». Se le puso la tercera (`G#`), porque sin ella
no sería menor. **Dicho a Isaac por si su fuente la omite a propósito.**



**Medido con los 1.894 acordes reales** (`scratchpad/acordes.mjs`, que compila el `.ts` con el
TypeScript del proyecto): **1.893 se saben dibujar — el 99,9 %**. El único que no es `E#m2/b5`,
justo el que Isaac señaló como raro. **91 acordes tienen un bajo distinto de la fundamental**, y
el único acorde-sobre-acorde sale como él lo describió:
`A/G#m → arriba A C# E · abajo G# B D# · bajo G#`.

✅ **La página temporal `acordes-prueba` ya está BORRADA** (2026-08-21, antes de publicar). Sirvió
para que Isaac viera los dibujos y los corrigiera cuatro veces antes de tocar el corazón del
proyecto. **Nunca llegó a producción.**
📌 **Y valió la pena:** de esas cuatro pasadas salieron las octavas, el recorte del teclado, la
mano izquierda y la leyenda del bajo. Enseñar una pantalla desechable **antes** de integrar salió
mucho más barato que integrarlo y rehacerlo.

📌 ~~`leerAcorde(escrito, bemoles)` recibe si la canción va en bemoles~~ → **SUPERADO por T-13
el 2026-08-21.** El parámetro **ya no existe**: el nombre de cada nota lo decide la fundamental
del propio acorde, no la tonalidad de la canción.

#### Lo que corrigió Isaac al VER los dibujos (2026-08-21)

| Qué dijo | Qué se hizo |
|---|---|
| *«no es necesario que salga en dos octavas, con que salga nada más el acorde en una octava está bien»* | ✅ **UNA octava por defecto.** Antes se dibujaban dos siempre, y sobraba una en el 95 % de los casos |
| *«estos mismos aplicarían para los acordes complejos pero que en el bajo no hace otra nota, por ejemplo `E#m2b5`»* | ✅ **Lo que manda no es si el acorde es complicado, sino si el BAJO es otra nota.** `E#m2/b5` va en una octava; `F/A` en dos |
| *«para lo que tiene una nota diferente en el bajo, por ejemplo `A/G#m`, aquí sí es necesario que salga en dos o tres octavas»* | ✅ **DOS octavas**: la izquierda abajo, la derecha arriba. Con dos ya se ve el reparto de manos; tres solo alargarían el dibujo |
| *«los círculos rellenos y con huecos, ¿qué significa cada uno?»* | ✅ **Se le puso LEYENDA al mástil.** Relleno = lo que toca el bajo · hueco = el resto del acorde. **Que lo tuviera que preguntar es la prueba de que el dibujo no se explicaba solo** |

**Comprobado en pantalla:** `C`, `Cm`, `Cm7`, `C7`, `Cmaj7`, `F#m7/b5`, `A4`, `Bbmaj7/#9`, `B°` y
`E#m2/b5` → **una octava**. `F/A`, `Bb/F`, `C/E` y `A/G#m` → **dos**.

✅ **RESUELTA — la mano izquierda de `A/G#m`.** Isaac había escrito *«la quinta que sería
`C#`»*, y no cuadraba: la quinta de `G#m` es `D#`. **Se le preguntó en vez de adivinar, y era una
errata suya:** *«el que se equivocó aquí fui yo, la quinta es `D#`… es así como tú dices»*.
→ **Lo dibujado ya era correcto y no se tocó nada:** `G#` · `B` · `D#` · `G#`.
📌 **Vale la pena guardarlo porque el resultado fue el contrario del de los otros dos casos.** Con
el `-` y con la `/`, lo raro era notación suya y el equivocado era yo. Aquí era un desliz suyo.
**La regla no es «el usuario siempre tiene razón», es PREGUNTAR** — que acierta en los dos casos,
mientras que suponer falla en uno de cada dos.

#### Teclas de contexto a los lados (2026-08-21)

Isaac: *«quisiera que se muestren más a los lados las teclas del piano, pero que no marque el
color del acorde sino justo como lo tienes… que salga más teclas a los lados y centrado el
diagrama»*.
→ **`RELLENO = 4` teclas blancas a cada lado, sin marcar.** El acorde queda **centrado**: una
octava pasa de 7 a **15 teclas**, y dos octavas de 14 a **22**.
→ **Por qué es buena idea, más allá de que se vea mejor:** un acorde sobre siete teclas **no dice
en qué parte del teclado cae**. Con las de al lado se reconoce el patrón de dos y tres negras.
→ **Comprobado que el relleno no marca nada por su cuenta:** se contaron las teclas pintadas de
los 14 teclados contra las notas que debe tener cada acorde — **14 de 14**. `A/G#m` marca 7:
3 derecha (A C# E) + 4 izquierda (G# B D# G#).

#### Dos correcciones más de Isaac, viendo `F/A` (2026-08-21)

**① *«el bajo del A no está haciendo la octava»*.** Tenía razón, y la causa no se veía en la
imagen: con **dos** octavas, el `A` de arriba de la mano izquierda y el `A` de la mano derecha
**eran la misma tecla**, así que una tapaba a la otra y la octava desaparecía.
→ **Se pasó a TRES octavas** cuando el bajo es otra nota —lo que él mismo había dicho, «dos o
tres»—: la izquierda ocupa las dos de abajo, la derecha la de arriba. Es como se toca de verdad.
→ **La mano izquierda cierra siempre con su octava**, tanto si abajo hay un acorde (`A/G#m` →
`G#` `B` `D#` `G#`) como si es una nota sola (`F/A` → `A` `A`).

🔴 **Y el arnés `scratchpad/piano.mjs` cazó un fallo mío que en la imagen no se habría notado:**
la mano derecha salía **siempre `C E G`**, fuera cual fuera el acorde. Estaba colocando las notas
restando la fundamental, y con eso **perdía los nombres reales**: `F/A` dibujaba do-mi-sol en vez
de fa-la-do. **Los dedos habrían caído en el sitio equivocado.** El arnés se escribió justo para
poder leer qué teclas marca cada acorde sin abrir el navegador.

**② *«sobran muchas teclas, que no sean tantas, tanto de izquierda como de derecha»*.**
→ `RELLENO` bajó de **4 a 2** teclas por lado.
→ Y lo que más sobraba era otra cosa: **se dibujaban octavas enteras**, así que en los acordes
con bajo quedaba **media octava vacía entre las dos manos**. Ahora el teclado **se recorta a lo
que se usa**: empieza justo antes de la primera tecla marcada y acaba justo después de la última.

| | Antes | Ahora |
|---|---|---|
| Acordes normales | 15 teclas | **9–11** |
| Con bajo distinto | 29 teclas | **19–22** |
| `E#m2/b5` (solo la fundamental) | 15 teclas | **5** |

⚠️ **Los de bajo no se pueden apretar más sin quitar algo:** de `A1` a `A3` hay dos octavas, y esa
es la distancia que ocupan **la octava de la izquierda más el acorde de la derecha**. Si algún día
parecen demasiado anchos, la única salida es **quitar la octava del bajo** — que es justo lo que
él pidió que se viera. **Decisión suya, no se toca por cuenta propia.**

#### ✅ La mano izquierda, cerrada: fundamental, quinta y octava (2026-08-21)

Costó tres vueltas, y las tres las corrigió Isaac mirando el dibujo. **Así queda:**

> *«nada más primero, quinta y octava; no importa lo que diga el acorde que se toca en la
> derecha, que sea así, no metas tercera»*

| Acorde | Izquierda | Derecha |
|---|---|---|
| `F/A` | `A` · `E` · `A` | `C` `F` `A` |
| `Bb/F` | `F` · `C` · `F` | `D` `F` `Bb` |
| `C/E` | `E` · `B` · `E` | `C` `E` `G` |
| `A/G#m` | `G#` · `D#` · `G#` | `C#` `E` `A` |

**Las tres vueltas, por si vuelve la duda:**
1. Primero se dibujaba **solo la nota del bajo** → *«no está haciendo la octava»*.
2. Luego **fundamental + octava** → *«falta la quinta, para este caso A - E - A»*.
3. Se probó a meter **la tercera** cuando estaba en el acorde escrito → la quitó: **no va nunca.**

🔴 **DOS COSAS QUE PARECEN FALLOS Y NO LO SON. No las «arregles».**
- **La quinta se pone aunque NO esté en el acorde de la derecha.** En `F/A` el acorde es `F A C`
  y el `E` de la izquierda no está ahí —hace sonar un `Fmaj7`—. Se le avisó explícitamente y
  respondió *«no importa lo que diga el acorde que se toca en la derecha»*. **Es la forma abierta
  que él toca, y manda.**
- **`A/G#m` ya no enseña su «m».** La tercera (`B`) era lo que llevaba la calidad del acorde de
  abajo. Al quitarla, la mano izquierda hace `G#·D#·G#`, que suena igual en mayor o en menor.
  ⬜ **Sin confirmar:** él dijo «no metas tercera» de forma general, y se aplicó a los dos casos.
  **Si quería la regla solo para el bajo suelto**, `A/G#m` recupera su `B` cambiando una línea.

#### 🔴 T-13 · Las notas se nombran POR GRADOS, no por semitonos (2026-08-21)

*Síntoma:* el desplegable de un acorde `Bb` decía **«A# · D · F»**. Isaac: *«está mal, tiene que
ser `Bb D F`»*. Pasaba igual en `Gm` (`G · A# · D`) y en todo lo que llevara bemol.
*Causa:* las notas se calculaban **sumando semitonos** y se escribían con una tabla de
sostenidos. Contando semitonos hay que **elegir** entre `A#` y `Bb`, y esa elección no se puede
acertar sin saber de dónde viene la nota.
*Diagnóstico de Isaac, y acertó:* *«parece que solamente pasa con los acordes y centros tonales
bemoles»*. **Sí, exactamente eso.**

**Cómo se resuelve — y la respuesta a su pregunta.** Él preguntó si había que mirar el **centro
tonal** de la canción. **No hace falta: el propio acorde ya lo dice.** Un acorde no es una lista
de semitonos, es una fundamental y unos **GRADOS** sobre ella:

> La tercera de `Bb` es un `D` **porque está dos letras más arriba** (si→do→re), y la quinta es
> un `F`. Primero se elige LA LETRA, y solo después la alteración que hace falta para caer en el
> semitono justo.

Por eso cada grado guarda **dos números**: cuántos semitonos sube y **cuántas letras** sube. Los
dos hacen falta: la tercera mayor y la cuarta disminuida son el mismo salto en semitonos (4) y
notas distintas (`C→E` sube dos letras, `C→Fb` sube tres).

**Y es mejor que mirar el centro tonal**, no solo más simple: si Isaac escribe un `A#` a
propósito dentro de una canción en `Dm`, sale `A# · C## · E#` — **respeta lo que él escribió**,
no lo que dictaría la tonalidad. *(Es otra vez la regla de T-11: un dato que el usuario escribió
no se deduce.)*

→ **`bemoles` desapareció como parámetro.** `leerAcorde(escrito)` ya no recibe la tonalidad, y
los llamantes dejaron de pasarla. **Menos código y sin manera de equivocarse.**
→ Los dos dibujos tenían **su propia copia** de la tabla de notas; ahora usan `semitonoDe` de
`acordes.ts`, que además entiende **dobles alteraciones** (`F##`, `Cb`).

**Comprobado con los 1.894 acordes reales** (`scratchpad/notas.mjs`):

| Acorde | Antes | Ahora |
|---|---|---|
| `Bb` | `A# · D · F` | **`Bb · D · F`** |
| `Gm` | `G · A# · D` | **`G · Bb · D`** |
| `Cm7` | `C · D# · G · A#` | **`C · Eb · G · Bb`** |
| `Ebmaj7` | `D# · G · A# · D` | **`Eb · G · Bb · D`** |
| `E#m2/b5` | — | **`E# · F## · G# · B`** ← igual que la fuente que trajo Isaac, `Fx` incluido |

⚠️ **DOS COSAS QUE PARECEN FALLOS Y NO LO SON. Confirmadas por Isaac: *«está bien así, déjalos»*.**

1. **`Bbmaj7/#9` → `Bb · D · F · A · C#`**, con un sostenido dentro de un acorde de bemoles. Mi
   propio detector lo marcó como incoherencia y **el equivocado era el detector**: la novena de
   `Bb` es `C`, y *aumentada* es `C#`. Un `Db` ahí estaría **mal**.
2. **`Dbm` → `Db · Fb · Ab`** y **`Dbm7` → `Db · Fb · Ab · Cb`**. Es lo correcto —la tercera
   menor de `Db` es `Fb`— aunque `Fb` sea un `E` y `Cb` un `B`, y leyendo rápido despiste.
   Aparecen en **«Cristo Es Mi Roca»** y **«Casa De Mi Padre»**. Se le ofreció el nombre fácil
   (`E`, `B`) y **eligió dejarlo correcto**.

📌 **El único sitio donde SÍ se afloja:** si una nota necesitara **más de dos** alteraciones
(`C###`), se cae al nombre corto. Eso no lo escribe nadie.

**Decisiones tomadas de antemano:**
- **Sin base de datos.** Todo se calcula. **Ni migración, ni columna nueva** — y por tanto
  ninguna de las trampas de esquema (T-07).
- 🔴 **Una calidad que no se sepa dibujar NO se inventa.** Se enseña la fundamental y se dice
  que esa forma no se conoce. Esto quita de en medio la duda de los **8 acordes raros**: aunque
  Isaac no conteste qué son, la pantalla **no mentirá** sobre ellos. *(Es la regla del `-`: un
  símbolo raro del usuario no se limpia ni se adivina.)*
- **Cubre 32 calidades**; con 5 ya funciona el 94 % (ver la medición de arriba).

**Riesgo, y cómo se controla:** I.3 toca `TablaturePreview`, que es lo que sostiene el catálogo,
la presentación y el PDF. → **Antes y después de I.3 se pasan los tres arneses**
(`parser.mjs`, `ligaduras.mjs`, `basura.mjs`) sobre las 75 canciones, y **se compila con
`npm run verificar`** para no repetir T-04.

⚠️ **Cuidado con el pulsar en MODO EDICIÓN:** ahí la cuadrícula se escribe a mano. El dibujo solo
puede salir en **modo vista** y en **presentación**, nunca robándole el clic al editor — es el
mismo cuidado que hizo falta en O-20 con las flechas del teclado.

### 9.2-sexies · FASE L — el caché, el 404 y las dependencias · ✅ APROBADA por Isaac el 2026-08-21 · 🚀 PUBLICADA el 2026-08-22

Isaac: *«ahora vamos con lo que hace falta resolver para ir avanzando»*, y eligió esta de cuatro
opciones. Orden acordado: **① el caché · ③ el 404 · ② las dependencias**, y **④ el culto vacío
después**.

#### 🔴 T-02 estaba MAL EXPLICADA. Medido el 2026-08-21 por la noche, antes de tocar nada

Llevábamos varias tandas diciéndole a Isaac que «el service worker cachea y por eso no se ve el
cambio». **Al ir a arreglarlo y medir, la explicación no se sostiene entera.**

| Qué se midió | Resultado |
|---|---|
| Cabeceras de `/sw.js`, `/login` y `/novedades` en producción | **las tres**: `Cache-Control: public, max-age=0, must-revalidate` |
| Estrategia del service worker (`public/sw.js:27`) | **network-first**: pide a la red y solo cae al caché si la red falla |

→ **El caché HTTP del navegador NO es el culpable:** Vercel manda revalidar siempre.
→ **El service worker tampoco lo es mientras haya red**, porque pide a la red primero.

**Entonces, ¿qué es lo que sí falla? Esto, y es real:**
`CACHE = "partituras-v1"` es **constante** (`sw.js:4`), y `activate` borra *«las claves distintas
de `CACHE`»* (`:14`). Como `CACHE` nunca cambia, **no se borra nada, nunca**. El caché acumula
respuestas desde el primer día, y el día que la red falle o vaya lenta —un móvil con datos flojos
en el culto— **el músico recibe una copia que puede ser de hace meses**, sin ningún aviso.

📌 **La lección, que es la que vale:** *«se cachea»* era un diagnóstico **plausible y sin medir**,
y aguantó varias tandas porque el síntoma encajaba. Bastaron dos `curl` de cabeceras para verlo.
**Un diagnóstico que nadie ha medido se convierte en folclore del proyecto.**

#### ① El caché versionado

- `sw.js` lee su versión **de su propia dirección**: se registra como `/sw.js?v=<id>`, y dentro
  `new URL(self.location).searchParams.get("v")`.
- **Por qué por la dirección y no reescribiendo el archivo:** `public/` son archivos estáticos que
  van al repositorio; reescribirlos en cada compilación dejaría el repositorio sucio en cada push.
  Cambiar la dirección basta: el navegador la compara y, si cambió, **instala el service worker
  nuevo** — y ahí `activate` sí encuentra claves distintas y **borra el caché viejo**.
- El id sale de `VERCEL_GIT_COMMIT_SHA` en producción y de `dev` en local, por
  `NEXT_PUBLIC_BUILD_ID` en `next.config.js`.

#### ③ El enlace «Regístrate» que da 404

Confirmado en producción: **`/signup` → 404**, y el enlace está en `login/page.tsx:83`.
→ **Se quita el enlace, no se crea la página.** En esta app **las cuentas las crea el admin** desde
`/admin`: no hay registro abierto, y no debe haberlo — es la iglesia, no un servicio público.
Crear un `/signup` sería añadir una puerta que Isaac no quiere.
→ `/signup` sale también de las rutas públicas del middleware.

#### ② Las dependencias

`npm audit`, medido: **15 (13 altas), todas con arreglo disponible**. Solo dos llegan al navegador
de alguien:
- **`next`** — no estaba anotado, y es lo más serio de hoy: es el framework entero.
- **`pdfjs-dist`** — permite ejecutar JavaScript al abrir un PDF, y la app abre PDFs que trae el
  propio usuario (`songImport.ts:33-66`).
⚠️ **Después de actualizar `pdfjs-dist` hay que regenerar el worker** (`npm run copy-pdf-worker`) o
la importación de PDF deja de funcionar.
Las otras 11 son herramientas de desarrollo (eslint, glob, minimatch): **no llegan a ningún
navegador**.


#### ✅ Lo hecho y comprobado (2026-08-21)

| Punto | Estado |
|---|---|
| **① El caché versionado** | ✅ Hecho. `sw.js` lee su versión de `?v=`; `PWARegister` la pasa; `next.config.js` la saca de `VERCEL_GIT_COMMIT_SHA`. **Comprobado en el JS compilado:** el registro sale como `sw.js?v="dev"` en local, y será el commit en Vercel |
| **③ El enlace `/signup`** | ✅ Quitado, y `/signup` fuera de las rutas públicas. En su sitio queda **«¿No tienes cuenta? Pídesela a quien lleva la página»** — un hueco vacío dejaría igual de perdido que el 404 |
| **② `pdfjs-dist`** | ✅ **5.7.284 → 6.2.108**, worker regenerado. **Probado con un PDF real: 7 páginas, 3.797 caracteres**, y el texto sale bien, símbolos de repetición incluidos |
| **② Lo demás no rompedor** | ✅ `npm audit fix`: **de 15 a 11** vulnerabilidades (13 altas → 9). Cayeron `ws`, `brace-expansion`, `js-yaml`, `nanoid` |
| **② `next`** | ⛔ **NO SE TOCÓ. Decisión de Isaac, ver abajo** |

**Y lo que sostiene que nada se rompió:** compila limpio · **20 ligaduras, 0 perdidas** en las 75
canciones · la lectura de PDF probada de punta a punta con la versión nueva.

#### ⛔ Next NO se actualizó, y el motivo cambia el encargo

Al medirlo apareció algo que no estaba en la nota original de P-13, y que **cambia materialmente
lo aprobado**, así que se paró y se le contó a Isaac en vez de seguir:

> **El arreglo de `next` es Next 16.** Salto de **dos versiones mayores** (14 → 16), marcado por
> el propio `npm` como **rompedor**. No es actualizar: es **migrar**.

**Los tres números que lo deciden:**
1. **Son 21 avisos**, y leyéndolos uno a uno: la mayoría son **denegación de servicio,
   envenenamiento de caché y SSRF**, y varios dicen literalmente *«self-hosted applications»*.
   **Esta app no es self-hosted: la sirve Vercel**, que parchea su propia infraestructura.
2. **El proyecto no tiene ni una prueba automática** (P-11). Migrar dos versiones mayores del
   framework entero sin red de seguridad es **el cambio más arriesgado que se ha planteado aquí**
   — más que la migración de la base, que al menos tenía copia y se podía medir con un `select`.
3. **Un push a `main` publica en 40 segundos.** Si la migración rompe algo que el build no cace,
   se rompe **para los músicos**, no en local.

→ **Recomendación: no ahora.** Primero P-11 (unas pruebas de las funciones que sostienen el
las partituras), o esperar a que salga un parche para la rama 14 — que puede no llegar.
→ **Queda anotado como decisión pendiente de Isaac**, no como olvido.


#### 🧪 La prueba de Next 16 (2026-08-22) — rama `isaac/next16`

Isaac: *«lo del next haz la prueba, pero si ves que tienes que hacer una copia antes hazlo»*.
→ **Copia hecha antes de tocar nada:** `_RESPALDOS\Partituras-antes-next16-2026-08-21.bundle` *(el nombre lleva el 21; se creó el 22)*
(1,6 MB, verificado: *«records a complete history»*) más `package.json` y `package-lock.json` en
`_RESPALDOS\Partituras-deps-antes-next16\`. Y **la prueba va en rama aparte**, no en la de trabajo.

🔴 **EL HALLAZGO, y es el que justifica todo lo demás: COMPILÓ LIMPIO Y LA APP ESTABA ROTA.**

Con Next 16 recién instalado, `npm run build` terminó **sin un solo error** y generó las 19 rutas.
Y al levantarlo y probar pantalla por pantalla:

| | |
|---|---|
| Pantallas sin parámetro (`/catalog`, `/services`, `/admin`…) | **200**, bien |
| **Todas las que llevan `[id]` o `[token]`** | **404** |

Es decir: **ninguna canción, ningún culto, ninguna presentación y ningún enlace compartido**. La
página entera inservible para un músico, y el build diciendo que todo estaba bien.

*Causa:* desde Next 15, `params` y `searchParams` **son promesas**. `params.id` llegaba
`undefined`, la consulta no encontraba nada y la página devolvía `notFound()`.

📌 **Esto es exactamente el riesgo que se había advertido** al recomendar no migrar: *«si la
migración rompe algo que el build no cace, se rompe para los músicos»*. **No fue una hipótesis:
pasó, a la primera, y en el 100 % de las páginas que importan.** Sin probar pantalla por pantalla
—que es lo que ninguna compilación hace— esto se habría publicado.

**Cómo se arregló:** con el **codemod oficial** de Next (`@next/codemod next-async-request-api`),
no a mano: **11 archivos, 0 errores**, justo los 11 que se habían contado.

**Lo demás que hizo falta:**
- **React se queda en 18.** Next 16 lo acepta (`^18.2.0 || ^19.0.0`), así que **no hay que migrar
  React también**. El primer intento lo subió a 19 y ahí saltó `@react-pdf/renderer`, que solo
  admite hasta 18. → Se volvió a 18 y desapareció el conflicto.
- **`eslint-config-next` se queda en la 14.** Subirlo exige **ESLint 9**, que es otra migración
  (cambia el formato de configuración entero). **No afecta ni a la app ni al CI**, que ejecuta
  `npm ci` + `npm run build`, no el lint.
- **`tsconfig.json`** lo reescribe el propio Next: `moduleResolution` a `bundler`, `jsx` a
  `react-jsx`, `target` a `ES2017`. Es suyo, va en el commit.

#### 📌 Y un huérfano que salió al tirar del hilo

**`@react-pdf/renderer` NO LO USA NADIE.** `grep` en `src/`: **cero**. Quedó suelto cuando el PDF
del culto pasó a hacerse con la impresión del navegador (D-10, fase F). Es una dependencia muerta
que además **bloqueó la actualización** al ser la única que impedía React 19.
→ **No se ha quitado**: es una decisión aparte y no hacía falta para esto. Anotado.

#### ✅ Lo medido con Next 16, todo en verde

| Qué | Resultado |
|---|---|
| Compilación | ✅ limpia, 19 rutas |
| **El middleware** (lo que protege la página) | ✅ **6 rutas protegidas → 307** sin sesión |
| Las públicas sin cuenta | ✅ `/login`, `/novedades`, `/manifest.json`, `/favicon.ico`, `/sw.js` → **200** |
| 12 pantallas con sesión de admin | ✅ **200 las doce** |
| El enlace público del culto y sus dos hojas | ✅ **200 las tres** |
| Catálogo | **75 canciones** |
| Culto | **8 asas de arrastre · 8 enlaces con `?culto=`** |
| Lista de cultos | **3 etiquetas de estado** |
| Canción y presentación | **19 acordes dibujados** en cada una · `data-suelo` presente |
| Ligaduras | **20, ninguna perdida** |
| Guitarra | **1.892 de 1.894 · 0 formas que no suenan** |
| Visibilidad de cultos | **10 de 10** |
| Comentarios filtrados | **0 de 6 páginas** |
| **Vulnerabilidades** | **de 15 a 8** (13 altas → 6) — **`next` y `pdfjs-dist` desaparecen**; las 6 que quedan son de herramientas de desarrollo y **no llegan a ningún navegador** |

⬜ **LO QUE NADIE HA MIRADO TODAVÍA, y es la mitad que falta:** todo lo anterior es **servidor**.
Con `curl` no se prueba **nada de lo que hace JavaScript en el navegador**, y esta tanda ha metido
justo eso: **arrastrar el repertorio, el desplegable del acorde con sus pestañas, la pantalla
completa y los botones ± del tono**. Un cambio de versión mayor de Next puede tocar la hidratación
y los portales — y **el desplegable del acorde usa un portal y la pantalla completa del
navegador**, que es lo más frágil que hay aquí.
→ 🔴 **Por eso NO se sube a `main` todavía.** La rama está publicada aparte para que no se pierda,
y le toca a Isaac abrirlo en `localhost:3000` y probar cuatro cosas. **Es su propia regla 2**:
*«nada está arreglado hasta comprobarlo… si el cambio toca la interfaz, hay que simular el flujo
completo del usuario final»*.


### 9.2-septies · P-04 — que un culto no pueda quedarse vacío · ✅ APROBADA por Isaac el 2026-08-22

Isaac eligió esto de cuatro opciones. Es el único de los problemas abiertos que **puede morder un
domingo por la mañana**.

#### El fallo, en cuatro líneas

`services/actions.ts`, `replaceSongs`: guardar un culto **borra todas sus canciones y las vuelve a
insertar**.

```ts
await supabase.from("service_songs").delete().eq("service_id", serviceId);   // ← ya no hay nada
if (songs.length) await supabase.from("service_songs").insert(rows);         // ← si esto falla...
```

Son **dos viajes independientes a la base**. Entre uno y otro, el culto **está vacío**. Si el
segundo falla —se cae la conexión, el móvil pierde cobertura mientras se guarda, la base rechaza
una fila—, el error se ve en pantalla **pero el repertorio ya se borró**. Y no hay «deshacer».

📌 **Por qué importa aquí y no en otro sitio:** el culto se arma **el sábado o el domingo antes de
tocar**, muchas veces **desde el teléfono**, que es justo donde la conexión se corta.

#### D-26 · Se arregla con una FUNCIÓN EN LA BASE, no reordenando las llamadas

Se miraron tres caminos:

| Camino | Por qué no / por qué sí |
|---|---|
| **Insertar primero y borrar después** | ❌ Durante un instante el culto tiene **el repertorio duplicado**, y si falla el borrado se queda así. Cambia un fallo por otro |
| **Guardar una copia y reinsertarla si falla** | ❌ Es un «deshacer» a mano: si también falla la reinserción —y en un corte de conexión falla—, **se perdió igual**. Más código y la misma promesa rota |
| ✅ **Una función de PostgreSQL** | **Una función de PL/pgSQL corre dentro de UNA transacción.** Si el insert falla, el borrado **se deshace solo**. No es un truco: es lo que la base ya sabe hacer y el código no puede hacer desde fuera |

**Y la seguridad no se afloja:** la función va **`security invoker`** (el modo por defecto), así que
se ejecuta con los permisos de quien llama y **la política `service_songs_write_admin` sigue
mandando**. Un músico que la invocara directamente no podría vaciar nada. Lo contrario
—`security definer`— habría abierto una puerta para saltarse los permisos, que es el error clásico
de este arreglo.

#### D-27 · El código va PRIMERO y aguanta que la función no exista

🔴 **Es L-121 otra vez**, y aquí toca aplicarla al revés que en O-31: allí faltaba una columna, aquí
falta una función. Entre publicar el código y ejecutar la migración hay un rato en el que
producción llama a algo que **todavía no está**.
→ Si la base contesta *«esa función no existe»*, el código **hace lo de siempre** —borrar e
insertar— y deja constancia. En cuanto la migración esté, pasa a usar la función **sin tocar nada
más**.
→ **El respaldo se quita cuando la migración lleve un tiempo aplicada**, no antes. Anotado en §9.1
para que no se quede ahí para siempre.

| Sub | Qué | Estado |
|---|---|---|
| **M.1** | La función `reemplazar_canciones_culto` — migración `20240018` | ⬜ **escrita, sin ejecutar** |
| **M.2** | `replaceSongs` la usa, con respaldo si no existe | ⬜ |
| **M.3** | Comprobar que el culto **no se vacía** cuando el guardado falla | ⬜ **espera la migración** |

#### Comprobado hasta donde se puede sin la migración (2026-08-22)

- **Compila limpio.**
- **El respaldo se dispara con el error correcto.** Llamando a la función contra la base real —que
  todavía no la tiene— PostgREST contesta **`PGRST202`**, que es exactamente lo que reconoce
  `funcionQueNoExiste`. Así que **publicar este código no rompe nada**: seguirá guardando como
  hasta ahora hasta que la migración esté.
- El camino de respaldo es **byte a byte el que lleva meses funcionando**; no se ha reescrito.

#### 🔬 La prueba que hay que hacer DESPUÉS de la migración, y cómo

**No basta con que la función guarde bien: hay que demostrar que DESHACE.** La prueba es corta y
prueba justo el fallo que se está arreglando:

1. Contar las canciones del culto → **20**.
2. Llamar a la función con una canción **que no existe** (viola la clave foránea, así que el insert
   falla a mitad).
3. Volver a contar.

| Si la función es correcta | Si estuviera mal |
|---|---|
| La llamada da error **y el culto conserva sus 20 canciones** | El culto se queda **vacío** — el fallo original, reproducido |

⚠️ **Toca datos reales, así que necesita el OK de Isaac** y **copia fresca antes**. Si saliera mal,
las 20 filas se restauran desde `service_songs.json` de la copia.



#### ✅ P-04 HECHA, MIGRADA Y COMPROBADA (2026-08-22)

Isaac dio el permiso para las tres cosas: *«te doy el permiso, adelante»*. Se hizo **en el orden de
T-07**: copia → código a producción → migración → prueba.

| Sub | Estado |
|---|---|
| **M.1** Función `reemplazar_canciones_culto` (migración `20240018`) | ✅ **aplicada** |
| **M.2** `replaceSongs` la usa, con respaldo si no existe | ✅ publicado en `0c2e7ea` |
| **M.3** Demostrar que **deshace** | ✅ **medido, abajo** |
| **M.4** Cerrarla a los anónimos (migración `20240019`) | ✅ **aplicada** — hallazgo de la propia prueba |

**Copia previa:** `Partituras-datos-2026-08-22-11h58h26` (20 filas de repertorio) más un volcado
completo de `services` y `service_songs` leído directamente de la base, porque la copia estándar
**ya solo trae 1 de los 3 cultos** — efecto de la migración 017, que cerró la lectura pública.

#### La prueba, que es lo que de verdad valía

**① Que DESHAGA.** Se llamó a la función sobre el culto «asd» pasándole una canción **que no
existe**, para que el insert reventara a mitad:

| | Antes | Después |
|---|---|---|
| Canciones del culto | **8** | **8** |
| Repertorio total | 20 | **20** |

**El culto conservó su repertorio tras un guardado que falló.** Con el código viejo se habría
quedado vacío — es el fallo original, reproducido y contenido.

**② Que además GUARDE bien.** Se le pasaron al mismo culto exactamente sus 8 canciones:
**8 de 8 coinciden en canción y posición**, posiciones `0,1,2,3,4,5,6,7` sin huecos. Los tres
cultos quedaron **exactamente como estaban**: `asd=8 · Ayuno=5 · Escuela Dominical=7`.

#### 🔴 T-15 · `revoke ... from public` NO revoca lo que se concedió a un ROL

*Síntoma:* con la 018 ya aplicada, llamar a la función **sin cuenta, con la clave pública**,
devolvía **`204 No Content`** — o sea, se ejecutaba.
*Causa:* la 018 terminaba en `revoke all on function ... from public`. **Supabase concede EXECUTE a
`anon` y a `authenticated` de forma explícita** en cada función nueva, y **revocar de `PUBLIC` no
toca una concesión explícita a un rol**. Son dos cosas distintas y se parecen mucho.
*Comprobado:* `has_function_privilege('anon', ...)` daba **`true`** después de la 018.

✅ **NO era explotable, y también se midió:** llamándola sin cuenta contra un culto **de verdad**
para vaciarlo, el culto **conservó sus 8 canciones**. La función es `security invoker`, así que el
borrado corre con los permisos de quien llama y la política `service_songs_write_admin` no le deja
ver ni una fila que borrar. **La defensa real estaba donde tenía que estar** (D-26).

*Cómo se cerró:* migración `20240019`, `revoke execute ... from anon`.
*Medido después:* la misma llamada devuelve **`401`**, `anon` → `false`, la app (`authenticated`)
→ `true`, y `prosecdef` → `false` (sigue siendo invoker, no definer).

📌 **Lo que enseña, y por eso sube a trampa:** el permiso se **comprueba**, no se deduce del SQL que
uno escribió. Dos líneas de `has_function_privilege` separaron *«creo que está cerrado»* de *«está
cerrado»* — y el agujero lo abrió una línea que **parecía** hacer justo eso.

⬜ **Pendiente menor, con dueño:** el **respaldo** de `replaceSongs` —el borrar-e-insertar de
siempre— ya no se usa nunca, porque la función existe. **Se quita cuando lleve unos días en pie.**
Anotado en §9.1 para que un respaldo temporal no se quede para siempre.


### 9.2-octies · P-11 — las pruebas automáticas · ✅ APROBADA por Isaac el 2026-08-22

Isaac: *«adelante con lo veas mejor»*. Se eligió P-11 porque **la semana lo justificó sola**: dos
fallos serios y **los dos se cazaron probando, no razonando** — Next 16 (el build en verde y la app
rota entera) y el `revoke` que no revocaba. Las dos veces la comprobación fue **a mano**, así que
no quedaba nada que la repitiera la próxima vez.

#### Cómo está montado, y las tres decisiones que lo sostienen

| Decisión | Por qué |
|---|---|
| **`node --test`, el de Node. CERO dependencias nuevas** | El proyecto ya arrastra 8 vulnerabilidades de herramientas de desarrollo; meter otro ejecutor con su árbol de paquetes iba en contra. Node trae uno desde la 18 |
| **Se compila `src/lib` con `tsc` antes de probar** (`pruebas/preparar.mjs`) | 🔴 **El CI corre con Node 20, que NO ejecuta TypeScript.** Sin este paso las pruebas no arrancarían allí — y una prueba que solo corre en el equipo de casa no es una red de seguridad |
| **Se compila a CommonJS, no a módulos ES** | `tsc` emite `from "./acordes"` **sin la extensión `.js`**, y Node en modo ES la exige. Con `require` se resuelve sola. Es lo mismo que ya hacían los arneses |
| **Se prueba EL ARCHIVO REAL, nunca una copia** | Una prueba sobre una copia pegada sigue en verde el día que el original cambia. `preparar.mjs` lee `src/lib/*.ts` y solo reescribe las rutas `@/…`, que las entiende Next pero no `tsc` |

#### 🔴 Y encontró un fallo A LA PRIMERA

Escribiendo la tabla del círculo de quintas, la prueba de `ortografiaDe` falló en **Db**:
`KEY_OPTIONS` decía **`C#`** para esa altura. Y es incorrecto de verdad: **`C#` mayor tiene SIETE
sostenidos** —con mi sostenido y si sostenido dentro— y **no la toca nadie**; **`Db` mayor tiene
cinco bemoles** y es la que se lee.
→ **Comprobado antes de tocar nada:** de las 75 canciones, los cultos y las versiones por tono,
**ninguna** usaba esa altura. Cero datos que migrar.
→ En **menor** la tabla ya estaba bien y no se toca: `C#m` son 4 sostenidos y `Dbm` serían 8.
📌 **El fallo llevaba ahí desde antes de que empezáramos**, y no lo habría visto nadie hasta que
alguien transpusiera a ese tono. Lo cazó la primera tabla que se escribió.

#### Qué cubren las 103 pruebas

| Archivo | Qué asegura |
|---|---|
| `musica.test.mjs` (27) | El tono. **Cada bloque es un fallo que llegó a la página**: T-06 (se perdía el modo), T-11 (no recalcular lo escrito), T-14 (la ortografía la manda el destino), y las 12 tonalidades del círculo de quintas |
| `acordes.test.mjs` (20) | Las notas por grados (T-13), **los dos casos que parecen fallos y no lo son** (`Bbmaj7/#9`, `Dbm`), la doble vida de la barra `/`, y la notación propia de Isaac (`A4`, `E#m2/b5`) |
| `guitarra.test.mjs` (56) | **Que las posturas SUENEN**: ninguna nota de fuera, ninguna del acorde ausente salvo la quinta. Más que caben en una mano y que los acordes al aire ganan a los de cejilla |

**Enganchadas al CI**, delante del build: si una falla, sale ❌ en el commit **antes** de que
Vercel publique nada.

#### 🔴 Y el CI se puso ROJO a la primera, por la razón más tonta posible

El `npm test` decía `node --test "pruebas/*.test.mjs"`. **Los globs en `--test` llegaron en Node
21**, y **el CI corre con Node 20**: `Could not find '…/pruebas/*.test.mjs'`. En el equipo de Isaac
—Node 24— funcionaba perfectamente.

📌 **Es la misma lección de siempre en su versión pequeña:** *«funciona en mi máquina»*. Y encima
**estaba escrito tres líneas más arriba** —que el CI usa Node 20 y por eso hay que compilar el
TypeScript— y aun así se escribió un comando que esa versión no entiende.

*Cómo quedó:* `pruebas/ejecutar.mjs` **lee la carpeta y pasa los archivos uno a uno**, que es lo
único que funciona en las dos versiones:

| Forma | Node 20 | Node 24 |
|---|---|---|
| `node --test pruebas/` | ✅ | ❌ «Cannot find module …/pruebas» |
| `node --test "pruebas/*.test.mjs"` | ❌ sin globs | ✅ |
| **`node --test a.mjs b.mjs c.mjs`** | ✅ | ✅ |

→ Y añadir una prueba **no obliga a tocar nada**: la lista se saca leyendo el directorio.
✅ **La página no se enteró:** el CI y Vercel son independientes, así que el despliegue siguió
verde y `/login` respondiendo 200 con el CI en rojo. **Conviene saberlo: un CI rojo aquí NO
significa que el sitio esté caído** — y al revés, tampoco protege de publicar.

⬜ **Lo que falta, y por qué no está:**
- **Las 75 canciones reales NO pueden ir al repositorio: es PÚBLICO.** Los arneses que las usan
  (`ligaduras`, `notas`, `piano`, `comentarios`…) siguen viviendo en el `scratchpad` y leyendo del
  respaldo local. **Se mudarán con un salto si no encuentran los datos**, para que el CI no falle.
- **El recorrido de las 19 pantallas** (lo que se hizo a mano con Next 16) todavía no está
  automatizado. Es lo siguiente, y necesita una sesión de verdad para las páginas protegidas.

### 9.2-nonies · O-01 y O-19 — las dos preguntas musicales, CERRADAS el 2026-08-22

#### ✅ O-01 · La ligadura de valor se queda COMO ESTÁ. No se programa nada

Quedaba una sola duda de O-01 desde el 2026-08-20: la ligadura **suma las duraciones** —eso ya
funciona, el compás cuenta la suma—, pero faltaba decidir **cómo se dibuja**: dos figuras con el
arco, o fundidas en una sola con la duración sumada.

**Isaac eligió dejarlo como está**, y antes de preguntarle se midió, que es lo que hizo la pregunta
contestable:

| | |
|---|---|
| Parejas ligadas en las 75 canciones | **13** |
| …con duración escrita en **los dos** acordes | **3** |
| …y las tres son el mismo caso | **blanca + blanca = redonda** |
| Las otras 10 | **sin duración escrita**: no hay figura que fundir |

🔴 **Y el hallazgo que decidió la pregunta: en las tres, los dos acordes son DISTINTOS**
(`Dm7→Bb`, `Am7→Em7`, `F→G7`).

Eso importa porque en partitura una ligadura de valor **une la misma nota**, y por eso se pueden
fundir en una figura. Aquí une **dos acordes diferentes**, así que fundirlos obligaría a decidir
cuál se queda con la redonda — **y el otro desaparecería de la cuadrícula**.

→ **O-01 queda CERRADA del todo.** Su otra mitad —la duración suelta sin acorde delante— se hizo en
la fase D. **No queda nada pendiente de O-01.**

📌 **Por qué está escrito aunque no cambie una línea, igual que D-19:** la pregunta va a volver.
Sin esto, el siguiente que lea «la ligadura suma las duraciones» se pone a fundir figuras y rompe
tres canciones.

#### 🎺 O-19 · El trompetista LEE LOS ACORDES y se saca su parte

Isaac, 2026-08-22, contestando qué hace hoy: **lee la cuadrícula como los demás y toca lo que le
sale**. Nadie le escribe una línea aparte.

**Eso descarta el trabajo caro y deja el barato**, que era la duda desde el 2026-08-20:
- ❌ **NO hay que teclear su línea de notas** — no existe en ningún sitio y habría sido otro
  trabajo de escribir 75 canciones, como las letras.
- ❌ **NO hacen falta digitaciones de pistones** — él no lee notas sueltas, lee acordes.
- ✅ **Lo que le sirve es la canción en SU tono.** Y eso ya se sabe hacer: es transponer.

🔴 **Y hay un problema real que hoy tiene, aunque no lo haya dicho: si lee los acordes tal cual,
está tocando un tono por debajo.** La trompeta es **en Si♭**: suena **un tono más grave** de lo que
se lee. Si en la página pone `D` y él toca su `D`, **suena `C`** — y va con el resto del grupo por
un tono de diferencia. Para que suene `D` tiene que leer **`E`**.

**Lo que leería en las 75 canciones, medido:**

| El tono de la canción | Lo que él debe leer | Cuántas |
|---|---|---|
| D | **E** | 14 |
| F | **G** | 10 |
| E | **F#** | 9 |
| C | **D** | 7 |
| G | **A** | 6 |
| Dm | **Em** | 5 |
| Bm · Bb · A | **C#m · C · B** | 4 cada uno |
| Em · Am | **F#m · Bm** | 3 cada uno |
| F# · B | **Ab · Db** | 2 cada uno |
| G#m · Cm | **Bbm · Dm** | 1 cada uno |

⚠️ **Un aviso honesto que sale de la cuenta:** las 2 canciones en `F#` le quedan en **Ab**, las 2 en
`B` en **Db**, y la de `G#m` en **Bbm**. Son tonos incómodos de trompeta, y **eso no se puede
evitar**: es la cuenta, no una decisión. Lo único que lo arreglaría es bajar el tono de esas
canciones para todo el grupo, y eso es cosa de Isaac.

#### ✅ D-28 · La página se lo da YA TRANSPUESTO. El trompetista no transpone de cabeza

Isaac, 2026-08-22: *«que le aparezca transpuesto al trompetista, para que no lea nada de mente»*.

→ **La cuenta la hace la página, no la persona.** Es la misma idea que ya manda en el resto del
proyecto: lo que se puede calcular no se le pide al músico en mitad de un culto.

**Tres decisiones, y la primera es la que evita un lío de verdad:**

1. 🔴 **La barra enseña LOS DOS tonos: `Tono: D · lees E`.** Si solo se enseñara el suyo, el
   trompetista diría «estamos en E» y el resto «no, en D» — **discutiendo el tono en mitad del
   servicio**. Enseñar los dos números no cuesta nada y quita el malentendido de raíz.
2. **Se guarda por músico, en su aparato** (`localStorage`), como el instrumento del acorde
   (O-42) y el tamaño de letra (D-09b). Lo pone una vez y ya. **Sin migración, sin tocar la base**,
   y sin que la elección de uno afecte a nadie más.
3. **Vale para cualquier instrumento en Si♭, no solo la trompeta:** clarinete, saxo tenor y saxo
   soprano necesitan exactamente lo mismo. La regla vive en `lib/transpositores.ts`, así que
   añadir el saxo alto (en Mi♭) el día que haga falta es **una línea**.

⚠️ **Y el aviso honesto, que no tiene arreglo desde el código:** las 2 canciones en `F#` le quedan
en **Ab**, las 2 en `B` en **Db**, y la de `G#m` en **Bbm**. Son tonos incómodos de trompeta, y
**es la cuenta, no una decisión**. Lo único que lo cambiaría es bajarle el tono a esas 5 canciones
para todo el grupo — **decisión de Isaac, no se toca por cuenta propia**.

| Fase | Qué | Estado |
|---|---|---|
| **P.1** | `lib/transpositores.ts` + el selector en la presentación, con el tono doble | ✅ **HECHO** |
| **P.2** | Que se recuerde por músico | ✅ **HECHO** |
| **P.3** | *(a decidir)* El PDF del culto en su tono, para llevarlo en papel | ⬜ **sin empezar** |

#### Cómo quedó, y los dos cuidados que hacían falta

- **`lib/transpositores.ts`** — la regla en un sitio. **Dos entradas: «Como suena» (0) y
  «Trompeta» (+2).**
  🔴 **El Mi♭ del saxo alto se QUITÓ**, el 2026-08-22, por orden de Isaac: *«quita el Mib del saxo
  alto, ya que nada más usamos trompeta»*. Se había dejado escrito «por si acaso» —era una línea—
  y él lo cortó: **una opción que nadie usa es ruido en un selector que se mira tocando.** Si algún
  día entra un saxo alto, se añade con su `semitonos: 9`.

#### 🔤 D-29 · Las notas se nombran SIEMPRE en cifrado americano: C, D, E, F, G, A, B

Isaac, 2026-08-22: *«que sea en cifrado americano para todo C, D, E, F, G, A, B»*.

→ **Ni en la pantalla, ni en los comentarios del código, ni en las pruebas.** Se dice `Bb`, no
«si bemol»; `E`, no «mi». Es el idioma en el que están escritas las 75 canciones, y mezclarlo
obliga a traducir mentalmente **justo a quien menos tiempo tiene**, que es el que está tocando.
→ **Barrido entero:** el selector decía «En Si♭» y ahora dice **«Trompeta»** (con «en Bb» en la
ayuda). Se corrigieron además `music.ts` («G, D, A, E y B llevan sostenidos», «un E# y un B#»),
`acordes.ts` («B→C→D»), `guitarra.ts` («familia de E» y «familia de A»), `PianoDiagram`
(«llevan negra detrás C, D, F, G y A») y las tres pruebas.
→ **Queda UNA sola mención**, y es **la cita de esta misma regla** en `transpositores.ts`: si se
borra, desaparece el motivo. Es lo mismo que se hizo con «cancionero» (O-27), y por la misma razón
— **esa regla ya se incumplió una vez por vivir solo en el historial**.
⚠️ **Lo que NO son nombres de nota y se queda igual:** «negra», «blanca», «corchea», «redonda» y
«semicorchea» son nombres de **duración**, no de nota, y en cifrado americano no tienen
equivalente.
- **El selector va pegado al tono**, en su propia fila de la barra, porque es justo lo que cambia:
  qué tono ves escrito.
- 🔴 **Lo que no era obvio ①: la excepción de T-11 deja de aplicar.** «Sin mover el tono se enseña
  lo escrito» vale mientras **no se transponga**; con un instrumento transpositor **sí** hay que
  reescribir, así que ahí manda otra vez la ortografía del tono destino. Sin ese matiz, un
  trompetista en una canción en `F` habría visto los acordes de `G` **escritos con bemoles**.
- 🔴 **Lo que no era obvio ②: el auto-ajuste del tamaño hay que rehacerlo** al cambiar de
  instrumento — los acordes cambian de ancho (`C#m` no mide lo que `Dbm`) y el texto puede dejar
  de caber.
- **El culto compartido lo hereda gratis:** usa el mismo componente.

#### Comprobado (2026-08-22)

- **Compila limpio**, el selector sale con sus tres opciones, y **por defecto no hay tono doble**
  —porque por defecto no se transpone—. Arnés de comentarios: 0.
- 🔴 **Y sobre todo: 25 pruebas nuevas** (`pruebas/transpositores.test.mjs`), que suben el total a
  **128**. Se prueban **las 16 tonalidades reales del repertorio** una a una: `D→E`, `F→G`,
  `E→F#`, `Bb→C`, `F#→Ab`, `G#m→Bbm`… y que **los acordes se reescriben, no solo el rótulo**.
  📌 **Aquí las pruebas no son ceremonia:** si la cuenta estuviera mal, **no se ve**. El
  trompetista lee algo que parece razonable, lo toca, y suena un tono fuera. Ni pantalla en rojo
  ni error en la consola: solo un domingo que suena raro.
- **Ante la duda, no se transpone:** un valor desconocido guardado en el navegador da 0, así que
  lo peor que puede pasar es ver el tono normal.

⬜ **Lo que hay que probar con los ojos, y no puedo yo:** el selector es del navegador, así que
**hay que pulsarlo**. Y lo que de verdad cierra esto es que **el trompetista lo mire y diga que sí**.

📌 **Dónde NO va a estar, y hay que decirlo:** el **modo vista** de una canción **hoy no transpone
nada** —ni con culto ni con los ±—, así que ahí no hay dónde engancharlo sin añadirle antes la
transposición entera. Va en **la presentación**, que es *«LA pantalla del culto»* (O-30) y donde el
músico lee tocando. El culto compartido lo hereda gratis: usa el mismo componente.

### 9.2-decies · P-01 — desactivar un usuario ahora lo desactiva de verdad

Isaac, 2026-08-28: *«adelante con lo tuyo que puedes hacer»*. Se eligió P-01 el primero porque es
el único de la lista que **puede dejarle sin poder cerrarle la puerta a alguien**, y no depende de
nadie más.

#### El fallo

`admin/actions.ts:161` escribe `profiles.active`, la tarjeta del panel se pinta en gris… y **nadie
lee ese campo nunca más**: ni el middleware, ni el layout, ni una sola política de la base.
**El usuario «desactivado» entra igual**, con todos sus permisos.

📌 **Es el botón mentiroso, y de los peores que hay:** no falla, no da error, y **parece que
funcionó** — la tarjeta se apaga y el mensaje dice «Usuario desactivado». Isaac se enteraría el día
que lo necesitara de verdad, que es el peor día para enterarse.

#### D-30 · Se comprueba en el LAYOUT del panel, y `/salir` cierra la sesión

🔴 **CORREGIDA EL 2026-08-29, y la corrigió la realidad: la primera versión iba en el MIDDLEWARE
y TUMBÓ LA PÁGINA** (`504 GATEWAY_TIMEOUT`, ver **T-17**). El razonamiento de abajo era correcto
en todo menos en lo que acabó importando: **el coste**.

| Dónde | Por qué no / por qué sí |
|---|---|
| ~~El middleware~~ | ❌ **Lo que se probó primero y salió mal.** Cubre todas las rutas y puede escribir cookies, sí — pero **se ejecuta en CADA navegación de CADA usuario**, y consultar `profiles` le añadía un viaje a la base encima del `getUser()` que ya hace. **Medido: 13 s con sesión**, y Vercel corta a los 25 |
| ✅ **El layout del panel** | **Ya carga el perfil entero** (`select("*")`), así que la comprobación **no cuesta ni una consulta más**. Es lo que se buscaba desde el principio y estaba delante |
| ✅ **`/salir`, una ruta nueva** | Un componente de servidor **no puede escribir cookies**, así que el layout puede redirigir pero no cerrar la sesión. Un manejador de ruta sí: comprobado que devuelve la cookie con `Max-Age=0` |
| Las políticas de la base | ⚠️ Es lo correcto de verdad, y **falta** (ver abajo). Toca `is_admin()` y las políticas de lectura de cinco tablas: cambio de riesgo alto, con migración |

⬜ **Lo que el layout deja fuera, y hay que saberlo:** `/imprimir/culto/[id]` vive aparte del panel
—para poder paginar el PDF—, así que un desactivado con la sesión todavía viva podría abrir esa
hoja. **Es una hoja de impresión de un culto, no el panel**, y el precio de cubrirla era tumbar la
página entera. Si algún día importa, se le añade la misma comprobación **a esa página**, no al
middleware.

🔴 **Y la regla que evita el desastre: se echa SOLO si `active` es exactamente `false`.**
Si la consulta falla, si el campo llega `null`, si la fila no está — **se deja pasar**. Un fallo al
leer un permiso **no puede convertirse en «fuera todo el mundo»**: es la misma lección de L-121 y
T-07, y aquí el precio de equivocarse es dejar a los músicos sin página un domingo.

#### ✅ PROBADO EN PRODUCCIÓN (2026-08-28), y lo probó Isaac

Él desactivó `pruebaclaude` desde `/admin` y pidió intentar entrar. Con la sesión de esa cuenta,
contra **producción**:

| Petición | Respuesta |
|---|---|
| 1.ª · `/catalog` | **`307 → /login?cuenta=desactivada`** |
| 2.ª · `/services` | `307 → /login` |
| 3.ª · `/letras` | `307 → /login` |

🔴 **Y las dos últimas son la prueba de verdad, no la primera:** ya no llevan el aviso **porque la
sesión ya no existe**. Si el middleware solo redirigiera, la cookie seguiría viva y las tres darían
lo mismo. **Se cerró la sesión de verdad.**

**Y no echó a nadie de más:** `/login` y `/novedades` siguen a 200 sin cuenta, y las protegidas
siguen rebotando como antes para quien no ha entrado.

⬜ **Lo único sin comprobar es el aviso en pantalla**: se pinta con JavaScript al montar, así que no
sale en el HTML. Se ve abriendo `/login?cuenta=desactivada` en el navegador.

⬜ **Lo que NO cubre, y hay que decirlo (L-87):** esto es la aplicación. Un desactivado que se
guarde su token **puede seguir leyendo por la API** hasta que caduque. Para cerrarlo de verdad hay
que meter `active` en las políticas de la base, y eso es una migración aparte — anotada en §9.3.
**La mitad que sí queda cerrada es la que se usa: por la página web no entra.**

### 9.3 Dependen de Claude (a la espera de que Isaac decida)

Ninguno en marcha. **No se toca nada de esto hasta que Isaac lo dicte** (fue explícito:
«no propongas cambios, no reorganices nada y no escribas una línea de código hasta que yo te
lo confirme»).

Esto **no** es el encargo de Isaac (§9.2): son los problemas que encontré yo leyendo el
código, ordenados por lo que más puede morder. **Ninguno está aprobado.**

- [x] ~~**P-01 · Desactivar un usuario no lo desactiva**~~ → **HECHO y PROBADO EN PRODUCCIÓN el
      2026-08-28** (§9.2-decies). El middleware comprueba `profiles.active` y **cierra la sesión**.
      Lo probó Isaac desactivando la cuenta de prueba: la primera petición dio
      `/login?cuenta=desactivada` y las siguientes `/login` a secas — **la sesión se cerró de
      verdad**. Reactivada, vuelve a la normalidad. El aviso está publicado (comprobado dentro del
      JavaScript que sirve `/login`).
      ⬜ **Falta la mitad de la BASE:** meter `active` en las políticas, para que un token guardado
      tampoco pueda leer. Por la página web **ya no entra**, que es el uso real.
      📄 **La migración `20240020_usuario_desactivado.sql` ya está ESCRITA (2026-08-29) y SIN
      EJECUTAR.** Hace tres cosas: una función `esta_activo()` —con `coalesce(active, true)`, para
      que un fallo al leer no eche a nadie—, **`is_admin()` deja de dar permisos a un admin
      desactivado** (el caso que más muerde), y la lectura de `sheets` y `services` la exige.

      🔴 **NO se puede aplicar a ciegas, y hay dos motivos:**
      1. **Usa `alter policy` sobre nombres que salen del repositorio**, y **T-01 dice que el
         repositorio no es la base**. Si en producción esa política se llama de otra forma, la
         migración **falla a mitad**. → Hay que **leer `pg_policies` primero**, y hoy no se puede:
         la herramienta de Supabase lleva denegando las consultas desde el 2026-08-28.
      2. 🔴 **Es el cambio con más capacidad de dejar a todo el mundo fuera** de cuantos se han
         hecho aquí: toca `is_admin()`, que sostiene **todas** las políticas de escritura. Si algo
         sale mal, no es que falle una pantalla — **es que no entra nadie**.
      → **Necesita: la herramienta de Supabase funcionando, copia previa, y el OK expreso de
      Isaac** (D-04). Y conviene hacerla **sola**, sin nada más en la misma tanda.
- [ ] **P-02 · Los cultos no compartidos son legibles por cualquiera.**
      `services_select_all` (`20240012:71`) es `using (true)` **sin `to authenticated`**. El
      filtro `is_public` solo está en el código (`s/[token]/page.tsx:22`), no en la BD. Con la
      clave `anon` —pública— cualquiera lista todos los cultos. Igual con `sheets`,
      `categories`, `sheet_tags`, `sheet_categories`: **el catálogo entero es legible desde
      internet**.
- [ ] **P-03 · «Solo el admin edita» puede ser solo apariencia.** Depende de si la migración
      011 está aplicada de verdad (T-01). Si no lo está, un `musician` puede crear y editar
      canciones llamando a la API directamente, aunque no vea el botón.
- [x] ~~**P-04 · Editar un culto puede dejarlo vacío.**~~ → ✅ **ARREGLADO el 2026-08-22**,
      migraciones `20240018` y `20240019`. Guardar el repertorio va por una función de la base que
      corre en **una transacción**: si el insert falla, el borrado se deshace. **Comprobado con un
      guardado que revienta a mitad: el culto conservó sus 8 canciones.** El detalle, en
      §9.2-septies, y de la prueba salió **T-15**.
- [x] ~~**P-05 · Una canción no se puede repetir en un culto**~~ → **HECHO en la fase E**
      (2026-08-20), migración `20240015`: la clave primaria pasó a ser un id propio de cada fila.
      Era la misma petición que O-09. Confirmado por Isaac: *«lo probé y funciona»*.
- [ ] **P-06 · El OCR depende de un CDN externo.** `songImport.ts:74-77` carga worker, WASM e
      idiomas de `cdn.jsdelivr.net` y `tessdata.projectnaptha.com`. Sin internet no funciona,
      en una app que se vende como instalable.
      📊 **MEDIDO el 2026-08-28, y el numero cambia la decision:**

      | Pieza | Peso | ¿Esta ya en el proyecto? |
      |---|---|---|
      | `worker.min.js` | **112 KB** | ✅ si, en `node_modules` |
      | El motor (`.wasm`) | **19 MB** los ocho; **~4 MB** el que se use | ✅ si |
      | **El idioma `spa`** | **8,4 MB** | ❌ **NO**, y encima usa `spa+eng`, asi que son dos |

      🔴 **Ahi esta el problema, y no es tecnico: el repositorio es PUBLICO y es de su primo.**
      Traerselo todo a casa son **~15-20 MB** metidos en el repositorio de otra persona. Las dos
      primeras piezas se pueden copiar hoy mismo —ya estan en `node_modules`, como se hace con
      `pdf.worker.min.mjs`—, pero **si el idioma sigue viniendo de fuera, no se arregla nada**:
      sin internet seguiria sin funcionar.
      → **Hay una salida a medias:** los `traineddata` **«fast»** pesan ~1 MB en vez de 8,4, con
      algo menos de acierto. Para leer acordes de una foto puede sobrar.
      → **Decision de Isaac**, y hay que preguntarsela con estos numeros. No se mete nada en el
      repositorio del primo por cuenta propia.

      ❌ **DESCARTADO POR ISAAC el 2026-08-28: «dejalo como esta».** Se le ofrecieron las tres
      opciones con su peso —la ligera (~2 MB), dejarlo, y la completa (~20 MB)— y eligio no tocarlo.
      → **P-06 deja de ser un pendiente y pasa a ser una decision tomada.** No volver a proponerlo:
      el OCR se usa **con internet**, que es como se usa la pagina el 99 % de las veces, y el precio
      era meter megas en el repositorio de otra persona.
      → 📌 **Si alguna vez cambia:** lo unico que faltaria de verdad es el idioma; el programa y el
      motor **ya estan en `node_modules`** y se copian como se hace con `pdf.worker.min.mjs`.
- [x] ~~**P-07 · El README miente en la sintaxis**~~ → **CERRADO el 2026-08-28**, y lo pidió Isaac:
      *«los cambios que se hacen, agrégalos al readme, para tener todo ahí como venía haciendo mi
      primo»*.
      📌 **Y «como venía haciendo» tenía trampa, comprobada con `git log --follow README.md`: el
      primo lo actualizó hasta `r10` y ahí lo dejó.** Llevaba **veinte versiones** describiendo una
      app que ya no existe — decía que las secciones se escriben `<Coro>`, que se busca por número
      de himno (borrado en D-16) y que el PDF y la PWA estaban pendientes.
      **Qué se puso al día:** la pila (Next 16), qué hace la app hoy, **la tabla de sintaxis
      entera** —con ligadura, calderón, staccato, `%`, `;`, el paso cromático y el aviso de que la
      vieja era falsa—, los scripts (`npm test`, `npm run verificar`), las 19 migraciones con el
      aviso del orden, la estructura real de carpetas, el roadmap, la deuda técnica y una sección
      de **pruebas**.
      **Y un «Historial de versiones»** con `r31`…`r45`, retomando la numeración del primo. → **A
      partir de aquí las publicaciones vuelven a llevar su `rXX`.**
- [x] ~~**P-08 · El enlace «Regístrate» da 404**~~ → **HECHO en la fase L** (2026-08-22). **No se
      creó la página, se quitó el enlace**: aquí las cuentas las crea el admin y no debe haber
      registro abierto. En su sitio queda a quién pedirla. `/signup` salió también de las rutas
      públicas del middleware.
- [x] ~~**P-09 · `parseSections` duplicado**~~ → **CERRADO el 2026-08-28**, y no por limpieza:
      **fue la causa de O-44**. Al estar escrita dos veces y no haber «la de todos», la pantalla de
      crear canción no tenía a cuál llamar y se quedó **sin secciones**. Ahora hay **una sola** y la
      usan **siete** archivos. Se comprobó que las dos copias eran idénticas antes de quitar una.
      📌 **Es la tercera vez que muerde este patrón** —la consulta del catálogo, la lista de
      secciones del panel, y esta—: *dos copias de la misma lógica no fallan el día que se
      escriben; fallan el día que aparece una tercera pantalla.*
- [~] **P-10 · Higiene** — **casi cerrada.**
      - [x] ~~`tsconfig.tsbuildinfo`~~ → Fase A: a `.gitignore` y fuera del control de versiones.
            Era la fuente numero uno de conflictos al trabajar dos personas.
      - [x] ~~`layout.tsx` huerfano en la raiz~~ → **BORRADO el 2026-08-28**, y era un fosil
            comprobado: su `import "./globals.css"` apuntaba a **un archivo que no existe** ahi, y
            lo unico que tenia de propio era una descripcion que hablaba de **«mosaicos
            musicales»** — el modulo que se elimino antes de que llegaramos a este proyecto.
      - [x] ~~El CORS de `next.config.js`~~ → **QUITADO el 2026-08-28**, despues de comprobar que
            **no hacia nada**: se aplicaba a `/api/*` y **no existe ninguna ruta `/api`**; a
            `/catalog/*` y `/sheets/*`, que son **paginas HTML** y el navegador no les aplica CORS;
            y sobre todo **el origen permitido era el dominio de la propia pagina**, y el mismo
            origen nunca necesita permiso CORS.
            📌 **Lo malo no era el coste, era que MENTIA:** parecia haber una politica de acceso
            pensada. El dia que cambiara el dominio habria dejado de coincidir sin que nadie se
            enterara — y alguien podria haberse apoyado en ella creyendo que protegia algo.
      - [x] ~~**`"strict": false` en `tsconfig.json`**~~ → **ACTIVADO el 2026-08-29**, y **P-10
            queda CERRADA del todo**.
            📌 **Y lo primero que hay que decir es que mi suposicion era falsa.** Llevaba escrito
            aqui que «activarlo saca errores en codigo que hoy funciona» — **eran 14, en 6
            archivos**, y ninguno costo mas de un minuto. **Medir antes de opinar** habria cerrado
            esto hace una semana.

            | Familia | Cuantos | Que era |
            |---|---|---|
            | Las cookies de `@supabase/ssr` | **9** | Los callbacks sin tipar. Se arreglo usando **el tipo que la propia libreria exporta** (`SetAllCookies`), no uno inventado: asi, el dia que cambie la forma de esos datos, el compilador avisa |
            | El tipo de culto | **3** | Indexar un `Record` con lo que llega de la base, que es `any`. → **`metaDeCulto()` nueva en `lib/services.ts`**, que comprueba de verdad el valor en vez de confiar en el indice. De paso quita el `?? otro` **repetido en tres pantallas** |
            | **`service` podia ser `null`** | **1** | 🔴 **El unico que era un fallo de verdad.** `ServiceEditor:456` hacia `service.id` sin comprobar. **Hoy no revienta porque esa lista solo la ven quienes NO pueden crear cultos** — pero eso es una casualidad, no una garantia. Arreglado con el mismo criterio de O-36 |

            **Comprobado:** `tsc --noEmit` **0 errores** · 139 pruebas · lint 0 · build 0.
- [x] ~~**P-11 · Ni una prueba, ni CI**~~ → **HECHO.** El **CI** el 2026-08-20 (`npm run build` en
      cada push) y **las pruebas el 2026-08-22**: hoy son **139**, con el runner de Node y **cero
      dependencias nuevas**, y el CI las ejecuta **antes** del build. Ver §9.2-octies.
      ✅ **Y el recorrido de pantallas, HECHO el 2026-08-28**: `pruebas/pantallas.mjs`. Recorre
      **26 pantallas** —publicas sin cuenta, protegidas sin sesion (que deben rebotar) y todas las
      del panel con sesion— y **no se conforma con el 200**: comprueba que el texto que tiene que
      estar, esta. Es lo que cazo lo de Next 16, y ya no se hace a mano.
      ⚠️ **NO va en el CI, y no es pereza:** para entrar a las pantallas protegidas hace falta una
      sesion de verdad, y **meter credenciales en el CI de un repositorio publico no se hace**. Se
      ejecuta a mano, contra el servidor de casa, antes de publicar algo gordo.
      ✅ **Pasado el 2026-08-28 en los dos sitios: 26 de 26 en local y 26 de 26 EN PRODUCCION.**
      Y se puede lanzar contra produccion con `BASE=https://partituras-blush.vercel.app`, que es
      donde de verdad importa (§3).
- [x] ~~**P-12 · Versionar el caché del service worker**~~ → **HECHO en la fase L** (2026-08-22).
      `sw.js` lee su versión de su propia dirección (`?v=<commit>`), así que al desplegar se instala
      el nuevo y **limpia el anterior**. Antes el nombre del caché era constante y `activate` **no
      borraba nada nunca**.
      📌 Y de paso se corrigió T-02, que estaba **mal explicada**: el caché HTTP no era el culpable
      —Vercel manda revalidar siempre— sino el caché del service worker, que no caducaba.
- [x] ~~**P-14 · El middleware bloqueaba `/manifest.json`**~~ → ✅ **ARREGLADO en la Fase A.**
      El `matcher` de `middleware.ts:59` excluía imágenes y `favicon.ico` pero **no el
      manifiesto**, así que `/manifest.json` respondía **307 hacia `/login`**. El navegador lo
      pide **sin sesión** al instalar la app: sin él, la aplicación instalada en el móvil se
      queda **sin icono y sin nombre**. Apareció al poner el logo (O-15): el favicon funcionaba
      y el manifiesto no. Se añadieron `manifest.json`, `sw.js` y la extensión `.ico` a las
      exclusiones.
- [x] ~~**P-13 · `pdfjs-dist` permite ejecutar JavaScript al abrir un PDF malicioso**~~ →
      **HECHO en la fase L** (2026-08-22): **5.7.284 → 6.2.108**, con el worker regenerado y
      **probado con un PDF real** (7 páginas, 3.797 caracteres). De paso subió **Next 14 → 16**.
      **Las vulnerabilidades bajaron de 15 a 8**, y las 8 que quedan son de herramientas de
      desarrollo: **no llegan a ningún navegador**.

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

> 🔄 **Revisado el 2026-08-21**, porque Isaac lo preguntó: *«¿para qué se necesitaría la clave y
> el acceso a Vercel, si todo lo que hemos hecho no ha habido problemas?»*. **Tenía razón en lo
> de Vercel.** Lo que sigue es la lista después de revisarla, no la original.

| # | Qué | Estado tras revisarlo |
|---|---|---|
| 1 | **Invitación al proyecto de Vercel** | 🟢 **YA NO BLOQUEA. No perseguirlo.** De los 5 motivos por los que se pidió, **4 se cubrieron por otra vía** (ver abajo). Y **Hobby no admite colaboradores**: el plan que sí, son **20 USD/persona/mes** |
| 2 | **Clave `service_role`** | 🔴 **SIGUE BLOQUEANDO, y es lo único de esta lista que importa.** Tres motivos, abajo |
| 3 | **Cuenta propia de Supabase + invitación a la organización** | 🟡 Menor. Hoy se usa la sesión del primo (§9.1) |
| 4 | **Un acuerdo con el primo sobre quién toca `main`** | 🟡 **El que más se olvida.** Si los dos empujan sin avisarse se pisan — y cada push publica. Basta con: *«te aviso antes de subir»* |

**Por qué Vercel dejó de bloquear:**

| Por qué se pidió | Qué lo cubre hoy |
|---|---|
| Si el build falla, nadie se entera | ✅ **CI de GitHub Actions** (12.4-①), verde o rojo en cada commit |
| No se puede revertir desde el panel | ✅ `git revert` + push: se publica solo en ~40 s (§12.3-7) |
| No se sabe si llegó a desplegarse | ✅ Se le pide a la página **un texto que solo existe en el commit nuevo**. Si lo sirve, es ese build. Usado en la tanda 28 |
| Añadir una variable de entorno nueva | ⚠️ Solo el primo. Pero el proyecto usa **4** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NODE_ENV`) y **las 4 ya están puestas**. Nada de lo pendiente necesita otra |
| Ver los registros cuando algo falla **solo** en producción | ❌ **Nada lo cubre.** Único hueco real — y **pequeño**: el susto de los 3 minutos (T-07) **no lo habrían pillado**, porque la página respondía 200 y devolvía cero filas, sin error que leer |

**Por qué la `service_role` sí bloquea, con la medición del 2026-08-21:**

1. **La copia de seguridad se deja las 6 canciones en BORRADOR.** El `npm run export` normal las
   pierde y lo avisa (`scripts/export-datos.mjs:119`). Las de hoy se rescataron **a mano, una vez**.
2. `/admin` no funciona en el equipo de Isaac sin ella (**T-05**). En producción sí: el primo la puso allí.
3. 🔴 **La que importa. Medido contra la base real, sin sesión y con la clave pública:**
   **69 canciones y 3 cultos** se devuelven; **0 borradores** (esos sí están protegidos). Es el
   fallo **P-02**, y aquí está el nudo: **`npm run export` funciona HOY gracias a ese agujero.**
   El día que se tape, la copia deja de funcionar. **No se puede cerrar P-02 sin tener antes la clave.**

📌 **Y el encuadre que hay que recordar:** *«no tener dependencias que no sean GitHub»* suena bien,
pero **la dependencia gorda no es Vercel, es Supabase.** GitHub guarda el programa; **Supabase
guarda el trabajo de la iglesia** — 75 canciones, cuenta ajena, plan gratuito, sin copias
automáticas. Por eso la clave importa y el panel de Vercel no.

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

### 2026-09-04 · Tanda 39 — O-60: un solo diálogo para toda la app · 🚀 r51

**Publicado:** `e1fc471..38aecfa` a `main`. CI verde, **26 de 26 pantallas en producción**, y el
editor del culto con sus **8 asas de arrastre** y **0 errores**.

Isaac señaló el cartel gris del navegador al borrar un culto y pidió que **todos** los diálogos
fueran como el de «Cambios sin guardar». **Eran tres**, y los tres destruyen algo.

🔴 **Y al medirlo apareció lo que duplicaba el valor: el diálogo bonito estaba escrito DOS VECES.**
Sin unificarlo, atender la petición **habría escrito una tercera copia** — es la cuarta vez que este
patrón muerde aquí (P-09).

🔴 **Lo que no era cosmético:** `confirm()` **detiene el programa**, un diálogo dibujado no. Escrito
seguido, **el culto se borraría sin preguntar**. La pregunta y la acción van separadas en los tres.

📌 **Y un ajuste que solo enseñó la captura:** el primer «Eliminar» reusaba el rojo **contorneado**
de «Descartar cambios» — compilaba, y se leía como **secundario** siendo la acción principal.
→ **Dos rojos, por el PAPEL del botón**: sólido para la principal, contorneado para la salida
destructiva que no lo es. **Quinta desechable** del proyecto, borrada antes de publicar.

**Y la otra mitad de la tanda no fue código: fue corregirle una suposición.** Isaac ofreció *«yo las
puedo dejar públicas»* para desbloquear la migración. **Se midió y no sirve:** leer ya funciona
(HTTP 200 con la clave pública); lo que falta es **cambiar la ESTRUCTURA**, y eso **no está expuesto
en esa API** — ni con la clave maestra. **No es un permiso que falte, es una puerta que no existe.**
📌 Y el error de comunicación fue mío: escribí *«el conector ya no llega»*, y él lo tradujo a lo
único que sí puede tocar. **Cuando el bloqueo es de una vía de acceso, hay que decirlo como una
acción suya** —«pídele esto a tu primo»— no como un síntoma técnico.

### 2026-09-04 · Tanda 38 — la app se instala con CHROME, no con Brave · 🚀 r50

**Publicado:** `64bd351..2d75ef3` a `main`. CI verde, **26 de 26 pantallas en producción**.

**Solo texto del comunicado**, y aun así es de las tandas que más valen: **corrige una instrucción
FALSA que yo publiqué ayer** —«Android: Chrome, Edge, Brave»— y que le iba a hacer perder el rato a
todo el que la siguiera. Lo descubrió Isaac intentándolo.

🔴 **El hallazgo:** en Brave, pulsar «Install» **deja un acceso directo**, no una app. Y el cartel
«Install app» con el nombre y el icono correctos **sale igual**, así que parece que fue bien.
**Por qué:** el paquete de Android lo **construye y firma un servidor de Google** a partir del
manifiesto; Brave no hace esa llamada a propósito, y **cae en la alternativa sin avisar**. Y engaña
porque **Brave es Chromium por dentro**: menú, botón y diálogo idénticos.

📌 **Lo que se publicó no es la explicación, son LAS TRES SEÑALES** —el aviso de «Añadiendo
Partituras…» con barra, el icono **sin escudo**, y que aparezca **en el menú de aplicaciones**—.
Con eso cualquiera del grupo distingue en cinco segundos si le funcionó, y **deja de hacer falta
que lo mire yo**. Es **L-229**.

**El icono: se queda como está**, decisión suya. Y **corrige una suposición mía que era falsa**: yo
dije que el círculo blanco sería culpa del icono. **No lo es** — el PNG ya es transparente (medido:
512×512 RGB+alfa) y el círculo lo pinta el lanzador. **Lo tumbó el render, no el razonamiento**: se
generaron las tres versiones y se recortaron como hace Android, que es el método de O-47 y O-51
aplicado por tercera vez.

📌 **Y al diagnosticar, lo que ahorró el rato:** el primer instinto fue «será nuestro manifiesto».
Se midió antes de tocar —requisitos, tipo de contenido, iconos— y **la prueba estaba en su propia
captura**: ese cartel solo aparece cuando el navegador **ya aceptó** que la página es instalable.
**Leer bien la captura del usuario evitó cambiar lo que no fallaba.**

### 2026-09-04 · Tanda 37 — la app instalada ya gira · 🚀 r49

**Publicado:** `62748df..523790a` a `main`. **CI verde**, **26 de 26 pantallas en producción**, y el
manifiesto sirviendo `"orientation": "any"`.

**Una línea**, y la encontró él preguntando: *«¿cómo se hace para que pueda leerse de manera
horizontal, porque todos los que usamos dispositivo móvil leemos de manera horizontal?»*.

🔴 **Lo interesante no es el arreglo, es POR QUÉ nadie lo había visto en meses.** `orientation`
**solo manda en la app INSTALADA**; en el navegador no hace nada, y ahí gira desde siempre. La línea
llevaba desde el primer día sin hacer absolutamente nada… **y despertó el día que se le recomendó
instalarla** (O-59, el día anterior). Es **L-228**: *una opción que hoy no hace nada está esperando
al contexto donde sí manda*.

**Eligió `any`, no `landscape`, y es lo correcto** aunque su pregunta dijera «horizontal»: pidió que
**PUEDA** leerse así. Con `landscape` forzado, el login, el catálogo y `/admin` también saldrían de
lado.

⚠️ **Y el remate que convierte el arreglo en otro problema si no se dice:** el manifiesto **se lee
al instalar**, así que **quien ya tenga la app puesta no se entera**. Hay que **desinstalar y volver
a instalar**, y eso está dicho en el comunicado — sin ello, creería que no funcionó.

**De paso, el comunicado cuenta CÓMO SE INSTALA** en Android, PC e iPhone, que es lo que de verdad
le sirve al músico, y **dice lo que NO hace**: sin internet la app abre pero las canciones no cargan.

### 2026-09-03 · Tanda 36 — O-57: la melodía en pentagrama, y O-52 cerrada · 🚀 r48

**Publicado:** `48990b1..d59a9de` a `main`, en tres commits. **CI verde** (1 min 5 s).

**Lo que entró:** todo **O-57 (R.1 a R.4)** —escribir la melodía con el ratón, la sección
`/melodias`, la pestaña en la canción, escribirla a mano y el tercer modo a pantalla completa—,
**O-52 cerrada** con la regla 1 y la perdedora borrada, y **`abcjs`** como dependencia.

🔴 **Las dos decisiones que evitaron un desastre, y las dos son T-07 en su sitio más caro:**
1. **La melodía se GUARDA aparte.** La letra viaja dentro del `update` general; copiar eso habría
   roto **guardar cualquier canción** mientras la columna no exista — el editor de acordes roto por
   una función que nadie usa todavía.
2. **Y se LEE aparte.** Meterla en el `select` del culto habría hecho fallar la consulta entera, y
   **el culto sale vacío en mitad del servicio**, sin error visible.

📌 **Y la comprobación que de verdad valía no fue la del caso feliz, sino la del caso REAL:** todo
se midió **con la columna todavía sin crear**, que es exactamente como está producción ahora mismo.
**26 de 26 pantallas**, la presentación del culto con sus **37 acordes**, y `/melodias` sacando el
aviso de *«todavía no se puede guardar»* en vez de fingir. Comprobado también **en producción**
después de publicar.

**Un fallo que nadie habría visto hasta un culto:** la melodía se mueve con el mismo desplazamiento
que los acordes, pero ese número viene normalizado a 0..11 — **vale para nombrar un acorde y miente
para colocar una nota**. Bajar un semitono se convertía en subir once. Con la trompeta sola (+2)
**no se ve**.

**Y el método, que se pagó solo:** el tercer modo **no se podía alcanzar** sin la columna, así que
se montó una desechable que le pasa al componente de verdad una canción con melodía a mano. La
captura enseñó los dos pentagramas y, con trompeta, el tono en **D** con sus dos sostenidos. Al
montarla salió **L-224**: pulsar un botón «dos veces con 400 ms de espera» daba **un modo distinto
en cada ejecución**, porque los primeros clics caen antes de la hidratación y **no dan error**.

**Lecciones a la carpeta compartida:** **L-224** y **L-225**. Tocados además `CONVENCIONES.md`
(la regla de esperar por el estado) y `PROYECTOS.md` (187 pruebas).

**Y O-59 anotada sin programar nada:** Isaac preguntó si la página se puede usar como app. **Ya se
puede** — es instalable desde el primer día. Quedan escritas las tres cosas que hoy no hace.

### 2026-08-21 · Tanda 33 — Guitarra · el estado del culto · y las seis que salieron probando de LECTOR · 🚀 r44

**Publicado:** commit `c1b4b40`, push `c736054..c1b4b40` a `main`.

📌 **La tanda entera nace de una cosa que Isaac hizo por primera vez: probar la página con la
cuenta en LECTOR.** De esa sola sesión salieron **seis fallos** (O-30 a O-35) que desde la cuenta
de administrador **no se ven**, entre ellos dos que estropeaban la pantalla del culto. **Probar con
el rol del usuario final encuentra en diez minutos lo que no encuentra ninguna comprobación hecha
desde la cuenta que lo tiene todo.**

**Lo que entró:**
- **Fase K · la guitarra** (la parte que faltaba de O-17). Sin tabla de digitaciones: **formas
  móviles** en dos familias —fundamental en 6ª y en 5ª— y gana la que caiga más cerca del aire.
  **1.892 de 1.894 acordes (99,9 %).**
- **O-30 · A pantalla completa no salían los diagramas.** El portal iba a `document.body`, y la
  pantalla completa del navegador **solo pinta el subárbol de su elemento**: el panel existía y era
  invisible. Ahora el portal apunta a `document.fullscreenElement ?? document.body`.
- **O-32 · La etiqueta de estado, solo para el admin.** · **O-35 · Las tarjetas**, de ~185 a
  ~110 px sin perder información.
- **O-33 / O-34 · Desde un culto, «la siguiente» era el catálogo entero** y el «volver» dejaba en
  el listado. Ahora la canción sabe de qué culto viene (`?culto=<id>`).
- **O-31 · El culto tiene estado**, igual que la canción (código publicado; la migración va aparte).
- **O-36 · El admin también abre una canción desde el editor del culto.**
- **O-37 · El repertorio se ordena arrastrando**, y fuera los botones de subir y bajar.

🔴 **Tres cosas de esta tanda que valen más que el código que las resuelve:**

1. **La forma de guitarra se comprueba EN EJECUCIÓN, no al escribirla.** De las 15 escritas a mano,
   `suenaBien` **cazó cinco que no sonaban** — y eso **no se ve mirando el dibujo**: hay que contar
   las notas. Una forma que no cuadra **deja de dibujarse** en vez de llegarle a alguien que la va
   a tocar en un culto.
2. **La lista de secciones del panel estaba escrita DOS VECES** —barra lateral y barra del
   teléfono—, así que «Letras» salía en el ordenador y **no en el móvil**. Es la tercera vez que
   dos listas gemelas se separan en este proyecto (P-09). Salió a `lib/navegacion.ts`.
3. **El orden de publicar, otra vez (T-07).** El código de O-31 se escribió **para aguantar la base
   vieja**: un culto sin la columna `status` cuenta como **publicado**. Se midió con la columna
   todavía sin crear —que es como iba a estar producción entre el push y la migración— y los 3
   cultos seguían saliendo. **Primero el push, después la migración. Al revés no funciona.**

**Lección a la carpeta compartida:** **L-121** `[PART]` — *añadir una columna con defecto le cambia
el significado a las filas que ya existen*. Sin el `update` de la migración, `default 'draft'`
habría hecho **desaparecer los 3 cultos** para músicos y lectores, sin error y sin aviso.

**La migración `20240017` quedó APLICADA esa misma noche**, después del push y en ese orden: 3
cultos, los 3 en `published`, 17 filas de repertorio intactas y la política nueva en su sitio. El
detalle y lo que falta por medir, en §9.1.

**Copia de seguridad previa:** `Partituras-datos-2026-08-22` — 3 cultos y 17 filas de repertorio,
que es exactamente lo que la migración puede estropear.
📌 **Detalle del nombre, para no confundirse:** el exportador fecha en **UTC**, así que a partir de
las 19:00 en Colombia la carpeta lleva **la fecha del día siguiente**. Esa copia es de la noche del
**21**.


### 2026-08-21 · Tanda 32 — FASE J: las letras (O-18) · 🚀 r43

**Publicado:** commit `baa7bae`, push `94168dc..baa7bae` a `main`.
**De momento SOLO PARA EL ADMIN** (D-22), mientras Isaac escribe las 75.

**Lo que hace viable el encargo** es que **276 estrofas ya venían empezadas**: la primera frase
estaba escrita entre paréntesis en la etiqueta de cada sección desde siempre. El botón «Traer las
secciones» las trae, y escribir pasa a ser **continuar**, no empezar de cero.

**Tres cosas que Isaac encontró usándolo, y las tres eran mías:**
1. **El modo letra se perdía al pasar de canción** — yo lo puse así para evitar una pantalla vacía.
   El caso raro rompía el caso normal (**L-120 `[PART]`**).
2. **La letra no respetaba columnas ni recorrido** (O-26): iba siempre en multi-columna.
3. **El andamio metía «Brass x4» como si fuera un verso.** Se midió: **276 de 284** paréntesis
   acaban en puntos suspensivos porque son frases cortadas; los demás son anotaciones de arreglo.

**Buscar por letra probado con datos reales**, en cuanto él escribió dos: `?q=temporada` encuentra
**Aceleración** por su letra, no por su título.

**El interruptor único (D-22)** — `ROLES_LETRAS` en `lib/letras.ts`. Los cuatro sitios lo miran.
Probado **por las dos caras**: con lector, `/letras` da **307** y no hay entrada ni pestaña ni
botón; con admin, los tres aparecen. Y **la letra no sale del servidor** para quien no debe verla.

**Copia de seguridad antes de publicar:** `Partituras-datos-2026-08-21-17h49h42`, **con las dos
letras dentro**.

**Lección a la carpeta compartida:** L-120 `[PART]`.

### 2026-08-21 · Tanda 31 — El comunicado para los músicos, en su sitio · 🚀 r42

**Publicado:** commit `795660c`, push `27ac4e7..795660c` a `main`.

Isaac quería un texto de lo cambiado desde que se retomó la página, **sin nada de
administración** —*«no lo van a usar ellos»*—, para mandarlo al grupo de la iglesia.

🔴 **El primer intento no servía, y lo descubrió él.** Se publicó como artefacto de Claude. Yo lo
comprobé por línea de comandos: **HTTP 200**, y lo di por bueno. **Él lo abrió en incógnito y salía
«Page not found» con un botón de iniciar sesión.** La página respondía, pero el contenido cargaba
después — un `curl` medía la cáscara, no lo que ve una persona (**L-119 `[PART]`**).

**Lo que sí funciona: `/novedades`**, en el dominio que los músicos ya conocen. Pública como
`/s/<token>`, sin base de datos y sin migración.
- El **contenido va aparte** (`lib/novedades.ts`): añadir una tanda futura es escribir una entrada,
  y **el enlace repartido hoy sigue valiendo**.
- Cada cambio lleva **NUEVO** o **ARREGLADO** — no es adorno: le dice al músico si busca un botón
  nuevo o si algo dejó de fallar.
- **`openGraph`** para que al pegarlo en WhatsApp salga «Qué cambió en Partituras».

🔴 **Isaac corrigió DOS VECES la misma cosa: el texto estaba escrito como si todo se leyera en el
teléfono.** La segunda vez fue explícito — *«los cambios se hicieron pensados tanto para PC como
para teléfono, modifícalo en las secciones que sean pertinentes»*. → Repasado **entero**, no solo
donde señaló: quedó **9 menciones al teléfono y 9 al computador**, medido, más una nota arriba que
lo dice una sola vez. El peor era **el PDF**, contado desde el móvil cuando se baja igual desde el
computador.
📌 **Su detalle del «mundito gris» entró tal cual:** nadie recuerda «no había favicon»; **todos se
acuerdan del globo gris**.

**Lección a la carpeta compartida:** L-119 `[PART]`.

### 2026-08-21 · Tanda 30 — Las notas del acorde, bien escritas · 🚀 r41

**Publicado:** commit `8a1894e`, push `50e20d4..8a1894e` a `main`.

**Una sola cosa, y de fondo (T-13):** el desplegable decía que `Bb` tiene «A# · D · F». Isaac lo
vio mirando los diagramas con calma, y **su diagnóstico era correcto: solo pasaba con los
bemoles**.

**Lo importante no es el arreglo, es el porqué.** Las notas se calculaban **sumando semitonos**,
y al escribir el resultado había que **elegir** entre `A#` y `Bb` — con la información justa para
no acertar. Isaac preguntó si había que mirar el **centro tonal**; la respuesta fue mejor:
**el propio acorde lo dice.** Cada nota se nombra ahora por su **grado** (cuántos semitonos sube
y **cuántas letras**), así que la tercera de `Bb` es un `D` porque está dos letras más arriba.

→ **El parámetro `bemoles` desapareció.** Ya no hay que arrastrar la tonalidad hasta el dibujo,
y de paso se respeta lo que Isaac escribió aunque no encaje con el tono de la canción.
→ Los dos diagramas tenían **su propia copia** de la tabla de notas; ahora usan `semitonoDe`.

**Confirmado por él que dos casos raros se dejan como están** (*«está bien así, déjalos»*):
`Bbmaj7/#9` lleva `C#` —la novena aumentada de `Bb`— y `Dbm` da `Db · Fb · Ab`, correcto aunque
`Fb` sea un `E`.

**Lección a la carpeta compartida:** L-118 `[PART]` — *si al mostrar un dato hay que elegir entre
dos formas válidas, es que se perdió información antes; se arregla modelando el dato, no
arrastrando contexto.*

### 2026-08-21 · Tanda 29 — Los acordes se pulsan y se ven · filtro por estado · 🚀 r40

**Publicado:** commit `2ee126e`, push `3cf875b..2ee126e` a `main`.

**Lo que entró:**
- **FASE I completa (O-17 piano y bajo).** `acordes.ts` nuevo cubre **1.894 de 1.894 acordes, el
  100 %**. Diagramas de piano y bajo, y desplegable al pulsar — estilo CifraClub, como pidió Isaac.
- **O-28 · Filtro por estado**, solo para administradores. Verificado con **las dos cuentas**.
- **T-12 · El `<select>` ilegible en oscuro**, arreglado en la hoja global: valía para los **8**.
- **El exportador acepta una sesión de administrador** → la copia ya se lleva los 8 borradores.
- **Una copia ya no puede pisar a otra** (L-117 `[PART]`).

**Cuatro correcciones de Isaac mirando la pantalla, todas antes de integrar nada:**
las octavas, el recorte del teclado, la mano izquierda y la leyenda del bajo. **La página
desechable `/acordes-prueba` fue lo que las hizo baratas**, y se borró antes de publicar.

🔴 **Lo que se me escapó y vio él:** al montar el desplegable metí una etiqueta por encima de un
bloque de comentarios `//`, que pasaron de zona JavaScript a JSX — y ahí **`//` no comenta, se
imprime**. La presentación salió con un párrafo de código encima de la canción. **Compiló, y los
tres arneses dieron verde.** → Arnés nuevo `scratchpad/comentarios.mjs`, pasado por las **13
páginas**: todas limpias.

**Lecciones a la carpeta compartida:** L-114 `[PART]`, L-115 `[PART]`, L-116 `[PART]`,
L-117 `[PART]`.

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
🔴 **`ligaduras.mjs` cazó un fallo mío que el arnés viejo no podía ver** — L-104 `[PART]`.

**Lecciones a la carpeta compartida:** L-104 `[PART]`, L-105 `[PART]`, L-106 `[PART]`, L-107 `[PART]`.

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

✅ **RESUELTO el 2026-08-22 (§9.2-nonies): se queda como está** —las dos figuras con el arco—,
así que **no hubo que programar nada**. Isaac lo eligió después de medir: de las 13 parejas
ligadas solo 3 llevan duración en los dos acordes, y **en las tres los acordes son distintos**,
de modo que fundirlas habría hecho desaparecer el segundo. **O-01 queda cerrada del todo.**

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
  las partituras: 12 casos, todos correctos. Se arregla en un solo sitio, así que vale para el culto
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
Isaac. Es el mismo hueco que con la botonera (L-100 `[PART]`).

### 2026-08-20 · Tanda 13b — La carpeta compartida la escriben dos conversaciones a la vez

Al corregir la lección del disminuido apareció un lío en `LECCIONES.md`: **había lecciones que no
eran mías** —una marcada `[GDT]`—, así que **otra conversación de Isaac, en otro proyecto,
estuvo escribiendo en la carpeta compartida mientras trabajábamos aquí**. Sus números
(L-96 `[GDT]`, L-97 `[GDT]`, L-98 `[GDT]`) chocaron con los míos, y al sustituir mi lección cortando «hasta la siguiente
L-98 `[GDT]`» el corte **duplicó un bloque suyo**, porque esa L-98 `[GDT]` estaba *antes*, no después.

**Reparado sin perder nada de la otra conversación:** quitado el bloque duplicado, quitada mi
versión errónea de L-97 `[GDT]`, y **mis tres lecciones renumeradas a L-99 `[PART]`, L-100 `[PART]` y L-101 `[PART]`**. Las suyas
intactas. Copia del estado roto en `_RESPALDOS\LECCIONES-roto-2026-08-20.md` por si acaso.

📌 De aquí sale **L-102 `[PART]`**, que es la de fondo: la carpeta compartida **cambia mientras trabajas**,
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
  (Personal, Free). Cierra el riesgo de L-89 `[PART]`.
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
  una copia de hoy, añade la hora. Un respaldo no puede destruir lo que viene a proteger (L-94 `[PART]`).
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
  lectores no les habría funcionado (P-01, L-87 `[PART]`).
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
  L-102 `[PART]`): las lecciones nuevas se habían numerado L-62…L-68 y **esos números ya estaban
  usados**. Renumeradas a **L-86 `[PART]`…L-92 `[PART]`**, con las
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
  `LECCIONES.md` → 4 lecciones nuevas (se escribieron como «L-62 a L-65» y **se renumeraron
  ese mismo día a L-86 `[PART]`…L-92 `[PART]`**, ver la tanda 21) y sección 7 nueva («Publicar
  en la web»). `PROYECTOS.md` →
  ficha del proyecto y regla 2 nueva. `CONVENCIONES.md` → en código ajeno manda la convención
  que ya está. `NUEVO-PROYECTO.md` → dos preguntas nuevas («¿de quién es la cuenta?», «¿hay
  alguien más en el repositorio?») y cómo se traduce la regla de verificación en una web.
- **Aclarada la cuenta de Supabase, y no era la que Isaac creía** (§9.1).

**Lo que Isaac dictó en esta tanda:** D-01 a D-07. Confirmó que la interpretación del
proyecto era correcta, y **descartó** el asunto de la base de datos compartida con el proyecto
de cartas (D-05).

**Qué quedó pendiente:** todo §9. Nada de código.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
