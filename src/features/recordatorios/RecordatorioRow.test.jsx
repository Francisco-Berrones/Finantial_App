import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RecordatorioRow from "./RecordatorioRow";

describe("RecordatorioRow", () => {
  it("shows an al_dia tarjeta with a forward countdown and no pagar button", () => {
    const recordatorio = { tipo: "tarjeta", id: "t1", nombre: "Oro", monto: 4587, estado: "al_dia", dias: 5 };
    render(<RecordatorioRow recordatorio={recordatorio} onClick={vi.fn()} />);

    expect(screen.getByText("Oro")).toBeInTheDocument();
    expect(screen.getByText("en 5 días")).toBeInTheDocument();
    expect(screen.queryByTestId("recordatorio-pagar-button-t1")).not.toBeInTheDocument();
    expect(screen.getByTestId("recordatorio-row-tarjeta-t1")).not.toHaveClass("atrasado");
  });

  it("shows an atrasado tarjeta with the atrasado tone and never a negative number", () => {
    const recordatorio = { tipo: "tarjeta", id: "t1", nombre: "Oro", monto: 4587, estado: "atrasado", dias: 3 };
    render(<RecordatorioRow recordatorio={recordatorio} onClick={vi.fn()} />);

    const row = screen.getByTestId("recordatorio-row-tarjeta-t1");
    expect(row).toHaveClass("atrasado");
    expect(screen.getByText("atrasado 3 días")).toBeInTheDocument();
    expect(row.textContent).not.toContain("-3");
    // Las tarjetas no tienen botón de confirmar propio -- se pagan por el flujo normal.
    expect(screen.queryByTestId("recordatorio-pagar-button-t1")).not.toBeInTheDocument();
  });

  it("shows a Pagar button only for an atrasado suscripción, and calls onPagar with it", () => {
    const recordatorio = { tipo: "suscripcion", id: "s1", nombre: "Netflix", monto: 249, estado: "atrasado", dias: 1 };
    const onPagar = vi.fn();
    render(<RecordatorioRow recordatorio={recordatorio} onPagar={onPagar} />);

    fireEvent.click(screen.getByTestId("recordatorio-pagar-button-s1"));
    expect(onPagar).toHaveBeenCalledWith(recordatorio);
  });

  it("does not show a Pagar button for a suscripción that is still al_dia", () => {
    const recordatorio = { tipo: "suscripcion", id: "s1", nombre: "Netflix", monto: 249, estado: "al_dia", dias: 10 };
    render(<RecordatorioRow recordatorio={recordatorio} onPagar={vi.fn()} />);

    expect(screen.queryByTestId("recordatorio-pagar-button-s1")).not.toBeInTheDocument();
  });
});
