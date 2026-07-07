import { useState, useCallback } from "react";
import { supabase } from "../../shared/lib/supabaseClient";

export function useMsiDetalle(tarjetaId) {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);

  const fetchMsi = useCallback(async () => {
    if (!tarjetaId) return;
    setCargando(true);
    const { data, error } = await supabase
      .from("msi_detalle")
      .select("*")
      .eq("tarjeta_id", tarjetaId)
      .order("fecha_compra", { ascending: false });
    if (error) console.error(error);
    setCompras((data || []).filter((c) => c.meses_restantes > 0 && Number(c.saldo_pendiente) > 0));
    setCargando(false);
  }, [tarjetaId]);

  const registrarCompra = useCallback(async ({ tarjetaId, monto, meses, descripcion }) => {
    const m = parseFloat(monto);
    const mesesInt = parseInt(meses, 10);
    if (!m || m <= 0) {
      alert("El monto debe ser mayor a 0");
      return false;
    }
    if (!mesesInt || mesesInt <= 1) {
      alert("Los meses deben ser mayor a 1");
      return false;
    }
    const { error } = await supabase.rpc("registrar_compra_a_meses", {
      p_tarjeta_id: tarjetaId,
      p_monto: m,
      p_meses: mesesInt,
      p_descripcion: descripcion.trim(),
    });
    if (error) {
      alert("No se pudo registrar: " + error.message);
      return false;
    }
    return true;
  }, []);

  return { compras, cargando, fetchMsi, registrarCompra };
}
