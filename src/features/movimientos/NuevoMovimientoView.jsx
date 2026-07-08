import { useState, useEffect } from "react";
import { ChevronLeft, ChevronDown, CreditCard, DollarSign, Check } from "lucide-react";
import { ACCIONES } from "../../shared/constants";
import { fmt } from "../../shared/format";
import { useMsiDetalle } from "../tarjetas/useMsiDetalle";

const TIPO_STYLES = {
  gasto_credito: { className: "tipo-card--credito", icon: CreditCard },
  gasto_debito: { className: "tipo-card--debito", icon: DollarSign },
  pago_tarjeta: { className: "tipo-card--pago", icon: CreditCard },
  ingreso_cuenta: { className: "tipo-card--ingreso", icon: DollarSign },
};

export default function NuevoMovimientoView({ cuentas, tarjetas, categorias = [], crearCategoria, commitMovimiento, commitPagoTarjeta, onBack, onSaved }) {
  const [accion, setAccion] = useState("gasto_credito");
  const [targetId, setTargetId] = useState("");
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");
  const [asignaciones, setAsignaciones] = useState({});
  const [origenCuentaId, setOrigenCuentaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");

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
    setCreandoCategoria(false);
    setNuevaCategoria("");
  }, [accion]);

  const handleCrearCategoria = async () => {
    if (!nuevaCategoria.trim()) return;
    const creada = await crearCategoria(nuevaCategoria);
    if (creada) {
      setCategoriaId(creada.id);
      setNuevaCategoria("");
      setCreandoCategoria(false);
    }
  };

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

        {requiereCategoria && (
          <>
            <div className="field-label" style={{ margin: "0 0 8px" }}>Categoría (opcional)</div>
            {!creandoCategoria ? (
              <div className="select-wrapper">
                <select
                  className="target-select"
                  data-testid="nuevo-mov-categoria-select"
                  value={categoriaId}
                  onChange={(e) => {
                    if (e.target.value === "__nueva__") {
                      setCreandoCategoria(true);
                      return;
                    }
                    setCategoriaId(e.target.value);
                  }}
                >
                  <option value="">Sin categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                  <option value="__nueva__">+ Nueva categoría...</option>
                </select>
                <ChevronDown size={16} className="select-chevron" />
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  className="note-input"
                  style={{ marginBottom: 0, flex: 1 }}
                  placeholder="Nombre de la categoría"
                  data-testid="nuevo-mov-categoria-nueva-input"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                />
                <button className="btn dark" data-testid="nuevo-mov-categoria-crear-button" onClick={handleCrearCategoria}>
                  Agregar
                </button>
                <button
                  className="btn"
                  data-testid="nuevo-mov-categoria-cancelar-button"
                  onClick={() => { setCreandoCategoria(false); setNuevaCategoria(""); }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </>
        )}

        {esPagoTarjeta && (
          <>
            <div className="field-label" style={{ margin: "0 0 8px" }}>¿De dónde sale el dinero?</div>
            <div className="select-wrapper">
              <select
                className="target-select"
                data-testid="nuevo-mov-origen-select"
                value={origenCuentaId}
                onChange={(e) => setOrigenCuentaId(e.target.value)}
              >
                <option value="">Efectivo / fuera del sistema</option>
                {cuentas.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <ChevronDown size={16} className="select-chevron" />
            </div>
          </>
        )}

        {esPagoTarjeta && comprasMsi.length > 0 && (
          <div className="field-label" style={{ margin: "0 0 8px" }}>Pago al saldo general (opcional)</div>
        )}
        <div className="amount-input-wrapper">
          <span className={`amount-input-prefix ${!monto ? "amount-input-prefix--vacio" : ""}`}>$</span>
          <input
            className="amount-input-flat"
            inputMode="decimal"
            placeholder="0.00"
            data-testid="nuevo-mov-monto-input"
            value={monto}
            onChange={(e) => setMonto(e.target.value.replace(/[^0-9.]/g, ""))}
          />
        </div>

        <input
          className="note-input"
          placeholder="Nota (opcional)"
          data-testid="nuevo-mov-nota-input"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />

        {esPagoTarjeta && comprasMsi.length > 0 && (
          <div className="form-box" data-testid="nuevo-mov-asignacion-box">
            <div className="field-label" style={{ marginBottom: 10 }}>Pagar compras a meses (independiente, opcional)</div>
            {comprasMsi.map((c) => (
              <div className="msi-asignacion-row" key={c.id}>
                <span>
                  {c.descripcion || "Compra a meses"}{" "}
                  <span className="mov-sub">({fmt(c.mensualidad)}/mes · falta {fmt(c.saldo_pendiente)})</span>
                </span>
                <input
                  className="msi-asignacion-input"
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

        <button className="registrar-btn" data-testid="nuevo-mov-registrar-button" onClick={handleGuardar}>
          <Check size={16} /> Registrar
        </button>
      </div>
    </div>
  );
}
