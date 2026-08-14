import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SuscripcionesPendientesModal from "./SuscripcionesPendientesModal";

describe("SuscripcionesPendientesModal", () => {
  const pendientes = [
    { id: "sus-1", nombre: "Netflix", monto: 249, target_nombre: "Oro" },
    { id: "sus-2", nombre: "Spotify", monto: 129, target_nombre: "Cuenta Nómina" },
  ];

  it("lists every pendiente suscripción with its pagar button", () => {
    render(<SuscripcionesPendientesModal pendientes={pendientes} onPagar={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("Spotify")).toBeInTheDocument();
    expect(screen.getByTestId("suscripciones-modal-pagar-sus-1")).toBeInTheDocument();
    expect(screen.getByTestId("suscripciones-modal-pagar-sus-2")).toBeInTheDocument();
  });

  it("calls onPagar with the full suscripción", () => {
    const onPagar = vi.fn();
    render(<SuscripcionesPendientesModal pendientes={pendientes} onPagar={onPagar} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId("suscripciones-modal-pagar-sus-1"));
    expect(onPagar).toHaveBeenCalledWith(pendientes[0]);
  });

  it("calls onClose from the close icon and from 'Ahora no'", () => {
    const onClose = vi.fn();
    render(<SuscripcionesPendientesModal pendientes={pendientes} onPagar={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("suscripciones-modal-close"));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId("suscripciones-modal-ahora-no"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
