-- ============================================================
-- 019 · Que `reemplazar_canciones_culto` no la pueda llamar un anónimo (P-04)
-- ============================================================
-- 🔴 LO QUE SE APRENDIÓ, y es la razón de que exista esta migración:
--
-- La 018 terminaba con `revoke all on function ... from public`, creyendo que
-- con eso quedaba cerrada. **No queda.** Supabase concede EXECUTE a `anon` y a
-- `authenticated` de forma **explícita** en cada función nueva, y revocar de
-- `PUBLIC` **no toca una concesión explícita a un rol**. Medido después de
-- aplicar la 018: `anon` seguía teniendo permiso.
--
-- ✅ **No era explotable**, y también se midió: llamándola sin cuenta contra un
-- culto real, el culto conservó sus 8 canciones. La función es
-- `security invoker`, así que el borrado se ejecuta con los permisos de quien
-- llama y la política `service_songs_write_admin` no le deja ver ninguna fila
-- que borrar. Ahí está la defensa de verdad.
--
-- Pero una función que un desconocido puede invocar —aunque no consiga nada—
-- es superficie que no hace falta, y devuelve un `204 sin contenido` que
-- parece un éxito. Se cierra.

revoke execute on function public.reemplazar_canciones_culto(uuid, jsonb) from anon;

-- `authenticated` se queda: es el rol con el que llama la aplicación. Que
-- además sea administrador lo decide la política de la tabla, no este permiso.
grant execute on function public.reemplazar_canciones_culto(uuid, jsonb) to authenticated;
