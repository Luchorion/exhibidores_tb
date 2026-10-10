import { useId } from "react";
import { Check } from "lucide-react";
import FormErrors from "../FormErrors";

export default function PuntoForm({ draft, setDraft, errores, guardando, onSave, onCancel }) {
  const ids = useId();
  return (
    <div className="exh-form">
      <div className="exh-form-grid">
        <div className="exh-field full">
          <label className="exh-label" htmlFor={`${ids}-nombre`}>Nombre</label>
          <input id={`${ids}-nombre`} className="exh-input" value={draft.nombre} onChange={(e) => setDraft({ ...draft, nombre: e.target.value })} />
        </div>
        <div className="exh-field full">
          <label className="exh-label" htmlFor={`${ids}-obs`}>Observaciones</label>
          <textarea id={`${ids}-obs`} className="exh-textarea" value={draft.observaciones} onChange={(e) => setDraft({ ...draft, observaciones: e.target.value })} />
        </div>
      </div>
      <FormErrors errores={errores} />
      <div className="exh-form-actions">
        <button type="button" className="exh-btn exh-btn-amber" onClick={onSave} disabled={guardando}><Check size={15} /> Guardar</button>
        <button type="button" className="exh-btn exh-btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}
