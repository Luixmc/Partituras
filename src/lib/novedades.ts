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
  /**
   * Una tabla dentro del cambio.
   *
   * 🔴 `comparativa: true` es lo que hace que la columna del MEDIO salga
   * tachada, como «lo que decía antes». **Hay que pedirlo**: antes se tachaba
   * siempre la del medio, por POSICIÓN, y en cuanto llegó una tabla de datos
   * normales —«la canción va en / tú lees / cuántas hay»— salió tachado justo
   * el dato importante. Lo vio Isaac el 2026-08-22.
   */
  tabla?: { cabecera: string[]; filas: string[][]; comparativa?: boolean };
};

export type Seccion = {
  titulo: string;
  /**
   * Una línea de «qué vas a encontrar aquí», para el mapa de arriba.
   *
   * 🔴 Es lo que pidió Isaac el 2026-08-21 leyendo la página: «creo que el
   * orden mejor sería mencionar los cambios por secciones y que de ahí se
   * desglosen los demás… veo que hay algunos enredos». Sin esto, el mapa
   * sería una lista de títulos que no dice si te interesa entrar.
   */
  resumen: string;
  cambios: Cambio[];
};

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
    "fecha": "4 de septiembre de 2026",
    "iso": "2026-09-04",
    "entrada": "En el telefono a pantalla completa ya se ven todos los acordes, y tocar uno ya no te pasa de cancion.",
    "secciones": [
      {
        "titulo": "En el telefono ya no te tapan los acordes",
        "resumen": "A pantalla completa las barras de arriba y de abajo se encogieron, y tocar un acorde ya no te pasa de cancion.",
        "cambios": [
          {
            "tipo": "arreglado",
            "titulo": "Tocar un acorde de la parte de abajo ya no te pasa a la siguiente cancion.",
            "detalle": [
              "Las barras de arriba y de abajo <strong>flotaban por encima de los acordes</strong> y se escondian solas. Al tocar un acorde de la franja de abajo, el dedo las despertaba primero y el toque acababa cayendo en el boton «Siguiente»: <strong>se te pasaba la cancion en mitad del culto</strong>. Arriba pasaba lo mismo con los botones del tono.",
              "<strong>Ahora las barras tienen su propio sitio y ya no se montan encima de la cancion</strong>, asi que ningun toque en un acorde puede acabar en un boton."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "Las barras se encogieron: te devuelven un tercio de la pantalla.",
            "detalle": [
              "Medido en un telefono en horizontal (1200 x 540 puntos), que es como lo usa Isaac: las barras ocupaban <strong>200 puntos de 540</strong> —un 37 % de la pantalla— y ademas tapaban los acordes que quedaban debajo. Ahora ocupan <strong>74</strong>, y <strong>no tapan nada</strong>.",
              "La barra de arriba pasa de <strong>tres filas a una</strong>: salir, la cancion y el tono, que es lo que hay que ver mientras se toca."
            ],
            "tabla": {
              "cabecera": [
                "",
                "Antes",
                "Ahora"
              ],
              "filas": [
                [
                  "La barra de arriba",
                  "135 puntos (tres filas)",
                  "37 puntos (una fila)"
                ],
                [
                  "La barra de abajo",
                  "65 puntos",
                  "37 puntos"
                ],
                [
                  "Sitio libre para los acordes",
                  "340 puntos, y con acordes tapados debajo",
                  "466 puntos, todos a la vista"
                ]
              ],
              "comparativa": true
            }
          },
          {
            "tipo": "nuevo",
            "titulo": "El tono, el tamaño, las columnas y tu instrumento estan ahora detras de la chapa del tono.",
            "detalle": [
              "A pantalla completa, <strong>pulsa la chapa del tono</strong> —la que dice «E», «G»…— y se abren los mandos de siempre: subir y bajar medio tono, el tamaño de la letra, las columnas, la letra y la melodia, y tu instrumento. Se cierran pulsando otra vez o tocando fuera.",
              "<strong>El tono sigue siempre a la vista</strong>, porque es lo que se mira de un vistazo mientras se toca."
            ]
          }
        ]
      },
      {
        "titulo": "Las secciones con casillas ya pasan al lado",
        "resumen": "Una seccion con casillas de 1ª y 2ª vez se apretaba en su cuadro en vez de pasar al siguiente.",
        "cambios": [
          {
            "tipo": "arreglado",
            "titulo": "Las casillas { }1 { }2 no dejaban que la seccion pasara al cuadro siguiente.",
            "detalle": [
              "La seccion se apretaba en dos filas dentro de su propio cuadro. Se veia sobre todo <strong>en el telefono</strong>.",
              "La causa: la pagina contaba <strong>cuantos compases caben en una fila</strong>… y no todos miden lo mismo. Medido en «Es Por Tu Gracia»: los compases normales miden entre 104 y 161 pixeles, y <strong>la casilla de 2ª vez mide 526 — ella sola llena la fila entera</strong>.",
              "<strong>Ahora la pagina mide el ANCHO de cada compas</strong>, no cuantos son. En esa cancion pasa de 2 cuadros apretados a <strong>3 que caben perfectos</strong>. ✅ Y donde todos los compases miden igual no cambia nada: ocho con sitio para seis se siguen repartiendo 4 y 4."
            ]
          }
        ]
      },
      {
        "titulo": "El signo de repeticion, en su sitio",
        "resumen": "En 22 canciones el «:|» se iba solo a otra linea en vez de cerrar el compas.",
        "cambios": [
          {
            "tipo": "arreglado",
            "titulo": "El «:|» se quedaba colgando en una linea aparte.",
            "detalle": [
              "Pasaba en <strong>22 canciones</strong>, y se veia sobre todo <strong>en el telefono</strong> al agrandar la letra para aprovechar la pantalla: el signo del final de la repeticion se iba debajo de los acordes, solo.",
              "La causa: cuando el <code>:|</code> va pegado a una casilla de 1ª/2ª vez, la pagina creaba <strong>un compas vacio</strong> que solo llevaba el signo — y ese hueco contaba como un compas mas al repartir la seccion. <strong>Ahora el signo cierra el compas anterior</strong>, como en una partitura.",
              "✅ <strong>No se perdio nada:</strong> se compararon las 72 canciones y las 13 versiones en otro tono una a una — los <strong>3.388 acordes</strong> siguen ahi y las <strong>330 repeticiones</strong> tambien."
            ]
          }
        ]
      },
      {
        "titulo": "Ya no se pierde lo que estas escribiendo",
        "resumen": "Crear una cancion, escribir una melodia o tocar una version ya avisan antes de que se pierda.",
        "cambios": [
          {
            "tipo": "arreglado",
            "titulo": "Al crear una cancion nueva ya no se pierde el trabajo.",
            "detalle": [
              "Antes escribias el titulo, el tono y <strong>todos los acordes</strong>, pulsabas «volver» o cerrabas la pestaña… <strong>y se perdia todo, sin avisar</strong>. Ahora pregunta antes de salir.",
              "Y lo mismo con <strong>la melodia</strong> y con <strong>las versiones en otro tono</strong>, que se guardan con su propio boton."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "Cambiar de pestaña tambien cuenta como salir.",
            "detalle": [
              "Ir de «Melodia» a «Letra» —o de «Edicion» a «Melodia»— <strong>se llevaba por delante lo que no habias guardado</strong>. Ahora pregunta."
            ]
          }
        ]
      },
      {
        "titulo": "Los avisos ya son de la pagina",
        "resumen": "Cuando la pagina pregunta antes de borrar algo, sale con su propio diseno y el boton en rojo.",
        "cambios": [
          {
            "tipo": "nuevo",
            "titulo": "Se acabo el cartel gris del navegador.",
            "detalle": [
              "Cuando la pagina te pregunta algo antes de borrar, ya sale con <strong>su propio diseno</strong> — el mismo cuadro del aviso de «Cambios sin guardar». Antes salia el cartel del navegador, ese que empieza con «partituras-blush.vercel.app dice…».",
              "<strong>Y el boton que borra sale en ROJO.</strong> Es la unica pista que se lee <strong>antes</strong> de pulsar: con todo del mismo color, eliminar un culto se veia igual que guardar cambios.",
              "Vale en los tres sitios donde la pagina pregunta: al eliminar un culto, al eliminar una version en otro tono, y al regenerar los acordes de una version — este ultimo <strong>ahora avisa de que se pierden los ajustes que hayas hecho a mano</strong>. La tecla Escape cierra el aviso."
            ]
          }
        ]
      },
      {
        "titulo": "Instalala como app",
        "resumen": "Se instala desde el propio navegador, sin bajar nada de ninguna tienda, y ya gira de lado.",
        "cambios": [
          {
            "tipo": "nuevo",
            "titulo": "Se puede instalar en el telefono, en la tablet y en el computador.",
            "detalle": [
              "Se abre <strong>como una app</strong>: con su icono y <strong>sin la barra de direcciones</strong> del navegador. No hay que bajar nada de ninguna tienda.",
              "<strong>Android: tiene que ser con CHROME.</strong> Menu de tres puntos → «Anadir a pantalla de inicio» → <strong>«Instalar»</strong>. Con <strong>Brave</strong> el boton dice lo mismo pero <strong>no instala la app</strong>: deja un acceso directo que abre dentro del navegador, con el escudito de Brave en el icono.",
              "<strong>Se sabe que fue bien por tres cosas:</strong> sale un aviso de «Anadiendo Partituras…» con barra de progreso, el icono queda <strong>limpio, sin escudo</strong>, y aparece <strong>en el menu de aplicaciones</strong> con las demas — no solo en el escritorio.",
              "<strong>Computador</strong> (Chrome, Edge): un icono de instalar <strong>en la barra de direcciones</strong>, a la derecha.",
              "<strong>iPhone</strong>: tiene que ser con <strong>Safari</strong> — Compartir → <strong>«Anadir a pantalla de inicio»</strong>."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "La app se quedaba en vertical.",
            "detalle": [
              "Estaba puesta para abrirse <strong>solo de pie</strong>, asi que girabas el telefono y no pasaba nada — y en el culto se lee <strong>de lado</strong>.",
              "Ahora <strong>sigue al aparato</strong>: lo giras y gira. Vertical para buscar una cancion, horizontal para tocar.",
              "⚠️ <strong>Si ya la tenias instalada, desinstalala y vuelve a instalarla.</strong> Esa configuracion se lee <strong>al instalar</strong>, asi que la copia que ya tengas puesta no se entera sola."
            ]
          },
          {
            "titulo": "Se actualiza sola, pero todavia no sirve sin internet.",
            "detalle": [
              "Con internet siempre pide lo ultimo al servidor, asi que ves los cambios sin hacer nada.",
              "⚠️ Lo que <strong>no</strong> hace: la app abre sin datos, pero <strong>las canciones no cargan</strong>, porque viven en el servidor."
            ]
          }
        ]
      }
    ]
  },
  {
    "fecha": "3 de septiembre de 2026",
    "iso": "2026-09-03",
    "entrada": "Empieza la parte de la melodia en pentagrama, para la trompeta. Todavia no esta abierta.",
    "nota": "<strong>Para tocar hoy no cambia nada.</strong> Esto es una parte nueva que todavia no esta abierta, y se cuenta aqui para que sepas que viene.",
    "secciones": [
      {
        "titulo": "La melodia en pentagrama (en preparacion)",
        "resumen": "Se puede escribir la melodia de una cancion nota por nota, y leerla en el tono de la trompeta.",
        "cambios": [
          {
            "tipo": "nuevo",
            "titulo": "La melodia se escribe sobre un pentagrama de verdad, con el raton.",
            "detalle": [
              "Nota por nota, <strong>pinchando</strong> —o con el dedo en la tablet—: poner, mover, borrar, insertar en medio, deshacer, sostenidos y bemoles, silencios, ligaduras y las ocho duraciones.",
              "Quien prefiera teclearla tambien puede: hay un boton para <strong>escribirla a mano</strong>."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "Va por secciones, como la letra.",
            "detalle": [
              "Se escribe seccion por seccion —Intro, A, Coro— con las etiquetas <strong>ya puestas</strong>, para que quien toca <strong>sepa por donde va</strong>. La seccion que se quede vacia es que no se toca ahi."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "Se lee «como suena» o «como la lee la trompeta».",
            "detalle": [
              "Un tono arriba y con su armadura, para que <strong>la trompeta no tenga que transportar de cabeza</strong>."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "A pantalla completa, un boton que va rotando: acordes → letra → melodia.",
            "detalle": [
              "Es el mismo boton de la letra, ahora con <strong>una parada mas</strong>. Solo aparece en las canciones que tengan algo que enseñar, y <strong>se queda en el modo que elijas</strong> al pasar de cancion."
            ]
          },
          {
            "titulo": "Todavia no esta abierta.",
            "detalle": [
              "Aparece solo para quien administra, mientras se escriben las melodias. Cuando esten, <strong>se abre para todos</strong> — igual que se hizo con las letras."
            ]
          }
        ]
      }
    ]
  },
  {
    "fecha": "2 de septiembre de 2026",
    "iso": "2026-09-02",
    "entrada": "Las secciones largas se acomodan solas a la pantalla, y las canciones cortas por fin la llenan.",
    "secciones": [
      {
        "titulo": "Las secciones largas se acomodan solas",
        "resumen": "Escribes la sección entera y la página la reparte; ya no hay que partirla en dos a mano.",
        "cambios": [
          {
            "tipo": "nuevo",
            "titulo": "Ya no hace falta partir una sección en dos para que quepa.",
            "detalle": [
              "Escribes la sección <strong>entera</strong> —tu <code>[C]</code> con sus ocho compases, sin repetir la etiqueta— y la página <strong>mira cuántos compases caben en una línea y la reparte sola</strong> entre los cuadros.",
              "Lo que sigue cae en el cuadro siguiente, respetando cómo tengas puesta la lectura (por filas o por columnas), y el trozo que continúa se marca con <strong>«(sigue)»</strong> para que no te pierdas.",
              "<strong>Se adapta al aparato y al tamaño de letra:</strong> en el computador a pantalla completa una sección de diez compases sale en dos cuadros de cinco; con la ventana a la mitad, en cuatro más pequeños; y en el teléfono, donde no cabría bien de ninguna manera, <strong>se deja entera</strong> como se ha visto siempre."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "Si tú marcas el corte, manda el tuyo.",
            "detalle": [
              "Escribiendo un <code>;</code> dentro de la sección, ahí se corta y la página <strong>no la reorganiza</strong>. Sirve para cuando el corte es una decisión musical y no de espacio."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "Y la repetición queda mejor escrita.",
            "detalle": [
              "Al partir sola, el <code>|:</code> abre en el primer cuadro y el <code>:|</code> cierra en el último: <strong>una sola repetición</strong>, no dos, que es lo que salía al partirlo a mano."
            ]
          }
        ]
      },
      {
        "titulo": "Los acordes aprovechan toda la pantalla",
        "resumen": "La cuadrícula llega de borde a borde, y ni los silencios ni las casillas de 1ª y 2ª vez se estiran de más.",
        "cambios": [
          {
            "tipo": "nuevo",
            "titulo": "La cuadrícula ya usa el ancho completo del monitor.",
            "detalle": [
              "Antes se paraba a mitad de camino y <strong>dejaba los lados en blanco</strong>, por mucho que agrandaras la ventana. Ahora llega de borde a borde: <strong>más compases por fila</strong> y menos hace falta que la sección se parta.",
              "Y el <strong>nombre del autor no sale al presentar</strong> —ni en pantalla completa ni fuera de ella—: ese renglón se lo lleva la música."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "Los silencios se comían el compás.",
            "detalle": [
              "Un silencio de compás entero se llevaba hasta el <strong>80% del ancho</strong> de una sección para dibujar un solo símbolo. Ahora cada compás ocupa según <strong>cuánto hay que dibujar</strong>, así que el silencio ocupa lo que un acorde."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "Las casillas de 1ª y 2ª vez hinchaban la sección.",
            "detalle": [
              "A lo ancho y a lo alto. El número de casilla era además <strong>más grande que los propios acordes</strong> y estiraba de alto toda la fila — por eso los compases de al lado salían con hueco arriba y abajo.",
              "Y un compás con silencio salía más alto que los demás: <strong>175 píxeles contra 155</strong>. Ahora todos miden exactamente lo mismo."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "Lo que no cabe pasa siempre a la casilla siguiente.",
            "detalle": [
              "Aunque sea <strong>un solo compás</strong>. Antes había un tope que dejaba algunas secciones sin repartir."
            ]
          }
        ]
      },
      {
        "titulo": "Las canciones cortas ya llenan la pantalla",
        "resumen": "El ajuste automático de tamaño tenía un tope y se quedaba corto.",
        "cambios": [
          {
            "tipo": "arreglado",
            "titulo": "Una canción con poca estructura se quedaba pequeña.",
            "detalle": [
              "Quedaba <strong>media pantalla en blanco</strong> por más que quisieras agrandarla: el ajuste automático chocaba contra un tope. Ahora puede crecer <strong>el doble</strong> que antes."
            ]
          }
        ]
      }
    ]
  },
  {
    "fecha": "28 de agosto de 2026",
    "iso": "2026-08-28",
    "entrada": "Dos cosas que estorbaban al escribir: una al meter una canción nueva y otra al ponerle la letra.",
    "secciones": [
      {
        "titulo": "Al crear o editar una canción",
        "resumen": "La vista previa ya separa las secciones también cuando la canción es nueva.",
        "cambios": [
          {
            "tipo": "arreglado",
            "titulo": "Al crear una canción, la vista previa no separaba las secciones.",
            "detalle": [
              "Salía <strong>todo en una sola cuadrícula</strong>, con <code>[Intro]</code>, <code>[Coro]</code> y demás dibujados dentro como si fueran acordes.",
              "Al editar una canción ya guardada sí funcionaba. Ahora <strong>funciona en las dos</strong>: cada sección con su título encima, igual que al leerla."
            ]
          }
        ]
      },
      {
        "titulo": "Al escribir las letras",
        "resumen": "El campo se estira con el texto, sin tener que arrastrar la esquina.",
        "cambios": [
          {
            "tipo": "arreglado",
            "titulo": "El campo de la letra no crecía solo.",
            "detalle": [
              "Había que <strong>arrastrar la esquina de abajo</strong> para ver lo que llevabas escrito. Ahora se estira con el texto, igual que el de los acordes."
            ]
          }
        ]
      }
    ]
  },
  {
    "fecha": "22 de agosto de 2026",
    "iso": "2026-08-22",
    "entrada": "Un arreglo que se nota tocando, algo nuevo para quien toca trompeta, y unas cuantas cosas de debajo del capó.",
    "secciones": [
      {
        "titulo": "Al escribir las letras",
        "resumen": "Pasar de canción ya no te saca de la pestaña, y avisa antes de perder lo que llevabas escrito.",
        "cambios": [
          {
            "tipo": "arreglado",
            "titulo": "Pasar de canción te sacaba de la pestaña «Letra».",
            "detalle": [
              "Estabas escribiendo la letra, pulsabas <strong>siguiente</strong> y la página te devolvía a los acordes. Había que volver a entrar en Letra en cada canción.",
              "Ahora <strong>se queda en la pestaña en la que estás</strong>, y vale igual para Vista, Edición y Letra — vengas del catálogo o de un culto."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "Y lo peor: pasar de canción PERDÍA la letra sin avisar.",
            "detalle": [
              "El aviso de <strong>«tienes cambios sin guardar»</strong> solo funcionaba en el modo de editar acordes, no en el de la letra. Escribías una estrofa, pulsabas la flecha, y el texto se iba sin decir nada.",
              "Ahora avisa en los dos. Y <strong>«descartar»</strong>, que descartaba todo menos la letra, también quedó arreglado."
            ]
          }
        ]
      },
      {
        "titulo": "Al leer los acordes",
        "resumen": "El tono al que transportas ya se escribe como se lee: nada de acordes en bemoles cuando la canción está en sostenidos.",
        "cambios": [
          {
            "tipo": "arreglado",
            "titulo": "Al subir o bajar el tono, los acordes salían mal escritos.",
            "detalle": [
              "Si bajabas una canción de <code>F</code> a <code>E</code>, arriba ponía <strong>Tono: E</strong> — bien — pero debajo los acordes salían <code>Dbm</code>, <code>Gbm7</code>, <code>Abm7</code>. Estaban escritos como si el tono fuera <code>Fb</code>, y <strong>nadie toca en Fb</strong>.",
              "Ahora la página mira <strong>el tono al que llegas</strong>, no del que sales: en <code>E</code> salen <code>C#m</code>, <code>F#m7</code>, <code>G#m7</code>, que es como se leen. Vale para las 75 canciones y para las 12 tonalidades."
            ],
            "tabla": {
              "cabecera": [
                "De F a E",
                "Decía",
                "Ahora dice"
              ],
              "filas": [
                [
                  "el segundo acorde",
                  "Dbm",
                  "C#m"
                ],
                [
                  "el tercero",
                  "Gbm7",
                  "F#m7"
                ],
                [
                  "el del bajo",
                  "Ab/C",
                  "G#/C"
                ]
              ],
              "comparativa": true
            }
          }
        ]
      },
      {
        "titulo": "Si tocas trompeta",
        "resumen": "La página te da la canción en TU tono, para que no tengas que transportar de cabeza.",
        "cambios": [
          {
            "tipo": "nuevo",
            "titulo": "Elige «Trompeta» y ves la canción en tu tono.",
            "detalle": [
              "En la barra de arriba, a pantalla completa, hay <strong>Tu instrumento: Como suena · Trompeta</strong>. Lo eliges una vez y se queda guardado en tu aparato.",
              "La trompeta <strong>suena un tono más grave de lo que lee</strong>. Así que si la canción va en <code>D</code> y tú tocas tu <code>D</code>, suena <code>C</code> — un tono por debajo del resto. Para que suene <code>D</code> tienes que leer <code>E</code>.",
              "Ahora <strong>esa cuenta la hace la página</strong>: eliges Trompeta y ya ves <code>E</code>, con todos los acordes cambiados. No transportas nada.",
              "Arriba salen <strong>los dos tonos</strong>: el que suena y el que tú lees. Así, cuando alguien diga «vamos en D», sabes que tú vas en E y nadie discute."
            ],
            "tabla": {
              "cabecera": [
                "La canción va en",
                "Tú lees",
                "Cuántas hay"
              ],
              "filas": [
                [
                  "D",
                  "E",
                  "14"
                ],
                [
                  "F",
                  "G",
                  "10"
                ],
                [
                  "E",
                  "F#",
                  "9"
                ],
                [
                  "C",
                  "D",
                  "7"
                ]
              ]
            }
          },
          {
            "titulo": "Sirve también para clarinete y saxo tenor.",
            "detalle": [
              "Son instrumentos <em>en Bb</em> igual que la trompeta, así que necesitan exactamente lo mismo."
            ]
          }
        ]
      },
      {
        "titulo": "Por dentro",
        "resumen": "No se ve al abrir la página, pero es lo que hace que no te sirva una versión vieja y que abrir un PDF no sea un riesgo.",
        "cambios": [
          {
            "tipo": "arreglado",
            "titulo": "La página podía quedarse con una copia vieja.",
            "detalle": [
              "El almacén que guarda la página para que cargue rápido <strong>no se limpiaba nunca</strong>. Si un día te fallaba la conexión, podía servirte una copia de hace meses. Ahora se renueva en cada actualización."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "Abrir un PDF podía ser un riesgo.",
            "detalle": [
              "El lector de PDF de la página tenía un fallo conocido: un archivo preparado a mala fe podía ejecutar código al abrirlo. Actualizado, junto con el motor de la página."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "El enlace «Regístrate» del inicio de sesión daba error.",
            "detalle": [
              "Llevaba a una página que no existe. Se quitó: <strong>las cuentas las crea quien administra</strong>, no hay registro abierto."
            ]
          }
        ]
      }
    ]
  },
  {
    "fecha": "21 de agosto de 2026",
    "iso": "2026-08-21",
    "entrada": "El día de los <strong>diagramas de acordes</strong>: tocas un acorde y ves cómo se hace. Y unos cuantos arreglos que salieron de probar la página como la ve un músico.",
    "secciones": [
      {
        "titulo": "Al leer los acordes",
        "resumen": "Tocas un acorde y se abre cómo se hace en piano, bajo o guitarra — el que tú elijas.",
        "cambios": [
          {
            "tipo": "nuevo",
            "titulo": "Toca cualquier acorde y ves cómo se toca.",
            "detalle": [
              "Con el dedo en el teléfono o con el ratón en el computador. Funciona en la vista normal y a pantalla completa.",
              "Arriba del recuadro eliges <strong>Piano</strong>, <strong>Bajo</strong> o <strong>Guitarra</strong>, y <strong>se ve el que elijas</strong>. En el piano se marcan las teclas; en el bajo, el mástil, con la nota del bajista señalada.",
              "Están <strong>los 1.894 acordes</strong> de las partituras, incluidos los raros."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "Y ahora también está la GUITARRA.",
            "detalle": [
              "En su pestaña sale el mástil: <strong>×</strong> es cuerda que no se toca, <strong>○</strong> es al aire, el punto es dónde pisar, y la barra es la cejilla. Debajo dice en qué traste va y en qué cuerda cae la fundamental.",
              "Se saben tocar <strong>1.892 de los 1.894 acordes</strong>. Los dos que faltan son raros de verdad, y <strong>a propósito no se dibuja nada</strong> en vez de inventar una postura: más vale no enseñar nada que enseñar algo que no suena."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "La página se acuerda de tu instrumento.",
            "detalle": [
              "Eliges <strong>Piano</strong>, <strong>Bajo</strong> o <strong>Guitarra</strong> una vez y ya se queda así: a partir de ahí tocas un acorde y ves <strong>directamente el tuyo</strong>, sin volver a elegir. Puedes mirar los otros cuando quieras, con un toque.",
              "Se guarda <strong>en tu aparato</strong>, así que cada músico tiene el suyo. En el teléfono puedes tener la guitarra y en el computador el piano, si te sirve así."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "El recuadro del acorde se metía debajo de la barra de abajo.",
            "detalle": [
              "Al tocar un acorde de la parte de abajo de la canción, el recuadro tapaba la barra de secciones y los botones de tamaño y de claro/oscuro — y ahí ya no se podía hacer nada. Ahora <strong>nunca baja de esa barra</strong>."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "A pantalla completa no salían los diagramas.",
            "detalle": [
              "Tocabas el acorde y no aparecía nada — justo en la pantalla que se usa tocando. Ya sale igual que en la vista normal."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "Las notas del acorde estaban mal escritas.",
            "detalle": [
              "Un <code>Bb</code> decía tener las notas <code>A#</code>, <code>D</code>, <code>F</code>. Es la misma tecla, pero no es como se escribe. Pasaba con todo lo que llevara bemol."
            ],
            "tabla": {
              "cabecera": [
                "Acorde",
                "Decía",
                "Ahora dice"
              ],
              "filas": [
                [
                  "Bb",
                  "A# · D · F",
                  "Bb · D · F"
                ],
                [
                  "Gm",
                  "G · A# · D",
                  "G · Bb · D"
                ],
                [
                  "Cm7",
                  "C · D# · G · A#",
                  "C · Eb · G · Bb"
                ]
              ],
              "comparativa": true
            }
          }
        ]
      },
      {
        "titulo": "Al buscar una canción",
        "resumen": "Las tarjetas ocupan menos y caben más de un vistazo.",
        "cambios": [
          {
            "tipo": "nuevo",
            "titulo": "Las tarjetas ocupan menos y caben más de un vistazo.",
            "detalle": [
              "Sobraba hueco dentro de cada una: fuera la fila que ponía «Canción» en todas y el botón de «Ver canción», que repetía lo que ya hace tocar la tarjeta. Cada una pasó de unos <strong>185 a unos 110 píxeles</strong> de alto, <strong>sin quitar información</strong>."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "Al salir de pantalla completa volvías a la canción de antes.",
            "detalle": [
              "Si entrabas por una canción, pasabas dos o tres y cerrabas, la página te devolvía a <strong>la primera</strong> — y se perdía por dónde ibas, que en mitad de un culto es lo peor que puede pasar.",
              "Ahora sales <strong>en la canción que estabas viendo</strong>."
            ]
          }
        ]
      },
      {
        "titulo": "En el culto",
        "resumen": "Entrando por un culto, las flechas recorren su repertorio y no las 75 canciones.",
        "cambios": [
          {
            "tipo": "arreglado",
            "titulo": "Desde un culto, «la siguiente» era del catálogo entero.",
            "detalle": [
              "Abrías el culto, entrabas en una canción y las flechas te paseaban por las <strong>75 canciones</strong> de la página en vez de por las del repertorio. En mitad de un servicio, eso es lo contrario de lo que hace falta.",
              "Ahora, al entrar desde un culto, <strong>lo que se recorre es el repertorio de ese culto</strong> — en su orden — y el botón de volver te devuelve <strong>al culto</strong>, no al listado de canciones. Vale igual a pantalla completa."
            ]
          }
        ]
      }
    ]
  },
  {
    "fecha": "20 de agosto de 2026",
    "iso": "2026-08-20",
    "entrada": "El día en que se retomó la página después de dos meses parada. Casi todo son <strong>cosas que estaban mal y ya no lo están</strong>: figuras que se leían con el doble de duración, ligaduras que no se dibujaban, y el tono de arriba diciendo otra cosa que los acordes.",
    "secciones": [
      {
        "titulo": "Al leer los acordes",
        "resumen": "Las figuras, las ligaduras y el tono de arriba: lo que se leía mal, ya se lee bien.",
        "cambios": [
          {
            "tipo": "arreglado",
            "titulo": "La negra con puntillo se leía como una blanca con puntillo.",
            "detalle": [
              "Se dibujaba con la cabeza hueca, y hueca con puntillo <em>es</em> una blanca con puntillo. Quien la leyera le daba el doble de duración."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "La corchea con puntillo salía sin su corchete."
          },
          {
            "tipo": "arreglado",
            "titulo": "Las ligaduras, en tres cosas distintas.",
            "detalle": [
              "El arco <strong>se quedaba corto</strong> cuando los dos acordes no medían lo mismo. Cuando la ligadura <strong>pasaba a la línea siguiente</strong> —al otro lado de la barra de compás— no se dibujaba nada. Y en <em>Si Dios Dice Que Si</em> se cortaba en el guion en vez de llegar hasta el acorde."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "Una ligadura puede abarcar varios acordes.",
            "detalle": [
              "Sale un solo arco largo del primero al último, pasando por encima de los del medio."
            ]
          },
          {
            "tipo": "arreglado",
            "titulo": "El tono que sale arriba, en pantalla completa.",
            "detalle": [
              "Una canción en <code>Bm</code> mostraba <code>B</code>, y son dos tonalidades distintas: afectaba a <strong>17 de las 75</strong> canciones. Y una en <code>Bb</code> mostraba <code>A#</code>: otras <strong>4</strong>."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "El disminuido se dibuja con su símbolo.",
            "detalle": [
              "Se ve <code>°</code> y <code>°7</code>. Se sigue escribiendo <code>dim</code>, como siempre."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "El staccato y las duraciones sueltas.",
            "detalle": [
              "El staccato sale con su puntito, y se puede poner una duración sin acorde debajo, para cuando lo que importa es la figura."
            ]
          }
        ]
      },
      {
        "titulo": "Al buscar una canción",
        "resumen": "Ya salen las 75 —antes se quedaban en 50— y se pasa de una a otra sin volver al listado.",
        "cambios": [
          {
            "tipo": "arreglado",
            "titulo": "Ya salen todas.",
            "detalle": [
              "La lista se cortaba en <strong>50</strong> y hay muchas más. Faltaban unas veinte, y nada lo avisaba."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "Cada canción muestra todas sus categorías.",
            "detalle": [
              "Antes solo se veía una aunque tuviera dos — <em>Amigo De Dios</em> es Ofrenda <strong>y</strong> Alabanzas. Son <strong>13</strong> canciones así."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "Botón «Pantalla completa» en cada canción.",
            "detalle": [
              "El mismo visor que se usa en los cultos: columnas, tamaño automático y subir o bajar el tono al vuelo."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "Pasar a la siguiente sin volver al listado.",
            "detalle": [
              "Con los botones <strong>‹ ›</strong> o con las flechas <strong>← →</strong> del teclado, en la vista normal y a pantalla completa. Y respeta el filtro: si estás mirando <em>Alabanzas</em>, pasas a la siguiente de Alabanzas."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "Las teclas + y − cambian el tamaño de la letra.",
            "detalle": [
              "En el computador, sin tener que buscar el botón. En el teléfono siguen estando los botones de siempre, arriba."
            ]
          }
        ]
      },
      {
        "titulo": "En el culto",
        "resumen": "Repetir una canción las veces que haga falta, el enlace para quien no tiene cuenta, y avisar al grupo por WhatsApp.",
        "cambios": [
          {
            "tipo": "nuevo",
            "titulo": "Una canción puede ir varias veces en el mismo culto.",
            "detalle": [
              "Las que hagan falta, y <strong>cada vez con su propio tono y su propia nota</strong>. Antes la página lo impedía sin decir por qué."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "El enlace del culto sabe quién lo abre.",
            "detalle": [
              "Es el mismo enlace para todos. Si <strong>no tienes cuenta</strong>, ves el repertorio como siempre. Si <strong>tienes cuenta</strong>, ves además un botón para abrir el culto completo y puedes entrar en cada canción — antes te quedabas en la lista sin poder pasar."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "Sin cuenta también se puede elegir claro u oscuro y el tamaño de la letra."
          },
          {
            "tipo": "nuevo",
            "titulo": "Aviso por WhatsApp cuando el repertorio está listo.",
            "detalle": [
              "Con el enlace del culto dentro, para abrirlo directo desde el mensaje."
            ]
          }
        ]
      },
      {
        "titulo": "El PDF del culto",
        "resumen": "Antes bajaba solo la lista de títulos. Ahora se lleva las canciones enteras, con sus acordes, una por hoja.",
        "cambios": [
          {
            "titulo": "Antes bajaba solo la lista de canciones. Ahora se lleva el culto entero.",
            "detalle": [
              "Título, autor y tono era todo lo que traía."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "Cada canción en su hoja, con todos sus acordes y su estructura.",
            "detalle": [
              "Y <strong>en el tono en el que se va a tocar</strong>, no en el original."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "Claro u oscuro, horizontal o vertical.",
            "detalle": [
              "<strong>Claro u oscuro:</strong> el oscuro se lee mejor en pantalla, en cualquier aparato; el claro es el que sirve si hay que sacarlo en papel.",
              "<strong>Horizontal o vertical:</strong> la horizontal es la que cabe mejor y la que sale sola desde el computador. La vertical está para el teléfono, que siempre guarda así.",
              "<strong>Lo que elijas se recuerda</strong> para la próxima vez. Y se puede bajar desde el computador o desde el teléfono, con cuenta o con el enlace del culto sin tenerla."
            ]
          }
        ]
      },
      {
        "titulo": "En el teléfono y en el computador",
        "resumen": "El tamaño de letra se queda guardado, hay dos maneras de leer las columnas, y el logo de la iglesia sale en la pestaña.",
        "cambios": [
          {
            "tipo": "nuevo",
            "titulo": "El tamaño de letra se queda guardado, canción por canción.",
            "detalle": [
              "Y es <strong>tuyo</strong>: lo que tú ajustes no le cambia el tamaño a ningún otro músico.",
              "Funciona en <strong>el teléfono, la tablet y el computador</strong>, y en cada uno guarda el tamaño que le convenga a esa pantalla — lo que se lee bien en un computador se queda pequeño en el móvil."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "Dos maneras de leer las columnas.",
            "detalle": [
              "<strong>Por filas</strong> —izquierda, derecha, y luego abajo— que es como se venía haciendo; o <strong>por columnas</strong>, la primera entera de arriba abajo y después la siguiente. Según cómo esté escrita la canción, una de las dos se lee bastante mejor.",
              "Está en la barra de arriba de la pantalla completa, al lado del botón de las columnas, <strong>lo mismo en el teléfono que en el computador</strong>.",
              "Lo pidió uno de ustedes."
            ]
          },
          {
            "tipo": "nuevo",
            "titulo": "El logotipo de la iglesia, en los dos sitios.",
            "detalle": [
              "En la <strong>pestaña del navegador</strong> —donde antes salía el mundito gris de siempre— y en el <strong>icono de la aplicación</strong> si te la instalas."
            ]
          }
        ]
      }
    ],
    "nota": "Todo lo de aquí vale igual en el <strong>teléfono</strong>, en la <strong>tablet</strong> y en el <strong>computador</strong>. Donde algo cambie según el aparato, se dice."
  }
];
