import { useId, useState } from "react";
import { Mail } from "lucide-react";
import Modal from "./Modal";

// Ingreso sin contraseña: se manda un link al mail. Solo funciona para
// cuentas que un administrador invitó desde el panel de Supabase.
export default function LoginDialog({ onEnviar, onClose }) {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState("idle"); // idle | enviando | enviado | error

  async function enviar(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setEstado("enviando");
    try {
      await onEnviar(email.trim());
      setEstado("enviado");
    } catch {
      setEstado("error");
    }
  }

  return (
    <Modal title="Ingresar como responsable" onClose={onClose}>
      {estado === "enviado" ? (
        <div className="exh-form">
          <p style={{ fontSize: 14 }}>
            Te mandamos un link a <strong>{email}</strong>. Abrilo desde este mismo dispositivo para ingresar.
          </p>
          <div className="exh-form-actions">
            <button type="button" className="exh-btn exh-btn-ghost" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      ) : (
        <form className="exh-form" onSubmit={enviar}>
          <div className="exh-field">
            <label className="exh-label" htmlFor={emailId}>Tu email</label>
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              className="exh-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
            Solo pueden ingresar los responsables habilitados. Para ver el programa no hace falta ingresar.
          </p>
          {estado === "error" && (
            <div className="exh-warn-box" role="alert">
              No se pudo enviar el link. Revisá el email o pedile a un administrador que te habilite.
            </div>
          )}
          <div className="exh-form-actions">
            <button type="submit" className="exh-btn exh-btn-amber" disabled={estado === "enviando"}>
              <Mail size={15} /> {estado === "enviando" ? "Enviando…" : "Mandarme el link"}
            </button>
            <button type="button" className="exh-btn exh-btn-ghost" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
