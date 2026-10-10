import { PORTADAS_SUGERIDAS } from "../../data/constants";
import CarritoCard from "./CarritoCard";

export default function CarritosTab({ carritos, turnos, onSaveCarrito, onRegistrarMantenimiento }) {
  // Sugerencias del desplegable: las fijas más cualquier portada que ya se
  // haya escrito en algún carrito (así los ítems nuevos quedan disponibles
  // para los demás).
  const portadasSugeridas = [...new Set([...PORTADAS_SUGERIDAS, ...carritos.map((c) => c.portada).filter(Boolean)])];

  return (
    <section>
      <div className="exh-section-head">
        <h2 className="exh-section-title">Carritos exhibidores</h2>
      </div>
      <div className="exh-cards">
        {carritos.map((c) => (
          <CarritoCard
            key={c.id}
            carrito={c}
            turnosAsignados={turnos.filter((t) => (t.carritoIds || []).includes(c.id)).length}
            portadasSugeridas={portadasSugeridas}
            onSave={onSaveCarrito}
            onRegistrarMantenimiento={onRegistrarMantenimiento}
          />
        ))}
      </div>
    </section>
  );
}
