-- ─────────────────────────────────────────────────────────────
-- 023 · El culto COMPARTIDO, entregado por su enlace (P-02, paso 1 de 2)
--
-- Isaac, 2026-09-10: «haz lo que está pendiente» → cerrar que las canciones se
-- lean desde internet sin cuenta (P-02). Pero las tres páginas del enlace
-- público (`/s/<token>`, su pantalla completa y su PDF) leen las tablas
-- directamente con la clave pública: cerrarlas sin más las dejaría VACÍAS.
--
-- → Esta función entrega UN culto a quien trae SU enlace, y nada más. Con ella
-- las páginas del enlace dejan de necesitar que las tablas estén abiertas, y
-- la migración 024 puede cerrarlas.
--
-- 🔴 REPITE LAS REGLAS DE HOY, NI MÁS NI MENOS, para que al que abre el enlace
-- no le cambie nada:
--   · el culto: con ese `public_token`, compartido (`is_public`) y visible como
--     hoy —publicado, o el admin, o quien lo creó— (`services_select_viewer`);
--   · cada canción: visible como hoy —publicada, admin o su creador—
--     (`sheets_select`). La que no, llega sin `sheet` y la página la salta;
--   · la versión por tono, solo si su canción es visible (`sheet_keys_select`).
-- 📌 Y DEVUELVE LA MISMA FORMA que la consulta anidada de las páginas, para
-- que el código cambie en una línea y no en el reparto de datos.
--
-- ⚠️ Es de las SEGURAS: solo AÑADE una función. No toca ninguna tabla ni
-- ninguna política, así que no puede dejar a nadie fuera.
-- ─────────────────────────────────────────────────────────────

create or replace function public.culto_por_enlace(p_token text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with culto as (
    select s.*
    from services s
    where p_token is not null
      -- `public_token` es `uuid`: se compara como TEXTO para que un enlace mal
      -- copiado dé «no existe» en vez de un error de conversión.
      and s.public_token::text = p_token
      and s.is_public = true
      and (s.status = 'published' or s.created_by = auth.uid() or is_admin())
    limit 1
  )
  select json_build_object(
    'id',           c.id,
    'name',         c.name,
    'service_type', c.service_type,
    'service_date', c.service_date,
    'notes',        c.notes,
    'public_token', c.public_token,
    'service_songs', coalesce((
      select json_agg(json_build_object(
        'sheet_id',     ss.sheet_id,
        'position',     ss.position,
        'key_override', ss.key_override,
        'sheet_key_id', ss.sheet_key_id,
        'sheet_key', case when k.id is not null and visible then
          json_build_object('key_signature', k.key_signature, 'content', k.content) end,
        'sheet', case when visible then json_build_object(
          'title',         sh.title,
          'composer',      sh.composer,
          'key_signature', sh.key_signature,
          'content',       sh.content,
          'editor_type',   sh.editor_type) end
      ) order by ss.position)
      from service_songs ss
      join sheets sh on sh.id = ss.sheet_id
      left join sheet_keys k on k.id = ss.sheet_key_id
      cross join lateral (
        select (sh.status = 'published' or sh.created_by = auth.uid() or is_admin()) as visible
      ) v
      where ss.service_id = c.id
    ), '[]'::json)
  )
  from culto c;
$$;

comment on function public.culto_por_enlace(text) is
  'El culto compartido de ese enlace, con sus canciones, para las paginas /s/<token>. Mismas reglas que las politicas (P-02).';

-- Quien abre el enlace puede no tener cuenta: la tiene que poder llamar `anon`.
grant execute on function public.culto_por_enlace(text) to anon, authenticated;
