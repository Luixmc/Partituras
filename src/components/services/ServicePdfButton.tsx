import Link from "next/link";
import { FileDown } from "lucide-react";

/**
 * Botón para llevarse el culto en PDF o en papel.
 *
 * Antes generaba un PDF por dentro con la LISTA de canciones (título, autor y
 * tono) y nada más. Isaac pidió que trajera las canciones **completas, con sus
 * acordes y su estructura, en horizontal** (O-08), así que ahora lleva a la
 * hoja imprimible: allí se ve el culto entero, una canción por página, y el
 * propio diálogo de impresión ofrece «Guardar como PDF».
 *
 * El motivo de hacerlo así está en `PrintableService`: la cuadrícula de acordes
 * tendría que dibujarse dos veces —una para la pantalla y otra para el PDF— y
 * mantenerse las dos para siempre.
 */
export default function ServicePdfButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      title="Ver el culto completo para imprimir o guardar en PDF"
    >
      <FileDown className="h-4 w-4" />
      PDF
    </Link>
  );
}
