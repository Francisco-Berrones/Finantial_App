import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RecordatoriosView from "./RecordatoriosView";

describe("RecordatoriosView", () => {
  it("shows the empty state when there are no recordatorios", () => {
    render(<RecordatoriosView recordatorios={[]} onVerTarjeta={vi.fn()} onPagar={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByTestId("recordatorios-empty")).toBeInTheDocument();
  });

  it("lists every recordatorio, ya vengan ordenados, sin filtrar solo el más urgente", () => {
    const recordatorios = [
      { tipo: "tarjeta", id: "t1", nombre: "Oro", monto: 4587, estado: "atrasado", dias: 2 },
      { tipo: "suscripcion", id: "s1", nombre: "Netflix", monto: 249, estado: "atrasado", dias: 1 },
      { tipo: "suscripcion", id: "s2", nombre: "Spotify", monto: 139, estado: "al_dia", dias: 4 },
    ];
    render(<RecordatoriosView recordatorios={recordatorios} onVerTarjeta={vi.fn()} onPagar={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByTestId("recordatorio-row-tarjeta-t1")).toBeInTheDocument();
    expect(screen.getByTestId("recordatorio-row-suscripcion-s1")).toBeInTheDocument();
    expect(screen.getByTestId("recordatorio-row-suscripcion-s2")).toBeInTheDocument();
  });

  it("navigates to the tarjeta detail when a tarjeta row is clicked", () => {
    const recordatorios = [{ tipo: "tarjeta", id: "t1", nombre: "Oro", monto: 4587, estado: "al_dia", dias: 5 }];
    const onVerTarjeta = vi.fn();
    render(<RecordatoriosView recordatorios={recordatorios} onVerTarjeta={onVerTarjeta} onPagar={vi.fn()} onBack={vi.fn()} />);

    fireEvent.click(screen.getByTestId("recordatorio-row-tarjeta-t1"));
    expect(onVerTarjeta).toHaveBeenCalledWith("t1");
  });

  it("calls onPagar for an atrasado suscripción row", () => {
    const recordatorios = [{ tipo: "suscripcion", id: "s1", nombre: "Netflix", monto: 249, estado: "atrasado", dias: 1 }];
    const onPagar = vi.fn();
    render(<RecordatoriosView recordatorios={recordatorios} onVerTarjeta={vi.fn()} onPagar={onPagar} onBack={vi.fn()} />);

    fireEvent.click(screen.getByTestId("recordatorio-pagar-button-s1"));
    expect(onPagar).toHaveBeenCalledWith(recordatorios[0]);
  });

  it("calls onBack from the back button", () => {
    const onBack = vi.fn();
    render(<RecordatoriosView recordatorios={[]} onVerTarjeta={vi.fn()} onPagar={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getByTestId("recordatorios-back-button"));
    expect(onBack).toHaveBeenCalled();
  });
});
