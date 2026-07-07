import { useState, useCallback } from "react";
import { supabase } from "../../shared/lib/supabaseClient";

export function useChatMensajes() {
  const [mensajes, setMensajes] = useState([]);

  const fetchMensajes = useCallback(async (conversacionId) => {
    if (!conversacionId) {
      setMensajes([]);
      return [];
    }
    const { data, error } = await supabase
      .from("chat_mensajes")
      .select("*")
      .eq("conversacion_id", conversacionId)
      .order("fecha", { ascending: true });
    if (error) console.error(error);
    setMensajes(data || []);
    return data || [];
  }, []);

  const guardarMensaje = useCallback(async ({ conversacionId, userId, rol, contenido }) => {
    const { data, error } = await supabase
      .from("chat_mensajes")
      .insert({ conversacion_id: conversacionId, user_id: userId, rol, contenido })
      .select()
      .single();
    if (error) {
      console.error(error);
      return null;
    }
    await supabase
      .from("conversaciones")
      .update({ fecha_actualizacion: new Date().toISOString() })
      .eq("id", conversacionId);
    return data;
  }, []);

  const ponerTituloSiEsPrimero = useCallback(async (conversacionId, texto) => {
    const titulo = texto.length > 40 ? `${texto.slice(0, 40)}…` : texto;
    await supabase.from("conversaciones").update({ titulo }).eq("id", conversacionId).is("titulo", null);
  }, []);

  return { mensajes, setMensajes, fetchMensajes, guardarMensaje, ponerTituloSiEsPrimero };
}
