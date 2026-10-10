import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Sesión de Supabase Auth. Solo los responsables que fueron invitados desde
// el panel de Supabase pueden ingresar (shouldCreateUser: false), así que
// "estar logueado" equivale a "tener permiso para editar". Las policies de
// schema.sql hacen cumplir lo mismo del lado del servidor.
// Si el link del mail falla (vencido, ya usado, etc.), Supabase vuelve a la
// app con el motivo en la URL (#error=...&error_code=...). Lo leemos una vez
// al cargar para mostrarlo, porque si no parece que "no pasó nada".
function leerErrorDeUrl() {
  const params = new URLSearchParams(window.location.hash.slice(1) + "&" + window.location.search.slice(1));
  const code = params.get("error_code") || params.get("error");
  if (!code) return null;
  const mensajes = {
    otp_expired: "El link de ingreso venció o ya se usó. Pedí uno nuevo y abrí solo el último mail que llegue.",
    access_denied: "El link de ingreso no es válido o ya se usó. Pedí uno nuevo.",
  };
  return mensajes[code] || `No se pudo ingresar: ${params.get("error_description") || code}.`;
}

export function useAuth() {
  const [session, setSession] = useState(null);
  const [authError, setAuthError] = useState(leerErrorDeUrl);

  useEffect(() => {
    // Limpiar el error de la barra de direcciones para que no reaparezca al
    // recargar.
    if (authError) window.history.replaceState(null, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // Ingreso con contraseña: no manda ningún mail. Sirve para usuarios creados
  // desde el panel de Supabase con contraseña y "Auto Confirm User".
  async function ingresarConPassword(email, password) {
    if (!supabase) throw new Error("Supabase no está configurado.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

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

  return {
    session,
    email: session?.user?.email ?? null,
    authError,
    clearAuthError: () => setAuthError(null),
    ingresarConPassword,
    enviarLink,
    salir,
  };
}
