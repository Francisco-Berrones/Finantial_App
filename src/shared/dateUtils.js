// Si el mes no tiene ese día (ej. día 30 en febrero), usa el último día del mes en vez
// de desbordar al mes siguiente (comportamiento por defecto de `new Date(y, m, d)`).
function diaClamp(anio, mes, dia) {
  const ultimoDiaDelMes = new Date(anio, mes + 1, 0).getDate();
  const d = new Date(anio, mes, Math.min(dia, ultimoDiaDelMes));
  d.setHours(0, 0, 0, 0);
  return d;
}

// Próxima ocurrencia futura del día X (si ya pasó este mes, salta al siguiente).
export function fechaObjetivo(diaObjetivo) {
  if (!diaObjetivo) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let candidato = diaClamp(hoy.getFullYear(), hoy.getMonth(), diaObjetivo);
  if (candidato < hoy) {
    candidato = diaClamp(hoy.getFullYear(), hoy.getMonth() + 1, diaObjetivo);
  }
  return candidato;
}

export function diasHasta(diaObjetivo) {
  const candidato = fechaObjetivo(diaObjetivo);
  if (!candidato) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((candidato - hoy) / 86400000);
}

// El corte más reciente (hoy o en el pasado) -- distinto de fechaObjetivo(), que da
// el PRÓXIMO corte futuro (el que todavía se está acumulando).
export function fechaUltimoCorte(diaCorte) {
  if (!diaCorte) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let candidato = diaClamp(hoy.getFullYear(), hoy.getMonth(), diaCorte);
  if (candidato > hoy) {
    candidato = diaClamp(hoy.getFullYear(), hoy.getMonth() - 1, diaCorte);
  }
  return candidato;
}

// La fecha de pago que corresponde a un corte específico -- la primera ocurrencia
// del día de pago DESPUÉS de ese corte (mismo mes o el siguiente, según corresponda).
export function fechaPagoDeCorte(fechaCorte, diaPago) {
  if (!diaPago) return null;
  let candidato = diaClamp(fechaCorte.getFullYear(), fechaCorte.getMonth(), diaPago);
  if (candidato <= fechaCorte) {
    candidato = diaClamp(fechaCorte.getFullYear(), fechaCorte.getMonth() + 1, diaPago);
  }
  return candidato;
}

export function diasEntreHoyY(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((fecha.getTime() - hoy.getTime()) / 86400000);
}

export function formatDiasFaltantes(dias) {
  if (dias === 0) return "hoy";
  if (dias === 1) return "en 1 día";
  return `en ${dias} días`;
}
