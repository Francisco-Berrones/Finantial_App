import { fechaUltimoCorte, fechaPagoDeCorte, diasEntreHoyY } from "./dateUtils";

const NOTA_MSI = /meses sin intereses/i;

// Mismo cálculo que usa el asesor de IA (supabase/functions/asesor-chat/index.ts):
// lo que realmente toca pagar es el gasto normal del ciclo que YA CERRÓ (excluyendo el
// cargo original de compras a meses, que se cuenta aparte por su mensualidad) más las
// mensualidades de compras a meses activas en esa tarjeta.
export function proximoPagoDeTarjeta(tarjeta, movimientos, msiActivas) {
  const ultimoCorte = fechaUltimoCorte(tarjeta.dia_corte);
  if (!ultimoCorte) return null;
  const proximoPago = fechaPagoDeCorte(ultimoCorte, tarjeta.dia_pago);
  if (!proximoPago) return null;

  const inicioCicloCerrado = new Date(ultimoCorte);
  inicioCicloCerrado.setMonth(inicioCicloCerrado.getMonth() - 1);

  const gastoNormal = movimientos
    .filter(
      (m) =>
        m.tipo_accion === "gasto_credito" &&
        m.target_id === tarjeta.id &&
        !NOTA_MSI.test(m.nota || "") &&
        new Date(m.fecha) > inicioCicloCerrado &&
        new Date(m.fecha) <= ultimoCorte
    )
    .reduce((s, m) => s + Number(m.monto), 0);

  const mensualidadesMsi = msiActivas
    .filter((c) => c.tarjeta_id === tarjeta.id)
    .reduce((s, c) => s + Number(c.mensualidad), 0);

  // Pagos que el usuario ya hizo a esta tarjeta desde que cerró el corte -- se
  // descuentan del monto a pagar, para que una tarjeta ya liquidada deje de
  // aparecer como pendiente (ver proximaTarjetaAPagar).
  const pagosRealizados = movimientos
    .filter(
      (m) =>
        m.tipo_accion === "pago_tarjeta" &&
        m.target_id === tarjeta.id &&
        new Date(m.fecha) > ultimoCorte
    )
    .reduce((s, m) => s + Number(m.monto), 0);

  return {
    fecha: proximoPago,
    dias: diasEntreHoyY(proximoPago),
    monto: Math.max(0, gastoNormal + mensualidadesMsi - pagosRealizados),
  };
}

// La tarjeta con el pago más próximo, entre las que de verdad tienen algo que pagar.
export function proximaTarjetaAPagar(tarjetas, movimientos, msiActivas) {
  const candidatos = (tarjetas || [])
    .map((tarjeta) => ({ tarjeta, pago: proximoPagoDeTarjeta(tarjeta, movimientos, msiActivas) }))
    .filter((c) => c.pago && c.pago.monto > 0);
  if (candidatos.length === 0) return null;
  candidatos.sort((a, b) => a.pago.dias - b.pago.dias);
  return candidatos[0];
}
