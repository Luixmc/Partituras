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
  ('Hymns',           'Traditional hymns',                     '#7c3aed', 1),
  ('Choruses',        'Contemporary praise choruses',          '#2563eb', 2),
  ('Worship',         'Contemplative worship music',           '#0891b2', 3),
  ('Special Music',   'Solos, duets and special presentations','#d97706', 4),
  ('Instrumental',    'Pieces without lyrics',                 '#059669', 5),
  ('Christmas',       'Christmas carols and seasonal music',   '#dc2626', 6),
  ('Easter',          'Holy Week and Easter music',            '#7e22ce', 7),
  ('Uncategorized',   'Sheets without a category',             '#6b7280', 99);

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
