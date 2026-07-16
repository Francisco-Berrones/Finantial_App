import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NuevoMovimientoView from "./NuevoMovimientoView";
import { useMsiDetalle } from "../tarjetas/useMsiDetalle";

vi.mock("../tarjetas/useMsiDetalle", () => ({
  useMsiDetalle: vi.fn(),
}));

describe("NuevoMovimientoView", () => {
  const cuentas = [{ id: 1, nombre: "Cuenta personal" }];
  const tarjetas = [{ id: 2, nombre: "Oro", banco: "Banorte" }];

  beforeEach(() => {
    useMsiDetalle.mockReturnValue({ compras: [], cargando: false, fetchMsi: vi.fn() });
  });

  it("renders the 4 movement type cards and defaults to gasto_credito", () => {
    render(
      <NuevoMovimientoView
        cuentas={cuentas}
        tarjetas={tarjetas}
        commitMovimiento={vi.fn()}
        onBack={vi.fn()}
        onSaved={vi.fn()}
      />
    );
    expect(screen.getByTestId("tipo-card-gasto_credito")).toHaveClass("active");
    expect(screen.getByTestId("tipo-card-gasto_debito")).toBeInTheDocument();
    expect(screen.getByTestId("tipo-card-pago_tarjeta")).toBeInTheDocument();
    expect(screen.getByTestId("tipo-card-ingreso_cuenta")).toBeInTheDocument();
  });

  it("switches target list when selecting a cuenta-based type and commits the movimiento", () => {
    const commitMovimiento = vi.fn().mockResolvedValue(true);
    const onSaved = vi.fn();
    render(
      <NuevoMovimientoView
        cuentas={cuentas}
        tarjetas={tarjetas}
        commitMovimiento={commitMovimiento}
        onBack={vi.fn()}
        onSaved={onSaved}
      />
    );

    fireEvent.click(screen.getByTestId("tipo-card-ingreso_cuenta"));
    fireEvent.change(screen.getByTestId("nuevo-mov-target-select"), { target: { value: "1" } });
    fireEvent.change(screen.getByTestId("nuevo-mov-monto-input"), { target: { value: "250" } });
    fireEvent.click(screen.getByTestId("nuevo-mov-registrar-button"));

    expect(commitMovimiento).toHaveBeenCalledWith({
      accion: "ingreso_cuenta",
      targetId: 1,
      monto: "250",
      nota: "",
      categoriaId: null,
    });
  });

  it("calls onBack when the back button is clicked", () => {
    const onBack = vi.fn();
    render(
      <NuevoMovimientoView
        cuentas={cuentas}
        tarjetas={tarjetas}
        commitMovimiento={vi.fn()}
        onBack={onBack}
        onSaved={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("nuevo-mov-back-button"));
    expect(onBack).toHaveBeenCalled();
  });

  it("registers a payment using only the MSI allocation field, with no general amount, funded externally by default", async () => {
    useMsiDetalle.mockReturnValue({
      compras: [{ id: "msi-1", descripcion: "Laptop", mensualidad: 1000 }],
      cargando: false,
      fetchMsi: vi.fn(),
    });
    const commitPagoTarjeta = vi.fn().mockResolvedValue(true);
    const onSaved = vi.fn();
    render(
      <NuevoMovimientoView
        cuentas={cuentas}
        tarjetas={tarjetas}
        commitMovimiento={vi.fn()}
        commitPagoTarjeta={commitPagoTarjeta}
        onBack={vi.fn()}
        onSaved={onSaved}
      />
    );

    fireEvent.click(screen.getByTestId("tipo-card-pago_tarjeta"));
    fireEvent.change(screen.getByTestId("nuevo-mov-target-select"), { target: { value: "2" } });
    fireEvent.change(screen.getByTestId("nuevo-mov-asignacion-input-msi-1"), { target: { value: "1000" } });
    fireEvent.click(screen.getByTestId("nuevo-mov-registrar-button"));

    expect(commitPagoTarjeta).toHaveBeenCalledWith({
      tarjetaId: 2,
      monto: 1000,
      origenCuentaId: null,
      asignaciones: [{ compra_id: "msi-1", monto: 1000 }],
      nota: "",
    });
  });

  it("combines the general amount and the MSI allocation into a single total", async () => {
    useMsiDetalle.mockReturnValue({
      compras: [{ id: "msi-1", descripcion: "Laptop", mensualidad: 1000 }],
      cargando: false,
      fetchMsi: vi.fn(),
    });
    const commitPagoTarjeta = vi.fn().mockResolvedValue(true);
    render(
      <NuevoMovimientoView
        cuentas={cuentas}
        tarjetas={tarjetas}
        commitMovimiento={vi.fn()}
        commitPagoTarjeta={commitPagoTarjeta}
        onBack={vi.fn()}
        onSaved={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("tipo-card-pago_tarjeta"));
    fireEvent.change(screen.getByTestId("nuevo-mov-target-select"), { target: { value: "2" } });
    fireEvent.change(screen.getByTestId("nuevo-mov-monto-input"), { target: { value: "200" } });
    fireEvent.change(screen.getByTestId("nuevo-mov-asignacion-input-msi-1"), { target: { value: "1000" } });
    fireEvent.click(screen.getByTestId("nuevo-mov-registrar-button"));

    expect(commitPagoTarjeta).toHaveBeenCalledWith({
      tarjetaId: 2,
      monto: 1200,
      origenCuentaId: null,
      asignaciones: [{ compra_id: "msi-1", monto: 1000 }],
      nota: "",
    });
  });

  it("lets you pick a cuenta as the origin of a tarjeta payment", async () => {
    useMsiDetalle.mockReturnValue({ compras: [], cargando: false, fetchMsi: vi.fn() });
    const commitPagoTarjeta = vi.fn().mockResolvedValue(true);
    render(
      <NuevoMovimientoView
        cuentas={cuentas}
        tarjetas={tarjetas}
        commitMovimiento={vi.fn()}
        commitPagoTarjeta={commitPagoTarjeta}
        onBack={vi.fn()}
        onSaved={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("tipo-card-pago_tarjeta"));
    fireEvent.change(screen.getByTestId("nuevo-mov-target-select"), { target: { value: "2" } });
    fireEvent.change(screen.getByTestId("nuevo-mov-origen-select"), { target: { value: "1" } });
    fireEvent.change(screen.getByTestId("nuevo-mov-monto-input"), { target: { value: "500" } });
    fireEvent.click(screen.getByTestId("nuevo-mov-registrar-button"));

    expect(commitPagoTarjeta).toHaveBeenCalledWith({
      tarjetaId: 2,
      monto: 500,
      origenCuentaId: "1",
      asignaciones: [],
      nota: "",
    });
  });

  it("lets you pick a categoria for a gasto_credito and sends it along", () => {
    const commitMovimiento = vi.fn().mockResolvedValue(true);
    const categorias = [{ id: "cat-1", nombre: "Comida" }];
    render(
      <NuevoMovimientoView
        cuentas={cuentas}
        tarjetas={tarjetas}
        categorias={categorias}
        commitMovimiento={commitMovimiento}
        onBack={vi.fn()}
        onSaved={vi.fn()}
      />
    );

    fireEvent.change(screen.getByTestId("nuevo-mov-target-select"), { target: { value: "2" } });
    fireEvent.click(screen.getByTestId("nuevo-mov-categoria-abrir-button"));
    fireEvent.click(screen.getByTestId("categoria-picker-item-cat-1"));
    fireEvent.change(screen.getByTestId("nuevo-mov-monto-input"), { target: { value: "300" } });
    fireEvent.click(screen.getByTestId("nuevo-mov-registrar-button"));

    expect(commitMovimiento).toHaveBeenCalledWith({
      accion: "gasto_credito",
      targetId: 2,
      monto: "300",
      nota: "",
      categoriaId: "cat-1",
    });
  });

  it("does not show a categoria selector for pago_tarjeta or ingreso_cuenta", () => {
    render(
      <NuevoMovimientoView
        cuentas={cuentas}
        tarjetas={tarjetas}
        categorias={[]}
        commitMovimiento={vi.fn()}
        commitPagoTarjeta={vi.fn()}
        onBack={vi.fn()}
        onSaved={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("tipo-card-pago_tarjeta"));
    expect(screen.queryByTestId("nuevo-mov-categoria-abrir-button")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("tipo-card-ingreso_cuenta"));
    expect(screen.queryByTestId("nuevo-mov-categoria-abrir-button")).not.toBeInTheDocument();
  });

  it("creates a new categoria from the picker and selects it", async () => {
    const commitMovimiento = vi.fn().mockResolvedValue(true);
    const crearCategoria = vi.fn().mockResolvedValue({ id: "cat-nueva", nombre: "Mascotas" });
    render(
      <NuevoMovimientoView
        cuentas={cuentas}
        tarjetas={tarjetas}
        categorias={[]}
        crearCategoria={crearCategoria}
        commitMovimiento={commitMovimiento}
        onBack={vi.fn()}
        onSaved={vi.fn()}
      />
    );

    fireEvent.change(screen.getByTestId("nuevo-mov-target-select"), { target: { value: "2" } });
    fireEvent.click(screen.getByTestId("nuevo-mov-categoria-abrir-button"));
    fireEvent.click(screen.getByTestId("categoria-picker-crear-nueva"));
    fireEvent.change(screen.getByTestId("nuevo-mov-categoria-nueva-input"), { target: { value: "Mascotas" } });
    fireEvent.click(screen.getByTestId("nuevo-mov-categoria-icono-favorite"));
    fireEvent.click(screen.getByTestId("nuevo-mov-categoria-color-3D5A80"));
    fireEvent.click(screen.getByTestId("nuevo-mov-categoria-crear-button"));

    expect(crearCategoria).toHaveBeenCalledWith("Mascotas", { icono: "favorite", color: "#3D5A80" });

    await screen.findByTestId("nuevo-mov-categoria-abrir-button");
    fireEvent.change(screen.getByTestId("nuevo-mov-monto-input"), { target: { value: "150" } });
    fireEvent.click(screen.getByTestId("nuevo-mov-registrar-button"));

    expect(commitMovimiento).toHaveBeenCalledWith({
      accion: "gasto_credito",
      targetId: 2,
      monto: "150",
      nota: "",
      categoriaId: "cat-nueva",
    });
  });
});
