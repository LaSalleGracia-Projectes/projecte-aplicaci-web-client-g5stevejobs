-- Función para eliminar un usuario y su perfil
create or replace function public.delete_user(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Verificar si el usuario existe en auth.users
  if exists (select 1 from auth.users where id = user_id) then
    -- Eliminar el perfil primero debido a la restricción de clave foránea
    delete from public.perfil where id_perfil = user_id;
    
    -- Eliminar el usuario de auth.users
    delete from auth.users where id = user_id;
  end if;
end;
$$; 