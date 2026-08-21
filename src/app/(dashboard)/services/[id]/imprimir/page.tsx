import { redirect } from "next/navigation";

/**
 * La hoja para PDF vivía aquí y se movió a `/imprimir/culto/[id]`, fuera del
 * panel, porque dentro el navegador no podía paginar (ver `PrintableService`).
 *
 * Esta página se queda solo para redirigir: quien tenga la dirección vieja
 * guardada o en el historial no se encuentra un 404. Le pasó a Isaac el mismo
 * día del cambio.
 */
export default function ImprimirCultoAntiguo({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/imprimir/culto/${params.id}`);
}
