import { ArrowLeft } from "lucide-react";
import SuscripcionesManager from "../features/suscripciones/SuscripcionesManager";

export default function SuscripcionesView({ suscripciones, cuentas, tarjetas, categorias, session, addSuscripcion, deleteSuscripcion, onConfirmar, onChange, onBack }) {
  return (
    <div className="suscripciones-nuevo-root">
      <style>{`
        .suscripciones-nuevo-root {
          --bg: #F7F9FB; --surface: #FFFFFF; --surface-low: #F2F4F6;
          --primary: #000000; --on-primary: #FFFFFF; --primary-container: #131B2E;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E;
          --outline: #76777D; --outline-variant: #C6C6CD;
          min-height: 100vh; min-height: 100dvh;
          background: var(--bg); font-family: Inter, sans-serif; color: var(--on-surface);
          transition: background 0.2s ease, color 0.2s ease;
        }
        .app-root[data-theme="dark"] .suscripciones-nuevo-root {
          --bg: #101317; --surface: #1B1F23; --surface-low: #15181B;
          --primary: #DAE2FD; --on-primary: #131B2E; --primary-container: #2A3550;
          --on-surface: #E2E2E6; --on-surface-variant: #C4C6D0;
          --outline: #8D9199; --outline-variant: #43474E;
        }
        .suscripciones-nuevo-header { position: sticky; top: 0; z-index: 10; background: var(--bg); padding: 14px 12px; display: flex; align-items: center; gap: 8px; }
        .suscripciones-nuevo-back { width: 40px; height: 40px; border-radius: 9999px; background: none; border: none; color: var(--on-surface); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .suscripciones-nuevo-back:active { background: var(--surface-low); }
        .suscripciones-nuevo-titulo { font-size: 18px; font-weight: 700; color: var(--on-surface); }
        .suscripciones-nuevo-body { padding: 4px 16px 32px; max-width: 420px; margin: 0 auto; }

        .suscripciones-nuevo-body .section-title { font-family: Inter, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--outline); margin: 0 0 10px !important; }
        .suscripciones-nuevo-body .cuenta-list { display: flex; flex-direction: column; gap: 10px; }
        .suscripciones-nuevo-body .cuenta-row-card { background: var(--surface); border-radius: 14px; padding: 16px; border: 1px solid var(--surface-low); box-shadow: 0 2px 8px rgba(13,28,47,0.04); }
        .suscripciones-nuevo-body .cuenta-row-name { font-size: 16px; font-weight: 600; color: var(--on-surface); }
        .suscripciones-nuevo-body .cuenta-row-saldo { font-size: 13px; color: var(--on-surface-variant); margin-top: 4px; }
        .suscripciones-nuevo-body .mov-sub { font-size: 12px; color: var(--outline); margin-top: 4px; }
        .suscripciones-nuevo-body .row-delete-btn { background: none; border: none; color: var(--outline); padding: 4px; cursor: pointer; }
        .suscripciones-nuevo-body .add-link { font-family: Inter, sans-serif; font-size: 13px; font-weight: 500; color: var(--on-surface-variant); background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; margin: 10px 0 0; }
        .suscripciones-nuevo-body .form-box { background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 14px; padding: 14px; margin: 10px 0; }
        .suscripciones-nuevo-body .form-box input { width: 100%; box-sizing: border-box; font-family: Inter, sans-serif; font-size: 16px; border: 1px solid var(--outline-variant); border-radius: 10px; padding: 12px 14px; margin-bottom: 8px; background: var(--surface); color: var(--on-surface); }
        .suscripciones-nuevo-body .select-wrapper { position: relative; margin-bottom: 8px; }
        .suscripciones-nuevo-body .target-select { width: 100%; appearance: none; font-family: Inter, sans-serif; font-size: 16px; border: 1px solid var(--outline-variant); border-radius: 10px; padding: 12px 36px 12px 14px; background: var(--surface); color: var(--on-surface); }
        .suscripciones-nuevo-body .select-chevron { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--outline); pointer-events: none; }
        .suscripciones-nuevo-body .btn { font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; border: 1px solid var(--outline-variant); background: var(--surface); color: var(--on-surface); padding: 10px 16px; border-radius: 10px; cursor: pointer; flex: 1; }
        .suscripciones-nuevo-body .btn.dark { background: var(--primary-container); color: var(--on-primary); border-color: var(--primary-container); }
      `}</style>

      <div className="suscripciones-nuevo-header">
        <button className="suscripciones-nuevo-back" data-testid="suscripciones-back-button" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <span className="suscripciones-nuevo-titulo">Suscripciones</span>
      </div>

      <div className="suscripciones-nuevo-body">
        <SuscripcionesManager
          suscripciones={suscripciones}
          cuentas={cuentas}
          tarjetas={tarjetas}
          categorias={categorias}
          session={session}
          addSuscripcion={addSuscripcion}
          deleteSuscripcion={deleteSuscripcion}
          onConfirmar={onConfirmar}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
