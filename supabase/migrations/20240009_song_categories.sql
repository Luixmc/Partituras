-- ============================================================
-- 009 · Song categories
-- ============================================================

insert into public.categories (name, description, color, sort_order, active) values
  ('Adoraciones', 'Canciones de adoracion congregacional', '#2563eb', 1, true),
  ('Alabanzas',   'Canciones de alabanza y celebracion',   '#16a34a', 2, true),
  ('Ofrenda',     'Canciones para el momento de ofrenda',   '#ca8a04', 3, true),
  ('Jovenes',     'Repertorio para jovenes',                '#db2777', 4, true),
  ('Especiales',  'Solos, grupos y participaciones',        '#7c3aed', 5, true)
on conflict (name) do update set
  description = excluded.description,
  color = excluded.color,
  sort_order = excluded.sort_order,
  active = true;

update public.categories
set active = false
where name not in ('Adoraciones', 'Alabanzas', 'Ofrenda', 'Jovenes', 'Especiales');
