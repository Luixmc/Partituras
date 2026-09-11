"use client";

// ─────────────────────────────────────────────────────────────
// El editor de MELODÍA: se escribe con el ratón sobre el pentagrama (O-57 R.1).
//
// Isaac eligió esta forma el 2026-09-02 —«la opción b»— sobre teclear el texto.
// El texto sigue siendo lo que se GUARDA (ver `lib/melodia.ts`); esto es la
// forma cómoda de escribirlo.
//
// 🔴 NO DIBUJA LA PARTITURA FINAL, y es a propósito. Este pentagrama es **para
// pinchar**: rejilla regular, una nota por columna, todo del mismo ancho. El
// dibujo bonito —vigas, espaciado real, claves— lo hace el grabador de verdad
// con el ABC que sale de aquí. Mezclar las dos cosas obligaría a escribir un
// motor de partitura, que es justo lo que no se quiere mantener.
//
// ⚠️ Con `PointerEvent`, no con eventos de ratón, y por lo que ya enseñó O-37:
// el arrastrar-y-soltar de ratón **no funciona con el dedo**, y esto se va a
// usar también desde una tablet.
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DURACIONES,
  melodiaAbc,
  type Alteracion,
  type Elemento,
  alturaMidi,
  armaduraDibujada,
} from "@/lib/melodia";
import { NoteFigure, RestFigure } from "@/components/sheets/MusicFigures";
import { figuraDe } from "@/lib/figuras";
import { cn } from "@/lib/utils";
import { INSTRUMENTOS, guardarInstrumento, tocarNota, useInstrumento, useVolumen } from "@/lib/sonido";

type Props = {
  elementos: Elemento[];
  onChange: (elementos: Elemento[]) => void;
  /** Alto del pentagrama en píxeles. */
  alto?: number;
  /** El tono de la canción: sin él, en Re mayor el fa sonaría natural (O-75). */
  tono?: string | null;
};

// ── La geometría del pentagrama editable ──
//
// Un escalón es MEDIO espacio de pentagrama, que es como se mueve una nota al
// subir o bajar una línea. Todo lo demás sale de aquí.
const PASO = 10; // píxeles por escalón
const BASE = 170; // dónde cae el do central (paso 0)
const COL = 44; // ancho de cada columna
const IZQ_CLAVE = 52; // sitio para la clave
// La ARMADURA (O-77) va tras la clave y empuja las notas a la derecha: cada
// alteración ocupa esto, más un respiro para que el ♯ propio de la primera
// nota no se pegue al último de la armadura.
const X_ARMADURA = 44;
const ANCHO_ALTERACION = 13;
const RESPIRO_ARMADURA = 14;

const y = (paso: number) => BASE - paso * PASO;
const pasoDe = (py: number) => Math.round((BASE - py) / PASO);

// Las cinco líneas en clave de sol son mi(2) sol(4) si(6) re(8) fa(10).
const LINEAS = [2, 4, 6, 8, 10];

export default function EditorMelodia({ elementos, onChange, alto = 260, tono }: Props) {
  const [sel, setSel] = useState<number | null>(null);
  const [duracion, setDuracion] = useState(2);
  const [alteracion, setAlteracion] = useState<Alteracion>(null);
  const [fantasma, setFantasma] = useState<{ i: number; paso: number } | null>(null);
  const [deshacer, setDeshacer] = useState<Elemento[][]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const arrastrando = useRef(false);

  // ── La armadura del tono (O-77) ──
  //
  // Isaac, 2026-09-10: «agnus dei es en D, por lo tanto que el pentagrama tenga
  // ya alterado tanto F como C en #». Lo que SUENA ya la respetaba desde la
  // fase 1 de O-75; faltaba que se VIERA. Sale de la misma cuenta
  // (`armaduraDibujada`), así que dibujo y sonido no pueden contradecirse.
  // 🔴 `izq` es DÓNDE EMPIEZAN LAS NOTAS, y lo usan a la vez el dibujo y el
  // clic: si solo se moviera el dibujo, pinchar pondría la nota una columna
  // más allá de donde se ve (el mismo tipo de fallo que el de `puntoDe`).
  const armaduraPintada = useMemo(() => armaduraDibujada(tono), [tono]);
  const izq = armaduraPintada.length
    ? X_ARMADURA + armaduraPintada.length * ANCHO_ALTERACION + RESPIRO_ARMADURA
    : IZQ_CLAVE;

  /** Todo cambio pasa por aquí, para que SIEMPRE se pueda deshacer. */
  const cambiar = useCallback(
    (nuevos: Elemento[]) => {
      setDeshacer((d) => [...d.slice(-49), elementos]);
      onChange(nuevos);
    },
    [elementos, onChange]
  );

  const atras = () => {
    setDeshacer((d) => {
      if (!d.length) return d;
      onChange(d[d.length - 1]);
      setSel(null);
      return d.slice(0, -1);
    });
  };

  // ── Dónde se ha pinchado ──
  //
  // 🔴 SE LE PREGUNTA AL NAVEGADOR (`getScreenCTM`), NO SE CALCULA A MANO.
  //
  // Isaac, 2026-09-03: *«tengo que hacer la melodía con el ratón a una
  // distancia, y cuando me acerco no puedo hacer nada»*. Y tenía toda la razón:
  // la cuenta a mano estaba mal, y de una forma que solo se ve usándolo.
  //
  // Lo que fallaba: este SVG lleva `preserveAspectRatio="… meet"`, que escala el
  // dibujo por **la dimensión que se queda corta** —aquí la ALTURA, que está
  // fija— y luego lo **pega a la izquierda**. Así que el dibujo ocupa solo una
  // parte del ancho del elemento. La cuenta vieja hacía
  // `viewBox.width / rect.width`, o sea daba por hecho que el dibujo se estiraba
  // de lado a lado. **No se estira.**
  //
  // → La X salía COMPRIMIDA: para señalar una nota había que pinchar como al
  // doble de distancia hacia la derecha, y encima de las notas no pasaba nada.
  // 📌 Y la Y acertaba **de casualidad**, porque la altura sí era la dimensión
  // que mandaba — por eso las notas caían a la altura correcta y solo el lado
  // estaba desplazado. Eso es lo que hacía el fallo tan raro de describir.
  //
  // `getScreenCTM()` es la matriz que usa el propio navegador para pintar: ya
  // lleva dentro el `viewBox`, el `preserveAspectRatio` y cualquier
  // transformación de CSS. Reimplementarla a mano es apostar a acertar las tres.
  const puntoDe = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { i: Math.floor((p.x - izq) / COL), paso: pasoDe(p.y) };
  };

  const alBajar = (e: React.PointerEvent) => {
    const p = puntoDe(e);
    if (!p) return;
    if (p.i >= 0 && p.i < elementos.length) {
      // Sobre algo que ya existe: se SELECCIONA y empieza el arrastre.
      // 📌 Pinchar no mueve: mover es arrastrar. Si al pinchar se cambiara la
      // altura, corregir la duración de una nota la desafinaría sin querer.
      setSel(p.i);
      arrastrando.current = elementos[p.i].tipo === "nota";
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } else {
      // A la derecha del todo: se añade con lo que haya elegido en la barra.
      cambiar([...elementos, { tipo: "nota", paso: p.paso, alteracion, duracion, ligada: false }]);
      setSel(elementos.length);
    }
  };

  const alMover = (e: React.PointerEvent) => {
    const p = puntoDe(e);
    if (!p) return;
    setFantasma(p.i >= elementos.length ? { i: elementos.length, paso: p.paso } : null);
    if (!arrastrando.current || sel == null) return;
    const el = elementos[sel];
    if (el?.tipo !== "nota" || el.paso === p.paso) return;
    // Durante el arrastre NO se apila un «deshacer» por cada píxel: se cambia
    // directo. El punto de deshacer lo puso el `pointerdown`.
    const copia = [...elementos];
    copia[sel] = { ...el, paso: p.paso };
    onChange(copia);
  };

  const alSoltar = () => {
    arrastrando.current = false;
  };

  // ── Lo que hacen los botones, siempre sobre lo seleccionado ──
  const conSeleccion = (fn: (el: Elemento) => Elemento) => {
    if (sel == null || !elementos[sel]) return;
    const copia = [...elementos];
    copia[sel] = fn(copia[sel]);
    cambiar(copia);
  };

  const ponDuracion = (d: number) => {
    setDuracion(d);
    conSeleccion((el) => (el.tipo === "barra" ? el : { ...el, duracion: d }));
  };

  const ponAlteracion = (a: Alteracion) => {
    setAlteracion(a);
    conSeleccion((el) => (el.tipo === "nota" ? { ...el, alteracion: a } : el));
  };

  const alternarLigadura = () =>
    conSeleccion((el) => (el.tipo === "nota" ? { ...el, ligada: !el.ligada } : el));

  const insertar = (el: Elemento) => {
    const i = sel == null ? elementos.length : sel + 1;
    cambiar([...elementos.slice(0, i), el, ...elementos.slice(i)]);
    setSel(i);
  };

  const borrar = () => {
    if (sel == null) return;
    cambiar(elementos.filter((_, i) => i !== sel));
    setSel(null);
  };

  // ── Teclado: mover, afinar y borrar sin soltar el ratón ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Nunca robar teclas a un campo de escritura (mismo cuidado que O-20).
      const t = e.target as HTMLElement | null;
      if (t && /input|textarea|select/i.test(t.tagName)) return;
      if (sel == null) return;

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const d = e.key === "ArrowUp" ? 1 : -1;
        conSeleccion((el) => (el.tipo === "nota" ? { ...el, paso: el.paso + d } : el));
      } else if (e.key === "ArrowLeft") {
        setSel((s) => (s == null ? null : Math.max(0, s - 1)));
      } else if (e.key === "ArrowRight") {
        setSel((s) => (s == null ? null : Math.min(elementos.length - 1, s + 1)));
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        borrar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ── Que suene la nota (O-75, fase 1) ──
  //
  // Isaac: «que se pueda escuchar si correctamente esa es la nota que se está
  // colocando». Suena la nota SELECCIONADA cada vez que cambia su altura: al
  // ponerla, al subirla o bajarla con las flechas, al arrastrarla con el ratón
  // y al cambiarle la alteración. Todo eso pasa por sitios distintos del
  // código —`insertar`, `conSeleccion`, el arrastre—, así que se engancha a lo
  // que tienen en común: **que cambió la nota que está elegida**.
  //
  // 📌 Si solo cambia la DURACIÓN no vuelve a sonar: la altura es la misma, y
  // repetir el sonido en cada clic cansaría en vez de ayudar.
  const instrumento = useInstrumento();
  // El volumen del reproductor vale también aquí (O-75, fase 3).
  const volumen = useVolumen();
  const midiSel = sel == null ? null : alturaMidi(elementos, sel, tono);
  const ultimoSonido = useRef<string | null>(null);
  useEffect(() => {
    if (midiSel == null) {
      ultimoSonido.current = null;
      return;
    }
    const clave = `${sel}:${midiSel}`;
    if (clave === ultimoSonido.current) return;
    ultimoSonido.current = clave;
    void tocarNota(midiSel, instrumento, volumen);
  }, [sel, midiSel, instrumento, volumen]);

  const columnas = Math.max(elementos.length + 2, 14);
  const ancho = izq + columnas * COL;

  return (
    <div>
      {/* ── La barra de herramientas ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        {/* ── LAS 15 DURACIONES, en un cuadro de 5 × 3 (O-78) ──
            Isaac, 2026-09-10: «le faltan las otras duraciones… que los botones
            sean más grandes porque casi que no se ven, sobre todo las
            duraciones y si son corcheas con puntillos o no». Eligió él el
            cuadro: **una columna por figura, una fila por puntillos**, así la
            negra con doble puntillo está en la columna de la negra, abajo.
            📌 La figura es `NoteFigure`, la MISMA que se ve encima de los
            acordes: antes eran caracteres Unicode, diminutos, y el puntillo era
            un punto de texto que casi no se distinguía. */}
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Duración</div>
          <div className="grid grid-cols-[auto_repeat(5,auto)] items-center gap-1">
            {[0, 1, 2].map((puntillos) => (
              <Fila key={puntillos} puntillos={puntillos}>
                {DURACIONES.filter((d) => d.puntillos === puntillos).map((d) => (
                  <Boton key={d.valor} activo={duracion === d.valor} onClick={() => ponDuracion(d.valor)} titulo={d.nombre}>
                    {/* El alto de la figura va en `em`: con 18 px de letra, ~29 px. */}
                    <span className="flex items-center justify-center" style={{ fontSize: 18 }}>
                      <NoteFigure beats={d.valor / 2} />
                    </span>
                  </Boton>
                ))}
              </Fila>
            ))}
          </div>
        </div>

        {/* El instrumento lo elige cada músico y se recuerda en su navegador.
            «Sin sonido» está a propósito: en un ensayo tiene que poder callarse. */}
        <Grupo titulo="Sonido">
          {INSTRUMENTOS.map((i) => (
            <Boton key={i.id} activo={instrumento === i.id} onClick={() => guardarInstrumento(i.id)} titulo={i.nombre}>
              {i.icono}
            </Boton>
          ))}
        </Grupo>

        <Grupo titulo="Alteración">
          <Boton activo={alteracion === "sostenido"} onClick={() => ponAlteracion("sostenido")} titulo="Sostenido">♯</Boton>
          <Boton activo={alteracion === "bemol"} onClick={() => ponAlteracion("bemol")} titulo="Bemol">♭</Boton>
          <Boton activo={alteracion === "becuadro"} onClick={() => ponAlteracion("becuadro")} titulo="Becuadro">♮</Boton>
          <Boton activo={alteracion === null} onClick={() => ponAlteracion(null)} titulo="Sin alteración">–</Boton>
        </Grupo>

        <Grupo titulo="Poner">
          <Boton activo={false} onClick={() => insertar({ tipo: "silencio", duracion })} titulo="Silencio">𝄽</Boton>
          <Boton activo={false} onClick={() => insertar({ tipo: "barra" })} titulo="Barra de compás">|</Boton>
          <Boton activo={false} onClick={alternarLigadura} titulo="Ligar con la siguiente">⌒</Boton>
        </Grupo>

        <Grupo titulo="Corregir">
          <Boton activo={false} onClick={borrar} titulo="Borrar lo seleccionado">Borrar</Boton>
          <Boton activo={false} onClick={atras} titulo="Deshacer" apagado={deshacer.length === 0}>
            Deshacer
          </Boton>
        </Grupo>
      </div>

      {/* ── El pentagrama para pinchar ──
          🔴 EL PENTAGRAMA TIENE SU TAMAÑO Y LA CAJA SE DESPLAZA, en vez de
          encogerlo para que quepa. Antes iba a lo ancho del hueco con
          `preserveAspectRatio="… meet"`, y eso traía dos cosas malas:
            · **a partir de unas 26 notas TODO empezaba a hacerse pequeño**,
              porque al crecer el dibujo el navegador lo encogía para que
              cupiera. Justo cuando una melodía empieza a ser de verdad.
            · quedaba una franja en blanco a la derecha, sin pentagrama, que
              igualmente aceptaba clics.
          → Ahora la nota mide siempre lo mismo, se escriban 5 o 50, y la
          melodía larga **se desplaza de lado**, que es como se lee una
          partitura en papel. */}
      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-950">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${ancho} 300`}
        style={{ height: alto, width: (ancho * alto) / 300 }}
        className="block touch-none select-none"
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onPointerLeave={() => setFantasma(null)}
      >
        {LINEAS.map((p) => (
          <line key={p} x1={IZQ_CLAVE - 26} x2={ancho - 8} y1={y(p)} y2={y(p)} className="stroke-slate-700 dark:stroke-slate-300" strokeWidth="1.5" />
        ))}
        <text x={4} y={y(4.6)} fontSize="58" className="fill-slate-700 dark:fill-slate-200">𝄞</text>

        {/* La ARMADURA (O-77). `data-armadura` es para poder medirlo (§2.3-bis). */}
        <g data-armadura={armaduraPintada.map((a) => `${a.signo === "sostenido" ? "#" : "b"}${a.paso}`).join(" ")}>
          {armaduraPintada.map((a, k) => (
            <text
              key={k}
              x={X_ARMADURA + k * ANCHO_ALTERACION}
              y={y(a.paso) + 7}
              fontSize="22"
              className="fill-slate-900 dark:fill-slate-100"
            >
              {a.signo === "sostenido" ? "♯" : "♭"}
            </text>
          ))}
        </g>

        {/* La nota que sigue al puntero, para ver dónde va a caer */}
        {fantasma && (
          <ellipse cx={izq + fantasma.i * COL + 15} cy={y(fantasma.paso)} rx="11" ry="8.5" className="fill-brand-500" opacity="0.3" />
        )}

        {elementos.map((el, i) => (
          <Dibujo key={i} el={el} i={i} sel={sel === i} izq={izq} />
        ))}
      </svg>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Pincha a la derecha para <b>poner</b> una nota · pincha una para <b>seleccionarla</b> y
        arrástrala para <b>subirla o bajarla</b> · con la nota elegida, las flechas <b>↑ ↓</b> la
        afinan, <b>← →</b> cambian de nota y <b>Supr</b> la borra.
      </p>
    </div>
  );
}

// ── El dibujo de un elemento ──
function Dibujo({ el, i, sel, izq }: { el: Elemento; i: number; sel: boolean; izq: number }) {
  const cx = izq + i * COL + 15;

  if (el.tipo === "barra") {
    return (
      <line
        x1={cx}
        x2={cx}
        y1={y(10)}
        y2={y(2)}
        className={sel ? "stroke-brand-600" : "stroke-slate-700 dark:stroke-slate-300"}
        strokeWidth="3"
      />
    );
  }

  if (el.tipo === "silencio") {
    // 🔴 SE REUSA `RestFigure`, el silencio que Isaac eligió mirándolo (O-47 y
    // O-51). Dibujar aquí otro parecido sería tener el mismo signo escrito dos
    // veces — y este proyecto ya ha pagado tres veces ese patrón (P-09).
    // ⚠️ `RestFigure` cuenta en NEGRAS y aquí se cuenta en corcheas: de ahí el /2.
    return (
      <g>
        {sel && <rect x={cx - 18} y={y(11)} width="36" height={PASO * 10} className="fill-brand-100 dark:fill-brand-900/40" />}
        {/* 🔴 Va dentro de un `foreignObject` A PROPOSITO, y costó una captura
            averiguarlo: `RestFigure` fija su alto con un estilo en linea en
            `em`, y un `<svg>` anidado dentro de otro **no respeta eso** — el
            silencio salia del tamaño de media pantalla. El `foreignObject` le
            da una caja HTML normal, que es donde ese `em` significa algo. */}
        <foreignObject x={cx - 14} y={y(6) - 16} width="28" height="34">
          <div
            className={cn(
              "flex h-full w-full items-center justify-center",
              sel ? "text-brand-600" : "text-slate-900 dark:text-slate-100"
            )}
            style={{ fontSize: 16 }}
          >
            <RestFigure beats={el.duracion / 2} />
          </div>
        </foreignObject>
      </g>
    );
  }

  const cy = y(el.paso);
  // 🔴 La figura sale de `figuraDe` (O-78), la misma cuenta que dibuja las
  // figuras sobre los acordes. Antes eran comparaciones sueltas —`=== 1.5 || 3
  // || 6`— que solo conocían el puntillo simple: una negra con doble puntillo
  // se habría dibujado sin puntos, y una semicorchea con puntillo, con un solo
  // corchete. ⚠️ `figuraDe` cuenta en NEGRAS y aquí se cuenta en corcheas: /2.
  const { base, puntillos } = figuraDe(el.duracion / 2);
  const hueca = base >= 2;
  const conPlica = base < 4;
  const corchetes = base <= 0.25 ? 2 : base <= 0.5 ? 1 : 0;

  // 🔴 LA PLICA CAMBIA DE LADO EN LA LÍNEA DEL MEDIO, como en cualquier
  // partitura: de la tercera línea (el `B`, paso 6) hacia arriba baja por la
  // izquierda; por debajo, sube por la derecha. Sin esto las notas agudas
  // sacaban un palo larguísimo por encima del pentagrama y **no se leía como
  // música**, que es lo único que tiene que hacer esta pantalla.
  const abajo = el.paso >= 6;
  const lado = abajo ? -1 : 1;
  const plicaX = cx + 10 * lado;
  const plicaFin = cy + 58 * (abajo ? 1 : -1);

  return (
    <g>
      {sel && <rect x={cx - 18} y={y(11)} width="36" height={PASO * 10} className="fill-brand-100 dark:fill-brand-900/40" />}

      {/* Líneas adicionales cuando la nota se sale del pentagrama */}
      {rayasDe(el.paso).map((p) => (
        <line key={p} x1={cx - 17} x2={cx + 17} y1={y(p)} y2={y(p)} className="stroke-slate-700 dark:stroke-slate-300" strokeWidth="1.5" />
      ))}

      {/* ⚠️ La clase se escribe ENTERA, no con plantilla: Tailwind solo genera
          las que ve literales en el archivo, asi que una clase armada al vuelo
          sale sin color y la alteracion se volveria invisible — sin ni un error.
          📌 Y el comentario va AQUI FUERA: dentro de un `&& ( ... )` las llaves
          ya no son un comentario de JSX, son un objeto, y no compila. */}
      {el.alteracion && (
        <text
          x={cx - 32}
          y={cy + 7}
          fontSize="22"
          className={sel ? "fill-brand-600" : "fill-slate-900 dark:fill-slate-100"}
        >
          {el.alteracion === "sostenido" ? "♯" : el.alteracion === "bemol" ? "♭" : "♮"}
        </text>
      )}

      {/* 🔴 El relleno va en la CLASE, no en el atributo `fill`: una clase de CSS
          le gana siempre a un atributo de presentación, así que `fill="white"`
          no pintaba nada y **las blancas salían rellenas** — o sea, leídas como
          negras: la mitad de tiempo. Se vio en la captura, no en los números. */}
      <ellipse
        cx={cx}
        cy={cy}
        rx="11"
        ry="8.5"
        strokeWidth="2.5"
        className={cn(
          sel ? "stroke-brand-600" : "stroke-slate-900 dark:stroke-slate-100",
          hueca
            ? "fill-white dark:fill-slate-950"
            : sel
              ? "fill-brand-600"
              : "fill-slate-900 dark:fill-slate-100"
        )}
      />

      {conPlica && (
        <line
          x1={plicaX}
          x2={plicaX}
          y1={cy}
          y2={plicaFin}
          className={sel ? "stroke-brand-600" : "stroke-slate-900 dark:stroke-slate-100"}
          strokeWidth="2.5"
        />
      )}

      {/* Los corchetes cuelgan SIEMPRE a la derecha de la plica, y se doblan
          hacia el cuerpo de la nota — arriba o abajo según de qué lado vaya. */}
      {Array.from({ length: corchetes }, (_, k) => {
        const desde = plicaFin + (abajo ? -1 : 1) * k * 13;
        const curva = abajo ? -24 : 24;
        return (
          <path
            key={k}
            d={`M${plicaX} ${desde} q 15 ${curva / 3.4} 13 ${curva}`}
            className={sel ? "stroke-brand-600" : "stroke-slate-900 dark:stroke-slate-100"}
            strokeWidth="2.5"
            fill="none"
          />
        );
      })}

      {Array.from({ length: puntillos }, (_, k) => (
        <circle key={k} cx={cx + 20 + k * 8} cy={cy - 4} r="3" className={sel ? "fill-brand-600" : "fill-slate-900 dark:fill-slate-100"} />
      ))}
      {el.ligada && <path d={`M${cx + 4} ${cy + 16} q ${COL / 2} 14 ${COL - 8} 0`} className={sel ? "stroke-brand-600" : "stroke-slate-900 dark:stroke-slate-100"} strokeWidth="2" fill="none" />}
    </g>
  );
}

/** Las líneas adicionales que hacen falta para una nota fuera del pentagrama. */
function rayasDe(paso: number): number[] {
  const r: number[] = [];
  for (let p = 12; p <= paso; p += 2) r.push(p);
  for (let p = 0; p >= paso; p -= 2) r.push(p);
  return r;
}

/** Una fila del cuadro de duraciones, con su rótulo delante. */
function Fila({ puntillos, children }: { puntillos: number; children: React.ReactNode }) {
  return (
    <>
      <div className="pr-1 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">
        {puntillos === 0 ? "Sin puntillo" : puntillos === 1 ? "Puntillo" : "Doble puntillo"}
      </div>
      {children}
    </>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{titulo}</div>
      <div className="flex gap-1">{children}</div>
    </div>
  );
}

function Boton({
  activo,
  onClick,
  titulo,
  apagado = false,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  titulo: string;
  /** Un boton que no puede hacer nada se APAGA, no se esconde: si desaparece,
      la barra se mueve sola y se pierde donde estaba lo demas. */
  apagado?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={titulo}
      aria-label={titulo}
      onClick={onClick}
      disabled={apagado}
      // O-78: más grandes. Isaac: «casi que no se ven». ~44 px de alto, que es
      // además lo mínimo cómodo para pulsar con el dedo en la tablet.
      className={cn(
        "inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-lg border px-2.5 text-lg font-semibold transition",
        apagado && "cursor-not-allowed opacity-40",
        activo
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
      )}
    >
      {children}
    </button>
  );
}

/** Atajo para quien solo quiere el texto: el ABC de lo que hay dibujado. */
export function abcDe(elementos: Elemento[]) {
  return melodiaAbc(elementos);
}
