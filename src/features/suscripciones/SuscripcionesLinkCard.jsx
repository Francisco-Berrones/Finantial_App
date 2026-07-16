import { ChevronRight, Repeat } from "lucide-react";
import { fmt } from "../../shared/format";

export default function SuscripcionesLinkCard({ suscripciones, onClick }) {
  const totalMensual = suscripciones.reduce(
    (s, x) => s + (x.frecuencia === "anual" ? Number(x.monto) / 12 : Number(x.monto)),
    0
  );

  return (
    <div className="suscripciones-link-root">
      <style>{`
        .suscripciones-link-root {
          --surface: #FFFFFF; --outline-variant: #C6C6CD; --primary-container: #131B2E; --on-primary: #FFFFFF;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E;
          font-family: Inter, sans-serif; margin-top: 28px;
        }
        .suscripciones-link-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .suscripciones-link-head svg { color: var(--primary-container); }
        .suscripciones-link-titulo { font-size: 18px; font-weight: 600; color: var(--on-surface); }
        .suscripciones-link-card { width: 100%; box-sizing: border-box; background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 20px; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 14px; cursor: pointer; font-family: Inter, sans-serif; text-align: left; }
        .suscripciones-link-card:active { transform: scale(0.98); }
        .suscripciones-link-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
        .suscripciones-link-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--primary-container); color: var(--on-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .suscripciones-link-nombre { font-size: 16px; font-weight: 600; color: var(--on-surface); }
        .suscripciones-link-sub { font-size: 13px; color: var(--on-surface-variant); margin-top: 2px; }
        .suscripciones-link-chevron { color: var(--on-surface-variant); flex-shrink: 0; }
      `}</style>

      <div className="suscripciones-link-head">
        <Repeat size={20} />
        <span className="suscripciones-link-titulo">Suscripciones</span>
      </div>

      <button className="suscripciones-link-card" data-testid="suscripciones-link-card" onClick={onClick}>
        <div className="suscripciones-link-left">
          <span className="suscripciones-link-icon">
            <Repeat size={20} />
          </span>
          <div>
            <div className="suscripciones-link-nombre">Mis Suscripciones</div>
            <div className="suscripciones-link-sub">
              {suscripciones.length} activa{suscripciones.length === 1 ? "" : "s"} · {fmt(totalMensual)} al mes
            </div>
          </div>
        </div>
        <ChevronRight size={20} className="suscripciones-link-chevron" />
      </button>
    </div>
  );
}
