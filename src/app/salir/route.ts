import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Cierra la sesión y devuelve al login.
 *
 * 🔴 POR QUÉ EXISTE ESTA RUTA: un componente de servidor —como el layout del
 * panel— **no puede escribir cookies**, así que puede redirigir pero no puede
 * cerrar la sesión. Un manejador de ruta sí.
 *
 * La usa el layout cuando encuentra una cuenta desactivada (P-01): sin cerrar
 * la sesión, la persona se quedaría dando vueltas entre el panel y el login.
 *
 * Se conserva el motivo (`?cuenta=desactivada`) para que el login pueda
 * explicar lo que pasó en vez de aparecer pelado.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = request.nextUrl.searchParams.get("cuenta") === "desactivada"
    ? "?cuenta=desactivada"
    : "";
  return NextResponse.redirect(url);
}
