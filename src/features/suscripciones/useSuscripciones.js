import { useState, useCallback } from "react";
import { supabase } from "../../shared/lib/supabaseClient";

export function useSuscripciones() {
  const [suscripciones, setSuscripciones] = useState([]);

  const fetchSuscripciones = useCallback(async () => {
    const { data, error } = await supabase
      .from("suscripciones_estado")
      .select("*")
      .order("dias_para_cobro");
    if (error) console.error(error);
    setSuscripciones(data || []);
  }, []);

  const addSuscripcion = useCallback(
    async ({ nombre, monto, frecuencia, diaCobro, mesCobro, targetTipo, targetId, categoriaId, userId }) => {
      const { error } = await supabase.from("suscripciones").insert({
        nombre: nombre.trim(),
        monto: parseFloat(monto) || 0,
        frecuencia,
        dia_cobro: parseInt(diaCobro, 10),
        mes_cobro: frecuencia === "anual" ? parseInt(mesCobro, 10) : null,
        target_tipo: targetTipo,
        target_id: targetId,
        categoria_id: categoriaId || null,
        user_id: userId,
      });
      if (error) {
        alert(error.message);
        return false;
      }
      return true;
    },
    []
  );

  const deleteSuscripcion = useCallback(async (id) => {
    const { error } = await supabase.from("suscripciones").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return false;
    }
    return true;
  }, []);

  const confirmarCobro = useCallback(async (id) => {
    const { error } = await supabase.rpc("confirmar_cobro_suscripcion", { p_suscripcion_id: id });
    if (error) {
      alert("No se pudo confirmar: " + error.message);
      return false;
    }
    return true;
  }, []);

  return { suscripciones, fetchSuscripciones, addSuscripcion, deleteSuscripcion, confirmarCobro };
}
