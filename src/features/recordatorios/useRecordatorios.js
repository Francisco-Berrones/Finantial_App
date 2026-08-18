import { useState, useCallback } from "react";
import { supabase } from "../../shared/lib/supabaseClient";

export function useRecordatorios() {
  const [recordatorios, setRecordatorios] = useState([]);

  const fetchRecordatorios = useCallback(async () => {
    const { data, error } = await supabase
      .from("recordatorios_pendientes")
      .select("*")
      .order("orden")
      .order("dias");
    if (error) console.error(error);
    setRecordatorios(data || []);
  }, []);

  return { recordatorios, fetchRecordatorios };
}
