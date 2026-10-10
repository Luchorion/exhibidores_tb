import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Sesión de Supabase Auth. Solo los responsables que fueron invitados desde
// el panel de Supabase pueden ingresar (shouldCreateUser: false), así que
// "estar logueado" equivale a "tener permiso para editar". Las policies de
// schema.sql hacen cumplir lo mismo del lado del servidor.
export function useAuth() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  async function enviarLink(email) {
    if (!supabase) throw new Error("Supabase no está configurado.");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: window.location.origin + window.location.pathname },
    });
    if (error) throw error;
  }

  async function salir() {
    if (supabase) await supabase.auth.signOut();
  }

  return { session, email: session?.user?.email ?? null, enviarLink, salir };
}
