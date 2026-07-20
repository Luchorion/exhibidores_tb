import { useCallback, useEffect, useState } from "react";
import { getData, setData } from "../lib/storage";
import { DEFAULT_PUNTOS, DEFAULT_CARRITOS, DEFAULT_HERMANOS } from "../data/constants";
import { normalizePunto } from "../utils/puntos";
import { normalizeCarrito } from "../utils/carritos";
import { normalizeTurno } from "../utils/turnos";
import { normalizeHermano } from "../utils/hermanos";

const KEYS = {
  puntos: "puntos-data",
  carritos: "carritos-data",
  turnos: "turnos-data",
  hermanos: "hermanos-data",
};

// Carga una clave; si no existe todavía en el servidor, la marca para
// sembrarla con su valor por defecto (pero solo si realmente nunca se
// guardó nada — un array vacío guardado a propósito, p. ej. porque se
// borraron todos los puntos, no debe volver a rellenarse con los defaults).
async function loadSlice(key, normalize, fallback, seeds) {
  try {
    const raw = await getData(key);
    if (raw == null) {
      seeds.push([key, fallback]);
      return fallback;
    }
    return normalize ? raw.map(normalize) : raw;
  } catch {
    return fallback;
  }
}

export function useAppData() {
  const [loading, setLoading] = useState(true);
  const [puntos, setPuntos] = useState([]);
  const [carritos, setCarritos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [hermanos, setHermanos] = useState([]);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const seeds = [];
      const [p, c, t, h] = await Promise.all([
        loadSlice(KEYS.puntos, normalizePunto, DEFAULT_PUNTOS, seeds),
        loadSlice(KEYS.carritos, normalizeCarrito, DEFAULT_CARRITOS, seeds),
        loadSlice(KEYS.turnos, normalizeTurno, [], seeds),
        loadSlice(KEYS.hermanos, normalizeHermano, DEFAULT_HERMANOS, seeds),
      ]);

      if (cancelled) return;
      setPuntos(p);
      setCarritos(c);
      setTurnos(t);
      setHermanos(h);
      setLoading(false);

      for (const [key, value] of seeds) {
        try {
          await setData(key, value);
        } catch {
          if (!cancelled) {
            setSaveError("No se pudieron inicializar algunos datos por defecto en el servidor.");
          }
        }
      }
    }

    load().catch(() => {
      if (cancelled) return;
      setSaveError("No se pudo conectar con el servidor. Revisá tu conexión y las credenciales de Supabase.");
      setPuntos(DEFAULT_PUNTOS);
      setCarritos(DEFAULT_CARRITOS);
      setTurnos([]);
      setHermanos(DEFAULT_HERMANOS);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (key, value) => {
    try {
      await setData(key, value);
    } catch {
      setSaveError("No se pudieron guardar los cambios. Intenta de nuevo.");
    }
  }, []);

  return {
    loading,
    puntos,
    setPuntos,
    carritos,
    setCarritos,
    turnos,
    setTurnos,
    hermanos,
    setHermanos,
    saveError,
    setSaveError,
    persist,
    KEYS,
  };
}
