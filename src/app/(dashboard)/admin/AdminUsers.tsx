"use client";

import { useState, useTransition } from "react";
import { UserPlus, KeyRound, ShieldCheck, Power, Loader2 } from "lucide-react";

import type { Profile, UserRole } from "@/types";
import {
  createUserAction,
  setPasswordAction,
  setRoleAction,
  setActiveAction,
  type ActionResult,
} from "./actions";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "viewer", label: "Lector" },
  { value: "musician", label: "Músico" },
  { value: "admin", label: "Administrador" },
];

const ROLE_LABEL: Record<UserRole, string> = {
  viewer: "Lector",
  musician: "Músico",
  admin: "Administrador",
};

type Props = {
  users: Profile[];
  currentUserId: string;
};

export default function AdminUsers({ users, currentUserId }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  // Formulario de creación.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");

  // Contraseñas nuevas por usuario (mapa id -> valor del input).
  const [pwInputs, setPwInputs] = useState<Record<string, string>>({});

  const flash = (result: ActionResult) => {
    if (result.ok) setMessage({ type: "ok", text: result.message ?? "Hecho." });
    else setMessage({ type: "error", text: result.error ?? "Error." });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await createUserAction({ email, password, firstName, lastName, role });
      flash(result);
      if (result.ok) {
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setRole("viewer");
      }
    });
  };

  const handleSetPassword = (userId: string) => {
    const value = pwInputs[userId] ?? "";
    setMessage(null);
    startTransition(async () => {
      const result = await setPasswordAction(userId, value);
      flash(result);
      if (result.ok) setPwInputs((prev) => ({ ...prev, [userId]: "" }));
    });
  };

  const handleSetRole = (userId: string, newRole: UserRole) => {
    setMessage(null);
    startTransition(async () => flash(await setRoleAction(userId, newRole)));
  };

  const handleToggleActive = (userId: string, active: boolean) => {
    setMessage(null);
    startTransition(async () => flash(await setActiveAction(userId, active)));
  };

  return (
    <div className="space-y-6">
      {message && (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Crear usuario */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-brand-600" />
          <h2 className="font-display font-semibold text-slate-800 dark:text-slate-100">Crear usuario</h2>
        </div>
        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="usuario@ejemplo.com"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Contraseña
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Mínimo 6 caracteres"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Nombre
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Apellido
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Rol
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Crear usuario
            </button>
          </div>
        </form>
      </section>

      {/* Lista de usuarios */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 font-display font-semibold text-slate-800 dark:text-slate-100">
          Usuarios ({users.length})
        </h2>
        <div className="space-y-3">
          {users.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <div
                key={u.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 lg:flex-row lg:items-center lg:justify-between dark:border-slate-700 dark:bg-slate-800/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {u.first_name} {u.last_name ?? ""}
                    {isSelf && <span className="ml-2 text-[10px] font-bold uppercase text-brand-600 dark:text-brand-300">(tú)</span>}
                    {!u.active && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                        Inactivo
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Rol */}
                  <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-800">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={u.role}
                      disabled={pending}
                      onChange={(e) => handleSetRole(u.id, e.target.value as UserRole)}
                      className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-200"
                      title="Cambiar rol"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {ROLE_LABEL[r.value]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cambiar contraseña */}
                  <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-800">
                    <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={pwInputs[u.id] ?? ""}
                      onChange={(e) => setPwInputs((prev) => ({ ...prev, [u.id]: e.target.value }))}
                      placeholder="Nueva contraseña"
                      className="w-32 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200"
                    />
                    <button
                      type="button"
                      disabled={pending || (pwInputs[u.id] ?? "").length < 6}
                      onClick={() => handleSetPassword(u.id)}
                      className="rounded bg-brand-600 px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  </div>

                  {/* Activar / desactivar */}
                  <button
                    type="button"
                    disabled={pending || isSelf}
                    onClick={() => handleToggleActive(u.id, !u.active)}
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      u.active
                        ? "border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-600 dark:border-slate-600 dark:text-slate-300"
                        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                    }`}
                    title={isSelf ? "No puedes desactivarte" : u.active ? "Desactivar" : "Activar"}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {u.active ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
