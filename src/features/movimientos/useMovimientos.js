import { useState, useCallback } from "react";
import { supabase } from "../../shared/lib/supabaseClient";
import { ACCIONES } from "../../shared/constants";

export function useMovimientos() {
  const [movimientos, setMovimientos] = useState([]);

  const fetchMovimientos = useCallback(async () => {
    const { data, error } = await supabase
      .from("movimientos")
      .select("*")
      .order("fecha", { ascending: false });
    if (error) console.error(error);
    setMovimientos(data || []);
  }, []);

  const commitMovimiento = useCallback(async ({ accion, targetId, monto, nota }) => {
    const m = parseFloat(monto);
    if (!m || m <= 0 || !targetId || !accion) return false;
    const { error } = await supabase.rpc("registrar_movimiento", {
      p_tipo_accion: accion,
      p_target_tipo: ACCIONES[accion].targetTipo,
      p_target_id: targetId,
      p_monto: m,
      p_nota: nota.trim(),
    });
    if (error) {
      alert("No se pudo guardar: " + error.message);
      return false;
    }
    return true;
  }, []);

  const deleteMovimiento = useCallback(async (mov) => {
    const { error } = await supabase.rpc("eliminar_movimiento", { p_movimiento_id: mov.id });
    if (error) {
      alert("No se pudo eliminar: " + error.message);
      return false;
    }
    return true;
  }, []);

  const commitPagoTarjeta = useCallback(async ({ tarjetaId, monto, origenCuentaId, asignaciones, nota }) => {
    const m = parseFloat(monto);
    if (!tarjetaId) {
      alert("Elige una tarjeta");
      return false;
    }
    if (!m || m <= 0) {
      alert("Ingresa el monto total del pago");
      return false;
    }
    const asignado = asignaciones.reduce((s, a) => s + (Number(a.monto) || 0), 0);
    if (asignado > m) {
      alert(`Lo asignado a compras a meses (${asignado}) no puede ser mayor al monto total del pago (${m})`);
      return false;
    }
    const { error } = await supabase.rpc("registrar_pago_tarjeta", {
      p_tarjeta_id: tarjetaId,
      p_monto: m,
      p_origen_cuenta_id: origenCuentaId || null,
      p_asignaciones: asignaciones,
      p_nota: nota.trim(),
    });
    if (error) {
      alert("No se pudo registrar el pago: " + error.message);
      return false;
    }
    return true;
  }, []);

  return { movimientos, fetchMovimientos, commitMovimiento, deleteMovimiento, commitPagoTarjeta };
}
