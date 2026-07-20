import CarritoCard from "./CarritoCard";

export default function CarritosTab({ carritos, onSaveCarrito, onMarkControl, onMarkRevision }) {
  return (
    <section>
      <div className="exh-section-head">
        <p className="exh-section-title">Carritos exhibidores</p>
      </div>
      <div className="exh-cards">
        {carritos.map((c) => (
          <CarritoCard
            key={c.id}
            carrito={c}
            onSave={onSaveCarrito}
            onMarkControl={onMarkControl}
            onMarkRevision={onMarkRevision}
          />
        ))}
      </div>
    </section>
  );
}
