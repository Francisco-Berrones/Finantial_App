export const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(n) || 0
  );

export const fmtFecha = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

// Para columnas `date` de Postgres ("YYYY-MM-DD", sin hora/zona) -- a diferencia
// de fmtFecha, esto NUNCA debe usar `new Date(iso)` directo: ese constructor
// interpreta la cadena como medianoche UTC, y en zonas horarias negativas
// (como México) el día mostrado se corre uno hacia atrás. Se parsean los
// componentes a mano para construir una fecha en hora LOCAL.
export const fmtFechaCorta = (isoDate) => {
  if (!isoDate) return null;
  const [anio, mes, dia] = isoDate.split("-").map(Number);
  const d = new Date(anio, mes - 1, dia);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

export const fmtMesAno = (iso) => {
  const d = new Date(iso);
  const texto = d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

export const fmtHoraCorta = (iso) =>
  new Date(iso).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", hour12: true });

export const fmtDiaCorto = (iso) => {
  const d = new Date(iso);
  const mes = d.toLocaleDateString("es-MX", { month: "short" }).replace(".", "");
  return `${d.getDate()} ${mes.charAt(0).toUpperCase() + mes.slice(1)}`;
};

export const fmtDiaLargo = (iso) => {
  const d = new Date(iso);
  const mes = d.toLocaleDateString("es-MX", { month: "long" });
  return `${d.getDate()} ${mes.charAt(0).toUpperCase() + mes.slice(1)}`;
};
