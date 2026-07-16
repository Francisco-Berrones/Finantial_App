import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bot, List, Send } from "lucide-react";
import { supabase } from "../../shared/lib/supabaseClient";
import { useConversaciones } from "./useConversaciones";
import { useChatMensajes } from "./useChatMensajes";
import HistorialConversacionesView from "./HistorialConversacionesView";

const HISTORIAL_MAX = 10;

const SUGERENCIAS = [
  "¿Cuánto gasté en comida?",
  "¿Puedo pagar mi tarjeta?",
  "Analiza mis suscripciones",
];

export default function AsesorChatView({ session, onBack }) {
  const { conversaciones, fetchConversaciones, crearConversacion, deleteConversacion } = useConversaciones();
  const { mensajes, setMensajes, fetchMensajes, guardarMensaje, ponerTituloSiEsPrimero } = useChatMensajes();

  const [conversacionId, setConversacionId] = useState(null);
  const [pregunta, setPregunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [cargando, setCargando] = useState(true);
  const textareaRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [pregunta]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes, enviando]);

  useEffect(() => {
    (async () => {
      const lista = await fetchConversaciones();
      let activa = lista[0];
      if (!activa) {
        activa = await crearConversacion(session.user.id);
        if (activa) await fetchConversaciones();
      }
      if (activa) {
        setConversacionId(activa.id);
        await fetchMensajes(activa.id);
      }
      setCargando(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seleccionarConversacion = async (id) => {
    setConversacionId(id);
    await fetchMensajes(id);
    setMostrarHistorial(false);
  };

  const nuevaConversacion = async () => {
    const creada = await crearConversacion(session.user.id);
    if (creada) {
      await fetchConversaciones();
      setConversacionId(creada.id);
      setMensajes([]);
    }
    setMostrarHistorial(false);
  };

  const eliminarConversacion = async (id) => {
    const ok = await deleteConversacion(id);
    if (!ok) return;
    const lista = await fetchConversaciones();
    if (id === conversacionId) {
      const siguiente = lista[0];
      if (siguiente) {
        setConversacionId(siguiente.id);
        await fetchMensajes(siguiente.id);
      } else {
        const creada = await crearConversacion(session.user.id);
        if (creada) {
          await fetchConversaciones();
          setConversacionId(creada.id);
          setMensajes([]);
        }
      }
    }
  };

  const enviarTexto = async (texto) => {
    if (!texto || enviando || !conversacionId) return;

    const esPrimero = mensajes.length === 0;
    const historial = mensajes.slice(-HISTORIAL_MAX).map((m) => ({ rol: m.rol, contenido: m.contenido }));

    setMensajes((m) => [...m, { rol: "usuario", contenido: texto }]);
    setPregunta("");
    setEnviando(true);

    await guardarMensaje({ conversacionId, userId: session.user.id, rol: "usuario", contenido: texto });
    if (esPrimero) await ponerTituloSiEsPrimero(conversacionId, texto);

    const { data, error } = await supabase.functions.invoke("asesor-chat", {
      body: { pregunta: texto, historial },
    });
    setEnviando(false);

    if (error || data?.error) {
      setMensajes((m) => [...m, { rol: "asesor", contenido: "No pude conectar con el asesor. Intenta de nuevo en un momento." }]);
      return;
    }

    setMensajes((m) => [...m, { rol: "asesor", contenido: data.respuesta }]);
    await guardarMensaje({ conversacionId, userId: session.user.id, rol: "asesor", contenido: data.respuesta });
    await fetchConversaciones();
  };

  const enviar = () => enviarTexto(pregunta.trim());

  if (mostrarHistorial) {
    return (
      <HistorialConversacionesView
        conversaciones={conversaciones}
        conversacionActualId={conversacionId}
        onSeleccionar={seleccionarConversacion}
        onNueva={nuevaConversacion}
        onEliminar={eliminarConversacion}
        onBack={() => setMostrarHistorial(false)}
      />
    );
  }

  return (
    <div className="asesor-root">
      <style>{`
        .asesor-root {
          --bg: #F7F9FB;
          --surface: #FFFFFF;
          --surface-hi: #E0E3E5;
          --primary: #000000;
          --on-primary: #FFFFFF;
          --primary-container: #131B2E;
          --on-primary-container: #7C839B;
          --secondary-container: #D5E3FD;
          --on-secondary-container: #57657B;
          --on-surface: #1A1C1E;
          --on-surface-variant: #44474E;
          --outline: #76777D;
          --outline-variant: #C6C6CD;
          --glass: rgba(255,255,255,0.75);

          height: 100vh; height: 100dvh; display: flex; flex-direction: column;
          background: var(--bg); font-family: Inter, sans-serif; color: var(--on-surface);
          transition: background 0.2s ease, color 0.2s ease;
        }
        .app-root[data-theme="dark"] .asesor-root {
          --bg: #101317; --surface: #1B1F23; --surface-hi: #262B30;
          --primary: #DAE2FD; --on-primary: #131B2E; --primary-container: #2A3550; --on-primary-container: #A9B3CE;
          --secondary-container: #3A4A63; --on-secondary-container: #B8C6E0;
          --on-surface: #E2E2E6; --on-surface-variant: #C4C6D0;
          --outline: #8D9199; --outline-variant: #43474E;
          --glass: rgba(27,31,35,0.75);
        }
        .asesor-header { flex-shrink: 0; background: var(--surface); box-shadow: 0 1px 2px rgba(0,0,0,0.05); padding: 14px 12px; display: flex; align-items: center; gap: 8px; }
        .asesor-back, .asesor-history-btn { width: 40px; height: 40px; border-radius: 9999px; background: none; border: none; color: var(--on-surface-variant); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .asesor-back:active, .asesor-history-btn:active { transform: scale(0.92); background: var(--bg); }
        .asesor-title { font-size: 18px; font-weight: 700; color: var(--primary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }

        .asesor-body { flex: 1; min-height: 0; overflow-y: auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 20px; }
        .asesor-empty { color: var(--on-surface-variant); font-size: 14px; text-align: center; margin-top: 40px; }

        .asesor-turn { display: flex; flex-direction: column; max-width: 85%; }
        .asesor-turn.asesor { align-items: flex-start; }
        .asesor-turn.usuario { align-items: flex-end; align-self: flex-end; }
        .asesor-turn-label { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
        .asesor-avatar { width: 22px; height: 22px; border-radius: 9999px; background: var(--primary-container); color: var(--on-primary-container); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .asesor-turn-label span { font-size: 13px; font-weight: 500; letter-spacing: 0.01em; color: var(--on-surface-variant); }

        .asesor-msg { padding: 16px; border-radius: 24px; font-size: 16px; line-height: 1.5; white-space: pre-wrap; }
        .asesor-msg.asesor { background: var(--surface-hi); color: var(--on-surface); box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
        .asesor-msg.usuario { background: var(--primary); color: var(--on-primary); box-shadow: 0 2px 6px rgba(0,0,0,0.15); }

        .asesor-suggestions { flex-shrink: 0; display: flex; gap: 8px; overflow-x: auto; padding: 0 16px 12px; scrollbar-width: none; }
        .asesor-suggestions::-webkit-scrollbar { display: none; }
        .asesor-chip { flex-shrink: 0; white-space: nowrap; padding: 8px 16px; background: var(--secondary-container); color: var(--on-secondary-container); border: 1px solid var(--outline-variant); border-radius: 9999px; font-size: 13px; font-weight: 500; cursor: pointer; }
        .asesor-chip:active { transform: scale(0.96); }

        .asesor-footer { flex-shrink: 0; padding: 0 16px calc(16px + env(safe-area-inset-bottom)); }
        .asesor-input-bar { display: flex; align-items: flex-end; gap: 8px; background: var(--glass); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid var(--outline-variant); border-radius: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); padding: 6px 6px 6px 16px; }
        .asesor-input { flex: 1; min-width: 0; font-family: Inter, sans-serif; font-size: 16px; border: none; background: transparent; color: var(--on-surface); resize: none; max-height: 120px; overflow-y: auto; line-height: 1.5; padding: 10px 0; outline: none; scrollbar-width: none; -ms-overflow-style: none; }
        .asesor-input::-webkit-scrollbar { display: none; }
        .asesor-input::placeholder { color: var(--outline); }
        .asesor-send { width: 40px; height: 40px; border-radius: 12px; background: var(--primary); color: var(--on-primary); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; flex-shrink: 0; }
        .asesor-send:disabled { opacity: 0.4; cursor: not-allowed; }
        .asesor-send:active:not(:disabled) { transform: scale(0.92); }
      `}</style>

      <div className="asesor-header">
        <button className="asesor-back" data-testid="asesor-back-button" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="asesor-title">
          {conversaciones.find((c) => c.id === conversacionId)?.titulo || "FinTrack"}
        </div>
        <button className="asesor-history-btn" data-testid="asesor-history-button" onClick={() => setMostrarHistorial(true)}>
          <List size={20} />
        </button>
      </div>

      <div className="asesor-body" ref={bodyRef}>
        {!cargando && mensajes.length === 0 && (
          <div className="asesor-empty">
            Pregúntame sobre tus tarjetas y cuentas, por ejemplo:
            <br />"¿Con cuál tarjeta me conviene pagar $2,500?"
          </div>
        )}
        {mensajes.map((m, i) => (
          <div key={m.id || i} className={`asesor-turn ${m.rol}`}>
            {m.rol === "asesor" && (
              <div className="asesor-turn-label">
                <div className="asesor-avatar"><Bot size={13} /></div>
                <span>FinnIA</span>
              </div>
            )}
            <div className={`asesor-msg ${m.rol}`} data-testid={`asesor-msg-${m.rol}`}>
              {m.contenido}
            </div>
          </div>
        ))}
        {enviando && (
          <div className="asesor-turn asesor">
            <div className="asesor-turn-label">
              <div className="asesor-avatar"><Bot size={13} /></div>
              <span>FinnIA</span>
            </div>
            <div className="asesor-msg asesor" data-testid="asesor-msg-cargando">Pensando...</div>
          </div>
        )}
      </div>

      <div className="asesor-suggestions">
        {SUGERENCIAS.map((s) => (
          <button key={s} className="asesor-chip" onClick={() => enviarTexto(s)} disabled={enviando}>
            {s}
          </button>
        ))}
      </div>

      <div className="asesor-footer">
        <div className="asesor-input-bar">
          <textarea
            ref={textareaRef}
            className="asesor-input"
            data-testid="asesor-input"
            placeholder="Pregunta a la IA..."
            rows={1}
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
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
    </div>
  );
}
