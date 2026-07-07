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
