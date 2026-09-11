# Ideas futuras de Partituras

> Antes §10 del `CLAUDE.md`.
> Movido **tal cual** desde `CLAUDE.md` el 2026-09-11 (el recorte, L-256).
> Lo nuevo se escribe **arriba**, debajo de esta cabecera.

## 10 · Ideas futuras

Del `roadmap` del README, ninguna aprobada todavía:

- ✅ ~~[PROPUESTA] Exportar/imprimir las canciones con acordes a PDF~~ → **HECHO** (fase F): el PDF
  del culto lleva **las canciones completas** con sus acordes, una por hoja. Y se hace con la
  impresión del navegador: **`@react-pdf/renderer` se quitó** el 2026-08-28 (8,4 MB que no
  importaba nadie). *La línea seguía diciendo que estaba instalado.*
- 🟢 **APROBADA en principio por Isaac el 2026-09-05** — *«me parece bien el punto 1»*: etiquetas,
  favoritos e historial de versiones en la interfaz (las tablas ya existen y están a 0 filas).

  **✅ Y ESE MISMO DÍA CONTESTÓ LAS DOS PREGUNTAS** (*«pienso que primero sería la de favoritos, y
  que sean para cada músico»*):

  | | |
  |---|---|
  | **Primero** | 🔴 **LOS FAVORITOS.** Etiquetas e historial quedan detrás, sin fecha |
  | **De quién** | **De CADA MÚSICO, los suyos.** No del grupo |

  **✅ COMPROBADO CONTRA LA BASE REAL el 2026-09-07, y la noticia es buena: NO HACE FALTA
  MIGRACIÓN.** Isaac dijo *«adelante con el punto 2»* y lo primero fue mirar la tabla, porque **T-01
  avisa de que las migraciones del repositorio no son la verdad de la base**. Esta vez sí lo eran:

  | Se probó, con la cuenta de prueba | |
  |---|---|
  | Leer `favorites` con sesión | ✅ **200** (vacía: 0 filas) |
  | Guardar un favorito **mío** | ✅ la política **deja** |
  | Guardar uno **a nombre de OTRO usuario** | ✅ **403 · 42501, bloqueado** |

  🔬 **Y las dos pruebas de escritura NO escribieron nada**, con el mismo truco de P-03: se manda
  `sheet_id` a `null`. Si la política bloquea sale **42501**; si deja pasar, Postgres lo para por el
  `NOT NULL` y sale **23502**. Las dos ramas dejan la base intacta y **el código de error dice cuál
  fue**.

  📌 **Lo que eso significa, y por eso se mide antes de planear:** los favoritos **se pueden hacer
  hoy**, sin esperar al primo. Es lo único aprobado que no está bloqueado.

  #### El plan, mínimo y en un solo paso

  | | |
  |---|---|
  | **1** | `lib/favoritos.ts`: leer los del usuario y marcar/desmarcar |
  | **2** | Un **corazón** en la tarjeta del catálogo, que se pulsa y se queda |
  | **3** | Un filtro **«Solo mis favoritos»** junto a las categorías, como uno más |

  #### ✅ HECHO Y PROBADO CONTRA LA BASE (2026-09-07) — r63

  | | |
  |---|---|
  | `lib/favoritos.ts` | Lee los del usuario. **Una consulta para toda la pantalla**, no una por tarjeta |
  | `catalog/actions.ts` | Marcar y desmarcar. 🔴 **El usuario NO viaja desde el navegador**: se coge de la sesión, porque si viajara, cualquiera podría mandar el de otro |
  | `BotonFavorito.tsx` | El corazón. **Pinta lo pulsado sin esperar al servidor** —en una tablet con datos flojos, un corazón que tarda se pulsa dos veces— y **vuelve atrás si el servidor falla** |
  | `CatalogFilters` | El filtro **«Mis favoritas»**, delante de «Todas» |

  **Probado de punta a punta contra la base real**, con la cuenta de prueba:

  | | |
  |---|---|
  | Guardar un favorito | **201** |
  | El catálogo con `?favoritos=1` | **solo esa canción** |
  | Su corazón | sale **marcado**; los otros 71, no |
  | Al terminar | 🧹 **la fila de prueba se borró**: la cuenta queda con **0 favoritos**, comprobado |

  ⚠️ **Y eso último se hace constar porque escribe en la base de producción** (D-04): fue **una fila
  de la cuenta de prueba**, no un dato de la iglesia, y se limpió en el mismo minuto.

  **Comprobado:** tipos limpios · **207 pruebas** · lint **0 errores, 60 avisos** —los mismos— ·
  build **0** · **26 de 26** pantallas.

  ⬜ **Lo que queda abierto y decide él al verlo:** si los favoritos deben salir también en
  **Letras** y **Melodías** —hoy el filtro funciona ahí porque comparten la consulta, pero **el
  corazón solo está en el catálogo**— y si quiere una **pantalla propia** o le basta el filtro.

  **✅ Y EL CORAZÓN, TAMBIÉN EN LETRAS Y MELODÍAS (2026-09-07).** Isaac: *«el corazón lo quiero
  también en letra y melodías»*. Las tres pantallas sirven ahora **los mismos 84 corazones**,
  medido. El filtro «Mis favoritas» ya funcionaba en las tres desde r63, porque comparten la
  consulta (D-21).

  ⬜ **Y lo que no se puede comprobar desde aquí:** que el corazón **responda al pulsarlo**. Eso es
  el navegador. Lo medido es que la base guarda, que el filtro filtra y que el corazón se pinta como
  toca. **Falta que Isaac lo pulse.**

  ✅ **PUBLICADO y comprobado en producción**, commit `850298a`, vivo en **15 segundos**. CI verde ·
  **26 de 26** pantallas · y el catálogo servido por Vercel trae **72 corazones**, exactamente lo
  mismo que en local.

  ⚠️ **Y un susto que me di yo solo, anotado para no repetirlo:** al comprobar producción busqué la
  frase `en mis favoritos` con `grep` y salió **0**, así que dije que no había corazones. **Era mi
  `grep`**: la página escapa las comillas angulares de otra forma. Se vio comparando **las cuentas**
  de local y producción, que salían idénticas. → **Cuando una comprobación dice que algo falta,
  antes de anunciarlo hay que descartar que falle la comprobación** — es L-237 otra vez, en su
  versión más tonta.
- ❌ **DESCARTADA por Isaac el 2026-09-05** (*«los otros no»*): subida y visor del PDF original.
- ❌ **DESCARTADA por Isaac el 2026-09-05**: sincronización con Google Drive (tablas preparadas,
  nunca empezado). **No volver a proponerlas.**
- ✅ ~~[PROPUESTA] Terminar la PWA~~ → **HECHA** (O-59): se instala con su icono, se abre sin barra
  de direcciones, gira (r49) y el caché va versionado (P-12), que era la causa de T-02. Lo único que
  faltaba era **decirle a la gente cómo se instala**, y eso está en `/novedades` desde r50.
- 🟢 **APROBADA en principio por Isaac el 2026-09-05** — *«me parece bien… el 4»*: darle sentido al
  rol `musician`, que hoy hace **exactamente lo mismo** que `viewer`.
  ⬜ **ESPERANDO QUE ELIJA.** El 2026-09-05 pidió opciones (*«del rol de musico dame opciones»*) y se
  le mandaron estas cinco. **Se pueden combinar; ninguna está empezada:**

  | | Qué podría hacer un MÚSICO que un lector no | Qué cuesta / qué arriesga |
  |---|---|---|
  | **A** | **Ver los cultos en BORRADOR**, para ensayar antes de que se publiquen | Barato. Hoy solo los ve el admin (O-31). ⚠️ Ve el culto a medio armar |
  | **B** | **Entrar a MELODÍAS** y escribir el pentagrama — pensado para el trompetista | Barato en pantalla. ⚠️ Hoy es «solo administradores» y **no se puede guardar** hasta la migración `20240021` |
  | **C** | **Crear y editar canciones** (teclear acordes y letra), **sin borrar nada** | 🔴 El más útil —hoy teclea Isaac solo— y el más delicado: **tocar el repertorio**. Necesita que la BASE lo permita, no solo la pantalla → **migración** |
  | **D** | **Notas suyas en cada canción** —«yo la toco en G», «entro en el segundo compás»—, privadas | Tabla nueva → **migración**. Es lo más parecido a los favoritos que ya eligió |
  | **E** | **Armar cultos** (crearlos y ordenarlos), pero **sin publicarlos** | Trabajo medio. Reparte el trabajo sin soltar el control de lo que se publica |

  📌 **Y lo que hay que decirle al enseñárselas:** **A, B y E se quedan en la pantalla** —se pueden
  hacer hoy—, mientras que **C y D tocan la base**, o sea que **nacen bloqueadas** por lo mismo que
  todo lo demás. Eso puede cambiar cuál elige, así que va delante y no en letra pequeña.
  ⚠️ Y **C sin tocar la base sería un engaño**: el botón aparecería y la base lo rechazaría —o peor,
  lo dejaría pasar (P-03 está medido solo a medias)—.

  > 🔴 **SUPERADO EN PARTE el 2026-09-10 — MANDA ESTO:** Isaac *«cambié de opinión, que solamente
  > pueda hacer las notas privadas, lo de armar cultos ya no va»*. → **Solo D.** La E queda
  > **descartada**; lo que sigue sobre ella es historia, **no se hace**.

  #### ✅ ISAAC ELIGIÓ (2026-09-07): **D · las notas privadas** y ~~**E · armar cultos**~~ *(E descartada el 2026-09-10)*

  🔴 **Y AL IR A HACERLO SE VIO QUE YO LE HABÍA DICHO MAL LO DE LA E.** En la tabla de arriba puse
  que «E se queda en la pantalla y se puede hacer hoy». **Es falso.** La política de la base dice:

  ```sql
  create policy "services_write_admin" on public.services for all
    to authenticated using (public.is_admin()) with check (public.is_admin());
  ```

  → **Escribir cultos es solo del administrador, y eso lo dice la BASE.** Cambiarlo es una
  migración. **Las dos que eligió están bloqueadas por el primo**, y se lo dije nada más verlo.
  📌 **La lección de por qué me equivoqué**: clasifiqué las cinco opciones **por dónde imaginaba que
  vivía cada una**, sin abrir las políticas. Con D acerté por casualidad —tabla nueva, obvio— y con E
  no. **Una opción no se etiqueta de «se puede hoy» sin haber mirado lo que la impide.**

  #### Lo que SÍ se hizo el 2026-09-07

  | | |
  |---|---|
  | **D · notas privadas** | ✅ **Migración `20240022` APLICADA el 2026-09-10** (antes: *escrita y sin aplicar*). Crea `notas_musico` con sus cuatro políticas —cada uno solo las suyas, **el administrador tampoco las ve**—. ⚠️ Es de las **seguras**: tabla nueva, no toca ninguna política existente, así que **no puede dejar a nadie fuera** (al revés que la `20240020`) |
  | **E · armar cultos** | ⬜ **NI ESCRITA.** Y es deliberado: cambiar quién escribe cultos es `alter policy` sobre un nombre que sale del repositorio, y **T-01 dice que el repositorio no es la base**. Es exactamente lo que tiene bloqueada la `20240020`. → **Primero se leen las políticas reales, y para eso hace falta el acceso** · ✅ **Leídas el 2026-09-10:** en producción son `services_write_admin` y `service_songs_write_admin` (las dos `ALL`, `is_admin()`). **Ya se puede escribir**, cuando Isaac la pida |
  | **La pantalla de las dos** | ⬜ **Sin empezar.** Era a propósito —un botón que guarda en una tabla que no existe es peor que no tener botón—; **desde el 2026-09-10 la D ya tiene su tabla** y se puede hacer (§9.0 fila 2) |

  #### ~~El diseño de la E, para cuando se pueda~~ — ❌ DESCARTADA el 2026-09-10, no se hace

  Un músico **crea y ordena** cultos, pero **no los publica**:
  * `insert` en `services`: se le permite, **pero solo con `status = 'draft'`**.
  * `update`: solo los **suyos** (`created_by = auth.uid()`), y **sin poder poner `published`** — eso
    se hace con el `with check`, que mira la fila NUEVA.
  * `delete`: **solo el administrador**. Borrar un culto no se reparte.
  * `service_songs`: escribir solo las del culto propio, mirando el `created_by` del culto padre.

---
