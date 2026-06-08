import { redirect } from "next/navigation";
import { Settings } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";
import AdminUsers from "./AdminUsers";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Solo los administradores pueden entrar.
  if (me?.role !== "admin") redirect("/catalog");

  const { data: users } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, role, active, created_at, avatar_url, updated_at")
    .order("created_at", { ascending: true });

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-5 md:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Settings className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Administracion</h1>
            <p className="text-sm text-slate-500">Gestiona usuarios, contraseñas y roles.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl flex-1 p-4 md:p-8">
        <AdminUsers users={(users ?? []) as Profile[]} currentUserId={user.id} />
      </div>
    </div>
  );
}
