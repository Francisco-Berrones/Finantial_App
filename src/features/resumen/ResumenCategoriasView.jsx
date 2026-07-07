import { useMemo, useState } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fmt } from "../../shared/format";

const RANGOS = {
  semana: { label: "Esta semana", dias: 7 },
  mes: { label: "Este mes", dias: 30 },
  "3_meses": { label: "Últimos 3 meses", dias: 90 },
  "6_meses": { label: "Últimos 6 meses", dias: 180 },
};

const GASTO_COLOR = "#A8412B";

function dentroDeRango(fechaIso, rango) {
  const fecha = new Date(fechaIso);
  const limite = new Date(Date.now() - RANGOS[rango].dias * 86400000);
  return fecha >= limite;
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

  const datos = useMemo(() => {
    const gastos = movimientos.filter(
      (m) => (m.tipo_accion === "gasto_credito" || m.tipo_accion === "gasto_debito") && dentroDeRango(m.fecha, rango)
    );
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

  return (
    <div>
      <style>{`
        .resumen-tooltip { background: var(--paper-card); border: 1px solid var(--paper-line); border-radius: 6px; padding: 8px 10px; font-family: Figtree; font-size: 13px; }
      `}</style>

      <div className="nuevo-mov-header">
        <button className="nuevo-mov-back" data-testid="resumen-back-button" onClick={onBack}>
          <ChevronLeft size={22} />
        </button>
        <span className="nuevo-mov-title">Gasto por categoría</span>
      </div>

      <div className="nuevo-mov-body">
        <div className="select-wrapper">
          <select
            className="target-select"
            data-testid="resumen-rango-select"
            value={rango}
            onChange={(e) => setRango(e.target.value)}
          >
            {Object.entries(RANGOS).map(([key, meta]) => (
              <option key={key} value={key}>{meta.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="select-chevron" />
        </div>

        {datos.length === 0 ? (
          <div className="mov-sub" data-testid="resumen-empty-state" style={{ padding: "20px 0" }}>
            No hay gastos categorizados en este periodo.
          </div>
        ) : (
          <>
            <div className="summary-box credito" style={{ marginBottom: 20 }}>
              <div className="summary-label">Total del periodo</div>
              <div className="summary-value mono">{fmt(totalPeriodo)}</div>
            </div>

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
                    tick={{ fontSize: 12, fill: "var(--ink-soft)" }}
                  />
                  <Tooltip content={<TooltipGasto />} cursor={{ fill: "var(--paper-line)", opacity: 0.3 }} />
                  <Bar dataKey="total" fill={GASTO_COLOR} radius={[0, 4, 4, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
