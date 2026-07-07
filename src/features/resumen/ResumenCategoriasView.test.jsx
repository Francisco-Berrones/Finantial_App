import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ResumenCategoriasView from "./ResumenCategoriasView";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ data }) => (
    <div data-testid="mock-barchart">
      {data.map((d) => (
        <div key={d.nombre} data-testid="mock-bar-item">{d.nombre}: {d.total}</div>
      ))}
    </div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

function fechaHaceDias(dias) {
  return new Date(Date.now() - dias * 86400000).toISOString();
}

describe("ResumenCategoriasView", () => {
  const movimientos = [
    { id: 1, tipo_accion: "gasto_credito", monto: 300, categoria: { nombre: "Comida" }, fecha: fechaHaceDias(2) },
    { id: 2, tipo_accion: "gasto_debito", monto: 100, categoria: { nombre: "Comida" }, fecha: fechaHaceDias(3) },
    { id: 3, tipo_accion: "gasto_credito", monto: 500, categoria: { nombre: "Transporte" }, fecha: fechaHaceDias(1) },
    { id: 4, tipo_accion: "gasto_credito", monto: 999, categoria: null, fecha: fechaHaceDias(150) },
    { id: 5, tipo_accion: "ingreso_cuenta", monto: 1000, categoria: null, fecha: fechaHaceDias(1) },
  ];

  it("shows the empty state when there are no gastos in range", () => {
    render(<ResumenCategoriasView movimientos={[]} onBack={vi.fn()} />);
    expect(screen.getByTestId("resumen-empty-state")).toBeInTheDocument();
  });

  it("aggregates gasto_credito and gasto_debito by categoria, ordered by total descending", () => {
    render(<ResumenCategoriasView movimientos={movimientos} onBack={vi.fn()} />);
    const items = screen.getAllByTestId("mock-bar-item").map((n) => n.textContent);
    expect(items).toEqual(["Transporte: 500", "Comida: 400"]);
  });

  it("excludes movimientos outside the selected range and ingresos", () => {
    render(<ResumenCategoriasView movimientos={movimientos} onBack={vi.fn()} />);
    expect(screen.queryByText(/Sin categoría/)).not.toBeInTheDocument();
  });

  it("recomputes when the rango filter changes", () => {
    render(<ResumenCategoriasView movimientos={movimientos} onBack={vi.fn()} />);
    fireEvent.change(screen.getByTestId("resumen-rango-select"), { target: { value: "6_meses" } });
    const items = screen.getAllByTestId("mock-bar-item").map((n) => n.textContent);
    expect(items).toContain("Sin categoría: 999");
  });

  it("calls onBack when the back button is clicked", () => {
    const onBack = vi.fn();
    render(<ResumenCategoriasView movimientos={movimientos} onBack={onBack} />);
    fireEvent.click(screen.getByTestId("resumen-back-button"));
    expect(onBack).toHaveBeenCalled();
  });
});
