import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { ESTADOS_HERMANO } from "../../data/constants";
import { normalizarTexto } from "../../utils/text";
import { useEdicion } from "../../context/edicion";
import Modal from "../Modal";
import ConfirmDialog from "../ConfirmDialog";
import HermanoForm from "./HermanoForm";
import HermanoCard from "./HermanoCard";

const EMPTY_DRAFT = { nombre: "", estado: "pendiente", telefono: "", fechaAprobacion: "", disponibilidad: [], puntosPreferidos: [], notas: "" };

export default function HermanosTab({ hermanosOrdenados, puntos, turnos, onSaveHermano, onDeleteHermano }) {
  const modoEdicion = useEdicion();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTurnos, setFiltroTurnos] = useState("todos");
  const [errores, setErrores] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [aBorrar, setABorrar] = useState(null);

  const idsConTurno = useMemo(() => new Set(turnos.flatMap((t) => t.hermanoIds || [])), [turnos]);

  const visibles = hermanosOrdenados.filter((h) => {
    if (busqueda && !normalizarTexto(h.nombre).includes(normalizarTexto(busqueda))) return false;
    if (filtroEstado !== "todos" && h.estado !== filtroEstado) return false;
    if (filtroTurnos === "con" && !idsConTurno.has(h.id)) return false;
    if (filtroTurnos === "sin" && idsConTurno.has(h.id)) return false;
    return true;
  });

  function startNew() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrores([]);
    setShowForm(true);
  }

  function startEdit(h) {
    setEditingId(h.id);
    setDraft({
      nombre: h.nombre,
      estado: h.estado,
      telefono: h.telefono || "",
      fechaAprobacion: h.fechaAprobacion || "",
      disponibilidad: h.disponibilidad || [],
      puntosPreferidos: h.puntosPreferidos || [],
      notas: h.notas || "",
    });
    setErrores([]);
    setShowForm(true);
  }

  function cancelForm() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSave() {
    const nombre = draft.nombre.trim();
    const nuevos = [];
    if (!nombre) nuevos.push("Escribí el nombre.");
    else if (hermanosOrdenados.some((h) => h.id !== editingId && normalizarTexto(h.nombre.trim()) === normalizarTexto(nombre))) {
      nuevos.push("Ya hay un hermano con ese nombre.");
    }
    setErrores(nuevos);
    if (nuevos.length) return;
    setGuardando(true);
    const ok = await onSaveHermano({ ...draft, nombre }, editingId);
    setGuardando(false);
    if (ok) cancelForm();
  }

  const turnosDelABorrar = aBorrar ? turnos.filter((t) => (t.hermanoIds || []).includes(aBorrar.id)).length : 0;

  return (
    <section>
      <div className="exh-section-head">
        <h2 className="exh-section-title">Hermanos para exhibidores</h2>
        {modoEdicion && (
          <button type="button" className="exh-btn exh-btn-amber" onClick={startNew}><Plus size={15} /> Nuevo hermano</button>
        )}
      </div>

      {hermanosOrdenados.length > 0 && (
        <div className="exh-filter-bar">
          <div className="exh-search">
            <Search size={13} />
            <input
              className="exh-input"
              aria-label="Buscar hermano"
              placeholder="Buscar hermano…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <select className="exh-select exh-select-sm" aria-label="Filtrar por estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            {ESTADOS_HERMANO.map((e) => <option key={e.value} value={e.value}>{e.label}s</option>)}
          </select>
          <select className="exh-select exh-select-sm" aria-label="Filtrar por turnos" value={filtroTurnos} onChange={(e) => setFiltroTurnos(e.target.value)}>
            <option value="todos">Con y sin turno</option>
            <option value="con">Con turno</option>
            <option value="sin">Sin turno</option>
          </select>
          <span style={{ fontSize: 12, color: "var(--muted)" }} aria-live="polite">{visibles.length} de {hermanosOrdenados.length}</span>
        </div>
      )}

      {showForm && (
        <Modal title={editingId ? "Editar hermano" : "Nuevo hermano"} onClose={cancelForm}>
          <HermanoForm draft={draft} setDraft={setDraft} puntos={puntos} errores={errores} guardando={guardando} onSave={handleSave} onCancel={cancelForm} />
        </Modal>
      )}

      {aBorrar && (
        <ConfirmDialog
          title="Borrar hermano"
          message={
            `¿Borrar a ${aBorrar.nombre}?` +
            (turnosDelABorrar > 0 ? ` Se lo/la va a quitar de ${turnosDelABorrar === 1 ? "1 turno" : `${turnosDelABorrar} turnos`}.` : "")
          }
          onConfirm={async () => {
            await onDeleteHermano(aBorrar.id);
            setABorrar(null);
          }}
          onCancel={() => setABorrar(null)}
        />
      )}

      {hermanosOrdenados.length === 0 ? (
        <div className="exh-empty">Todavía no cargaste hermanos. Agregá el primero con "Nuevo hermano".</div>
      ) : visibles.length === 0 ? (
        <div className="exh-empty">Ningún hermano coincide con la búsqueda o los filtros.</div>
      ) : (
        <div className="exh-cards">
          {visibles.map((h) => (
            <HermanoCard key={h.id} hermano={h} puntos={puntos} turnos={turnos} onEdit={startEdit} onDelete={setABorrar} />
          ))}
        </div>
      )}
    </section>
  );
}
