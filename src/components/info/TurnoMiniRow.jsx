import { Clock } from "lucide-react";
import { useInfoPanel } from "../../context/infoPanel";
import { estadoHermanoLabel } from "../../utils/hermanos";

// Resumen compacto de un turno, reutilizado dentro de las tres fichas de
// info (hermano/punto/carrito). ocultarPunto/ocultarHermanos/ocultarCarritos
// evita repetir la entidad cuya ficha ya se está mostrando.
export default function TurnoMiniRow({ turno, puntos, hermanos, carritos, ocultarPunto, ocultarHermanos, ocultarCarritos }) {
  const abrirInfo = useInfoPanel();
  const punto = puntos.find((p) => p.id === turno.puntoId);
  const hermanosDelTurno = hermanos.filter((h) => (turno.hermanoIds || []).includes(h.id));
  const carritosDelTurno = carritos.filter((c) => (turno.carritoIds || []).includes(c.id));
  const esPropuesto = turno.estado === "propuesto";

  return (
    <div className={`exh-mini-turno ${esPropuesto ? "propuesto" : ""}`}>
      <div className="exh-mini-turno-head">
        <Clock size={12} />
        <span>{turno.dia}</span>
        <span>{turno.horaInicio}{turno.horaFin ? `–${turno.horaFin}` : ""}</span>
        {esPropuesto && <span className="exh-badge exh-badge-amber">Propuesto</span>}
      </div>

      {!ocultarPunto && (
        <div className="exh-mini-turno-point">
          {punto ? (
            <button type="button" className="exh-link" onClick={() => abrirInfo("punto", punto.id)}>{punto.nombre}</button>
          ) : (
            <span style={{ color: "var(--muted)" }}>Punto sin definir</span>
          )}
        </div>
      )}

      {!ocultarHermanos && hermanosDelTurno.length > 0 && (
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
      )}

      {!ocultarCarritos && carritosDelTurno.length > 0 && (
        <div className="exh-row-tags">
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
      )}
    </div>
  );
}
