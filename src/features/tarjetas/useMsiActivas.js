import { useState, useCallback } from "react";
import { supabase } from "../../shared/lib/supabaseClient";

export function useMsiActivas() {
  const [msiActivas, setMsiActivas] = useState([]);

  const fetchMsiActivas = useCallback(async () => {
    const { data, error } = await supabase
      .from("msi_detalle")
      .select("tarjeta_id, mensualidad, meses_restantes, saldo_pendiente");
    if (error) console.error(error);
    setMsiActivas((data || []).filter((c) => c.meses_restantes > 0 && Number(c.saldo_pendiente) > 0));
  }, []);

  return { msiActivas, fetchMsiActivas };
}
