import { useState } from "react";
import { ChevronDown } from "lucide-react";
import MovimientoRow from "./MovimientoRow";
import { ACCIONES } from "../../shared/constants";
import { fmtMesAno } from "../../shared/format";

function agruparPorMes(movimientos) {
  const grupos = [];
  let actual = null;
  movimientos.forEach((m) => {
    const clave = fmtMesAno(m.fecha);
    if (!actual || actual.clave !== clave) {
      actual = { clave, items: [] };
      grupos.push(actual);
    }
    actual.items.push(m);
  });
  return grupos;
}

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

  const targetTipo = tipoFiltro === "todos" ? null : ACCIONES[tipoFiltro].targetTipo;
  const targetOptions = [
    ...(targetTipo === "tarjeta" ? [] : cuentas.map((c) => ({ value: c.id, label: c.nombre }))),
    ...(targetTipo === "cuenta" ? [] : tarjetas.map((t) => ({ value: t.id, label: t.banco ? `${t.nombre} · ${t.banco}` : t.nombre }))),
  ];

  const handleTipoChange = (nuevoTipo) => {
    setTipoFiltro(nuevoTipo);
    setTargetFiltro("todos");
  };

  const movimientosFiltrados = movimientos.filter((m) => {
    if (tipoFiltro !== "todos" && m.tipo_accion !== tipoFiltro) return false;
    if (targetFiltro !== "todos" && m.target_id !== targetFiltro && m.origen_cuenta_id !== targetFiltro) return false;
    if (!fechaCumpleFiltro(m.fecha, fechaFiltro)) return false;
    return true;
  });

  const gruposPorMes = agruparPorMes(movimientosFiltrados);

  return (
    <div style={{ paddingTop: 16 }}>
      <div className="historial-filters">
        <div className="select-wrapper">
          <select
            className="target-select"
            data-testid="historial-filtro-tipo"
            value={tipoFiltro}
            onChange={(e) => handleTipoChange(e.target.value)}
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
            <option value="todos">
              {targetTipo === "tarjeta" ? "Todas las tarjetas" : targetTipo === "cuenta" ? "Todas las cuentas" : "Todas las cuentas y tarjetas"}
            </option>
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

      {movimientos.length === 0 ? (
        <div style={{ color: "var(--ink-soft)", fontSize: 14, padding: "20px 16px" }}>
          No hay movimientos todavía.
        </div>
      ) : movimientosFiltrados.length === 0 ? (
        <div style={{ color: "var(--ink-soft)", fontSize: 14, padding: "20px 16px" }}>
          No hay movimientos que coincidan con estos filtros.
        </div>
      ) : (
        gruposPorMes.map((grupo) => (
          <div key={grupo.clave}>
            <div className="section-title" data-testid={`historial-mes-${grupo.clave}`} style={{ margin: "8px 16px" }}>
              {grupo.clave}
            </div>
            <div className="mov-list">
              {grupo.items.map((m) => (
                <MovimientoRow key={m.id} movimiento={m} onDelete={onDelete} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
