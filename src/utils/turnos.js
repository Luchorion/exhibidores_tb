import { DIAS_SEMANA } from "../data/constants";

// Adapta turnos guardados con esquemas viejos: un solo carrito/conductor en
// vez de arrays, o una fecha exacta en vez de día de la semana + frecuencia.
export function normalizeTurno(t) {
  const carritoIds = Array.isArray(t.carritoIds) ? t.carritoIds : (t.carritoId ? [t.carritoId] : []);
  const hermanoIds = Array.isArray(t.hermanoIds) ? t.hermanoIds : [];
  let dia = t.dia || "";
  if (!dia && t.fecha) {
    const idx = new Date(t.fecha + "T00:00:00").getDay();
    const map = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    dia = map[idx] || "";
  }
  return {
    id: t.id,
    dia,
    frecuencia: t.frecuencia || "Semanal",
    horaInicio: t.horaInicio || "",
    horaFin: t.horaFin || "",
    puntoId: t.puntoId || "",
    carritoIds,
    hermanoIds,
    conductorLibre: t.conductor && hermanoIds.length === 0 ? t.conductor : "",
    notas: t.notas || "",
  };
}

export function timeToMinutes(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function turnosSolapan(a, b) {
  if (!a.dia || a.dia !== b.dia) return false;
  const aStart = timeToMinutes(a.horaInicio);
  const bStart = timeToMinutes(b.horaInicio);
  if (aStart == null || bStart == null) return false;
  const aEnd = a.horaFin && timeToMinutes(a.horaFin) != null ? timeToMinutes(a.horaFin) : aStart + 1;
  const bEnd = b.horaFin && timeToMinutes(b.horaFin) != null ? timeToMinutes(b.horaFin) : bStart + 1;
  return aStart < bEnd && bStart < aEnd;
}

export function hermanosCompartidos(a, b) {
  return (a.hermanoIds || []).filter((id) => (b.hermanoIds || []).includes(id));
}

// Devuelve { turnoId: [{ hermanoId, otroId }] } para cada par de turnos que
// se superpone y comparte al menos un hermano.
export function computeConflictMap(turnos) {
  const map = {};
  for (let i = 0; i < turnos.length; i++) {
    for (let j = i + 1; j < turnos.length; j++) {
      const a = turnos[i], b = turnos[j];
      if (turnosSolapan(a, b)) {
        const compartidos = hermanosCompartidos(a, b);
        if (compartidos.length) {
          compartidos.forEach((hId) => {
            (map[a.id] = map[a.id] || []).push({ hermanoId: hId, otroId: b.id });
            (map[b.id] = map[b.id] || []).push({ hermanoId: hId, otroId: a.id });
          });
        }
      }
    }
  }
  return map;
}

export function ordenarTurnos(turnos) {
  return [...turnos].sort((a, b) => {
    const diaDiff = DIAS_SEMANA.indexOf(a.dia) - DIAS_SEMANA.indexOf(b.dia);
    if (diaDiff !== 0) return diaDiff;
    return (a.horaInicio || "").localeCompare(b.horaInicio || "");
  });
}

export function turnosDeHermano(turnos, hermanoId) {
  return ordenarTurnos(turnos.filter((t) => (t.hermanoIds || []).includes(hermanoId)));
}

export function agruparTurnosPorDia(turnosOrdenados) {
  return turnosOrdenados.reduce((acc, t) => {
    (acc[t.dia] = acc[t.dia] || []).push(t);
    return acc;
  }, {});
}

export function describeConflicto(conflicto, turnos, hermanos, puntos) {
  const hermano = hermanos.find((h) => h.id === conflicto.hermanoId);
  const otro = turnos.find((t) => t.id === conflicto.otroId);
  const puntoOtro = otro ? puntos.find((p) => p.id === otro.puntoId) : null;
  return `${hermano ? hermano.nombre : "Hermano"} ya está en otro turno el ${otro ? otro.dia : ""} a las ${otro ? otro.horaInicio : ""}${puntoOtro ? " (" + puntoOtro.nombre + ")" : ""}`;
}
