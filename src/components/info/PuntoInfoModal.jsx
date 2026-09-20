import { MapPin } from "lucide-react";
import Modal from "../Modal";
import TurnoMiniRow from "./TurnoMiniRow";
import { ordenarTurnos } from "../../utils/turnos";

export default function PuntoInfoModal({ puntoId, puntos, hermanos, carritos, turnos, onClose }) {
  const punto = puntos.find((p) => p.id === puntoId);
  if (!punto) return null;

  const turnosDelPunto = ordenarTurnos(turnos.filter((t) => t.puntoId === punto.id));

  return (
    <Modal title={<><MapPin size={15} style={{ marginRight: 6, verticalAlign: -2 }} />{punto.nombre}</>} onClose={onClose}>
      <div>
        <div className="exh-card-body">{punto.observaciones || "Sin observaciones."}</div>

        <div className="exh-info-section">
          <span className="exh-label">Turnos asignados ({turnosDelPunto.length})</span>
          {turnosDelPunto.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Sin turnos asignados a este punto.</p>
          ) : (
            <div style={{ marginTop: 6 }}>
              {turnosDelPunto.map((t) => (
                <TurnoMiniRow key={t.id} turno={t} puntos={puntos} hermanos={hermanos} carritos={carritos} ocultarPunto />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
