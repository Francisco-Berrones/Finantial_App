import { X, Plus, Trash2, MessageCircle } from "lucide-react";

function fmtFechaCorta(iso) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ConversacionesModal({ conversaciones, conversacionActualId, onSeleccionar, onNueva, onEliminar, onClose }) {
  return (
    <div className="conv-modal-backdrop" data-testid="conversaciones-modal-backdrop">
      <style>{`
        .conv-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: flex-end; justify-content: center; z-index: 50; }
        .conv-modal { width: 100%; max-width: 480px; background: var(--paper-card); border-radius: 20px 20px 0 0; padding: 20px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); max-height: 80vh; overflow-y: auto; box-sizing: border-box; }
        .conv-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .conv-modal-title { font-size: 17px; font-weight: 700; }
        .conv-modal-close { background: none; border: none; color: var(--ink-soft); cursor: pointer; padding: 4px; }
        .conv-modal-item { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid var(--paper-line); cursor: pointer; background: none; border-left: none; border-right: none; border-top: none; width: 100%; text-align: left; font-family: Figtree; }
        .conv-modal-item:last-of-type { border-bottom: none; }
        .conv-modal-item.active .conv-modal-item-titulo { color: var(--ink); font-weight: 700; }
        .conv-modal-item-titulo { font-size: 14px; color: var(--ink); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .conv-modal-item-fecha { font-size: 12px; color: var(--ink-soft); flex-shrink: 0; }
        .conv-modal-item-delete { background: none; border: none; color: var(--ink-soft); padding: 4px; cursor: pointer; flex-shrink: 0; }
        .conv-modal-empty { color: var(--ink-soft); font-size: 14px; padding: 12px 0; }
      `}</style>
      <div className="conv-modal">
        <div className="conv-modal-header">
          <div className="conv-modal-title">Conversaciones</div>
          <button className="conv-modal-close" data-testid="conversaciones-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <button className="action-btn" data-testid="conversaciones-nueva-button" onClick={onNueva} style={{ marginBottom: 12 }}>
          <span className="ico ahorro"><Plus size={17} /></span>Nueva conversación
        </button>

        {conversaciones.length === 0 ? (
          <div className="conv-modal-empty">Todavía no tienes conversaciones.</div>
        ) : (
          conversaciones.map((c) => (
            <button
              key={c.id}
              className={`conv-modal-item ${c.id === conversacionActualId ? "active" : ""}`}
              data-testid={`conversaciones-item-${c.id}`}
              onClick={() => onSeleccionar(c.id)}
            >
              <MessageCircle size={16} color="var(--ink-soft)" />
              <span className="conv-modal-item-titulo">{c.titulo || "Nueva conversación"}</span>
              <span className="conv-modal-item-fecha">{fmtFechaCorta(c.fecha_actualizacion)}</span>
              <span
                className="conv-modal-item-delete"
                data-testid={`conversaciones-eliminar-${c.id}`}
                onClick={(e) => { e.stopPropagation(); onEliminar(c.id); }}
              >
                <Trash2 size={14} />
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
