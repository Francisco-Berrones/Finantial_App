import { CreditCard, PiggyBank, X } from "lucide-react";

export default function TipoActivoModal({ onSeleccionar, onClose }) {
  return (
    <div className="tipo-activo-backdrop" data-testid="tipo-activo-backdrop" onClick={onClose}>
      <style>{`
        .tipo-activo-backdrop {
          --bg: #F7F9FB; --surface: #FFFFFF; --surface-hi: #E6E8EA;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E; --outline-variant: #C6C6CD;
          --primary-container: #131B2E; --on-primary: #FFFFFF;
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); z-index: 60; display: flex; align-items: flex-end; justify-content: center;
        }
        .app-root[data-theme="dark"] .tipo-activo-backdrop {
          --bg: #1B1F23; --surface: #262B30; --surface-hi: #262B30;
          --on-surface: #E2E2E6; --on-surface-variant: #C4C6D0; --outline-variant: #43474E;
          --primary-container: #2A3550; --on-primary: #131B2E;
        }
        .tipo-activo-sheet { width: 100%; max-width: 480px; background: var(--bg); border-radius: 28px 28px 0 0; box-shadow: 0 -8px 30px rgba(0,0,0,0.2); padding: 24px; box-sizing: border-box; font-family: Inter, sans-serif; }
        .tipo-activo-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .tipo-activo-titulo { font-size: 18px; font-weight: 700; color: var(--on-surface); }
        .tipo-activo-close { width: 32px; height: 32px; border-radius: 9999px; background: var(--surface-hi); border: none; color: var(--on-surface-variant); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .tipo-activo-grid { display: flex; flex-direction: column; gap: 12px; padding-bottom: env(safe-area-inset-bottom); }
        .tipo-activo-opcion { width: 100%; box-sizing: border-box; display: flex; align-items: center; gap: 14px; background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 16px; padding: 16px; cursor: pointer; text-align: left; font-family: Inter, sans-serif; }
        .tipo-activo-opcion:active { transform: scale(0.98); }
        .tipo-activo-icono { width: 44px; height: 44px; border-radius: 12px; background: var(--primary-container); color: var(--on-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tipo-activo-nombre { font-size: 16px; font-weight: 600; color: var(--on-surface); }
        .tipo-activo-sub { font-size: 13px; color: var(--on-surface-variant); margin-top: 2px; }
      `}</style>

      <div className="tipo-activo-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="tipo-activo-head">
          <span className="tipo-activo-titulo">¿Qué quieres agregar?</span>
          <button className="tipo-activo-close" data-testid="tipo-activo-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="tipo-activo-grid">
          <button className="tipo-activo-opcion" data-testid="tipo-activo-cuenta" onClick={() => onSeleccionar("cuenta")}>
            <span className="tipo-activo-icono">
              <PiggyBank size={20} />
            </span>
            <div>
              <div className="tipo-activo-nombre">Cuenta de ahorro</div>
              <div className="tipo-activo-sub">Débito, efectivo o fondos</div>
            </div>
          </button>

          <button className="tipo-activo-opcion" data-testid="tipo-activo-tarjeta" onClick={() => onSeleccionar("tarjeta")}>
            <span className="tipo-activo-icono">
              <CreditCard size={20} />
            </span>
            <div>
              <div className="tipo-activo-nombre">Tarjeta de crédito</div>
              <div className="tipo-activo-sub">Línea de crédito con corte y pago</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
