import { X } from "lucide-react";

export default function Modal({ title, onClose, children }) {
  return (
    <div
      className="exh-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="exh-modal">
        <div className="exh-modal-head">
          <p className="exh-section-title">{title}</p>
          <button type="button" className="exh-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="exh-modal-body">{children}</div>
      </div>
    </div>
  );
}
