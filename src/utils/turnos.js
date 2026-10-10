import { DIAS_SEMANA, FRANJAS } from "../data/constants";
import { diaSemanaDe, semanaDelMes } from "./dates";

const TODAS_LAS_SEMANAS = [1, 2, 3, 4, 5];

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
    // Para Quincenal/Mensual: en qué semanas del mes sale (1 = el primer
    // <día> del mes, etc.). Vacío = todavía no se definió.
    semanas: Array.isArray(t.semanas) ? t.semanas : [],
    horaInicio: t.horaInicio || "",
    horaFin: t.horaFin || "",
    puntoId: t.puntoId || "",
    carritoIds,
    hermanoIds,
    conductorLibre: t.conductorLibre || (t.conductor && hermanoIds.length === 0 ? t.conductor : ""),
    estado: t.estado === "propuesto" ? "propuesto" : "confirmado",
    notas: t.notas || "",
  };
}

// Opciones de semanas según la frecuencia.
export const OPCIONES_SEMANAS = {
  Quincenal: [
    { value: [1, 3], label: "1ª y 3ª semana" },
    { value: [2, 4], label: "2ª y 4ª semana" },
  ],
  Mensual: [1, 2, 3, 4, 5].map((n) => ({ value: [n], label: `${n}ª semana` })),
};

// Semanas del mes en las que el turno puede salir. Si una quincenal o
// mensual no tiene semanas definidas, se asume que puede caer en cualquiera
// (para no dejar de avisar un posible conflicto).
export function semanasEfectivas(t) {
  if ((t.frecuencia || "Semanal") === "Semanal" || !t.semanas || t.semanas.length === 0) return TODAS_LAS_SEMANAS;
  return t.semanas;
}

export function describeFrecuencia(t) {
  const frecuencia = t.frecuencia || "Semanal";
  if (frecuencia === "Semanal") return frecuencia;
  if (!t.semanas || t.semanas.length === 0) return `${frecuencia} (semanas sin definir)`;
  const opcion = (OPCIONES_SEMANAS[frecuencia] || []).find((o) => o.value.join() === t.semanas.join());
  return `${frecuencia} · ${opcion ? opcion.label : t.semanas.map((n) => `${n}ª`).join(", ")}`;
}

// ¿Sale este turno en esta fecha concreta?
export function turnoOcurreEn(t, date) {
  if (t.dia !== diaSemanaDe(date)) return false;
  if ((t.frecuencia || "Semanal") === "Semanal") return true;
  return semanasEfectivas(t).includes(semanaDelMes(date));
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
  if (!(aStart < bEnd && bStart < aEnd)) return false;
  // Dos quincenales del mismo horario en semanas distintas no chocan.
  const semanasB = semanasEfectivas(b);
  return semanasEfectivas(a).some((s) => semanasB.includes(s));
}

function compartidos(a, b, campo) {
  return (a[campo] || []).filter((id) => (b[campo] || []).includes(id));
}

// Devuelve { turnoId: [{ tipo: "hermano"|"carrito", id, otroId }] } para cada
// par de turnos que se superpone y comparte un hermano o un carrito.
export function computeConflictMap(turnos) {
  const map = {};
  const agregar = (turnoId, conflicto) => (map[turnoId] = map[turnoId] || []).push(conflicto);
  for (let i = 0; i < turnos.length; i++) {
    for (let j = i + 1; j < turnos.length; j++) {
      const a = turnos[i], b = turnos[j];
      if (!turnosSolapan(a, b)) continue;
      for (const [tipo, campo] of [["hermano", "hermanoIds"], ["carrito", "carritoIds"]]) {
        for (const id of compartidos(a, b, campo)) {
          agregar(a.id, { tipo, id, otroId: b.id });
          agregar(b.id, { tipo, id, otroId: a.id });
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

export function describeConflicto(conflicto, turnos, hermanos, puntos, carritos) {
  const otro = turnos.find((t) => t.id === conflicto.otroId);
  const puntoOtro = otro ? puntos.find((p) => p.id === otro.puntoId) : null;
  const cuando = `el ${otro ? otro.dia : ""} a las ${otro ? otro.horaInicio : ""}${puntoOtro ? " (" + puntoOtro.nombre + ")" : ""}`;
  if (conflicto.tipo === "carrito") {
    const carrito = (carritos || []).find((c) => c.id === conflicto.id);
    return `El carrito ${carrito ? carrito.numero : ""} ya está en otro turno ${cuando}`;
  }
  const hermano = hermanos.find((h) => h.id === conflicto.id);
  return `${hermano ? hermano.nombre : "Hermano"} ya está en otro turno ${cuando}`;
}

// Franja de disponibilidad (ver FRANJAS) en la que cae una hora de inicio.
export function franjaDeHora(hhmm) {
  const min = timeToMinutes(hhmm);
  if (min == null) return null;
  if (min < 12 * 60) return FRANJAS[0]; // mañana
  if (min < 14 * 60) return FRANJAS[1]; // mediodía
  if (min < 19 * 60) return FRANJAS[2]; // tarde
  return FRANJAS[3]; // noche
}

// Avisos que no bloquean el guardado: hermanos no aprobados o asignados
// fuera de la disponibilidad que tienen cargada.
export function advertenciasTurno(turno, hermanos) {
  const avisos = [];
  const franja = franjaDeHora(turno.horaInicio);
  for (const id of turno.hermanoIds || []) {
    const h = hermanos.find((x) => x.id === id);
    if (!h) continue;
    if (h.estado !== "aprobado") avisos.push(`${h.nombre} no está aprobado/a para exhibidores.`);
    const disp = h.disponibilidad || [];
    if (turno.dia && franja && disp.length > 0 && !disp.includes(`${turno.dia} ${franja}`)) {
      avisos.push(`${h.nombre} no marcó disponibilidad el ${turno.dia} a la ${franja}.`);
    }
  }
  return avisos;
}

// Errores que sí impiden guardar.
export function validarTurno(t) {
  const errores = [];
  if (!t.dia) errores.push("Elegí el día.");
  if (!t.horaInicio) errores.push("Indicá la hora de inicio.");
  if (!t.puntoId) errores.push("Elegí el punto.");
  const ini = timeToMinutes(t.horaInicio);
  const fin = timeToMinutes(t.horaFin);
  if (ini != null && fin != null && fin <= ini) errores.push("La hora de fin tiene que ser posterior a la de inicio.");
  return errores;
}

function horario(t) {
  return `${t.horaInicio}${t.horaFin ? `–${t.horaFin}` : ""}`;
}

// Programa en texto plano, listo para pegar en WhatsApp.
export function textoPrograma(turnosOrdenados, { puntos, hermanos, carritos }) {
  const porDia = agruparTurnosPorDia(turnosOrdenados);
  const bloques = DIAS_SEMANA.filter((d) => porDia[d]?.length).map((dia) => {
    const lineas = porDia[dia].map((t) => {
      const punto = puntos.find((p) => p.id === t.puntoId);
      const nombres = hermanos.filter((h) => t.hermanoIds.includes(h.id)).map((h) => h.nombre);
      const nums = carritos.filter((c) => t.carritoIds.includes(c.id)).map((c) => c.numero);
      const extra = [
        (t.frecuencia || "Semanal") !== "Semanal" ? describeFrecuencia(t) : "",
        nums.length ? `Carrito ${nums.join(", ")}` : "",
        t.estado === "propuesto" ? "(propuesto)" : "",
      ].filter(Boolean).join(" · ");
      return `• ${horario(t)} ${punto ? punto.nombre : "Punto sin definir"}${nombres.length ? ` — ${nombres.join(", ")}` : ""}${extra ? `\n   ${extra}` : ""}`;
    });
    return `*${dia.toUpperCase()}*\n${lineas.join("\n")}`;
  });
  return `Programa de exhibidores\n\n${bloques.join("\n\n")}`;
}
