-- Esquema mínimo para el panel de Exhibidores (Talleres Boulogne).
-- Corré esto en el SQL Editor de tu proyecto de Supabase.
--
-- Es una tabla clave-valor: cada fila guarda uno de los cuatro arrays
-- (puntos-data, carritos-data, turnos-data, hermanos-data) como jsonb,
-- igual que hacía window.storage en la versión anterior (artifact de
-- Claude.ai). Si el modelo de datos crece, esto se puede migrar a tablas
-- relacionales normales (puntos, carritos, turnos, hermanos) más adelante.

create table if not exists app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table app_state enable row level security;

-- La app es de uso interno para la congregación y no tiene login propio:
-- cualquiera con la anon key (la de tu proyecto, no la publiques fuera del
-- equipo) puede leer y escribir. Si más adelante se agrega autenticación,
-- reemplazar esta policy por reglas basadas en auth.uid().
--
-- drop + create (en vez de create solo) para que este script se pueda
-- volver a correr sin error si ya existían las políticas.
drop policy if exists "app_state_read" on app_state;
create policy "app_state_read" on app_state for select using (true);

drop policy if exists "app_state_write" on app_state;
create policy "app_state_write" on app_state for insert with check (true);

drop policy if exists "app_state_update" on app_state;
create policy "app_state_update" on app_state for update using (true);

drop policy if exists "app_state_delete" on app_state;
create policy "app_state_delete" on app_state for delete using (true);
