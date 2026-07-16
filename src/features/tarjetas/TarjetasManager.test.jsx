import { createRef } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
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
    const ref = createRef();
    render(
      <TarjetasManager
        ref={ref}
        tarjetas={tarjetas}
        session={session}
        addTarjeta={addTarjeta}
        deleteTarjeta={vi.fn()}
        onChange={vi.fn()}
        onVerTarjeta={vi.fn()}
      />
    );
    act(() => ref.current.abrirFormulario());
    fireEvent.change(screen.getByTestId("nueva-tarjeta-nombre-input"), { target: { value: "Platino" } });
    fireEvent.click(screen.getByTestId("nueva-tarjeta-guardar-button"));
    expect(addTarjeta).toHaveBeenCalledWith({
      nombre: "Platino",
      banco: "",
      lineaTotal: "",
      saldoUsado: "",
      diaCorte: "",
      diaPago: "",
      color: "#131b2e",
      userId: "user-1",
    });
  });

  it("submits a new tarjeta with dia_corte/dia_pago and a custom color", () => {
    const addTarjeta = vi.fn().mockResolvedValue(true);
    const ref = createRef();
    render(
      <TarjetasManager
        ref={ref}
        tarjetas={tarjetas}
        session={session}
        addTarjeta={addTarjeta}
        deleteTarjeta={vi.fn()}
        onChange={vi.fn()}
        onVerTarjeta={vi.fn()}
      />
    );
    act(() => ref.current.abrirFormulario());
    fireEvent.change(screen.getByTestId("nueva-tarjeta-nombre-input"), { target: { value: "Platino" } });
    fireEvent.change(screen.getByTestId("nueva-tarjeta-dia-corte-select"), { target: { value: "15" } });
    fireEvent.change(screen.getByTestId("nueva-tarjeta-dia-pago-select"), { target: { value: "5" } });
    fireEvent.click(screen.getByTestId("nueva-tarjeta-color-1e40af"));
    fireEvent.click(screen.getByTestId("nueva-tarjeta-guardar-button"));
    expect(addTarjeta).toHaveBeenCalledWith({
      nombre: "Platino",
      banco: "",
      lineaTotal: "",
      saldoUsado: "",
      diaCorte: "15",
      diaPago: "5",
      color: "#1e40af",
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
