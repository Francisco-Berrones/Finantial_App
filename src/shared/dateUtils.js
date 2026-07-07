export function diasHasta(diaObjetivo) {
  if (!diaObjetivo) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let candidato = new Date(hoy.getFullYear(), hoy.getMonth(), diaObjetivo);
  candidato.setHours(0, 0, 0, 0);
  if (candidato < hoy) {
    candidato = new Date(hoy.getFullYear(), hoy.getMonth() + 1, diaObjetivo);
  }
  return Math.round((candidato - hoy) / 86400000);
}

export function formatDiasFaltantes(dias) {
  if (dias === 0) return "hoy";
  if (dias === 1) return "en 1 día";
  return `en ${dias} días`;
}
