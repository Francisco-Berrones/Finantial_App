import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CuentasManager from "./CuentasManager";

describe("CuentasManager", () => {
  const cuentas = [{ id: 1, nombre: "Cuenta personal", saldo: 100 }];
  const session = { user: { id: "user-1" } };

  it("renders existing cuentas", () => {
    render(
      <CuentasManager
        cuentas={cuentas}
        session={session}
        addCuenta={vi.fn()}
        deleteCuenta={vi.fn()}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("Cuenta personal")).toBeInTheDocument();
  });

  it("submits a new cuenta with the form values", () => {
    const addCuenta = vi.fn().mockResolvedValue(true);
    render(
      <CuentasManager
        cuentas={cuentas}
        session={session}
        addCuenta={addCuenta}
        deleteCuenta={vi.fn()}
        onChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("cuentas-add-link"));
    fireEvent.change(screen.getByTestId("cuentas-nombre-input"), { target: { value: "Nueva cuenta" } });
    fireEvent.click(screen.getByTestId("cuentas-save-button"));
    expect(addCuenta).toHaveBeenCalledWith({ nombre: "Nueva cuenta", saldo: "", userId: "user-1" });
  });

  it("deletes a cuenta", () => {
    const deleteCuenta = vi.fn().mockResolvedValue(true);
    render(
      <CuentasManager
        cuentas={cuentas}
        session={session}
        addCuenta={vi.fn()}
        deleteCuenta={deleteCuenta}
        onChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("cuenta-row-delete-button-1"));
    expect(deleteCuenta).toHaveBeenCalledWith(1);
  });
});
