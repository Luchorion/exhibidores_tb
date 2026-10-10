import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { EdicionContext } from "./context/edicion";
import { InfoPanelContext } from "./context/infoPanel";
import { useAppData } from "./hooks/useAppData";
import { useAuth } from "./hooks/useAuth";
import { uid } from "./utils/id";
import { hoyISO } from "./utils/dates";
import { ordenarTurnos, computeConflictMap } from "./utils/turnos";
import { carritoVencido, registrarMantenimiento } from "./utils/carritos";
import Header from "./components/Header";
import NavTabs from "./components/NavTabs";
import LoginDialog from "./components/LoginDialog";
import TurnosTab from "./components/turnos/TurnosTab";
import PuntosTab from "./components/puntos/PuntosTab";
import CarritosTab from "./components/carritos/CarritosTab";
import HermanosTab from "./components/hermanos/HermanosTab";
import HermanoInfoModal from "./components/info/HermanoInfoModal";
import PuntoInfoModal from "./components/info/PuntoInfoModal";
import CarritoInfoModal from "./components/info/CarritoInfoModal";

function leerPreferenciaEdicion() {
  try {
    return localStorage.getItem("exh-modo-edicion") === "1";
  } catch {
    return false;
  }
}

// Guarda o agrega un item por id. El id de uno nuevo se genera afuera para
// que sea el mismo si useAppData tiene que reintentar el guardado.
function upsert(list, id, draft) {
  return list.some((x) => x.id === id)
    ? list.map((x) => (x.id === id ? { ...x, ...draft } : x))
    : [...list, { id, ...draft }];
}

export default function App() {
  const [tab, setTab] = useState("turnos");
  const [preferenciaEdicion, setPreferenciaEdicion] = useState(leerPreferenciaEdicion);
  const [infoAbierta, setInfoAbierta] = useState(null); // { tipo: "hermano"|"punto"|"carrito", id }
  const [loginAbierto, setLoginAbierto] = useState(false);
  const auth = useAuth();

  const {
    loading,
    loadError,
    reload,
    refresh,
    puntos,
    carritos,
    turnos,
    hermanos: hermanosBase,
    contactos,
    saveError,
    clearSaveError,
    mutate,
  } = useAppData();

  // Al ingresar o salir cambia lo que se puede leer (los teléfonos).
  const sessionUserId = auth.session?.user?.id;
  useEffect(() => {
    if (!loading) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUserId]);

  // El teléfono se guarda aparte (ver "contactos" en useAppData) y se junta
  // acá para mostrarlo.
  const hermanos = useMemo(() => {
    const telefonos = new Map(contactos.map((c) => [c.id, c.telefono]));
    return hermanosBase.map((h) => ({ ...h, telefono: telefonos.get(h.id) || "" }));
  }, [hermanosBase, contactos]);

  // Editar requiere estar logueado (las policies de Supabase lo exigen igual)
  // y que los datos hayan cargado bien.
  const puedeEditar = Boolean(auth.session) && !loadError;
  const modoEdicion = puedeEditar && preferenciaEdicion;

  function abrirInfo(tipo, id) {
    setInfoAbierta({ tipo, id });
  }

  function toggleEdicion() {
    setPreferenciaEdicion((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("exh-modo-edicion", next ? "1" : "0");
      } catch {
        // Sin localStorage (modo privado): la preferencia dura solo esta sesión.
      }
      return next;
    });
  }

  // ---------- Turnos ----------
  const turnosOrdenados = useMemo(() => ordenarTurnos(turnos), [turnos]);
  const conflictMap = useMemo(() => computeConflictMap(turnos), [turnos]);
  const totalTurnosConConflicto = Object.keys(conflictMap).length;

  function saveTurno(draft, editingId) {
    const id = editingId || uid();
    return mutate("turnos", (list) => upsert(list, id, draft));
  }

  function deleteTurno(id) {
    return mutate("turnos", (list) => list.filter((t) => t.id !== id));
  }

  // ---------- Puntos ----------
  function savePunto(draft, editingId) {
    const id = editingId || uid();
    return mutate("puntos", (list) => upsert(list, id, draft));
  }

  async function deletePunto(id) {
    const ok = await mutate("puntos", (list) => list.filter((p) => p.id !== id));
    if (!ok) return false;
    // Los turnos de ese punto quedan como "Punto sin definir" para que se
    // reasignen, y se lo saca de las preferencias de los hermanos.
    if (turnos.some((t) => t.puntoId === id)) {
      await mutate("turnos", (list) => list.map((t) => (t.puntoId === id ? { ...t, puntoId: "" } : t)));
    }
    if (hermanos.some((h) => (h.puntosPreferidos || []).includes(id))) {
      await mutate("hermanos", (list) =>
        list.map((h) => ((h.puntosPreferidos || []).includes(id) ? { ...h, puntosPreferidos: h.puntosPreferidos.filter((p) => p !== id) } : h))
      );
    }
    return true;
  }

  // ---------- Carritos ----------
  async function saveCarrito(id, patch) {
    const ok = await mutate("carritos", (list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    if (!ok) return false;

    // Solo un carrito operativo está en la calle; si pasa a repuesto o
    // pendiente se lo saca de los turnos donde estuviera asignado.
    if (patch.estado && patch.estado !== "operativo" && turnos.some((t) => (t.carritoIds || []).includes(id))) {
      await mutate("turnos", (list) =>
        list.map((t) => ((t.carritoIds || []).includes(id) ? { ...t, carritoIds: t.carritoIds.filter((cid) => cid !== id) } : t))
      );
    }
    return true;
  }

  function registrarMantenimientoHoy(carrito, tipo) {
    const hoy = hoyISO();
    return mutate("carritos", (list) => list.map((c) => (c.id === carrito.id ? registrarMantenimiento(c, tipo, hoy) : c)));
  }

  // ---------- Hermanos ----------
  async function saveHermano(draft, editingId) {
    const id = editingId || uid();
    const { telefono = "", ...datos } = draft;
    const ok = await mutate("hermanos", (list) => upsert(list, id, datos));
    if (!ok) return false;
    const telefonoActual = contactos.find((c) => c.id === id)?.telefono || "";
    if (telefono.trim() === telefonoActual) return true;
    return mutate("contactos", (list) => {
      const resto = list.filter((c) => c.id !== id);
      return telefono.trim() ? [...resto, { id, telefono: telefono.trim() }] : resto;
    });
  }

  async function deleteHermano(id) {
    const ok = await mutate("hermanos", (list) => list.filter((h) => h.id !== id));
    if (!ok) return false;
    if (contactos.some((c) => c.id === id)) {
      await mutate("contactos", (list) => list.filter((c) => c.id !== id));
    }
    if (turnos.some((t) => (t.hermanoIds || []).includes(id))) {
      await mutate("turnos", (list) =>
        list.map((t) => ((t.hermanoIds || []).includes(id) ? { ...t, hermanoIds: t.hermanoIds.filter((h) => h !== id) } : t))
      );
    }
    return true;
  }

  const hermanosOrdenados = useMemo(() => [...hermanos].sort((a, b) => a.nombre.localeCompare(b.nombre)), [hermanos]);

  // ---------- KPIs ----------
  const aprobadosCount = hermanos.filter((h) => h.estado === "aprobado").length;
  const idsConTurno = new Set(turnos.flatMap((t) => t.hermanoIds || []));
  const aprobadosSinTurno = hermanos.filter((h) => h.estado === "aprobado" && !idsConTurno.has(h.id)).length;
  const operativos = carritos.filter((c) => c.estado === "operativo").length;
  const turnosConfirmados = turnos.filter((t) => (t.estado || "confirmado") === "confirmado").length;
  const carritosVencidos = carritos.filter((c) => carritoVencido(c)).length;

  if (loading) {
    return (
      <div className="exh-root">
        <div className="exh-loading" role="status">CARGANDO PANEL…</div>
      </div>
    );
  }

  return (
    <EdicionContext.Provider value={modoEdicion}>
    <InfoPanelContext.Provider value={abrirInfo}>
    <div className="exh-root">
      <Header
        operativos={operativos}
        totalCarritos={carritos.length}
        aprobadosCount={aprobadosCount}
        totalHermanos={hermanos.length}
        aprobadosSinTurno={aprobadosSinTurno}
        turnosConfirmados={turnosConfirmados}
        turnosProgramados={turnos.length}
        carritosVencidos={carritosVencidos}
        totalTurnosConConflicto={totalTurnosConConflicto}
        email={auth.email}
        puedeEditar={puedeEditar}
        modoEdicion={modoEdicion}
        onToggleEdicion={toggleEdicion}
        onLogin={() => setLoginAbierto(true)}
        onLogout={auth.salir}
      />

      <NavTabs tab={tab} setTab={setTab} />

      <main className="exh-content">
        {auth.authError && (
          <div className="exh-alert" role="alert">
            <span>{auth.authError}</span>
            <button type="button" className="exh-icon-btn" onClick={auth.clearAuthError} aria-label="Cerrar aviso"><X size={14} /></button>
          </div>
        )}
        {loadError && (
          <div className="exh-alert" role="alert">
            <span>{loadError}</span>
            <button type="button" className="exh-btn exh-btn-ghost" onClick={reload}>Reintentar</button>
          </div>
        )}
        {saveError && (
          <div className="exh-alert" role="alert">
            <span>{saveError}</span>
            <button type="button" className="exh-icon-btn" onClick={clearSaveError} aria-label="Cerrar aviso"><X size={14} /></button>
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
            conflictMap={conflictMap}
            onSaveTurno={saveTurno}
            onDeleteTurno={deleteTurno}
          />
        )}

        {tab === "puntos" && (
          <PuntosTab puntos={puntos} turnos={turnos} onSavePunto={savePunto} onDeletePunto={deletePunto} />
        )}

        {tab === "carritos" && (
          <CarritosTab
            carritos={carritos}
            turnos={turnos}
            onSaveCarrito={saveCarrito}
            onRegistrarMantenimiento={registrarMantenimientoHoy}
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

      {loginAbierto && <LoginDialog onIngresar={auth.ingresarConPassword} onEnviarLink={auth.enviarLink} onClose={() => setLoginAbierto(false)} />}

      {infoAbierta?.tipo === "hermano" && (
        <HermanoInfoModal
          hermanoId={infoAbierta.id}
          hermanos={hermanos}
          puntos={puntos}
          carritos={carritos}
          turnos={turnos}
          onClose={() => setInfoAbierta(null)}
        />
      )}
      {infoAbierta?.tipo === "punto" && (
        <PuntoInfoModal
          puntoId={infoAbierta.id}
          puntos={puntos}
          hermanos={hermanos}
          carritos={carritos}
          turnos={turnos}
          onClose={() => setInfoAbierta(null)}
        />
      )}
      {infoAbierta?.tipo === "carrito" && (
        <CarritoInfoModal
          carritoId={infoAbierta.id}
          carritos={carritos}
          hermanos={hermanos}
          puntos={puntos}
          turnos={turnos}
          onClose={() => setInfoAbierta(null)}
        />
      )}
    </div>
    </InfoPanelContext.Provider>
    </EdicionContext.Provider>
  );
}
