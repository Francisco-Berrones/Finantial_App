import { useState, useCallback } from "react";
import { supabase } from "../../shared/lib/supabaseClient";

export function useTarjetas() {
  const [tarjetas, setTarjetas] = useState([]);

  const fetchTarjetas = useCallback(async () => {
    const { data, error } = await supabase
      .from("tarjetas")
      .select("*")
      .order("fecha_creacion");
    if (error) console.error(error);
    setTarjetas(data || []);
  }, []);

  const addTarjeta = useCallback(async ({ nombre, banco, lineaTotal, saldoUsado, userId }) => {
    const { error } = await supabase.from("tarjetas").insert({
      nombre: nombre.trim(),
      banco: banco.trim(),
      linea_total: parseFloat(lineaTotal) || 0,
      saldo_usado: parseFloat(saldoUsado) || 0,
      user_id: userId,
    });
    if (error) {
      alert(error.message);
      return false;
    }
    return true;
  }, []);

  const deleteTarjeta = useCallback(async (id) => {
    const { error } = await supabase.from("tarjetas").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return false;
    }
    return true;
  }, []);

  return { tarjetas, fetchTarjetas, addTarjeta, deleteTarjeta };
}
