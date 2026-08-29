// src/lib/supabase/server.ts
// Use this in Server Components, Server Actions, Route Handlers
import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — can be ignored
          }
        },
      },
    }
  );
}

// Admin client — only use in Server Actions / Route Handlers
export async function createAdminClient() {
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Sin esta clave, la librería lanza "supabaseKey is required", que no dice
  // nada de lo que hay que hacer. Todo el panel de administración depende de
  // ella, así que conviene explicarlo: en producción la tiene Vercel, y en el
  // equipo de casa hay que ponerla a mano en .env.local.
  if (!clave) {
    throw new Error(
      "Falta la clave SUPABASE_SERVICE_ROLE_KEY en .env.local. " +
        "Sin ella no se pueden crear usuarios ni cambiar nombres, roles o contraseñas " +
        "desde este equipo. Se saca del panel de Supabase → Settings → API → service_role. " +
        "(En la página publicada sí está configurada, así que allí el panel funciona.)"
    );
  }

  const { createClient: createServiceClient } = await import("@supabase/supabase-js");
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, clave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
