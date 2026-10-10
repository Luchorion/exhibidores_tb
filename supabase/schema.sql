-- Esquema del panel de Exhibidores (Talleres Boulogne).
-- Corré esto en el SQL Editor de tu proyecto de Supabase. Se puede volver a
-- correr sin problema (todo es "if not exists" / "drop + create").
--
-- Es una tabla clave-valor: cada fila guarda una lista como jsonb
-- (puntos-data, carritos-data, turnos-data, hermanos-data, contactos-data).
-- La app escribe con "compare-and-swap" sobre updated_at, así que dos
-- personas editando a la vez no se pisan los cambios.

create table if not exists app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table app_state enable row level security;

-- Permisos:
-- * Ver el programa (puntos, carritos, turnos, hermanos): cualquiera con
--   el link, sin login.
-- * Ver teléfonos (contactos-data): solo responsables logueados.
-- * Crear, editar o borrar cualquier cosa: solo responsables logueados.
--
-- "Responsable" = un usuario de Supabase Auth. La app no deja crear cuentas
-- (shouldCreateUser: false); se agregan desde el panel de Supabase en
-- Authentication → Users → "Invite user". Recomendado además: en
-- Authentication → Sign In / Providers, desactivar "Allow new users to sign up".
drop policy if exists "app_state_read" on app_state;
create policy "app_state_read" on app_state for select
  using (key <> 'contactos-data' or auth.role() = 'authenticated');

drop policy if exists "app_state_write" on app_state;
create policy "app_state_write" on app_state for insert
  to authenticated with check (true);

drop policy if exists "app_state_update" on app_state;
create policy "app_state_update" on app_state for update
  to authenticated using (true) with check (true);

drop policy if exists "app_state_delete" on app_state;
create policy "app_state_delete" on app_state for delete
  to authenticated using (true);

-- Tiempo real: avisa a las pantallas abiertas cuando otro usuario guarda,
-- para que se actualicen solas.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_state'
  ) then
    alter publication supabase_realtime add table app_state;
  end if;
end $$;
