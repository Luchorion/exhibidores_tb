import { PORTADAS_SUGERIDAS } from "../../data/constants";
import CarritoCard from "./CarritoCard";

export default function CarritosTab({ carritos, onSaveCarrito, onMarkControl, onMarkRevision }) {
  // Sugerencias del desplegable: las fijas más cualquier portada que ya se
  // haya escrito en algún carrito (así los ítems nuevos quedan disponibles
  // para los demás).
  const portadasSugeridas = [...new Set([...PORTADAS_SUGERIDAS, ...carritos.map((c) => c.portada).filter(Boolean)])];

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
            portadasSugeridas={portadasSugeridas}
            onSave={onSaveCarrito}
            onMarkControl={onMarkControl}
            onMarkRevision={onMarkRevision}
          />
        ))}
      </div>
    </section>
  );
}
