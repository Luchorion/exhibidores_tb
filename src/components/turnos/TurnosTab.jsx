import { useMemo, useState } from "react";
import { Plus, List, LayoutGrid, CalendarDays, Filter, Printer, Share2 } from "lucide-react";
import { FRECUENCIAS } from "../../data/constants";
import {
  advertenciasTurno,
  agruparTurnosPorDia,
  computeConflictMap,
  describeConflicto as describeConflictoUtil,
  textoPrograma,
  validarTurno,
} from "../../utils/turnos";
import { useEdicion } from "../../context/edicion";
import Modal from "../Modal";
import ConfirmDialog from "../ConfirmDialog";
import TurnoForm from "./TurnoForm";
import TurnoListView from "./TurnoListView";
import TurnoGridView from "./TurnoGridView";
import TurnoSemanaView from "./TurnoSemanaView";

const EMPTY_DRAFT = { dia: "", frecuencia: "Semanal", semanas: [], estado: "confirmado", horaInicio: "", horaFin: "", puntoId: "", carritoIds: [], hermanoIds: [], notas: "" };

const VISTAS = [
  { key: "lista", label: "Lista", icon: List },
  { key: "grilla", label: "Grilla", icon: LayoutGrid },
  { key: "semana", label: "Esta semana", icon: CalendarDays },
];

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
  const modoEdicion = useEdicion();
  const [vista, setVista] = useState("lista");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [errores, setErrores] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [aBorrar, setABorrar] = useState(null);
  const [aviso, setAviso] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroFrecuencia, setFiltroFrecuencia] = useState("todas");
  const [filtroPunto, setFiltroPunto] = useState("todos");

  const visibles = useMemo(() => turnosOrdenados.filter((t) =>
    (filtroEstado === "todos" || (t.estado || "confirmado") === filtroEstado) &&
    (filtroFrecuencia === "todas" || (t.frecuencia || "Semanal") === filtroFrecuencia) &&
    (filtroPunto === "todos" || t.puntoId === filtroPunto)
  ), [turnosOrdenados, filtroEstado, filtroFrecuencia, filtroPunto]);
  const visiblesPorDia = useMemo(() => agruparTurnosPorDia(visibles), [visibles]);
  const hayFiltros = filtroEstado !== "todos" || filtroFrecuencia !== "todas" || filtroPunto !== "todos";

  function startNew() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrores([]);
    setShowForm(true);
  }

  function startEdit(t) {
    setEditingId(t.id);
    setDraft({
      dia: t.dia || "",
      frecuencia: t.frecuencia || "Semanal",
      semanas: t.semanas || [],
      estado: t.estado || "confirmado",
      horaInicio: t.horaInicio || "",
      horaFin: t.horaFin || "",
      puntoId: t.puntoId || "",
      carritoIds: t.carritoIds || [],
      hermanoIds: t.hermanoIds || [],
      notas: t.notas || "",
    });
    setErrores([]);
    setShowForm(true);
  }

  function cancelForm() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setErrores([]);
    setShowForm(false);
  }

  async function handleSave() {
    const nuevos = validarTurno(draft);
    setErrores(nuevos);
    if (nuevos.length) return;
    setGuardando(true);
    const ok = await onSaveTurno(draft, editingId);
    setGuardando(false);
    if (ok) cancelForm();
  }

  const draftConflictos = useMemo(() => {
    if (!draft.dia || !draft.horaInicio || (draft.hermanoIds.length === 0 && draft.carritoIds.length === 0)) return [];
    const draftAsTurno = { ...draft, id: "__draft__" };
    const otros = editingId ? turnos.filter((t) => t.id !== editingId) : turnos;
    const map = computeConflictMap([...otros, draftAsTurno]);
    return map["__draft__"] || [];
  }, [draft, turnos, editingId]);

  const draftAdvertencias = useMemo(() => advertenciasTurno(draft, hermanos), [draft, hermanos]);

  const describeConflicto = (conflicto) => describeConflictoUtil(conflicto, turnos, hermanos, puntos, carritos);

  async function compartir() {
    const texto = textoPrograma(visibles, { puntos, hermanos, carritos });
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ text: texto });
        return;
      }
      await navigator.clipboard.writeText(texto);
      setAviso("Programa copiado. Pegalo en WhatsApp o donde quieras.");
    } catch (err) {
      if (err?.name !== "AbortError") setAviso("No se pudo copiar el programa.");
    }
    setTimeout(() => setAviso(""), 4000);
  }

  return (
    <section>
      <div className="exh-section-head">
        <h2 className="exh-section-title">Programa de salidas</h2>
        <div className="exh-section-actions">
          <div className="exh-toggle-group" role="group" aria-label="Vista">
            {VISTAS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className={`exh-toggle-btn ${vista === key ? "active" : ""}`}
                aria-pressed={vista === key}
                onClick={() => setVista(key)}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
          {turnosOrdenados.length > 0 && (
            <>
              <button type="button" className="exh-btn exh-btn-ghost exh-no-print" onClick={compartir} title="Copiar el programa como texto para WhatsApp">
                <Share2 size={14} /> Compartir
              </button>
              <button type="button" className="exh-btn exh-btn-ghost exh-no-print" onClick={() => window.print()} title="Imprimir o guardar como PDF">
                <Printer size={14} /> Imprimir
              </button>
            </>
          )}
          {modoEdicion && (
            <button type="button" className="exh-btn exh-btn-amber exh-no-print" onClick={startNew}>
              <Plus size={15} /> Nuevo turno
            </button>
          )}
        </div>
      </div>

      {aviso && <div className="exh-toast" role="status">{aviso}</div>}

      {turnosOrdenados.length > 0 && (
        <div className="exh-filter-bar exh-no-print">
          <Filter size={13} style={{ color: "var(--muted)", flexShrink: 0 }} />
          <select className="exh-select exh-select-sm" aria-label="Filtrar por estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="confirmado">Confirmados</option>
            <option value="propuesto">Propuestos</option>
          </select>
          <select className="exh-select exh-select-sm" aria-label="Filtrar por frecuencia" value={filtroFrecuencia} onChange={(e) => setFiltroFrecuencia(e.target.value)}>
            <option value="todas">Todas las frecuencias</option>
            {FRECUENCIAS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="exh-select exh-select-sm" aria-label="Filtrar por punto" value={filtroPunto} onChange={(e) => setFiltroPunto(e.target.value)}>
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
            advertencias={draftAdvertencias}
            errores={errores}
            guardando={guardando}
            describeConflicto={describeConflicto}
            onSave={handleSave}
            onCancel={cancelForm}
          />
        </Modal>
      )}

      {aBorrar && (
        <ConfirmDialog
          title="Borrar turno"
          message={`¿Borrar el turno del ${aBorrar.dia} a las ${aBorrar.horaInicio}${puntos.find((p) => p.id === aBorrar.puntoId) ? ` en ${puntos.find((p) => p.id === aBorrar.puntoId).nombre}` : ""}?`}
          onConfirm={async () => {
            await onDeleteTurno(aBorrar.id);
            setABorrar(null);
          }}
          onCancel={() => setABorrar(null)}
        />
      )}

      {turnosOrdenados.length === 0 ? (
        <div className="exh-empty">Todavía no hay turnos programados.{modoEdicion ? ' Agregá el primero con "Nuevo turno".' : ""}</div>
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
          onDelete={setABorrar}
        />
      ) : vista === "grilla" ? (
        <TurnoGridView
          turnosPorDia={visiblesPorDia}
          puntos={puntos}
          carritos={carritos}
          hermanos={hermanos}
          conflictMap={conflictMap}
          onEdit={startEdit}
        />
      ) : (
        <TurnoSemanaView turnosOrdenados={visibles} puntos={puntos} carritos={carritos} hermanos={hermanos} />
      )}
    </section>
  );
}
