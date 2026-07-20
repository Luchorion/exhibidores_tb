import { useMemo, useState } from "react";
import { Plus, List, LayoutGrid, Filter } from "lucide-react";
import { FRECUENCIAS } from "../../data/constants";
import { agruparTurnosPorDia, computeConflictMap, describeConflicto as describeConflictoUtil } from "../../utils/turnos";
import Modal from "../Modal";
import TurnoForm from "./TurnoForm";
import TurnoListView from "./TurnoListView";
import TurnoGridView from "./TurnoGridView";

const EMPTY_DRAFT = { dia: "", frecuencia: "Semanal", estado: "confirmado", horaInicio: "", horaFin: "", puntoId: "", carritoIds: [], hermanoIds: [], notas: "" };

export default function TurnosTab({
  puntos,
  carritos,
  hermanos,
  hermanosOrdenados,
  turnos,
  turnosOrdenados,
  conflictMap,
  onSaveTurno,
  onDeleteTurno,
}) {
  const [vista, setVista] = useState("lista");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroFrecuencia, setFiltroFrecuencia] = useState("todas");
  const [filtroPunto, setFiltroPunto] = useState("todos");

  const visibles = turnosOrdenados.filter((t) =>
    (filtroEstado === "todos" || (t.estado || "confirmado") === filtroEstado) &&
    (filtroFrecuencia === "todas" || (t.frecuencia || "Semanal") === filtroFrecuencia) &&
    (filtroPunto === "todos" || t.puntoId === filtroPunto)
  );
  const visiblesPorDia = useMemo(() => agruparTurnosPorDia(visibles), [visibles]);
  const hayFiltros = filtroEstado !== "todos" || filtroFrecuencia !== "todas" || filtroPunto !== "todos";

  function startNew() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setShowForm(true);
  }

  function startEdit(t) {
    setEditingId(t.id);
    setDraft({
      dia: t.dia || "",
      frecuencia: t.frecuencia || "Semanal",
      estado: t.estado || "confirmado",
      horaInicio: t.horaInicio || "",
      horaFin: t.horaFin || "",
      puntoId: t.puntoId || "",
      carritoIds: t.carritoIds || [],
      hermanoIds: t.hermanoIds || [],
      notas: t.notas || "",
    });
    setShowForm(true);
  }

  function cancelForm() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSave() {
    if (!draft.dia || !draft.horaInicio || !draft.puntoId) return;
    await onSaveTurno(draft, editingId);
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setShowForm(false);
  }

  const draftConflictos = useMemo(() => {
    if (!draft.dia || !draft.horaInicio || draft.hermanoIds.length === 0) return [];
    const draftAsTurno = { ...draft, id: "__draft__" };
    const otros = editingId ? turnos.filter((t) => t.id !== editingId) : turnos;
    const map = computeConflictMap([...otros, draftAsTurno]);
    return map["__draft__"] || [];
  }, [draft, turnos, editingId]);

  const describeConflicto = (conflicto) => describeConflictoUtil(conflicto, turnos, hermanos, puntos);

  return (
    <section>
      <div className="exh-section-head">
        <p className="exh-section-title">Programa de salidas</p>
        <div className="exh-section-actions">
          <div className="exh-toggle-group">
            <button type="button" className={`exh-toggle-btn ${vista === "lista" ? "active" : ""}`} onClick={() => setVista("lista")}><List size={13} /> Lista</button>
            <button type="button" className={`exh-toggle-btn ${vista === "grilla" ? "active" : ""}`} onClick={() => setVista("grilla")}><LayoutGrid size={13} /> Grilla</button>
          </div>
          <button type="button" className="exh-btn exh-btn-amber" onClick={startNew}>
            <Plus size={15} /> Nuevo turno
          </button>
        </div>
      </div>

      {turnosOrdenados.length > 0 && (
        <div className="exh-filter-bar">
          <Filter size={13} style={{ color: "var(--muted)", flexShrink: 0 }} />
          <select className="exh-select exh-select-sm" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="confirmado">Confirmados</option>
            <option value="propuesto">Propuestos</option>
          </select>
          <select className="exh-select exh-select-sm" value={filtroFrecuencia} onChange={(e) => setFiltroFrecuencia(e.target.value)}>
            <option value="todas">Todas las frecuencias</option>
            {FRECUENCIAS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="exh-select exh-select-sm" value={filtroPunto} onChange={(e) => setFiltroPunto(e.target.value)}>
            <option value="todos">Todos los puntos</option>
            {puntos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          {hayFiltros && (
            <button
              type="button"
              className="exh-btn exh-btn-ghost"
              style={{ padding: "5px 10px", fontSize: 12 }}
              onClick={() => { setFiltroEstado("todos"); setFiltroFrecuencia("todas"); setFiltroPunto("todos"); }}
            >
              Limpiar ({visibles.length}/{turnosOrdenados.length})
            </button>
          )}
        </div>
      )}

      {showForm && (
        <Modal title={editingId ? "Editar turno" : "Nuevo turno"} onClose={cancelForm}>
          <TurnoForm
            draft={draft}
            setDraft={setDraft}
            puntos={puntos}
            carritos={carritos}
            hermanosOrdenados={hermanosOrdenados}
            editingTurnoId={editingId}
            conflictos={draftConflictos}
            describeConflicto={describeConflicto}
            onSave={handleSave}
            onCancel={cancelForm}
          />
        </Modal>
      )}

      {turnosOrdenados.length === 0 ? (
        <div className="exh-empty">Todavía no hay turnos programados. Agregá el primero con "Nuevo turno".</div>
      ) : visibles.length === 0 ? (
        <div className="exh-empty">Ningún turno coincide con los filtros elegidos.</div>
      ) : vista === "lista" ? (
        <TurnoListView
          turnosPorDia={visiblesPorDia}
          puntos={puntos}
          carritos={carritos}
          hermanos={hermanos}
          conflictMap={conflictMap}
          describeConflicto={describeConflicto}
          onEdit={startEdit}
          onDelete={onDeleteTurno}
        />
      ) : (
        <TurnoGridView
          turnosPorDia={visiblesPorDia}
          puntos={puntos}
          carritos={carritos}
          hermanos={hermanos}
          conflictMap={conflictMap}
          onEdit={startEdit}
        />
      )}
    </section>
  );
}
