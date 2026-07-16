import { motion } from "framer-motion";
import { Nfc, Trash2 } from "lucide-react";
import { fmt, fmtDiaCorto } from "../../shared/format";
import { gradienteBanco } from "../../shared/bancoColores";
import { proximoPagoDeTarjeta } from "../../shared/calcularPagoTarjeta";

export default function TarjetaRow({ tarjeta, movimientos = [], msiActivas = [], onDelete, onClick, onPagarAhora }) {
  const disponible = tarjeta.linea_total - tarjeta.saldo_usado;
  const pago = proximoPagoDeTarjeta(tarjeta, movimientos, msiActivas);
  const fondo = tarjeta.color || gradienteBanco(tarjeta.banco);

  return (
    <motion.div
      className={`tarjeta-bento${onClick ? " tarjeta-bento--clickable" : ""}`}
      data-testid={`tarjeta-row-${tarjeta.id}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <style>{`
        .tarjeta-bento { font-family: Inter, sans-serif; }
        .tarjeta-bento--clickable { cursor: pointer; }

        .tarjeta-bento-hero-visual { position: relative; border-radius: 24px; padding: 24px; color: #fff; overflow: hidden; box-shadow: 0 10px 24px rgba(0,0,0,0.18); }
        .tarjeta-bento-glow { position: absolute; width: 220px; height: 220px; border-radius: 9999px; background: rgba(255,255,255,0.14); filter: blur(40px); top: -80px; right: -80px; }
        .tarjeta-bento-hero-inner { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 28px; }
        .tarjeta-bento-hero-top { display: flex; align-items: flex-start; justify-content: space-between; }
        .tarjeta-bento-hero-nombre { font-size: 16px; font-weight: 600; }
        .tarjeta-bento-hero-icons { display: flex; align-items: center; gap: 10px; }
        .tarjeta-bento-hero-del { background: rgba(255,255,255,0.18); border: none; border-radius: 9999px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; }
        .tarjeta-bento-hero-saldo-label { font-size: 12px; opacity: 0.75; margin: 0 0 4px; }
        .tarjeta-bento-hero-saldo { font-size: 26px; font-weight: 700; }

        .tarjeta-bento-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
        .tarjeta-bento-stat { background: var(--surface-low, #F2F4F6); border-radius: 16px; padding: 14px; }
        .tarjeta-bento-stat-label { font-size: 12px; color: var(--on-surface-variant, #44474E); margin: 0 0 2px; }
        .tarjeta-bento-stat-value { font-size: 16px; font-weight: 700; color: var(--primary, #000000); }
        .tarjeta-bento-stat-value.aviso { color: var(--expense, #BA1A1A); }
        .tarjeta-bento-corte { grid-column: span 2; background: var(--surface-hi, #E6E8EA); border-radius: 16px; padding: 14px; display: flex; align-items: center; justify-content: space-between; }
        .tarjeta-bento-corte-label { font-size: 12px; color: var(--on-surface-variant, #44474E); margin: 0 0 2px; }
        .tarjeta-bento-corte-value { font-size: 15px; font-weight: 600; color: var(--on-surface, #1A1C1E); }
        .tarjeta-bento-pagar-btn { background: var(--primary, #000000); color: #fff; border: none; padding: 10px 16px; border-radius: 10px; font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }
      `}</style>

      <div className="tarjeta-bento-hero-visual" style={{ background: fondo }}>
        <div className="tarjeta-bento-glow" />
        <div className="tarjeta-bento-hero-inner">
          <div className="tarjeta-bento-hero-top">
            <div>
              <div className="tarjeta-bento-hero-nombre">{tarjeta.nombre}</div>
              {tarjeta.banco && <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{tarjeta.banco}</div>}
            </div>
            <div className="tarjeta-bento-hero-icons">
              <Nfc size={26} />
              {onDelete && (
                <button
                  className="tarjeta-bento-hero-del"
                  data-testid={`tarjeta-row-delete-button-${tarjeta.id}`}
                  onClick={(e) => { e.stopPropagation(); onDelete(tarjeta.id); }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          <div>
            <p className="tarjeta-bento-hero-saldo-label">SALDO ACTUAL</p>
            <p className="tarjeta-bento-hero-saldo mono">{fmt(tarjeta.saldo_usado)}</p>
          </div>
        </div>
      </div>

      <div className="tarjeta-bento-stats">
        <div className="tarjeta-bento-stat">
          <p className="tarjeta-bento-stat-label">Límite Disponible</p>
          <p className="tarjeta-bento-stat-value mono">{fmt(disponible)}</p>
        </div>
        <div className="tarjeta-bento-stat">
          <p className="tarjeta-bento-stat-label">Próximo Pago</p>
          <p className="tarjeta-bento-stat-value aviso">{pago ? fmtDiaCorto(pago.fecha) : "—"}</p>
        </div>
        <div className="tarjeta-bento-corte">
          <div>
            <p className="tarjeta-bento-corte-label">Fecha de Corte</p>
            <p className="tarjeta-bento-corte-value">{tarjeta.dia_corte ? `Día ${tarjeta.dia_corte} de cada mes` : "No configurada"}</p>
          </div>
          {onPagarAhora && (
            <button className="tarjeta-bento-pagar-btn" onClick={(e) => { e.stopPropagation(); onPagarAhora(tarjeta.id); }}>
              Pagar ahora
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
