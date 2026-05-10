-- ============================================================
-- 003 · Categories and tags
-- ============================================================

-- ── Categories ───────────────────────────────────────────────
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  description text,
  color       text not null default '#6366f1',  -- hex color for UI badges
  icon        text,                               -- lucide icon name
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.categories is
  'Musical categories for organizing sheet music';

insert into public.categories (name, description, color, sort_order) values
  ('Adoraciones', 'Canciones de adoracion congregacional', '#2563eb', 1),
  ('Alabanzas',   'Canciones de alabanza y celebracion',   '#16a34a', 2),
  ('Ofrenda',     'Canciones para el momento de ofrenda',   '#ca8a04', 3),
  ('Jovenes',     'Repertorio para jovenes',                '#db2777', 4),
  ('Especiales',  'Solos, grupos y participaciones',        '#7c3aed', 5);

-- ── Tags ─────────────────────────────────────────────────────
create table public.tags (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.tags is
  'Free-form tags for additional classification (key, tempo, occasion...)';

-- ── RLS ─────────────────────────────────────────────────────
alter table public.categories enable row level security;
alter table public.tags        enable row level security;

create policy "categories_select_all"
  on public.categories for select using (true);

create policy "categories_write_admin"
  on public.categories for all
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

create policy "tags_select_all"
  on public.tags for select using (true);

create policy "tags_insert_musician"
  on public.tags for insert
  to authenticated
  with check (public.get_my_role() in ('admin','musician'));

create policy "tags_delete_admin"
  on public.tags for delete
  to authenticated
  using (public.is_admin());
