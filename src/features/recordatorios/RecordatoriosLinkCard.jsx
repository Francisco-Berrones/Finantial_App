import { ChevronRight, BellRing } from "lucide-react";
import { fmt } from "../../shared/format";
import { textoRecordatorio } from "../../shared/dateUtils";

export default function RecordatoriosLinkCard({ recordatorios, onClick }) {
  if (recordatorios.length === 0) return null;

  const destacado = recordatorios[0];
  const atrasados = recordatorios.filter((r) => r.estado === "atrasado").length;

  return (
    <div className="recordatorios-link-root">
      <style>{`
        .recordatorios-link-root {
          --surface: #FFFFFF; --outline-variant: #C6C6CD; --primary-container: #131B2E; --on-primary: #FFFFFF;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E; --atrasado-ink: #A8412B;
          font-family: Inter, sans-serif; margin-top: 28px;
        }
        .app-root[data-theme="dark"] .recordatorios-link-root {
          --surface: #1B1F23; --outline-variant: #43474E; --primary-container: #2A3550; --on-primary: #131B2E;
          --on-surface: #E2E2E6; --on-surface-variant: #C4C6D0; --atrasado-ink: #FFB4AB;
        }
        .recordatorios-link-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .recordatorios-link-head svg { color: var(--primary-container); }
        .recordatorios-link-titulo { font-size: 18px; font-weight: 600; color: var(--on-surface); }
        .recordatorios-link-card { width: 100%; box-sizing: border-box; background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 20px; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 14px; cursor: pointer; font-family: Inter, sans-serif; text-align: left; }
        .recordatorios-link-card:active { transform: scale(0.98); }
        .recordatorios-link-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
        .recordatorios-link-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--primary-container); color: var(--on-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .recordatorios-link-nombre { font-size: 16px; font-weight: 600; color: var(--on-surface); }
        .recordatorios-link-sub { font-size: 13px; color: var(--on-surface-variant); margin-top: 2px; }
        .recordatorios-link-sub.atrasado { color: var(--atrasado-ink); font-weight: 600; }
        .recordatorios-link-chevron { color: var(--on-surface-variant); flex-shrink: 0; }
      `}</style>

      <div className="recordatorios-link-head">
        <BellRing size={20} />
        <span className="recordatorios-link-titulo">Recordatorios</span>
      </div>

      <button className="recordatorios-link-card" data-testid="recordatorios-link-card" onClick={onClick}>
        <div className="recordatorios-link-left">
          <span className="recordatorios-link-icon">
            <BellRing size={20} />
          </span>
          <div>
            <div className="recordatorios-link-nombre">{recordatorios.length} pendiente{recordatorios.length === 1 ? "" : "s"}</div>
            <div className={`recordatorios-link-sub ${destacado.estado === "atrasado" ? "atrasado" : ""}`}>
              {destacado.nombre} · {textoRecordatorio(destacado.estado, destacado.dias)}
              {atrasados > 1 ? ` · ${atrasados} atrasados` : ""}
              {` · ${fmt(destacado.monto)}`}
            </div>
          </div>
        </div>
        <ChevronRight size={20} className="recordatorios-link-chevron" />
      </button>
    </div>
  );
}
