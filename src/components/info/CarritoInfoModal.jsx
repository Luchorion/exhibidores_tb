import { AlertTriangle, ShoppingCart } from "lucide-react";
import Modal from "../Modal";
import TurnoMiniRow from "./TurnoMiniRow";
import { ordenarTurnos } from "../../utils/turnos";
import { diasDesde, formatFechaCorta } from "../../utils/dates";
import { carritoPlate, estadoCarritoBadgeClass } from "../../utils/carritos";
import { DIAS_CONTROL_FISICO, DIAS_REVISION_PUBLICACIONES } from "../../data/constants";

export default function CarritoInfoModal({ carritoId, carritos, hermanos, puntos, turnos, onClose }) {
  const carrito = carritos.find((c) => c.id === carritoId);
  if (!carrito) return null;

  const esOperativo = carrito.estado === "operativo";
  const diasControl = diasDesde(carrito.ultimoControlFisico);
  const diasPub = diasDesde(carrito.ultimaRevisionPublicaciones);
  const controlVencido = esOperativo && (diasControl === null || diasControl > DIAS_CONTROL_FISICO);
  const pubVencida = esOperativo && (diasPub === null || diasPub > DIAS_REVISION_PUBLICACIONES);

  const turnosDelCarrito = ordenarTurnos(turnos.filter((t) => (t.carritoIds || []).includes(carrito.id)));

  return (
    <Modal title={<><ShoppingCart size={15} style={{ marginRight: 6, verticalAlign: -2 }} />Carrito {carritoPlate(carrito)}</>} onClose={onClose}>
      <div>
        <span className={`exh-badge ${estadoCarritoBadgeClass(carrito.estado)}`}>{carrito.estado}</span>

        <div className="exh-meta-row" style={{ marginTop: 10 }}><span>Ubicación</span><strong>{carrito.ubicacion || "Sin asignar"}</strong></div>
        <div className="exh-meta-row"><span>Portada</span><strong>{carrito.portada || "Sin registro"}</strong></div>

        {esOperativo && (
          <>
            <div className="exh-meta-row" style={{ marginTop: 10 }}>
              <span>Control físico</span>
              <strong>{carrito.ultimoControlFisico ? formatFechaCorta(carrito.ultimoControlFisico) : "Sin registro"}</strong>
            </div>
            {controlVencido && (
              <div className="exh-warn-box" style={{ marginTop: 6 }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span>Vencido: corresponde controlarlo cada {DIAS_CONTROL_FISICO} días.</span>
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
          </>
        )}

        {carrito.notas && <div className="exh-card-body" style={{ marginTop: 10 }}>{carrito.notas}</div>}

        <div className="exh-info-section">
          <span className="exh-label">Turnos asignados ({turnosDelCarrito.length})</span>
          {turnosDelCarrito.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Sin turnos asignados a este carrito.</p>
          ) : (
            <div style={{ marginTop: 6 }}>
              {turnosDelCarrito.map((t) => (
                <TurnoMiniRow key={t.id} turno={t} puntos={puntos} hermanos={hermanos} carritos={carritos} ocultarCarritos />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
