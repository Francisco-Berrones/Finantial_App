import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { fmt } from "../../shared/format";

const BANCO_ICON_CLASS = {
  banorte: "tarjeta-row-icon--banorte",
  revolut: "tarjeta-row-icon--revolut",
  nu: "tarjeta-row-icon--nu",
};

function iconClassFor(banco) {
  const key = (banco || "").trim().toLowerCase();
  return BANCO_ICON_CLASS[key] || "";
}

export default function TarjetaRow({ tarjeta, onDelete, onClick }) {
  const disponible = tarjeta.linea_total - tarjeta.saldo_usado;
  return (
    <motion.div
      className={`tarjeta-row-card${onClick ? " tarjeta-row-card--clickable" : ""}`}
      data-testid={`tarjeta-row-${tarjeta.id}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <div className="tarjeta-row-top">
        <div className="tarjeta-row-left">
          <div className={`tarjeta-row-icon ${iconClassFor(tarjeta.banco)}`}>
            <div className="tarjeta-row-icon-dots">
              <span />
              <span />
            </div>
          </div>
          <div>
            <div className="tarjeta-row-name">{tarjeta.nombre}</div>
            {tarjeta.banco && <div className="tarjeta-row-banco">{tarjeta.banco}</div>}
          </div>
        </div>
        {onDelete ? (
          <button
            className="row-delete-btn"
            data-testid={`tarjeta-row-delete-button-${tarjeta.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(tarjeta.id);
            }}
          >
            <Trash2 size={14} />
          </button>
        ) : (
          <div className="decorative-toggle" />
        )}
      </div>
      <div className="tarjeta-row-stats">
        <div className="tarjeta-row-stat">
          <div className="tarjeta-row-stat-label">Línea</div>
          <div className="tarjeta-row-stat-value mono">{fmt(tarjeta.linea_total)}</div>
        </div>
        <div className="tarjeta-row-stat">
          <div className="tarjeta-row-stat-label">Usado</div>
          <div className="tarjeta-row-stat-value mono">{fmt(tarjeta.saldo_usado)}</div>
        </div>
        <div className="tarjeta-row-stat">
          <div className="tarjeta-row-stat-label">Disponible</div>
          <div className="tarjeta-row-stat-value mono">{fmt(disponible)}</div>
        </div>
      </div>
    </motion.div>
  );
}
