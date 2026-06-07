-- ============================================================
-- 010 · Sheet ↔ Category junction (varias categorías por canción)
-- ============================================================
-- Permite agrupar una misma canción en varias categorías.
-- La columna sheets.category_id se conserva como "categoría principal"
-- (la primera seleccionada) por compatibilidad con el catálogo.

create table if not exists public.sheet_categories (
  sheet_id    uuid not null references public.sheets(id)     on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (sheet_id, category_id)
);

comment on table public.sheet_categories is
  'Relación N:N: una canción puede pertenecer a varias categorías';

create index if not exists idx_sheet_categories_category on public.sheet_categories(category_id);
create index if not exists idx_sheet_categories_sheet    on public.sheet_categories(sheet_id);

alter table public.sheet_categories enable row level security;

create policy "sheet_categories_select_all"
  on public.sheet_categories for select using (true);

create policy "sheet_categories_write_musician"
  on public.sheet_categories for all
  to authenticated
  using  (public.get_my_role() in ('admin','musician'))
  with check (public.get_my_role() in ('admin','musician'));

-- Backfill: copia la categoría única existente a la tabla de unión.
insert into public.sheet_categories (sheet_id, category_id)
select id, category_id
from public.sheets
where category_id is not null
on conflict do nothing;
