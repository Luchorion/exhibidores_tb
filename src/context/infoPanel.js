import { createContext, useContext } from "react";

// Función abrir(tipo, id) que cualquier componente puede llamar para mostrar
// la ficha de un hermano/punto/carrito, sin importar cuán anidado esté
// (incluso desde dentro de otra ficha, para poder saltar de una a otra).
// tipo es "hermano" | "punto" | "carrito".
export const InfoPanelContext = createContext(() => {});

export function useInfoPanel() {
  return useContext(InfoPanelContext);
}
