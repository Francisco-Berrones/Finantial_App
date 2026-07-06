import { useState, useCallback } from "react";
import { supabase } from "../../shared/lib/supabaseClient";

export function useCuentas() {
  const [cuentas, setCuentas] = useState([]);

  const fetchCuentas = useCallback(async () => {
    const { data, error } = await supabase
      .from("cuentas")
      .select("*")
      .order("fecha_creacion");
    if (error) console.error(error);
    setCuentas(data || []);
  }, []);

  const addCuenta = useCallback(async ({ nombre, saldo, userId }) => {
    const { error } = await supabase.from("cuentas").insert({
      nombre: nombre.trim(),
      saldo: parseFloat(saldo) || 0,
      user_id: userId,
    });
    if (error) {
      alert(error.message);
      return false;
    }
    return true;
  }, []);

  const deleteCuenta = useCallback(async (id) => {
    const { error } = await supabase.from("cuentas").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return false;
    }
    return true;
  }, []);

  return { cuentas, fetchCuentas, addCuenta, deleteCuenta };
}
