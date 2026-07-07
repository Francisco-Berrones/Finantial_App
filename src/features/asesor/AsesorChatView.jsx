import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "../../shared/lib/supabaseClient";

export default function AsesorChatView({ onBack }) {
  const [mensajes, setMensajes] = useState([]);
  const [pregunta, setPregunta] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    const texto = pregunta.trim();
    if (!texto || enviando) return;
    setMensajes((m) => [...m, { rol: "usuario", texto }]);
    setPregunta("");
    setEnviando(true);
    const { data, error } = await supabase.functions.invoke("asesor-chat", { body: { pregunta: texto } });
    setEnviando(false);
    if (error || data?.error) {
      setMensajes((m) => [...m, { rol: "asesor", texto: "No pude conectar con el asesor. Intenta de nuevo en un momento." }]);
      return;
    }
    setMensajes((m) => [...m, { rol: "asesor", texto: data.respuesta }]);
  };

  return (
    <div className="asesor-root">
      <style>{`
        .asesor-root { height: 100vh; height: 100dvh; display: flex; flex-direction: column; background: var(--paper); }
        .asesor-header { flex-shrink: 0; padding: 22px 20px 14px; border-bottom: 1px solid var(--paper-line); display: flex; align-items: center; gap: 12px; }
        .asesor-back { background: none; border: none; color: var(--ink); cursor: pointer; display: flex; padding: 0; }
        .asesor-title { font-size: 18px; font-weight: 700; }
        .asesor-body { flex: 1; min-height: 0; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .asesor-empty { color: var(--ink-soft); font-size: 14px; text-align: center; margin-top: 40px; }
        .asesor-msg { max-width: 82%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.4; white-space: pre-wrap; }
        .asesor-msg.usuario { align-self: flex-end; background: var(--ink); color: var(--paper-card); border-bottom-right-radius: 4px; }
        .asesor-msg.asesor { align-self: flex-start; background: var(--paper-card); border: 1px solid var(--paper-line); border-bottom-left-radius: 4px; }
        .asesor-footer { flex-shrink: 0; display: flex; align-items: center; gap: 8px; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); border-top: 1px solid var(--paper-line); }
        .asesor-input { flex: 1; min-width: 0; font-family: Figtree; font-size: 16px; border: 1px solid var(--paper-line); border-radius: 20px; padding: 10px 16px; background: var(--paper-card); color: var(--ink); }
        .asesor-send { width: 40px; height: 40px; border-radius: 50%; background: var(--ink); color: var(--paper-card); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; flex-shrink: 0; }
        .asesor-send:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="asesor-header">
        <button className="asesor-back" data-testid="asesor-back-button" onClick={onBack}>
          <ArrowLeft size={22} />
        </button>
        <div className="asesor-title">Asesor</div>
      </div>

      <div className="asesor-body">
        {mensajes.length === 0 && (
          <div className="asesor-empty">
            Pregúntame sobre tus tarjetas y cuentas, por ejemplo:
            <br />"¿Con cuál tarjeta me conviene pagar $2,500?"
          </div>
        )}
        {mensajes.map((m, i) => (
          <div key={i} className={`asesor-msg ${m.rol}`} data-testid={`asesor-msg-${m.rol}`}>
            {m.texto}
          </div>
        ))}
        {enviando && <div className="asesor-msg asesor" data-testid="asesor-msg-cargando">Pensando...</div>}
      </div>

      <div className="asesor-footer">
        <input
          className="asesor-input"
          data-testid="asesor-input"
          placeholder="Escribe tu pregunta..."
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
        />
        <button
          className="asesor-send"
          data-testid="asesor-send-button"
          onClick={enviar}
          disabled={enviando || !pregunta.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
