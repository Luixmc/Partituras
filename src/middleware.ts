import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rutas públicas: los cultos compartidos (/s/<token>) y el comunicado de
  // cambios (/novedades), que se manda al grupo de la iglesia y tiene que
  // abrirse SIN cuenta — es justo el motivo por el que existe (O-29).
  // `/signup` salió de aquí: esa página no existe y el enlace que llevaba a
  // ella se quitó (P-08). Dejarla en la lista solo abría un hueco a una ruta
  // fantasma.
  const publicRoutes = ["/login", "/s/", "/novedades"];
  const isPublic = publicRoutes.some((r) => pathname.startsWith(r));

  // Los enlaces compartidos son accesibles aunque haya sesión iniciada;
  // Solo /login redirige a /catalog cuando el usuario ya entro (P-08: /signup
  // no existe).
  const isAuthOnlyPublic = pathname.startsWith("/login");

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthOnlyPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/catalog";
    return NextResponse.redirect(url);
  }

  // ── Un usuario DESACTIVADO no entra (P-01) ─────────────────
  //
  // 🔴 Hasta hoy, «desactivar» solo escribia `profiles.active` y **nadie leia
  // ese campo nunca mas**: el usuario entraba igual, con todos sus permisos.
  // El boton apagaba la tarjeta y decia «Usuario desactivado», asi que parecia
  // que funcionaba — el peor tipo de fallo, porque solo se descubre el dia que
  // hace falta de verdad.
  //
  // Va aqui y no en el layout del panel por dos razones: el layout deja fuera
  // `/imprimir/culto/[id]`, que vive aparte, y un componente de servidor **no
  // puede escribir cookies**, asi que no podria cerrar la sesion.
  if (user && !isPublic) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("active")
      .eq("id", user.id)
      .maybeSingle();

    // 🔴 Se echa SOLO si `active` es exactamente `false`. Si la consulta falla,
    // si llega `null`, o si no hay fila, **se deja pasar**. Un fallo al leer un
    // permiso no puede convertirse en «fuera todo el mundo»: el precio de
    // equivocarse aqui es dejar al grupo sin pagina un domingo (L-121).
    if (perfil?.active === false) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "?cuenta=desactivada";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // manifest.json y sw.js quedan FUERA a propósito: el navegador los pide sin
    // sesión al instalar la aplicación, y si el middleware los redirige a
    // /login, la app instalada se queda sin manifiesto — y por tanto sin icono
    // ni nombre. Se descubrió al poner el logo de la iglesia (O-15).
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
