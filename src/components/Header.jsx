export default function Header({
  operativos,
  totalCarritos,
  aprobadosCount,
  totalHermanos,
  aprobadosSinTurno,
  turnosConfirmados,
  turnosProgramados,
  carritosVencidos,
  totalTurnosConConflicto,
}) {
  return (
    <header className="exh-header">
      <h1 className="exh-title">Talleres Boulogne</h1>
      <div className="exh-board">
        <div className="exh-board-cell">
          <p className="exh-board-label">Carritos operativos</p>
          <p className="exh-board-value">{operativos} / {totalCarritos}</p>
        </div>
        <div className="exh-board-cell">
          <p className="exh-board-label">Hermanos aprobados</p>
          <p className="exh-board-value">{aprobadosCount} / {totalHermanos}</p>
        </div>
        <div className="exh-board-cell">
          <p className="exh-board-label">Aprobados sin turno</p>
          <p className={`exh-board-value ${aprobadosSinTurno > 0 ? "warn" : ""}`}>{aprobadosSinTurno}</p>
        </div>
        <div className="exh-board-cell" title="Turnos confirmados / total programado (incluye propuestos)">
          <p className="exh-board-label">Turnos confirmados</p>
          <p className="exh-board-value">{turnosConfirmados} / {turnosProgramados}</p>
        </div>
        <div className="exh-board-cell">
          <p className="exh-board-label">Mantenimiento vencido</p>
          <p className={`exh-board-value ${carritosVencidos > 0 ? "warn" : ""}`}>{carritosVencidos}</p>
        </div>
        <div className="exh-board-cell">
          <p className="exh-board-label">Conflictos</p>
          <p className={`exh-board-value ${totalTurnosConConflicto > 0 ? "danger" : ""}`}>{totalTurnosConConflicto}</p>
        </div>
      </div>
    </header>
  );
}
