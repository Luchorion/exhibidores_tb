import { diasDesde } from "./dates";

// Adapta carritos guardados con el esquema viejo: "ultimoMantenimiento" se
// dividió en control físico y revisión de publicaciones.
export function normalizeCarrito(c) {
  return {
    ...c,
    estado: c.estado === "de repuesto" ? "repuesto" : c.estado,
    portada: c.portada ?? "",
    ultimoControlFisico: c.ultimoControlFisico ?? c.ultimoMantenimiento ?? "",
    ultimaRevisionPublicaciones: c.ultimaRevisionPublicaciones ?? "",
  };
}

// Un mismo color por estado, reutilizado tanto para el badge como para el
// borde de acento de la tarjeta: operativo=verde, repuesto=gris,
// pendiente=ámbar, cualquier otro valor=rojo (caso inesperado).
const ESTADO_CARRITO_COLOR = { operativo: "green", repuesto: "muted", pendiente: "amber" };

function estadoCarritoColor(estado) {
  return ESTADO_CARRITO_COLOR[estado] || "rust";
}

export function estadoCarritoBadgeClass(estado) {
  return `exh-badge-${estadoCarritoColor(estado)}`;
}

export function estadoCarritoAccentClass(estado) {
  return `exh-card-accent-${estadoCarritoColor(estado)}`;
}

// Solo los operativos están en la calle y tienen un número físico
// pegado; repuesto y pendiente no tienen carrito asignado todavía.
export function carritoPlate(carrito) {
  return carrito.numero != null ? String(carrito.numero).padStart(2, "0") : "—";
}

// Repuesto y pendiente no están en servicio, así que no tienen control
// físico ni revisión de publicaciones que vencer.
export function carritoVencido(c, diasControlLimite, diasPubLimite) {
  if (c.estado !== "operativo") return false;
  const diasControl = diasDesde(c.ultimoControlFisico);
  const diasPub = diasDesde(c.ultimaRevisionPublicaciones);
  return (
    diasControl === null ||
    diasControl > diasControlLimite ||
    diasPub === null ||
    diasPub > diasPubLimite
  );
}
