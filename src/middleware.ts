import { createServerClient, type SetAllCookies } from "@supabase/ssr";
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
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
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
  const publicRoutes = ["/login", "/s/", "/novedades", "/salir"];
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

  // ── P-01: la comprobacion de `active` NO va aqui ──
  //
  // 🔴 Estuvo aqui unas horas y **tumbo la pagina en produccion**:
  // `MIDDLEWARE_INVOCATION_TIMEOUT`. El middleware corre en el borde y se
  // ejecuta en CADA navegacion; consultar `profiles` le anadia un segundo viaje
  // a la base —que esta en Oregon— encima del `getUser()` que ya hace. Medido
  // con sesion: **13 segundos** en la primera peticion, y Vercel corta antes.
  //
  // → La comprobacion vive ahora en `(dashboard)/layout.tsx`, que **ya carga el
  // perfil entero**, asi que no cuesta ni una consulta mas. Ver §9.2-decies.
  //
  // 📌 La regla, que vale para cualquier cosa que se quiera poner aqui:
  // **el middleware se ejecuta en cada navegacion de cada usuario.** Lo que
  // aqui cuesta 200 ms, cuesta 200 ms SIEMPRE. No es sitio para ir a la base.

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
