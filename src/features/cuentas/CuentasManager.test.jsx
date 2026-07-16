import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CuentasManager from "./CuentasManager";

describe("CuentasManager", () => {
  const cuentas = [{ id: 1, nombre: "Cuenta personal", saldo: 100 }];

  it("renders existing cuentas", () => {
    render(<CuentasManager cuentas={cuentas} deleteCuenta={vi.fn()} onChange={vi.fn()} />);
    expect(screen.getByText("Cuenta personal")).toBeInTheDocument();
  });

  it("deletes a cuenta", () => {
    const deleteCuenta = vi.fn().mockResolvedValue(true);
    render(<CuentasManager cuentas={cuentas} deleteCuenta={deleteCuenta} onChange={vi.fn()} />);
    fireEvent.click(screen.getByTestId("cuenta-row-delete-button-1"));
    expect(deleteCuenta).toHaveBeenCalledWith(1);
  });
});
