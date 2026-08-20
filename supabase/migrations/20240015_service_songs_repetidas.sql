-- ============================================================
-- 015 · Una misma canción puede ir VARIAS VECES en un culto
-- ============================================================
-- Hasta ahora la clave primaria de service_songs era (service_id, sheet_id),
-- así que la base impedía repetir una canción dentro del mismo culto: si se
-- quería abrir y cerrar con el mismo coro, no se podía. Además la acción de
-- guardar quitaba los repetidos en silencio, sin avisar de nada.
--
-- Se sustituye esa clave por un identificador propio de cada fila. Con eso, la
-- misma canción puede aparecer las veces que haga falta, y cada aparición
-- conserva LO SUYO: su posición, su tono y su nota.
--
-- No hay ninguna tabla que apunte a service_songs, así que cambiar su clave no
-- arrastra nada. Las filas que ya existen reciben su identificador solas.

-- ── Identificador propio de cada fila ────────────────────────
alter table public.service_songs
  add column if not exists id uuid not null default uuid_generate_v4();

-- ── Se cambia la clave primaria ──────────────────────────────
alter table public.service_songs
  drop constraint if exists service_songs_pkey;

alter table public.service_songs
  add constraint service_songs_pkey primary key (id);

-- El índice de orden sigue igual: es el que usa la app para leer el culto.
create index if not exists idx_service_songs_order
  on public.service_songs(service_id, position);

comment on column public.service_songs.id is
  'Identificador de la fila. Existe para que una misma canción pueda repetirse dentro de un culto (antes la clave era service_id + sheet_id y lo impedía).';
