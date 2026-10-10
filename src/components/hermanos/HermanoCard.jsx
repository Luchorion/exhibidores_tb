import { User, Pencil, Trash2, Clock, Phone, MessageCircle } from "lucide-react";
import { formatFechaCorta } from "../../utils/dates";
import { estadoHermanoBadgeClass, estadoHermanoLabel, whatsappLink } from "../../utils/hermanos";
import { describeFrecuencia, turnosDeHermano } from "../../utils/turnos";
import { useEdicion } from "../../context/edicion";
import { useInfoPanel } from "../../context/infoPanel";

export function ContactoHermano({ telefono }) {
  if (!telefono) return null;
  const wa = whatsappLink(telefono);
  return (
    <div className="exh-meta-row">
      <span>Teléfono</span>
      <strong className="exh-contacto">
        <a href={`tel:${telefono.replace(/[^\d+]/g, "")}`} className="exh-contacto-link"><Phone size={12} /> {telefono}</a>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="exh-contacto-link" aria-label={`WhatsApp a ${telefono}`} title="Abrir WhatsApp">
            <MessageCircle size={12} /> WhatsApp
          </a>
        )}
      </strong>
    </div>
  );
}

export default function HermanoCard({ hermano, puntos, turnos, onEdit, onDelete }) {
  const modoEdicion = useEdicion();
  const abrirInfo = useInfoPanel();
  const puntosPreferidos = (hermano.puntosPreferidos || [])
    .map((pid) => puntos.find((p) => p.id === pid))
    .filter(Boolean);

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
            <button type="button" className="exh-icon-btn" aria-label={`Editar a ${hermano.nombre}`} title="Editar" onClick={() => onEdit(hermano)}><Pencil size={14} /></button>
            <button type="button" className="exh-icon-btn" aria-label={`Borrar a ${hermano.nombre}`} title="Borrar" onClick={() => onDelete(hermano)}><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      <ContactoHermano telefono={hermano.telefono} />
      <div className="exh-meta-row"><span>Fecha aprobación</span><strong>{hermano.fechaAprobacion ? formatFechaCorta(hermano.fechaAprobacion) : "Sin registro"}</strong></div>
      <div className="exh-meta-row"><span>Disponibilidad</span><strong>{hermano.disponibilidad && hermano.disponibilidad.length ? hermano.disponibilidad.join(", ") : "Sin definir"}</strong></div>

      <div className="exh-meta-row">
        <span>Puntos</span>
        {puntosPreferidos.length === 0 ? (
          <strong>Sin preferencia</strong>
        ) : (
          <strong>
            {puntosPreferidos.map((p, i) => (
              <span key={p.id}>
                {i > 0 && ", "}
                <button type="button" className="exh-link" style={{ display: "inline", width: "auto" }} onClick={() => abrirInfo("punto", p.id)}>{p.nombre}</button>
              </span>
            ))}
          </strong>
        )}
      </div>

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
                  <span>·</span>
                  {punto ? (
                    <button type="button" className="exh-link" style={{ display: "inline", width: "auto" }} onClick={() => abrirInfo("punto", punto.id)}>{punto.nombre}</button>
                  ) : (
                    <span>Punto sin definir</span>
                  )}
                  <span className="exh-badge exh-badge-amber">{describeFrecuencia(t)}</span>
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
