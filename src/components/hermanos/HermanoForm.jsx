import { Check } from "lucide-react";
import { DIAS_SEMANA, ESTADOS_HERMANO, FRANJAS } from "../../data/constants";
import { toggleInArray } from "../../utils/array";

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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
        <div className="exh-field full">
          <label className="exh-label">Fecha de aprobación</label>
          <input type="date" className="exh-input" value={draft.fechaAprobacion} onChange={(e) => setDraft({ ...draft, fechaAprobacion: e.target.value })} />
        </div>
        <div className="exh-field full">
          <label className="exh-label">Disponibilidad ({draft.disponibilidad.length} franjas seleccionadas)</label>
          <div className="exh-disp-wrap">
            <table className="exh-disp-table">
              <thead>
                <tr>
                  <th></th>
                  {FRANJAS.map((f) => <th key={f}>{capitalize(f)}</th>)}
                </tr>
              </thead>
              <tbody>
                {DIAS_SEMANA.map((dia) => (
                  <tr key={dia}>
                    <th>{dia}</th>
                    {FRANJAS.map((f) => {
                      const value = `${dia} ${f}`;
                      const active = draft.disponibilidad.includes(value);
                      return (
                        <td key={f}>
                          <button
                            type="button"
                            className={`exh-disp-toggle ${active ? "active" : ""}`}
                            aria-label={value}
                            onClick={() => setDraft({ ...draft, disponibilidad: toggleInArray(draft.disponibilidad, value) })}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
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
          <textarea className="exh-textarea" value={draft.notas} onChange={(e) => setDraft({ ...draft, notas: e.target.value })} placeholder="Restricciones, contacto, etc." />
        </div>
      </div>
      <div className="exh-form-actions">
        <button type="button" className="exh-btn exh-btn-amber" onClick={onSave}><Check size={15} /> Guardar</button>
        <button type="button" className="exh-btn exh-btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}
