-- ============================================================
-- 007 · Search function and catalog views
-- ============================================================

-- ── Full-text + trigram sheet search ────────────────────────
create or replace function public.search_sheets(
  query       text    default null,
  p_category  uuid    default null,
  p_status    public.sheet_status default 'published',
  p_key       text    default null,
  p_tag       uuid    default null,
  p_limit     int     default 20,
  p_offset    int     default 0
)
returns table (
  id             uuid,
  title          text,
  composer       text,
  key_signature  text,
  time_signature text,
  editor_type    public.editor_type,
  status         public.sheet_status,
  category_name  text,
  category_color text,
  thumbnail_path text,
  drive_file_id  text,
  page_count     int,
  created_at     timestamptz,
  rank           real
)
language sql stable security definer as $$
  select
    s.id,
    s.title,
    s.composer,
    s.key_signature,
    s.time_signature,
    s.editor_type,
    s.status,
    c.name        as category_name,
    c.color       as category_color,
    s.thumbnail_path,
    s.drive_file_id,
    s.page_count,
    s.created_at,
    case
      when query is null then 0
      else ts_rank(
        to_tsvector('spanish', coalesce(s.title,'') || ' ' || coalesce(s.composer,'') || ' ' || coalesce(s.lyrics,'')),
        plainto_tsquery('spanish', query)
      )
    end as rank
  from public.sheets s
  left join public.categories c on c.id = s.category_id
  left join public.sheet_tags  st on st.sheet_id = s.id
  where
    -- Status filter
    (p_status is null or s.status = p_status)
    -- Respect RLS: viewers only see published or own
    and (
      s.status = 'published'
      or s.created_by = auth.uid()
      or public.is_admin()
    )
    -- Category filter
    and (p_category is null or s.category_id = p_category)
    -- Key filter
    and (p_key is null or s.key_signature ilike '%' || p_key || '%')
    -- Tag filter
    and (p_tag is null or st.tag_id = p_tag)
    -- Text search
    and (
      query is null
      or to_tsvector('spanish', coalesce(s.title,'') || ' ' || coalesce(s.composer,'') || ' ' || coalesce(s.lyrics,''))
         @@ plainto_tsquery('spanish', query)
      or s.title       ilike '%' || query || '%'
      or s.composer    ilike '%' || query || '%'
      or s.hymn_number ilike '%' || query || '%'
    )
  order by rank desc, s.title asc
  limit  p_limit
  offset p_offset;
$$;

-- ── View: sheet catalog (published, with category & tags) ────
create or replace view public.sheet_catalog as
select
  s.id,
  s.title,
  s.composer,
  s.arranger,
  s.hymn_number,
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
  p.first_name || ' ' || coalesce(p.last_name,'') as created_by_name
from public.sheets s
left join public.categories  c  on c.id = s.category_id
left join public.sheet_tags  st on st.sheet_id = s.id
left join public.tags        t  on t.id = st.tag_id
left join public.profiles    p  on p.id = s.created_by
where s.status = 'published'
group by s.id, c.id, p.id;

comment on view public.sheet_catalog is
  'Published sheets with denormalized category and tag data for the catalog page';
