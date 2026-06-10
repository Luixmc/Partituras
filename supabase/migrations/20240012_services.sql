-- ============================================================
-- 012 · Gestor de cultos (services) + categoría Santa Cena
-- ============================================================
-- Un "culto" (service) es un setlist: nombre + tipo + fecha opcional
-- + lista ordenada de canciones. Solo los administradores los crean y
-- editan; el resto de usuarios autenticados solo los ven.

-- ── Nueva categoría de canción: Santa Cena ───────────────────
insert into public.categories (name, description, color, sort_order)
values ('Santa Cena', 'Canciones para la mesa del Señor', '#9333ea', 6)
on conflict (name) do nothing;

-- ── Tipo de culto ────────────────────────────────────────────
create type public.service_type as enum (
  'viernes',
  'domingo',
  'ayuno',
  'santa_cena',
  'otro'
);

-- ── Cultos ───────────────────────────────────────────────────
create table public.services (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  service_type  public.service_type not null default 'otro',
  service_date  date,                  -- fecha del culto (opcional)
  notes         text,                  -- notas internas / observaciones
  created_by    uuid not null references public.profiles(id) on delete restrict,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.services is
  'Cultos / setlists: agrupan canciones para un servicio (viernes, domingo, ayuno...)';

create index idx_services_date on public.services(service_date desc nulls last);
create index idx_services_type on public.services(service_type);

create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ── Canciones del culto (orden) ──────────────────────────────
create table public.service_songs (
  service_id   uuid not null references public.services(id) on delete cascade,
  sheet_id     uuid not null references public.sheets(id)   on delete cascade,
  position     int  not null default 0,   -- orden dentro del culto
  key_override text,                       -- tono para ese día (opcional)
  note         text,                       -- nota para esa canción (opcional)
  primary key (service_id, sheet_id)
);

comment on table public.service_songs is
  'Relación ordenada culto ↔ canción';

create index idx_service_songs_order on public.service_songs(service_id, position);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.services      enable row level security;
alter table public.service_songs enable row level security;

-- Todos los autenticados ven los cultos; solo admin escribe.
create policy "services_select_all"
  on public.services for select
  using (true);

create policy "services_write_admin"
  on public.services for all
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

create policy "service_songs_select_all"
  on public.service_songs for select
  using (true);

create policy "service_songs_write_admin"
  on public.service_songs for all
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());
