import { useState } from "react";
import { ChevronDown } from "lucide-react";
import MovimientoRow from "./MovimientoRow";
import { ACCIONES } from "../../shared/constants";

function fechaCumpleFiltro(fechaIso, filtro) {
  if (filtro === "todos") return true;
  const fecha = new Date(fechaIso);
  const ahora = new Date();
  if (filtro === "este_mes") {
    return fecha.getFullYear() === ahora.getFullYear() && fecha.getMonth() === ahora.getMonth();
  }
  const meses = filtro === "3_meses" ? 3 : 6;
  const limite = new Date(ahora.getFullYear(), ahora.getMonth() - meses, ahora.getDate());
  return fecha >= limite;
}

export default function HistorialView({ movimientos, cuentas, tarjetas, onDelete }) {
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [targetFiltro, setTargetFiltro] = useState("todos");
  const [fechaFiltro, setFechaFiltro] = useState("todos");

  const targetOptions = [
    ...cuentas.map((c) => ({ value: c.nombre, label: c.nombre })),
    ...tarjetas.map((t) => ({ value: t.nombre, label: t.banco ? `${t.nombre} · ${t.banco}` : t.nombre })),
  ];

  const movimientosFiltrados = movimientos.filter((m) => {
    if (tipoFiltro !== "todos" && m.tipo_accion !== tipoFiltro) return false;
    if (targetFiltro !== "todos" && m.target_nombre !== targetFiltro) return false;
    if (!fechaCumpleFiltro(m.fecha, fechaFiltro)) return false;
    return true;
  });

  return (
    <div style={{ paddingTop: 16 }}>
      <div className="historial-filters">
        <div className="select-wrapper">
          <select
            className="target-select"
            data-testid="historial-filtro-tipo"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
          >
            <option value="todos">Todos los movimientos</option>
            {Object.entries(ACCIONES).map(([tipo, meta]) => (
              <option key={tipo} value={tipo}>{meta.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="select-chevron" />
        </div>

        <div className="select-wrapper">
          <select
            className="target-select"
            data-testid="historial-filtro-target"
            value={targetFiltro}
            onChange={(e) => setTargetFiltro(e.target.value)}
          >
            <option value="todos">Todas las cuentas y tarjetas</option>
            {targetOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="select-chevron" />
        </div>

        <div className="select-wrapper">
          <select
            className="target-select"
            data-testid="historial-filtro-fecha"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
          >
            <option value="todos">Todas las fechas</option>
            <option value="este_mes">Este mes</option>
            <option value="3_meses">Últimos 3 meses</option>
            <option value="6_meses">Últimos 6 meses</option>
          </select>
          <ChevronDown size={16} className="select-chevron" />
        </div>
      </div>

      <div className="mov-list">
        {movimientos.length === 0 ? (
          <div style={{ color: "var(--ink-soft)", fontSize: 14, padding: "20px 0" }}>
            No hay movimientos todavía.
          </div>
        ) : movimientosFiltrados.length === 0 ? (
          <div style={{ color: "var(--ink-soft)", fontSize: 14, padding: "20px 0" }}>
            No hay movimientos que coincidan con estos filtros.
          </div>
        ) : (
          movimientosFiltrados.map((m) => (
            <MovimientoRow key={m.id} movimiento={m} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
