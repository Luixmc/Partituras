-- ─────────────────────────────────────────────────────────────
-- Un usuario DESACTIVADO tampoco pasa por la BASE (la otra mitad de P-01)
--
-- La aplicación ya no le deja entrar: el layout del panel comprueba
-- `profiles.active` y `/salir` le cierra la sesión (§9.2-decies).
--
-- 🔴 PERO ESO ES LA APLICACIÓN. Alguien desactivado que se hubiera guardado su
-- token puede seguir leyendo por la API hasta que caduque, porque las
-- políticas de la base no miran `active` en ninguna parte. Esto lo cierra.
--
-- ✅ APLICADA el 2026-09-10 con el OK de Isaac y copia previa. En la base se
-- registró como `20260910202620 usuario_desactivado`.
-- ─────────────────────────────────────────────────────────────

-- ── 1 · Una función que responda «¿esta persona sigue activa?» ──
--
-- 📌 Por qué una función y no repetir la condición en cada política: son
-- CINCO tablas. Escrita cinco veces, el día que cambie hay que acordarse de
-- los cinco sitios — y ya se ha pagado tres veces en este proyecto que dos
-- copias de la misma regla se separan con el tiempo (P-09).
--
-- `security definer` como `is_admin()`, y por el mismo motivo: tiene que poder
-- leer `profiles` aunque la política de `profiles` no deje.
create or replace function public.esta_activo()
returns boolean language sql stable security definer as $$
  -- 🔴 `coalesce(active, true)`: si la fila no existe o el campo llega nulo,
  -- se responde QUE SÍ. Un fallo al leer un permiso no puede convertirse en
  -- «fuera todo el mundo» — es la misma regla que en el layout, y aquí el
  -- precio de equivocarse es dejar al grupo sin página un domingo (L-121).
  select coalesce(
    (select active from public.profiles where id = auth.uid()),
    true
  );
$$;

comment on function public.esta_activo() is
  'Si la cuenta que hace la peticion sigue activa. Ante la duda, SI (P-01).';

-- ── 2 · `is_admin()` deja de dar permisos a un admin desactivado ──
--
-- Es el caso que más muerde: desactivar a un administrador tiene que quitarle
-- sus permisos, no solo su acceso a la página.
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and coalesce(active, true)   -- ← lo único que cambia
  );
$$;

-- ── 2-bis · `get_my_role()` tampoco da rol a una cuenta desactivada ──
--
-- Isaac, 2026-09-10: «hazlo». Leído en `pg_policies` ese día: `sheets_update`,
-- `songs`, `mosaics`, `song_sections`, `sheet_tags`, `tags` y `sheet_versions`
-- dejan escribir al rol `musician` preguntando a `get_my_role()`, y esa
-- función NO miraba `active`. Desactivada, la cuenta devuelve NULL, y
-- `NULL = ANY(...)` no es verdadero: ninguna de esas políticas la deja pasar.
-- La aplicación no llama a esta función (comprobado en `src/`); solo las políticas.
create or replace function public.get_my_role()
returns user_role language sql stable security definer as $$
  select role from public.profiles
  where id = auth.uid()
    and coalesce(active, true);   -- ← lo único que cambia
$$;

-- ── 3 · Y la lectura, tabla por tabla ──
--
-- ⚠️ Se toca SOLO la lectura de quien tiene sesión. Lo público —el enlace
-- `/s/<token>` y lo que lee el exportador— no se altera, porque quien no ha
-- entrado no tiene cuenta que desactivar y `esta_activo()` le responde `true`.
--
-- Las políticas de escritura NO hacen falta: pasan por `is_admin()` o por
-- `get_my_role()`, y las dos quedaron cerradas en los pasos 2 y 2-bis.
--
-- 🔴 Los nombres son los de PRODUCCIÓN, leídos en `pg_policies` el 2026-09-10.
-- Aquí ponía `sheets_select_viewer`, que existe en el repositorio pero NO en
-- la base: allí se llama `sheets_select`, y la migración habría fallado (T-01).

alter policy sheets_select on public.sheets
  using (
    (status = 'published' or created_by = auth.uid() or public.is_admin())
    and public.esta_activo()
  );

alter policy services_select_viewer on public.services
  using (
    (status = 'published' or created_by = auth.uid() or public.is_admin())
    and public.esta_activo()
  );
