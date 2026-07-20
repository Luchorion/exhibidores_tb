import { useMemo, useState } from "react";
import { Plus, X, List, LayoutGrid } from "lucide-react";
import { computeConflictMap, describeConflicto as describeConflictoUtil } from "../../utils/turnos";
import TurnoForm from "./TurnoForm";
import TurnoListView from "./TurnoListView";
import TurnoGridView from "./TurnoGridView";

const EMPTY_DRAFT = { dia: "", frecuencia: "Semanal", horaInicio: "", horaFin: "", puntoId: "", carritoIds: [], hermanoIds: [], notas: "" };

export default function TurnosTab({
  puntos,
  carritos,
  hermanos,
  hermanosOrdenados,
  turnos,
  turnosOrdenados,
  turnosPorDia,
  conflictMap,
  onSaveTurno,
  onDeleteTurno,
}) {
  const [vista, setVista] = useState("lista");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

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
          <button type="button" className="exh-btn exh-btn-amber" onClick={() => (showForm ? cancelForm() : startNew())}>
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? "Cancelar" : "Nuevo turno"}
          </button>
        </div>
      </div>

      {showForm && (
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
      )}

      {turnosOrdenados.length === 0 ? (
        <div className="exh-empty">Todavía no hay turnos programados. Agregá el primero con "Nuevo turno".</div>
      ) : vista === "lista" ? (
        <TurnoListView
          turnosPorDia={turnosPorDia}
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
          turnosPorDia={turnosPorDia}
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
