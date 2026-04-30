"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
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

      <p className="text-center text-brand-300 text-sm mt-6">
        ¿No tienes cuenta?{" "}
        <Link href="/signup" className="text-white hover:underline font-medium">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
