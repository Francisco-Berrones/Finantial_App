import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
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
          font-family: Figtree;
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
        .login-sub { font-size: 13px; color: #7A7365; margin: 0 0 28px; }
        .login-field {
          position: relative;
          margin-bottom: 12px;
        }
        .login-field-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #7A7365;
          pointer-events: none;
        }
        .login-box input {
          box-sizing: border-box;
          width: 100%;
          font-family: Figtree;
          font-size: 15px;
          border: 1px solid #CBC3AC;
          border-radius: 999px;
          padding: 12px 16px 12px 42px;
          background: #DEDACA;
        }
        .login-box button {
          width: 100%;
          font-family: Figtree;
          font-size: 14px;
          padding: 12px 0;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #3a3833, #2B2A26);
          color: #F6F3E9;
          cursor: pointer;
          margin-top: 8px;
        }
        .login-error { color: #A8412B; font-size: 13px; margin-top: 8px; }
      `}</style>
      <div className="login-box">
        <h1 className="login-title">FinTrack</h1>
        <p className="login-sub">Inicio de sesión</p>
        <div className="login-field">
          <Mail size={16} className="login-field-icon" />
          <input
            placeholder="Correo"
            type="email"
            data-testid="login-email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="login-field">
          <Lock size={16} className="login-field-icon" />
          <input
            placeholder="Contraseña"
            type="password"
            data-testid="login-password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && entrar()}
          />
        </div>
        <button data-testid="login-submit-button" onClick={entrar} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
}
