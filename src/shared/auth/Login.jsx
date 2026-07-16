import { useState } from "react";
import { Wallet, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
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
          --bg: #F7F9FB;
          --surface: #FFFFFF;
          --surface-container: #ECEEF0;
          --surface-container-low: #F2F4F6;
          --surface-container-high: #E6E8EA;
          --on-surface: #1A1C1E;
          --on-surface-variant: #4C4546;
          --outline: #7E7576;
          --outline-variant: #CFC4C5;
          --primary: #000000;
          --on-primary: #FFFFFF;
          --accent: #006C4C;
          --error: #BA1A1A;
          --blob-1: #D5E3FD;
          --blob-2: #E0E3E5;

          min-height: 100vh;
          display: flex; flex-direction: column;
          background: var(--bg);
          font-family: Inter, sans-serif;
          color: var(--on-surface);
        }
        .login-header {
          display: flex; align-items: center; justify-content: center;
          height: 64px; background: var(--surface); flex-shrink: 0;
        }
        .login-header-brand { display: flex; align-items: center; gap: 8px; }
        .login-header-title { font-size: 24px; font-weight: 700; margin: 0; }
        .login-main {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 32px 20px; position: relative; overflow: hidden;
        }
        .login-blob {
          position: absolute; width: 320px; height: 320px; border-radius: 9999px;
          filter: blur(80px); pointer-events: none;
        }
        .login-blob-1 { top: -80px; right: -80px; background: var(--blob-1); opacity: 0.35; }
        .login-blob-2 { bottom: -80px; left: -80px; background: var(--blob-2); opacity: 0.4; }
        .login-box {
          width: 100%; max-width: 400px; position: relative; z-index: 1;
          background: var(--surface);
          border: 1px solid var(--surface-container);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 20px -2px rgba(25,28,30,0.04), 0 2px 10px -2px rgba(25,28,30,0.02);
          box-sizing: border-box;
        }
        .login-title { font-size: 24px; font-weight: 700; margin: 0 0 4px; text-align: center; }
        .login-sub { font-size: 16px; color: var(--on-surface-variant); margin: 0 0 32px; text-align: center; }
        .login-field { margin-bottom: 16px; }
        .login-label { display: block; font-size: 13px; font-weight: 500; letter-spacing: 0.01em; color: var(--on-surface-variant); margin: 0 0 8px 4px; }
        .login-input-wrap {
          position: relative; display: flex; align-items: center;
          background: var(--surface-container-low);
          border: 1px solid var(--outline-variant);
          border-radius: 8px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .login-input-wrap:focus-within { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
        .login-input-icon { position: absolute; left: 12px; color: var(--outline); pointer-events: none; display: flex; }
        .login-box input {
          box-sizing: border-box;
          width: 100%;
          font-family: Inter, sans-serif;
          font-size: 16px;
          color: var(--on-surface);
          border: none;
          background: transparent;
          border-radius: 8px;
          padding: 12px 16px 12px 40px;
          outline: none;
        }
        .login-box input::placeholder { color: var(--outline); }
        .login-toggle-pw { position: absolute; right: 0; top: 0; bottom: 0; width: 44px; background: none; border: none; color: var(--outline); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; }
        .login-toggle-pw:hover { color: var(--on-surface); }
        .login-forgot-row { display: flex; justify-content: flex-end; padding-top: 4px; margin-bottom: 16px; }
        .login-forgot-link { font-size: 13px; font-weight: 500; color: var(--on-surface); text-decoration: none; cursor: pointer; background: none; border: none; padding: 0; }
        .login-forgot-link:hover { text-decoration: underline; }
        .login-submit {
          width: 100%;
          font-family: Inter, sans-serif;
          font-size: 18px;
          font-weight: 600;
          padding: 16px 0;
          border-radius: 999px;
          border: none;
          background: var(--primary);
          color: var(--on-primary);
          cursor: pointer;
        }
        .login-submit:active { transform: scale(0.98); }
        .login-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-error { color: var(--error); font-size: 13px; margin-top: 12px; text-align: center; }
        .login-footer-account { margin-top: 32px; text-align: center; position: relative; z-index: 1; }
        .login-footer-account-text { font-size: 16px; color: var(--on-surface-variant); }
        .login-footer-account-link { font-size: 18px; font-weight: 600; color: var(--primary); background: none; border: none; cursor: pointer; margin-left: 4px; padding: 0; }
        .login-footer-account-link:hover { text-decoration: underline; }
        .login-legal {
          display: flex; justify-content: center; gap: 16px; flex-shrink: 0;
          padding: 16px 20px calc(16px + env(safe-area-inset-bottom)); font-size: 10px; color: var(--outline); opacity: 0.7;
        }
      `}</style>

      <header className="login-header">
        <div className="login-header-brand">
          <Wallet size={26} strokeWidth={2.2} />
          <h1 className="login-header-title">FinTrack</h1>
        </div>
      </header>

      <main className="login-main">
        <div className="login-blob login-blob-1" />
        <div className="login-blob login-blob-2" />

        <div className="login-box">
          <h2 className="login-title">Bienvenido</h2>
          <p className="login-sub">Ingresa tus credenciales para continuar</p>

          <div className="login-field">
            <label className="login-label" htmlFor="email">Correo electrónico</label>
            <div className="login-input-wrap">
              <Mail size={18} className="login-input-icon" />
              <input
                id="email"
                placeholder="ejemplo@fintrack.com"
                type="email"
                data-testid="login-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="login-field" style={{ marginBottom: 0 }}>
            <label className="login-label" htmlFor="password">Contraseña</label>
            <div className="login-input-wrap">
              <Lock size={18} className="login-input-icon" />
              <input
                id="password"
                placeholder="••••••••"
                type={mostrarPassword ? "text" : "password"}
                data-testid="login-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && entrar()}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                className="login-toggle-pw"
                data-testid="login-toggle-password-button"
                onClick={() => setMostrarPassword((v) => !v)}
                title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-forgot-row">
            <button type="button" className="login-forgot-link" onClick={(e) => e.preventDefault()}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button className="login-submit" data-testid="login-submit-button" onClick={entrar} disabled={loading}>
            {loading ? "Entrando..." : "Ingresar"}
          </button>

          {error && <div className="login-error">{error}</div>}
        </div>

        <div className="login-footer-account">
          <span className="login-footer-account-text">¿No tienes una cuenta?</span>
          <button className="login-footer-account-link" onClick={(e) => e.preventDefault()}>Crear cuenta</button>
        </div>
      </main>

      <footer className="login-legal">
        <span>Términos de servicio</span>
        <span>Privacidad</span>
        <span>Soporte</span>
      </footer>
    </div>
  );
}
