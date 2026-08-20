-- ============================================================
-- 016 · Se retira el número de himno
-- ============================================================
-- Isaac no quiere ese dato en ninguna parte (D-16). Ya se quitó de la tarjeta
-- del catálogo y de la búsqueda; esto lo saca también de la base.
--
-- ⚠️ SE PIERDE UN DATO, y conviene dejarlo escrito: al ejecutarse, había UNA
-- canción con el campo relleno —«Amado de mi Alma», con el valor 'hv-018'—.
-- La canción NO se toca: solo desaparece ese campo suyo. Queda guardado en
-- _RESPALDOS\Partituras-datos-2026-08-20-16h09\sheets.json.
--
-- ⚠️ HAY UNA DEPENDENCIA, y al primer intento la base se negó a borrar la
-- columna por ella: la vista `sheet_catalog` (migración 007) la incluye. Esa
-- vista **no la usa la aplicación** —solo existe en aquella migración—, pero no
-- se borra: se vuelve a crear sin ese campo y ya está. Borrarla sería un cambio
-- que nadie ha pedido.

-- ── La vista, sin el número de himno ─────────────────────────
-- Se borra y se vuelve a crear: `create or replace view` NO deja quitar
-- columnas ("cannot drop columns from view"). Y al recrearla se pierden sus
-- permisos, así que se vuelven a conceder los mismos que tenía.
drop view if exists public.sheet_catalog;

create view public.sheet_catalog as
select
  s.id,
  s.title,
  s.composer,
  s.arranger,
  s.key_signature,
  s.time_signature,
  s.tempo,
  s.tempo_label,
  s.voices,
  s.language,
  s.editor_type,
  s.storage_path,
  s.drive_file_id,
  s.thumbnail_path,
  s.page_count,
  s.status,
  s.published_at,
  s.created_at,
  c.name  as category_name,
  c.color as category_color,
  c.icon  as category_icon,
  array_agg(distinct t.name) filter (where t.name is not null) as tags,
  (p.first_name || ' '::text) || coalesce(p.last_name, ''::text) as created_by_name
from public.sheets s
  left join public.categories c  on c.id = s.category_id
  left join public.sheet_tags st on st.sheet_id = s.id
  left join public.tags t        on t.id = st.tag_id
  left join public.profiles p    on p.id = s.created_by
where s.status = 'published'::public.sheet_status
group by s.id, c.id, p.id;

-- Los mismos permisos que tenía antes (los que Supabase pone por defecto).
grant all on public.sheet_catalog to anon, authenticated, service_role;

-- ── Y ahora sí, fuera la columna ─────────────────────────────
alter table public.sheets
  drop column if exists hymn_number;
