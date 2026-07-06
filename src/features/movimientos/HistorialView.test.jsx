import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HistorialView from "./HistorialView";

describe("HistorialView", () => {
  const cuentas = [{ id: 1, nombre: "Cuenta Nómina" }];
  const tarjetas = [{ id: 2, nombre: "Oro", banco: "Banorte" }];
  const movimientos = [
    { id: 10, tipo_accion: "ingreso_cuenta", target_nombre: "Cuenta Nómina", fecha: new Date().toISOString(), monto: 100, nota: "" },
    { id: 11, tipo_accion: "gasto_credito", target_nombre: "Oro", fecha: new Date().toISOString(), monto: 50, nota: "" },
  ];

  it("shows all movimientos by default", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    expect(screen.getByText(/Ingreso/)).toBeInTheDocument();
    expect(screen.getByText(/Gasto con crédito/)).toBeInTheDocument();
  });

  it("filters by tipo de movimiento", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.change(screen.getByTestId("historial-filtro-tipo"), { target: { value: "ingreso_cuenta" } });
    expect(screen.getByText(/Ingreso/)).toBeInTheDocument();
    expect(screen.queryByText(/Gasto con crédito/)).not.toBeInTheDocument();
  });

  it("filters by cuenta/tarjeta target", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.change(screen.getByTestId("historial-filtro-target"), { target: { value: "Oro" } });
    expect(screen.getByText(/Gasto con crédito/)).toBeInTheDocument();
    expect(screen.queryByText(/Ingreso/)).not.toBeInTheDocument();
  });

  it("shows a no-match message when filters exclude everything", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.change(screen.getByTestId("historial-filtro-target"), { target: { value: "Cuenta Nómina" } });
    fireEvent.change(screen.getByTestId("historial-filtro-tipo"), { target: { value: "gasto_credito" } });
    expect(screen.getByText("No hay movimientos que coincidan con estos filtros.")).toBeInTheDocument();
  });
});
