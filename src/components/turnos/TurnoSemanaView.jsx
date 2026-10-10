import { diaSemanaDe, formatFechaCorta, proximosDias, toISODate } from "../../utils/dates";
import { turnoOcurreEn } from "../../utils/turnos";
import TurnoMiniRow from "../info/TurnoMiniRow";

const DIAS_A_MOSTRAR = 7;

// Los próximos 7 días con fechas reales: qué turnos salen cada día según su
// frecuencia y semanas del mes.
export default function TurnoSemanaView({ turnosOrdenados, puntos, carritos, hermanos }) {
  const dias = proximosDias(DIAS_A_MOSTRAR);
  return dias.map((fecha, i) => {
    const delDia = turnosOrdenados.filter((t) => turnoOcurreEn(t, fecha));
    const iso = toISODate(fecha);
    return (
      <div className="exh-date-group" key={iso}>
        <div className="exh-date-label">
          {i === 0 ? "Hoy · " : i === 1 ? "Mañana · " : ""}{diaSemanaDe(fecha)} {formatFechaCorta(iso).slice(0, 5)}
        </div>
        {delDia.length === 0 ? (
          <p className="exh-grid-sub" style={{ marginBottom: 6 }}>Sin salidas.</p>
        ) : (
          delDia.map((t) => <TurnoMiniRow key={t.id} turno={t} puntos={puntos} hermanos={hermanos} carritos={carritos} />)
        )}
      </div>
    );
  });
}
