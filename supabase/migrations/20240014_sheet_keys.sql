-- ============================================================
-- 014 · Versiones por tonalidad de una canción (sheet_keys)
-- ============================================================
-- Cada canción del catálogo (sheets) tiene su tonalidad y contenido
-- "base". Esta tabla guarda VERSIONES adicionales en otras tonalidades
-- con sus propios acordes editables (se inicializan transponiendo el
-- contenido base, pero luego se pueden ajustar a mano). Un culto puede
-- referenciar una de estas versiones (service_songs.sheet_key_id) para
-- presentar exactamente esos acordes en vez de transponer al vuelo.

create table public.sheet_keys (
  id            uuid primary key default uuid_generate_v4(),
  sheet_id      uuid not null references public.sheets(id) on delete cascade,
  key_signature text not null,                  -- tono de esta versión, p.ej. "G", "Eb"
  content       text,                           -- acordes editables para este tono
  label         text,                           -- etiqueta opcional ("Voz femenina"...)
  sort_order    int  not null default 0,
  created_by    uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.sheet_keys is
  'Versiones de una canción en distintas tonalidades, con acordes editables';

create index idx_sheet_keys_sheet on public.sheet_keys(sheet_id, sort_order);

create trigger trg_sheet_keys_updated_at
  before update on public.sheet_keys
  for each row execute function public.set_updated_at();

-- ── Referencia desde el culto a una versión guardada ─────────
-- Si está presente, el culto presenta esa versión (sus acordes y tono).
-- Si es null, se usa key_override (transposición al vuelo) como hasta ahora.
alter table public.service_songs
  add column if not exists sheet_key_id uuid
    references public.sheet_keys(id) on delete set null;

-- ── RLS ──────────────────────────────────────────────────────
alter table public.sheet_keys enable row level security;

-- Se ven las versiones si la canción padre es visible para el usuario.
create policy "sheet_keys_select"
  on public.sheet_keys for select
  using (
    exists (
      select 1 from public.sheets s
      where s.id = sheet_id
        and (
          s.status = 'published'
          or s.created_by = auth.uid()
          or public.is_admin()
        )
    )
  );

-- Escritura (crear/editar/borrar): solo admin, igual que el catálogo (mig. 011).
create policy "sheet_keys_write"
  on public.sheet_keys for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
