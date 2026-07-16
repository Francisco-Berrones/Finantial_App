import { useState } from "react";
import { ArrowLeft, PlusCircle } from "lucide-react";

const PROPOSITOS = [
  { value: "viajes", label: "Viajes" },
  { value: "emergencia", label: "Fondo Emergencia" },
  { value: "educacion", label: "Educación" },
  { value: "inversion", label: "Inversión" },
];

export default function NuevaCuentaView({ session, addCuenta, onChange, onBack }) {
  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState("");
  const [proposito, setProposito] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const handleCrear = async () => {
    if (!nombre.trim() || guardando) return;
    setGuardando(true);
    const ok = await addCuenta({ nombre, saldo, proposito, userId: session.user.id });
    setGuardando(false);
    if (ok) {
      await onChange();
      onBack();
    }
  };

  return (
    <div className="nueva-cuenta-root">
      <style>{`
        .nueva-cuenta-root {
          --bg: #F7F9FB; --surface: #FFFFFF; --surface-low: #F2F4F6;
          --primary: #000000; --on-primary: #FFFFFF; --primary-container: #131B2E;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E;
          --outline: #76777D; --outline-variant: #C6C6CD;
          min-height: 100vh; min-height: 100dvh;
          background: var(--bg); font-family: Inter, sans-serif; color: var(--on-surface);
          display: flex; flex-direction: column;
        }
        .nueva-cuenta-header { position: sticky; top: 0; z-index: 10; background: var(--bg); padding: 14px 12px; display: flex; align-items: center; }
        .nueva-cuenta-back { width: 40px; height: 40px; border-radius: 9999px; background: none; border: none; color: var(--on-surface); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .nueva-cuenta-back:active { background: var(--surface-low); }
        .nueva-cuenta-titulo { position: absolute; left: 0; right: 0; text-align: center; font-size: 18px; font-weight: 700; color: var(--on-surface); pointer-events: none; }

        .nueva-cuenta-body { flex: 1; padding: 8px 16px 32px; max-width: 420px; margin: 0 auto; width: 100%; box-sizing: border-box; }

        .nueva-cuenta-card { background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 16px; padding: 20px; }
        .nueva-cuenta-field { margin-bottom: 16px; }
        .nueva-cuenta-field:last-child { margin-bottom: 0; }
        .nueva-cuenta-label { display: block; font-size: 12px; font-weight: 500; color: var(--on-surface-variant); margin: 0 0 6px 4px; }
        .nueva-cuenta-input { width: 100%; box-sizing: border-box; height: 48px; padding: 0 14px; background: var(--surface-low); border: 1px solid var(--outline-variant); border-radius: 10px; font-family: Inter, sans-serif; font-size: 16px; color: var(--on-surface); outline: none; }
        .nueva-cuenta-input:focus { border-color: var(--primary); }
        .nueva-cuenta-money-wrap { position: relative; }
        .nueva-cuenta-money-wrap span { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--primary); font-weight: 600; pointer-events: none; }
        .nueva-cuenta-money-wrap input { padding-left: 26px; }
        .nueva-cuenta-hint { font-size: 12px; color: var(--outline); margin: 6px 4px 0; line-height: 1.4; }

        .nueva-cuenta-chips { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 2px; }
        .nueva-cuenta-chip { padding: 8px 16px; border-radius: 9999px; border: 1px solid var(--outline-variant); background: var(--surface); color: var(--on-surface); font-family: Inter, sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; }
        .nueva-cuenta-chip.selected { background: var(--primary); color: var(--on-primary); border-color: var(--primary); }

        .nueva-cuenta-acciones { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
        .nueva-cuenta-btn { width: 100%; box-sizing: border-box; height: 52px; border-radius: 10px; font-family: Inter, sans-serif; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .nueva-cuenta-btn.crear { background: var(--primary); color: var(--on-primary); border: none; box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
        .nueva-cuenta-btn.crear:active { transform: scale(0.98); }
        .nueva-cuenta-btn.crear:disabled { opacity: 0.5; cursor: not-allowed; }
        .nueva-cuenta-btn.cancelar { background: none; color: var(--on-surface); border: 1px solid var(--outline-variant); }
        .nueva-cuenta-btn.cancelar:active { background: var(--surface-low); }
      `}</style>

      <div className="nueva-cuenta-header">
        <button className="nueva-cuenta-back" data-testid="nueva-cuenta-back-button" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <span className="nueva-cuenta-titulo">Apertura de Cuenta</span>
      </div>

      <div className="nueva-cuenta-body">
        <div className="nueva-cuenta-card">
          <div className="nueva-cuenta-field">
            <label className="nueva-cuenta-label">Nombre de la Cuenta</label>
            <input
              className="nueva-cuenta-input"
              placeholder="Ej. Ahorros para Viaje"
              data-testid="nueva-cuenta-nombre-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="nueva-cuenta-field">
            <label className="nueva-cuenta-label">Monto Inicial</label>
            <div className="nueva-cuenta-money-wrap">
              <span>$</span>
              <input
                className="nueva-cuenta-input"
                inputMode="decimal"
                placeholder="0.00"
                data-testid="nueva-cuenta-saldo-input"
                value={saldo}
                onChange={(e) => setSaldo(e.target.value.replace(/[^0-9.]/g, ""))}
              />
            </div>
            <p className="nueva-cuenta-hint">El monto se registrará como saldo inicial de la cuenta.</p>
          </div>

          <div className="nueva-cuenta-field">
            <label className="nueva-cuenta-label">Propósito del ahorro (opcional)</label>
            <div className="nueva-cuenta-chips">
              {PROPOSITOS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`nueva-cuenta-chip ${proposito === p.value ? "selected" : ""}`}
                  data-testid={`nueva-cuenta-proposito-${p.value}`}
                  onClick={() => setProposito(proposito === p.value ? null : p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="nueva-cuenta-acciones">
          <button
            className="nueva-cuenta-btn crear"
            data-testid="nueva-cuenta-crear-button"
            onClick={handleCrear}
            disabled={!nombre.trim() || guardando}
          >
            {guardando ? "Creando..." : (<><PlusCircle size={18} /> Crear Cuenta</>)}
          </button>
          <button className="nueva-cuenta-btn cancelar" data-testid="nueva-cuenta-cancelar-button" onClick={onBack}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
