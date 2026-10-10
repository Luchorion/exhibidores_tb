import { supabase } from "./supabaseClient";

// Reemplaza el window.storage de Claude.ai por una tabla clave-valor
// (app_state) en Supabase. Ver supabase/schema.sql para crearla.
//
// Cada fila guarda una lista entera, así que dos personas editando a la vez
// podrían pisarse. Para evitarlo cada escritura es "compare-and-swap": solo
// se aplica si updated_at sigue siendo el que leímos. Si otro guardó en el
// medio, la escritura devuelve conflicto y quien llama vuelve a leer y
// reaplica su cambio sobre la versión nueva (ver useAppData.mutate).

function requireSupabase() {
  if (!supabase) throw new Error("Supabase no está configurado.");
  return supabase;
}

// Devuelve { value, version } o null si la clave todavía no existe (para
// distinguir "nunca se guardó nada" de "se guardó una lista vacía a
// propósito").
export async function getData(key) {
  const { data, error } = await requireSupabase()
    .from("app_state")
    .select("value, updated_at")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data ? { value: data.value, version: data.updated_at } : null;
}

export async function getAllData(keys) {
  const { data, error } = await requireSupabase()
    .from("app_state")
    .select("key, value, updated_at")
    .in("key", keys);
  if (error) throw error;
  const byKey = {};
  for (const row of data) byKey[row.key] = { value: row.value, version: row.updated_at };
  return byKey;
}

// Escribe value solo si la versión en el servidor sigue siendo
// expectedVersion (null = la fila todavía no existe). Devuelve la versión
// nueva, o null si hubo conflicto (alguien escribió antes).
export async function writeData(key, value, expectedVersion) {
  const client = requireSupabase();
  const updated_at = new Date().toISOString();

  if (expectedVersion == null) {
    const { data, error } = await client
      .from("app_state")
      .insert({ key, value, updated_at })
      .select("updated_at");
    if (error) {
      if (error.code === "23505") return null; // ya la creó otro
      throw error;
    }
    return data[0].updated_at;
  }

  const { data, error } = await client
    .from("app_state")
    .update({ value, updated_at })
    .eq("key", key)
    .eq("updated_at", expectedVersion)
    .select("updated_at");
  if (error) throw error;
  if (data.length === 0) return null;
  return data[0].updated_at;
}

// Avisa cuando otro usuario cambia cualquier clave. Requiere que la tabla
// esté en la publicación supabase_realtime (ver schema.sql); si no lo está,
// simplemente no llegan eventos y la app se apoya en el refresco al volver
// a la pestaña.
export function subscribeChanges(onChange) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel("app_state_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "app_state" }, (payload) => {
      onChange(payload.new?.key ?? payload.old?.key);
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
