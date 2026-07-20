import { createContext, useContext } from "react";

// true cuando el toggle "Edición" del header está prendido. Con false la app
// queda en modo solo lectura: se ocultan los botones de crear/editar/borrar.
export const EdicionContext = createContext(false);

export function useEdicion() {
  return useContext(EdicionContext);
}
