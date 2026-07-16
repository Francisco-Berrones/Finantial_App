import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CreditCard, Nfc, Pencil, Plus } from "lucide-react";
import { fmt } from "../../shared/format";
import { diasHasta, formatDiasFaltantes } from "../../shared/dateUtils";
import { gradienteBanco } from "../../shared/bancoColores";
import { useMsiDetalle } from "./useMsiDetalle";
import MovimientoCard from "../movimientos/MovimientoCard";
import NuevaCompraMsiModal from "./NuevaCompraMsiModal";

export default function TarjetaDetalleView({ tarjeta, categorias = [], movimientos = [], crearCategoria, onBack, onGuardarCortePago, onRegistrada, onVerHistorial, onVerAnalisis }) {
  const { compras, cargando, fetchMsi, registrarCompra } = useMsiDetalle(tarjeta?.id);
  const [editando, setEditando] = useState(false);
  const [diaCorte, setDiaCorte] = useState("");
  const [diaPago, setDiaPago] = useState("");
  const [showAddMsi, setShowAddMsi] = useState(false);

  useEffect(() => { fetchMsi(); }, [fetchMsi]);

  if (!tarjeta) return null;

  const diasCorte = diasHasta(tarjeta.dia_corte);
  const diasPago = diasHasta(tarjeta.dia_pago);
  const disponible = tarjeta.linea_total - tarjeta.saldo_usado;
  const porcentajeUsado = tarjeta.linea_total > 0
    ? Math.min(100, Math.max(0, (tarjeta.saldo_usado / tarjeta.linea_total) * 100))
    : 0;
  const fondo = tarjeta.color || gradienteBanco(tarjeta.banco);

  const movimientosTarjeta = movimientos
    .filter((m) => m.target_id === tarjeta.id)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  const abrirEdicion = () => {
    setDiaCorte(tarjeta.dia_corte ? String(tarjeta.dia_corte) : "");
    setDiaPago(tarjeta.dia_pago ? String(tarjeta.dia_pago) : "");
    setEditando(true);
  };

  const guardarCortePago = async () => {
    const ok = await onGuardarCortePago(tarjeta.id, { diaCorte, diaPago });
    if (ok) setEditando(false);
  };

  const handleAddMsi = async ({ descripcion, monto, meses, categoriaId }) => {
    const ok = await registrarCompra({
      tarjetaId: tarjeta.id,
      monto,
      meses,
      descripcion,
      categoriaId,
    });
    if (ok) {
      await fetchMsi();
      await onRegistrada?.();
    }
    return ok;
  };

  return (
    <div className="tarjeta-det-root">
      <style>{`
        .tarjeta-det-root {
          --bg: #F7F9FB; --surface: #FFFFFF; --surface-low: #F2F4F6; --surface-hi: #E6E8EA;
          --primary: #000000; --on-primary: #FFFFFF; --primary-container: #131B2E;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E; --on-secondary-container: #57657B;
          --outline: #76777D; --outline-variant: #C6C6CD; --expense: #BA1A1A;
          min-height: 100vh; min-height: 100dvh;
          background: var(--bg); font-family: Inter, sans-serif; color: var(--on-surface);
        }
        .tarjeta-det-header { position: sticky; top: 0; z-index: 10; background: var(--bg); padding: 14px 12px; display: flex; align-items: center; }
        .tarjeta-det-back { width: 40px; height: 40px; border-radius: 9999px; background: none; border: none; color: var(--on-surface); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tarjeta-det-back:active { background: var(--surface-low); }
        .tarjeta-det-titulo-wrap { position: absolute; left: 0; right: 0; text-align: center; pointer-events: none; }
        .tarjeta-det-titulo { display: block; font-size: 16px; font-weight: 700; color: var(--on-surface); }
        .tarjeta-det-subtitulo { display: block; font-size: 12px; color: var(--on-surface-variant); }

        .tarjeta-det-body { padding: 8px 16px 32px; max-width: 460px; margin: 0 auto; }

        .tarjeta-det-visual { position: relative; border-radius: 20px; padding: 24px; color: #fff; overflow: hidden; box-shadow: 0 10px 24px rgba(0,0,0,0.18); margin-bottom: 20px; }
        .tarjeta-det-glow-a { position: absolute; width: 220px; height: 220px; border-radius: 9999px; background: rgba(255,255,255,0.12); filter: blur(40px); top: -80px; right: -80px; }
        .tarjeta-det-glow-b { position: absolute; width: 220px; height: 220px; border-radius: 9999px; background: rgba(0,0,0,0.12); filter: blur(40px); bottom: -80px; left: -80px; }
        .tarjeta-det-visual-inner { position: relative; z-index: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 28px; }
        .tarjeta-det-visual-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .tarjeta-det-visual-saldo-label { font-size: 12px; opacity: 0.75; margin: 0 0 4px; }
        .tarjeta-det-visual-saldo { font-size: 28px; font-weight: 700; }
        .tarjeta-det-visual-bottom { display: flex; flex-direction: column; gap: 2px; }
        .tarjeta-det-visual-nombre { font-size: 14px; font-weight: 600; }
        .tarjeta-det-visual-banco { font-size: 12px; opacity: 0.8; }

        .tarjeta-det-bento { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .tarjeta-det-bento-limite { grid-column: span 2; background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 16px; padding: 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .tarjeta-det-bento-card { background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 16px; padding: 16px; width: 100%; box-sizing: border-box; text-align: left; font-family: Inter, sans-serif; }
        .tarjeta-det-bento-card.deuda { border-left: 4px solid var(--expense); }
        button.tarjeta-det-bento-card:not(:disabled) { cursor: pointer; }
        button.tarjeta-det-bento-card:not(:disabled):active { transform: scale(0.98); }
        .tarjeta-det-bento-label { font-size: 12px; color: var(--on-surface-variant); margin: 0 0 4px; }
        .tarjeta-det-bento-valor { font-size: 18px; font-weight: 700; color: var(--on-surface); }
        .tarjeta-det-bento-valor.aviso { color: var(--expense); }
        .tarjeta-det-bento-bar { height: 6px; width: 100px; flex-shrink: 0; background: var(--surface-hi); border-radius: 9999px; overflow: hidden; }
        .tarjeta-det-bento-bar-fill { height: 100%; background: var(--primary-container); }

        .tarjeta-det-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .tarjeta-det-section-titulo { font-size: 16px; font-weight: 600; color: var(--on-surface); }
        .tarjeta-det-section-link { background: none; border: none; color: var(--primary-container); font-family: Inter, sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; }
        .tarjeta-det-editar-btn { background: none; border: none; color: var(--on-surface-variant); cursor: pointer; padding: 4px; display: flex; }

        .tarjeta-det-cortepago { display: flex; gap: 10px; margin-bottom: 24px; }
        .tarjeta-det-cortepago-box { flex: 1; background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 14px; padding: 14px; }
        .tarjeta-det-cortepago-label { font-size: 12px; color: var(--on-surface-variant); margin: 0 0 4px; }
        .tarjeta-det-cortepago-valor { font-size: 15px; font-weight: 700; color: var(--on-surface); }
        .tarjeta-det-cortepago-dias { font-size: 12px; color: var(--outline); margin-top: 2px; }
        .tarjeta-det-cortepago-form { display: flex; flex-direction: column; gap: 10px; background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 14px; padding: 14px; margin-bottom: 24px; }
        .tarjeta-det-cortepago-form-row { display: flex; gap: 8px; }
        .tarjeta-det-cortepago-form input { flex: 1; box-sizing: border-box; height: 44px; padding: 0 12px; background: var(--surface-low); border: 1px solid var(--outline-variant); border-radius: 10px; font-family: Inter, sans-serif; font-size: 15px; color: var(--on-surface); outline: none; }
        .tarjeta-det-cortepago-form-btns { display: flex; gap: 8px; }
        .tarjeta-det-btn { font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; border: 1px solid var(--outline-variant); background: var(--surface); color: var(--on-surface); padding: 10px 16px; border-radius: 10px; cursor: pointer; flex: 1; }
        .tarjeta-det-btn.dark { background: var(--primary-container); color: var(--on-primary); border-color: var(--primary-container); }

        .tarjeta-det-msi-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px; }
        .tarjeta-det-msi-card { background: var(--surface); border: 1px solid var(--outline-variant); border-left: 4px solid var(--primary-container); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .tarjeta-det-msi-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .tarjeta-det-msi-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .tarjeta-det-msi-icon { width: 40px; height: 40px; border-radius: 9999px; background: var(--surface-hi); color: var(--on-surface-variant); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tarjeta-det-msi-nombre { font-size: 15px; font-weight: 600; color: var(--on-surface); }
        .tarjeta-det-msi-sub { font-size: 12px; color: var(--on-surface-variant); }
        .tarjeta-det-msi-right { text-align: right; flex-shrink: 0; }
        .tarjeta-det-msi-monto { font-size: 14px; font-weight: 700; color: var(--on-surface); }
        .tarjeta-det-msi-resta { font-size: 12px; color: var(--on-surface-variant); }
        .tarjeta-det-msi-progreso-head { display: flex; justify-content: space-between; font-size: 11px; font-weight: 500; color: var(--on-surface-variant); }
        .tarjeta-det-msi-progreso-pct { color: var(--primary-container); font-weight: 700; }
        .tarjeta-det-msi-bar { height: 6px; width: 100%; background: var(--surface-hi); border-radius: 9999px; overflow: hidden; }
        .tarjeta-det-msi-bar-fill { height: 100%; background: var(--primary-container); }
        .tarjeta-det-msi-empty { font-size: 13px; color: var(--outline); padding: 8px 0 16px; }

        .tarjeta-det-msi-add-link { width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--surface); border: 2px dashed var(--outline-variant); border-radius: 14px; padding: 14px; color: var(--on-surface-variant); font-family: Inter, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; margin-bottom: 24px; }

        .tarjeta-det-mov-list { background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 14px; padding: 8px 12px; }
        .tarjeta-det-mov-empty { font-size: 13px; color: var(--outline); padding: 12px 4px; }
      `}</style>

      <div className="tarjeta-det-header">
        <button className="tarjeta-det-back" data-testid="tarjeta-detalle-back-button" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="tarjeta-det-titulo-wrap">
          <span className="tarjeta-det-titulo">Detalle de Tarjeta</span>
          <span className="tarjeta-det-subtitulo">{tarjeta.nombre}</span>
        </div>
      </div>

      <div className="tarjeta-det-body">
        <div className="tarjeta-det-visual" style={{ background: fondo }}>
          <div className="tarjeta-det-glow-a" />
          <div className="tarjeta-det-glow-b" />
          <div className="tarjeta-det-visual-inner">
            <div className="tarjeta-det-visual-top">
              <div>
                <p className="tarjeta-det-visual-saldo-label">SALDO ACTUAL</p>
                <p className="tarjeta-det-visual-saldo mono">{fmt(tarjeta.saldo_usado)}</p>
              </div>
              <Nfc size={28} />
            </div>
            <div className="tarjeta-det-visual-bottom">
              <span className="tarjeta-det-visual-nombre">{tarjeta.nombre}</span>
              {tarjeta.banco && <span className="tarjeta-det-visual-banco">{tarjeta.banco}</span>}
            </div>
          </div>
        </div>

        <div className="tarjeta-det-bento">
          <div className="tarjeta-det-bento-limite">
            <div>
              <p className="tarjeta-det-bento-label">Límite de Crédito</p>
              <p className="tarjeta-det-bento-valor mono">{fmt(tarjeta.linea_total)}</p>
            </div>
            <div className="tarjeta-det-bento-bar">
              <div className="tarjeta-det-bento-bar-fill" style={{ width: `${porcentajeUsado}%` }} />
            </div>
          </div>
          <div className="tarjeta-det-bento-card">
            <p className="tarjeta-det-bento-label">Disponible</p>
            <p className="tarjeta-det-bento-valor mono">{fmt(disponible)}</p>
          </div>
          <button
            className="tarjeta-det-bento-card deuda"
            data-testid="tarjeta-detalle-deuda-button"
            onClick={onVerAnalisis}
            disabled={!onVerAnalisis}
          >
            <p className="tarjeta-det-bento-label">Deuda Total</p>
            <p className="tarjeta-det-bento-valor aviso mono">{fmt(tarjeta.saldo_usado)}</p>
          </button>
        </div>

        <div className="tarjeta-det-section-head">
          <span className="tarjeta-det-section-titulo">Corte y Pago</span>
          {!editando && (
            <button className="tarjeta-det-editar-btn" data-testid="tarjeta-detalle-editar-button" onClick={abrirEdicion} title="Editar corte y pago">
              <Pencil size={15} />
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {editando ? (
            <motion.div
              key="editar-corte-pago"
              className="tarjeta-det-cortepago-form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div className="tarjeta-det-cortepago-form-row">
                <input
                  placeholder="Día de corte (1-31)"
                  inputMode="numeric"
                  data-testid="tarjeta-detalle-dia-corte-input"
                  value={diaCorte}
                  onChange={(e) => setDiaCorte(e.target.value.replace(/[^0-9]/g, ""))}
                />
                <input
                  placeholder="Día de pago (1-31)"
                  inputMode="numeric"
                  data-testid="tarjeta-detalle-dia-pago-input"
                  value={diaPago}
                  onChange={(e) => setDiaPago(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              <div className="tarjeta-det-cortepago-form-btns">
                <button className="tarjeta-det-btn dark" data-testid="tarjeta-detalle-guardar-button" onClick={guardarCortePago}>Guardar</button>
                <button className="tarjeta-det-btn" data-testid="tarjeta-detalle-cancelar-button" onClick={() => setEditando(false)}>Cancelar</button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="resumen-corte-pago"
              className="tarjeta-det-cortepago"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="tarjeta-det-cortepago-box">
                <p className="tarjeta-det-cortepago-label">Corte</p>
                {tarjeta.dia_corte ? (
                  <>
                    <p className="tarjeta-det-cortepago-valor mono">Día {tarjeta.dia_corte}</p>
                    <p className="tarjeta-det-cortepago-dias" data-testid="tarjeta-detalle-dias-corte">{formatDiasFaltantes(diasCorte)}</p>
                  </>
                ) : (
                  <p className="tarjeta-det-cortepago-dias" data-testid="tarjeta-detalle-dias-corte">No capturado</p>
                )}
              </div>
              <div className="tarjeta-det-cortepago-box">
                <p className="tarjeta-det-cortepago-label">Pago</p>
                {tarjeta.dia_pago ? (
                  <>
                    <p className="tarjeta-det-cortepago-valor mono">Día {tarjeta.dia_pago}</p>
                    <p className="tarjeta-det-cortepago-dias" data-testid="tarjeta-detalle-dias-pago">{formatDiasFaltantes(diasPago)}</p>
                  </>
                ) : (
                  <p className="tarjeta-det-cortepago-dias" data-testid="tarjeta-detalle-dias-pago">No capturado</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="tarjeta-det-section-head">
          <span className="tarjeta-det-section-titulo">Pagos a Meses Sin Intereses</span>
        </div>

        {cargando ? (
          <div className="tarjeta-det-msi-empty">Cargando...</div>
        ) : compras.length === 0 ? (
          <div className="tarjeta-det-msi-empty" data-testid="msi-empty-state">No tienes compras a meses activas en esta tarjeta.</div>
        ) : (
          <div className="tarjeta-det-msi-list">
            {compras.map((c) => {
              const progreso = c.meses_total > 0 ? Math.min(100, (c.meses_transcurridos / c.meses_total) * 100) : 0;
              return (
                <motion.div
                  className="tarjeta-det-msi-card"
                  key={c.id}
                  data-testid={`msi-row-${c.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="tarjeta-det-msi-top">
                    <div className="tarjeta-det-msi-left">
                      <span className="tarjeta-det-msi-icon"><CreditCard size={18} /></span>
                      <div>
                        <div className="tarjeta-det-msi-nombre">{c.descripcion || "Compra a meses"}</div>
                        <div className="tarjeta-det-msi-sub">{c.meses_transcurridos} / {c.meses_total} meses transcurridos</div>
                      </div>
                    </div>
                    <div className="tarjeta-det-msi-right">
                      <div className="tarjeta-det-msi-monto mono">{fmt(c.mensualidad)}/mes</div>
                      <div className="tarjeta-det-msi-resta">Resta {fmt(c.saldo_pendiente)}</div>
                    </div>
                  </div>
                  <div>
                    <div className="tarjeta-det-msi-progreso-head">
                      <span>Progreso de pago</span>
                      <span className="tarjeta-det-msi-progreso-pct">{Math.round(progreso)}%</span>
                    </div>
                    <div className="tarjeta-det-msi-bar">
                      <div className="tarjeta-det-msi-bar-fill" style={{ width: `${progreso}%` }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <button className="tarjeta-det-msi-add-link" data-testid="msi-add-link" onClick={() => setShowAddMsi(true)}>
          <Plus size={17} /> Agregar compra a meses
        </button>

        {showAddMsi && (
          <NuevaCompraMsiModal
            categorias={categorias}
            crearCategoria={crearCategoria}
            onGuardar={handleAddMsi}
            onClose={() => setShowAddMsi(false)}
          />
        )}

        <div className="tarjeta-det-section-head">
          <span className="tarjeta-det-section-titulo">Movimientos Recientes</span>
          {onVerHistorial && (
            <button className="tarjeta-det-section-link" data-testid="tarjeta-detalle-ver-historial" onClick={onVerHistorial}>Ver Todo</button>
          )}
        </div>

        {movimientosTarjeta.length === 0 ? (
          <div className="tarjeta-det-mov-list">
            <div className="tarjeta-det-mov-empty" data-testid="tarjeta-detalle-mov-empty">Todavía no hay movimientos en esta tarjeta.</div>
          </div>
        ) : (
          <div>
            {movimientosTarjeta.map((m) => (
              <MovimientoCard key={m.id} movimiento={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
