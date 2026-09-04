"use client";

// ─────────────────────────────────────────────────────────────
// La MELODÍA de una canción, sección por sección (O-57 R.2).
//
// Isaac: «que se pueda escribir la melodía y también las secciones para que
// sepa por dónde va». Así que esto NO es un pentagrama largo: es **un tramo por
// sección**, con su etiqueta encima — la Intro, la A, el puente. Un trompetista
// que no sabe dónde está no puede entrar a tiempo.
//
// 🔴 SE GUARDA APARTE DEL RESTO DE LA CANCIÓN, y esta es LA decisión del
// archivo. La letra viaja dentro del guardado general (`SongDetailEditor` mete
// `lyrics` en el mismo `update`), y copiar eso aquí habría sido un desastre:
// mientras la columna `melody` no exista, **meterla en ese `update` haría
// fallar el guardado de TODA la canción** — título, acordes y letra incluidos.
// O sea, un editor de acordes roto por una función que nadie está usando aún.
// Es T-07 en su versión más cara. → Botón propio, `update` propio, y si la
// columna no está, **se dice**.
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from "react";

import EditorMelodia from "@/components/sheets/EditorMelodia";
import Pentagrama from "@/components/sheets/Pentagrama";
import AutoTextarea from "@/components/ui/AutoTextarea";
import {
  andamioDeMelodia,
  melodiaAbc,
  melodiaDeTramos,
  parsearMelodia,
  tramosDe,
  type Elemento,
  type Tramo,
} from "@/lib/melodia";
import { createClient } from "@/lib/supabase/client";
import {
  TRANSPOSITORES,
  guardarTranspositor,
  leerTranspositor,
  semitonosDe,
} from "@/lib/transpositores";
import { cn } from "@/lib/utils";

type Props = {
  sheetId: string;
  /** El texto de acordes: de ahí salen las secciones del andamio. */
  contenidoAcordes: string;
  compas?: string | null;
  tono?: string | null;
  puedeEscribir: boolean;
  /** Avisa al editor de si hay melodía sin guardar, para que la proteja (O-61). */
  onSucio?: (sucio: boolean) => void;
};

type Estado = "cargando" | "listo" | "sin-columna";

// El ejemplo que se ve en el campo vacío. En plantilla de varias líneas a
// propósito: así no lleva ni un `\n` escapado — que se ha roto tres veces al
// escribir estos archivos por consola.
const EJEMPLO_ABC = `[Intro]
G2 G2 A2 G2 | c2 B4 z2 |`;

export default function MelodiaPanel({
  sheetId,
  contenidoAcordes,
  compas,
  tono,
  puedeEscribir,
  onSucio,
}: Props) {
  const [melodia, setMelodia] = useState("");
  const [guardado, setGuardado] = useState("");
  const [estado, setEstado] = useState<Estado>("cargando");
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [transpositor, setTranspositor] = useState("do");
  // R.3: la segunda via, para pegar o corregir a mano.
  const [modoTexto, setModoTexto] = useState(false);

  const sucio = melodia !== guardado;

  // 🔴 Avisa hacia FUERA de que hay melodía sin guardar (O-61).
  //
  // Este panel sabía que estaba sucio —lo usa para apagar su propio botón— pero
  // **no se lo decía a nadie**, así que el editor de la canción no podía
  // protegerlo: se escribía una melodía nota por nota, se pulsaba «volver», y
  // se perdía sin decir nada.
  // 📌 Es la lección de O-43 otra vez: un panel nuevo en una pantalla que YA
  // protege datos no hereda la red — hay que extendérsela a mano.
  useEffect(() => {
    onSucio?.(sucio);
  }, [sucio, onSucio]);

  // 🔴 Y al DESMONTARSE se avisa de que ya no hay nada que proteger aquí.
  // Sin esto, tras descartar y cambiar de pestaña el panel desaparece pero la
  // marca de «sucio» se quedaría puesta para siempre, y el editor creería que
  // hay cambios pendientes hasta recargar la página.
  useEffect(() => () => onSucio?.(false), [onSucio]);

  // Cada músico recuerda su instrumento, como el tamaño de letra (D-09b) y las
  // pestañas del acorde (O-42). Se lee tras montar porque el servidor no tiene
  // `localStorage`.
  useEffect(() => setTranspositor(leerTranspositor()), []);

  // ── Se pide la melodía APARTE, y aguantando que la columna no exista ──
  //
  // 📌 No va en la consulta que trae la canción a propósito: si `melody` entrara
  // en ese `select` y la columna no estuviera, **la canción entera dejaría de
  // cargar** — no es una pantalla en blanco, es la canción sin acordes.
  useEffect(() => {
    let vivo = true;
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sheets")
        .select("melody")
        .eq("id", sheetId)
        .single();
      if (!vivo) return;
      if (error) {
        // `42703` = esa columna no existe todavía.
        setEstado(error.code === "42703" ? "sin-columna" : "listo");
        return;
      }
      const texto = (data as { melody?: string | null })?.melody ?? "";
      setMelodia(texto);
      setGuardado(texto);
      setEstado("listo");
    })();
    return () => {
      vivo = false;
    };
  }, [sheetId]);

  const tramos = useMemo(() => tramosDe(melodia), [melodia]);

  const cambiarTramo = useCallback(
    (i: number, elementos: Elemento[]) => {
      const copia = [...tramosDe(melodia)];
      copia[i] = { ...copia[i], abc: melodiaAbc(elementos) };
      setMelodia(melodiaDeTramos(copia));
    },
    [melodia]
  );

  const traerSecciones = () => {
    const andamio = andamioDeMelodia(contenidoAcordes);
    if (!andamio) {
      setAviso("Esta canción no tiene secciones escritas en sus acordes.");
      return;
    }
    // Las que ya tienen melodía se respetan: el andamio solo AÑADE las que
    // faltan. Nunca borra lo escrito.
    const yaHay = new Map(tramosDe(melodia).map((t) => [t.titulo, t.abc]));
    const nuevos: Tramo[] = tramosDe(andamio).map((t) => ({
      titulo: t.titulo,
      abc: yaHay.get(t.titulo) ?? "",
    }));
    setMelodia(melodiaDeTramos(nuevos));
  };

  const guardar = async () => {
    setGuardando(true);
    setAviso(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("sheets")
      .update({ melody: melodia.trim() || null })
      .eq("id", sheetId);
    setGuardando(false);
    if (error) {
      // ⚠️ Se dice QUÉ pasa, no un «error» a secas. Si la columna no está, eso
      // no lo arregla el usuario reintentando.
      setAviso(
        error.code === "42703"
          ? "Todavía no se puede guardar: falta añadir la columna de melodía en la base de datos."
          : `No se pudo guardar: ${error.message}`
      );
      return;
    }
    setGuardado(melodia);
    setAviso("Melodía guardada.");
  };

  if (estado === "cargando") {
    return <p className="py-16 text-center text-slate-500 dark:text-slate-400">Cargando la melodía…</p>;
  }

  // ── Solo lectura: lo que ve quien toca ──
  if (!puedeEscribir) {
    if (!tramos.some((t) => t.abc)) {
      return (
        <p className="py-16 text-center text-slate-500 dark:text-slate-400">
          Esta canción todavía no tiene la melodía escrita.
        </p>
      );
    }
    return (
      <div className="space-y-6">
        <SelectorInstrumento valor={transpositor} onChange={(v) => { setTranspositor(v); guardarTranspositor(v); }} />
        {tramos.map((t, i) => (
          <Tramito key={i} titulo={t.titulo} abc={t.abc} compas={compas} tono={tono} semitonos={semitonosDe(transpositor)} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {estado === "sin-columna" && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <b>Todavía no se puede guardar.</b> Falta añadir la columna de melodía en la base de
          datos. Puedes escribir y ver el pentagrama, pero al guardar dará error.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={traerSecciones}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Traer las secciones
        </button>
        <button
          type="button"
          onClick={guardar}
          disabled={guardando || !sucio}
          className={cn(
            "rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition",
            guardando || !sucio ? "cursor-not-allowed bg-slate-300 dark:bg-slate-700" : "bg-brand-600 hover:bg-brand-700"
          )}
        >
          {guardando ? "Guardando…" : sucio ? "Guardar melodía" : "Guardado"}
        </button>
        <button
          type="button"
          onClick={() => setModoTexto((v) => !v)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {modoTexto ? "Volver al pentagrama" : "Escribir a mano"}
        </button>
        <SelectorInstrumento valor={transpositor} onChange={(v) => { setTranspositor(v); guardarTranspositor(v); }} />
      </div>

      {aviso && <p className="text-sm text-slate-600 dark:text-slate-300">{aviso}</p>}

      {/* ── R.3 · La segunda via: el texto ──
          🔴 NO es un modo aparte con sus propios datos: es EL MISMO texto que
          escribe el raton. Por eso se puede pegar una melodia de fuera, o
          arreglar a mano algo que el editor no deje hacer, y al volver al
          pentagrama esta ahi. Si fueran dos almacenes distintos, uno pisaria al
          otro el dia menos pensado.
          ⚠️ Usa `AutoTextarea`, que ya existe y crece con el texto sin dar el
          salto de scroll que costo O-45 y O-46. */}
      {modoTexto ? (
        <div>
          <AutoTextarea
            value={melodia}
            onChange={(e) => setMelodia(e.target.value)}
            spellCheck={false}
            placeholder={EJEMPLO_ABC}
            className="w-full rounded-xl border border-slate-300 p-3 font-mono text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            style={{ minHeight: "12rem" }}
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Cada nota es una letra —<b>mayúscula</b> la octava de abajo, <b>minúscula</b> la de
            arriba— y el número que va detrás es lo que dura: <b>2</b> negra, <b>4</b> blanca,{" "}
            <b>8</b> redonda. <code>|</code> separa compases, <code>z</code> es un silencio, y{" "}
            <code>[Nombre]</code> abre una sección.
          </p>
        </div>
      ) : tramos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
          Pulsa <b>«Traer las secciones»</b> y aparecerán las de esta canción, listas para
          escribirles la melodía.
        </p>
      ) : (
        tramos.map((t, i) => (
          <section key={i} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              {t.titulo ?? "Sin sección"}
            </h3>
            <EditorMelodia
              elementos={parsearMelodia(t.abc)}
              onChange={(els) => cambiarTramo(i, els)}
              alto={220}
            />
            {t.abc && (
              <Tramito abc={t.abc} compas={compas} tono={tono} semitonos={semitonosDe(transpositor)} />
            )}
          </section>
        ))
      )}
    </div>
  );
}

/** Un tramo dibujado como partitura de verdad. */
function Tramito({
  titulo,
  abc,
  compas,
  tono,
  semitonos,
}: {
  titulo?: string;
  abc: string;
  compas?: string | null;
  tono?: string | null;
  semitonos: number;
}) {
  return (
    <div className="mt-3">
      {titulo && (
        <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          {titulo}
        </h3>
      )}
      <Pentagrama
        elementos={parsearMelodia(abc)}
        compas={compas || "4/4"}
        tono={tono || "C"}
        transponer={semitonos}
      />
    </div>
  );
}

/**
 * Como suena · Trompeta.
 *
 * 🔴 El +2 NO se escribe aquí: sale de `lib/transpositores.ts`, que es donde ya
 * vive esa cuenta desde agosto (D-28). Escribirlo otra vez sería tener el mismo
 * número en dos sitios, y el día que cambie uno el otro miente.
 */
function SelectorInstrumento({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
      Lees como
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 px-2 py-1 text-sm font-normal normal-case text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        {TRANSPOSITORES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
