export const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(n) || 0
  );

export const fmtFecha = (iso) => {
  const d = new Date(iso);
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
