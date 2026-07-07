import { useState, useCallback } from "react";
import { supabase } from "../../shared/lib/supabaseClient";

export function useConversaciones() {
  const [conversaciones, setConversaciones] = useState([]);

  const fetchConversaciones = useCallback(async () => {
    const { data, error } = await supabase
      .from("conversaciones")
      .select("*")
      .order("fecha_actualizacion", { ascending: false });
    if (error) console.error(error);
    setConversaciones(data || []);
    return data || [];
  }, []);

  const crearConversacion = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("conversaciones")
      .insert({ user_id: userId })
      .select()
      .single();
    if (error) {
      alert(error.message);
      return null;
    }
    return data;
  }, []);

  const deleteConversacion = useCallback(async (id) => {
    const { error } = await supabase.from("conversaciones").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return false;
    }
    return true;
  }, []);

  return { conversaciones, fetchConversaciones, crearConversacion, deleteConversacion };
}
