import { useId, useState } from "react";
import { LogIn, Mail } from "lucide-react";
import Modal from "./Modal";

// Traduce los errores más comunes de Supabase Auth a algo accionable.
function motivoError(err, modo) {
  const code = err?.code || "";
  const msg = err?.message || "";
  if (code === "invalid_credentials" || /invalid login credentials/i.test(msg)) {
    return "Email o contraseña incorrectos.";
  }
  if (code === "email_not_confirmed" || /email not confirmed/i.test(msg)) {
    return "Ese usuario no está confirmado. En Supabase, creálo con \"Auto Confirm User\" tildado.";
  }
  if (err?.status === 429 || code.includes("rate_limit") || /rate limit|security purposes/i.test(msg)) {
    return modo === "link"
      ? "Se pidieron demasiados links seguidos. Esperá un rato (puede ser hasta una hora) o ingresá con contraseña."
      : "Demasiados intentos seguidos. Esperá unos minutos y probá de nuevo.";
  }
  if (code === "otp_disabled" || code === "signup_disabled" || code === "user_not_found" || /signups not allowed/i.test(msg)) {
    return "Ese email no está habilitado. Pedile a un administrador que te dé acceso.";
  }
  return `No se pudo ingresar${msg ? `: ${msg}` : ""}.`;
}

// Ingreso de responsables. Por defecto con email y contraseña (no manda
// ningún mail); como alternativa, un link al mail. Solo funciona para
// cuentas que un administrador creó desde el panel de Supabase.
export default function LoginDialog({ onIngresar, onEnviarLink, onClose }) {
  const ids = useId();
  const [modo, setModo] = useState("password"); // password | link
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [estado, setEstado] = useState("idle"); // idle | enviando | enviado | error
  const [error, setError] = useState("");

  function cambiarModo(nuevo) {
    setModo(nuevo);
    setEstado("idle");
    setError("");
  }

  async function enviar(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setEstado("enviando");
    try {
      if (modo === "password") {
        await onIngresar(email.trim(), password);
        onClose();
      } else {
        await onEnviarLink(email.trim());
        setEstado("enviado");
      }
    } catch (err) {
      setError(motivoError(err, modo));
      setEstado("error");
    }
  }

  if (estado === "enviado") {
    return (
      <Modal title="Ingresar como responsable" onClose={onClose}>
        <div className="exh-form">
          <p style={{ fontSize: 14 }}>
            Te mandamos un link a <strong>{email}</strong>. Abrilo desde este mismo dispositivo para ingresar.
          </p>
          <div className="exh-form-actions">
            <button type="button" className="exh-btn exh-btn-ghost" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Ingresar como responsable" onClose={onClose}>
      <form className="exh-form" onSubmit={enviar}>
        <div className="exh-field">
          <label className="exh-label" htmlFor={`${ids}-email`}>Tu email</label>
          <input
            id={`${ids}-email`}
            type="email"
            autoComplete="username"
            className="exh-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {modo === "password" && (
          <div className="exh-field">
            <label className="exh-label" htmlFor={`${ids}-password`}>Contraseña</label>
            <input
              id={`${ids}-password`}
              type="password"
              autoComplete="current-password"
              className="exh-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
          Solo pueden ingresar los responsables habilitados. Para ver el programa no hace falta ingresar.
        </p>
        {estado === "error" && (
          <div className="exh-warn-box" role="alert">
            {error}
          </div>
        )}
        <div className="exh-form-actions">
          <button type="submit" className="exh-btn exh-btn-amber" disabled={estado === "enviando"}>
            {modo === "password" ? (
              <><LogIn size={15} /> {estado === "enviando" ? "Ingresando…" : "Ingresar"}</>
            ) : (
              <><Mail size={15} /> {estado === "enviando" ? "Enviando…" : "Mandarme el link"}</>
            )}
          </button>
          <button type="button" className="exh-btn exh-btn-ghost" onClick={onClose}>Cancelar</button>
        </div>
        <button
          type="button"
          className="exh-link"
          style={{ marginTop: 12, fontSize: 12, color: "var(--slate-dark)" }}
          onClick={() => cambiarModo(modo === "password" ? "link" : "password")}
        >
          {modo === "password" ? "No tengo contraseña: mandame un link al mail" : "Ingresar con contraseña"}
        </button>
      </form>
    </Modal>
  );
}
