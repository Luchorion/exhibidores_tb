import { ESTADOS_HERMANO } from "../data/constants";

export function estadoHermanoBadgeClass(estado) {
  if (estado === "aprobado") return "exh-badge-green";
  if (estado === "pendiente") return "exh-badge-amber";
  return "exh-badge-muted";
}

export function estadoHermanoLabel(estado) {
  const found = ESTADOS_HERMANO.find((e) => e.value === estado);
  return found ? found.label : estado;
}
