import { motion } from "framer-motion";
import { PiggyBank, Trash2 } from "lucide-react";
import { fmt } from "../../shared/format";

export default function CuentaRow({ cuenta, onDelete }) {
  return (
    <motion.div
      className="cuenta-bento"
      data-testid={`cuenta-row-${cuenta.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <style>{`
        .cuenta-bento { background: var(--surface, #FFFFFF); border: 1px solid var(--surface-low, #F2F4F6); border-radius: 20px; padding: 20px; box-shadow: 0 2px 10px rgba(13,28,47,0.05); display: flex; flex-direction: column; justify-content: space-between; gap: 28px; min-height: 148px; font-family: Inter, sans-serif; }
        .cuenta-bento-top { display: flex; align-items: center; justify-content: space-between; }
        .cuenta-bento-icon { width: 36px; height: 36px; border-radius: 9999px; background: var(--secondary-container, #D5E3FD); color: var(--on-secondary-container, #57657B); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cuenta-bento-del { background: none; border: none; color: var(--expense, #BA1A1A); cursor: pointer; padding: 4px; display: flex; }
        .cuenta-bento-nombre { font-size: 13px; color: var(--on-surface-variant, #44474E); margin: 0 0 4px; }
        .cuenta-bento-saldo { font-size: 21px; font-weight: 700; color: var(--primary, #000000); letter-spacing: -0.01em; }
      `}</style>
      <div className="cuenta-bento-top">
        <span className="cuenta-bento-icon">
          <PiggyBank size={18} />
        </span>
        {onDelete && (
          <button
            className="cuenta-bento-del"
            data-testid={`cuenta-row-delete-button-${cuenta.id}`}
            onClick={() => onDelete(cuenta.id)}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <div>
        <p className="cuenta-bento-nombre">{cuenta.nombre}</p>
        <p className="cuenta-bento-saldo mono">{fmt(cuenta.saldo)}</p>
      </div>
    </motion.div>
  );
}
