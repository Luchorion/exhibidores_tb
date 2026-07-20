const TABS = [
  { key: "turnos", label: "Turnos" },
  { key: "puntos", label: "Puntos" },
  { key: "carritos", label: "Carritos" },
  { key: "hermanos", label: "Hermanos" },
];

export default function NavTabs({ tab, setTab }) {
  return (
    <nav className="exh-nav">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`exh-tab ${tab === t.key ? "active" : ""}`}
          onClick={() => setTab(t.key)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
