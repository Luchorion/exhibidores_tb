import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ title, onClose, children }) {
  const titleId = useId();
  const dialogRef = useRef(null);

  // Al abrir: foco adentro del diálogo; al cerrar: devolverlo a donde estaba.
  useEffect(() => {
    const previo = document.activeElement;
    const dialog = dialogRef.current;
    const primero = dialog.querySelector(".exh-modal-body " + FOCUSABLE) || dialog.querySelector(FOCUSABLE);
    primero?.focus();
    return () => {
      if (previo && previo.focus && document.contains(previo)) previo.focus();
    };
  }, []);

  // Escape cierra y Tab no se escapa del diálogo. Va como onKeyDown de React
  // (no addEventListener) para que un control interno, como el buscador de
  // hermanos, pueda usar Escape y frenar la propagación antes de llegar acá.
  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
    if (items.length === 0) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="exh-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      // Los clicks adentro del modal no deben llegar a la tarjeta que lo
      // abrió (que también reacciona a clicks).
      onClick={(e) => e.stopPropagation()}
    >
      <div className="exh-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialogRef} onKeyDown={onKeyDown}>
        <div className="exh-modal-head">
          <h2 className="exh-section-title" id={titleId}>{title}</h2>
          <button type="button" className="exh-icon-btn" onClick={onClose} aria-label="Cerrar"><X size={16} /></button>
        </div>
        <div className="exh-modal-body">{children}</div>
      </div>
    </div>
  );
}
