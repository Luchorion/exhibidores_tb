import { DIAS_SEMANA } from "../data/constants";

export function formatFechaCorta(fechaStr) {
  if (!fechaStr) return "";
  const [y, m, d] = fechaStr.split("-");
  return `${d}/${m}/${y}`;
}

// "YYYY-MM-DD" en hora local. No usar toISOString(): eso da la fecha en UTC
// y en Argentina (UTC-3), a partir de las 21 h, devuelve la de mañana.
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function hoyISO() {
  return toISODate(new Date());
}

export function diasDesde(fechaStr, hoy = new Date()) {
  if (!fechaStr) return null;
  const then = new Date(fechaStr + "T00:00:00").getTime();
  const now = new Date(hoy).setHours(0, 0, 0, 0);
  return Math.round((now - then) / 86400000);
}

// Nombre del día como en DIAS_SEMANA ("Lunes"…"Domingo").
export function diaSemanaDe(date) {
  return DIAS_SEMANA[(date.getDay() + 6) % 7];
}

// Qué número de ese día de la semana es dentro del mes: el 1er sábado, el
// 2do, etc. (1 a 5).
export function semanaDelMes(date) {
  return Math.ceil(date.getDate() / 7);
}

export function proximosDias(cantidad, desde = new Date()) {
  const base = new Date(desde);
  base.setHours(0, 0, 0, 0);
  return Array.from({ length: cantidad }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
}
