import { useMemo, useState } from "react";
import { ArrowLeft, BarChart2, PieChart as PieChartIcon, TrendingDown, TrendingUp } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fmt } from "../../shared/format";
import { iconoPorCategoria } from "../../shared/categoriaIconos";

const RANGOS = {
  dia: { label: "Hoy" },
  semana: { label: "Esta semana", dias: 7 },
  mes: { label: "Este mes", dias: 30 },
  "3_meses": { label: "Últimos 3 meses", dias: 90 },
  "6_meses": { label: "Últimos 6 meses", dias: 180 },
  año: { label: "Este año" },
};

// Derivados de las dos familias de color de la marca (azul marino de primary-container/
// secondary, y dorado de tertiary/on-tertiary-container) -- la paleta de marca tal cual
// (#131b2e, #d5e3fd, #dae2fd, #fcdeb5...) es demasiado apagada/parecida entre sí para
// distinguir categorías (falló la validación de contraste y de daltonismo dos veces).
// Estos 4 pasos, más saturados dentro de las mismas familias, sí pasan la validación
// "all-pairs" (cualquier par puede terminar adyacente en un pastel):
// `node scripts/validate_palette.js "#2A5CAA,#A8681E,#5C8FD6,#D69A3C" --pairs all`
// Por eso el pastel limita a 4 categorías + "Otros" (gris neutro).
const COLOR_CATEGORIAS = ["#2A5CAA", "#A8681E", "#5C8FD6", "#D69A3C"];
const COLOR_OTROS = "#C6C6CD";
const COLOR_GASTO = "#131B2E";

function esGasto(m) {
  return m.tipo_accion === "gasto_credito" || m.tipo_accion === "gasto_debito";
}

function dentroDeRango(fechaIso, rango) {
  const fecha = new Date(fechaIso);
  const ahora = new Date();
  if (rango === "dia") {
    return fecha.getFullYear() === ahora.getFullYear() && fecha.getMonth() === ahora.getMonth() && fecha.getDate() === ahora.getDate();
  }
  if (rango === "año") {
    return fecha.getFullYear() === ahora.getFullYear();
  }
  const limite = new Date(Date.now() - RANGOS[rango].dias * 86400000);
  return fecha >= limite;
}

function dentroDeRangoAnterior(fechaIso, rango) {
  const fecha = new Date(fechaIso);
  const ahora = new Date();
  if (rango === "dia") {
    const ayer = new Date(ahora);
    ayer.setDate(ayer.getDate() - 1);
    return fecha.getFullYear() === ayer.getFullYear() && fecha.getMonth() === ayer.getMonth() && fecha.getDate() === ayer.getDate();
  }
  if (rango === "año") {
    return fecha.getFullYear() === ahora.getFullYear() - 1;
  }
  const dias = RANGOS[rango].dias;
  const finAnterior = new Date(Date.now() - dias * 86400000);
  const inicioAnterior = new Date(Date.now() - dias * 2 * 86400000);
  return fecha >= inicioAnterior && fecha < finAnterior;
}

function calcularPrevisionMes(movimientos) {
  const ahora = new Date();
  const diaActual = ahora.getDate();
  const diasEnMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
  const totalMes = movimientos
    .filter((m) => esGasto(m))
    .filter((m) => {
      const f = new Date(m.fecha);
      return f.getFullYear() === ahora.getFullYear() && f.getMonth() === ahora.getMonth();
    })
    .reduce((s, m) => s + Number(m.monto), 0);
  if (diaActual === 0 || totalMes === 0) return null;
  return (totalMes / diaActual) * diasEnMes;
}

function TooltipGasto({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { nombre, total } = payload[0].payload;
  return (
    <div className="resumen-tooltip">
      <strong>{nombre}</strong>
      <div>{fmt(total)}</div>
    </div>
  );
}

export default function ResumenCategoriasView({ movimientos, onBack }) {
  const [rango, setRango] = useState("mes");
  const [tipoChart, setTipoChart] = useState("barras");

  const datos = useMemo(() => {
    const gastos = movimientos.filter((m) => esGasto(m) && dentroDeRango(m.fecha, rango));
    const porCategoria = {};
    gastos.forEach((m) => {
      const nombre = m.categoria?.nombre || "Sin categoría";
      porCategoria[nombre] = (porCategoria[nombre] || 0) + Number(m.monto);
    });
    return Object.entries(porCategoria)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total);
  }, [movimientos, rango]);

  const totalPeriodo = datos.reduce((s, d) => s + d.total, 0);

  const totalAnterior = useMemo(() => {
    return movimientos.filter((m) => esGasto(m) && dentroDeRangoAnterior(m.fecha, rango)).reduce((s, m) => s + Number(m.monto), 0);
  }, [movimientos, rango]);
  const cambioPct = totalAnterior > 0 ? ((totalPeriodo - totalAnterior) / totalAnterior) * 100 : null;

  const prevision = rango === "mes" ? calcularPrevisionMes(movimientos) : null;

  const datosConColor = datos.map((d, i) => ({ ...d, color: i < COLOR_CATEGORIAS.length ? COLOR_CATEGORIAS[i] : COLOR_OTROS }));

  const datosPastel = useMemo(() => {
    if (datosConColor.length <= 4) return datosConColor;
    const top4 = datosConColor.slice(0, 4);
    const restoTotal = datosConColor.slice(4).reduce((s, d) => s + d.total, 0);
    return [...top4, { nombre: "Otros", total: restoTotal, color: COLOR_OTROS }];
  }, [datosConColor]);

  return (
    <div className="resumen-nuevo-root">
      <style>{`
        .resumen-nuevo-root {
          --bg: #F7F9FB; --surface: #FFFFFF; --surface-hi: #E0E3E5; --surface-low: #F2F4F6;
          --primary: #000000; --on-primary: #FFFFFF;
          --secondary-container: #D5E3FD; --on-secondary-container: #57657B;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E;
          --outline: #76777D; --outline-variant: #C6C6CD;
          --income: #1B5E20; --expense: #BA1A1A;
          min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column;
          background: var(--bg); font-family: Inter, sans-serif; color: var(--on-surface);
        }
        .resumen-header { flex-shrink: 0; background: var(--surface); box-shadow: 0 1px 2px rgba(0,0,0,0.05); padding: 14px 12px; display: flex; align-items: center; gap: 8px; }
        .resumen-back { width: 40px; height: 40px; border-radius: 9999px; background: none; border: none; color: var(--primary); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .resumen-back:active { background: var(--surface-low); }
        .resumen-titulo { font-size: 18px; font-weight: 700; color: var(--primary); flex: 1; }
        .resumen-actualizado-pill { font-size: 12px; font-weight: 500; color: var(--on-surface-variant); background: var(--surface-hi); padding: 4px 12px; border-radius: 9999px; flex-shrink: 0; }

        .resumen-main { padding: 16px; }

        .resumen-rangos { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 16px; scrollbar-width: none; }
        .resumen-rangos::-webkit-scrollbar { display: none; }
        .resumen-rango-chip { flex-shrink: 0; white-space: nowrap; padding: 8px 16px; border-radius: 9999px; font-family: Inter, sans-serif; font-size: 13px; font-weight: 500; border: none; cursor: pointer; background: var(--surface-low); color: var(--on-surface-variant); }
        .resumen-rango-chip.active { background: var(--surface); color: var(--primary); box-shadow: 0 1px 3px rgba(0,0,0,0.12); }

        .resumen-chart-card { background: var(--surface); border: 1px solid var(--surface-low); border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(13,28,47,0.04); }
        .resumen-chart-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .resumen-chart-total-label { font-size: 13px; color: var(--on-surface-variant); margin: 0 0 4px; }
        .resumen-chart-total-valor { font-size: 32px; font-weight: 700; letter-spacing: -0.01em; color: var(--primary); margin: 0; }
        .resumen-chart-toggle { display: flex; gap: 2px; background: var(--surface-low); padding: 3px; border-radius: 8px; flex-shrink: 0; }
        .resumen-chart-toggle button { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; border-radius: 6px; background: transparent; color: var(--on-surface-variant); cursor: pointer; }
        .resumen-chart-toggle button.active { background: var(--surface); color: var(--primary); box-shadow: 0 1px 3px rgba(0,0,0,0.12); }

        .resumen-chart-footer { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--surface-low); flex-wrap: wrap; }
        .resumen-tendencia { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; }
        .resumen-tendencia.sube { color: var(--expense); }
        .resumen-tendencia.baja { color: var(--income); }
        .resumen-prevision { font-size: 13px; font-weight: 500; color: var(--on-secondary-container); }
        .resumen-prevision-nota { font-size: 11px; color: var(--outline); display: block; margin-top: 2px; }

        .resumen-tooltip { background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 6px; padding: 8px 10px; font-family: Inter, sans-serif; font-size: 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

        .resumen-seccion-titulo { font-size: 16px; font-weight: 600; color: var(--primary); margin: 0 4px 10px; }
        .resumen-cat-item { display: flex; align-items: center; gap: 12px; background: var(--surface); border: 1px solid var(--surface-low); border-radius: 12px; padding: 14px; margin-bottom: 8px; box-shadow: 0 2px 8px rgba(13,28,47,0.04); }
        .resumen-cat-icono { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .resumen-cat-body { flex: 1; min-width: 0; }
        .resumen-cat-nombre { font-size: 15px; font-weight: 600; color: var(--on-surface); }
        .resumen-cat-right { text-align: right; flex-shrink: 0; }
        .resumen-cat-monto { font-size: 16px; font-weight: 600; color: var(--primary); }
        .resumen-cat-pct { font-size: 12px; color: var(--outline); margin-top: 2px; }

        .resumen-empty { color: var(--on-surface-variant); font-size: 14px; text-align: center; padding: 40px 16px; }
      `}</style>

      <div className="resumen-header">
        <button className="resumen-back" data-testid="resumen-back-button" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <span className="resumen-titulo">Análisis avanzado</span>
        <span className="resumen-actualizado-pill">Actualizado hoy</span>
      </div>

      <div className="resumen-main">
        <div className="resumen-rangos">
          {Object.entries(RANGOS).map(([key, meta]) => (
            <button
              key={key}
              className={`resumen-rango-chip ${rango === key ? "active" : ""}`}
              data-testid={`resumen-rango-${key}`}
              onClick={() => setRango(key)}
            >
              {meta.label}
            </button>
          ))}
        </div>

        {datos.length === 0 ? (
          <div className="resumen-empty" data-testid="resumen-empty-state">No hay gastos categorizados en este periodo.</div>
        ) : (
          <>
            <div className="resumen-chart-card">
              <div className="resumen-chart-head">
                <div>
                  <p className="resumen-chart-total-label">Total gastos</p>
                  <p className="resumen-chart-total-valor mono">{fmt(totalPeriodo)}</p>
                </div>
                <div className="resumen-chart-toggle">
                  <button
                    className={tipoChart === "barras" ? "active" : ""}
                    data-testid="resumen-chart-tipo-barras"
                    onClick={() => setTipoChart("barras")}
                    title="Barras"
                  >
                    <BarChart2 size={16} />
                  </button>
                  <button
                    className={tipoChart === "pastel" ? "active" : ""}
                    data-testid="resumen-chart-tipo-pastel"
                    onClick={() => setTipoChart("pastel")}
                    title="Pastel"
                  >
                    <PieChartIcon size={16} />
                  </button>
                </div>
              </div>

              {tipoChart === "barras" ? (
                <div data-testid="resumen-chart" style={{ width: "100%", height: Math.max(160, datos.length * 44) }}>
                  <ResponsiveContainer>
                    <BarChart data={datos} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="nombre"
                        width={110}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "#76777D", fontFamily: "Inter" }}
                      />
                      <Tooltip content={<TooltipGasto />} cursor={{ fill: "#F2F4F6" }} />
                      <Bar dataKey="total" fill={COLOR_GASTO} radius={[0, 4, 4, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div data-testid="resumen-chart" style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={datosPastel} dataKey="total" nameKey="nombre" innerRadius={50} outerRadius={85} paddingAngle={2}>
                        {datosPastel.map((d) => (
                          <Cell key={d.nombre} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<TooltipGasto />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {(cambioPct !== null || prevision !== null) && (
                <div className="resumen-chart-footer">
                  {cambioPct !== null && (
                    <div className={`resumen-tendencia ${cambioPct >= 0 ? "sube" : "baja"}`}>
                      {cambioPct >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                      {cambioPct >= 0 ? "+" : ""}{cambioPct.toFixed(1)}% vs. periodo anterior
                    </div>
                  )}
                  {prevision !== null && (
                    <div className="resumen-prevision">
                      Previsión fin de mes: {fmt(prevision)}
                      <span className="resumen-prevision-nota">Proyección simple (ritmo actual), no un pronóstico</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <h3 className="resumen-seccion-titulo">Distribución por categoría</h3>
            {datosConColor.map((d) => {
              const Icono = iconoPorCategoria(d.nombre);
              const pct = totalPeriodo > 0 ? (d.total / totalPeriodo) * 100 : 0;
              return (
                <div className="resumen-cat-item" key={d.nombre}>
                  <div className="resumen-cat-icono" style={{ background: `${d.color}26`, color: d.color }}>
                    <Icono size={20} />
                  </div>
                  <div className="resumen-cat-body">
                    <div className="resumen-cat-nombre">{d.nombre}</div>
                  </div>
                  <div className="resumen-cat-right">
                    <div className="resumen-cat-monto mono">{fmt(d.total)}</div>
                    <div className="resumen-cat-pct">{pct.toFixed(0)}% del total</div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
