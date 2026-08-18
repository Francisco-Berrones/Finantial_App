import { Car, Dumbbell, Film, Fuel, GraduationCap, HeartPulse, Heart, Home, Landmark, Package, Plane, Repeat, ShoppingBag, ShoppingCart, Stethoscope, Tag, Utensils, Wallet, Zap } from "lucide-react";

const ESTILOS = {
  comida: { icon: Utensils, bg: "#FFE4E1", color: "#B22222" },
  transporte: { icon: Car, bg: "#E0F2F1", color: "#00695C" },
  entretenimiento: { icon: Film, bg: "#F3E5F5", color: "#4A148C" },
  salud: { icon: HeartPulse, bg: "#E1F5FE", color: "#01579B" },
  servicios: { icon: Zap, bg: "#FFF3E0", color: "#E65100" },
  compras: { icon: ShoppingBag, bg: "#F1F8E9", color: "#33691E" },
  otros: { icon: Package, bg: "#ECEFF1", color: "#455A64" },
  deuda: { icon: Landmark, bg: "#E8EAF6", color: "#1A237E" },
  suscripciones: { icon: Repeat, bg: "#EDE7F6", color: "#5E35B1" },
  mandado: { icon: ShoppingCart, bg: "#FFF8E1", color: "#F9A825" },
  gasolina: { icon: Fuel, bg: "#FBE9E7", color: "#D84315" },
};

const DEFAULT_ESTILO = { icon: Tag, bg: "#F5F5F5", color: "#616161" };

export const ICONOS_DISPONIBLES = [
  { key: "home", label: "Hogar", icon: Home },
  { key: "restaurant", label: "Comida", icon: Utensils },
  { key: "directions_car", label: "Auto", icon: Car },
  { key: "shopping_bag", label: "Compras", icon: ShoppingBag },
  { key: "favorite", label: "Favorito", icon: Heart },
  { key: "fitness_center", label: "Ejercicio", icon: Dumbbell },
  { key: "medical_services", label: "Salud", icon: Stethoscope },
  { key: "flight", label: "Viajes", icon: Plane },
  { key: "school", label: "Escuela", icon: GraduationCap },
  { key: "payments", label: "Pagos", icon: Wallet },
  { key: "subscriptions", label: "Suscripciones", icon: Repeat },
  { key: "shopping_cart", label: "Mandado", icon: ShoppingCart },
  { key: "local_gas_station", label: "Gasolina", icon: Fuel },
];

const ICONOS_MAP = Object.fromEntries(ICONOS_DISPONIBLES.map((i) => [i.key, i.icon]));

export const COLORES_DISPONIBLES = ["#131B2E", "#3D5A80", "#C1666B", "#2E7D32", "#B8860B"];

export function estiloCategoria(categoria) {
  if (!categoria) return DEFAULT_ESTILO;
  const obj = typeof categoria === "string" ? { nombre: categoria } : categoria;
  if (obj.icono && obj.color && ICONOS_MAP[obj.icono]) {
    return { icon: ICONOS_MAP[obj.icono], bg: `${obj.color}26`, color: obj.color };
  }
  if (!obj.nombre) return DEFAULT_ESTILO;
  return ESTILOS[obj.nombre.trim().toLowerCase()] || DEFAULT_ESTILO;
}

export function iconoPorCategoria(nombreCategoria) {
  return estiloCategoria(nombreCategoria).icon;
}
