import { useState } from "react";
import { Trash2 } from "lucide-react";
import Modal from "./Modal";

// Confirmación antes de una acción que no se puede deshacer (borrar).
export default function ConfirmDialog({ title, message, confirmLabel = "Borrar", onConfirm, onCancel }) {
  const [enviando, setEnviando] = useState(false);

  async function confirmar() {
    setEnviando(true);
    try {
      await onConfirm();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal title={title} onClose={onCancel}>
      <p className="exh-confirm-msg">{message}</p>
      <div className="exh-form-actions">
        <button type="button" className="exh-btn exh-btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="button" className="exh-btn exh-btn-danger" onClick={confirmar} disabled={enviando}>
          <Trash2 size={14} /> {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
