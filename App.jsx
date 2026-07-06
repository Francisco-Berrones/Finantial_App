import { useState, useEffect, useCallback } from "react";
import {
  Plus, X, CreditCard, PiggyBank, ArrowUpRight, ArrowDownRight,
  Trash2, Home, Clock, Landmark, Check, ChevronRight, LogOut
} from "lucide-react";
import { supabase } from "./supabaseClient";

const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(n) || 0
  );

const fmtFecha = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

const ACCIONES = {
  gasto_credito: { label: "Gasto con crédito", tono: "credito", targetTipo: "tarjeta" },
  gasto_debito: { label: "Gasto o retiro", tono: "credito", targetTipo: "cuenta" },
  pago_tarjeta: { label: "Pago a tarjeta", tono: "ahorro", targetTipo: "tarjeta" },
  ingreso_cuenta: { label: "Ingreso / depósito", tono: "ahorro", targetTipo: "cuenta" },
};

// ------------------------------------------------------------
// Pantalla de login (usuario único, creado por ti en Supabase Auth)
// ------------------------------------------------------------
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const entrar = async () => {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <div className="login-root">
      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background: #DEDACA;
          font-family: Georgia, serif;
          padding: 20px;
        }
        .login-box {
          background: #F6F3E9;
          border: 1px solid #CBC3AC;
          border-radius: 8px;
          padding: 28px 24px;
          width: 100%; max-width: 340px;
        }
        .login-title { font-size: 22px; margin: 0 0 4px; }
        .login-sub { font-size: 13px; color: #7A7365; margin: 0 0 20px; }
        .login-box input {
          width: 100%;
          font-family: Georgia, serif;
          font-size: 15px;
          border: 1px solid #CBC3AC;
          border-radius: 4px;
          padding: 10px 12px;
          margin-bottom: 10px;
          background: #DEDACA;
        }
        .login-box button {
          width: 100%;
          font-family: ui-monospace, monospace;
          font-size: 14px;
          padding: 11px 0;
          border-radius: 4px;
          border: none;
          background: #2B2A26;
          color: #F6F3E9;
          cursor: pointer;
          margin-top: 6px;
        }
        .login-error { color: #A8412B; font-size: 13px; margin-top: 8px; }
      `}</style>
      <div className="login-box">
        <h1 className="login-title">Mi cartera</h1>
        <p className="login-sub">Entra con el usuario que creaste en Supabase</p>
        <input placeholder="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()} />
        <button onClick={entrar} disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// App principal (una vez autenticado)
// ------------------------------------------------------------
function MainApp({ session }) {
  const [cuentas, setCuentas] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [view, setView] = useState("inicio");
  const [cargando, setCargando] = useState(true);

  const [sheetStep, setSheetStep] = useState(0);
  const [accion, setAccion] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");

  const [nuevaCuentaNombre, setNuevaCuentaNombre] = useState("");
  const [nuevaCuentaSaldo, setNuevaCuentaSaldo] = useState("");
  const [nuevaTarjetaNombre, setNuevaTarjetaNombre] = useState("");
  const [nuevaTarjetaBanco, setNuevaTarjetaBanco] = useState("");
  const [nuevaTarjetaLinea, setNuevaTarjetaLinea] = useState("");
  const [nuevaTarjetaUsado, setNuevaTarjetaUsado] = useState("");
  const [showAddCuenta, setShowAddCuenta] = useState(false);
  const [showAddTarjeta, setShowAddTarjeta] = useState(false);

  const fetchAll = useCallback(async () => {
    const [{ data: c, error: ec }, { data: t, error: et }, { data: m, error: em }] = await Promise.all([
      supabase.from("cuentas").select("*").order("fecha_creacion"),
      supabase.from("tarjetas").select("*").order("fecha_creacion"),
      supabase.from("movimientos").select("*").order("fecha", { ascending: false }),
    ]);
    if (ec || et || em) console.error(ec || et || em);
    setCuentas(c || []);
    setTarjetas(t || []);
    setMovimientos(m || []);
    setCargando(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const closeSheet = () => {
    setSheetStep(0); setAccion(null); setTargetId(null); setMonto(""); setNota("");
  };

  const commitMovimiento = async () => {
    const m = parseFloat(monto);
    if (!m || m <= 0 || !targetId || !accion) return;
    const { error } = await supabase.rpc("registrar_movimiento", {
      p_tipo_accion: accion,
      p_target_tipo: ACCIONES[accion].targetTipo,
      p_target_id: targetId,
      p_monto: m,
      p_nota: nota.trim(),
    });
    if (error) { alert("No se pudo guardar: " + error.message); return; }
    await fetchAll();
    closeSheet();
  };

  const deleteMovimiento = async (mov) => {
    const { error } = await supabase.rpc("eliminar_movimiento", { p_movimiento_id: mov.id });
    if (error) { alert("No se pudo eliminar: " + error.message); return; }
    await fetchAll();
  };

  const addCuenta = async () => {
    if (!nuevaCuentaNombre.trim()) return;
    const { error } = await supabase.from("cuentas").insert({
      nombre: nuevaCuentaNombre.trim(),
      saldo: parseFloat(nuevaCuentaSaldo) || 0,
      user_id: session.user.id,
    });
    if (error) { alert(error.message); return; }
    setNuevaCuentaNombre(""); setNuevaCuentaSaldo(""); setShowAddCuenta(false);
    await fetchAll();
  };

  const addTarjeta = async () => {
    if (!nuevaTarjetaNombre.trim()) return;
    const { error } = await supabase.from("tarjetas").insert({
      nombre: nuevaTarjetaNombre.trim(),
      banco: nuevaTarjetaBanco.trim(),
      linea_total: parseFloat(nuevaTarjetaLinea) || 0,
      saldo_usado: parseFloat(nuevaTarjetaUsado) || 0,
      user_id: session.user.id,
    });
    if (error) { alert(error.message); return; }
    setNuevaTarjetaNombre(""); setNuevaTarjetaBanco(""); setNuevaTarjetaLinea(""); setNuevaTarjetaUsado("");
    setShowAddTarjeta(false);
    await fetchAll();
  };

  const deleteCuenta = async (id) => {
    const { error } = await supabase.from("cuentas").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await fetchAll();
  };
  const deleteTarjeta = async (id) => {
    const { error } = await supabase.from("tarjetas").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await fetchAll();
  };

  const totalAhorro = cuentas.reduce((s, c) => s + Number(c.saldo), 0);
  const totalDisponible = tarjetas.reduce((s, t) => s + (Number(t.linea_total) - Number(t.saldo_usado)), 0);
  const hayCuentas = cuentas.length > 0;
  const hayTarjetas = tarjetas.length > 0;

  return (
    <div className="app-root">
      <style>{`
        .app-root {
          --paper: #DEDACA; --paper-card: #F6F3E9; --paper-line: #CBC3AC;
          --ink: #2B2A26; --ink-soft: #7A7365;
          --credito: #A8412B; --credito-soft: #E7CFC6;
          --ahorro: #2E6B52; --ahorro-soft: #D2E3D6;
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--ink); background: var(--paper);
          min-height: 100vh; max-width: 480px; margin: 0 auto; position: relative;
          padding-bottom: 84px; box-sizing: border-box;
        }
        .app-root * { box-sizing: border-box; }
        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; }
        .header { padding: 22px 20px 14px; border-bottom: 1px solid var(--paper-line); display: flex; justify-content: space-between; align-items: flex-start; }
        .header-eyebrow { font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-soft); margin: 0 0 4px; }
        .header-title { font-size: 26px; margin: 0; font-weight: normal; }
        .logout-btn { background: none; border: none; color: var(--ink-soft); cursor: pointer; margin-top: 4px; }
        .summary-row { display: flex; gap: 10px; padding: 16px 16px 4px; }
        .summary-box { flex: 1; background: var(--paper-card); border-radius: 4px; padding: 12px 14px; border-top: 3px solid var(--ahorro); }
        .summary-box.credito { border-top-color: var(--credito); }
        .summary-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); font-family: ui-monospace, monospace; }
        .summary-value { font-size: 20px; margin-top: 4px; }
        .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-soft); font-family: ui-monospace, monospace; margin: 20px 16px 8px; }
        .ticket-row { display: flex; gap: 10px; padding: 0 16px; overflow-x: auto; }
        .ticket { min-width: 168px; background: var(--paper-card); border-radius: 6px; padding: 12px 14px 14px; position: relative; border: 1px solid var(--paper-line); flex-shrink: 0; }
        .ticket::after { content: ""; position: absolute; left: 8px; right: 8px; bottom: 6px; border-top: 1.5px dashed var(--paper-line); }
        .ticket-icon { color: var(--ink-soft); margin-bottom: 8px; }
        .ticket-name { font-size: 13px; color: var(--ink-soft); }
        .ticket-amount { font-size: 18px; margin-top: 2px; }
        .empty-state { margin: 30px 16px; padding: 24px 18px; border: 1.5px dashed var(--paper-line); border-radius: 6px; text-align: center; color: var(--ink-soft); }
        .empty-state button { margin-top: 12px; }
        .btn { font-family: ui-monospace, monospace; font-size: 13px; border: 1px solid var(--ink); background: transparent; color: var(--ink); padding: 8px 14px; border-radius: 4px; cursor: pointer; }
        .btn:active { transform: scale(0.97); }
        .btn.dark { background: var(--ink); color: var(--paper-card); }
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
        .tab-btn { background: none; border: none; color: var(--ink-soft); display: flex; flex-direction: column; align-items: center; gap: 2px; font-family: ui-monospace, monospace; font-size: 10px; cursor: pointer; padding: 4px 8px; }
        .tab-btn.active { color: var(--ink); }
        .fab { width: 52px; height: 52px; border-radius: 50%; background: var(--ink); color: var(--paper-card); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; margin-top: -26px; box-shadow: 0 4px 10px rgba(0,0,0,0.25); }
        .sheet-backdrop { position: fixed; inset: 0; background: rgba(30,28,22,0.45); display: flex; align-items: flex-end; justify-content: center; z-index: 40; }
        .sheet { background: var(--paper-card); width: 100%; max-width: 480px; border-radius: 16px 16px 0 0; padding: 18px 18px calc(18px + env(safe-area-inset-bottom)); max-height: 82vh; overflow-y: auto; }
        .sheet-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .sheet-title { font-size: 17px; }
        .sheet-close { background: none; border: none; color: var(--ink-soft); cursor: pointer; }
        .action-btn { width: 100%; text-align: left; display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 6px; border: 1px solid var(--paper-line); background: var(--paper); margin-bottom: 8px; cursor: pointer; font-family: Georgia, serif; font-size: 15px; color: var(--ink); }
        .action-btn .ico { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--credito-soft); color: var(--credito); flex-shrink: 0; }
        .action-btn .ico.ahorro { background: var(--ahorro-soft); color: var(--ahorro); }
        .target-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 14px; border-radius: 6px; border: 1px solid var(--paper-line); background: var(--paper); margin-bottom: 8px; cursor: pointer; font-family: Georgia, serif; font-size: 15px; color: var(--ink); }
        .amount-input { width: 100%; font-family: ui-monospace, monospace; font-size: 34px; border: none; border-bottom: 2px solid var(--ink); background: transparent; color: var(--ink); padding: 8px 0; margin: 10px 0 18px; outline: none; }
        .note-input { width: 100%; font-family: Georgia, serif; font-size: 15px; border: 1px solid var(--paper-line); border-radius: 6px; padding: 10px 12px; background: var(--paper); color: var(--ink); margin-bottom: 16px; }
        .field-label { font-family: ui-monospace, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); }
        .manage-block { padding: 4px 16px 20px; }
        .manage-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--paper-line); }
        .manage-name { font-size: 15px; }
        .manage-sub { font-size: 12px; color: var(--ink-soft); }
        .form-box { background: var(--paper-card); border: 1px solid var(--paper-line); border-radius: 6px; padding: 14px; margin: 10px 0 18px; }
        .form-box input { width: 100%; font-family: Georgia, serif; font-size: 14px; border: 1px solid var(--paper-line); border-radius: 4px; padding: 8px 10px; margin-bottom: 8px; background: var(--paper); color: var(--ink); }
        .add-link { font-family: ui-monospace, monospace; font-size: 12px; color: var(--ink-soft); background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; margin: 6px 16px 0; }
      `}</style>

      <div className="header">
        <div>
          <p className="header-eyebrow">Registro personal · {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="header-title">Mi cartera</h1>
        </div>
        <button className="logout-btn" onClick={() => supabase.auth.signOut()} title="Cerrar sesión">
          <LogOut size={18} />
        </button>
      </div>

      {cargando ? (
        <div style={{ padding: 24, color: "var(--ink-soft)" }}>Cargando...</div>
      ) : (
        <>
          {view === "inicio" && (
            <>
              <div className="summary-row">
                <div className="summary-box">
                  <div className="summary-label">Ahorro total</div>
                  <div className="summary-value mono">{fmt(totalAhorro)}</div>
                </div>
                <div className="summary-box credito">
                  <div className="summary-label">Crédito disponible</div>
                  <div className="summary-value mono">{fmt(totalDisponible)}</div>
                </div>
              </div>

              {!hayCuentas && !hayTarjetas && (
                <div className="empty-state">
                  Todavía no tienes cuentas ni tarjetas registradas.
                  <br />
                  <button className="btn dark" onClick={() => setView("cuentas")}>Agregar la primera</button>
                </div>
              )}

              {hayCuentas && (
                <>
                  <div className="section-title">Cuentas de ahorro</div>
                  <div className="ticket-row">
                    {cuentas.map((c) => (
                      <div className="ticket" key={c.id}>
                        <PiggyBank size={18} className="ticket-icon" />
                        <div className="ticket-name">{c.nombre}</div>
                        <div className="ticket-amount mono">{fmt(c.saldo)}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {hayTarjetas && (
                <>
                  <div className="section-title">Tarjetas de crédito</div>
                  <div className="ticket-row">
                    {tarjetas.map((t) => (
                      <div className="ticket" key={t.id}>
                        <CreditCard size={18} className="ticket-icon" />
                        <div className="ticket-name">{t.nombre}{t.banco ? ` · ${t.banco}` : ""}</div>
                        <div className="ticket-amount mono">{fmt(t.linea_total - t.saldo_usado)}</div>
                        <div className="mov-sub">de {fmt(t.linea_total)} disponible</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="section-title">Últimos movimientos</div>
              {movimientos.length === 0 ? (
                <div style={{ padding: "0 16px", color: "var(--ink-soft)", fontSize: 14 }}>Aún no registras movimientos.</div>
              ) : (
                <div className="mov-list">
                  {movimientos.slice(0, 6).map((m) => {
                    const meta = ACCIONES[m.tipo_accion];
                    return (
                      <div className="mov-row" key={m.id}>
                        <div className={`mov-icon ${meta.tono}`}>
                          {meta.tono === "credito" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        </div>
                        <div className="mov-body">
                          <div className="mov-title">{meta.label} · {m.target_nombre}</div>
                          <div className="mov-sub">{fmtFecha(m.fecha)}{m.nota ? ` · ${m.nota}` : ""}</div>
                        </div>
                        <div className={`mov-amount mono ${meta.tono}`}>{fmt(m.monto)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {view === "historial" && (
            <div className="mov-list" style={{ paddingTop: 16 }}>
              {movimientos.length === 0 ? (
                <div style={{ color: "var(--ink-soft)", fontSize: 14, padding: "20px 0" }}>No hay movimientos todavía.</div>
              ) : (
                movimientos.map((m) => {
                  const meta = ACCIONES[m.tipo_accion];
                  return (
                    <div className="mov-row" key={m.id}>
                      <div className={`mov-icon ${meta.tono}`}>
                        {meta.tono === "credito" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div className="mov-body">
                        <div className="mov-title">{meta.label} · {m.target_nombre}</div>
                        <div className="mov-sub">{fmtFecha(m.fecha)}{m.nota ? ` · ${m.nota}` : ""}</div>
                      </div>
                      <div className={`mov-amount mono ${meta.tono}`}>{fmt(m.monto)}</div>
                      <button className="mov-del" onClick={() => deleteMovimiento(m)}><Trash2 size={15} /></button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {view === "cuentas" && (
            <div className="manage-block">
              <div className="section-title" style={{ margin: "16px 0 4px" }}>Cuentas de ahorro</div>
              {cuentas.map((c) => (
                <div className="manage-row" key={c.id}>
                  <div>
                    <div className="manage-name">{c.nombre}</div>
                    <div className="manage-sub mono">{fmt(c.saldo)}</div>
                  </div>
                  <button className="mov-del" onClick={() => deleteCuenta(c.id)}><Trash2 size={15} /></button>
                </div>
              ))}
              {!showAddCuenta ? (
                <button className="add-link" onClick={() => setShowAddCuenta(true)}><Plus size={13} /> agregar cuenta</button>
              ) : (
                <div className="form-box">
                  <input placeholder="Nombre (ej. Cuenta personal)" value={nuevaCuentaNombre} onChange={(e) => setNuevaCuentaNombre(e.target.value)} />
                  <input placeholder="Saldo inicial" inputMode="decimal" value={nuevaCuentaSaldo} onChange={(e) => setNuevaCuentaSaldo(e.target.value)} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn dark" onClick={addCuenta}>Guardar</button>
                    <button className="btn" onClick={() => setShowAddCuenta(false)}>Cancelar</button>
                  </div>
                </div>
              )}

              <div className="section-title" style={{ margin: "24px 0 4px" }}>Tarjetas de crédito</div>
              {tarjetas.map((t) => (
                <div className="manage-row" key={t.id}>
                  <div>
                    <div className="manage-name">{t.nombre}{t.banco ? ` · ${t.banco}` : ""}</div>
                    <div className="manage-sub mono">{fmt(t.saldo_usado)} usado de {fmt(t.linea_total)}</div>
                  </div>
                  <button className="mov-del" onClick={() => deleteTarjeta(t.id)}><Trash2 size={15} /></button>
                </div>
              ))}
              {!showAddTarjeta ? (
                <button className="add-link" onClick={() => setShowAddTarjeta(true)}><Plus size={13} /> agregar tarjeta</button>
              ) : (
                <div className="form-box">
                  <input placeholder="Nombre (ej. Oro)" value={nuevaTarjetaNombre} onChange={(e) => setNuevaTarjetaNombre(e.target.value)} />
                  <input placeholder="Banco (ej. Banorte)" value={nuevaTarjetaBanco} onChange={(e) => setNuevaTarjetaBanco(e.target.value)} />
                  <input placeholder="Línea de crédito total" inputMode="decimal" value={nuevaTarjetaLinea} onChange={(e) => setNuevaTarjetaLinea(e.target.value)} />
                  <input placeholder="Saldo ya usado (opcional)" inputMode="decimal" value={nuevaTarjetaUsado} onChange={(e) => setNuevaTarjetaUsado(e.target.value)} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn dark" onClick={addTarjeta}>Guardar</button>
                    <button className="btn" onClick={() => setShowAddTarjeta(false)}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="tabbar">
        <button className={`tab-btn ${view === "inicio" ? "active" : ""}`} onClick={() => setView("inicio")}>
          <Home size={19} /> Inicio
        </button>
        <button className="fab" onClick={() => setSheetStep(1)} aria-label="Registrar movimiento">
          <Plus size={24} />
        </button>
        <button className={`tab-btn ${view === "historial" ? "active" : ""}`} onClick={() => setView("historial")}>
          <Clock size={19} /> Historial
        </button>
      </div>
      <button
        className={`tab-btn ${view === "cuentas" ? "active" : ""}`}
        style={{ position: "fixed", bottom: 10, right: 14, zIndex: 41 }}
        onClick={() => setView("cuentas")}
      >
        <Landmark size={16} />
      </button>

      {sheetStep > 0 && (
        <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && closeSheet()}>
          <div className="sheet">
            <div className="sheet-header">
              <span className="sheet-title">
                {sheetStep === 1 && "¿Qué tipo de movimiento?"}
                {sheetStep === 2 && `${ACCIONES[accion].label} — elige`}
                {sheetStep === 3 && `${ACCIONES[accion].label}`}
              </span>
              <button className="sheet-close" onClick={closeSheet}><X size={20} /></button>
            </div>

            {sheetStep === 1 && (
              <>
                <button className="action-btn" onClick={() => { setAccion("gasto_credito"); setSheetStep(2); }} disabled={!hayTarjetas}>
                  <span className="ico"><ArrowUpRight size={17} /></span>Gasto con crédito
                </button>
                <button className="action-btn" onClick={() => { setAccion("gasto_debito"); setSheetStep(2); }} disabled={!hayCuentas}>
                  <span className="ico"><ArrowUpRight size={17} /></span>Gasto o retiro (débito)
                </button>
                <button className="action-btn" onClick={() => { setAccion("pago_tarjeta"); setSheetStep(2); }} disabled={!hayTarjetas}>
                  <span className="ico ahorro"><ArrowDownRight size={17} /></span>Pago a tarjeta
                </button>
                <button className="action-btn" onClick={() => { setAccion("ingreso_cuenta"); setSheetStep(2); }} disabled={!hayCuentas}>
                  <span className="ico ahorro"><ArrowDownRight size={17} /></span>Ingreso / depósito
                </button>
              </>
            )}

            {sheetStep === 2 && (
              <>
                {(accion === "gasto_credito" || accion === "pago_tarjeta" ? tarjetas : cuentas).map((item) => (
                  <button className="target-btn" key={item.id} onClick={() => { setTargetId(item.id); setSheetStep(3); }}>
                    <span>{item.nombre}{item.banco ? ` · ${item.banco}` : ""}</span>
                    <ChevronRight size={16} color="var(--ink-soft)" />
                  </button>
                ))}
              </>
            )}

            {sheetStep === 3 && (
              <>
                <div className="field-label">Monto</div>
                <input className="amount-input" inputMode="decimal" placeholder="$0.00" autoFocus
                  value={monto} onChange={(e) => setMonto(e.target.value.replace(/[^0-9.]/g, ""))} />
                <div className="field-label">Nota (opcional)</div>
                <input className="note-input" placeholder="ej. Súper, gasolina, cena..." value={nota} onChange={(e) => setNota(e.target.value)} />
                <button className="btn dark" style={{ width: "100%", padding: "12px 0", fontSize: 15 }} onClick={commitMovimiento}>
                  <Check size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Guardar movimiento
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Raíz: decide si mostrar login o la app
// ------------------------------------------------------------
export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) return null;
  if (!session) return <Login />;
  return <MainApp session={session} />;
}
