import { ArrowLeft } from "lucide-react";
import RecordatorioRow from "./RecordatorioRow";

export default function RecordatoriosView({ recordatorios, onVerTarjeta, onPagar, onBack }) {
  return (
    <div className="recordatorios-root">
      <style>{`
        .recordatorios-root {
          --bg: #F7F9FB; --on-surface: #1A1C1E; --on-surface-variant: #44474E;
          min-height: 100vh; min-height: 100dvh;
          background: var(--bg); font-family: Inter, sans-serif; color: var(--on-surface);
        }
        .app-root[data-theme="dark"] .recordatorios-root {
          --bg: #101317; --on-surface: #E2E2E6; --on-surface-variant: #C4C6D0;
        }
        .recordatorios-header { position: sticky; top: 0; z-index: 10; background: var(--bg); padding: 14px 12px; display: flex; align-items: center; }
        .recordatorios-back { width: 40px; height: 40px; border-radius: 9999px; background: none; border: none; color: var(--on-surface); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .recordatorios-back:active { background: rgba(0,0,0,0.05); }
        .recordatorios-titulo { position: absolute; left: 0; right: 0; text-align: center; font-size: 18px; font-weight: 700; color: var(--on-surface); pointer-events: none; }
        .recordatorios-body { padding: 8px 16px 32px; max-width: 460px; margin: 0 auto; }
        .recordatorios-empty { color: var(--on-surface-variant); font-size: 14px; text-align: center; padding: 32px 16px; }
      `}</style>

      <div className="recordatorios-header">
        <button className="recordatorios-back" data-testid="recordatorios-back-button" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <span className="recordatorios-titulo">Recordatorios</span>
      </div>

      <div className="recordatorios-body">
        {recordatorios.length === 0 ? (
          <div className="recordatorios-empty" data-testid="recordatorios-empty">
            No tienes recordatorios pendientes.
          </div>
        ) : (
          recordatorios.map((r) => (
            <RecordatorioRow
              key={`${r.tipo}-${r.id}`}
              recordatorio={r}
              onClick={r.tipo === "tarjeta" ? () => onVerTarjeta(r.id) : undefined}
              onPagar={r.tipo === "suscripcion" ? onPagar : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
