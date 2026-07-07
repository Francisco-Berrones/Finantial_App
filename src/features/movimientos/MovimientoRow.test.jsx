import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MovimientoRow from "./MovimientoRow";

describe("MovimientoRow", () => {
  it("shows the origin cuenta for a pago_tarjeta funded from a cuenta", () => {
    const movimiento = {
      id: 1,
      tipo_accion: "pago_tarjeta",
      target_nombre: "Oro",
      origen_cuenta_id: "cuenta-1",
      origen_cuenta_nombre: "Cuenta Nómina",
      fecha: new Date().toISOString(),
      monto: 500,
      nota: "",
    };
    render(<MovimientoRow movimiento={movimiento} />);
    expect(screen.getByText(/Desde Cuenta Nómina/)).toBeInTheDocument();
  });

  it("shows 'efectivo/externo' for a pago_tarjeta with no origen cuenta", () => {
    const movimiento = {
      id: 2,
      tipo_accion: "pago_tarjeta",
      target_nombre: "Oro",
      origen_cuenta_id: null,
      fecha: new Date().toISOString(),
      monto: 500,
      nota: "",
    };
    render(<MovimientoRow movimiento={movimiento} />);
    expect(screen.getByText(/Desde efectivo\/externo/)).toBeInTheDocument();
  });

  it("does not show a 'Desde' line for non pago_tarjeta movimientos", () => {
    const movimiento = {
      id: 3,
      tipo_accion: "gasto_credito",
      target_nombre: "Oro",
      fecha: new Date().toISOString(),
      monto: 100,
      nota: "",
    };
    render(<MovimientoRow movimiento={movimiento} />);
    expect(screen.queryByText(/Desde/)).not.toBeInTheDocument();
  });
});
