import { motion } from "framer-motion";
import { Briefcase, Trash2 } from "lucide-react";
import { fmt, fmtHoraCorta } from "../../shared/format";
import { ACCIONES } from "../../shared/constants";
import { estiloCategoria } from "../../shared/categoriaIconos";

export default function MovimientoCard({ movimiento, onDelete }) {
  const meta = ACCIONES[movimiento.tipo_accion];
  const esIngreso = movimiento.tipo_accion === "ingreso_cuenta";
  const Icon = esIngreso ? Briefcase : estiloCategoria(movimiento.categoria).icon;
  const titulo = movimiento.nota?.trim() || meta.label;

  return (
    <motion.div
      className="mov-card"
      data-testid="movimiento-card"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <style>{`
        .mov-card { position: relative; display: flex; align-items: center; gap: 12px; background: var(--surface, #FFFFFF); border: 1px solid var(--surface-low, #F2F4F6); border-radius: 12px; padding: 14px; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(13,28,47,0.04); font-family: Inter, sans-serif; }
        .mov-card-icon { width: 44px; height: 44px; border-radius: 9999px; background: var(--secondary-container, #D5E3FD); color: var(--on-secondary-container, #57657B); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mov-card-icon.ingreso { background: var(--primary-fixed, #DAE2FD); color: var(--primary-container, #131B2E); }
        .mov-card-body { flex: 1; min-width: 0; }
        .mov-card-titulo { font-size: 16px; font-weight: 600; color: var(--primary, #000000); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .mov-card-sub { font-size: 12px; font-weight: 500; color: var(--on-surface-variant, #44474E); margin-top: 2px; }
        .mov-card-right { text-align: right; flex-shrink: 0; }
        .mov-card-monto { font-size: 16px; font-weight: 600; }
        .mov-card-monto.gasto { color: var(--expense, #BA1A1A); }
        .mov-card-monto.ingreso { color: var(--income, #1B5E20); }
        .mov-card-categoria { font-size: 12px; color: var(--outline, #76777D); margin-top: 2px; }
        .mov-card-del { position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; border-radius: 9999px; background: var(--surface, #FFFFFF); border: 1px solid var(--outline-variant, #C6C6CD); color: var(--outline, #76777D); display: flex; align-items: center; justify-content: center; cursor: pointer; }
      `}</style>
      <div className={`mov-card-icon ${esIngreso ? "ingreso" : ""}`}>
        <Icon size={20} />
      </div>
      <div className="mov-card-body">
        <div className="mov-card-titulo">{titulo}</div>
        <div className="mov-card-sub">{movimiento.target_nombre} · {fmtHoraCorta(movimiento.fecha)}</div>
      </div>
      <div className="mov-card-right">
        <div className={`mov-card-monto ${esIngreso ? "ingreso" : "gasto"}`}>
          {esIngreso ? "+" : "-"}{fmt(movimiento.monto)}
        </div>
        {movimiento.categoria?.nombre && <div className="mov-card-categoria">{movimiento.categoria.nombre}</div>}
      </div>
      {onDelete && (
        <button
          className="mov-card-del"
          data-testid={`movimiento-delete-button-${movimiento.id}`}
          onClick={() => onDelete(movimiento)}
        >
          <Trash2 size={14} />
        </button>
      )}
    </motion.div>
  );
}
