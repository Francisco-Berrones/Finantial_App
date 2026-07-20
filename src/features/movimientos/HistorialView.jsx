import { useState } from "react";
import { Search, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import MovimientoCard from "./MovimientoCard";
import { fmt, fmtMesAno, fmtDiaCorto, fmtDiaLargo } from "../../shared/format";

const TIPOS_GASTO = ["gasto_credito", "gasto_debito", "pago_tarjeta"];

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

function agruparPorDia(movimientos) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);

  const grupos = [];
  let actual = null;
  movimientos.forEach((m) => {
    const fecha = new Date(m.fecha);
    const soloFecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    let etiqueta;
    if (soloFecha.getTime() === hoy.getTime()) etiqueta = `Hoy, ${fmtDiaCorto(m.fecha)}`;
    else if (soloFecha.getTime() === ayer.getTime()) etiqueta = `Ayer, ${fmtDiaCorto(m.fecha)}`;
    else etiqueta = fmtDiaLargo(m.fecha);

    if (!actual || actual.etiqueta !== etiqueta) {
      actual = { etiqueta, items: [] };
      grupos.push(actual);
    }
    actual.items.push(m);
  });
  return grupos;
}

export default function HistorialView({ movimientos, cuentas, tarjetas, categorias = [], onDelete }) {
  const [busqueda, setBusqueda] = useState("");
  const [targetFiltro, setTargetFiltro] = useState("todos");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [fechaFiltro, setFechaFiltro] = useState("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todos");

  const ahora = new Date();
  const movimientosMes = movimientos.filter((m) => {
    const f = new Date(m.fecha);
    return f.getFullYear() === ahora.getFullYear() && f.getMonth() === ahora.getMonth();
  });
  const totalIngresos = movimientosMes
    .filter((m) => m.tipo_accion === "ingreso_cuenta")
    .reduce((s, m) => s + Number(m.monto), 0);
  const totalGastos = movimientosMes
    .filter((m) => TIPOS_GASTO.includes(m.tipo_accion))
    .reduce((s, m) => s + Number(m.monto), 0);
  const balanceMes = totalIngresos - totalGastos;

  const targets = [
    ...cuentas.map((c) => ({ value: c.id, label: c.nombre })),
    ...tarjetas.map((t) => ({ value: t.id, label: t.banco ? `${t.nombre} · ${t.banco}` : t.nombre })),
  ];

  const toggleTipo = (valor) => setTipoFiltro((actual) => (actual === valor ? "todos" : valor));

  const movimientosFiltrados = movimientos.filter((m) => {
    if (targetFiltro !== "todos" && m.target_id !== targetFiltro && m.origen_cuenta_id !== targetFiltro) return false;
    if (tipoFiltro === "gastos" && !TIPOS_GASTO.includes(m.tipo_accion)) return false;
    if (tipoFiltro === "ingresos" && m.tipo_accion !== "ingreso_cuenta") return false;
    if (categoriaFiltro !== "todos" && m.categoria_id !== categoriaFiltro) return false;
    if (!fechaCumpleFiltro(m.fecha, fechaFiltro)) return false;
    if (busqueda.trim()) {
      const texto = busqueda.trim().toLowerCase();
      const campos = [m.nota, m.target_nombre, m.categoria?.nombre].filter(Boolean).join(" ").toLowerCase();
      if (!campos.includes(texto)) return false;
    }
    return true;
  });

  const grupos = agruparPorDia(movimientosFiltrados);

  return (
    <div className="historial-nuevo-root">
      <style>{`
        .historial-nuevo-root {
          --bg: #F7F9FB; --surface: #FFFFFF; --surface-hi: #E0E3E5; --surface-low: #F2F4F6;
          --primary: #000000; --on-primary: #FFFFFF;
          --secondary-container: #D5E3FD; --on-secondary-container: #57657B;
          --primary-fixed: #DAE2FD; --primary-container: #131B2E;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E;
          --outline: #76777D; --outline-variant: #C6C6CD;
          --income: #1B5E20; --expense: #BA1A1A;
          font-family: Inter, sans-serif; color: var(--on-surface); padding: 16px;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .app-root[data-theme="dark"] .historial-nuevo-root {
          --bg: #101317; --surface: #1B1F23; --surface-hi: #262B30; --surface-low: #15181B;
          --primary: #DAE2FD; --on-primary: #131B2E;
          --secondary-container: #3A4A63; --on-secondary-container: #B8C6E0;
          --primary-fixed: #3A4A63; --primary-container: #2A3550;
          --on-surface: #E2E2E6; --on-surface-variant: #C4C6D0;
          --outline: #8D9199; --outline-variant: #43474E;
          --income: #6DDD8C; --expense: #FFB4AB;
        }
        .historial-buscar { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; }
        .historial-buscar input { flex: 1; border: none; background: transparent; font-family: Inter, sans-serif; font-size: 16px; color: var(--on-surface); outline: none; }
        .historial-buscar input::placeholder { color: var(--outline); }

        .historial-balance { background: var(--surface); border: 1px solid var(--surface-low); border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(13,28,47,0.04); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 12px; }
        .historial-balance-left { min-width: 0; flex: 1 1 auto; }
        .historial-balance-label { font-size: 13px; font-weight: 500; color: var(--on-surface-variant); margin: 0 0 4px; }
        .historial-balance-valor { font-size: clamp(22px, 7vw, 32px); font-weight: 700; letter-spacing: -0.01em; margin: 0; color: var(--primary); overflow-wrap: anywhere; }
        .historial-balance-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; min-width: 0; flex-shrink: 0; }
        .historial-balance-pill { background: var(--secondary-container); color: var(--on-secondary-container); font-size: 12px; font-weight: 500; padding: 4px 12px; border-radius: 9999px; white-space: nowrap; flex-shrink: 0; }
        .historial-balance-flujos { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
        @media (max-width: 420px) {
          .historial-balance-right { flex: 1 1 100%; flex-direction: row; align-items: center; justify-content: space-between; }
          .historial-balance-flujos { justify-content: flex-end; }
        }
        .historial-balance-flujo { display: flex; align-items: center; gap: 2px; font-size: 13px; font-weight: 600; white-space: nowrap; }
        .historial-balance-flujo.in { color: var(--income); }
        .historial-balance-flujo.out { color: var(--expense); }

        .historial-chips-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 8px; scrollbar-width: none; }
        .historial-chips-row::-webkit-scrollbar { display: none; }
        .historial-chip { flex-shrink: 0; white-space: nowrap; padding: 8px 16px; border-radius: 9999px; font-family: Inter, sans-serif; font-size: 13px; font-weight: 500; border: none; cursor: pointer; background: var(--surface-hi); color: var(--on-surface-variant); }
        .historial-chip.active { background: var(--primary); color: var(--on-primary); }

        .historial-row2 { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 20px; }
        .historial-row2-chips { display: flex; gap: 8px; overflow-x: auto; flex: 1; scrollbar-width: none; }
        .historial-row2-chips::-webkit-scrollbar { display: none; }
        .historial-fecha-select-wrap { position: relative; flex-shrink: 0; }
        .historial-fecha-select {
          appearance: none; display: flex; align-items: center; gap: 6px;
          padding: 8px 30px 8px 34px; border: 1px solid var(--outline-variant); border-radius: 10px;
          background: var(--surface); color: var(--on-surface); font-family: Inter, sans-serif; font-size: 13px; font-weight: 500;
        }
        .historial-fecha-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--on-surface-variant); pointer-events: none; }

        .historial-dia-titulo { font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--outline); margin: 0 4px 8px; }
        .historial-dia-grupo { margin-bottom: 20px; }

        .historial-empty { color: var(--on-surface-variant); font-size: 14px; text-align: center; padding: 40px 16px; }
      `}</style>

      <div className="historial-buscar">
        <Search size={18} color="var(--outline)" />
        <input
          placeholder="Buscar movimientos..."
          data-testid="historial-busqueda-input"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="historial-balance">
        <div className="historial-balance-left">
          <p className="historial-balance-label">Balance total este mes</p>
          <p className="historial-balance-valor mono">{fmt(balanceMes)}</p>
        </div>
        <div className="historial-balance-right">
          <span className="historial-balance-pill">{fmtMesAno(ahora.toISOString())}</span>
          <div className="historial-balance-flujos">
            <span className="historial-balance-flujo in"><ArrowUp size={13} />{fmt(totalIngresos)}</span>
            <span className="historial-balance-flujo out"><ArrowDown size={13} />{fmt(totalGastos)}</span>
          </div>
        </div>
      </div>

      <div className="historial-chips-row">
        <button
          className={`historial-chip ${targetFiltro === "todos" ? "active" : ""}`}
          data-testid="historial-chip-target-todos"
          onClick={() => setTargetFiltro("todos")}
        >
          Todas las cuentas
        </button>
        {targets.map((t) => (
          <button
            key={t.value}
            className={`historial-chip ${targetFiltro === t.value ? "active" : ""}`}
            data-testid={`historial-chip-target-${t.value}`}
            onClick={() => setTargetFiltro(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {categorias.length > 0 && (
        <div className="historial-chips-row">
          <button
            className={`historial-chip ${categoriaFiltro === "todos" ? "active" : ""}`}
            data-testid="historial-chip-categoria-todos"
            onClick={() => setCategoriaFiltro("todos")}
          >
            Todas las categorías
          </button>
          {categorias.map((c) => (
            <button
              key={c.id}
              className={`historial-chip ${categoriaFiltro === c.id ? "active" : ""}`}
              data-testid={`historial-chip-categoria-${c.id}`}
              onClick={() => setCategoriaFiltro((actual) => (actual === c.id ? "todos" : c.id))}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="historial-row2">
        <div className="historial-row2-chips">
          <button
            className={`historial-chip ${tipoFiltro === "gastos" ? "active" : ""}`}
            data-testid="historial-chip-tipo-gastos"
            onClick={() => toggleTipo("gastos")}
          >
            Gastos
          </button>
          <button
            className={`historial-chip ${tipoFiltro === "ingresos" ? "active" : ""}`}
            data-testid="historial-chip-tipo-ingresos"
            onClick={() => toggleTipo("ingresos")}
          >
            Ingresos
          </button>
        </div>
        <div className="historial-fecha-select-wrap">
          <Calendar size={14} className="historial-fecha-icon" />
          <select
            className="historial-fecha-select"
            data-testid="historial-filtro-fecha"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
          >
            <option value="todos">Todas las fechas</option>
            <option value="este_mes">Este mes</option>
            <option value="3_meses">Últimos 3 meses</option>
            <option value="6_meses">Últimos 6 meses</option>
          </select>
        </div>
      </div>

      {movimientos.length === 0 ? (
        <div className="historial-empty">No hay movimientos todavía.</div>
      ) : movimientosFiltrados.length === 0 ? (
        <div className="historial-empty">No hay movimientos que coincidan con estos filtros.</div>
      ) : (
        <div data-testid="historial-mov-list">
          {grupos.map((grupo) => (
            <div className="historial-dia-grupo" key={grupo.etiqueta}>
              <h3 className="historial-dia-titulo" data-testid={`historial-dia-${grupo.etiqueta}`}>{grupo.etiqueta}</h3>
              {grupo.items.map((m) => (
                <MovimientoCard key={m.id} movimiento={m} onDelete={onDelete} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
