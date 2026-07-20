import { DIAS, DIAS_SEMANA, ESTADOS_HERMANO } from "../data/constants";

export function estadoHermanoBadgeClass(estado) {
  if (estado === "aprobado") return "exh-badge-green";
  if (estado === "pendiente") return "exh-badge-amber";
  return "exh-badge-muted";
}

export function estadoHermanoLabel(estado) {
  const found = ESTADOS_HERMANO.find((e) => e.value === estado);
  return found ? found.label : estado;
}

// Adapta hermanos guardados con el esquema viejo (diasPreferidos + un único
// horarioPreferido) al esquema actual de disponibilidad por día y franja.
export function normalizeHermano(h) {
  if (Array.isArray(h.disponibilidad)) return h;
  const dias = (h.diasPreferidos || []).map((d) => DIAS_SEMANA[DIAS.indexOf(d)] || d);
  const horario = h.horarioPreferido;
  const franjas = horario === "Mañana" ? ["mañana"] : horario === "Tarde" ? ["tarde"] : ["mañana", "tarde"];
  const disponibilidad = dias.flatMap((d) => franjas.map((f) => `${d} ${f}`));
  const { diasPreferidos: _diasPreferidos, horarioPreferido: _horarioPreferido, ...rest } = h;
  return { ...rest, disponibilidad };
}
