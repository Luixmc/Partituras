-- ─────────────────────────────────────────────────────────────
-- O-57 · R.0 — La MELODÍA de cada canción, para la trompeta.
--
-- Isaac, 2026-09-02: «que se pueda escribir la melodía y también las secciones
-- para que sepa por dónde va». Se guarda en ABC, con las mismas etiquetas de
-- sección que ya usan los acordes y la letra (ver `src/lib/melodia.ts`).
--
-- 🔴 POR QUÉ ESTA MIGRACIÓN ES DE LAS SEGURAS, y conviene decirlo porque en
-- este proyecto una migración ya dejó el catálogo vacío 3 minutos (T-07):
--   · **AÑADE**, no quita ni cambia. Quitar una columna solo es seguro cuando
--     ya nadie la pide; añadir es seguro en cualquier orden.
--   · **Nace NULL**, sin `default` y sin `not null`. Así que **ninguna fila que
--     ya existe cambia de significado** — que es justo lo que enseñó L-121 con
--     el `status` de los cultos, donde un `default 'draft'` habría hecho
--     desaparecer los 3 cultos de golpe.
--   · **No toca ninguna política.** Quien puede leer una canción puede leer su
--     melodía, igual que pasa con la letra: es una columna más de `sheets`.
--
-- ⚠️ Y el orden, que es la regla de T-07: **primero se publica el código que
-- tolera que la columna no exista, y DESPUÉS se ejecuta esto.** El código lo
-- hace: si `melody` no está, la canción se trata como «sin melodía escrita».
-- ─────────────────────────────────────────────────────────────

alter table public.sheets
  add column if not exists melody text;

comment on column public.sheets.melody is
  'Melodía de la canción en notación ABC, partida por secciones con [Etiqueta]. '
  'La escribe el admin desde el editor de melodía (O-57). NULL = sin escribir.';
