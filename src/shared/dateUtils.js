// Si el mes no tiene ese día (ej. día 30 en febrero), usa el último día del mes en vez
// de desbordar al mes siguiente (comportamiento por defecto de `new Date(y, m, d)`).
function diaClamp(anio, mes, dia) {
  const ultimoDiaDelMes = new Date(anio, mes + 1, 0).getDate();
  const d = new Date(anio, mes, Math.min(dia, ultimoDiaDelMes));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function diasHasta(diaObjetivo) {
  if (!diaObjetivo) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let candidato = diaClamp(hoy.getFullYear(), hoy.getMonth(), diaObjetivo);
  if (candidato < hoy) {
    candidato = diaClamp(hoy.getFullYear(), hoy.getMonth() + 1, diaObjetivo);
  }
  return Math.round((candidato - hoy) / 86400000);
}

export function formatDiasFaltantes(dias) {
  if (dias === 0) return "hoy";
  if (dias === 1) return "en 1 día";
  return `en ${dias} días`;
}
