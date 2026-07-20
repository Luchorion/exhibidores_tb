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
  modoEdicion,
  onToggleEdicion,
}) {
  return (
    <header className="exh-header">
      <div className="exh-header-top">
        <h1 className="exh-title">Talleres Boulogne</h1>
        <button
          type="button"
          className={`exh-switch ${modoEdicion ? "on" : ""}`}
          onClick={onToggleEdicion}
          aria-pressed={modoEdicion}
          title={modoEdicion ? "Modo edición activado: podés crear, editar y borrar" : "Modo solo lectura: activá la edición para hacer cambios"}
        >
          <span className="exh-switch-label">Edición</span>
          <span className="exh-switch-track"><span className="exh-switch-thumb" /></span>
        </button>
      </div>
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
