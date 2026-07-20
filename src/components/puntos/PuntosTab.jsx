import { useState } from "react";
import { Plus } from "lucide-react";
import PuntoForm from "./PuntoForm";
import PuntoCard from "./PuntoCard";

const EMPTY_DRAFT = { nombre: "", observaciones: "" };

export default function PuntosTab({ puntos, turnos, onSavePunto, onDeletePunto }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  function startNew() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setShowForm(true);
  }

  function startEdit(punto) {
    setEditingId(punto.id);
    setDraft({ nombre: punto.nombre, observaciones: punto.observaciones });
    setShowForm(true);
  }

  function cancelForm() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSave() {
    if (!draft.nombre.trim()) return;
    await onSavePunto(draft, editingId);
    cancelForm();
  }

  return (
    <section>
      <div className="exh-section-head">
        <p className="exh-section-title">Puntos de predicación</p>
        <button type="button" className="exh-btn exh-btn-amber" onClick={startNew}><Plus size={15} /> Nuevo punto</button>
      </div>

      {showForm && (
        <PuntoForm draft={draft} setDraft={setDraft} onSave={handleSave} onCancel={cancelForm} />
      )}

      <div className="exh-cards">
        {puntos.map((p) => (
          <PuntoCard
            key={p.id}
            punto={p}
            turnosAsignados={turnos.filter((t) => t.puntoId === p.id).length}
            onEdit={startEdit}
            onDelete={onDeletePunto}
          />
        ))}
      </div>
    </section>
  );
}
