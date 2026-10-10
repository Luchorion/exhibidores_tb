const TABS = [
  { key: "turnos", label: "Turnos" },
  { key: "puntos", label: "Puntos" },
  { key: "carritos", label: "Carritos" },
  { key: "hermanos", label: "Hermanos" },
];

export default function NavTabs({ tab, setTab }) {
  return (
    <nav className="exh-nav" aria-label="Secciones">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`exh-tab ${tab === t.key ? "active" : ""}`}
          aria-current={tab === t.key ? "page" : undefined}
          onClick={() => setTab(t.key)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
