import { Check } from "lucide-react";

export default function PuntoForm({ draft, setDraft, onSave, onCancel }) {
  return (
    <div className="exh-form">
      <div className="exh-form-grid">
        <div className="exh-field full">
          <label className="exh-label">Nombre</label>
          <input className="exh-input" value={draft.nombre} onChange={(e) => setDraft({ ...draft, nombre: e.target.value })} />
        </div>
        <div className="exh-field full">
          <label className="exh-label">Observaciones</label>
          <textarea className="exh-textarea" value={draft.observaciones} onChange={(e) => setDraft({ ...draft, observaciones: e.target.value })} />
        </div>
      </div>
      <div className="exh-form-actions">
        <button type="button" className="exh-btn exh-btn-amber" onClick={onSave}><Check size={15} /> Guardar</button>
        <button type="button" className="exh-btn exh-btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}
