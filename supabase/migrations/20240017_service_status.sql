-- ============================================================
-- 017 · Estado del culto: borrador / publicado / archivado (O-31)
-- ============================================================
-- Isaac, 2026-08-21: «que sea como las canciones, que yo puedo crear una, pero
-- por ejemplo si está en archivado o borrador que no lo pueda ver ni el lector
-- ni el músico, solamente el admin, y ya si está público que lo puedan ver los
-- otros dos roles».
--
-- Se reutiliza el enum `public.sheet_status` (D-23): son los mismos tres
-- estados con el mismo significado, y un `service_status` paralelo sería un
-- segundo sitio que mantener sincronizado a mano.
--
-- ⚠️ Esto NO es `is_public` (migración 013). Aquel dice si el culto se puede
-- abrir SIN cuenta por su enlace; este dice quién lo ve dentro de la página.

-- ── 1 · La columna ───────────────────────────────────────────
-- El defecto es `draft` porque un culto nuevo se arma antes de enseñarlo, que
-- es lo que Isaac describió.
alter table public.services
  add column if not exists status public.sheet_status not null default 'draft';

-- ── 2 · Lo que YA existía nace PUBLICADO ─────────────────────
-- 🔴 Esta línea es la que evita repetir T-07. Sin ella, los cultos que hay hoy
-- en producción se quedarían en `draft` y **desaparecerían de golpe** para
-- músicos y lectores: sin error, sin aviso, exactamente como el catálogo vacío
-- de los 3 minutos. Va en la misma migración que el paso 1, así que no hay
-- ningún instante en el que un culto existente cuente como borrador.
update public.services set status = 'published';

-- ── 3 · La regla, EN LA BASE ─────────────────────────────────
-- Esconder la tarjeta no es un permiso (L-87). Las canciones ya están
-- protegidas así (`sheets_select_viewer`, 20240004:98) y esto es su copia
-- exacta para los cultos.
--
-- De propina tapa media P-02: un culto en borrador deja de ser legible con la
-- clave pública. ⚠️ Y por lo mismo, `npm run export` con la clave pública
-- dejará de bajarse los cultos en borrador — la copia hay que hacerla con la
-- sesión de administrador (SUPABASE_ACCESS_TOKEN), que ya se admite.
drop policy if exists "services_select_all" on public.services;

create policy "services_select_viewer"
  on public.services for select
  using (
    status = 'published'
    or created_by = auth.uid()
    or public.is_admin()
  );

comment on column public.services.status is
  'Borrador/publicado/archivado. Solo el admin ve los que no están publicados (O-31)';
