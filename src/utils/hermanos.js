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

// Link de WhatsApp a partir de un teléfono cargado a mano. Para números
// argentinos sin código de país se asume +54 9 (celular).
export function whatsappLink(telefono) {
  let digits = (telefono || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = "549" + digits.slice(1);
  else if (!digits.startsWith("54")) digits = "549" + digits;
  return `https://wa.me/${digits}`;
}
