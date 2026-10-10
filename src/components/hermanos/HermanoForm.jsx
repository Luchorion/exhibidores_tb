import { useId } from "react";
import { Check } from "lucide-react";
import { DIAS_SEMANA, ESTADOS_HERMANO, FRANJAS } from "../../data/constants";
import { toggleInArray } from "../../utils/array";
import FormErrors from "../FormErrors";

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function HermanoForm({ draft, setDraft, puntos, errores, guardando, onSave, onCancel }) {
  const ids = useId();
  return (
    <div className="exh-form">
      <div className="exh-form-grid">
        <div className="exh-field">
          <label className="exh-label" htmlFor={`${ids}-nombre`}>Nombre</label>
          <input id={`${ids}-nombre`} className="exh-input" value={draft.nombre} onChange={(e) => setDraft({ ...draft, nombre: e.target.value })} />
        </div>
        <div className="exh-field">
          <label className="exh-label" htmlFor={`${ids}-estado`}>Estado</label>
          <select id={`${ids}-estado`} className="exh-select" value={draft.estado} onChange={(e) => setDraft({ ...draft, estado: e.target.value })}>
            {ESTADOS_HERMANO.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
        <div className="exh-field">
          <label className="exh-label" htmlFor={`${ids}-tel`}>Teléfono</label>
          <input
            id={`${ids}-tel`}
            type="tel"
            autoComplete="off"
            className="exh-input"
            value={draft.telefono}
            onChange={(e) => setDraft({ ...draft, telefono: e.target.value })}
            placeholder="11 1234-5678"
          />
        </div>
        <div className="exh-field">
          <label className="exh-label" htmlFor={`${ids}-fecha`}>Fecha de aprobación</label>
          <input id={`${ids}-fecha`} type="date" className="exh-input" value={draft.fechaAprobacion} onChange={(e) => setDraft({ ...draft, fechaAprobacion: e.target.value })} />
        </div>
        <fieldset className="exh-field full exh-fieldset">
          <legend className="exh-label">Disponibilidad ({draft.disponibilidad.length} franjas seleccionadas)</legend>
          <div className="exh-disp-wrap">
            <table className="exh-disp-table">
              <thead>
                <tr>
                  <th></th>
                  {FRANJAS.map((f) => <th key={f} scope="col">{capitalize(f)}</th>)}
                </tr>
              </thead>
              <tbody>
                {DIAS_SEMANA.map((dia) => (
                  <tr key={dia}>
                    <th scope="row">{dia}</th>
                    {FRANJAS.map((f) => {
                      const value = `${dia} ${f}`;
                      const active = draft.disponibilidad.includes(value);
                      return (
                        <td key={f}>
                          <button
                            type="button"
                            className={`exh-disp-toggle ${active ? "active" : ""}`}
                            aria-label={value}
                            aria-pressed={active}
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
        </fieldset>
        <fieldset className="exh-field full exh-fieldset">
          <legend className="exh-label">Puntos de preferencia</legend>
          <div className="exh-chip-group">
            {puntos.map((p) => {
              const selected = draft.puntosPreferidos.includes(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  className={`exh-chip ${selected ? "selected amber" : ""}`}
                  aria-pressed={selected}
                  onClick={() => setDraft({ ...draft, puntosPreferidos: toggleInArray(draft.puntosPreferidos, p.id) })}
                >
                  {p.nombre}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="exh-field full">
          <label className="exh-label" htmlFor={`${ids}-notas`}>Notas</label>
          <textarea id={`${ids}-notas`} className="exh-textarea" value={draft.notas} onChange={(e) => setDraft({ ...draft, notas: e.target.value })} placeholder="Restricciones, etc." />
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
