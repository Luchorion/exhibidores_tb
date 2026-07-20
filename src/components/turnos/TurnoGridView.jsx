import { AlertTriangle } from "lucide-react";
import { DIAS_SEMANA } from "../../data/constants";

export default function TurnoGridView({ turnosPorDia, puntos, carritos, hermanos, conflictMap, onEdit }) {
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
                  return (
                    <div
                      className={`exh-grid-card ${conflictosTurno.length ? "conflicto" : ""}`}
                      key={t.id}
                      onClick={() => onEdit(t)}
                      style={{ cursor: "pointer" }}
                      title="Tocar para editar"
                    >
                      <div className="exh-grid-time">
                        {t.horaInicio}{t.horaFin ? `–${t.horaFin}` : ""}{" "}
                        {conflictosTurno.length > 0 && <AlertTriangle size={11} style={{ verticalAlign: -1, color: "var(--rust)" }} />}
                      </div>
                      <div className="exh-grid-point">{punto ? punto.nombre : "Sin punto"}</div>
                      <div className="exh-grid-sub">{hermanosDelTurno.length ? hermanosDelTurno.map((h) => h.nombre).join(", ") : "Sin hermanos"}</div>
                      <div className="exh-grid-sub">{carritosDelTurno.length ? carritosDelTurno.map((c) => `C${c.numero}`).join(", ") : "Sin carrito"} · {t.frecuencia}</div>
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
