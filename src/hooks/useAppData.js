import { useCallback, useEffect, useRef, useState } from "react";
import { getAllData, getData, subscribeChanges, writeData } from "../lib/storage";
import { DEFAULT_PUNTOS, DEFAULT_CARRITOS, DEFAULT_HERMANOS } from "../data/constants";
import { normalizePunto } from "../utils/puntos";
import { normalizeCarrito } from "../utils/carritos";
import { normalizeTurno } from "../utils/turnos";
import { normalizeHermano } from "../utils/hermanos";

// Cada "slice" es una de las cuatro listas, con su clave en app_state, cómo
// adaptar datos viejos al cargarlos y con qué sembrarla si nunca se guardó.
const SLICES = {
  puntos: { key: "puntos-data", normalize: normalizePunto, fallback: DEFAULT_PUNTOS },
  carritos: { key: "carritos-data", normalize: normalizeCarrito, fallback: DEFAULT_CARRITOS },
  turnos: { key: "turnos-data", normalize: normalizeTurno, fallback: [] },
  hermanos: { key: "hermanos-data", normalize: normalizeHermano, fallback: DEFAULT_HERMANOS },
  // Teléfonos de los hermanos ([{ id: hermanoId, telefono }]). Van aparte
  // porque, a diferencia del resto, solo los pueden leer los responsables
  // logueados (ver schema.sql); para el público esta fila no existe.
  contactos: { key: "contactos-data", normalize: (c) => c, fallback: [] },
};
const NAMES = Object.keys(SLICES);
const KEY_TO_NAME = Object.fromEntries(NAMES.map((n) => [SLICES[n].key, n]));
const MAX_REINTENTOS = 4;

function fromRow(name, row) {
  const { normalize, fallback } = SLICES[name];
  if (!row) return fallback;
  return Array.isArray(row.value) ? row.value.map(normalize) : fallback;
}

export function useAppData() {
  const [loading, setLoading] = useState(true);
  // Si la carga inicial falla, NO mostramos datos por defecto como si fueran
  // los reales: cualquier guardado posterior pisaría lo que hay en el
  // servidor. En ese caso la app queda bloqueada para edición hasta que se
  // recargue bien.
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [data, setDataState] = useState({ puntos: [], carritos: [], turnos: [], hermanos: [], contactos: [] });

  // Versión (updated_at) de cada lista tal como la vimos por última vez en
  // el servidor; null = la fila todavía no existe.
  const versions = useRef({});
  // Copia sincrónica del último estado confirmado por el servidor, para
  // poder reaplicar cambios sobre ella sin esperar a un render.
  const serverData = useRef({});
  // Mientras haya guardados en curso no aplicamos refrescos externos, para
  // que no "rebote" la UI a un estado intermedio.
  const pending = useRef(0);

  const applyServer = useCallback((name, row) => {
    const value = fromRow(name, row);
    versions.current[name] = row ? row.version : null;
    serverData.current[name] = value;
    setDataState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const load = useCallback(async () => {
    try {
      const rows = await getAllData(NAMES.map((n) => SLICES[n].key));
      for (const name of NAMES) applyServer(name, rows[SLICES[name].key]);
      setLoadError("");

      // Sembrar con los valores por defecto solo las listas que nunca se
      // guardaron (un array vacío guardado a propósito no se toca).
      for (const name of NAMES) {
        if (rows[SLICES[name].key]) continue;
        try {
          const version = await writeData(SLICES[name].key, SLICES[name].fallback, null);
          if (version) versions.current[name] = version;
          else applyServer(name, await getData(SLICES[name].key));
        } catch {
          // Sin permiso para escribir (no logueado) o error de red: seguimos
          // mostrando el default; se sembrará cuando alguien con permiso
          // guarde algo.
        }
      }
    } catch {
      setLoadError("No se pudieron cargar los datos del servidor. Revisá tu conexión y volvé a intentar. Mientras tanto la edición está bloqueada para no pisar datos.");
    } finally {
      setLoading(false);
    }
  }, [applyServer]);

  const refresh = useCallback(async (onlyName) => {
    if (pending.current > 0) return;
    try {
      const names = onlyName ? [onlyName] : NAMES;
      const rows = await getAllData(names.map((n) => SLICES[n].key));
      if (pending.current > 0) return;
      for (const name of names) {
        const row = rows[SLICES[name].key];
        // Una fila que desaparece (p. ej. contactos al cerrar sesión) vuelve
        // a su valor por defecto.
        if (row ? row.version !== versions.current[name] : versions.current[name] != null) applyServer(name, row);
      }
    } catch {
      // Un refresco fallido no es grave: se reintenta en el próximo foco.
    }
  }, [applyServer]);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  // Mantenerse al día con los cambios de otros usuarios: en tiempo real si
  // Supabase Realtime está habilitado, y siempre al volver a la pestaña.
  useEffect(() => {
    const unsubscribe = subscribeChanges((key) => {
      const name = KEY_TO_NAME[key];
      if (name) refresh(name);
    });
    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [refresh]);

  // Aplica fn (lista vieja -> lista nueva) a una lista y la guarda. Si otro
  // usuario guardó la misma lista mientras tanto, vuelve a leerla y reaplica
  // fn sobre la versión nueva, así no se pierde ninguno de los dos cambios.
  // Devuelve true si se guardó; si falla, deshace el cambio en pantalla.
  const mutate = useCallback(async (name, fn) => {
    if (loadError) {
      setSaveError("No se puede guardar: los datos no se cargaron bien. Recargá la página.");
      return false;
    }
    const { key } = SLICES[name];
    pending.current++;
    setDataState((prev) => ({ ...prev, [name]: fn(prev[name]) }));
    try {
      for (let intento = 0; intento < MAX_REINTENTOS; intento++) {
        const base = serverData.current[name] ?? [];
        const expected = versions.current[name] ?? null;
        const next = fn(base);
        const version = await writeData(key, next, expected);
        if (version) {
          versions.current[name] = version;
          serverData.current[name] = next;
          setDataState((prev) => ({ ...prev, [name]: next }));
          setSaveError("");
          return true;
        }
        // Conflicto: releer y reintentar sobre la versión actual.
        const row = await getData(key);
        const nuevaVersion = row ? row.version : null;
        if (nuevaVersion === expected) {
          // Nadie más escribió, pero el update no afectó ninguna fila: el
          // servidor rechazó la escritura (sin permiso).
          throw new Error("sin-permiso");
        }
        versions.current[name] = nuevaVersion;
        serverData.current[name] = fromRow(name, row);
      }
      throw new Error("conflicto");
    } catch (err) {
      setDataState((prev) => ({ ...prev, [name]: serverData.current[name] ?? prev[name] }));
      setSaveError(
        err.message === "sin-permiso" || err.code === "42501"
          ? "No tenés permiso para guardar cambios. Ingresá con tu cuenta de responsable."
          : "No se pudieron guardar los cambios. Revisá tu conexión e intentá de nuevo."
      );
      return false;
    } finally {
      pending.current--;
    }
  }, [loadError]);

  return {
    loading,
    loadError,
    reload: () => {
      setLoading(true);
      load();
    },
    refresh,
    ...data,
    saveError,
    clearSaveError: () => setSaveError(""),
    mutate,
  };
}
