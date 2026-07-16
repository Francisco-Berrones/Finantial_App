const GRADIENTES = {
  banorte: "linear-gradient(135deg, #E8574A, #9E2B22)",
  revolut: "linear-gradient(135deg, #E4E4E4, #9A9A9A)",
  nu: "linear-gradient(135deg, #A855C9, #6B1FA0)",
};

export const GRADIENTE_DEFAULT = "linear-gradient(135deg, #E8CE85, #B8934A)";

export function gradienteBanco(banco) {
  const key = (banco || "").trim().toLowerCase();
  return GRADIENTES[key] || GRADIENTE_DEFAULT;
}
