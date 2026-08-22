# Cambios de la página

> Lo que ha ido cambiando en las partituras, contado para quien lo usa.
> Si buscas el detalle técnico, está en `CLAUDE.md`.

---

## 21 de agosto de 2026

### 🎹 Ver cómo se toca cada acorde

**Pulsa cualquier acorde de una canción y se abre cómo se toca**, en el piano y en el bajo. Funciona
en la vista normal y a pantalla completa.

- **En el piano** se marcan las teclas del acorde, con unas cuantas teclas alrededor para que se
  vea en qué parte del teclado cae.
- **En el bajo** sale el mástil: el círculo relleno es la nota que toca el bajista, y los huecos
  son el resto del acorde por si quieres caminar.
- Cuando el acorde lleva un bajo distinto —`F/A`, `A/G#m`— se ven **las dos manos**: la izquierda
  hace fundamental, quinta y octava.
- **Se dibujan los 1.894 acordes de las partituras**, incluidos los raros.
- **Las notas salen bien escritas.** Un `Bb` dice **`Bb · D · F`**, no `A# · D · F`; un `Cm7`
  dice **`C · Eb · G · Bb`**. Antes todo lo que llevaba bemol salía con sostenidos.

No sale al imprimir ni cuando estás editando: ahí el clic es para otra cosa.

### 🎸 Y ahora también la guitarra

- **El mismo recuadro del acorde trae el mástil de la guitarra:** × es cuerda que no se toca, ○ es
  al aire, el punto es dónde pisar y la barra es la cejilla. Debajo dice en qué traste va y en qué
  cuerda cae la fundamental.
- Se saben tocar **1.892 de los 1.894 acordes**. Los dos que faltan son raros de verdad, y **a
  propósito no se dibuja nada**: más vale no enseñar nada que una postura que no suena.
- **Arreglado: al subir o bajar el tono, los acordes salían mal escritos.** Bajando de `F` a `E`,
  arriba ponía «Tono: E» pero debajo salía `Dbm`, `Gbm7`, `Abm7` — escrito como si el tono fuera
  `Fb`, y nadie toca en Fb. Ahora manda **el tono al que llegas**, no del que sales: salen `C#m`,
  `F#m7`, `G#m7`. Medido sobre las 75 canciones y las 12 tonalidades: **afectaba a más de la mitad
  de las transposiciones**.
- **Arreglado: a pantalla completa no salían los diagramas.** Tocabas el acorde y no aparecía nada,
  justo en la pantalla que se usa tocando.
- **Un instrumento por vez, y la página se acuerda del tuyo.** Arriba del recuadro eliges
  **Piano · Bajo · Guitarra** y se ve el que elijas. Lo pones una vez y a partir de ahí tocas un
  acorde y ves directamente el tuyo. Se guarda **en tu aparato**, así que cada músico tiene el suyo.
  *(La idea de separar los instrumentos es del hermano de Isaac.)*
- **Arreglado: el recuadro se metía debajo de la barra de abajo.** Al tocar un acorde de la parte
  baja de la canción tapaba la barra de secciones y los botones de tamaño y claro/oscuro, y ahí ya
  no se podía hacer nada. Ahora nunca baja de esa barra.
- **Arreglado: al salir de pantalla completa volvías a la canción de antes.** Si pasabas dos o tres
  canciones y cerrabas, te devolvía a la primera. Ahora sales **en la que estabas viendo**.

### 📖 En las canciones

- **Filtro por estado, solo para administradores.** Debajo de las categorías aparece
  **Publicado · Borrador · Archivado**, y se combina con las categorías. **A los músicos y lectores
  no les cambia nada.**
- **La etiqueta de PUBLICADA / BORRADOR / ARCHIVADA ya solo la ve el administrador.** A un músico
  no le decía nada —él solo ve lo publicado— y le metía ruido en las 75 tarjetas.
- **Las tarjetas ocupan menos.** Fuera la fila que ponía «Canción» en todas y el botón de «Ver
  canción», que repetía lo que ya hace tocar la tarjeta. De unos **185 a unos 110 píxeles** de
  alto, **sin quitar información**.

### 🎵 En los cultos

- **Arreglado: desde un culto, «la siguiente» era del catálogo entero.** Entrabas en una canción
  del culto y las flechas te paseaban por las **75 canciones** en vez de por las del repertorio, y
  el botón de volver te dejaba en el listado en vez de en el culto. Ahora se recorre **el
  repertorio de ese culto, en su orden**, y el volver devuelve **al culto**. Vale también a
  pantalla completa.
- **El repertorio se ordena ARRASTRANDO.** Fuera los botones de subir y bajar: se agarra la
  canción por el asa de la izquierda y se lleva a su sitio. **Funciona con el dedo en el teléfono**
  y con el ratón en el computador. *(Solo administradores.)*
- **Desde el editor del culto ya se puede abrir una canción.** El título es un enlace, como lo era
  para lectores y músicos. *(Solo administradores.)*
- **Los cultos tienen estado: borrador · publicado · archivado**, igual que las canciones. Un
  culto nuevo nace en borrador y **solo lo ve quien administra** hasta que se publica. Los que ya
  existían quedaron publicados, así que **para los músicos no cambia nada**. *(Solo
  administradores.)*

### 🎤 Las letras (en preparación)

- Se montó toda la parte de **letras de las canciones**: escribirlas, leerlas, buscarlas y verlas
  a pantalla completa en vez de los acordes.
- **Todavía no está abierta**: aparece solo para quien administra, mientras se escriben las 75.
  Cuando estén, se abre para todos.

### 📣 Una página con las novedades

- **`/novedades`** — el comunicado de lo que va cambiando, **contado para los músicos**. Es
  **pública**: la abre cualquiera sin cuenta, así que el enlace se puede mandar al grupo.
  El texto vive en `src/lib/novedades.ts`; añadir una tanda es escribir una entrada ahí.

### 🔧 Por dentro (no se ve, pero importa)

- **Arreglado un texto en blanco sobre blanco.** En modo oscuro, al desplegar una lista —el rol de
  un usuario, la tonalidad, el tipo de culto— **las opciones no se leían**. Afectaba a los 8
  desplegables de la página.
- **La copia de seguridad ya se lleva también los borradores.** Antes se dejaba fuera 8 canciones,
  y había que rescatarlas a mano.
- **Y una copia ya no puede borrar a otra.** Dos copias seguidas el mismo minuto se pisaban.
- **La página ya no se queda con la versión vieja.** El almacén que guarda la página para que
  cargue rápido **no se limpiaba nunca**: si un día fallaba la conexión, podía servirte una copia
  de hace meses. Ahora se renueva en cada actualización.
- **Se cerró el único agujero de seguridad que llegaba al navegador**, el del lector de PDF: un PDF
  preparado a mala fe podía ejecutar código al abrirlo. También se actualizó el motor de la página.
- **El enlace «Regístrate» del inicio de sesión daba error 404.** Se quitó: las cuentas las crea
  quien administra, no hay registro abierto.

---

## 20 de agosto de 2026

La página llevaba parada desde el 12 de junio. Este día se retomó.

### 📖 En las canciones

- **Ya salen todas.** Antes la lista se cortaba en **50**, y hay **69** publicadas: faltaban
  casi veinte y nada lo avisaba.
- **Cada canción muestra todas sus categorías.** Antes solo se veía una aunque tuviera dos
  (por ejemplo *Amigo De Dios*, que es **Ofrenda + Alabanzas**). Son 13 canciones así.
- **Las tarjetas ya no traen los acordes en miniatura.** Ahora dicen lo que hace falta para
  encontrarla: nombre, autor, categorías, tono y compás. De paso la lista va más ligera.
- **Se quitó el número de himno**, que no se usaba.
- **Botón «Pantalla completa»** en cada canción, con el mismo visor que se usa en los cultos:
  columnas, tamaño automático y subir o bajar el tono al vuelo.
- **Se puede pasar a la siguiente canción sin volver al listado**, con los botones **‹ ›** o con
  las **flechas ← →** del teclado. Funciona en la vista normal y a pantalla completa.
  - Y respeta el filtro: si estás mirando **Alabanzas**, pasas a la siguiente **de Alabanzas**.
- **Las teclas `+` y `−` cambian el tamaño de la letra**, sin tener que buscar el botón.
- **Dos maneras de leer las columnas** a pantalla completa, con un botón al lado del de columnas:
  - **Por filas** (lo de siempre): izquierda, derecha, y luego la fila de abajo.
  - **Por columnas**: la primera columna entera de arriba abajo, y después la siguiente.

  Lo pidió un músico del grupo de alabanza. Según cómo esté escrita la canción, una de las dos
  se lee bastante mejor. **Cada uno guarda la suya**; no le cambia la vista a nadie más.

### 🎼 En los acordes

Tres cosas que se veían mal y ya están corregidas:

- **La negra con puntillo** se dibujaba con la cabeza hueca, así que **se leía como una blanca
  con puntillo**. Ahora sale como debe.
- **La corchea con puntillo** salía **sin su corchete**.
- **El tono menor.** Una canción en **`Bm`** mostraba **`B`** arriba, junto a los botones de subir
  y bajar tono — y son dos tonalidades distintas. **Afectaba a 17 de las 75 canciones.**
- **El tono con bemoles.** Una canción en **`Bb`** mostraba **`A#`** arriba, aunque todos sus
  acordes debajo estuvieran escritos con bemoles. Ahora, mientras no muevas el tono, arriba sale
  **exactamente el que está guardado**. **Afectaba a 4 canciones:** *Cristo Es Mi Roca*,
  *Canción Feliz*, *Casa De Mi Padre* y *Gozo Pegajoso*. Y al subir o bajar el tono con los
  botones, también respeta los bemoles.

- **La ligadura (el arco que une dos acordes).** Tres cosas:
  - **Se quedaba corta** cuando los dos acordes no medían lo mismo — en `F ~ G7` el arco no
    llegaba al `G7`. Ahora se mide en pantalla dónde está cada acorde, así que llega siempre.
  - **Cuando la ligadura pasa a la línea siguiente** —al otro lado de la barra de compás— antes
    **no se dibujaba nada**. Ahora sale medio arco saliendo y medio entrando, como en una
    partitura de verdad. Pasa en *Canción Feliz*, *Hay Poder En La Alabanza* y *Yo Bien Sé
    Quien Soy*.
  - En *Si Dios Dice Que Si* el arco **se cortaba en el guion** de `F# ~ - D`. Ahora pasa por
    encima y llega hasta el `D`, que es lo que se toca.

  - **Una ligadura puede abarcar varios acordes.** Se encadena —`C~ D~ E`— y sale **un solo arco
    largo** del primero al último, pasando por encima de los del medio. Da igual cuántos haya.

Y dos añadidos:

- **El acorde disminuido ahora se dibuja con su símbolo: `°`** (y `°7`). Se sigue **escribiendo
  `dim`**, como siempre; solo cambia cómo se ve en la cuadrícula.
- **El staccato.** Se escribe con `!` pegado al acorde (`C:1!`) y sale con su puntito. Y se
  puede poner **una duración sola**, sin acorde, para cuando solo importa la figura.

### 🎵 En los cultos

- **Una canción puede ir varias veces en el mismo culto**, las que hagan falta, y **cada vez
  con su propio tono y su propia nota**. Antes la página lo impedía sin decir por qué.
- **Botón «Avisar»**: abre WhatsApp con el mensaje ya escrito —nombre del culto, fecha y
  enlace— y **tú eliges a quién se lo mandas**. Nada sale solo.
- **El enlace que se comparte ahora sabe quién lo abre.** Es el mismo enlace para todos:
  - **Quien no tiene cuenta** ve el repertorio, como siempre.
  - **Quien tiene cuenta** ve además un botón para **abrir el culto completo** y puede **entrar
    en cada canción**. Antes se quedaba en la lista sin poder pasar de ahí.
- **Quien recibe el enlace puede poner la página en claro u oscuro y cambiar el tamaño de la
  letra**, aunque no tenga cuenta.

### 📄 El PDF del culto

Antes el botón **PDF** bajaba solo **la lista** de canciones: título, autor y tono. Ahora se lleva
**el culto entero**:

- **Cada canción en su hoja**, con **todos sus acordes y su estructura**, y **en el tono en el
  que se va a tocar** (no en el original).
- Se puede elegir **claro u oscuro**. El oscuro es el bueno si lo vas a leer en el teléfono; el
  claro, si alguna vez hay que sacarlo en papel.
- Se puede elegir **hoja horizontal o vertical**. La vertical es la que sirve en el móvil,
  porque el teléfono siempre guarda así.
- Lo que elijas **se recuerda** para la próxima vez.

Funciona igual para quien recibe el enlace del culto sin tener cuenta.

### 👤 En las cuentas

- **Se puede cambiar el nombre de una cuenta** desde el panel de administración. **A esa persona
  no se le cierra la sesión** al hacerlo.

### 📱 En el teléfono y en el navegador

- **Donde decía «Cancionero» ahora dice «Partituras»** — en el pie de la página que se comparte,
  en el nombre de la aplicación del móvil y en la descripción. Es como se dice aquí.
- **El logotipo de la iglesia** ya sale en la pestaña del navegador y en el icono de la
  aplicación instalada en el móvil.
- **El tamaño de letra que ajustes en el modo presentación se queda guardado**, canción por
  canción. Cada músico tiene el suyo: lo que tú pongas no le cambia el tamaño a nadie más.

### 🔧 Por dentro (no se ve, pero importa)

- **Se hizo una copia de seguridad de las 75 canciones.** No existía ninguna: todo el trabajo
  vivía en un solo sitio, sin copias automáticas. Ahora se puede repetir cuando se quiera.
- **Cada cambio que se sube se comprueba solo.** Si algo no compila, queda marcado antes de que
  llegue a la página.
- **Se arregló un fallo por el que el icono nunca habría llegado al móvil**, aunque en el
  ordenador se viera bien.

---

<!-- Las entradas nuevas van ARRIBA, con su fecha. -->
