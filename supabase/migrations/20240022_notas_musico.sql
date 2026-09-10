-- ─────────────────────────────────────────────────────────────
-- 022 · Las notas privadas de cada músico en una canción (O-74, opción D)
--
-- Isaac, 2026-09-07, eligiendo qué debe poder hacer un músico que un lector no:
-- «las notas privadas y armar cultos».
--
-- Son las suyas: «yo la toco en G», «entro en el segundo compás», «aquí subo
-- una octava». No las ve nadie más — ni el administrador.
--
-- ✅ APLICADA el 2026-09-10 con el OK de Isaac (en la base: `20260910202930
-- notas_musico`). Todavía no tiene pantalla.
--
-- ⚠️ Esta es de las SEGURAS: crea una tabla nueva y no toca ninguna política ya
-- existente, así que no puede dejar a nadie fuera. Es lo contrario de la
-- 20240020, que toca `is_admin()`.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.notas_musico (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  sheet_id   uuid not null references public.sheets(id)   on delete cascade,
  nota       text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, sheet_id)
);

comment on table public.notas_musico is
  'Notas privadas de cada musico sobre una cancion. Solo las ve su dueno.';

alter table public.notas_musico enable row level security;

-- ── Cada uno, SOLO las suyas ─────────────────────────────────
--
-- Las cuatro políticas dicen lo mismo —`user_id = auth.uid()`— y hacen falta
-- las cuatro: en Postgres, una tabla con RLS y sin política para una operación
-- la prohíbe entera. Es el mismo patrón que `favorites` (migración 005), que ya
-- está probado en producción.
--
-- 📌 Y el administrador TAMPOCO las ve. Es a propósito: si las viera, dejarían
-- de ser privadas y el músico no escribiría en ellas lo que de verdad piensa.
create policy "notas_musico_select_own"
  on public.notas_musico for select
  to authenticated
  using (user_id = auth.uid());

create policy "notas_musico_insert_own"
  on public.notas_musico for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "notas_musico_update_own"
  on public.notas_musico for update
  to authenticated
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notas_musico_delete_own"
  on public.notas_musico for delete
  to authenticated
  using (user_id = auth.uid());
