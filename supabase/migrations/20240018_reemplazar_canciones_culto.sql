-- ============================================================
-- 018 · Guardar el repertorio de un culto SIN poder dejarlo vacío (P-04)
-- ============================================================
-- Hasta ahora, guardar un culto eran DOS viajes a la base desde el servidor:
-- borrar todas sus canciones y volver a insertarlas. Entre uno y otro el culto
-- está vacío, y si el segundo fallaba —conexión caída, el móvil que pierde
-- cobertura mientras se guarda— el repertorio se perdía sin vuelta atrás.
--
-- Y no es un caso de laboratorio: el culto se arma el sábado o el domingo
-- antes de tocar, muchas veces desde el teléfono.
--
-- 🔴 Esto NO se puede arreglar desde el código: son dos peticiones HTTP
-- distintas y no hay forma de meterlas en una transacción desde fuera. Aquí
-- dentro, en cambio, sale gratis: **una función de PL/pgSQL se ejecuta en UNA
-- transacción**, así que si el insert falla, el delete se deshace solo.

create or replace function public.reemplazar_canciones_culto(
  p_service_id uuid,
  p_canciones  jsonb
)
returns void
language plpgsql
-- `security invoker` es el modo por defecto, pero se escribe a propósito para
-- que quede dicho: la función corre con los permisos de QUIEN LLAMA, así que la
-- política `service_songs_write_admin` (20240012) sigue mandando y un músico no
-- puede vaciar un culto invocándola. Ponerla `security definer` habría abierto
-- justo la puerta que las políticas cierran — es el error clásico de este
-- arreglo.
security invoker
set search_path = public
as $$
begin
  delete from public.service_songs
   where service_id = p_service_id;

  -- `coalesce` para que un culto al que se le quitan TODAS las canciones
  -- funcione igual: se borra y no se inserta nada.
  insert into public.service_songs
         (service_id, sheet_id, position, key_override, sheet_key_id, note)
  select p_service_id,
         (x->>'sheet_id')::uuid,
         (x->>'position')::int,
         nullif(x->>'key_override', ''),
         nullif(x->>'sheet_key_id', '')::uuid,
         nullif(x->>'note', '')
    from jsonb_array_elements(coalesce(p_canciones, '[]'::jsonb)) as x;
end;
$$;

comment on function public.reemplazar_canciones_culto(uuid, jsonb) is
  'Reescribe el repertorio de un culto en UNA transaccion: si el insert falla, el borrado se deshace (P-04)';

-- Solo los que tienen sesión pueden llamarla. Que además sean admin lo decide
-- la política de la tabla, no este permiso.
revoke all on function public.reemplazar_canciones_culto(uuid, jsonb) from public;
grant execute on function public.reemplazar_canciones_culto(uuid, jsonb) to authenticated;
