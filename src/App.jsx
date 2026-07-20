import { useMemo, useState } from "react";
import { useAppData } from "./hooks/useAppData";
import { uid } from "./utils/id";
import { ordenarTurnos, agruparTurnosPorDia, computeConflictMap } from "./utils/turnos";
import { carritoVencido } from "./utils/carritos";
import { DIAS_CONTROL_FISICO, DIAS_REVISION_PUBLICACIONES } from "./data/constants";
import Header from "./components/Header";
import NavTabs from "./components/NavTabs";
import TurnosTab from "./components/turnos/TurnosTab";
import PuntosTab from "./components/puntos/PuntosTab";
import CarritosTab from "./components/carritos/CarritosTab";
import HermanosTab from "./components/hermanos/HermanosTab";

export default function App() {
  const [tab, setTab] = useState("turnos");
  const {
    loading,
    puntos, setPuntos,
    carritos, setCarritos,
    turnos, setTurnos,
    hermanos, setHermanos,
    saveError,
    persist,
    KEYS,
  } = useAppData();

  // ---------- Turnos ----------
  const turnosOrdenados = useMemo(() => ordenarTurnos(turnos), [turnos]);
  const turnosPorDia = useMemo(() => agruparTurnosPorDia(turnosOrdenados), [turnosOrdenados]);
  const conflictMap = useMemo(() => computeConflictMap(turnos), [turnos]);
  const totalTurnosConConflicto = Object.keys(conflictMap).length;

  async function saveTurno(draft, editingId) {
    const next = editingId
      ? turnos.map((t) => (t.id === editingId ? { ...t, ...draft } : t))
      : [...turnos, { id: uid(), ...draft }];
    setTurnos(next);
    await persist(KEYS.turnos, next);
  }

  async function deleteTurno(id) {
    const next = turnos.filter((t) => t.id !== id);
    setTurnos(next);
    await persist(KEYS.turnos, next);
  }

  // ---------- Puntos ----------
  async function savePunto(draft, editingId) {
    const next = editingId
      ? puntos.map((p) => (p.id === editingId ? { ...p, ...draft } : p))
      : [...puntos, { id: uid(), ...draft }];
    setPuntos(next);
    await persist(KEYS.puntos, next);
  }

  async function deletePunto(id) {
    const next = puntos.filter((p) => p.id !== id);
    setPuntos(next);
    await persist(KEYS.puntos, next);
  }

  // ---------- Carritos ----------
  async function saveCarrito(id, patch) {
    const next = carritos.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setCarritos(next);
    await persist(KEYS.carritos, next);
  }

  async function marcarControlFisicoHoy(carrito) {
    const hoy = new Date().toISOString().slice(0, 10);
    const next = carritos.map((c) => (c.id === carrito.id ? { ...c, ultimoControlFisico: hoy } : c));
    setCarritos(next);
    await persist(KEYS.carritos, next);
  }

  async function marcarRevisionPublicacionesHoy(carrito) {
    const hoy = new Date().toISOString().slice(0, 10);
    const next = carritos.map((c) => (c.id === carrito.id ? { ...c, ultimaRevisionPublicaciones: hoy } : c));
    setCarritos(next);
    await persist(KEYS.carritos, next);
  }

  // ---------- Hermanos ----------
  async function saveHermano(draft, editingId) {
    const next = editingId
      ? hermanos.map((h) => (h.id === editingId ? { ...h, ...draft } : h))
      : [...hermanos, { id: uid(), ...draft }];
    setHermanos(next);
    await persist(KEYS.hermanos, next);
  }

  async function deleteHermano(id) {
    const next = hermanos.filter((h) => h.id !== id);
    setHermanos(next);
    await persist(KEYS.hermanos, next);
  }

  const hermanosOrdenados = useMemo(() => [...hermanos].sort((a, b) => a.nombre.localeCompare(b.nombre)), [hermanos]);

  // ---------- KPIs ----------
  const aprobadosCount = hermanos.filter((h) => h.estado === "aprobado").length;
  const idsConTurno = new Set(turnos.flatMap((t) => t.hermanoIds || []));
  const aprobadosSinTurno = hermanos.filter((h) => h.estado === "aprobado" && !idsConTurno.has(h.id)).length;
  const operativos = carritos.filter((c) => c.estado === "operativo").length;
  const carritosVencidos = carritos.filter((c) => carritoVencido(c, DIAS_CONTROL_FISICO, DIAS_REVISION_PUBLICACIONES)).length;

  if (loading) {
    return (
      <div className="exh-root">
        <div className="exh-loading">CARGANDO PANEL…</div>
      </div>
    );
  }

  return (
    <div className="exh-root">
      <Header
        operativos={operativos}
        totalCarritos={carritos.length}
        aprobadosCount={aprobadosCount}
        totalHermanos={hermanos.length}
        aprobadosSinTurno={aprobadosSinTurno}
        turnosProgramados={turnos.length}
        carritosVencidos={carritosVencidos}
        totalTurnosConConflicto={totalTurnosConConflicto}
      />

      <NavTabs tab={tab} setTab={setTab} />

      <main className="exh-content">
        {saveError && (
          <div className="exh-form" style={{ borderLeft: "4px solid var(--rust)", marginBottom: 16, fontSize: 13 }}>
            {saveError}
          </div>
        )}

        {tab === "turnos" && (
          <TurnosTab
            puntos={puntos}
            carritos={carritos}
            hermanos={hermanos}
            hermanosOrdenados={hermanosOrdenados}
            turnos={turnos}
            turnosOrdenados={turnosOrdenados}
            turnosPorDia={turnosPorDia}
            conflictMap={conflictMap}
            onSaveTurno={saveTurno}
            onDeleteTurno={deleteTurno}
          />
        )}

        {tab === "puntos" && (
          <PuntosTab puntos={puntos} onSavePunto={savePunto} onDeletePunto={deletePunto} />
        )}

        {tab === "carritos" && (
          <CarritosTab
            carritos={carritos}
            onSaveCarrito={saveCarrito}
            onMarkControl={marcarControlFisicoHoy}
            onMarkRevision={marcarRevisionPublicacionesHoy}
          />
        )}

        {tab === "hermanos" && (
          <HermanosTab
            hermanosOrdenados={hermanosOrdenados}
            puntos={puntos}
            turnos={turnos}
            onSaveHermano={saveHermano}
            onDeleteHermano={deleteHermano}
          />
        )}
      </main>
    </div>
  );
}
