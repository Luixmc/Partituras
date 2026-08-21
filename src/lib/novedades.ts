// ─────────────────────────────────────────────────────────────
// El comunicado de cambios que ven los MÚSICOS, en /novedades.
//
// Está separado de la página a propósito: añadir una tanda nueva es
// escribir una entrada aquí, sin tocar el dibujo.
//
// 🔴 QUÉ VA Y QUÉ NO VA AQUÍ. Isaac lo dijo el 2026-08-21:
// «no menciones nada de los cambios del administrador, ya que no lo
// van a usar ellos, sino que me des la información que sí les
// interesa». → **Nada de gestión de cuentas, filtros de administrador,
// copias de seguridad, claves ni compilaciones.** Solo lo que nota
// alguien que abre la página para tocar.
//
// Y se escribe en su idioma, no en el del código: «el arco de la
// ligadura se quedaba corto», no «se corrigió el cálculo de posición».
// El detalle técnico vive en CLAUDE.md, que es otro documento y para
// otra gente.
// ─────────────────────────────────────────────────────────────

/**
 * Si algo es NUEVO o si estaba ARREGLADO cambia lo que el músico tiene
 * que hacer: buscar un botón que antes no existía, o simplemente
 * volver a confiar en algo que fallaba. Por eso se marca.
 */
export type TipoCambio = "nuevo" | "arreglado";

export type Cambio = {
  tipo?: TipoCambio;
  titulo: string;
  /** Párrafos de explicación. Admiten <strong>, <em> y <code>. */
  detalle?: string[];
  /** Comparación antes/después, para lo que se entiende mejor viéndolo. */
  tabla?: { cabecera: string[]; filas: string[][] };
};

export type Seccion = { titulo: string; cambios: Cambio[] };

export type Tanda = {
  /** Cómo se lee la fecha en pantalla. */
  fecha: string;
  /** Para ordenar y para el atributo `datetime`. */
  iso: string;
  entrada: string;
  /** Aviso corto bajo la entrada. Admite las mismas etiquetas. */
  nota?: string;
  secciones: Seccion[];
};

/** De más reciente a más antigua. */
export const TANDAS: Tanda[] = [
  {
    fecha: "21 de agosto de 2026",
    iso: "2026-08-21",
    entrada:
      "La página llevaba <strong>parada desde el 12 de junio</strong>. Estos dos días se retomó y " +
      "se le metió mano a fondo. Esto es lo que vas a notar cuando la abras — nada de aquí hay que " +
      "aprenderlo: o es algo nuevo que está a la vista, o es algo que estaba mal y ya no lo está.",
    nota:
      "Todo lo de aquí vale igual en el <strong>teléfono</strong>, en la <strong>tablet</strong> y " +
      "en el <strong>computador</strong>. Donde algo cambie según el aparato, se dice.",
    secciones: [
      {
        titulo: "Al leer los acordes",
        cambios: [
          {
            tipo: "nuevo",
            titulo: "Toca cualquier acorde y ves cómo se toca.",
            detalle: [
              "Con el dedo en el teléfono o con el ratón en el computador. Se abre un teclado con " +
                "las notas marcadas y el mástil del bajo, con la nota que le toca al bajista " +
                "señalada. Funciona en la vista normal y a pantalla completa.",
              "Están <strong>los 1.894 acordes</strong> del cancionero, incluidos los raros.",
            ],
          },
          {
            tipo: "arreglado",
            titulo: "Las notas del acorde estaban mal escritas.",
            detalle: [
              "Un <code>Bb</code> decía tener las notas <code>A#</code>, <code>D</code>, " +
                "<code>F</code>. Es la misma tecla, pero no es como se escribe. Pasaba con todo lo " +
                "que llevara bemol.",
            ],
            tabla: {
              cabecera: ["Acorde", "Decía", "Ahora dice"],
              filas: [
                ["Bb", "A# · D · F", "Bb · D · F"],
                ["Gm", "G · A# · D", "G · Bb · D"],
                ["Cm7", "C · D# · G · A#", "C · Eb · G · Bb"],
              ],
            },
          },
          {
            tipo: "arreglado",
            titulo: "La negra con puntillo se leía como una blanca con puntillo.",
            detalle: [
              "Se dibujaba con la cabeza hueca, y hueca con puntillo <em>es</em> una blanca con " +
                "puntillo. Quien la leyera le daba el doble de duración.",
            ],
          },
          {
            tipo: "arreglado",
            titulo: "La corchea con puntillo salía sin su corchete.",
          },
          {
            tipo: "arreglado",
            titulo: "Las ligaduras, en tres cosas distintas.",
            detalle: [
              "El arco <strong>se quedaba corto</strong> cuando los dos acordes no medían lo " +
                "mismo. Cuando la ligadura <strong>pasaba a la línea siguiente</strong> —al otro " +
                "lado de la barra de compás— no se dibujaba nada. Y en <em>Si Dios Dice Que Si</em> " +
                "se cortaba en el guion en vez de llegar hasta el acorde.",
            ],
          },
          {
            tipo: "nuevo",
            titulo: "Una ligadura puede abarcar varios acordes.",
            detalle: [
              "Sale un solo arco largo del primero al último, pasando por encima de los del medio.",
            ],
          },
          {
            tipo: "arreglado",
            titulo: "El tono que sale arriba, en pantalla completa.",
            detalle: [
              "Una canción en <code>Bm</code> mostraba <code>B</code>, y son dos tonalidades " +
                "distintas: afectaba a <strong>17 de las 75</strong> canciones. Y una en " +
                "<code>Bb</code> mostraba <code>A#</code>: otras <strong>4</strong>.",
            ],
          },
          {
            tipo: "nuevo",
            titulo: "El disminuido se dibuja con su símbolo.",
            detalle: [
              "Se ve <code>°</code> y <code>°7</code>. Se sigue escribiendo <code>dim</code>, como siempre.",
            ],
          },
          {
            tipo: "nuevo",
            titulo: "El staccato y las duraciones sueltas.",
            detalle: [
              "El staccato sale con su puntito, y se puede poner una duración sin acorde debajo, " +
                "para cuando lo que importa es la figura.",
            ],
          },
        ],
      },
      {
        titulo: "Al buscar una canción",
        cambios: [
          {
            tipo: "arreglado",
            titulo: "Ya salen todas.",
            detalle: [
              "La lista se cortaba en <strong>50</strong> y hay muchas más. Faltaban unas veinte, " +
                "y nada lo avisaba.",
            ],
          },
          {
            tipo: "nuevo",
            titulo: "Cada canción muestra todas sus categorías.",
            detalle: [
              "Antes solo se veía una aunque tuviera dos — <em>Amigo De Dios</em> es Ofrenda " +
                "<strong>y</strong> Alabanzas. Son <strong>13</strong> canciones así.",
            ],
          },
          {
            tipo: "nuevo",
            titulo: "Botón «Pantalla completa» en cada canción.",
            detalle: [
              "El mismo visor que se usa en los cultos: columnas, tamaño automático y subir o " +
                "bajar el tono al vuelo.",
            ],
          },
          {
            tipo: "nuevo",
            titulo: "Pasar a la siguiente sin volver al listado.",
            detalle: [
              "Con los botones <strong>‹ ›</strong> o con las flechas <strong>← →</strong> del " +
                "teclado, en la vista normal y a pantalla completa. Y respeta el filtro: si estás " +
                "mirando <em>Alabanzas</em>, pasas a la siguiente de Alabanzas.",
            ],
          },
          {
            tipo: "nuevo",
            titulo: "Las teclas + y − cambian el tamaño de la letra.",
            detalle: [
              "En el computador, sin tener que buscar el botón. En el teléfono siguen estando los " +
                "botones de siempre, arriba.",
            ],
          },
        ],
      },
      {
        titulo: "En el culto",
        cambios: [
          {
            tipo: "nuevo",
            titulo: "Una canción puede ir varias veces en el mismo culto.",
            detalle: [
              "Las que hagan falta, y <strong>cada vez con su propio tono y su propia nota</strong>. " +
                "Antes la página lo impedía sin decir por qué.",
            ],
          },
          {
            tipo: "nuevo",
            titulo: "El enlace del culto sabe quién lo abre.",
            detalle: [
              "Es el mismo enlace para todos. Si <strong>no tienes cuenta</strong>, ves el " +
                "repertorio como siempre. Si <strong>tienes cuenta</strong>, ves además un botón " +
                "para abrir el culto completo y puedes entrar en cada canción — antes te quedabas " +
                "en la lista sin poder pasar.",
            ],
          },
          {
            tipo: "nuevo",
            titulo: "Sin cuenta también se puede elegir claro u oscuro y el tamaño de la letra.",
          },
          {
            tipo: "nuevo",
            titulo: "Aviso por WhatsApp cuando el repertorio está listo.",
            detalle: ["Con el enlace del culto dentro, para abrirlo directo desde el mensaje."],
          },
        ],
      },
      {
        titulo: "El PDF del culto",
        cambios: [
          {
            titulo: "Antes bajaba solo la lista de canciones. Ahora se lleva el culto entero.",
            detalle: ["Título, autor y tono era todo lo que traía."],
          },
          {
            tipo: "nuevo",
            titulo: "Cada canción en su hoja, con todos sus acordes y su estructura.",
            detalle: ["Y <strong>en el tono en el que se va a tocar</strong>, no en el original."],
          },
          {
            tipo: "nuevo",
            titulo: "Claro u oscuro, horizontal o vertical.",
            detalle: [
              "<strong>Claro u oscuro:</strong> el oscuro se lee mejor en pantalla, en cualquier " +
                "aparato; el claro es el que sirve si hay que sacarlo en papel.",
              "<strong>Horizontal o vertical:</strong> la horizontal es la que cabe mejor y la que " +
                "sale sola desde el computador. La vertical está para el teléfono, que siempre " +
                "guarda así.",
              "<strong>Lo que elijas se recuerda</strong> para la próxima vez. Y se puede bajar " +
                "desde el computador o desde el teléfono, con cuenta o con el enlace del culto sin " +
                "tenerla.",
            ],
          },
        ],
      },
      {
        // 🔴 Se llamaba solo «En el teléfono» y Isaac avisó el 2026-08-21:
        // «hace creer que es solamente en teléfono». Las tres cosas de aquí
        // funcionan igual en el computador. Un título que excluye sin querer
        // hace que la mitad de la gente ni lo lea.
        titulo: "En el teléfono y en el computador",
        cambios: [
          {
            tipo: "nuevo",
            titulo: "El tamaño de letra se queda guardado, canción por canción.",
            detalle: [
              "Y es <strong>tuyo</strong>: lo que tú ajustes no le cambia el tamaño a ningún otro " +
                "músico.",
              "Funciona en <strong>el teléfono, la tablet y el computador</strong>, y en cada uno " +
                "guarda el tamaño que le convenga a esa pantalla — lo que se lee bien en un " +
                "computador se queda pequeño en el móvil.",
            ],
          },
          {
            tipo: "nuevo",
            titulo: "Dos maneras de leer las columnas.",
            detalle: [
              "<strong>Por filas</strong> —izquierda, derecha, y luego abajo— que es como se venía " +
                "haciendo; o <strong>por columnas</strong>, la primera entera de arriba abajo y " +
                "después la siguiente. Según cómo esté escrita la canción, una de las dos se lee " +
                "bastante mejor.",
              "Está en la barra de arriba de la pantalla completa, al lado del botón de las " +
                "columnas, <strong>lo mismo en el teléfono que en el computador</strong>.",
              "Lo pidió uno de ustedes.",
            ],
          },
          {
            tipo: "nuevo",
            titulo: "El logotipo de la iglesia, en los dos sitios.",
            detalle: [
              "En la <strong>pestaña del navegador</strong> —donde antes salía el mundito gris de " +
                "siempre— y en el <strong>icono de la aplicación</strong> si te la instalas.",
            ],
          },
        ],
      },
    ],
  },
];
