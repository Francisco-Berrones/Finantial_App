import { useState } from "react";
import { ChevronLeft, User, ShieldCheck, Moon, LogOut } from "lucide-react";
import { supabase } from "../shared/lib/supabaseClient";

export default function AjustesView({ session, oscuro, onToggleOscuro, onBack }) {
  const user = session?.user;
  const nombreInicial = user?.user_metadata?.full_name || "";

  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombre, setNombre] = useState(nombreInicial);
  const [guardando, setGuardando] = useState(false);
  const [nombreMsg, setNombreMsg] = useState("");
  const [enviandoReset, setEnviandoReset] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  const guardarNombre = async () => {
    setGuardando(true);
    setNombreMsg("");
    const { error } = await supabase.auth.updateUser({ data: { full_name: nombre.trim() } });
    setGuardando(false);
    setNombreMsg(error ? "No se pudo guardar. Intenta de nuevo." : "Nombre actualizado.");
    if (!error) setEditandoNombre(false);
  };

  const enviarResetPassword = async () => {
    if (!user?.email) return;
    setEnviandoReset(true);
    setResetMsg("");
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    setEnviandoReset(false);
    setResetMsg(error ? "No se pudo enviar el correo." : `Correo enviado a ${user.email}.`);
  };

  return (
    <div className="ajustes-root">
      <style>{`
        .ajustes-root {
          --bg: #F7F9FB; --surface: #FFFFFF; --surface-low: #F2F4F6; --surface-hi: #E6E8EA;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E;
          --outline: #76777D; --outline-variant: #C6C6CD;
          --primary-container: #131B2E; --on-primary: #FFFFFF;
          --error: #BA1A1A; --error-container: #FFDAD6;
          min-height: 100vh; min-height: 100dvh;
          background: var(--bg); font-family: Inter, sans-serif; color: var(--on-surface);
          transition: background 0.2s ease, color 0.2s ease;
        }
        .app-root[data-theme="dark"] .ajustes-root {
          --bg: #101317; --surface: #1B1F23; --surface-low: #15181B; --surface-hi: #262B30;
          --on-surface: #E2E2E6; --on-surface-variant: #C4C6D0;
          --outline: #8D9199; --outline-variant: #43474E;
          --primary-container: #DAE2FD; --on-primary: #131B2E;
          --error: #FFB4AB; --error-container: #93000A;
        }

        .ajustes-header { position: sticky; top: 0; z-index: 10; background: var(--bg); padding: 14px 12px; display: flex; align-items: center; }
        .ajustes-back { width: 40px; height: 40px; border-radius: 9999px; background: none; border: none; color: var(--on-surface); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ajustes-back:active { background: var(--surface-low); }
        .ajustes-titulo { position: absolute; left: 0; right: 0; text-align: center; pointer-events: none; font-size: 16px; font-weight: 700; color: var(--on-surface); }

        .ajustes-body { padding: 8px 16px 32px; max-width: 460px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
        .ajustes-section { display: flex; flex-direction: column; gap: 10px; }
        .ajustes-section-titulo { margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--outline); }
        .ajustes-card { background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 16px; overflow: hidden; }

        .ajustes-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; }
        .ajustes-row-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--surface-hi); color: var(--on-surface-variant); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ajustes-row-icon.error { background: var(--error-container); color: var(--error); }
        .ajustes-row-content { flex: 1; min-width: 0; }
        .ajustes-row-titulo { margin: 0; font-size: 15px; font-weight: 600; color: var(--on-surface); }
        .ajustes-row-titulo.error { color: var(--error); }
        .ajustes-row-sub { margin: 2px 0 0; font-size: 12px; color: var(--on-surface-variant); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ajustes-row-action { flex-shrink: 0; background: none; border: none; color: var(--primary-container); font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; padding: 6px 4px; }
        .ajustes-row-action:disabled { opacity: 0.5; cursor: default; }

        .ajustes-inline-form { display: flex; flex-direction: column; gap: 8px; padding: 0 16px 16px; }
        .ajustes-label { font-size: 12px; color: var(--on-surface-variant); }
        .ajustes-input { box-sizing: border-box; width: 100%; height: 44px; padding: 0 12px; background: var(--surface-low); border: 1px solid var(--outline-variant); border-radius: 10px; font-family: Inter, sans-serif; font-size: 15px; color: var(--on-surface); outline: none; }
        .ajustes-input:disabled { color: var(--on-surface-variant); }
        .ajustes-inline-form-btns { display: flex; gap: 8px; margin-top: 4px; }
        .ajustes-btn { flex: 1; font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; border: 1px solid var(--outline-variant); background: var(--surface); color: var(--on-surface); padding: 10px 16px; border-radius: 10px; cursor: pointer; }
        .ajustes-btn.dark { background: var(--primary-container); color: var(--on-primary); border-color: var(--primary-container); }
        .ajustes-btn:disabled { opacity: 0.6; cursor: default; }
        .ajustes-msg { margin: 0; padding: 0 16px 14px; font-size: 12px; color: var(--on-surface-variant); }

        .ajustes-switch { flex-shrink: 0; width: 44px; height: 26px; border-radius: 9999px; background: var(--surface-hi); border: 1px solid var(--outline-variant); position: relative; cursor: pointer; padding: 0; transition: background 0.15s ease; }
        .ajustes-switch.on { background: var(--primary-container); border-color: var(--primary-container); }
        .ajustes-switch-knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 9999px; background: var(--surface); box-shadow: 0 1px 2px rgba(0,0,0,0.25); transition: transform 0.15s ease; }
        .ajustes-switch.on .ajustes-switch-knob { transform: translateX(18px); background: var(--on-primary); }

        .ajustes-logout-row { width: 100%; box-sizing: border-box; display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: none; border: none; border-top: 1px solid var(--outline-variant); cursor: pointer; text-align: left; font-family: Inter, sans-serif; }
        .ajustes-logout-row:active { background: var(--surface-low); }
      `}</style>

      <div className="ajustes-header">
        <button className="ajustes-back" data-testid="ajustes-back-button" onClick={onBack}>
          <ChevronLeft size={22} />
        </button>
        <span className="ajustes-titulo">Ajustes</span>
      </div>

      <div className="ajustes-body">
        <section className="ajustes-section">
          <h3 className="ajustes-section-titulo">Cuenta</h3>

          <div className="ajustes-card">
            <div className="ajustes-row">
              <div className="ajustes-row-icon"><User size={18} /></div>
              <div className="ajustes-row-content">
                <p className="ajustes-row-titulo">Información Personal</p>
                {!editandoNombre && (
                  <p className="ajustes-row-sub">{nombreInicial || "Sin nombre"} · {user?.email}</p>
                )}
              </div>
              {!editandoNombre && (
                <button className="ajustes-row-action" data-testid="ajustes-editar-nombre-button" onClick={() => setEditandoNombre(true)}>
                  Editar
                </button>
              )}
            </div>
            {editandoNombre && (
              <div className="ajustes-inline-form">
                <label className="ajustes-label">Nombre</label>
                <input
                  className="ajustes-input"
                  data-testid="ajustes-nombre-input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                />
                <label className="ajustes-label">Correo</label>
                <input className="ajustes-input" value={user?.email || ""} disabled />
                <div className="ajustes-inline-form-btns">
                  <button className="ajustes-btn dark" data-testid="ajustes-guardar-nombre-button" onClick={guardarNombre} disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    className="ajustes-btn"
                    data-testid="ajustes-cancelar-nombre-button"
                    onClick={() => { setEditandoNombre(false); setNombre(nombreInicial); }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            {nombreMsg && <p className="ajustes-msg" data-testid="ajustes-nombre-msg">{nombreMsg}</p>}
          </div>

          <div className="ajustes-card">
            <div className="ajustes-row">
              <div className="ajustes-row-icon"><ShieldCheck size={18} /></div>
              <div className="ajustes-row-content">
                <p className="ajustes-row-titulo">Seguridad y Contraseña</p>
                <p className="ajustes-row-sub">Te enviamos un correo para restablecerla</p>
              </div>
              <button
                className="ajustes-row-action"
                data-testid="ajustes-reset-password-button"
                onClick={enviarResetPassword}
                disabled={enviandoReset}
              >
                {enviandoReset ? "Enviando..." : "Enviar"}
              </button>
            </div>
            {resetMsg && <p className="ajustes-msg" data-testid="ajustes-reset-msg">{resetMsg}</p>}
          </div>
        </section>

        <section className="ajustes-section">
          <h3 className="ajustes-section-titulo">Preferencias</h3>

          <div className="ajustes-card">
            <div className="ajustes-row">
              <div className="ajustes-row-icon"><Moon size={18} /></div>
              <div className="ajustes-row-content">
                <p className="ajustes-row-titulo">Modo Oscuro</p>
                <p className="ajustes-row-sub">Aplica en toda la app</p>
              </div>
              <button
                className={`ajustes-switch${oscuro ? " on" : ""}`}
                role="switch"
                aria-checked={oscuro}
                data-testid="ajustes-modo-oscuro-toggle"
                onClick={onToggleOscuro}
              >
                <span className="ajustes-switch-knob" />
              </button>
            </div>

            <button className="ajustes-logout-row" data-testid="ajustes-logout-button" onClick={() => supabase.auth.signOut()}>
              <div className="ajustes-row-icon error"><LogOut size={18} /></div>
              <div className="ajustes-row-content">
                <p className="ajustes-row-titulo error">Cerrar Sesión</p>
                <p className="ajustes-row-sub">Desconectar de este dispositivo</p>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
