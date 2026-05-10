// Este detalle de mosaico ha sido eliminado.
import { redirect } from "next/navigation";
export default function ObsoleteDetailPage({ params }: { params: { id: string } }) {
  redirect(`/catalog/${params.id}`);
}
