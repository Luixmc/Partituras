-- ============================================================
-- 013 · Compartir cultos con enlace público de solo lectura
-- ============================================================
-- Cada culto tiene un token único; al activar is_public, el culto
-- queda accesible (solo lectura) en /s/<token> sin necesidad de cuenta.
-- El token siempre existe; "compartir" simplemente activa/desactiva el acceso.

alter table public.services
  add column if not exists is_public   boolean not null default false,
  add column if not exists public_token uuid not null default uuid_generate_v4();

-- El token debe ser único para poder buscar el culto por él.
create unique index if not exists idx_services_public_token
  on public.services(public_token);
