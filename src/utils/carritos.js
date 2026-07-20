import { diasDesde } from "./dates";

// Adapta carritos guardados con el esquema viejo: "ultimoMantenimiento" se
// dividió en control físico y revisión de publicaciones.
export function normalizeCarrito(c) {
  return {
    ...c,
    ultimoControlFisico: c.ultimoControlFisico ?? c.ultimoMantenimiento ?? "",
    ultimaRevisionPublicaciones: c.ultimaRevisionPublicaciones ?? "",
  };
}

export function estadoCarritoBadgeClass(estado) {
  if (estado === "operativo") return "exh-badge-green";
  if (estado === "repuesto") return "exh-badge-muted";
  if (estado === "pendiente") return "exh-badge-amber";
  return "exh-badge-rust";
}

export function carritoVencido(c, diasControlLimite, diasPubLimite) {
  const diasControl = diasDesde(c.ultimoControlFisico);
  const diasPub = diasDesde(c.ultimaRevisionPublicaciones);
  return (
    diasControl === null ||
    diasControl > diasControlLimite ||
    diasPub === null ||
    diasPub > diasPubLimite
  );
}
