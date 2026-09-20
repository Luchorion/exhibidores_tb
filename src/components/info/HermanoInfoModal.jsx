import { User } from "lucide-react";
import Modal from "../Modal";
import TurnoMiniRow from "./TurnoMiniRow";
import { useInfoPanel } from "../../context/infoPanel";
import { formatFechaCorta } from "../../utils/dates";
import { estadoHermanoBadgeClass, estadoHermanoLabel } from "../../utils/hermanos";
import { turnosDeHermano } from "../../utils/turnos";

export default function HermanoInfoModal({ hermanoId, hermanos, puntos, carritos, turnos, onClose }) {
  const abrirInfo = useInfoPanel();
  const hermano = hermanos.find((h) => h.id === hermanoId);
  if (!hermano) return null;

  const turnosDelHermano = turnosDeHermano(turnos, hermano.id);
  const puntosPreferidos = (hermano.puntosPreferidos || [])
    .map((pid) => puntos.find((p) => p.id === pid))
    .filter(Boolean);

  return (
    <Modal title={<><User size={15} style={{ marginRight: 6, verticalAlign: -2 }} />{hermano.nombre}</>} onClose={onClose}>
      <div>
        <span className={`exh-badge ${estadoHermanoBadgeClass(hermano.estado)}`}>{estadoHermanoLabel(hermano.estado)}</span>

        <div className="exh-meta-row" style={{ marginTop: 10 }}>
          <span>Fecha aprobación</span>
          <strong>{hermano.fechaAprobacion ? formatFechaCorta(hermano.fechaAprobacion) : "Sin registro"}</strong>
        </div>
        <div className="exh-meta-row">
          <span>Disponibilidad</span>
          <strong>{hermano.disponibilidad && hermano.disponibilidad.length ? hermano.disponibilidad.join(", ") : "Sin definir"}</strong>
        </div>

        {hermano.notas && <div className="exh-card-body" style={{ marginTop: 8 }}>{hermano.notas}</div>}

        {puntosPreferidos.length > 0 && (
          <div className="exh-info-section">
            <span className="exh-label">Puntos de preferencia</span>
            <div className="exh-chip-group" style={{ marginTop: 6 }}>
              {puntosPreferidos.map((p) => (
                <button key={p.id} type="button" className="exh-chip" onClick={() => abrirInfo("punto", p.id)}>
                  {p.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="exh-info-section">
          <span className="exh-label">Turnos asignados ({turnosDelHermano.length})</span>
          {turnosDelHermano.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Sin turnos asignados.</p>
          ) : (
            <div style={{ marginTop: 6 }}>
              {turnosDelHermano.map((t) => (
                <TurnoMiniRow key={t.id} turno={t} puntos={puntos} hermanos={hermanos} carritos={carritos} ocultarHermanos />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
