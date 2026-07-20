import { MapPin, Pencil, Trash2 } from "lucide-react";

export default function PuntoCard({ punto, onEdit, onDelete }) {
  return (
    <div className="exh-card">
      <div className="exh-card-head">
        <div className="exh-card-title"><MapPin size={13} style={{ marginRight: 4, verticalAlign: -2 }} />{punto.nombre}</div>
        <div className="exh-card-actions">
          <button type="button" className="exh-icon-btn" onClick={() => onEdit(punto)}><Pencil size={14} /></button>
          <button type="button" className="exh-icon-btn" onClick={() => onDelete(punto.id)}><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="exh-card-body">{punto.observaciones || "Sin observaciones."}</div>
    </div>
  );
}
