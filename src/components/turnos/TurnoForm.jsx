import { useEffect, useRef, useState } from "react";
import { Check, AlertTriangle, Search, X } from "lucide-react";
import { DIAS_SEMANA, ESTADOS_TURNO, FRECUENCIAS } from "../../data/constants";
import { toggleInArray } from "../../utils/array";
import { estadoHermanoLabel } from "../../utils/hermanos";
import { normalizarTexto } from "../../utils/text";

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
  const [hermanoQuery, setHermanoQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const hermanosFiltrados = hermanosOrdenados.filter((h) =>
    normalizarTexto(h.nombre).includes(normalizarTexto(hermanoQuery))
  );
  const hermanosSeleccionados = draft.hermanoIds
    .map((id) => hermanosOrdenados.find((h) => h.id === id))
    .filter(Boolean);

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
            {carritos.filter((c) => c.estado === "operativo").map((c) => (
              <button
                type="button"
                key={c.id}
                className={`exh-chip ${draft.carritoIds.includes(c.id) ? "selected" : ""}`}
                onClick={() => setDraft({ ...draft, carritoIds: toggleInArray(draft.carritoIds, c.id) })}
              >
                Carrito {c.numero}
              </button>
            ))}
          </div>
        </div>
        <div className="exh-field full">
          <label className="exh-label">Hermanos que participan ({draft.hermanoIds.length} seleccionados)</label>
          {hermanosOrdenados.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--muted)" }}>Todavía no cargaste hermanos. Agregalos en la pestaña "Hermanos".</p>
          ) : (
            <>
              <div className="exh-picker" ref={pickerRef}>
                <div className="exh-search" style={{ display: "flex" }}>
                  <Search size={13} />
                  <input
                    className="exh-input"
                    style={{ width: "100%" }}
                    placeholder="Buscar y agregar hermanos…"
                    value={hermanoQuery}
                    onChange={(e) => { setHermanoQuery(e.target.value); setPickerOpen(true); }}
                    onFocus={() => setPickerOpen(true)}
                  />
                </div>
                {pickerOpen && (
                  <div className="exh-picker-list">
                    {hermanosFiltrados.length === 0 ? (
                      <div className="exh-picker-empty">Sin resultados para "{hermanoQuery}"</div>
                    ) : (
                      hermanosFiltrados.map((h) => {
                        const seleccionado = draft.hermanoIds.includes(h.id);
                        return (
                          <div
                            key={h.id}
                            className={`exh-picker-item ${seleccionado ? "selected" : ""}`}
                            title={estadoHermanoLabel(h.estado)}
                            onClick={() => setDraft({ ...draft, hermanoIds: toggleInArray(draft.hermanoIds, h.id) })}
                          >
                            <span className={`exh-estado-dot ${h.estado}`} />{h.nombre}
                            {seleccionado && <Check size={13} style={{ marginLeft: "auto", color: "var(--green)" }} />}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              {hermanosSeleccionados.length > 0 && (
                <div className="exh-chip-group" style={{ marginTop: 8 }}>
                  {hermanosSeleccionados.map((h) => (
                    <span className="exh-chip selected" key={h.id} title={estadoHermanoLabel(h.estado)}>
                      <span className={`exh-estado-dot ${h.estado}`} />{h.nombre}
                      <button
                        type="button"
                        className="exh-chip-x"
                        aria-label={`Quitar a ${h.nombre}`}
                        onClick={() => setDraft({ ...draft, hermanoIds: draft.hermanoIds.filter((id) => id !== h.id) })}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </>
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
        <button type="button" className="exh-btn exh-btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}
