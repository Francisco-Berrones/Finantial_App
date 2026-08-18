import { CreditCard, Repeat, Check } from "lucide-react";
import { fmt } from "../../shared/format";
import { textoRecordatorio } from "../../shared/dateUtils";

export default function RecordatorioRow({ recordatorio, onClick, onPagar }) {
  const esAtrasado = recordatorio.estado === "atrasado";
  const Icon = recordatorio.tipo === "tarjeta" ? CreditCard : Repeat;

  return (
    <div
      className={`recordatorio-row ${esAtrasado ? "atrasado" : ""}`}
      data-testid={`recordatorio-row-${recordatorio.tipo}-${recordatorio.id}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <style>{`
        .recordatorio-row {
          --surface: #FFFFFF; --outline-variant: #C6C6CD; --on-surface: #1A1C1E; --on-surface-variant: #44474E;
          --secondary-container: #D5E3FD; --on-secondary-container: #57657B;
          --atrasado-bg: #FDECEA; --atrasado-ink: #A8412B; --atrasado-border: #F3C9C0;
          font-family: Inter, sans-serif;
          display: flex; align-items: center; gap: 12px;
          background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 16px;
          padding: 14px 16px; margin-bottom: 10px;
        }
        .app-root[data-theme="dark"] .recordatorio-row {
          --surface: #1B1F23; --outline-variant: #43474E; --on-surface: #E2E2E6; --on-surface-variant: #C4C6D0;
          --secondary-container: #3A4A63; --on-secondary-container: #B8C6E0;
          --atrasado-bg: #3A2420; --atrasado-ink: #FFB4AB; --atrasado-border: #5C332C;
        }
        .recordatorio-row.atrasado { background: var(--atrasado-bg); border-color: var(--atrasado-border); }
        .recordatorio-row-icon { width: 38px; height: 38px; border-radius: 9999px; background: var(--secondary-container); color: var(--on-secondary-container); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .recordatorio-row.atrasado .recordatorio-row-icon { background: var(--atrasado-ink); color: #fff; }
        .recordatorio-row-body { flex: 1; min-width: 0; }
        .recordatorio-row-nombre { font-size: 15px; font-weight: 600; color: var(--on-surface); }
        .recordatorio-row-estado { font-size: 13px; color: var(--on-surface-variant); margin-top: 2px; }
        .recordatorio-row.atrasado .recordatorio-row-estado { color: var(--atrasado-ink); font-weight: 600; }
        .recordatorio-row-right { text-align: right; flex-shrink: 0; }
        .recordatorio-row-monto { font-size: 15px; font-weight: 700; color: var(--on-surface); }
        .recordatorio-row-pagar-btn { margin-top: 6px; display: flex; align-items: center; gap: 4px; background: var(--atrasado-ink); color: #fff; border: none; border-radius: 9999px; padding: 6px 12px; font-family: Inter, sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; }
      `}</style>

      <span className="recordatorio-row-icon">
        <Icon size={18} />
      </span>
      <div className="recordatorio-row-body">
        <div className="recordatorio-row-nombre">{recordatorio.nombre}</div>
        <div className="recordatorio-row-estado">{textoRecordatorio(recordatorio.estado, recordatorio.dias)}</div>
      </div>
      <div className="recordatorio-row-right">
        <div className="recordatorio-row-monto mono">{fmt(recordatorio.monto)}</div>
        {recordatorio.tipo === "suscripcion" && esAtrasado && onPagar && (
          <button
            className="recordatorio-row-pagar-btn"
            data-testid={`recordatorio-pagar-button-${recordatorio.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onPagar(recordatorio);
            }}
          >
            <Check size={13} /> Pagar
          </button>
        )}
      </div>
    </div>
  );
}
