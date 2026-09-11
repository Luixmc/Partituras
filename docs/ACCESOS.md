# Accesos, la copia y la mudanza

> Antes §12.1, §12.2, §12.2-ter, §12.2-bis, §12.4 y §12.5 del `CLAUDE.md`.
> Movido **tal cual** desde `CLAUDE.md` el 2026-09-11 (el recorte, L-256).
> Lo nuevo se escribe **arriba**, debajo de esta cabecera.

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
| 4 | ~~**Un acuerdo con el primo sobre quién toca `main`**~~ | ✅ **DECIDIDO por Isaac el 2026-09-05: lo toca él.** Sus palabras: *«el main lo toco yo, o bueno tú que es el que haces todo»*. Encaja con lo que ya se sabía —**el primo no hace correcciones** desde el 2026-08-20—, así que el riesgo de pisarse es teórico. **Deja de ser un pendiente** |

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

### 12.2-ter 🔑 LO ÚNICO QUE HAY QUE PEDIRLE AL PRIMO, UNA VEZ

Isaac, 2026-09-07: *«si le tengo que pedir algo a mi primo de lo suyo de la base para que lo tengas
tú y puedas mirar sin problemas en un futuro sin tener que pedírselo de nuevo»*.

## 👉 **UNA COSA: que invite a Isaac a «Luixmc's Org» con rol `Administrator`.**

**Por qué esa y no otra**, con lo medido:

| | |
|---|---|
| El conector de Claude | ya llega a la cuenta de **Isaac** (organización «Primos-Dev») |
| Lo que le falta | que la cuenta de Isaac sea **miembro** de la organización donde vive Partituras |
| En cuanto lo sea | el conector **lista el proyecto** y desde aquí se aplican migraciones, se leen las políticas reales (T-01) y se acaba el atasco entero de §9.1 — **para siempre** |

**Los roles, de la documentación oficial de Supabase** (consultada el 2026-09-07):

| Rol | Sirve |
|---|---|
| **Owner** | Todo. **No hace falta pedir tanto** |
| ✅ **Administrator** | Todo menos cambiar los ajustes de la organización, mover proyectos fuera y añadir dueños. **Es el que hay que pedir** |
| 🟡 **Developer** | Contenido del proyecto sí —incluido el SQL—, **pero no los ajustes**, así que **no deja ver las claves de API**. Sirve para las migraciones; se queda corto para lo demás |
| ❌ **Read-Only** | Solo mirar. Y además **solo existe en los planes de pago** |

⚠️ **Lo que NO hay que pedirle: la clave `service_role`.** No arregla nada de lo que bloquea —
PostgREST no ejecuta `alter table` ni con ella— y **la copia de seguridad completa ya funciona sin
ella** (ver §9.1). Pedirla fue perseguir la llave equivocada durante semanas.

📌 **Y lo que él no pierde, que es lo que conviene decirle:** sigue siendo **el dueño** de todo,
puede **quitar el acceso cuando quiera**, y **no cuesta un peso** — invitar a la organización es
gratis en el plan Free.

#### 🟡 ESTADO 2026-09-10: Isaac YA ES MIEMBRO de la organización del primo — pero el conector todavía no la ve

Isaac: *«hablé con mi [primo] y ya hago parte de su organización, verifica a ver todo y dime si hay
algo que necesites»*. Se comprobó ese mismo día:

| | |
|---|---|
| `list_organizations` | **solo «Primos-Dev»** — la de Isaac |
| `list_projects` | **solo «Sistema Biometrico»** — Partituras **no aparece** |
| `get_project pcayahwnxbigiuhvtwhd` | 🔴 **«You do not have permission to perform this action»** — el ID es el correcto (Isaac lo confirmó); lo que falta es el permiso del conector |

🔴 **La causa, de la documentación oficial del servidor MCP de Supabase:** al conectar, *«be sure to
choose the organization that contains the project you wish to work with»* — **la autorización del
conector se da POR ORGANIZACIÓN**, en el momento de conectarlo. El conector se autorizó cuando Isaac
solo tenía «Primos-Dev»; **entrar después en otra organización no amplía ese permiso solo**.

→ **LO QUE FALTA, y es de Isaac, una vez:** **volver a conectar el conector de Supabase** en los
ajustes de claude.ai y, en la pantalla de Supabase que se abre, **marcar la organización del primo**
(además de la suya). No hace falta nada más del primo.

🔁 **Vuelto a mirar el mismo día, al cerrar la fase 1 de O-75 (r65): todo IGUAL** — solo «Primos-Dev»,
solo «Sistema Biometrico», y `get_project` sigue negando el permiso. **El conector no se ha vuelto a
conectar todavía.** Mientras tanto, las migraciones 20240020–22 siguen sin aplicar.

🔁 **Y después de que Isaac dijera que lo había reconectado (mismo día): IGUAL otra vez.** Tres causas
posibles, sin saber aún cuál: (1) esta conversación sigue usando el permiso viejo y hace falta abrir
un chat nuevo; (2) en la pantalla de Supabase no quedó marcada la organización del primo; (3) entró
con una cuenta de Supabase distinta de la invitada, o la invitación no está aceptada. **La prueba que
lo aclara es de Isaac:** entrar a supabase.com/dashboard y mirar si ve Partituras ahí.

📸 **Lo que vio Isaac en el panel (captura, mismo día):** la organización **«Quaker»** (Free), con un
solo proyecto, **«mi-dinero»**, pausado. **Ni Partituras ni «Primos-Dev».** O sea: su navegador está
en una organización que el conector **no** ve, y el conector ve una («Primos-Dev») que el panel no
enseñaba de entrada. Siguiente paso: abrir el **selector de organizaciones** (las flechitas ⇕ junto a
«Quaker») para ver **todas** las de esa cuenta — ahí se sabe si la del primo está, y si «Primos-Dev»
es de la misma cuenta o de otra. ⚠️ «mi-dinero» no es de Partituras: no se toca.

✅ **Segunda captura: en su cuenta SÍ está «Luixmc's Org»** (`eimslmepayitqcebzcwy`), con **Partituras**
(us-west-2, NANO) y «paginaiglesia» (pausado). **La invitación está aceptada; la cuenta del navegador
es la buena.** Pero el conector, probado justo después, **sigue viendo solo «Primos-Dev»**. Quedan dos
causas: (a) **el conector está autorizado con OTRA cuenta de Supabase**, la que tiene «Primos-Dev»; o
(b) esta conversación arrastra el permiso viejo. **Cómo se distingue:** si «Primos-Dev» **no** sale en
el selector ⇕ de la cuenta del navegador → es (a): reconectar entrando con la cuenta que tiene
«Luixmc's Org». Si sale → es (b): reconectar marcando «Luixmc's Org» y abrir un chat nuevo.

🎯 **RESUELTO QUÉ PASA (tercera captura, mismo día):** el selector de su cuenta tiene **solo «Luixmc's
Org» y «Quaker»** — **no hay «Primos-Dev»**. Es la causa (a): **Isaac tiene DOS cuentas de Supabase**,
y el conector de Claude está autorizado con la otra. El conector **no dice el correo** de la cuenta
(`get_organization` solo da nombre y plan). → **Arreglo:** cerrar sesión en supabase.com, reconectar
el conector en claude.ai y entrar con **la cuenta que ve «Luixmc's Org»**.
**Esa cuenta buena es la suya que tiene GitHub enlazado** (él lo dijo; el correo no se escribe aquí
porque este repositorio es público). Al reconectar, entrar **con el botón de GitHub** —el mismo
GitHub— lleva a esa cuenta sin equivocarse.

🔴 **CAMBIA TODO (Isaac, mismo día): la cuenta de claude.ai con la que habla conmigo ES DE SU HERMANO.**
*«el claude.ai que uso para hablar contigo es el de furbogoat, que es de mi hermano»*. Consecuencias:
* ⚠️ **SUPERADO lo de arriba de que «Primos-Dev» es «la de Isaac»**: no lo es en su cuenta de Supabase.
  Lo más probable es que «Primos-Dev» y «Sistema Biometrico» sean **del hermano** — sin confirmar.
* **Reconectar el conector de claude.ai con la cuenta de Isaac le quitaría al hermano el suyo**, y
  además **dejaría la base de producción del primo al alcance de cualquier chat de esa cuenta**. No
  se hace sin que Isaac lo decida sabiendo esto, y sin preguntarle al hermano.
* **La alternativa recomendada:** no usar el conector de claude.ai, sino **uno local de Claude Code
  en este PC**, con una **llave personal de Isaac** (Supabase → Account → Access Tokens), limitado a
  **solo el proyecto Partituras** y en **solo lectura**. No toca nada del hermano, y la llave queda
  en este equipo, **nunca en el repositorio**. Las migraciones se aplicarían aparte, con su OK.
  ~~PENDIENTE: que Isaac elija.~~ ✅ **ISAAC ELIGIÓ (2026-09-10): «vamos entonces con la opción 1»**
  — la llave local de solo lectura. Se le explicó antes lo que cuesta: solo desde este PC; cualquiera
  en este usuario de Windows la tendría; para migraciones, subir a escritura un momento o que él pegue
  el SQL en el SQL Editor (ya es miembro). **La llave nunca pasa por el chat**: él la pone en una
  variable de entorno de Windows (`SUPABASE_ACCESS_TOKEN`) y el servidor la lee de ahí.

  **Montado (2026-09-10):** `Documents\Partituras\.mcp.json` — la carpeta desde la que corre Claude
  Code, **FUERA del repositorio** (`repo\`), así que no se puede subir por accidente. Servidor
  `supabase-partituras` = `@supabase/mcp-server-supabase@0.12.0` (versión fijada) con
  `--read-only --project-ref=pcayahwnxbigiuhvtwhd`. Las tres cosas —las dos opciones y leer la llave
  de `SUPABASE_ACCESS_TOKEN`— **se comprobaron en el código del paquete**, no en la documentación.
  El archivo **no lleva la llave**. En Windows va con `cmd /c npx`. No hay CLI `claude` en este PC.
  ⚠️ **La llave de Supabase vale para TODA la cuenta de Isaac** (también «Quaker»); lo que la limita
  a Partituras y a leer es cómo arranca el servidor, no la llave. Si se filtra, se borra en Supabase.
  ~~**Falta, de Isaac:** crear la llave, ponerla en la variable, reiniciar VS Code y aprobar el servidor.~~
  ✅ **Llave creada y puesta (2026-09-10).** Isaac prefirió **pegarla en el chat** en vez de ponerla
  él; se guardó en la variable de usuario `SUPABASE_ACCESS_TOKEN` y **se comprobó contra la API de
  Supabase: 200, «Partituras», ACTIVE_HEALTHY, en «Luixmc's Org»**. ⚠️ Por haber pasado por el chat,
  queda en el historial de esta conversación **en este PC** (que usa también la cuenta de claude.ai
  del hermano): **se le recomendó cambiarla** por una nueva que ponga él. **La llave NUNCA se escribe
  en ningún archivo del repositorio ni de la carpeta compartida.**
  ~~**Falta:** cerrar y abrir VS Code, aprobar «supabase-partituras» y probar desde un chat nuevo.~~
  ✅ **PROBADO desde un chat nuevo (2026-09-10, 15:15): FUNCIONA.** Ve las 22 tablas de `public`, las
  23 migraciones registradas y las políticas reales. Lo que salió de leerlas está en §9.0 (filas 1 y
  2), en T-01 y en P-03. ✅ **Y la llave ya está cambiada** (2026-09-10, la puso él; probada tras
  reiniciar VS Code). La que pasó por el chat se le pidió borrarla en supabase.com.

### 12.2-bis 🔑 LA MUDANZA — dejar de depender del primo para siempre

Isaac, 2026-09-07: *«para que no tenga que pedirle más nunca a mi primo nada… para que hagas todo
sin necesidad de terceros»*. **Se puede, sale a 0 pesos, y esto es lo medido.**

#### Lo que se comprobó antes de contestar (2026-09-07)

| | |
|---|---|
| El conector de Supabase de Claude | llega a la organización **«Primos-Dev»** (`fjaivddkmynlqjusvsxn`), la de Isaac. Un solo proyecto: «Sistema Biometrico», **INACTIVE** |
| Partituras (`pcayahwnxbigiuhvtwhd`) | **no aparece** — sigue en la cuenta del primo |
| 🔴 **Lo que eso significa** | **Si la base viviera en esa organización, las migraciones se aplicarían desde aquí el mismo día.** Todo el atasco de §9.1 se acaba |

#### Qué se puede llevar HOY, sin pedir nada — medido tabla por tabla

| | Con la clave pública | **Con la cuenta de Isaac (admin)** |
|---|---|---|
| `sheets` | 72 | **80** — los 8 borradores incluidos |
| `services` | 1 | **3** |
| `service_songs` · `sheet_keys` · `categories` | 16 · 13 · 14 | iguales |
| `profiles` | 0 | **7** |

📌 **Y esa columna de la derecha es la noticia:** `npm run export` **ya acepta la sesión de un
administrador**, así que **los datos salen enteros sin la clave maestra y sin el primo**.

🔴 **LO ÚNICO QUE NO VIAJA: LAS CONTRASEÑAS.** Viven en `auth.users`, y eso solo lo abre la
`service_role`. → Hay que **volver a crear las 7 cuentas** y que cada músico ponga contraseña otra
vez. **Una vez en la vida**, y es el precio de la independencia.

#### Las tres mudanzas

| | Qué | Cuesta | Lo que hay que saber |
|---|---|---|---|
| **1** | **La base** → proyecto nuevo en «Primos-Dev» | **0** | Yo lo creo, aplico las **22 migraciones** y cargo los datos. ⚠️ El plan gratuito **pausa un proyecto tras una semana sin uso** — «Sistema Biometrico» está así ahora mismo. Una página que se usa cada domingo no debería pausarse, pero hay que saberlo |
| **2** | **El hosting** → Vercel con la cuenta de Isaac | **0** | ⚠️ **La dirección CAMBIA**: `partituras-blush.vercel.app` es del proyecto del primo. O se avisa a los músicos del enlace nuevo, o **se compra un dominio propio** (~15–60 mil al año) y entonces no vuelve a cambiar nunca |
| **3** | **El repositorio** → un *fork* a su GitHub | **0** | Conserva el historial entero |

#### ⚠️ Lo que NO es una decisión técnica

**El repositorio, el hosting y la base son de su primo, y mudarse es quedarse con el proyecto.** Aquí
no hay nada que medir: es su familia y su conversación. **Se le dice sin dramatizar y sin empujar** —
técnicamente no hace falta su permiso para nada de las tres mudanzas, y precisamente por eso conviene
avisarle antes, no después.

📌 **Y la alternativa barata sigue en pie:** *una sola* acción suya —**invitar a Isaac a
«Luixmc's Org»**— desatasca las tres migraciones sin mudar nada. **La mudanza es para no volver a
depender de él NUNCA; la invitación es para no depender HOY.** No son excluyentes: se puede pedir la
invitación ahora y mudarse con calma.

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
- ✅ **③ HECHO (2026-08-22) — el caché del service worker versionado** (P-12, fase L): se registra
  como `/sw.js?v=<commit>`, así que cada despliegue instala el nuevo y borra el viejo.
- ✅ **④ HECHO — y muy pasado de lo que pedía:** se pedían **cuatro** pruebas de funciones puras y
  hay **201**, con CI en cada push (P-11, desde el 2026-08-22).
  *③ y ④ seguían escritas como pendientes hasta el 2026-09-05, cuando Isaac pidió mirar TODOS los
  archivos. Es la misma familia de las otras: hechas y sin sacar de la lista.*

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
