"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Send, Share2 } from "lucide-react";

import { formatServiceDate } from "@/lib/services";

// Bloque del enlace público de un culto: el interruptor, la dirección, «Copiar»
// y «Avisar» por WhatsApp.
//
// Vive aparte porque `ServiceEditor` pasa de las 800 líneas y esto es un asunto
// suyo, cerrado: el enlace, quién lo ve y cómo se comparte.
//
// ⚠️ HOY SOLO LO VE EL ADMINISTRADOR. Se llegó a probar a enseñárselo también a
// músicos y lectores —para que pudieran pasar el enlace ellos—, e **Isaac lo
// descartó** el 2026-08-20: *«mejor que a ellos no les aparezca, solo al
// admin»*. El componente admite `canEdit=false` por si algún día cambia de
// opinión, pero **nadie lo usa así**.

type Props = {
  /** Token público del culto. Sin él no hay nada que compartir. */
  publicToken: string | null;
  /** ¿El culto está compartido ahora mismo? */
  isPublic: boolean;
  /** Solo el administrador ve el interruptor y puede cambiarlo. */
  canEdit: boolean;
  /** Para el texto del aviso. */
  serviceName: string;
  serviceDate: string | null;
  /** Cambia el estado. Solo se llama si `canEdit`. */
  onToggle?: () => void | Promise<void>;
  toggling?: boolean;
};

export default function ShareBox({
  publicToken,
  isPublic,
  canEdit,
  serviceName,
  serviceDate,
  onToggle,
  toggling = false,
}: Props) {
  const [copied, setCopied] = useState(false);

  // La dirección se arma en el navegador, con el origen real: así vale igual en
  // el equipo de casa que en la página publicada.
  const [publicUrl, setPublicUrl] = useState("");
  useEffect(() => {
    if (publicToken) setPublicUrl(`${window.location.origin}/s/${publicToken}`);
  }, [publicToken]);

  /**
   * Enlace que abre WhatsApp con el aviso ya escrito (O-22).
   *
   * Es un enlace `wa.me`, no una integración: no hace falta cuenta de empresa,
   * ni plantillas aprobadas, ni pagar por mensaje. Y tiene una ventaja que
   * Isaac pidió expresamente — «para cerciorarme que lo estoy enviando bien al
   * grupo que es»: WhatsApp deja elegir el destinatario antes de enviar, así
   * que el aviso no sale solo a nadie por error.
   */
  const avisoWhatsApp = useMemo(() => {
    if (!publicUrl) return null;
    const fecha = formatServiceDate(serviceDate || null);
    const texto = [
      `*${serviceName || "Culto"}*`,
      fecha ? fecha.charAt(0).toUpperCase() + fecha.slice(1) : null,
      "",
      "Ya está el repertorio en la página de la iglesia:",
      publicUrl,
    ]
      .filter((l): l is string => l !== null)
      .join("\n");
    return `https://wa.me/?text=${encodeURIComponent(texto)}`;
  }, [publicUrl, serviceName, serviceDate]);

  async function copyLink() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* sin portapapeles: se puede copiar a mano del propio campo */
    }
  }

  // Quien no puede editar y llega a un culto sin compartir no ve nada: no hay
  // enlace que dar, y enseñar un cuadro vacío solo confunde.
  if (!canEdit && !isPublic) return null;

  return (
    <div className="mb-6 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Enlace público
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {canEdit
                ? "Comparte el culto (solo lectura) con quien no tiene cuenta."
                : "Puedes compartir este culto con quien no tiene cuenta."}
            </p>
          </div>
        </div>

        {/* El interruptor es solo del administrador (O-24). */}
        {canEdit && (
          <button
            type="button"
            onClick={() => onToggle?.()}
            disabled={toggling}
            role="switch"
            aria-checked={isPublic}
            className={
              "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 " +
              (isPublic ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-600")
            }
          >
            <span
              className={
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform " +
                (isPublic ? "translate-x-6" : "translate-x-1")
              }
            />
          </button>
        )}
      </div>

      {isPublic && publicUrl && (
        <div className="mt-3 flex items-center gap-2">
          <input
            readOnly
            value={publicUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          />
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
          {avisoWhatsApp && (
            <a
              href={avisoWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              title="Abre WhatsApp con el aviso escrito; tú eliges a quién se lo mandas"
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <Send className="h-4 w-4" />
              Avisar
            </a>
          )}
        </div>
      )}
    </div>
  );
}
