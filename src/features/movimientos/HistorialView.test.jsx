import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HistorialView from "./HistorialView";
import { fmtDiaLargo } from "../../shared/format";

describe("HistorialView", () => {
  const cuentas = [{ id: "cuenta-1", nombre: "Cuenta Nómina" }];
  const tarjetas = [{ id: "tarjeta-1", nombre: "Oro", banco: "Banorte" }];
  const movimientos = [
    { id: 10, tipo_accion: "ingreso_cuenta", target_id: "cuenta-1", target_nombre: "Cuenta Nómina", fecha: new Date().toISOString(), monto: 100, nota: "" },
    { id: 11, tipo_accion: "gasto_credito", target_id: "tarjeta-1", target_nombre: "Oro", fecha: new Date().toISOString(), monto: 50, nota: "" },
  ];

  it("shows all movimientos by default", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    const lista = within(screen.getByTestId("historial-mov-list"));
    expect(lista.getByText(/Ingreso/)).toBeInTheDocument();
    expect(lista.getByText(/Gasto con crédito/)).toBeInTheDocument();
  });

  it("filters by Gastos / Ingresos", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByTestId("historial-chip-tipo-ingresos"));
    const lista = within(screen.getByTestId("historial-mov-list"));
    expect(lista.getByText(/Ingreso/)).toBeInTheDocument();
    expect(lista.queryByText(/Gasto con crédito/)).not.toBeInTheDocument();
  });

  it("toggles a tipo chip off when clicked again", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByTestId("historial-chip-tipo-ingresos"));
    fireEvent.click(screen.getByTestId("historial-chip-tipo-ingresos"));
    const lista = within(screen.getByTestId("historial-mov-list"));
    expect(lista.getByText(/Ingreso/)).toBeInTheDocument();
    expect(lista.getByText(/Gasto con crédito/)).toBeInTheDocument();
  });

  it("filters by cuenta/tarjeta chip", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByTestId("historial-chip-target-tarjeta-1"));
    const lista = within(screen.getByTestId("historial-mov-list"));
    expect(lista.getByText(/Gasto con crédito/)).toBeInTheDocument();
    expect(lista.queryByText(/Ingreso/)).not.toBeInTheDocument();
  });

  it("shows a no-match message when filters exclude everything", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByTestId("historial-chip-tipo-gastos"));
    fireEvent.click(screen.getByTestId("historial-chip-target-cuenta-1"));
    expect(screen.getByText("No hay movimientos que coincidan con estos filtros.")).toBeInTheDocument();
  });

  it("filters by búsqueda text matching nota, cuenta/tarjeta or categoría", () => {
    const movimientosConNota = [
      ...movimientos,
      { id: 13, tipo_accion: "gasto_debito", target_id: "cuenta-1", target_nombre: "Cuenta Nómina", fecha: new Date().toISOString(), monto: 200, nota: "Café con Ana" },
    ];
    render(<HistorialView movimientos={movimientosConNota} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.change(screen.getByTestId("historial-busqueda-input"), { target: { value: "café" } });
    const lista = within(screen.getByTestId("historial-mov-list"));
    expect(lista.getByText("Café con Ana")).toBeInTheDocument();
    expect(lista.queryByText(/Gasto con crédito/)).not.toBeInTheDocument();
  });

  it("includes pago_tarjeta movimientos funded from a cuenta when filtering by that cuenta", () => {
    const movimientosConOrigen = [
      ...movimientos,
      {
        id: 12,
        tipo_accion: "pago_tarjeta",
        target_id: "tarjeta-1",
        target_nombre: "Oro",
        origen_cuenta_id: "cuenta-1",
        origen_cuenta_nombre: "Cuenta Nómina",
        fecha: new Date().toISOString(),
        monto: 500,
        nota: "",
      },
    ];
    render(<HistorialView movimientos={movimientosConOrigen} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByTestId("historial-chip-target-cuenta-1"));
    const lista = within(screen.getByTestId("historial-mov-list"));
    expect(lista.getByText(/Ingreso/)).toBeInTheDocument();
    expect(lista.getByText(/Pago a tarjeta/)).toBeInTheDocument();
    expect(lista.queryByText(/Gasto con crédito/)).not.toBeInTheDocument();
  });

  it("groups movimientos under day headers, with older dates showing a full date", () => {
    const movimientosDeDosDias = [
      { id: 20, tipo_accion: "ingreso_cuenta", target_id: "cuenta-1", target_nombre: "Cuenta Nómina", fecha: new Date().toISOString(), monto: 100, nota: "" },
      { id: 21, tipo_accion: "gasto_credito", target_id: "tarjeta-1", target_nombre: "Oro", fecha: "2026-06-20T12:00:00Z", monto: 50, nota: "" },
    ];
    render(<HistorialView movimientos={movimientosDeDosDias} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    expect(screen.getByText(new RegExp(`^Hoy,`))).toBeInTheDocument();
    expect(screen.getByText(fmtDiaLargo(movimientosDeDosDias[1].fecha))).toBeInTheDocument();
  });

  it("shows the balance card totals for the current month", () => {
    const hoy = new Date().toISOString();
    const movimientosDelMes = [
      { id: 30, tipo_accion: "ingreso_cuenta", target_id: "cuenta-1", target_nombre: "Cuenta Nómina", fecha: hoy, monto: 1000, nota: "" },
      { id: 31, tipo_accion: "gasto_credito", target_id: "tarjeta-1", target_nombre: "Oro", fecha: hoy, monto: 300, nota: "" },
    ];
    render(<HistorialView movimientos={movimientosDelMes} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    expect(screen.getByText("$1,000.00")).toBeInTheDocument();
    expect(screen.getByText("$300.00")).toBeInTheDocument();
    expect(screen.getByText("$700.00")).toBeInTheDocument();
  });
});
