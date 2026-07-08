import { useEffect, useRef, useState } from "react";
import { ArrowLeft, List, Send } from "lucide-react";
import { supabase } from "../../shared/lib/supabaseClient";
import { useConversaciones } from "./useConversaciones";
import { useChatMensajes } from "./useChatMensajes";
import ConversacionesModal from "./ConversacionesModal";

const HISTORIAL_MAX = 10;

export default function AsesorChatView({ session, onBack }) {
  const { conversaciones, fetchConversaciones, crearConversacion, deleteConversacion } = useConversaciones();
  const { mensajes, setMensajes, fetchMensajes, guardarMensaje, ponerTituloSiEsPrimero } = useChatMensajes();

  const [conversacionId, setConversacionId] = useState(null);
  const [pregunta, setPregunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarConversaciones, setMostrarConversaciones] = useState(false);
  const [cargando, setCargando] = useState(true);
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [pregunta]);

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
    setMostrarConversaciones(false);
  };

  const nuevaConversacion = async () => {
    const creada = await crearConversacion(session.user.id);
    if (creada) {
      await fetchConversaciones();
      setConversacionId(creada.id);
      setMensajes([]);
    }
    setMostrarConversaciones(false);
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

  const enviar = async () => {
    const texto = pregunta.trim();
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

  return (
    <div className="asesor-root">
      <style>{`
        .asesor-root { height: 100vh; height: 100dvh; display: flex; flex-direction: column; background: var(--paper); }
        .asesor-header { flex-shrink: 0; padding: 22px 20px 14px; border-bottom: 1px solid var(--paper-line); display: flex; align-items: center; gap: 12px; }
        .asesor-back { background: none; border: none; color: var(--ink); cursor: pointer; display: flex; padding: 0; }
        .asesor-title { font-size: 18px; font-weight: 700; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .asesor-history-btn { background: none; border: none; color: var(--ink); cursor: pointer; display: flex; padding: 0; }
        .asesor-body { flex: 1; min-height: 0; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .asesor-empty { color: var(--ink-soft); font-size: 14px; text-align: center; margin-top: 40px; }
        .asesor-msg { max-width: 82%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.4; white-space: pre-wrap; }
        .asesor-msg.usuario { align-self: flex-end; background: var(--ink); color: var(--paper-card); border-bottom-right-radius: 4px; }
        .asesor-msg.asesor { align-self: flex-start; background: var(--paper-card); border: 1px solid var(--paper-line); border-bottom-left-radius: 4px; }
        .asesor-footer { flex-shrink: 0; display: flex; align-items: flex-end; gap: 8px; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); border-top: 1px solid var(--paper-line); }
        .asesor-input { flex: 1; min-width: 0; font-family: Figtree; font-size: 16px; border: 1px solid var(--paper-line); border-radius: 20px; padding: 10px 16px; background: var(--paper-card); color: var(--ink); resize: none; max-height: 120px; overflow-y: auto; line-height: 1.4; scrollbar-width: none; -ms-overflow-style: none; }
        .asesor-input::-webkit-scrollbar { display: none; }
        .asesor-send { width: 40px; height: 40px; border-radius: 50%; background: var(--ink); color: var(--paper-card); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; flex-shrink: 0; }
        .asesor-send:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="asesor-header">
        <button className="asesor-back" data-testid="asesor-back-button" onClick={onBack}>
          <ArrowLeft size={22} />
        </button>
        <div className="asesor-title">
          {conversaciones.find((c) => c.id === conversacionId)?.titulo || "Asesor"}
        </div>
        <button className="asesor-history-btn" data-testid="asesor-history-button" onClick={() => setMostrarConversaciones(true)}>
          <List size={20} />
        </button>
      </div>

      <div className="asesor-body">
        {!cargando && mensajes.length === 0 && (
          <div className="asesor-empty">
            Pregúntame sobre tus tarjetas y cuentas, por ejemplo:
            <br />"¿Con cuál tarjeta me conviene pagar $2,500?"
          </div>
        )}
        {mensajes.map((m, i) => (
          <div key={m.id || i} className={`asesor-msg ${m.rol}`} data-testid={`asesor-msg-${m.rol}`}>
            {m.contenido}
          </div>
        ))}
        {enviando && <div className="asesor-msg asesor" data-testid="asesor-msg-cargando">Pensando...</div>}
      </div>

      <div className="asesor-footer">
        <textarea
          ref={textareaRef}
          className="asesor-input"
          data-testid="asesor-input"
          placeholder="Escribe tu pregunta..."
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

      {mostrarConversaciones && (
        <ConversacionesModal
          conversaciones={conversaciones}
          conversacionActualId={conversacionId}
          onSeleccionar={seleccionarConversacion}
          onNueva={nuevaConversacion}
          onEliminar={eliminarConversacion}
          onClose={() => setMostrarConversaciones(false)}
        />
      )}
    </div>
  );
}
