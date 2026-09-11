-- ─────────────────────────────────────────────────────────────
-- 024 · Las canciones YA NO se leen desde internet sin cuenta (P-02, paso 2 de 2)
--
-- Isaac, 2026-09-10: «haz lo que está pendiente». Hasta hoy, con la clave
-- pública —que va en el navegador de cualquiera, es pública por diseño— se
-- leían sin iniciar sesión las 76 canciones publicadas con sus acordes, sus
-- versiones por tono, las categorías y el culto publicado.
--
-- → Las 13 políticas de LECTURA de las tablas de contenido pasan de `public`
-- (todo el mundo, también `anon`) a `authenticated` (solo con sesión). Las
-- condiciones NO cambian: quien tiene cuenta ve exactamente lo mismo que antes.
--
-- 🔴 LO QUE HIZO FALTA ANTES, en este orden (T-07):
--   · la copia ya no dependía de este hueco (T-18: entra con sesión);
--   · el ENLACE PÚBLICO del culto (`/s/<token>`), que sí se abre sin cuenta,
--     ya no lee estas tablas: pasa por `culto_por_enlace` (migración 023),
--     y ese código se publicó ANTES que esto (r75).
--
-- 🔴 NOMBRES LEÍDOS EN `pg_policies` el 2026-09-10, justo antes de escribir
-- esto (L-88): la 020 ya falló una vez por un nombre sacado del repositorio.
-- ⚠️ Las políticas de las cartas (`tcg_*`) NO se tocan: no son de Partituras (D-05).
--
-- Vuelta atrás: las mismas 13 líneas con `to public`.
-- ─────────────────────────────────────────────────────────────

alter policy sheets_select               on public.sheets           to authenticated;
alter policy sheet_keys_select           on public.sheet_keys       to authenticated;
alter policy sheet_versions_select       on public.sheet_versions   to authenticated;
alter policy categories_select_all       on public.categories       to authenticated;
alter policy sheet_categories_select_all on public.sheet_categories to authenticated;
alter policy tags_select_all             on public.tags             to authenticated;
alter policy sheet_tags_select_all       on public.sheet_tags       to authenticated;
alter policy services_select_viewer      on public.services         to authenticated;
alter policy service_songs_select_all    on public.service_songs    to authenticated;
-- Las del módulo viejo de mosaicos: la app no las usa, pero tienen filas.
alter policy songs_select                on public.songs            to authenticated;
alter policy song_sections_select        on public.song_sections    to authenticated;
alter policy mosaics_select              on public.mosaics          to authenticated;
alter policy mosaic_entries_select       on public.mosaic_entries   to authenticated;
