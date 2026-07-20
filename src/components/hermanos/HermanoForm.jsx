import { Check } from "lucide-react";
import { DIAS, ESTADOS_HERMANO, HORARIOS_PREF } from "../../data/constants";
import { toggleInArray } from "../../utils/array";

export default function HermanoForm({ draft, setDraft, puntos, onSave, onCancel }) {
  return (
    <div className="exh-form">
      <div className="exh-form-grid">
        <div className="exh-field">
          <label className="exh-label">Nombre</label>
          <input className="exh-input" value={draft.nombre} onChange={(e) => setDraft({ ...draft, nombre: e.target.value })} />
        </div>
        <div className="exh-field">
          <label className="exh-label">Estado</label>
          <select className="exh-select" value={draft.estado} onChange={(e) => setDraft({ ...draft, estado: e.target.value })}>
            {ESTADOS_HERMANO.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
        <div className="exh-field">
          <label className="exh-label">Fecha de aprobación</label>
          <input type="date" className="exh-input" value={draft.fechaAprobacion} onChange={(e) => setDraft({ ...draft, fechaAprobacion: e.target.value })} />
        </div>
        <div className="exh-field">
          <label className="exh-label">Horario de preferencia</label>
          <select className="exh-select" value={draft.horarioPreferido} onChange={(e) => setDraft({ ...draft, horarioPreferido: e.target.value })}>
            {HORARIOS_PREF.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="exh-field full">
          <label className="exh-label">Días de preferencia</label>
          <div className="exh-chip-group">
            {DIAS.map((d) => (
              <button
                type="button"
                key={d}
                className={`exh-chip ${draft.diasPreferidos.includes(d) ? "selected amber" : ""}`}
                onClick={() => setDraft({ ...draft, diasPreferidos: toggleInArray(draft.diasPreferidos, d) })}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="exh-field full">
          <label className="exh-label">Puntos de preferencia</label>
          <div className="exh-chip-group">
            {puntos.map((p) => (
              <button
                type="button"
                key={p.id}
                className={`exh-chip ${draft.puntosPreferidos.includes(p.id) ? "selected amber" : ""}`}
                onClick={() => setDraft({ ...draft, puntosPreferidos: toggleInArray(draft.puntosPreferidos, p.id) })}
              >
                {p.nombre}
              </button>
            ))}
          </div>
        </div>
        <div className="exh-field full">
          <label className="exh-label">Notas</label>
          <textarea className="exh-textarea" value={draft.notas} onChange={(e) => setDraft({ ...draft, notas: e.target.value })} placeholder="Disponibilidad, restricciones, contacto, etc." />
        </div>
      </div>
      <div className="exh-form-actions">
        <button type="button" className="exh-btn exh-btn-amber" onClick={onSave}><Check size={15} /> Guardar</button>
        <button type="button" className="exh-btn exh-btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}
