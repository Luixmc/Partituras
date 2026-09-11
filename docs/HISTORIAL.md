# Historial de Partituras

> Antes §13 del `CLAUDE.md`. Tanda por tanda, lo más nuevo arriba.
> Movido **tal cual** desde `CLAUDE.md` el 2026-09-11 (el recorte, L-256).
> Lo nuevo se escribe **arriba**, debajo de esta cabecera.

### 2026-09-11 · El recorte del CLAUDE.md (L-256) · dos cuentas de Claude

Isaac: *«lee _CLAUDE-COMPARTIDO\PROMPT-RECORTAR-CLAUDE-MD.md y aplícalo a este proyecto»*. El
`CLAUDE.md` pasó de **566 KB y 8.413 líneas a 56 KB y ~760**, moviendo (sin reescribir) el historial,
los encargos cerrados, las trampas, las ideas y los accesos a `docs/`. Un script comprobó que las
8.419 líneas del original salen exactamente una vez. §9 quedó solo con lo abierto. `npm run docs` y
240 de 240 en verde. Además: Isaac pagó Claude Pro en la cuenta vinculada a GitHub y Supabase, y
turna con la de su hermano cuando se acaba el límite (§1). Subido con su *«ok, guarda todo para
hablar con un nuevo chat»*.

### 2026-09-10 (noche) · Dos cuentas de prueba (admin y músico), y el músico probado de verdad

Isaac pasó la cuenta de prueba a músico para probar; se probó en producción lo que ve y no ve un
músico y las notas. La copia salió sin borradores **diciendo «TODO»** → el exportador ahora pregunta el
rol y avisa (L-255). Isaac creó una segunda cuenta de músico y devolvió la primera a administradora;
con las dos se midió **la privacidad de las notas** (0 filas / 403). Copia 85 y 26 de 26 otra vez.

### 2026-09-10 (noche) · 🚀 r75–r76 P-02: las canciones, solo con cuenta

Isaac: *«están bien todo, haz lo que está pendiente»*. En el orden de T-07: copia → **023** (la
función del enlace, solo añade) → las tres páginas del enlace a la función, **publicado y confirmado
en producción** (r75) → **024** (13 políticas a `authenticated`) → medido al momento: sin cuenta 0
filas, el enlace igual, 26 de 26, copia completa. El primer intento de la 023 falló entero por
`uuid = text` sin dejar nada a medias. Lo que se rompió era de las **pruebas** (`pantallas.mjs` leía
con la clave pública), arreglado.
⚠️ **Un fallo MÍO de método al subir r76:** la comprobación local iba en una sola cadena de bash
(`npm test | grep … && npm run lint | grep … && …; npm run verificar; …; git commit && git push`). El
primer `grep` no encontró el texto, **la cadena se cortó sin ejecutar las pruebas ni el lint**, y lo
que iba después de un `;` —el commit y el push— **siguió igual**. Se subió sin haber visto pasar lo
local. El CI lo cubrió (pruebas → lint → build: verde) y repetido en local sale todo bien (240, 0
errores, compila). → **Las comprobaciones y la subida van en pasos SEPARADOS**, mirando el resultado
de cada una antes de subir (L-254).

### 2026-09-10 (noche) · 🚀 r73 las pestañas en el teléfono · 🚀 r74 las notas privadas y el tempo guardado

Isaac: *«sube lo pendiente»* → **r74** lleva O-74 (notas privadas) y O-81 (el tempo se guarda con la
canción, que eligió él: «En la canción, para todos»).


Isaac: *«adelante con las dos cosas»*, y eligió: notas para **músico y admin**, **en la ficha y a
pantalla completa**, **probar con una nota de la cuenta de prueba y borrarla**, y **subir ya** lo de
las pestañas (r73). Notas: `lib/notas.ts` (3 pruebas), `lib/notasBase.ts`, `NotaPrivada.tsx`, la
nota en las dos presentaciones y la ficha protegida (diálogo propio: «Guardar y salir» guarda la
canción, no la nota). Medido en navegador y **la nota de prueba borrada: la base vuelve a 0**.
⚠️ **Lo que me costó:** al recargar con la nota a medias el script se quedó colgado — era el aviso
`beforeunload` del navegador (la protección funcionando). Se contesta con
`Page.handleJavaScriptDialog`.

### 2026-09-10 (noche) · 🚀 r72 O-79: la barra del editor de melodía, más ancha · permiso fijo para la melodía

Isaac, con captura: *«se podria aprovechar mas los espacios para que sean mas a lo ancho que a lo
largo»* → la barra pasa de ~290 a **185 px** de alto a 1512 px (medido). Y: *«sube, no me pidas
permiso para esto de la melodia»* → **excepción escrita en §1**, solo para la sección de melodía.
Nuevo en el método de medir (§2.3-bis): el ancho de teléfono se emula con
`Emulation.setDeviceMetricsOverride`.

### 2026-09-10 (noche) · 🚀 r71 O-78: las 15 duraciones y botones grandes · O-75 y O-77 cerradas

| | |
|---|---|
| Isaac | *«le faltan las otras duraciones… que los botones sean más grandes»* (con captura) · eligió el **cuadro 5 × 3** · *«los sonidos están bien, el volumen tambien, en el telefono se ve bien, al igual que lo la pentagrama»* · *«subes enseguida, no esperes mi aprovación»* |
| ✅ Cerradas | **O-75** (el reproductor entero, r65–r69) y **O-77** (la armadura, r70) |
| 🚀 **r71** | `DURACIONES` a 15; **`duracionAbc` arreglada** (solo sabía medios: la corchea con doble puntillo se habría guardado como NEGRA, callado); el dibujo de las notas sale de `figuraDe`; la barra «Duración» en cuadro 5 × 3 con `NoteFigure`, botones de 44 px |
| Medido | En navegador: 15 botones, la negra con doble puntillo con 2 puntos, `G7/2`, 1.315 ms al sonar. **237 pruebas** |

### 2026-09-10 (noche, 19:15 →) · 🚀 r70 O-77: la armadura en el pentagrama del editor

Isaac: *«adelante»*, y luego *«subelo»* → **r70**. ✅ **Y cerrada por él** esa noche: *«al igual que
lo la pentagrama»* (junto con el reproductor entero y el teléfono).
**Lo medido** (`probar-o77.mjs` en el `scratchpad`, solo mira): las **5 secciones** de Agnus Dei
dibujan `#10 #7` = fa# en la 5.ª línea y do# en el 3.er espacio; un **clic de ratón real** en la 1.ª
columna de una sección vacía puso la nota **exactamente ahí** (`cx = izq + 15`, a la altura del sol).
Una de las 3 pruebas nuevas: en los 15 tonos del repertorio, **tantas alteraciones dibujadas como
letras alteradas al sonar**. Al analizar, **su pregunta 1 ya se cumplía** (nota sin alteración = sin ♯
dibujado, y suena con la armadura) y **la 2 no toca nada** (su `^F2` se deja). Solo faltaba el
dibujo: `armaduraDibujada()` en `lib/melodia.ts` (3 pruebas) y `EditorMelodia` la pinta tras la clave,
con el margen de las notas creciendo con ella. **Medido en navegador**: la armadura y el clic.
⚠️ La herramienta bloqueó **dos veces** comandos de PowerShell con `//` dentro de un texto
(«Remove-Item on system path '//'»): falso positivo. **Los cambios con comentarios se hacen con
ediciones sueltas, no con un script de PowerShell.**

### 2026-09-10 (noche, 17:53 →) · 🚀 r69 La fase 3 del reproductor: cuenta de entrada y volumen

Isaac: *«sube»* → publicada como **r69**.


Isaac, al volver: *«se oye bien, continua con la fase 3»* → fase 2 cerrada. Fase 3 hecha y medida en
navegador (§9.2 → O-75 «FASE 3»): la cuenta entra un compás antes y no se repite al pausar ni al
repetir; el volumen se cambia sonando sin perder la nota; los dos se recuerdan. **232 pruebas** (5
nuevas).

### 2026-09-10 (noche) · 🚀 r67 el logo en el login · 🚀 r68 el reproductor de la melodía

Al final, Isaac: *«sube todo»* → **r68**. Y antes de apagar dictó **O-77** (la armadura en el
pentagrama del editor), que queda en **§9.0 fila 0-bis**, sin programar.


| | |
|---|---|
| Isaac | *«si guarda la melodia, adelante con la fase 2»* · y en medio, con captura: *«en vez de ese icono de signo musical que coloques el logotipo de la iglesia»* + *«lo subes enseguida no esperes mi aprobación»* |
| 🚀 **r67** | El logo (`public/icon-192.png`) en el login. Publicado en ~40 s, CI verde, visto en producción |
| **O-75 fase 2** | `lib/reproduccion.ts` (13 pruebas) · `lib/reproductor.ts` · `Reproductor.tsx` · en el editor y en la presentación. **Medido en navegador de verdad**: tempo, pausa, repetir, detener, y que con «Trompeta» **suena igual** |
| 🔴 Dos fallos que solo salieron en el navegador | El metrónomo de `abcjs` **mudo sin barras escritas**, y la armadura **cambiaba el instrumento de percusión**. Arreglados y medidos |
| Cifras | **227 pruebas** · lint 0 errores (60 avisos, los mismos) · compila · **91 archivos, 17.178 líneas** |
| ⚠️ Lo que me costó a mí | El registro del servidor de desarrollo lo puse en `.pruebas-tmp`, la carpeta que `npm test` **borra al empezar** → `EPERM`. Los registros van al `scratchpad` |

### 2026-09-10 (tarde) · El acceso a la base, probado — y la `20240020` habría fallado

**Chat nuevo, como pedía §9.0 fila 0-bis.** El conector `supabase-partituras` (solo lectura) responde:
22 tablas, 23 migraciones registradas, políticas reales. **Nada escrito en la base.**

| Qué salió | |
|---|---|
| 🔴 **`20240020`** | `alter policy sheets_select_viewer` → en producción es **`sheets_select`**. Habría fallado. **Corregida en el archivo, sin aplicar** (T-01 era real) |
| ✅ `20240021`, `20240022` | Aplican limpias |
| ✅ **P-03 cerrado** | Crear canciones exige `is_admin()` en la base; las 85 son de admins activos |
| ⬜ Hueco nuevo, para Isaac | `get_my_role()` no mira `active`: un músico desactivado podría escribir por la API. Hoy no muerde → §9.0 fila 2 |
| Cifras | 85 canciones (76 + 9), 14 categorías, 3 cultos, 7 usuarios |

~~Queda de Isaac: **cambiar la llave**, **elegir la vía** para las migraciones y **dar el OK** de la 20 y la 22.~~

**Y en el mismo rato, Isaac respondió** — *«1. dame el paso a paso, 2. si la b es para que lo hagas
entonces la b, 3. ok, 4. hazlo, 5. no lo he probado dame la pagina para probarlo»*:

| | |
|---|---|
| 🔴 **La copia falló primero** | 8 × `401 Expected 3 parts in JWT`: la variable `SUPABASE_ACCESS_TOKEN` de Windows (la llave nueva) pisaba la sesión que espera el exportador. **T-18.** Arreglado el exportador; copia completa: **85 canciones** en `_RESPALDOS\Partituras-datos-2026-09-10` |
| ✅ **`20240020`** + `get_my_role()` | Aplicada **sola**, con la vuelta atrás preparada. Comprobado: admin activo ve 85 y 3 cultos, `is_admin() = true`; sin sesión, 76 y 1, como antes |
| ✅ **`20240021`**, **`20240022`** | Aplicadas. `sheets.melody` existe; `notas_musico` con RLS y sus 4 políticas. **La melodía ya se guarda** |
| Comunicado | `CAMBIOS.md` y `/novedades`: «la melodía ya se guarda» — **sin publicar**, espera permiso |
| Llave | Paso a paso dado; **cambiada por él y comprobada** (API 200, conector responde) |
| O-75 | Se le dio la dirección: **Agnus Dei** (Re) → pestaña Melodía. ✅ *«ya probé la melodia y si suena»* → **fase 1 cerrada** |
| O-74 | 🔴 **E (armar cultos) DESCARTADA**: *«que solamente pueda hacer las notas privadas, lo de armar cultos ya no va»*. Queda solo D |
| Publicación | **r66**, con su permiso *«sube lo que tengas que subir»* |

### 2026-09-05 · Isaac cierra lo último que solo podía cerrar él

**Sin tocar código.** Isaac probó lo que quedaba y lo dio por bueno:

> *«lo de los diálogos de cambios sin guardar también funciona, y lo del editor de la melodía hasta
> ahora está bien»*

Con eso **§9 se queda sin ningún pendiente suyo**: quedan los diálogos (O-60, O-61) y el editor de
melodía (R.1–R.4), que se sumaban a O-63, O-66 y O-67, cerradas el día anterior.

📌 **Las cinco eran del mismo tipo:** viven **en la pantalla y no en el HTML**, así que no las
alcanzan ni `curl`, ni las 197 pruebas, ni el recorrido de las 26 pantallas. **Solo las cierra él.**
Por eso llevaban semanas escritas en §9 y por eso se le fueron recordando una por una.

🔴 **Lo único vivo en §9 es ahora la migración `20240021`**, y no depende de él ni de mí: son tres
líneas que tiene que ejecutar su primo en el SQL Editor de Supabase, o invitarlo a «Luixmc's Org».

### 2026-09-04 · Tanda 46 — O-67: ninguna sección sobresale · 🚀 r58 · ✅ visto bueno de Isaac

**Isaac, con dos capturas del PC** (1920 × 1080) ya con r57 puesta: *«la sección sobresale de lo
bajo, cuando tiene suficiente espacio para que quede de la misma altura que las otras… que no sobre
ni falte espacio, que sea lo justo y necesario»*.

⚠️ **Y esta vez el primer diagnóstico fue MÍO y estaba equivocado.** Medí que los acordes se
apretaban y salió que no —piden 766 px y les dan 895—; luego apunté al alto que se llevan los
cuadros de solo texto (43 % en esa canción). **Ninguna de las dos era su queja.** Se la pregunté con
las tres candidatas medidas y contestó con precisión: *que ninguna sección sobresalga*.
📌 **Lo que salvó la tanda fue preguntar en vez de elegir**: con tres números delante, él señaló el
que importaba en una frase.

**Medido entonces sí:** de los **74 cuadros** del culto, **UNO** sobresalía — `A Guitar voz · B
Banda · A · B <Voz Guitar Hit-Hat>` — con **334 px frente a los 189 px** de las demás secciones de
esa canción, y **necesitaba 749 px de los 895** que tenía. **Cabía.** La causa: el ancho base de un
compás **cuenta acordes y no mide el texto**, así que la anotación se quedaba corta, envolvía, y al
envolver crecía el cuadro entero.

**Arreglado con una línea** (el ancho base pasa a `auto` cuando hay etiqueta) y **medido en dos
pantallas**: sobresalen **1 → 0**, cortes que sobran **0** (O-66 intacta) y **30 lecturas iguales**.
197 pruebas, lint 0 errores, build 0, 26 de 26 pantallas.

**Carpeta compartida:** `LECCIONES.md` → **L-238** (ante una queja visual y ambigua, mide varias
hipótesis y que él señale: la tuya puede ser la equivocada) y **L-239** (lo que no cabe a lo ancho se
paga en alto). `PROYECTOS.md`, `CONVENCIONES.md` y `NUEVO-PROYECTO.md`: nada que tocar.

**Publicado** con su permiso (*«subelo»*), commit **`e9ca2f1`** → `main`, **vivo en 25 segundos**.
**Comprobado en producción:** CI **verde** · **26 de 26** pantallas · y el cambio **dentro del `.js`
que sirve Vercel**: `flexBasis:c?"auto":\`${Math.max(e.notes.length…` — el ternario nuevo, minificado.

📌 **Esa última comprobación hizo falta pensarla:** el arreglo es un estilo que solo existe al
dibujar, así que **no deja rastro en el HTML** y la página desechable no puede vivir en producción.
Se comprobó **en el paquete servido**, que es donde sí se ve.

### 2026-09-04 · Tanda 45 — O-66: el redondeo partía secciones que caben · 🚀 r57 · ✅ visto bueno de Isaac

**Lo trajo Isaac con una captura ya con r56 puesta** —o sea, esto no eran las barras—:
*«vuelve y molesta que los acordes no aprovechan los espacios, mira que tienen buen espacio para que
se aproveche»*.

🔬 **Y lo importante de esta tanda es CÓMO se midió**, porque abre una puerta que llevaba cerrada:
se cargó **la presentación de verdad** en Brave sin ventana **por el enlace público** —que no pide
sesión— y desde una página desechable, **en el mismo origen**, se leyó dentro de la página: cuántas
filas hace el navegador en cada sonda, qué reparto guardó el componente, y **se recorrieron las 8
canciones mandando la flecha derecha**. Hasta hoy esto figuraba como «no deja rastro, solo lo puede
mirar Isaac».

**Lo que salió:** el redondeo a 8 px que se puso en r55 como freno **partía secciones que caben**.
Cuando los bloques llenan la fila, su suma **es** el ancho de la fila; al redondear cada uno por
separado (+4 px cada uno) contra una fila redondeada una sola vez, la cuenta se pasa. **12 de 18
cortes sobraban** en su propio culto, y cada uno le costaba media casilla vacía.

**Se le ofrecieron tres arreglos dibujados y eligió la A:** que las filas las cuente el navegador.
El detalle, en **O-66**. Hizo falta además redondear **a la baja**, porque el redondeo seguía
mordiendo al equilibrar.

**Medido:** cortes que sobran **12 → 0** en tres pantallas · repartos viejos **5 → 0** · **30
lecturas iguales** en 3 segundos, con el patrón por lectura. **197 pruebas** (5 nuevas), lint 0
errores, build 0, 26 de 26 pantallas.

⚠️ **La comprobación del baile dio un ROJO FALSO antes de servir**: contaba «cuántos repartos
distintos salen» y no distinguía **asentarse** de **oscilar**. Va a la carpeta compartida.

**Publicado** con su permiso (*«sube»*), commit **`90abbc0`** → `main`, **vivo en 20 segundos**.
**Comprobado en producción, y con el volcado de ANTES al lado** —el mismo culto, la misma ventana de
1600 × 720—:

| Sección | antes (r56) | ahora (r57) |
|---|---|---|
| de 2 bloques | `2→2` | `2→2` |
| **de 9 bloques** | `9→5+4` | ✅ **`9→9`** |
| de 4 bloques | `4→4` | `4→4` |
| **de 3 bloques** | 🔴 `3→2+1` | ✅ **`3→3`** |
| de 1 bloque | `1→1` | `1→1` |

📌 **Y el volcado se lee del propio `.js` que sirve Vercel**, no de local: se cargó el enlace público
en Brave sin ventana contra `partituras-blush.vercel.app`. Es la vía de §2.3-bis, ya usada contra
producción.

**CI verde** para `90abbc0` · **26 de 26** pantallas contra producción, la más lenta 1,7 s.

### 2026-09-04 · Tanda 44 — O-63: las barras dejan de tapar los acordes y de comerse el toque · 🚀 r56 · ✅ visto bueno de Isaac

**Se retomó por §9.0, que es como toca:** el reloj decía 2026-09-04 15:34, seis minutos después de
cerrar la tanda 43, y el punto 1 de la tabla era **O-63 — decidido por Isaac y sin programar**.

**Qué se programó.** Las barras de la presentación en pantalla completa **dejan de flotar sobre los
acordes y reservan su sitio**, encogidas: la cabecera queda en **una fila** (salir · la canción ·
la chapa del tono · pantalla completa) y el pie en botones bajos. Tono, tamaño, columnas, modo e
instrumento pasan **detrás de la chapa del tono**. Y se va el auto-ocultado entero —`chromeVisible`,
`hideTimer`, `pokeChrome`—, que ya no gana nada y **era lo que le robaba el toque al acorde**.

**Lo medido**, con Brave sin ventana contra el CSS compilado, a 1200 x 540: las barras pasan de
**200 px (37 % y tapando)** a **74 px (13,7 % y sin tapar nada)**; el alto libre para los acordes,
de 340 reales a **466**. El detalle está en **O-63**.

🔴 **Lo que esta tanda NO puede cerrar, y conviene no olvidarlo:** la pantalla completa de verdad
necesita un gesto del usuario, así que **ni `curl` ni el navegador sin ventana llegan a
`isFullscreen`**. Lo medido es el CSS de ese estado. **Falta el teléfono de Isaac.**

**Verificado:** tipos limpios · 192 pruebas · lint 0 errores (60 avisos, uno menos) · build 0
errores · 26 de 26 pantallas contra `npm start` · el HTML de la presentación fuera de pantalla
completa, igual que antes.

**Documentado en los cuatro sitios que manda la regla:** este archivo (O-63 y §9.0), `CAMBIOS.md`,
`/novedades` y el `README`. **Carpeta compartida:** `LECCIONES.md` (**L-233** y **L-235**) y
`PROYECTOS.md`.

**Y una trampa pequeña que salió sola:** `next-env.d.ts` aparece modificado según compile `build` o
`verificar`. Anotado en §2.1.

**Publicado** con su permiso (*«adelante, subelo»*), commit **`962d083`** → `main`. **Comprobado en
producción, no en local:**

| | |
|---|---|
| CI de GitHub | **verde** para `962d083` |
| Pantallas | **26 de 26** contra `partituras-blush.vercel.app`, la más lenta 2,0 s |
| `/novedades` | trae la entrada nueva |
| 🔴 **El código, dentro del paquete que sirve Vercel** | `Ajustes de la presentacion` **sí** · `top-full` (el panel) **sí** · `pointer-events-none opacity-0` (el auto-ocultado viejo) **ya no está** |

📌 **Esa última fila es la que de verdad prueba que se publicó el CÓDIGO y no solo los textos.** El
HTML de la presentación **no puede** enseñar la cabecera encogida —`isFullscreen` es estado del
navegador—, así que mirar el HTML habría dado un falso negativo. Se buscó dentro del `.js` servido.

⚠️ **Lo que costó de más:** el entorno de Claude bloqueó el `git push` dos veces. La segunda ya
había regla de permiso, y falló igual **porque el comando llevaba `| tail -5`**: la regla es de
comando **exacto**. Va a la carpeta compartida como **L-235** y a §11.

📌 **Y la regla 4 se cobró una, en vivo:** al ir a escribir esa lección, **ValidadorMakushama ya
había escrito L-234** desde otra conversación —el archivo cambió a las 19:54 mientras aquí se
trabajaba—. Se releyó antes de escribir y la de aquí pasó a **L-235**. Sin releer, habría salido
el número duplicado número 19 de ese archivo.

### 2026-09-04 · Tanda 43 — el reparto por ANCHO: publicado, revertido y rehecho con freno · 🚀 r54 → revert → r55

**Publicado:** `94b13c0..6b878d2`. Tres commits que hay que leer juntos: **r54** (el arreglo),
**`c4ca6ef`** (la reversión) y **r55** (el arreglo con el freno). CI verde, 26 de 26 pantallas.

**El fallo que traía Isaac:** una sección con casillas `{}1 {}2` se apretaba en dos filas dentro de
su cuadro en vez de pasar al siguiente. **La causa, medida:** el reparto **contaba** cuántos
bloques caben, y los bloques **no miden lo mismo** — los normales 104–161 px y la casilla `{}2`
**526 px, la fila entera**.

🔴 **Y r54 lo arregló y rompió algo peor: las canciones se pusieron a BAILAR.** Al cambiar la medida
entera por píxeles con decimales se abrió un lazo —medida → reparto → alto → auto-ajuste → medida—
que **con un entero se frenaba solo y con decimales no converge nunca**.
📌 **El entero no era una imprecisión: era el freno.** Es **L-231**.

**Se revirtió en minutos** y se rehizo con las cuatro patas: guardar **el reparto discreto** en vez
de los anchos, redondear a 8 px, que el observador **ignore los cambios de alto**, y el ancho **en
el estado y no en un `ref`** —esto último lo cazó el lint con un error de React de verdad—.

🔬 **Y lo que más vale de la tanda es cómo se comprueba ahora.** La primera vez se dio por bueno con
192 pruebas, build limpio, 26 pantallas y una medición que decía justo lo que se buscaba… **medida
UNA vez, con la página quieta**. El baile es lo que pasa **entre** una medida y la siguiente.
→ Ahora se muestrea **30 veces en 3 segundos, en tres tamaños**, y solo vale si **sale igual en
todas**. Es **L-232**, y es **T-17 en otra piel**: allí nadie miraba el reloj, aquí nadie miraba si
el resultado se queda quieto.

⚠️ **Y un fallo de método mío que conviene no repetir:** le dije a Isaac que había dejado escrita la
causa del baile **y no lo había hecho** — lo dije y seguí. Se escribió después (`0b7e1a8`). *Decir
que algo está anotado no lo anota.*

### 2026-09-04 · Tanda 42 — fuera el salto de línea, el `:|` en su sitio, y la documentación corregida · 🚀 r53

**Publicado:** `6ae6b8f..4902853` a `main`. CI verde, **26 de 26 pantallas en producción**, y el
README ya **sin las cuatro afirmaciones falsas** (comprobado contra el crudo de GitHub).

**① O-62 — el salto de línea (`;`) eliminado.** Lo jubiló el reparto automático, y el razonamiento
es suyo: el `;` era la respuesta *manual* al problema que O-52 resolvió *midiendo*, y a mano no se
puede acertar para todos los tamaños a la vez. **Muere con él la excepción** de «si lo marcas, la
página no reorganiza».
🔴 **El parser lo sigue aceptando y lo descarta**, y no es nostalgia: **las copias de seguridad lo
tienen dentro**. Una copia existe para restaurarla. Es T-07 en su versión de datos.
📌 **Y el barrido tenía un hueco que casi se me pasa:** las **13 versiones por tono** tienen su
propio texto de acordes. Salieron limpias, pero *al retirar algo del formato hay que barrer todas
las columnas donde vive ese formato, no solo la principal*.

**② O-64 — el `:|` se iba solo a otra línea, en 22 de 72 canciones.** Lo trajo él con una captura
del teléfono. Un `:|` pegado a una casilla (`}2:|`) creaba un **compás fantasma** que solo llevaba
el signo — y desde O-52 **ese fantasma cuenta como bloque para el reparto**.
📌 **Llevaba ahí desde siempre y empezó a NOTARSE con el reparto automático.** Una función nueva no
solo puede traer fallos: **puede despertar los que ya estaban dormidos.**

**③ La auditoría de documentos** (tanda 41), publicada aquí.

📌 **Lo que enseña esta tanda sobre CÓMO comprobar:** la medición no fue «compilan y las pantallas
responden». Fue sacar **las dos versiones del parser** —la publicada con `git show HEAD:`, no con
`git stash`, que mueve el árbol— y contar por separado **los acordes (3.388 → 3.388)** y **las
repeticiones (330 → 330)**. *«Cambian 25 de 85» a secas no dice nada: podría ser que se hubieran
perdido acordes.*

### 2026-09-04 · Tanda 41 — la documentación mentía, y en el peor sitio

**Sin código.** Isaac lo pidió antes de cerrar: *«verifícame en todos los archivos que están en el
repositorio… y actualiza la información que esté desactualizada, creo que hasta el readme está
desactualizado al menos en lo que dice de pendientes»*. **Tenía razón, y se quedó corto.**

🔴 **Cuatro de los siete puntos de «deuda técnica conocida» del README eran FALSOS:**

| Decía | La realidad, medida |
|---|---|
| `"strict": false` | **`true`** desde el 2026-08-29 |
| `eslint-config-next` en la 14 | **la 16**, con ESLint 9 |
| `@react-pdf/renderer` instalado | **ya no está** |
| 🔴 **«Desactivar un usuario no le impide entrar»** | **SÍ le impide** desde el 2026-08-28, probado en producción |

🔴 **Y lo peor no estaba en el README, sino AQUÍ.** §1 se titula **«Guía rápida para la IA, léeme
primero»** y decía *«No hay ni una prueba, ni CI»* con **187 pruebas y CI puestos desde el 22 de
agosto**. O sea: **un chat nuevo empezaba creyendo que trabajaba sin red**, en la única sección
escrita para que eso no pasara. También decía **14 migraciones** (son 21), y listaba un
`layout.tsx` huérfano **borrado hace una semana**.

**Lo demás que se corrigió:** las líneas de cada archivo del núcleo (de 566 a **961** en
`TablaturePreview`, de 450 a **1.016** en `PresentationView`…), **7.029 → 14.919 líneas** de
TypeScript, **75 → 80 canciones** (72 publicadas + 8 borradores, contadas hoy), el historial del
README con **r49…r52**, y la tabla de sintaxis, que se había quedado sin **el doble puntillo**, sin
los **silencios cortos** y sin **`%` con duración**.

📌 **Por qué pasó, que es lo único que evita que vuelva:** *lo que se arregla se anota donde se
arregla* —en la ficha del problema, en el historial— **y nadie vuelve al resumen de arriba a
tacharlo**. El resumen se escribe una vez, al principio, cuando todo está por hacer.
→ **Tachar el punto EN LA LISTA es parte de cerrarlo.** Es **L-230**.

📌 **Y lo que lo hizo barato:** no se releyeron los documentos buscando errores — **se midió la
realidad primero** (`tsconfig`, `package.json`, el código, la base) y se compararon los números.
**Buscar mentiras leyendo no funciona: lo escrito suena razonable, por eso se escribió.**

⚠️ **Un documento incompleto hace que alguien pregunte; uno que miente hace que ACTÚE.** Y las dos
mentiras más caras eran justo **de seguridad** y **de red de seguridad**.

### 2026-09-04 · Tanda 40 — O-61: la red de seguridad donde faltaba · 🚀 r52

**Publicado:** `0c75799..85788bf` a `main`. CI verde, **26 de 26 pantallas en producción**,
`/sheets/new` **200** y **los cuatro modos de la canción a 200**.

Isaac pidió *«fíjate si sale en otros lugares, sino, impleméntalos donde sea pertinente»*.
📌 **Y lo primero fue leer bien la petición:** el diálogo que él describía —el del culto— **ya
funcionaba**. Lo que pedía era **buscar dónde FALTA**, que es otro trabajo.

**Faltaba en tres sitios, y el peor es el más caro del proyecto:**
🔴 **Crear una canción no tenía NADA.** Se tecleaba título, tono, compás, categorías y **todos los
acordes**, se pulsaba «volver», y **se perdía sin decir nada**. Son 28.203 caracteres de acordes
transcritos a mano en 75 canciones: es el trabajo que este proyecto existe para proteger.
🔴 **La melodía y las versiones por tono** sabían que estaban sucias —lo usan para su propio
botón— pero **no se lo decían a nadie**.
🔴 **Y el modo `melodia` no estaba en la lista de modos protegidos** — que es **O-43 literalmente
otra vez**, donde faltaba `letra`. Y lo escribí yo hace dos días **sabiendo** que había pasado.

**Y salieron DOS huecos más que él no había pedido:**
① **Solo la pestaña «Vista» pedía permiso.** Ir de «Melodía» a «Letra» desmontaba el panel y se
perdía lo escrito. **Cambiar de pestaña es salir**, y ahora las cuatro pasan por la red.
② **Uno que iba a introducir yo:** la marca de «sucio» se quedaba puesta al desmontarse el panel,
así que tras descartar el editor creería que hay cambios hasta recargar.

📌 **La decisión que evita repetir P-01:** en `/sheets/new` el diálogo es de **dos botones**. Ahí
«Guardar y salir» **puede no ser posible** —sin título no se crea la canción— y **un botón que a
veces no hace nada es el fallo más caro de este proyecto**. Se ofrece lo que siempre es verdad.

⬜ **Punto ciego:** esto **solo se ve usándolo**. El HTML no dice si el diálogo salta.

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
