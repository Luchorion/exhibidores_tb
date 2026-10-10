import { useState } from "react";
import { Plus } from "lucide-react";
import { useEdicion } from "../../context/edicion";
import Modal from "../Modal";
import ConfirmDialog from "../ConfirmDialog";
import PuntoForm from "./PuntoForm";
import PuntoCard from "./PuntoCard";

const EMPTY_DRAFT = { nombre: "", observaciones: "" };

export default function PuntosTab({ puntos, turnos, onSavePunto, onDeletePunto }) {
  const modoEdicion = useEdicion();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [errores, setErrores] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [aBorrar, setABorrar] = useState(null);

  function startNew() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrores([]);
    setShowForm(true);
  }

  function startEdit(punto) {
    setEditingId(punto.id);
    setDraft({ nombre: punto.nombre, observaciones: punto.observaciones || "" });
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
    const nombre = draft.nombre.trim();
    const nuevos = [];
    if (!nombre) nuevos.push("Escribí el nombre del punto.");
    else if (puntos.some((p) => p.id !== editingId && p.nombre.trim().toLowerCase() === nombre.toLowerCase())) {
      nuevos.push("Ya hay un punto con ese nombre.");
    }
    setErrores(nuevos);
    if (nuevos.length) return;
    setGuardando(true);
    const ok = await onSavePunto({ ...draft, nombre }, editingId);
    setGuardando(false);
    if (ok) cancelForm();
  }

  const turnosDelABorrar = aBorrar ? turnos.filter((t) => t.puntoId === aBorrar.id).length : 0;

  return (
    <section>
      <div className="exh-section-head">
        <h2 className="exh-section-title">Puntos de predicación</h2>
        {modoEdicion && (
          <button type="button" className="exh-btn exh-btn-amber" onClick={startNew}><Plus size={15} /> Nuevo punto</button>
        )}
      </div>

      {showForm && (
        <Modal title={editingId ? "Editar punto" : "Nuevo punto"} onClose={cancelForm}>
          <PuntoForm draft={draft} setDraft={setDraft} errores={errores} guardando={guardando} onSave={handleSave} onCancel={cancelForm} />
        </Modal>
      )}

      {aBorrar && (
        <ConfirmDialog
          title="Borrar punto"
          message={
            `¿Borrar "${aBorrar.nombre}"?` +
            (turnosDelABorrar > 0 ? ` Tiene ${turnosDelABorrar === 1 ? "1 turno asignado, que va a quedar" : `${turnosDelABorrar} turnos asignados, que van a quedar`} sin punto hasta que los reasignes.` : "")
          }
          onConfirm={async () => {
            await onDeletePunto(aBorrar.id);
            setABorrar(null);
          }}
          onCancel={() => setABorrar(null)}
        />
      )}

      {puntos.length === 0 ? (
        <div className="exh-empty">No hay puntos cargados.</div>
      ) : (
        <div className="exh-cards">
          {puntos.map((p) => (
            <PuntoCard
              key={p.id}
              punto={p}
              turnosAsignados={turnos.filter((t) => t.puntoId === p.id).length}
              onEdit={startEdit}
              onDelete={setABorrar}
            />
          ))}
        </div>
      )}
    </section>
  );
}
