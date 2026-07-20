import { Check, AlertTriangle } from "lucide-react";
import { DIAS_SEMANA, ESTADOS_TURNO, FRECUENCIAS } from "../../data/constants";
import { toggleInArray } from "../../utils/array";
import { estadoHermanoLabel } from "../../utils/hermanos";

export default function TurnoForm({
  draft,
  setDraft,
  puntos,
  carritos,
  hermanosOrdenados,
  editingTurnoId,
  conflictos,
  describeConflicto,
  onSave,
  onCancel,
}) {
  return (
    <div className="exh-form">
      <div className="exh-form-grid">
        <div className="exh-field">
          <label className="exh-label">Día</label>
          <select className="exh-select" value={draft.dia} onChange={(e) => setDraft({ ...draft, dia: e.target.value })}>
            <option value="">Seleccionar…</option>
            {DIAS_SEMANA.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="exh-field">
          <label className="exh-label">Frecuencia</label>
          <select className="exh-select" value={draft.frecuencia} onChange={(e) => setDraft({ ...draft, frecuencia: e.target.value })}>
            {FRECUENCIAS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="exh-field">
          <label className="exh-label">Estado</label>
          <select className="exh-select" value={draft.estado} onChange={(e) => setDraft({ ...draft, estado: e.target.value })}>
            {ESTADOS_TURNO.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
        <div className="exh-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label className="exh-label">Desde</label>
            <input type="time" className="exh-input" style={{ width: "100%" }} value={draft.horaInicio} onChange={(e) => setDraft({ ...draft, horaInicio: e.target.value })} />
          </div>
          <div>
            <label className="exh-label">Hasta</label>
            <input type="time" className="exh-input" style={{ width: "100%" }} value={draft.horaFin} onChange={(e) => setDraft({ ...draft, horaFin: e.target.value })} />
          </div>
        </div>
        <div className="exh-field full">
          <label className="exh-label">Punto</label>
          <select className="exh-select" value={draft.puntoId} onChange={(e) => setDraft({ ...draft, puntoId: e.target.value })}>
            <option value="">Seleccionar…</option>
            {puntos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div className="exh-field full">
          <label className="exh-label">Carritos ({draft.carritoIds.length} seleccionados)</label>
          <div className="exh-chip-group">
            {carritos.filter((c) => c.estado !== "pendiente").map((c) => (
              <button
                type="button"
                key={c.id}
                className={`exh-chip ${draft.carritoIds.includes(c.id) ? "selected" : ""}`}
                onClick={() => setDraft({ ...draft, carritoIds: toggleInArray(draft.carritoIds, c.id) })}
              >
                Carrito {c.numero}{c.estado === "repuesto" ? " (repuesto)" : ""}
              </button>
            ))}
          </div>
        </div>
        <div className="exh-field full">
          <label className="exh-label">Hermanos que participan ({draft.hermanoIds.length} seleccionados)</label>
          {hermanosOrdenados.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--muted)" }}>Todavía no cargaste hermanos. Agregalos en la pestaña "Hermanos".</p>
          ) : (
            <div className="exh-chip-group">
              {hermanosOrdenados.map((h) => (
                <button
                  type="button"
                  key={h.id}
                  className={`exh-chip ${draft.hermanoIds.includes(h.id) ? "selected" : ""}`}
                  onClick={() => setDraft({ ...draft, hermanoIds: toggleInArray(draft.hermanoIds, h.id) })}
                  title={estadoHermanoLabel(h.estado)}
                >
                  <span className={`exh-estado-dot ${h.estado}`} />{h.nombre}
                </button>
              ))}
            </div>
          )}
          {conflictos.length > 0 && (
            <div className="exh-warn-box">
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                {conflictos.map((c, i) => <div key={i}>{describeConflicto(c)}</div>)}
              </div>
            </div>
          )}
        </div>
        <div className="exh-field full">
          <label className="exh-label">Notas</label>
          <textarea className="exh-textarea" value={draft.notas} onChange={(e) => setDraft({ ...draft, notas: e.target.value })} placeholder="Opcional" />
        </div>
      </div>
      <div className="exh-form-actions">
        <button type="button" className="exh-btn exh-btn-amber" onClick={onSave}><Check size={15} /> {editingTurnoId ? "Guardar cambios" : "Guardar turno"}</button>
        {editingTurnoId && <button type="button" className="exh-btn exh-btn-ghost" onClick={onCancel}>Cancelar edición</button>}
      </div>
    </div>
  );
}
