// Props para que un elemento que no es <button> (p. ej. una tarjeta entera)
// se pueda activar con el teclado igual que con un click. Ignora las teclas
// que vienen de elementos internos (botones, links) para no dispararse dos
// veces.
export function clickableProps(onActivate, label) {
  return {
    role: "button",
    tabIndex: 0,
    "aria-label": label,
    onClick: onActivate,
    onKeyDown: (e) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate(e);
      }
    },
  };
}
