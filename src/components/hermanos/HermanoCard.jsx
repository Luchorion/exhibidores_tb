import { User, Pencil, Trash2, Clock } from "lucide-react";
import { formatFechaCorta } from "../../utils/dates";
import { estadoHermanoBadgeClass, estadoHermanoLabel } from "../../utils/hermanos";
import { turnosDeHermano } from "../../utils/turnos";
import { useEdicion } from "../../context/edicion";

export default function HermanoCard({ hermano, puntos, turnos, onEdit, onDelete }) {
  const modoEdicion = useEdicion();
  const nombresPuntos = (hermano.puntosPreferidos || [])
    .map((pid) => puntos.find((p) => p.id === pid))
    .filter(Boolean)
    .map((p) => p.nombre)
    .join(", ");

  const turnosDelHermano = turnosDeHermano(turnos, hermano.id);

  return (
    <div className="exh-card">
      <div className="exh-card-head">
        <div>
          <div className="exh-card-title"><User size={13} style={{ marginRight: 4, verticalAlign: -2 }} />{hermano.nombre}</div>
          <span className={`exh-badge ${estadoHermanoBadgeClass(hermano.estado)}`}>{estadoHermanoLabel(hermano.estado)}</span>
        </div>
        {modoEdicion && (
          <div className="exh-card-actions">
            <button type="button" className="exh-icon-btn" onClick={() => onEdit(hermano)}><Pencil size={14} /></button>
            <button type="button" className="exh-icon-btn" onClick={() => onDelete(hermano.id)}><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      <div className="exh-meta-row"><span>Fecha aprobación</span><strong>{hermano.fechaAprobacion ? formatFechaCorta(hermano.fechaAprobacion) : "Sin registro"}</strong></div>
      <div className="exh-meta-row"><span>Disponibilidad</span><strong>{hermano.disponibilidad && hermano.disponibilidad.length ? hermano.disponibilidad.join(", ") : "Sin definir"}</strong></div>
      <div className="exh-meta-row"><span>Puntos</span><strong>{nombresPuntos || "Sin preferencia"}</strong></div>

      <div style={{ marginTop: 10 }}>
        <span className="exh-label">Turnos asignados ({turnosDelHermano.length})</span>
        {turnosDelHermano.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Sin turnos asignados.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
            {turnosDelHermano.map((t) => {
              const punto = puntos.find((p) => p.id === t.puntoId);
              return (
                <div key={t.id} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                  <Clock size={12} style={{ flexShrink: 0, verticalAlign: -1 }} />
                  <strong>{t.dia}</strong>
                  <span>{t.horaInicio}{t.horaFin ? `–${t.horaFin}` : ""}</span>
                  <span>· {punto ? punto.nombre : "Punto sin definir"}</span>
                  <span className="exh-badge exh-badge-amber">{t.frecuencia}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {hermano.notas && <div className="exh-card-body" style={{ marginTop: 8 }}>{hermano.notas}</div>}
    </div>
  );
}
