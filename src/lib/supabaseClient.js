import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si faltan las credenciales no rompemos el arranque de la app entera:
// dejamos supabase en null y dejamos que storage.js lo reporte como un
// error de conexión normal (que ya se maneja con fallback a defaults +
// aviso de "no se pudo guardar").
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

if (!supabase) {
  console.warn(
    "Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copiá .env.example a .env y completá los valores de tu proyecto de Supabase."
  );
}
