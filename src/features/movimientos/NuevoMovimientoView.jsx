import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, CreditCard, Wallet, Landmark, PlusCircle, Check, ChevronRight, Tag } from "lucide-react";
import { ACCIONES } from "../../shared/constants";
import { fmt } from "../../shared/format";
import { useMsiDetalle } from "../tarjetas/useMsiDetalle";
import { estiloCategoria } from "../../shared/categoriaIconos";
import CategoriaPickerModal from "./CategoriaPickerModal";

const TIPO_STYLES = {
  gasto_credito: { icon: CreditCard, color: "#7E22CE", corto: "Crédito" },
  gasto_debito: { icon: Wallet, color: "#BA1A1A", corto: "Gasto" },
  pago_tarjeta: { icon: Landmark, color: "#1D4ED8", corto: "Pago" },
  ingreso_cuenta: { icon: PlusCircle, color: "#1B5E20", corto: "Ingreso" },
};

export default function NuevoMovimientoView({ cuentas, tarjetas, categorias = [], crearCategoria, commitMovimiento, commitPagoTarjeta, presetTarjetaId, onBack, onSaved }) {
  const [accion, setAccion] = useState(presetTarjetaId ? "pago_tarjeta" : "gasto_credito");
  const [targetId, setTargetId] = useState(presetTarjetaId || "");
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");
  const [asignaciones, setAsignaciones] = useState({});
  const [origenCuentaId, setOrigenCuentaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [categoriaPickerAbierto, setCategoriaPickerAbierto] = useState(false);

  const esPagoTarjeta = accion === "pago_tarjeta";
  const requiereCategoria = accion === "gasto_credito" || accion === "gasto_debito";
  const { compras: comprasMsi, fetchMsi } = useMsiDetalle(esPagoTarjeta ? targetId : null);

  useEffect(() => {
    if (esPagoTarjeta && targetId) fetchMsi();
  }, [esPagoTarjeta, targetId, fetchMsi]);

  useEffect(() => {
    setAsignaciones({});
    setOrigenCuentaId("");
  }, [targetId]);

  useEffect(() => {
    setCategoriaId("");
  }, [accion]);

  const categoriaSeleccionada = categorias.find((c) => String(c.id) === String(categoriaId)) || null;

  const hayCuentas = cuentas.length > 0;
  const hayTarjetas = tarjetas.length > 0;
  const targets = ACCIONES[accion].targetTipo === "tarjeta" ? tarjetas : cuentas;

  const totalAsignado = Object.values(asignaciones).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const montoGeneral = parseFloat(monto) || 0;
  const montoTotalPago = montoGeneral + totalAsignado;

  const elegirAccion = (tipo, disabled) => {
    if (disabled) return;
    setAccion(tipo);
    setTargetId("");
  };

  const handleGuardar = async () => {
    if (esPagoTarjeta) {
      const listaAsignaciones = Object.entries(asignaciones)
        .filter(([, v]) => parseFloat(v) > 0)
        .map(([compra_id, v]) => ({ compra_id, monto: parseFloat(v) }));
      const ok = await commitPagoTarjeta({
        tarjetaId: targetId,
        monto: montoTotalPago,
        origenCuentaId: origenCuentaId || null,
        asignaciones: listaAsignaciones,
        nota,
      });
      if (ok) await onSaved();
      return;
    }
    const ok = await commitMovimiento({ accion, targetId, monto, nota, categoriaId: categoriaId || null });
    if (ok) await onSaved();
  };

  return (
    <div className="nm-root">
      <style>{`
        .nm-root {
          --bg: #F7F9FB; --surface: #FFFFFF; --surface-low: #F2F4F6;
          --primary: #000000; --on-primary: #FFFFFF; --primary-fixed: #DAE2FD; --primary-container: #131B2E; --on-primary-container: #7C839B;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E;
          --outline: #76777D; --outline-variant: #C6C6CD;
          min-height: 100vh; min-height: 100dvh;
          background: var(--bg); font-family: Inter, sans-serif; color: var(--on-surface);
        }
        .nm-header { position: sticky; top: 0; z-index: 10; background: var(--bg); padding: 14px 12px; display: flex; align-items: center; }
        .nm-back { width: 40px; height: 40px; border-radius: 9999px; background: none; border: none; color: var(--on-surface); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .nm-back:active { background: var(--surface-low); }
        .nm-titulo { position: absolute; left: 0; right: 0; text-align: center; font-size: 18px; font-weight: 700; color: var(--on-surface); pointer-events: none; }

        .nm-body { padding: 8px 16px 32px; max-width: 420px; margin: 0 auto; }

        .nm-tipo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
        .nm-tipo-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 16px; border-radius: 14px; background: var(--surface-low); border: 2px solid transparent; cursor: pointer; font-family: Inter, sans-serif; }
        .nm-tipo-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .nm-tipo-btn .nm-tipo-icono { color: var(--primary); }
        .nm-tipo-btn .nm-tipo-label { font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--on-surface-variant); }
        .nm-tipo-btn.active { background: var(--primary-container); }
        .nm-tipo-btn.active .nm-tipo-icono { color: var(--on-primary-container); }
        .nm-tipo-btn.active .nm-tipo-label { color: var(--on-primary-container); }

        .nm-field { margin-bottom: 16px; }
        .nm-label { display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--outline); margin: 0 0 6px 4px; }
        .nm-select-wrap { position: relative; }
        .nm-select {
          width: 100%; appearance: none; font-family: Inter, sans-serif; font-size: 16px;
          border: 1px solid var(--outline-variant); border-radius: 12px; padding: 14px 40px 14px 16px;
          background: var(--surface); color: var(--on-surface);
        }
        .nm-select.required { border: 2px solid var(--primary-fixed); }
        .nm-select:focus { outline: none; border-color: var(--primary); }
        .nm-select-chevron { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--outline); pointer-events: none; }

        .nm-amount-card { background: var(--surface-low); border-radius: 14px; padding: 20px; margin: 8px 0 16px; }
        .nm-amount-label { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--on-surface-variant); }
        .nm-amount-row { display: flex; align-items: baseline; justify-content: flex-end; gap: 4px; margin-top: 4px; }
        .nm-amount-prefix { font-size: 36px; font-weight: 700; color: var(--primary); }
        .nm-amount-prefix.vacio { color: var(--outline); }
        .nm-amount-input { flex: 1; min-width: 0; border: none; background: transparent; outline: none; text-align: right; font-family: Inter, sans-serif; font-size: 36px; font-weight: 700; color: var(--on-surface); padding: 0; }
        .nm-amount-input::placeholder { color: var(--outline); }

        .nm-input {
          width: 100%; box-sizing: border-box; font-family: Inter, sans-serif; font-size: 16px;
          border: 1px solid var(--outline-variant); border-radius: 12px; padding: 14px 16px;
          background: var(--surface); color: var(--on-surface); margin-bottom: 16px;
        }
        .nm-input::placeholder { color: var(--outline); }
        .nm-input:focus { outline: none; border-color: var(--primary); }

        .nm-msi-box { background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 12px; padding: 14px; margin-bottom: 16px; }
        .nm-msi-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--surface-low); font-size: 14px; }
        .nm-msi-row:last-of-type { border-bottom: none; }
        .nm-msi-row-sub { font-size: 12px; color: var(--outline); }
        .nm-msi-input { width: 100px; font-family: Inter, sans-serif; font-size: 16px; border: 1px solid var(--outline-variant); border-radius: 8px; padding: 8px 10px; background: var(--surface-low); color: var(--on-surface); text-align: right; }

        .nm-cat-nueva-row { display: flex; gap: 8px; margin-bottom: 16px; }
        .nm-cat-nueva-row .nm-input { margin-bottom: 0; flex: 1; }
        .nm-btn { font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; border: 1px solid var(--outline-variant); background: var(--surface); color: var(--on-surface); padding: 0 16px; border-radius: 10px; cursor: pointer; }
        .nm-btn.dark { background: var(--primary); color: var(--on-primary); border-color: var(--primary); }

        .nm-categoria-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; font-family: Inter, sans-serif; font-size: 15px; font-weight: 600; border: none; border-radius: 12px; padding: 12px 14px; background: var(--primary-container); color: var(--on-primary); cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        .nm-categoria-btn-seleccion { display: flex; align-items: center; gap: 10px; }
        .nm-categoria-btn-icono { width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .nm-categoria-btn-icono-vacio { background: rgba(255,255,255,0.15); color: var(--on-primary); }
        .nm-categoria-btn-chevron { color: var(--on-primary); opacity: 0.7; flex-shrink: 0; }

        .nm-submit { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: Inter, sans-serif; font-weight: 700; font-size: 16px; text-transform: uppercase; letter-spacing: 0.04em; padding: 16px 0; border-radius: 9999px; border: none; background: var(--primary); color: var(--on-primary); cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.15); margin-top: 8px; }
        .nm-submit:active { transform: scale(0.98); }
      `}</style>

      <div className="nm-header">
        <button className="nm-back" data-testid="nuevo-mov-back-button" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <span className="nm-titulo">Nuevo movimiento</span>
      </div>

      <div className="nm-body">
        <div className="nm-tipo-grid">
          {Object.entries(ACCIONES).map(([tipo, meta]) => {
            const style = TIPO_STYLES[tipo];
            const Icon = style.icon;
            const disabled = meta.targetTipo === "tarjeta" ? !hayTarjetas : !hayCuentas;
            return (
              <button
                key={tipo}
                className={`nm-tipo-btn ${accion === tipo ? "active" : ""}`}
                data-testid={`tipo-card-${tipo}`}
                disabled={disabled}
                onClick={() => elegirAccion(tipo, disabled)}
              >
                <span className="nm-tipo-icono"><Icon size={22} /></span>
                <span className="nm-tipo-label">{style.corto}</span>
              </button>
            );
          })}
        </div>

        <div className="nm-field">
          <label className="nm-label">Selecciona movimiento</label>
          <div className="nm-select-wrap">
            <select
              className="nm-select required"
              data-testid="nuevo-mov-target-select"
              value={targetId}
              onChange={(e) => {
                const match = targets.find((t) => String(t.id) === e.target.value);
                setTargetId(match ? match.id : "");
              }}
            >
              <option value="" disabled>
                Elige {ACCIONES[accion].targetTipo === "tarjeta" ? "una tarjeta" : "una cuenta"}
              </option>
              {targets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}{item.banco ? ` ${item.banco}` : ""}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="nm-select-chevron" />
          </div>
        </div>

        {requiereCategoria && (
          <div className="nm-field">
            <label className="nm-label">Categoría (opcional)</label>
            <button
              type="button"
              className="nm-categoria-btn"
              data-testid="nuevo-mov-categoria-abrir-button"
              onClick={() => setCategoriaPickerAbierto(true)}
            >
              {categoriaSeleccionada ? (
                <span className="nm-categoria-btn-seleccion">
                  <span
                    className="nm-categoria-btn-icono"
                    style={{ background: estiloCategoria(categoriaSeleccionada).bg, color: estiloCategoria(categoriaSeleccionada).color }}
                  >
                    {(() => {
                      const { icon: Icon } = estiloCategoria(categoriaSeleccionada);
                      return <Icon size={16} />;
                    })()}
                  </span>
                  {categoriaSeleccionada.nombre}
                </span>
              ) : (
                <span className="nm-categoria-btn-seleccion">
                  <span className="nm-categoria-btn-icono nm-categoria-btn-icono-vacio">
                    <Tag size={16} />
                  </span>
                  Seleccionar categoría
                </span>
              )}
              <ChevronRight size={18} className="nm-categoria-btn-chevron" />
            </button>
          </div>
        )}

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

        {esPagoTarjeta && (
          <div className="nm-field">
            <label className="nm-label">¿De dónde sale el dinero?</label>
            <div className="nm-select-wrap">
              <select
                className="nm-select"
                data-testid="nuevo-mov-origen-select"
                value={origenCuentaId}
                onChange={(e) => setOrigenCuentaId(e.target.value)}
              >
                <option value="">Efectivo / fuera del sistema</option>
                {cuentas.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <ChevronDown size={16} className="nm-select-chevron" />
            </div>
          </div>
        )}

        <div className="nm-amount-card">
          <span className="nm-amount-label">{esPagoTarjeta && comprasMsi.length > 0 ? "Pago al saldo general (opcional)" : "Importe"}</span>
          <div className="nm-amount-row">
            <span className={`nm-amount-prefix ${!monto ? "vacio" : ""}`}>$</span>
            <input
              className="nm-amount-input"
              inputMode="decimal"
              placeholder="0.00"
              data-testid="nuevo-mov-monto-input"
              value={monto}
              onChange={(e) => setMonto(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          </div>
        </div>

        <input
          className="nm-input"
          placeholder="Nota (opcional)"
          data-testid="nuevo-mov-nota-input"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />

        {esPagoTarjeta && comprasMsi.length > 0 && (
          <div className="nm-msi-box" data-testid="nuevo-mov-asignacion-box">
            <label className="nm-label" style={{ marginBottom: 10 }}>Pagar compras a meses (independiente, opcional)</label>
            {comprasMsi.map((c) => (
              <div className="nm-msi-row" key={c.id}>
                <span>
                  {c.descripcion || "Compra a meses"}{" "}
                  <span className="nm-msi-row-sub">({fmt(c.mensualidad)}/mes · falta {fmt(c.saldo_pendiente)})</span>
                </span>
                <input
                  className="nm-msi-input"
                  inputMode="decimal"
                  placeholder="0.00"
                  data-testid={`nuevo-mov-asignacion-input-${c.id}`}
                  value={asignaciones[c.id] || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setAsignaciones((prev) => ({ ...prev, [c.id]: val }));
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <button className="nm-submit" data-testid="nuevo-mov-registrar-button" onClick={handleGuardar}>
          <Check size={18} /> Registrar
        </button>
      </div>
    </div>
  );
}
