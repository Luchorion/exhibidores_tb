import { useId, useState } from "react";
import { Pencil, Check, Wrench, AlertTriangle } from "lucide-react";
import { DIAS_CONTROL_FISICO, DIAS_REVISION_PUBLICACIONES, UBICACIONES_SUGERIDAS } from "../../data/constants";
import { formatFechaCorta } from "../../utils/dates";
import { carritoPlate, estadoCarritoAccentClass, estadoCarritoBadgeClass, estadoMantenimiento } from "../../utils/carritos";
import { clickableProps } from "../../utils/a11y";
import { useEdicion } from "../../context/edicion";
import { useInfoPanel } from "../../context/infoPanel";
import Modal from "../Modal";

export default function CarritoCard({ carrito, turnosAsignados, portadasSugeridas, onSave, onRegistrarMantenimiento }) {
  const modoEdicion = useEdicion();
  const abrirInfo = useInfoPanel();
  const ids = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [guardando, setGuardando] = useState(false);

  function startEdit() {
    setDraft({ estado: carrito.estado, ubicacion: carrito.ubicacion, portada: carrito.portada || "", notas: carrito.notas });
    setEditing(true);
  }

  async function handleSave() {
    setGuardando(true);
    const ok = await onSave(carrito.id, draft);
    setGuardando(false);
    if (ok) {
      setEditing(false);
      setDraft(null);
    }
  }

  function registrar(e, tipo) {
    e.stopPropagation();
    onRegistrarMantenimiento(carrito, tipo);
  }

  const esOperativo = carrito.estado === "operativo";
  const { controlVencido, pubVencida } = estadoMantenimiento(carrito);
  const saleDeTurnos = draft && draft.estado !== "operativo" && carrito.estado === "operativo" && turnosAsignados > 0;

  return (
    <div
      className={`exh-card exh-card-clickable ${estadoCarritoAccentClass(carrito.estado)}`}
      title="Tocar para ver los turnos de este carrito"
      {...clickableProps(() => abrirInfo("carrito", carrito.id))}
    >
      {editing && (
        <Modal title={`Editar carrito ${carritoPlate(carrito)}`} onClose={() => setEditing(false)}>
          <div className="exh-form">
            <div className="exh-form-grid">
              <div className="exh-field">
                <label className="exh-label" htmlFor={`${ids}-estado`}>Estado</label>
                <select id={`${ids}-estado`} className="exh-select" value={draft.estado} onChange={(e) => setDraft({ ...draft, estado: e.target.value })}>
                  <option value="operativo">Operativo</option>
                  <option value="repuesto">Repuesto</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
              <div className="exh-field">
                <label className="exh-label" htmlFor={`${ids}-ubicacion`}>Ubicación / guardado</label>
                <input id={`${ids}-ubicacion`} className="exh-input" list={`${ids}-ubicaciones`} value={draft.ubicacion} onChange={(e) => setDraft({ ...draft, ubicacion: e.target.value })} />
                <datalist id={`${ids}-ubicaciones`}>
                  {UBICACIONES_SUGERIDAS.map((u) => <option key={u} value={u} />)}
                </datalist>
              </div>
              <div className="exh-field full">
                <label className="exh-label" htmlFor={`${ids}-portada`}>Portada</label>
                <input id={`${ids}-portada`} className="exh-input" list={`${ids}-portadas`} value={draft.portada} onChange={(e) => setDraft({ ...draft, portada: e.target.value })} placeholder="Elegí una o escribí una nueva" />
                <datalist id={`${ids}-portadas`}>
                  {portadasSugeridas.map((p) => <option key={p} value={p} />)}
                </datalist>
              </div>
              <div className="exh-field full">
                <label className="exh-label" htmlFor={`${ids}-notas`}>Notas</label>
                <textarea id={`${ids}-notas`} className="exh-textarea" value={draft.notas} onChange={(e) => setDraft({ ...draft, notas: e.target.value })} />
              </div>
            </div>
            {saleDeTurnos && (
              <div className="exh-warn-box">
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span>Al dejar de estar operativo, se lo va a quitar de {turnosAsignados === 1 ? "1 turno" : `${turnosAsignados} turnos`}.</span>
              </div>
            )}
            <div className="exh-form-actions">
              <button type="button" className="exh-btn exh-btn-amber" onClick={handleSave} disabled={guardando}><Check size={15} /> Guardar</button>
              <button type="button" className="exh-btn exh-btn-ghost" onClick={() => setEditing(false)}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
      <div className="exh-card-head">
        <span className="exh-plate">{carritoPlate(carrito)}</span>
        <div className="exh-card-actions">
          <span className={`exh-badge ${estadoCarritoBadgeClass(carrito.estado)}`}>{carrito.estado}</span>
          {modoEdicion && (
            <button type="button" className="exh-icon-btn" aria-label={`Editar carrito ${carritoPlate(carrito)}`} title="Editar" onClick={(e) => { e.stopPropagation(); startEdit(); }}>
              <Pencil size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="exh-meta-row"><span>Ubicación</span><strong>{carrito.ubicacion || "Sin asignar"}</strong></div>
      <div className="exh-meta-row"><span>Portada</span><strong>{carrito.portada || "Sin registro"}</strong></div>

      {esOperativo && (
        <>
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
          {modoEdicion && (
            <div className="exh-form-actions" style={{ marginTop: 8 }}>
              <button type="button" className="exh-btn exh-btn-ghost" onClick={(e) => registrar(e, "control")}><Wrench size={13} /> Registrar control hoy</button>
            </div>
          )}

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
          {modoEdicion && (
            <div className="exh-form-actions" style={{ marginTop: 8 }}>
              <button type="button" className="exh-btn exh-btn-ghost" onClick={(e) => registrar(e, "revision")}><Wrench size={13} /> Registrar revisión hoy</button>
            </div>
          )}
        </>
      )}

      {carrito.notas && <div className="exh-card-body" style={{ marginTop: 10 }}>{carrito.notas}</div>}
    </div>
  );
}
