import { ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import { fmt, fmtFecha } from "../../shared/format";
import { ACCIONES } from "../../shared/constants";

export default function MovimientoRow({ movimiento, onDelete }) {
  const meta = ACCIONES[movimiento.tipo_accion];
  return (
    <div className="mov-row">
      <div className={`mov-icon ${meta.tono}`}>
        {meta.tono === "credito" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      </div>
      <div className="mov-body">
        <div className="mov-title">{meta.label} · {movimiento.target_nombre}</div>
        <div className="mov-sub">{fmtFecha(movimiento.fecha)}{movimiento.nota ? ` · ${movimiento.nota}` : ""}</div>
      </div>
      <div className={`mov-amount mono ${meta.tono}`}>{fmt(movimiento.monto)}</div>
      {onDelete && (
        <button
          className="mov-del"
          data-testid={`movimiento-delete-button-${movimiento.id}`}
          onClick={() => onDelete(movimiento)}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
