import { MapPin, Pencil, Trash2 } from "lucide-react";
import { useEdicion } from "../../context/edicion";
import { useInfoPanel } from "../../context/infoPanel";

export default function PuntoCard({ punto, turnosAsignados, onEdit, onDelete }) {
  const modoEdicion = useEdicion();
  const abrirInfo = useInfoPanel();
  const tieneTurnos = turnosAsignados > 0;

  return (
    <div
      className={`exh-card exh-card-clickable ${tieneTurnos ? "exh-card-accent-green" : "exh-card-accent-muted"}`}
      onClick={() => abrirInfo("punto", punto.id)}
      title="Tocar para ver los turnos de este punto"
    >
      <div className="exh-card-head">
        <div className="exh-card-title"><MapPin size={13} style={{ marginRight: 4, verticalAlign: -2 }} />{punto.nombre}</div>
        {modoEdicion && (
          <div className="exh-card-actions">
            <button type="button" className="exh-icon-btn" onClick={(e) => { e.stopPropagation(); onEdit(punto); }}><Pencil size={14} /></button>
            <button type="button" className="exh-icon-btn" onClick={(e) => { e.stopPropagation(); onDelete(punto.id); }}><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      <div className="exh-meta-row" style={{ marginBottom: 6 }}>
        <span>Turnos asignados</span>
        <strong style={{ color: tieneTurnos ? "var(--green)" : "var(--muted)" }}>{turnosAsignados}</strong>
      </div>
      <div className="exh-card-body">{punto.observaciones || "Sin observaciones."}</div>
    </div>
  );
}
