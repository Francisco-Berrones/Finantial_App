import { Trash2 } from "lucide-react";
import { fmt } from "../../shared/format";

export default function CuentaRow({ cuenta, onDelete }) {
  return (
    <div className="cuenta-row-card" data-testid={`cuenta-row-${cuenta.id}`}>
      <div className="cuenta-row-top">
        <div>
          <div className="cuenta-row-name">{cuenta.nombre}</div>
          <div className="cuenta-row-saldo mono">{fmt(cuenta.saldo)}</div>
        </div>
        {onDelete && (
          <button
            className="row-delete-btn"
            data-testid={`cuenta-row-delete-button-${cuenta.id}`}
            onClick={() => onDelete(cuenta.id)}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
