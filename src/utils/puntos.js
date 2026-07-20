// Adapta puntos guardados con el esquema viejo (tenían un campo "modalidad"
// que ya no se usa) al esquema actual. Nunca romper datos ya guardados.
export function normalizePunto(p) {
  const { modalidad: _modalidad, ...rest } = p;
  return rest;
}
