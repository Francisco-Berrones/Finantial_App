import { useState } from "react";
import { Calendar, Check, ChevronRight, Repeat, Tag, X } from "lucide-react";
import { fmt, fmtDiaLargo } from "../../shared/format";
import { estiloCategoria } from "../../shared/categoriaIconos";
import CategoriaPickerModal from "../movimientos/CategoriaPickerModal";

const PLAZOS = [3, 6, 12, 18, 24];

export default function NuevaCompraMsiModal({ categorias, crearCategoria, onGuardar, onClose }) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [meses, setMeses] = useState(12);
  const [categoriaId, setCategoriaId] = useState("");
  const [categoriaPickerAbierto, setCategoriaPickerAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const categoriaSeleccionada = categorias.find((c) => String(c.id) === String(categoriaId)) || null;
  const montoNum = parseFloat(monto) || 0;
  const mensualidadEstimada = meses > 0 ? montoNum / meses : 0;

  const handleGuardar = async () => {
    if (!descripcion.trim() || !montoNum || guardando) return;
    setGuardando(true);
    const ok = await onGuardar({ descripcion, monto, meses: String(meses), categoriaId: categoriaId || null });
    setGuardando(false);
    if (ok) onClose();
  };

  return (
    <div className="nueva-msi-backdrop" data-testid="nueva-compra-msi-backdrop" onClick={onClose}>
      <style>{`
        .nueva-msi-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); z-index: 60; display: flex; align-items: flex-end; justify-content: center; }
        .nueva-msi-sheet { width: 100%; max-width: 480px; max-height: 92vh; background: #F7F9FB; border-radius: 28px 28px 0 0; box-shadow: 0 -8px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; font-family: Inter, sans-serif; }
        .nueva-msi-handle { width: 40px; height: 6px; background: #E0E3E5; border-radius: 9999px; margin: 12px auto 0; }
        .nueva-msi-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; }
        .nueva-msi-titulo { font-size: 18px; font-weight: 700; color: #1A1C1E; }
        .nueva-msi-close { width: 32px; height: 32px; border-radius: 9999px; background: #E6E8EA; border: none; color: #44474E; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .nueva-msi-body { flex: 1; overflow-y: auto; padding: 0 20px calc(24px + env(safe-area-inset-bottom)); display: flex; flex-direction: column; gap: 20px; }

        .nueva-msi-field label { display: block; font-size: 12px; font-weight: 500; color: #44474E; margin: 0 0 6px 4px; }
        .nueva-msi-field input { width: 100%; box-sizing: border-box; height: 52px; background: #FFFFFF; border: none; border-radius: 14px; padding: 0 16px; font-family: Inter, sans-serif; font-size: 16px; font-weight: 600; color: #1A1C1E; outline: none; }
        .nueva-msi-money-wrap { position: relative; }
        .nueva-msi-money-wrap span { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 22px; font-weight: 700; color: #44474E; pointer-events: none; }
        .nueva-msi-money-wrap input { padding-left: 32px; font-size: 22px; }

        .nueva-msi-chips { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
        .nueva-msi-chip { height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: 2px solid #ECEEF0; background: #ECEEF0; color: #44474E; font-family: Inter, sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; }
        .nueva-msi-chip.selected { border-color: #131B2E; background: #DAE2FD; color: #131B2E; }

        .nueva-msi-estimado { background: #F2F4F6; border-radius: 14px; padding: 18px; display: flex; align-items: center; justify-content: space-between; }
        .nueva-msi-estimado-label { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #44474E; margin: 0 0 4px; }
        .nueva-msi-estimado-valor { font-size: 26px; font-weight: 700; color: #1A1C1E; }
        .nueva-msi-estimado-icon { width: 44px; height: 44px; border-radius: 9999px; background: #D5E3FD; color: #131B2E; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        .nueva-msi-row-btn { width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; height: 52px; padding: 0 16px; background: #FFFFFF; border: 1px solid rgba(198,198,205,0.4); border-radius: 14px; cursor: pointer; font-family: Inter, sans-serif; }
        .nueva-msi-row-left { display: flex; align-items: center; gap: 10px; }
        .nueva-msi-row-icono { width: 24px; height: 24px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .nueva-msi-row-label { font-size: 15px; font-weight: 600; color: #1A1C1E; }
        .nueva-msi-row-static { width: 100%; box-sizing: border-box; display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 16px; background: #FFFFFF; border: 1px solid rgba(198,198,205,0.4); border-radius: 14px; color: #44474E; }
        .nueva-msi-row-static span { font-size: 15px; font-weight: 600; color: #1A1C1E; }

        .nueva-msi-guardar { width: 100%; box-sizing: border-box; height: 56px; background: #000000; color: #fff; border: none; border-radius: 14px; font-family: Inter, sans-serif; font-size: 17px; font-weight: 700; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .nueva-msi-guardar:active { transform: scale(0.98); }
        .nueva-msi-guardar:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="nueva-msi-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="nueva-msi-handle" />
        <div className="nueva-msi-head">
          <span className="nueva-msi-titulo">Nuevo Gasto a MSI</span>
          <button className="nueva-msi-close" data-testid="nueva-compra-msi-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="nueva-msi-body">
          <div className="nueva-msi-field">
            <label>Descripción</label>
            <input
              placeholder="Ej. Compra en Amazon"
              data-testid="nueva-compra-msi-descripcion-input"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="nueva-msi-field">
            <label>Monto total</label>
            <div className="nueva-msi-money-wrap">
              <span>$</span>
              <input
                inputMode="decimal"
                placeholder="0.00"
                data-testid="nueva-compra-msi-monto-input"
                value={monto}
                onChange={(e) => setMonto(e.target.value.replace(/[^0-9.]/g, ""))}
              />
            </div>
          </div>

          <div className="nueva-msi-field">
            <label>Plazo en meses</label>
            <div className="nueva-msi-chips">
              {PLAZOS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`nueva-msi-chip ${meses === p ? "selected" : ""}`}
                  data-testid={`nueva-compra-msi-meses-${p}`}
                  onClick={() => setMeses(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="nueva-msi-estimado">
            <div>
              <p className="nueva-msi-estimado-label">Mensualidad estimada</p>
              <p className="nueva-msi-estimado-valor mono" data-testid="nueva-compra-msi-mensualidad">{fmt(mensualidadEstimada)}</p>
            </div>
            <span className="nueva-msi-estimado-icon">
              <Repeat size={20} />
            </span>
          </div>

          <div className="nueva-msi-field">
            <label>Categoría</label>
            <button
              type="button"
              className="nueva-msi-row-btn"
              data-testid="nueva-compra-msi-categoria-abrir-button"
              onClick={() => setCategoriaPickerAbierto(true)}
            >
              <span className="nueva-msi-row-left">
                {categoriaSeleccionada ? (
                  <>
                    <span
                      className="nueva-msi-row-icono"
                      style={{ background: estiloCategoria(categoriaSeleccionada).bg, color: estiloCategoria(categoriaSeleccionada).color }}
                    >
                      {(() => {
                        const { icon: Icon } = estiloCategoria(categoriaSeleccionada);
                        return <Icon size={14} />;
                      })()}
                    </span>
                    <span className="nueva-msi-row-label">{categoriaSeleccionada.nombre}</span>
                  </>
                ) : (
                  <>
                    <span className="nueva-msi-row-icono" style={{ background: "#ECEEF0", color: "#44474E" }}>
                      <Tag size={14} />
                    </span>
                    <span className="nueva-msi-row-label">Sin categoría</span>
                  </>
                )}
              </span>
              <ChevronRight size={18} color="#76777D" />
            </button>
          </div>

          <div className="nueva-msi-field">
            <label>Fecha de compra</label>
            <div className="nueva-msi-row-static">
              <Calendar size={18} />
              <span>Hoy, {fmtDiaLargo(new Date().toISOString())}</span>
            </div>
          </div>

          <button
            className="nueva-msi-guardar"
            data-testid="nueva-compra-msi-guardar-button"
            onClick={handleGuardar}
            disabled={!descripcion.trim() || !montoNum || guardando}
          >
            {guardando ? "Registrando..." : (<><span>Registrar Compra</span><Check size={18} /></>)}
          </button>
        </div>
      </div>

      {categoriaPickerAbierto && (
        <CategoriaPickerModal
          categorias={categorias}
          crearCategoria={crearCategoria}
          onSeleccionar={(c) => {
            setCategoriaId(c.id);
            setCategoriaPickerAbierto(false);
          }}
          onClose={() => setCategoriaPickerAbierto(false)}
        />
      )}
    </div>
  );
}
