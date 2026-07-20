import { supabase } from "./supabaseClient";

// Reemplaza el window.storage de Claude.ai por una tabla clave-valor
// (app_state) en Supabase. Ver supabase/schema.sql para crearla.
// Devuelve null si la clave todavía no existe (para distinguir "nunca se
// guardó nada" de "se guardó una lista vacía a propósito").
export async function getData(key) {
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data, error } = await supabase
    .from("app_state")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data ? data.value : null;
}

export async function setData(key, value) {
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { error } = await supabase
    .from("app_state")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
