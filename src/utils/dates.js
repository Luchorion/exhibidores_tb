export function formatFechaCorta(fechaStr) {
  if (!fechaStr) return "";
  const [y, m, d] = fechaStr.split("-");
  return `${d}/${m}/${y}`;
}

export function diasDesde(fechaStr) {
  if (!fechaStr) return null;
  const then = new Date(fechaStr + "T00:00:00").getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.floor((now - then) / 86400000);
}
