-- ============================================================
-- 011 · Solo los administradores crean/editan canciones
-- Los músicos y lectores solo pueden verlas (SELECT).
-- ============================================================

-- ── INSERT: solo admin ───────────────────────────────────────
drop policy if exists "sheets_insert_musician" on public.sheets;
drop policy if exists "sheets_insert_admin" on public.sheets;
create policy "sheets_insert_admin"
  on public.sheets for insert
  to authenticated
  with check (public.is_admin() and created_by = auth.uid());

-- ── UPDATE: solo admin ───────────────────────────────────────
drop policy if exists "sheets_update_own" on public.sheets;
drop policy if exists "sheets_update_admin" on public.sheets;
create policy "sheets_update_admin"
  on public.sheets for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- (SELECT y DELETE se mantienen: ver publicadas / borrar solo admin.)

-- ── Tabla de unión de categorías: escritura solo admin ───────
-- (Solo si la migración 010 ya creó la tabla.)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'sheet_categories'
  ) then
    drop policy if exists "sheet_categories_write_musician" on public.sheet_categories;
    drop policy if exists "sheet_categories_write_admin" on public.sheet_categories;
    create policy "sheet_categories_write_admin"
      on public.sheet_categories for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;
