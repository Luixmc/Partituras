# Trampas de Partituras

> Antes §8 del `CLAUDE.md` (T-01…T-18). El índice sigue allí.
> Movido **tal cual** desde `CLAUDE.md` el 2026-09-11 (el recorte, L-256).
> Lo nuevo se escribe **arriba**, debajo de esta cabecera.


**T-01 · Las migraciones del repositorio no son la base de datos.**
*Síntoma:* razonar sobre permisos leyendo `supabase/migrations/` y equivocarse.
*Causa:* la BD registra 18 migraciones con nombres y fechas propios (`20260429191313
extensions_types`, `mosaics_songs_sections`, `sheet_keys_created_by_default`…), mientras el
repositorio tiene 14 con nombres `20240001…`. **`sheet_categories` (010) y `admin_only_sheets`
(011) no constan como aplicadas** — aunque el registro solo ve lo aplicado con la CLI, así que
podrían haberse ejecutado a mano en el SQL Editor y no constar.
*Cómo se resuelve:* antes de tocar permisos, **comprobar las políticas reales** (`pg_policies`),
no los archivos.
✅ **Leído por fin el 2026-09-10** con el conector `supabase-partituras`: la base registra **23
migraciones** (la última, `rpc_solo_autenticados` = nuestra `20240019`), y **la trampa era real**:
la `20240020` hacía `alter policy sheets_select_viewer` y en producción se llama **`sheets_select`**
— habría fallado. Corregida. Las políticas de verdad se sacan con
`select tablename, policyname, cmd, qual from pg_policies where schemaname='public'`.

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

**T-18 · `SUPABASE_ACCESS_TOKEN` significa DOS cosas, y el 2026-09-10 chocaron.**
*Síntoma:* `npm run export`, justo antes de aplicar tres migraciones, dio **8 fallos** `HTTP 401 ·
PGRST301 · Expected 3 parts in JWT; got 1`. Sin copia no se aplica nada, así que todo se paró.
*Causa:* para el exportador esa variable era **la sesión de un administrador** (un JWT, tres trozos
con punto). Esa misma mañana se puso en **Windows** con **la llave personal de Isaac** (`sbp_…`) para
el conector de Supabase — y la variable de Windows **pisa** a la de `.env.local`. Mismo nombre, dos
cosas distintas: nadie se enteró hasta que hizo falta la copia.
*Cómo se resolvió:* el exportador solo acepta como sesión **lo que parece una sesión** (3 trozos), y
si no hay ninguna **la saca él solo con la cuenta de prueba** (`PRUEBA_EMAIL`/`PRUEBA_PASSWORD`, que es
administradora), como `pruebas/sesion.mjs`. Resultado: **85 canciones, las 9 sin publicar incluidas**.
→ **Regla:** antes de guardar una variable de entorno **global**, buscar ese nombre en el proyecto.

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
