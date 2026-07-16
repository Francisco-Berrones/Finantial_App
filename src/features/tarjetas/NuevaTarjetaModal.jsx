import { useState } from "react";
import { CreditCard, X } from "lucide-react";

const COLORES_DISPONIBLES = ["#131b2e", "#1e40af", "#047857", "#7c2d12", "#701a75", "#be123c", "#000000"];

const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function NuevaTarjetaModal({ onGuardar, onClose }) {
  const [nombre, setNombre] = useState("");
  const [banco, setBanco] = useState("");
  const [lineaTotal, setLineaTotal] = useState("");
  const [saldoUsado, setSaldoUsado] = useState("");
  const [diaCorte, setDiaCorte] = useState("");
  const [diaPago, setDiaPago] = useState("");
  const [color, setColor] = useState(COLORES_DISPONIBLES[0]);

  const handleGuardar = async () => {
    if (!nombre.trim()) return;
    const ok = await onGuardar({ nombre, banco, lineaTotal, saldoUsado, diaCorte, diaPago, color });
    if (ok) onClose();
  };

  return (
    <div className="nueva-tarjeta-backdrop" data-testid="nueva-tarjeta-backdrop" onClick={onClose}>
      <style>{`
        .nueva-tarjeta-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); z-index: 60; display: flex; align-items: flex-end; justify-content: center; }
        .nueva-tarjeta-sheet { width: 100%; max-width: 480px; max-height: 92vh; background: #F7F9FB; border-radius: 28px 28px 0 0; box-shadow: 0 -8px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; font-family: Inter, sans-serif; }
        .nueva-tarjeta-handle { width: 40px; height: 6px; background: #E0E3E5; border-radius: 9999px; margin: 12px auto 0; }
        .nueva-tarjeta-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; }
        .nueva-tarjeta-titulo { font-size: 18px; font-weight: 600; color: #1A1C1E; }
        .nueva-tarjeta-close { width: 40px; height: 40px; border-radius: 9999px; background: none; border: none; color: #44474E; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .nueva-tarjeta-close:active { background: #E6E8EA; }
        .nueva-tarjeta-body { flex: 1; overflow-y: auto; padding: 0 20px calc(24px + env(safe-area-inset-bottom)); display: flex; flex-direction: column; gap: 24px; }

        .nueva-tarjeta-preview { width: 100%; aspect-ratio: 1.58 / 1; border-radius: 20px; padding: 20px; color: #fff; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 24px rgba(0,0,0,0.18); position: relative; overflow: hidden; transition: background-color 0.3s ease; }
        .nueva-tarjeta-preview-glow-a { position: absolute; width: 180px; height: 180px; border-radius: 9999px; background: rgba(255,255,255,0.1); filter: blur(40px); top: -60px; right: -60px; }
        .nueva-tarjeta-preview-glow-b { position: absolute; width: 180px; height: 180px; border-radius: 9999px; background: rgba(0,0,0,0.1); filter: blur(40px); bottom: -60px; left: -60px; }
        .nueva-tarjeta-preview-top { display: flex; justify-content: space-between; align-items: flex-start; position: relative; z-index: 1; }
        .nueva-tarjeta-preview-banco { font-size: 11px; font-weight: 500; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.08em; margin: 0; }
        .nueva-tarjeta-preview-nombre { font-size: 16px; font-weight: 600; margin: 2px 0 0; }
        .nueva-tarjeta-preview-bottom { position: relative; z-index: 1; }
        .nueva-tarjeta-preview-chips { display: flex; gap: 6px; margin-bottom: 8px; }
        .nueva-tarjeta-preview-chip { width: 28px; height: 18px; border-radius: 3px; background: rgba(255,255,255,0.2); }

        .nueva-tarjeta-fields { display: flex; flex-direction: column; gap: 16px; }
        .nueva-tarjeta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .nueva-tarjeta-field label { display: block; font-size: 12px; font-weight: 500; color: #44474E; margin: 0 0 6px; }
        .nueva-tarjeta-field input, .nueva-tarjeta-field select { width: 100%; box-sizing: border-box; height: 48px; background: #F2F4F6; border: 1px solid #C6C6CD; border-radius: 12px; padding: 0 14px; font-family: Inter, sans-serif; font-size: 15px; color: #1A1C1E; outline: none; appearance: none; }
        .nueva-tarjeta-field input:focus, .nueva-tarjeta-field select:focus { border-color: #131B2E; }
        .nueva-tarjeta-money-wrap { position: relative; }
        .nueva-tarjeta-money-wrap span { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #44474E; pointer-events: none; }
        .nueva-tarjeta-money-wrap input { padding-left: 26px; }

        .nueva-tarjeta-colores { display: flex; gap: 12px; overflow-x: auto; flex-wrap: wrap; }
        .nueva-tarjeta-color-btn { flex-shrink: 0; width: 36px; height: 36px; border-radius: 9999px; border: 2px solid transparent; cursor: pointer; box-shadow: 0 0 0 2px transparent; }
        .nueva-tarjeta-color-btn.selected { box-shadow: 0 0 0 2px #F7F9FB, 0 0 0 4px #131B2E; }

        .nueva-tarjeta-guardar { display: block; box-sizing: border-box; width: 100%; margin: 0; height: 56px; background: #000000; color: #fff; border: none; border-radius: 12px; font-family: Inter, sans-serif; font-size: 18px; font-weight: 600; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.15); transition: opacity 0.15s ease, transform 0.15s ease; }
        .nueva-tarjeta-guardar:hover { opacity: 0.9; }
        .nueva-tarjeta-guardar:active { transform: scale(0.95); }
      `}</style>

      <div className="nueva-tarjeta-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="nueva-tarjeta-handle" />
        <div className="nueva-tarjeta-head">
          <span className="nueva-tarjeta-titulo">Nueva Tarjeta de Crédito</span>
          <button className="nueva-tarjeta-close" data-testid="nueva-tarjeta-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="nueva-tarjeta-body">
          <div className="nueva-tarjeta-preview" style={{ background: color }}>
            <div className="nueva-tarjeta-preview-glow-a" />
            <div className="nueva-tarjeta-preview-glow-b" />
            <div className="nueva-tarjeta-preview-top">
              <div>
                <p className="nueva-tarjeta-preview-banco">{banco || "Banco Emisor"}</p>
                <p className="nueva-tarjeta-preview-nombre">{nombre || "Nombre de Tarjeta"}</p>
              </div>
              <CreditCard size={30} style={{ opacity: 0.5 }} />
            </div>
            <div className="nueva-tarjeta-preview-bottom">
              <div className="nueva-tarjeta-preview-chips">
                <div className="nueva-tarjeta-preview-chip" />
              </div>
            </div>
          </div>

          <div className="nueva-tarjeta-fields">
            <div className="nueva-tarjeta-row">
              <div className="nueva-tarjeta-field">
                <label>Nombre Personalizado</label>
                <input placeholder="Ej. Compras Diarias" data-testid="nueva-tarjeta-nombre-input" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="nueva-tarjeta-field">
                <label>Banco</label>
                <input placeholder="Ej. BBVA, Santander" data-testid="nueva-tarjeta-banco-input" value={banco} onChange={(e) => setBanco(e.target.value)} />
              </div>
            </div>

            <div className="nueva-tarjeta-row">
              <div className="nueva-tarjeta-field">
                <label>Línea de Crédito Total</label>
                <div className="nueva-tarjeta-money-wrap">
                  <span>$</span>
                  <input
                    inputMode="decimal"
                    placeholder="0.00"
                    data-testid="nueva-tarjeta-linea-input"
                    value={lineaTotal}
                    onChange={(e) => setLineaTotal(e.target.value.replace(/[^0-9.]/g, ""))}
                  />
                </div>
              </div>
              <div className="nueva-tarjeta-field">
                <label>Saldo Actual (Opcional)</label>
                <div className="nueva-tarjeta-money-wrap">
                  <span>$</span>
                  <input
                    inputMode="decimal"
                    placeholder="0.00"
                    data-testid="nueva-tarjeta-usado-input"
                    value={saldoUsado}
                    onChange={(e) => setSaldoUsado(e.target.value.replace(/[^0-9.]/g, ""))}
                  />
                </div>
              </div>
            </div>

            <div className="nueva-tarjeta-row">
              <div className="nueva-tarjeta-field">
                <label>Día de Corte</label>
                <select data-testid="nueva-tarjeta-dia-corte-select" value={diaCorte} onChange={(e) => setDiaCorte(e.target.value)}>
                  <option value="">Sin definir</option>
                  {DIAS.map((d) => (
                    <option key={d} value={d}>Día {String(d).padStart(2, "0")}</option>
                  ))}
                </select>
              </div>
              <div className="nueva-tarjeta-field">
                <label>Día de Pago</label>
                <select data-testid="nueva-tarjeta-dia-pago-select" value={diaPago} onChange={(e) => setDiaPago(e.target.value)}>
                  <option value="">Sin definir</option>
                  {DIAS.map((d) => (
                    <option key={d} value={d}>Día {String(d).padStart(2, "0")}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#44474E", margin: "0 0 10px" }}>Personalizar Color</label>
              <div className="nueva-tarjeta-colores">
                {COLORES_DISPONIBLES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`nueva-tarjeta-color-btn ${color === c ? "selected" : ""}`}
                    style={{ background: c }}
                    data-testid={`nueva-tarjeta-color-${c.replace("#", "")}`}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>

          <button className="nueva-tarjeta-guardar" data-testid="nueva-tarjeta-guardar-button" onClick={handleGuardar}>
            Guardar Tarjeta
          </button>
        </div>
      </div>
    </div>
  );
}
