import { AlertTriangle } from "lucide-react";

// Lista de motivos por los que un formulario no se puede guardar todavía.
export default function FormErrors({ errores }) {
  if (!errores || errores.length === 0) return null;
  return (
    <div className="exh-warn-box" role="alert">
      <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
      <div>{errores.map((e) => <div key={e}>{e}</div>)}</div>
    </div>
  );
}
