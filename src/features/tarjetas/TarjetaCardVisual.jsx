import { CreditCard, Trash2 } from "lucide-react";
import { fmt } from "../../shared/format";

export default function TarjetaCardVisual({ tarjeta, onDelete }) {
  return (
    <div className="card-visual" data-testid={`tarjeta-card-visual-${tarjeta.id}`}>
      <button
        className="card-visual-del"
        data-testid={`tarjeta-card-visual-delete-button-${tarjeta.id}`}
        onClick={() => onDelete(tarjeta.id)}
      >
        <Trash2 size={14} />
      </button>
      <div className="card-visual-top">
        <span className="card-visual-banco">{tarjeta.banco || "Tarjeta"}</span>
        <div className="card-visual-chip" />
      </div>
      <div className="card-visual-name">{tarjeta.nombre}</div>
      <div className="card-visual-bottom">
        <div>
          <div className="card-visual-amount mono">
            {fmt(tarjeta.linea_total - tarjeta.saldo_usado)} disponible
          </div>
          <div className="card-visual-total mono">
            de {fmt(tarjeta.linea_total)} · usado {fmt(tarjeta.saldo_usado)}
          </div>
        </div>
        <CreditCard size={20} />
      </div>
    </div>
  );
}
