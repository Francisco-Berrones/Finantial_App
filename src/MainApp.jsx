import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Home, Clock, Landmark, LogOut, Bot, Settings } from "lucide-react";
import { supabase } from "./shared/lib/supabaseClient";
import { useCuentas } from "./features/cuentas/useCuentas";
import { useTarjetas } from "./features/tarjetas/useTarjetas";
import { useMovimientos } from "./features/movimientos/useMovimientos";
import { useCategorias } from "./features/categorias/useCategorias";
import { useSuscripciones } from "./features/suscripciones/useSuscripciones";
import InicioView from "./pages/InicioView";
import HistorialView from "./features/movimientos/HistorialView";
import CuentasManager from "./features/cuentas/CuentasManager";
import TarjetasManager from "./features/tarjetas/TarjetasManager";
import SuscripcionesManager from "./features/suscripciones/SuscripcionesManager";
import SuscripcionesPendientesModal from "./features/suscripciones/SuscripcionesPendientesModal";
import NuevoMovimientoView from "./features/movimientos/NuevoMovimientoView";
import TarjetaDetalleView from "./features/tarjetas/TarjetaDetalleView";
import AsesorChatView from "./features/asesor/AsesorChatView";
import ResumenCategoriasView from "./features/resumen/ResumenCategoriasView";

export default function MainApp({ session }) {
  const { cuentas, fetchCuentas, addCuenta, deleteCuenta } = useCuentas();
  const { tarjetas, fetchTarjetas, addTarjeta, deleteTarjeta, updateCortePago } = useTarjetas();
  const { movimientos, fetchMovimientos, commitMovimiento, deleteMovimiento, commitPagoTarjeta } = useMovimientos();
  const { categorias, fetchCategorias, addCategoria } = useCategorias();
  const { suscripciones, fetchSuscripciones, addSuscripcion, deleteSuscripcion, confirmarCobro } = useSuscripciones();

  const [view, setView] = useState("inicio");
  const [cargando, setCargando] = useState(true);
  const [detalleTarjetaId, setDetalleTarjetaId] = useState(null);
  const [viewAntesDetalle, setViewAntesDetalle] = useState("inicio");
  const [mostrarPendientes, setMostrarPendientes] = useState(false);

  const pendientesSuscripciones = suscripciones.filter((s) => s.pendiente_confirmar);

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchCuentas(), fetchTarjetas(), fetchMovimientos(), fetchCategorias(), fetchSuscripciones()]);
    setCargando(false);
  }, [fetchCuentas, fetchTarjetas, fetchMovimientos, fetchCategorias, fetchSuscripciones]);

  const crearCategoria = async (nombre) => {
    const creada = await addCategoria({ nombre, userId: session.user.id });
    if (creada) await fetchCategorias();
    return creada;
  };

  const confirmarCobroSuscripcion = async (id) => {
    const ok = await confirmarCobro(id);
    if (ok) await fetchAll();
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!cargando && pendientesSuscripciones.length > 0) setMostrarPendientes(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando]);

  const abrirDetalleTarjeta = (id) => {
    setViewAntesDetalle(view);
    setDetalleTarjetaId(id);
    setView("tarjetaDetalle");
  };

  const screenVariants = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  const tabVariants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
  };

  return (
    <div className="app-root">
      <style>{`
        .app-root {
          --paper: #DEDACA; --paper-card: #F6F3E9; --paper-line: #CBC3AC;
          --ink: #2B2A26; --ink-soft: #7A7365;
          --credito: #A8412B; --credito-soft: #E7CFC6;
          --ahorro: #2E6B52; --ahorro-soft: #D2E3D6;
          font-family: Figtree;
          color: var(--ink); background: var(--paper);
          min-height: 100vh; max-width: 480px; margin: 0 auto; position: relative;
          padding-bottom: 84px; box-sizing: border-box;
          overflow-x: hidden;
        }
        .app-root * { box-sizing: border-box; }
        .mono { font-family: Figtree; font-variant-numeric: tabular-nums; }
        .header { padding: 22px 20px 14px; border-bottom: 1px solid var(--paper-line); display: flex; justify-content: space-between; align-items: flex-start; }
        .header-eyebrow { font-family: Figtree; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-soft); margin: 0 0 4px; }
        .header-title { font-size: 26px; margin: 0; font-weight: normal; }
        .logout-btn { background: none; border: none; color: var(--ink-soft); cursor: pointer; margin-top: 4px; }
        .summary-row { display: flex; gap: 10px; padding: 16px 16px 4px; }
        .summary-box { flex: 1; background: var(--paper-card); border-radius: 4px; padding: 12px 14px; border-top: 3px solid var(--ahorro); }
        .summary-box.credito { border-top-color: var(--credito); }
        .summary-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); font-family: Figtree; }
        .summary-value { font-size: 20px; margin-top: 4px; }
        .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-soft); font-family: Figtree; margin: 20px 16px 8px; }
        .ticket-row { display: flex; gap: 10px; padding: 0 16px; overflow-x: auto; }
        .ticket { min-width: 168px; background: var(--paper-card); border-radius: 6px; padding: 12px 14px 14px; position: relative; border: 1px solid var(--paper-line); flex-shrink: 0; }
        .ticket::after { content: ""; position: absolute; left: 8px; right: 8px; bottom: 6px; border-top: 1.5px dashed var(--paper-line); }
        .ticket-icon { color: var(--ink-soft); margin-bottom: 8px; }
        .ticket-name { font-size: 13px; color: var(--ink-soft); }
        .ticket-amount { font-size: 18px; margin-top: 2px; }
        .cuenta-list { display: flex; flex-direction: column; gap: 12px; padding: 0 16px; }
        .cuenta-row-card { background: var(--paper-card); border-radius: 16px; padding: 16px; border: 1px solid var(--paper-line); box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
        .cuenta-row-top { display: flex; align-items: flex-start; justify-content: space-between; }
        .cuenta-row-name { font-size: 17px; font-weight: 700; }
        .cuenta-row-saldo { font-size: 15px; color: var(--ink-soft); margin-top: 4px; }
        .tarjeta-list { display: flex; flex-direction: column; gap: 12px; padding: 0 16px; }
        .tarjeta-row-card { background: var(--paper-card); border-radius: 16px; padding: 16px; border: 1px solid var(--paper-line); box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
        .tarjeta-row-card--clickable { cursor: pointer; }
        .msi-list { display: flex; flex-direction: column; gap: 10px; }
        .msi-row-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
        .msi-row-bottom { display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px; font-size: 13px; color: var(--ink-soft); }
        .msi-asignacion-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--paper-line); font-size: 14px; }
        .msi-asignacion-row:last-of-type { border-bottom: none; }
        .msi-asignacion-input { width: 110px; font-family: Figtree; font-size: 16px; border: 1px solid var(--paper-line); border-radius: 8px; padding: 8px 10px; background: var(--paper); color: var(--ink); text-align: right; }
        .tarjeta-row-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
        .tarjeta-row-left { display: flex; align-items: center; gap: 12px; }
        .tarjeta-row-icon { width: 52px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #E8CE85, #B8934A); position: relative; flex-shrink: 0; }
        .tarjeta-row-icon--banorte { background: linear-gradient(135deg, #E8574A, #9E2B22); }
        .tarjeta-row-icon--revolut { background: linear-gradient(135deg, #E4E4E4, #9A9A9A); }
        .tarjeta-row-icon--nu { background: linear-gradient(135deg, #A855C9, #6B1FA0); }
        .tarjeta-row-icon-dots { position: absolute; left: 6px; bottom: 6px; display: flex; }
        .tarjeta-row-icon-dots span { width: 9px; height: 9px; border-radius: 50%; background: rgba(255,255,255,0.75); }
        .tarjeta-row-icon-dots span:last-child { margin-left: -4px; background: rgba(255,255,255,0.5); }
        .tarjeta-row-name { font-size: 17px; font-weight: 700; }
        .tarjeta-row-banco { font-size: 14px; color: var(--ink-soft); margin-top: 2px; }
        .decorative-toggle { width: 38px; height: 22px; border-radius: 11px; background: #E4E1D6; position: relative; flex-shrink: 0; }
        .decorative-toggle::before { content: ""; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.15); }
        .decorative-toggle::after { content: ""; position: absolute; top: 4px; left: 12px; width: 14px; height: 14px; border-radius: 50%; background: #D8D5C9; }
        .row-delete-btn { background: none; border: none; color: var(--ink-soft); padding: 4px; cursor: pointer; flex-shrink: 0; }
        .tarjeta-row-stats { display: flex; }
        .tarjeta-row-stat { flex: 1; padding-left: 14px; border-left: 1px solid var(--paper-line); }
        .tarjeta-row-stat:first-child { padding-left: 0; border-left: none; }
        .tarjeta-row-stat-label { font-size: 13px; color: var(--ink-soft); margin-bottom: 4px; }
        .tarjeta-row-stat-value { font-size: 17px; font-weight: 700; }
        .empty-state { margin: 30px 16px; padding: 24px 18px; border: 1.5px dashed var(--paper-line); border-radius: 6px; text-align: center; color: var(--ink-soft); }
        .empty-state button { margin-top: 12px; }
        .btn { font-family: Figtree; font-size: 13px; border: 1px solid var(--ink); background: transparent; color: var(--ink); padding: 8px 14px; border-radius: 4px; cursor: pointer; }
        .btn:active { transform: scale(0.97); }
        .btn.dark { background: var(--ink); color: var(--paper-card); }
        .historial-filters { display: flex; flex-direction: column; gap: 8px; padding: 0 16px 16px; }
        .historial-filters .target-select { padding: 10px 32px 10px 12px; font-size: 16px; }
        .mov-list { padding: 0 16px; }
        .mov-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--paper-line); }
        .mov-icon { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--ahorro-soft); color: var(--ahorro); }
        .mov-icon.credito { background: var(--credito-soft); color: var(--credito); }
        .mov-body { flex: 1; min-width: 0; }
        .mov-title { font-size: 14px; }
        .mov-sub { font-size: 12px; color: var(--ink-soft); }
        .mov-amount { font-size: 15px; white-space: nowrap; }
        .mov-amount.credito { color: var(--credito); }
        .mov-amount.ahorro { color: var(--ahorro); }
        .mov-del { background: none; border: none; color: var(--ink-soft); padding: 4px; cursor: pointer; }
        .tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; background: var(--paper-card); border-top: 1px solid var(--paper-line); display: flex; align-items: center; justify-content: space-around; padding: 8px 10px calc(8px + env(safe-area-inset-bottom)); }
        .tab-btn { background: none; border: none; color: var(--ink-soft); display: flex; flex-direction: column; align-items: center; gap: 2px; font-family: Figtree; font-size: 10px; cursor: pointer; padding: 4px 8px; }
        .tab-btn.active { color: var(--ink); }
        .fab { width: 52px; height: 52px; border-radius: 50%; background: var(--ink); color: var(--paper-card); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; margin-top: -26px; box-shadow: 0 4px 10px rgba(0,0,0,0.25); }
        .action-btn { width: 100%; text-align: left; display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 6px; border: 1px solid var(--paper-line); background: var(--paper); margin-bottom: 8px; cursor: pointer; font-family: Figtree; font-size: 15px; color: var(--ink); }
        .action-btn .ico { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--credito-soft); color: var(--credito); flex-shrink: 0; }
        .action-btn .ico.ahorro { background: var(--ahorro-soft); color: var(--ahorro); }
        .note-input { width: 100%; font-family: Figtree; font-size: 16px; border: 1px solid var(--paper-line); border-radius: 6px; padding: 10px 12px; background: var(--paper); color: var(--ink); margin-bottom: 16px; }
        .field-label { font-family: Figtree; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); }
        .manage-block { padding: 4px 16px 20px; }
        .form-box { background: var(--paper-card); border: 1px solid var(--paper-line); border-radius: 6px; padding: 14px; margin: 10px 0 18px; }
        .form-box input { width: 100%; font-family: Figtree; font-size: 16px; border: 1px solid var(--paper-line); border-radius: 4px; padding: 8px 10px; margin-bottom: 8px; background: var(--paper); color: var(--ink); }
        .add-link { font-family: Figtree; font-size: 12px; color: var(--ink-soft); background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; margin: 6px 16px 0; }
        .nuevo-mov-header { padding: 22px 20px 14px; border-bottom: 1px solid var(--paper-line); display: flex; align-items: center; gap: 12px; }
        .nuevo-mov-back { background: none; border: none; color: var(--ink); cursor: pointer; display: flex; padding: 0; }
        .nuevo-mov-title { font-size: 18px; font-weight: 700; }
        .nuevo-mov-body { padding: 16px; }
        .tipo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .tipo-card { border: none; border-radius: 12px; padding: 14px 10px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; font-family: Figtree; }
        .tipo-card:disabled { opacity: 0.4; cursor: not-allowed; }
        .tipo-card.active { box-shadow: 0 0 0 2px var(--ink) inset; }
        .tipo-card-icon { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; }
        .tipo-card-label { font-size: 12px; font-weight: 700; text-align: center; text-transform: uppercase; color: var(--ink); }
        .tipo-card--credito { background: #EDE4F7; }
        .tipo-card--credito .tipo-card-icon { background: #8E5FC7; }
        .tipo-card--debito { background: #FBDCD5; }
        .tipo-card--debito .tipo-card-icon { background: #D9534F; }
        .tipo-card--pago { background: #DCEBFB; }
        .tipo-card--pago .tipo-card-icon { background: #3B82C4; }
        .tipo-card--ingreso { background: var(--ahorro-soft); }
        .tipo-card--ingreso .tipo-card-icon { background: var(--ahorro); }
        .select-wrapper { position: relative; margin-bottom: 16px; }
        .target-select { width: 100%; appearance: none; font-family: Figtree; font-size: 16px; border: 1px solid var(--paper-line); border-radius: 10px; padding: 14px 36px 14px 14px; background: var(--paper-card); color: var(--ink); }
        .select-chevron { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--ink-soft); pointer-events: none; }
        .amount-input-flat { width: 100%; font-family: Figtree; font-size: 30px; font-weight: 700; border: none; border-radius: 10px; background: var(--paper-card); color: var(--ink); padding: 18px 14px; margin-bottom: 16px; outline: none; }
        .registrar-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: Figtree; font-weight: 700; font-size: 15px; text-transform: uppercase; letter-spacing: 0.04em; padding: 15px 0; border-radius: 30px; border: none; background: var(--ahorro); color: #fff; cursor: pointer; }
        .registrar-btn:active { transform: scale(0.98); }
      `}</style>

      <AnimatePresence mode="wait">
      {view === "nuevoMovimiento" ? (
        <motion.div key="nuevoMovimiento" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22, ease: "easeOut" }}>
        <NuevoMovimientoView
          cuentas={cuentas}
          tarjetas={tarjetas}
          categorias={categorias}
          crearCategoria={crearCategoria}
          commitMovimiento={commitMovimiento}
          commitPagoTarjeta={commitPagoTarjeta}
          onBack={() => setView("inicio")}
          onSaved={async () => {
            await fetchAll();
            setView("inicio");
          }}
        />
        </motion.div>
      ) : view === "asesor" ? (
        <motion.div key="asesor" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22, ease: "easeOut" }}>
        <AsesorChatView session={session} onBack={() => setView("inicio")} />
        </motion.div>
      ) : view === "resumen" ? (
        <motion.div key="resumen" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22, ease: "easeOut" }}>
        <ResumenCategoriasView movimientos={movimientos} onBack={() => setView("inicio")} />
        </motion.div>
      ) : view === "tarjetaDetalle" ? (
        <motion.div key="tarjetaDetalle" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22, ease: "easeOut" }}>
        <TarjetaDetalleView
          tarjeta={tarjetas.find((t) => t.id === detalleTarjetaId)}
          categorias={categorias}
          crearCategoria={crearCategoria}
          onBack={() => setView(viewAntesDetalle)}
          onGuardarCortePago={async (id, datos) => {
            const ok = await updateCortePago(id, datos);
            if (ok) await fetchTarjetas();
            return ok;
          }}
          onRegistrada={fetchAll}
        />
        </motion.div>
      ) : (
        <motion.div key="main" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22, ease: "easeOut" }}>
          <div className="header">
            <div>
              <p className="header-eyebrow" style={{ marginTop: 20 }}>
                Registro personal · {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <h1 className="header-title"><b>FinTrack</b></h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
              {view === "cuentas" && (
                <button className="logout-btn" data-testid="mainapp-logout-button" onClick={() => supabase.auth.signOut()} title="Cerrar sesión">
                  <LogOut size={18} />
                </button>
              )}
              <button className="logout-btn" style={{ marginTop: 32 }} data-testid="header-ajustes-button" title="Ajustes">
                <Settings size={24} />
              </button>
            </div>
          </div>

          {cargando ? (
            <div style={{ padding: 24, color: "var(--ink-soft)" }}>Cargando...</div>
          ) : (
            <AnimatePresence mode="wait">
              {view === "inicio" && (
                <motion.div key="tab-inicio" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.18 }}>
                  <InicioView
                    cuentas={cuentas}
                    tarjetas={tarjetas}
                    movimientos={movimientos}
                    onNavigateCuentas={() => setView("cuentas")}
                    onVerTarjeta={abrirDetalleTarjeta}
                    onAbrirResumen={() => setView("resumen")}
                  />
                </motion.div>
              )}

              {view === "historial" && (
                <motion.div key="tab-historial" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.18 }}>
                  <HistorialView
                    movimientos={movimientos}
                    cuentas={cuentas}
                    tarjetas={tarjetas}
                    onDelete={async (mov) => {
                      const ok = await deleteMovimiento(mov);
                      if (ok) await fetchAll();
                    }}
                  />
                </motion.div>
              )}

              {view === "cuentas" && (
                <motion.div key="tab-cuentas" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.18 }}>
                  <div className="manage-block">
                    <CuentasManager
                      cuentas={cuentas}
                      session={session}
                      addCuenta={addCuenta}
                      deleteCuenta={deleteCuenta}
                      onChange={fetchAll}
                    />
                    <TarjetasManager
                      tarjetas={tarjetas}
                      session={session}
                      addTarjeta={addTarjeta}
                      deleteTarjeta={deleteTarjeta}
                      onChange={fetchAll}
                      onVerTarjeta={abrirDetalleTarjeta}
                    />
                    <SuscripcionesManager
                      suscripciones={suscripciones}
                      cuentas={cuentas}
                      tarjetas={tarjetas}
                      categorias={categorias}
                      session={session}
                      addSuscripcion={addSuscripcion}
                      deleteSuscripcion={deleteSuscripcion}
                      onChange={fetchAll}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <div className="tabbar">
            <button className={`tab-btn ${view === "inicio" ? "active" : ""}`} data-testid="tabbar-inicio-button" onClick={() => setView("inicio")}>
              <Home size={19} /> Inicio
            </button>
            <button className={`tab-btn ${view === "historial" ? "active" : ""}`} data-testid="tabbar-historial-button" onClick={() => setView("historial")}>
              <Clock size={19} /> Historial
            </button>
            <button className="fab" data-testid="tabbar-fab-button" onClick={() => setView("nuevoMovimiento")} aria-label="Registrar movimiento">
              <Plus size={24} />
            </button>
            <button className={`tab-btn ${view === "cuentas" ? "active" : ""}`} data-testid="tabbar-cuentas-button" onClick={() => setView("cuentas")}>
              <Landmark size={19} /> Cuentas
            </button>
            <button className={`tab-btn ${view === "asesor" ? "active" : ""}`} data-testid="tabbar-asesor-button" onClick={() => setView("asesor")}>
              <Bot size={19} /> Asesor
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {mostrarPendientes && pendientesSuscripciones.length > 0 && (
        <SuscripcionesPendientesModal
          pendientes={pendientesSuscripciones}
          onConfirmar={confirmarCobroSuscripcion}
          onClose={() => setMostrarPendientes(false)}
        />
      )}
    </div>
  );
}
