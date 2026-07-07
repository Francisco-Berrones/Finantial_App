import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HistorialView from "./HistorialView";
import { fmtMesAno } from "../../shared/format";

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

  it("filters by tipo de movimiento", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.change(screen.getByTestId("historial-filtro-tipo"), { target: { value: "ingreso_cuenta" } });
    const lista = within(screen.getByTestId("historial-mov-list"));
    expect(lista.getByText(/Ingreso/)).toBeInTheDocument();
    expect(lista.queryByText(/Gasto con crédito/)).not.toBeInTheDocument();
  });

  it("filters by cuenta/tarjeta target", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.change(screen.getByTestId("historial-filtro-target"), { target: { value: "tarjeta-1" } });
    const lista = within(screen.getByTestId("historial-mov-list"));
    expect(lista.getByText(/Gasto con crédito/)).toBeInTheDocument();
    expect(lista.queryByText(/Ingreso/)).not.toBeInTheDocument();
  });

  it("shows a no-match message when filters exclude everything", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.change(screen.getByTestId("historial-filtro-tipo"), { target: { value: "gasto_credito" } });
    fireEvent.change(screen.getByTestId("historial-filtro-target"), { target: { value: "cuenta-1" } });
    expect(screen.getByText("No hay movimientos que coincidan con estos filtros.")).toBeInTheDocument();
  });

  it("only offers tarjetas as target options when a tarjeta-based tipo is selected", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.change(screen.getByTestId("historial-filtro-tipo"), { target: { value: "gasto_credito" } });
    const targetSelect = screen.getByTestId("historial-filtro-target");
    expect(screen.getByText("Oro · Banorte")).toBeInTheDocument();
    expect(within(targetSelect).queryByText("Cuenta Nómina")).not.toBeInTheDocument();
  });

  it("resets the target filter when the tipo filter changes", () => {
    render(<HistorialView movimientos={movimientos} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    fireEvent.change(screen.getByTestId("historial-filtro-target"), { target: { value: "tarjeta-1" } });
    fireEvent.change(screen.getByTestId("historial-filtro-tipo"), { target: { value: "ingreso_cuenta" } });
    expect(screen.getByTestId("historial-filtro-target").value).toBe("todos");
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
    fireEvent.change(screen.getByTestId("historial-filtro-target"), { target: { value: "cuenta-1" } });
    const lista = within(screen.getByTestId("historial-mov-list"));
    expect(lista.getByText(/Ingreso/)).toBeInTheDocument();
    expect(lista.getByText(/Pago a tarjeta/)).toBeInTheDocument();
    expect(lista.queryByText(/Gasto con crédito/)).not.toBeInTheDocument();
  });

  it("groups movimientos under a month/year header", () => {
    const movimientosDeDosMeses = [
      { id: 20, tipo_accion: "ingreso_cuenta", target_id: "cuenta-1", target_nombre: "Cuenta Nómina", fecha: "2026-07-05T00:00:00Z", monto: 100, nota: "" },
      { id: 21, tipo_accion: "gasto_credito", target_id: "tarjeta-1", target_nombre: "Oro", fecha: "2026-06-20T00:00:00Z", monto: 50, nota: "" },
    ];
    render(<HistorialView movimientos={movimientosDeDosMeses} cuentas={cuentas} tarjetas={tarjetas} onDelete={vi.fn()} />);
    expect(screen.getByText(fmtMesAno(movimientosDeDosMeses[0].fecha))).toBeInTheDocument();
    expect(screen.getByText(fmtMesAno(movimientosDeDosMeses[1].fecha))).toBeInTheDocument();
  });
});
