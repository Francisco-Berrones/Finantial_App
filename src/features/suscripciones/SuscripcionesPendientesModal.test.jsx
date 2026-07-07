import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SuscripcionesPendientesModal from "./SuscripcionesPendientesModal";

describe("SuscripcionesPendientesModal", () => {
  const pendientes = [
    { id: "sus-1", nombre: "Netflix", monto: 249, target_nombre: "Oro" },
    { id: "sus-2", nombre: "Spotify", monto: 129, target_nombre: "Cuenta Nómina" },
  ];

  it("lists every pendiente suscripción with its confirm button", () => {
    render(<SuscripcionesPendientesModal pendientes={pendientes} onConfirmar={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("Spotify")).toBeInTheDocument();
    expect(screen.getByTestId("suscripciones-modal-confirmar-sus-1")).toBeInTheDocument();
    expect(screen.getByTestId("suscripciones-modal-confirmar-sus-2")).toBeInTheDocument();
  });

  it("calls onConfirmar with the suscripción id", () => {
    const onConfirmar = vi.fn();
    render(<SuscripcionesPendientesModal pendientes={pendientes} onConfirmar={onConfirmar} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId("suscripciones-modal-confirmar-sus-1"));
    expect(onConfirmar).toHaveBeenCalledWith("sus-1");
  });

  it("calls onClose from the close icon and from 'Ahora no'", () => {
    const onClose = vi.fn();
    render(<SuscripcionesPendientesModal pendientes={pendientes} onConfirmar={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("suscripciones-modal-close"));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId("suscripciones-modal-ahora-no"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
