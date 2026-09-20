import { Clock, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { DIAS_SEMANA } from "../../data/constants";
import { useEdicion } from "../../context/edicion";
import { useInfoPanel } from "../../context/infoPanel";
import { estadoHermanoLabel } from "../../utils/hermanos";

export default function TurnoListView({ turnosPorDia, puntos, carritos, hermanos, conflictMap, describeConflicto, onEdit, onDelete }) {
  const modoEdicion = useEdicion();
  const abrirInfo = useInfoPanel();
  return DIAS_SEMANA.filter((d) => turnosPorDia[d] && turnosPorDia[d].length > 0).map((dia) => (
    <div className="exh-date-group" key={dia}>
      <div className="exh-date-label">{dia}</div>
      {turnosPorDia[dia].map((t) => {
        const punto = puntos.find((p) => p.id === t.puntoId);
        const carritosDelTurno = carritos.filter((c) => (t.carritoIds || []).includes(c.id));
        const hermanosDelTurno = hermanos.filter((h) => (t.hermanoIds || []).includes(h.id));
        const conflictosTurno = conflictMap[t.id] || [];
        const esPropuesto = t.estado === "propuesto";
        return (
          <div className={`exh-row ${esPropuesto ? "propuesto" : ""} ${conflictosTurno.length ? "conflicto" : ""}`} key={t.id}>
            <div className="exh-time"><Clock size={13} style={{ marginRight: 4, verticalAlign: -2 }} />{t.horaInicio}{t.horaFin ? `–${t.horaFin}` : ""}</div>
            <div className="exh-row-main">
              {punto ? (
                <button type="button" className="exh-row-point exh-link" onClick={() => abrirInfo("punto", punto.id)}>{punto.nombre}</button>
              ) : (
                <div className="exh-row-point" style={{ color: "var(--muted)" }}>Punto sin definir</div>
              )}
              {hermanosDelTurno.length > 0 ? (
                <div className="exh-personas">
                  {hermanosDelTurno.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      className="exh-persona-tag"
                      title={estadoHermanoLabel(h.estado)}
                      onClick={() => abrirInfo("hermano", h.id)}
                    >
                      {h.nombre}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="exh-row-sub">{t.conductorLibre || "Sin hermanos asignados"}</div>
              )}
              {t.notas && <div className="exh-row-sub">{t.notas}</div>}
              <div className="exh-row-tags">
                {esPropuesto && <span className="exh-badge exh-badge-amber">Propuesto</span>}
                <span className="exh-badge exh-badge-amber">{t.frecuencia || "Semanal"}</span>
                {carritosDelTurno.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="exh-badge exh-badge-slate exh-badge-link"
                    onClick={() => abrirInfo("carrito", c.id)}
                  >
                    Carrito {c.numero}
                  </button>
                ))}
              </div>
              {conflictosTurno.length > 0 && (
                <div className="exh-warn-box">
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>{conflictosTurno.map((c, i) => <div key={i}>{describeConflicto(c)}</div>)}</div>
                </div>
              )}
            </div>
            {modoEdicion && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button type="button" className="exh-icon-btn" onClick={() => onEdit(t)}><Pencil size={15} /></button>
                <button type="button" className="exh-icon-btn" onClick={() => onDelete(t.id)}><Trash2 size={15} /></button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  ));
}
