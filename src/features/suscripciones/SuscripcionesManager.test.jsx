import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SuscripcionesManager from "./SuscripcionesManager";

describe("SuscripcionesManager", () => {
  const cuentas = [{ id: "cuenta-1", nombre: "Cuenta Nómina" }];
  const tarjetas = [{ id: "tarjeta-1", nombre: "Oro", banco: "Banorte" }];
  const categorias = [{ id: "cat-1", nombre: "Entretenimiento" }];
  const session = { user: { id: "user-1" } };

  it("shows the empty state when there are no suscripciones", () => {
    render(
      <SuscripcionesManager
        suscripciones={[]}
        cuentas={cuentas}
        tarjetas={tarjetas}
        categorias={categorias}
        session={session}
        addSuscripcion={vi.fn()}
        deleteSuscripcion={vi.fn()}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("No tienes suscripciones registradas.")).toBeInTheDocument();
  });

  it("renders existing suscripciones with their status", () => {
    const suscripciones = [
      {
        id: "sus-1",
        nombre: "Netflix",
        monto: 249,
        frecuencia: "mensual",
        target_nombre: "Oro",
        dias_para_cobro: 5,
        pendiente_confirmar: false,
        categoria_nombre: "Entretenimiento",
      },
    ];
    render(
      <SuscripcionesManager
        suscripciones={suscripciones}
        cuentas={cuentas}
        tarjetas={tarjetas}
        categorias={categorias}
        session={session}
        addSuscripcion={vi.fn()}
        deleteSuscripcion={vi.fn()}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText(/Próximo cobro en 5 días/)).toBeInTheDocument();
  });

  it("submits a new suscripción with the form values", () => {
    const addSuscripcion = vi.fn().mockResolvedValue(true);
    render(
      <SuscripcionesManager
        suscripciones={[]}
        cuentas={cuentas}
        tarjetas={tarjetas}
        categorias={categorias}
        session={session}
        addSuscripcion={addSuscripcion}
        deleteSuscripcion={vi.fn()}
        onChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("suscripciones-add-link"));
    fireEvent.change(screen.getByTestId("suscripciones-nombre-input"), { target: { value: "Netflix" } });
    fireEvent.change(screen.getByTestId("suscripciones-monto-input"), { target: { value: "249" } });
    fireEvent.change(screen.getByTestId("suscripciones-dia-cobro-input"), { target: { value: "8" } });
    fireEvent.change(screen.getByTestId("suscripciones-target-select"), { target: { value: "tarjeta-1" } });
    fireEvent.change(screen.getByTestId("suscripciones-categoria-select"), { target: { value: "cat-1" } });
    fireEvent.click(screen.getByTestId("suscripciones-save-button"));

    expect(addSuscripcion).toHaveBeenCalledWith({
      nombre: "Netflix",
      monto: "249",
      frecuencia: "mensual",
      diaCobro: "8",
      mesCobro: "",
      targetTipo: "tarjeta",
      targetId: "tarjeta-1",
      categoriaId: "cat-1",
      userId: "user-1",
    });
  });

  it("shows the mes de cobro field only when frecuencia is anual", () => {
    render(
      <SuscripcionesManager
        suscripciones={[]}
        cuentas={cuentas}
        tarjetas={tarjetas}
        categorias={categorias}
        session={session}
        addSuscripcion={vi.fn()}
        deleteSuscripcion={vi.fn()}
        onChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("suscripciones-add-link"));
    expect(screen.queryByTestId("suscripciones-mes-cobro-input")).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("suscripciones-frecuencia-select"), { target: { value: "anual" } });
    expect(screen.getByTestId("suscripciones-mes-cobro-input")).toBeInTheDocument();
  });

  it("deletes a suscripción", () => {
    const deleteSuscripcion = vi.fn().mockResolvedValue(true);
    const suscripciones = [
      { id: "sus-1", nombre: "Netflix", monto: 249, frecuencia: "mensual", target_nombre: "Oro", dias_para_cobro: 5, pendiente_confirmar: false },
    ];
    render(
      <SuscripcionesManager
        suscripciones={suscripciones}
        cuentas={cuentas}
        tarjetas={tarjetas}
        categorias={categorias}
        session={session}
        addSuscripcion={vi.fn()}
        deleteSuscripcion={deleteSuscripcion}
        onChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("suscripcion-delete-button-sus-1"));
    expect(deleteSuscripcion).toHaveBeenCalledWith("sus-1");
  });
});
