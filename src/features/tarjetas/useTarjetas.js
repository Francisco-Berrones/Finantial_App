import { useState, useCallback } from "react";
import { supabase } from "../../shared/lib/supabaseClient";

export function useTarjetas() {
  const [tarjetas, setTarjetas] = useState([]);

  const fetchTarjetas = useCallback(async () => {
    // tarjetas_estado no es superset de tarjetas (le faltan columnas como
    // color/fecha_creacion), así que se combinan: tarjetas para los datos base
    // y el orden de creación, tarjetas_estado para `estado`/`dias` -- misma
    // fuente de verdad que usa recordatorios_pendientes.
    const [{ data: base, error: errorBase }, { data: estados, error: errorEstado }] = await Promise.all([
      supabase.from("tarjetas").select("*").order("fecha_creacion"),
      supabase.from("tarjetas_estado").select("id, estado, fecha_referencia, dias"),
    ]);
    if (errorBase) console.error(errorBase);
    if (errorEstado) console.error(errorEstado);
    const estadoPorId = new Map((estados || []).map((e) => [e.id, e]));
    setTarjetas((base || []).map((t) => ({ ...t, ...(estadoPorId.get(t.id) || {}) })));
  }, []);

  const addTarjeta = useCallback(async ({ nombre, banco, lineaTotal, saldoUsado, diaCorte, diaPago, color, userId }) => {
    const { error } = await supabase.from("tarjetas").insert({
      nombre: nombre.trim(),
      banco: banco.trim(),
      linea_total: parseFloat(lineaTotal) || 0,
      saldo_usado: parseFloat(saldoUsado) || 0,
      dia_corte: diaCorte ? parseInt(diaCorte, 10) : null,
      dia_pago: diaPago ? parseInt(diaPago, 10) : null,
      color: color || null,
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

  const updateCortePago = useCallback(async (id, { diaCorte, diaPago }) => {
    const { error } = await supabase
      .from("tarjetas")
      .update({
        dia_corte: diaCorte ? parseInt(diaCorte, 10) : null,
        dia_pago: diaPago ? parseInt(diaPago, 10) : null,
      })
      .eq("id", id);
    if (error) {
      alert(error.message);
      return false;
    }
    return true;
  }, []);

  return { tarjetas, fetchTarjetas, addTarjeta, deleteTarjeta, updateCortePago };
}
