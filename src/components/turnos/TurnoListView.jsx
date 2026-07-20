import { Clock, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { DIAS_SEMANA } from "../../data/constants";

export default function TurnoListView({ turnosPorDia, puntos, carritos, hermanos, conflictMap, describeConflicto, onEdit, onDelete }) {
  return DIAS_SEMANA.filter((d) => turnosPorDia[d] && turnosPorDia[d].length > 0).map((dia) => (
    <div className="exh-date-group" key={dia}>
      <div className="exh-date-label">{dia}</div>
      {turnosPorDia[dia].map((t) => {
        const punto = puntos.find((p) => p.id === t.puntoId);
        const carritosDelTurno = carritos.filter((c) => (t.carritoIds || []).includes(c.id));
        const hermanosDelTurno = hermanos.filter((h) => (t.hermanoIds || []).includes(h.id));
        const conflictosTurno = conflictMap[t.id] || [];
        return (
          <div className={`exh-row ${conflictosTurno.length ? "conflicto" : ""}`} key={t.id}>
            <div className="exh-time"><Clock size={13} style={{ marginRight: 4, verticalAlign: -2 }} />{t.horaInicio}{t.horaFin ? `–${t.horaFin}` : ""}</div>
            <div className="exh-row-main">
              <div className="exh-row-point">{punto ? punto.nombre : "Punto sin definir"}</div>
              <div className="exh-row-sub">
                {hermanosDelTurno.length > 0
                  ? hermanosDelTurno.map((h) => h.nombre).join(", ")
                  : (t.conductorLibre || "Sin hermanos asignados")}
                {t.notas ? ` · ${t.notas}` : ""}
              </div>
              <div className="exh-row-tags">
                <span className="exh-badge exh-badge-amber">{t.frecuencia || "Semanal"}</span>
                {carritosDelTurno.map((c) => <span className="exh-badge exh-badge-slate" key={c.id}>Carrito {c.numero}</span>)}
              </div>
              {conflictosTurno.length > 0 && (
                <div className="exh-warn-box">
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>{conflictosTurno.map((c, i) => <div key={i}>{describeConflicto(c)}</div>)}</div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button type="button" className="exh-icon-btn" onClick={() => onEdit(t)}><Pencil size={15} /></button>
              <button type="button" className="exh-icon-btn" onClick={() => onDelete(t.id)}><Trash2 size={15} /></button>
            </div>
          </div>
        );
      })}
    </div>
  ));
}
