import { useState } from "react";
import { ChevronLeft, ChevronDown, CreditCard, DollarSign, Check } from "lucide-react";
import { ACCIONES } from "../../shared/constants";

const TIPO_STYLES = {
  gasto_credito: { className: "tipo-card--credito", icon: CreditCard },
  gasto_debito: { className: "tipo-card--debito", icon: DollarSign },
  pago_tarjeta: { className: "tipo-card--pago", icon: CreditCard },
  ingreso_cuenta: { className: "tipo-card--ingreso", icon: DollarSign },
};

export default function NuevoMovimientoView({ cuentas, tarjetas, commitMovimiento, onBack, onSaved }) {
  const [accion, setAccion] = useState("gasto_credito");
  const [targetId, setTargetId] = useState("");
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");

  const hayCuentas = cuentas.length > 0;
  const hayTarjetas = tarjetas.length > 0;
  const targets = ACCIONES[accion].targetTipo === "tarjeta" ? tarjetas : cuentas;

  const elegirAccion = (tipo, disabled) => {
    if (disabled) return;
    setAccion(tipo);
    setTargetId("");
  };

  const handleGuardar = async () => {
    const ok = await commitMovimiento({ accion, targetId, monto, nota });
    if (ok) await onSaved();
  };

  return (
    <div className="nuevo-mov">
      <div className="nuevo-mov-header">
        <button className="nuevo-mov-back" data-testid="nuevo-mov-back-button" onClick={onBack}>
          <ChevronLeft size={22} />
        </button>
        <span className="nuevo-mov-title">Nuevo movimiento</span>
      </div>

      <div className="nuevo-mov-body">
        <div className="tipo-grid">
          {Object.entries(ACCIONES).map(([tipo, meta]) => {
            const style = TIPO_STYLES[tipo];
            const Icon = style.icon;
            const disabled = meta.targetTipo === "tarjeta" ? !hayTarjetas : !hayCuentas;
            return (
              <button
                key={tipo}
                className={`tipo-card ${style.className} ${accion === tipo ? "active" : ""}`}
                data-testid={`tipo-card-${tipo}`}
                disabled={disabled}
                onClick={() => elegirAccion(tipo, disabled)}
              >
                <span className="tipo-card-icon"><Icon size={18} /></span>
                <span className="tipo-card-label">{meta.label}</span>
              </button>
            );
          })}
        </div>

        <div className="field-label" style={{ margin: "18px 0 8px" }}>Selecciona movimiento</div>
        <div className="select-wrapper">
          <select
            className="target-select"
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
          <ChevronDown size={16} className="select-chevron" />
        </div>

        <input
          className="amount-input-flat"
          inputMode="decimal"
          placeholder="$0.00"
          data-testid="nuevo-mov-monto-input"
          value={monto}
          onChange={(e) => setMonto(e.target.value.replace(/[^0-9.]/g, ""))}
        />

        <input
          className="note-input"
          placeholder="Nota (opcional)"
          data-testid="nuevo-mov-nota-input"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />

        <button className="registrar-btn" data-testid="nuevo-mov-registrar-button" onClick={handleGuardar}>
          <Check size={16} /> Registrar
        </button>
      </div>
    </div>
  );
}
