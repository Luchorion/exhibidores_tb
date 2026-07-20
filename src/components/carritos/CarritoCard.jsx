import { useState } from "react";
import { Pencil, Check, Wrench, AlertTriangle } from "lucide-react";
import { DIAS_CONTROL_FISICO, DIAS_REVISION_PUBLICACIONES, UBICACIONES_SUGERIDAS } from "../../data/constants";
import { diasDesde, formatFechaCorta } from "../../utils/dates";
import { estadoCarritoBadgeClass } from "../../utils/carritos";
import Modal from "../Modal";

export default function CarritoCard({ carrito, portadasSugeridas, onSave, onMarkControl, onMarkRevision }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  function startEdit() {
    setDraft({ estado: carrito.estado, ubicacion: carrito.ubicacion, portada: carrito.portada || "", notas: carrito.notas });
    setEditing(true);
  }

  async function handleSave() {
    await onSave(carrito.id, draft);
    setEditing(false);
    setDraft(null);
  }

  const diasControl = diasDesde(carrito.ultimoControlFisico);
  const diasPub = diasDesde(carrito.ultimaRevisionPublicaciones);
  const controlVencido = diasControl === null || diasControl > DIAS_CONTROL_FISICO;
  const pubVencida = diasPub === null || diasPub > DIAS_REVISION_PUBLICACIONES;

  return (
    <div className="exh-card">
      {editing && (
        <Modal title={`Editar carrito ${String(carrito.numero).padStart(2, "0")}`} onClose={() => setEditing(false)}>
          <div className="exh-form">
            <div className="exh-form-grid">
              <div className="exh-field">
                <label className="exh-label">Estado</label>
                <select className="exh-select" value={draft.estado} onChange={(e) => setDraft({ ...draft, estado: e.target.value })}>
                  <option value="operativo">Operativo</option>
                  <option value="repuesto">Repuesto</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
              <div className="exh-field">
                <label className="exh-label">Ubicación / guardado</label>
                <input className="exh-input" list={`ubicaciones-list-${carrito.id}`} value={draft.ubicacion} onChange={(e) => setDraft({ ...draft, ubicacion: e.target.value })} />
                <datalist id={`ubicaciones-list-${carrito.id}`}>
                  {UBICACIONES_SUGERIDAS.map((u) => <option key={u} value={u} />)}
                </datalist>
              </div>
              <div className="exh-field full">
                <label className="exh-label">Portada</label>
                <input className="exh-input" list={`portadas-list-${carrito.id}`} value={draft.portada} onChange={(e) => setDraft({ ...draft, portada: e.target.value })} placeholder="Elegí una o escribí una nueva" />
                <datalist id={`portadas-list-${carrito.id}`}>
                  {portadasSugeridas.map((p) => <option key={p} value={p} />)}
                </datalist>
              </div>
              <div className="exh-field full">
                <label className="exh-label">Notas</label>
                <textarea className="exh-textarea" value={draft.notas} onChange={(e) => setDraft({ ...draft, notas: e.target.value })} />
              </div>
            </div>
            <div className="exh-form-actions">
              <button type="button" className="exh-btn exh-btn-amber" onClick={handleSave}><Check size={15} /> Guardar</button>
              <button type="button" className="exh-btn exh-btn-ghost" onClick={() => setEditing(false)}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
      <div className="exh-card-head">
        <span className="exh-plate">{String(carrito.numero).padStart(2, "0")}</span>
        <div className="exh-card-actions">
          <span className={`exh-badge ${estadoCarritoBadgeClass(carrito.estado)}`}>{carrito.estado}</span>
          <button type="button" className="exh-icon-btn" onClick={startEdit}><Pencil size={14} /></button>
        </div>
      </div>
      <div className="exh-meta-row"><span>Ubicación</span><strong>{carrito.ubicacion || "Sin asignar"}</strong></div>
      <div className="exh-meta-row"><span>Portada</span><strong>{carrito.portada || "Sin registro"}</strong></div>

      <div className="exh-meta-row">
        <span>Control físico</span>
        <strong>{carrito.ultimoControlFisico ? formatFechaCorta(carrito.ultimoControlFisico) : "Sin registro"}</strong>
      </div>
      {controlVencido && (
        <div className="exh-warn-box" style={{ marginTop: 6 }}>
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span>Vencido: corresponde controlarlo cada {DIAS_CONTROL_FISICO} días.</span>
        </div>
      )}
      <div className="exh-form-actions" style={{ marginTop: 8 }}>
        <button type="button" className="exh-btn exh-btn-ghost" onClick={() => onMarkControl(carrito)}><Wrench size={13} /> Registrar control hoy</button>
      </div>

      <div className="exh-meta-row" style={{ marginTop: 10 }}>
        <span>Revisión publicaciones</span>
        <strong>{carrito.ultimaRevisionPublicaciones ? formatFechaCorta(carrito.ultimaRevisionPublicaciones) : "Sin registro"}</strong>
      </div>
      {pubVencida && (
        <div className="exh-warn-box" style={{ marginTop: 6 }}>
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span>Vencida: corresponde revisarla cada {DIAS_REVISION_PUBLICACIONES} días (~2 meses).</span>
        </div>
      )}
      <div className="exh-form-actions" style={{ marginTop: 8 }}>
        <button type="button" className="exh-btn exh-btn-ghost" onClick={() => onMarkRevision(carrito)}><Wrench size={13} /> Registrar revisión hoy</button>
      </div>

      {carrito.notas && <div className="exh-card-body" style={{ marginTop: 10 }}>{carrito.notas}</div>}
    </div>
  );
}
