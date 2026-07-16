import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NuevaCuentaView from "./NuevaCuentaView";

describe("NuevaCuentaView", () => {
  const session = { user: { id: "user-1" } };

  it("creates a cuenta with the form values and returns to the previous screen", async () => {
    const addCuenta = vi.fn().mockResolvedValue(true);
    const onChange = vi.fn().mockResolvedValue();
    const onBack = vi.fn();
    render(<NuevaCuentaView session={session} addCuenta={addCuenta} onChange={onChange} onBack={onBack} />);

    fireEvent.change(screen.getByTestId("nueva-cuenta-nombre-input"), { target: { value: "Ahorros para Viaje" } });
    fireEvent.change(screen.getByTestId("nueva-cuenta-saldo-input"), { target: { value: "500" } });
    fireEvent.click(screen.getByTestId("nueva-cuenta-proposito-viajes"));
    fireEvent.click(screen.getByTestId("nueva-cuenta-crear-button"));

    await waitFor(() => expect(addCuenta).toHaveBeenCalledWith({
      nombre: "Ahorros para Viaje",
      saldo: "500",
      proposito: "viajes",
      userId: "user-1",
    }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    await waitFor(() => expect(onBack).toHaveBeenCalled());
  });

  it("does not submit without a nombre", () => {
    const addCuenta = vi.fn();
    render(<NuevaCuentaView session={session} addCuenta={addCuenta} onChange={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("nueva-cuenta-crear-button"));
    expect(addCuenta).not.toHaveBeenCalled();
  });

  it("toggles a proposito chip off when clicked again", () => {
    render(<NuevaCuentaView session={session} addCuenta={vi.fn()} onChange={vi.fn()} onBack={vi.fn()} />);
    const chip = screen.getByTestId("nueva-cuenta-proposito-educacion");
    fireEvent.click(chip);
    expect(chip).toHaveClass("selected");
    fireEvent.click(chip);
    expect(chip).not.toHaveClass("selected");
  });

  it("calls onBack when back or cancel is clicked", () => {
    const onBack = vi.fn();
    render(<NuevaCuentaView session={session} addCuenta={vi.fn()} onChange={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getByTestId("nueva-cuenta-back-button"));
    expect(onBack).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId("nueva-cuenta-cancelar-button"));
    expect(onBack).toHaveBeenCalledTimes(2);
  });
});
