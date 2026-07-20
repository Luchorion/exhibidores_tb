// Normaliza para búsqueda: minúsculas y sin acentos, así "marquez"
// encuentra "Márquez".
const DIACRITICOS = /[̀-ͯ]/g;

export function normalizarTexto(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICOS, "");
}
