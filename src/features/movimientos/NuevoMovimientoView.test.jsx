import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NuevoMovimientoView from "./NuevoMovimientoView";

describe("NuevoMovimientoView", () => {
  const cuentas = [{ id: 1, nombre: "Cuenta personal" }];
  const tarjetas = [{ id: 2, nombre: "Oro", banco: "Banorte" }];

  it("renders the 4 movement type cards and defaults to gasto_credito", () => {
    render(
      <NuevoMovimientoView
        cuentas={cuentas}
        tarjetas={tarjetas}
        commitMovimiento={vi.fn()}
        onBack={vi.fn()}
        onSaved={vi.fn()}
      />
    );
    expect(screen.getByTestId("tipo-card-gasto_credito")).toHaveClass("active");
    expect(screen.getByTestId("tipo-card-gasto_debito")).toBeInTheDocument();
    expect(screen.getByTestId("tipo-card-pago_tarjeta")).toBeInTheDocument();
    expect(screen.getByTestId("tipo-card-ingreso_cuenta")).toBeInTheDocument();
  });

  it("switches target list when selecting a cuenta-based type and commits the movimiento", () => {
    const commitMovimiento = vi.fn().mockResolvedValue(true);
    const onSaved = vi.fn();
    render(
      <NuevoMovimientoView
        cuentas={cuentas}
        tarjetas={tarjetas}
        commitMovimiento={commitMovimiento}
        onBack={vi.fn()}
        onSaved={onSaved}
      />
    );

    fireEvent.click(screen.getByTestId("tipo-card-ingreso_cuenta"));
    fireEvent.change(screen.getByTestId("nuevo-mov-target-select"), { target: { value: "1" } });
    fireEvent.change(screen.getByTestId("nuevo-mov-monto-input"), { target: { value: "250" } });
    fireEvent.click(screen.getByTestId("nuevo-mov-registrar-button"));

    expect(commitMovimiento).toHaveBeenCalledWith({
      accion: "ingreso_cuenta",
      targetId: 1,
      monto: "250",
      nota: "",
    });
  });

  it("calls onBack when the back button is clicked", () => {
    const onBack = vi.fn();
    render(
      <NuevoMovimientoView
        cuentas={cuentas}
        tarjetas={tarjetas}
        commitMovimiento={vi.fn()}
        onBack={onBack}
        onSaved={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("nuevo-mov-back-button"));
    expect(onBack).toHaveBeenCalled();
  });
});
