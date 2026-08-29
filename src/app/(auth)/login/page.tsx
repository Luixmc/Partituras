"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  // 🔴 Se lee de la dirección AL MONTAR, no con `useSearchParams`. Esa página
  // se prerenderiza, y `useSearchParams` en una página estática obliga a
  // envolverla en `<Suspense>`: sin eso **el build falla**, y falla en la fase
  // de prerender, no al compilar. Para un aviso visual, leerlo tras montar
  // vale igual y no arrastra ese requisito.
  const [desactivada, setDesactivada] = useState(false);
  useEffect(() => {
    setDesactivada(new URLSearchParams(window.location.search).get("cuenta") === "desactivada");
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    router.push("/catalog");
    router.refresh();
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
      <h2 className="font-display text-xl font-semibold text-white mb-6">Iniciar sesión</h2>

      {/* Al desactivar una cuenta, el middleware cierra la sesión y trae aquí
          con `?cuenta=desactivada` (P-01). Sin este aviso, la persona vería el
          login sin más y creería que se le cayó la sesión: volvería a intentar
          entrar una y otra vez sin entender por qué. */}
      {desactivada && (
        <p className="mb-5 rounded-xl border border-amber-300/40 bg-amber-400/15 px-4 py-3 text-sm text-amber-100">
          <strong className="font-semibold">Tu cuenta está desactivada.</strong> Habla con quien
          lleva la página si crees que es un error.
        </p>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-brand-200 text-sm mb-1.5">Correo electrónico</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white
                       placeholder-white/40 focus:outline-none focus:border-brand-400 focus:bg-white/15
                       transition-all"
            placeholder="tu@correo.com"
          />
        </div>

        <div>
          <label className="block text-brand-200 text-sm mb-1.5">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white
                       placeholder-white/40 focus:outline-none focus:border-brand-400 focus:bg-white/15
                       transition-all"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-red-300 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed
                     text-white font-semibold py-3 rounded-xl transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-transparent"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {/* Antes aquí había un «Regístrate» que llevaba a `/signup` — una página
          que NO EXISTE: daba 404 en producción (P-08). No se ha creado, se ha
          quitado: en esta app **las cuentas las crea el administrador** desde
          `/admin`, y no debe haber registro abierto. Son las partituras de una
          iglesia, no un servicio público.

          Se deja el aviso porque quien llega sin cuenta necesita saber qué
          hacer; un hueco vacío le dejaría igual de perdido que el 404. */}
      <p className="text-center text-brand-300 text-sm mt-6">
        ¿No tienes cuenta? Pídesela a quien lleva la página.
      </p>
    </div>
  );
}
