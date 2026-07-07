import { X, Check } from "lucide-react";
import { fmt } from "../../shared/format";

export default function SuscripcionesPendientesModal({ pendientes, onConfirmar, onClose }) {
  return (
    <div className="sus-modal-backdrop" data-testid="suscripciones-modal-backdrop">
      <style>{`
        .sus-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: flex-end; justify-content: center; z-index: 50; }
        .sus-modal { width: 100%; max-width: 480px; background: var(--paper-card); border-radius: 20px 20px 0 0; padding: 20px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); max-height: 80vh; overflow-y: auto; box-sizing: border-box; }
        .sus-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .sus-modal-title { font-size: 17px; font-weight: 700; }
        .sus-modal-close { background: none; border: none; color: var(--ink-soft); cursor: pointer; padding: 4px; }
        .sus-modal-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 0; border-bottom: 1px solid var(--paper-line); }
        .sus-modal-item:last-of-type { border-bottom: none; }
        .sus-modal-item-nombre { font-size: 15px; font-weight: 700; }
        .sus-modal-item-sub { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
        .sus-modal-confirm-btn { display: flex; align-items: center; gap: 6px; background: var(--ahorro); color: #fff; border: none; border-radius: 20px; padding: 8px 14px; font-family: Figtree; font-size: 13px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
        .sus-modal-footer { margin-top: 12px; }
      `}</style>
      <div className="sus-modal">
        <div className="sus-modal-header">
          <div className="sus-modal-title">Suscripciones pendientes de confirmar</div>
          <button className="sus-modal-close" data-testid="suscripciones-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {pendientes.map((s) => (
          <div className="sus-modal-item" key={s.id}>
            <div>
              <div className="sus-modal-item-nombre">{s.nombre}</div>
              <div className="sus-modal-item-sub">{fmt(s.monto)} · {s.target_nombre}</div>
            </div>
            <button
              className="sus-modal-confirm-btn"
              data-testid={`suscripciones-modal-confirmar-${s.id}`}
              onClick={() => onConfirmar(s.id)}
            >
              <Check size={14} /> Confirmar
            </button>
          </div>
        ))}

        <div className="sus-modal-footer">
          <button className="btn" data-testid="suscripciones-modal-ahora-no" onClick={onClose} style={{ width: "100%" }}>
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
