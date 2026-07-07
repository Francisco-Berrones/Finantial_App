import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TarjetasManager from "./TarjetasManager";

describe("TarjetasManager", () => {
  const tarjetas = [{ id: 2, nombre: "Oro", banco: "Banorte", linea_total: 1000, saldo_usado: 200 }];
  const session = { user: { id: "user-1" } };

  it("renders existing tarjetas", () => {
    render(
      <TarjetasManager
        tarjetas={tarjetas}
        session={session}
        addTarjeta={vi.fn()}
        deleteTarjeta={vi.fn()}
        onChange={vi.fn()}
        onVerTarjeta={vi.fn()}
      />
    );
    expect(screen.getByText("Oro")).toBeInTheDocument();
  });

  it("submits a new tarjeta with the form values", () => {
    const addTarjeta = vi.fn().mockResolvedValue(true);
    render(
      <TarjetasManager
        tarjetas={tarjetas}
        session={session}
        addTarjeta={addTarjeta}
        deleteTarjeta={vi.fn()}
        onChange={vi.fn()}
        onVerTarjeta={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("tarjetas-add-link"));
    fireEvent.change(screen.getByTestId("tarjetas-nombre-input"), { target: { value: "Platino" } });
    fireEvent.click(screen.getByTestId("tarjetas-save-button"));
    expect(addTarjeta).toHaveBeenCalledWith({
      nombre: "Platino",
      banco: "",
      lineaTotal: "",
      saldoUsado: "",
      diaCorte: "",
      diaPago: "",
      userId: "user-1",
    });
  });

  it("submits a new tarjeta with dia_corte/dia_pago", () => {
    const addTarjeta = vi.fn().mockResolvedValue(true);
    render(
      <TarjetasManager
        tarjetas={tarjetas}
        session={session}
        addTarjeta={addTarjeta}
        deleteTarjeta={vi.fn()}
        onChange={vi.fn()}
        onVerTarjeta={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("tarjetas-add-link"));
    fireEvent.change(screen.getByTestId("tarjetas-nombre-input"), { target: { value: "Platino" } });
    fireEvent.change(screen.getByTestId("tarjetas-dia-corte-input"), { target: { value: "15" } });
    fireEvent.change(screen.getByTestId("tarjetas-dia-pago-input"), { target: { value: "5" } });
    fireEvent.click(screen.getByTestId("tarjetas-save-button"));
    expect(addTarjeta).toHaveBeenCalledWith({
      nombre: "Platino",
      banco: "",
      lineaTotal: "",
      saldoUsado: "",
      diaCorte: "15",
      diaPago: "5",
      userId: "user-1",
    });
  });

  it("deletes a tarjeta", () => {
    const deleteTarjeta = vi.fn().mockResolvedValue(true);
    render(
      <TarjetasManager
        tarjetas={tarjetas}
        session={session}
        addTarjeta={vi.fn()}
        deleteTarjeta={deleteTarjeta}
        onChange={vi.fn()}
        onVerTarjeta={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("tarjeta-row-delete-button-2"));
    expect(deleteTarjeta).toHaveBeenCalledWith(2);
  });
});
