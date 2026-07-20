import { useState } from "react";
import { Plus } from "lucide-react";
import HermanoForm from "./HermanoForm";
import HermanoCard from "./HermanoCard";

const EMPTY_DRAFT = { nombre: "", estado: "pendiente", fechaAprobacion: "", disponibilidad: [], puntosPreferidos: [], notas: "" };

export default function HermanosTab({ hermanosOrdenados, puntos, turnos, onSaveHermano, onDeleteHermano }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  function startNew() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setShowForm(true);
  }

  function startEdit(h) {
    setEditingId(h.id);
    setDraft({
      nombre: h.nombre,
      estado: h.estado,
      fechaAprobacion: h.fechaAprobacion || "",
      disponibilidad: h.disponibilidad || [],
      puntosPreferidos: h.puntosPreferidos || [],
      notas: h.notas || "",
    });
    setShowForm(true);
  }

  function cancelForm() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSave() {
    if (!draft.nombre.trim()) return;
    await onSaveHermano(draft, editingId);
    cancelForm();
  }

  return (
    <section>
      <div className="exh-section-head">
        <p className="exh-section-title">Hermanos para exhibidores</p>
        <button type="button" className="exh-btn exh-btn-amber" onClick={startNew}><Plus size={15} /> Nuevo hermano</button>
      </div>

      {showForm && (
        <HermanoForm draft={draft} setDraft={setDraft} puntos={puntos} onSave={handleSave} onCancel={cancelForm} />
      )}

      {hermanosOrdenados.length === 0 ? (
        <div className="exh-empty">Todavía no cargaste hermanos. Agregá el primero con "Nuevo hermano".</div>
      ) : (
        <div className="exh-cards">
          {hermanosOrdenados.map((h) => (
            <HermanoCard key={h.id} hermano={h} puntos={puntos} turnos={turnos} onEdit={startEdit} onDelete={onDeleteHermano} />
          ))}
        </div>
      )}
    </section>
  );
}
