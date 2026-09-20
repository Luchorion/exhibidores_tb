import { AlertTriangle } from "lucide-react";
import { DIAS_SEMANA } from "../../data/constants";
import { useEdicion } from "../../context/edicion";
import { useInfoPanel } from "../../context/infoPanel";
import { estadoHermanoLabel } from "../../utils/hermanos";

export default function TurnoGridView({ turnosPorDia, puntos, carritos, hermanos, conflictMap, onEdit }) {
  const modoEdicion = useEdicion();
  const abrirInfo = useInfoPanel();

  function abrirInfoDesdeCard(e, tipo, id) {
    e.stopPropagation();
    abrirInfo(tipo, id);
  }

  return (
    <div className="exh-grid-wrap">
      <div className="exh-grid">
        {DIAS_SEMANA.map((dia) => (
          <div key={dia}>
            <div className="exh-grid-col-head">{dia.slice(0, 3)}</div>
            <div className="exh-grid-col">
              {(turnosPorDia[dia] || []).length === 0 ? (
                <div className="exh-grid-empty">Sin turnos</div>
              ) : (
                turnosPorDia[dia].map((t) => {
                  const punto = puntos.find((p) => p.id === t.puntoId);
                  const carritosDelTurno = carritos.filter((c) => (t.carritoIds || []).includes(c.id));
                  const hermanosDelTurno = hermanos.filter((h) => (t.hermanoIds || []).includes(h.id));
                  const conflictosTurno = conflictMap[t.id] || [];
                  const esPropuesto = t.estado === "propuesto";
                  return (
                    <div
                      className={`exh-grid-card ${esPropuesto ? "propuesto" : ""} ${conflictosTurno.length ? "conflicto" : ""}`}
                      key={t.id}
                      onClick={modoEdicion ? () => onEdit(t) : undefined}
                      style={modoEdicion ? { cursor: "pointer" } : undefined}
                      title={modoEdicion ? "Tocar para editar" : undefined}
                    >
                      <div className="exh-grid-time">
                        {t.horaInicio}{t.horaFin ? `–${t.horaFin}` : ""}{" "}
                        {conflictosTurno.length > 0 && <AlertTriangle size={11} style={{ verticalAlign: -1, color: "var(--rust)" }} />}
                      </div>
                      <div className="exh-grid-point">
                        {punto ? (
                          <button type="button" className="exh-link" onClick={(e) => abrirInfoDesdeCard(e, "punto", punto.id)}>{punto.nombre}</button>
                        ) : "Sin punto"}
                        {esPropuesto && <span className="exh-badge exh-badge-amber" style={{ marginLeft: 5, verticalAlign: 1 }}>Propuesto</span>}
                      </div>
                      {hermanosDelTurno.length ? (
                        <div className="exh-personas">
                          {hermanosDelTurno.map((h) => (
                            <button
                              key={h.id}
                              type="button"
                              className="exh-persona-tag"
                              title={estadoHermanoLabel(h.estado)}
                              onClick={(e) => abrirInfoDesdeCard(e, "hermano", h.id)}
                            >
                              {h.nombre}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="exh-grid-sub">Sin hermanos</div>
                      )}
                      <div className="exh-grid-sub">
                        {carritosDelTurno.length ? carritosDelTurno.map((c, i) => (
                          <span key={c.id}>
                            {i > 0 && ", "}
                            <button type="button" className="exh-link" style={{ display: "inline", width: "auto" }} onClick={(e) => abrirInfoDesdeCard(e, "carrito", c.id)}>C{c.numero}</button>
                          </span>
                        )) : "Sin carrito"} · {t.frecuencia}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
