import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import { fmt, fmtFecha } from "../../shared/format";
import { ACCIONES } from "../../shared/constants";

export default function MovimientoRow({ movimiento, onDelete }) {
  const meta = ACCIONES[movimiento.tipo_accion];
  return (
    <motion.div className="mov-row" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
      <div className={`mov-icon ${meta.tono}`}>
        {meta.tono === "credito" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      </div>
      <div className="mov-body">
        <div className="mov-title">{meta.label} · {movimiento.target_nombre}</div>
        <div className="mov-sub">
          {fmtFecha(movimiento.fecha)}{movimiento.nota ? ` · ${movimiento.nota}` : ""}
          {movimiento.tipo_accion === "pago_tarjeta" && (
            <> · Desde {movimiento.origen_cuenta_nombre || "efectivo/externo"}</>
          )}
        </div>
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
    </motion.div>
  );
}
