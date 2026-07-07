import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TarjetaDetalleView from "./TarjetaDetalleView";
import { useMsiDetalle } from "./useMsiDetalle";

vi.mock("./useMsiDetalle", () => ({
  useMsiDetalle: vi.fn(),
}));

describe("TarjetaDetalleView", () => {
  it("shows 'No capturado' when dia_corte/dia_pago are missing", () => {
    useMsiDetalle.mockReturnValue({ compras: [], cargando: false, fetchMsi: vi.fn() });
    const tarjeta = { id: "t1", nombre: "Oro", dia_corte: null, dia_pago: null };
    render(<TarjetaDetalleView tarjeta={tarjeta} onBack={vi.fn()} />);
    expect(screen.getAllByText("No capturado")).toHaveLength(2);
  });

  it("shows días restantes when dia_corte/dia_pago are set", () => {
    useMsiDetalle.mockReturnValue({ compras: [], cargando: false, fetchMsi: vi.fn() });
    const tarjeta = { id: "t1", nombre: "Oro", dia_corte: 15, dia_pago: 5 };
    render(<TarjetaDetalleView tarjeta={tarjeta} onBack={vi.fn()} />);
    expect(screen.getByText("Día 15")).toBeInTheDocument();
    expect(screen.getByText("Día 5")).toBeInTheDocument();
  });

  it("shows the empty state when there are no compras a MSI", () => {
    useMsiDetalle.mockReturnValue({ compras: [], cargando: false, fetchMsi: vi.fn() });
    const tarjeta = { id: "t1", nombre: "Oro", dia_corte: 15, dia_pago: 5 };
    render(<TarjetaDetalleView tarjeta={tarjeta} onBack={vi.fn()} />);
    expect(screen.getByTestId("msi-empty-state")).toBeInTheDocument();
  });

  it("renders active compras a MSI with mensualidad and progreso", () => {
    useMsiDetalle.mockReturnValue({
      compras: [
        {
          id: "msi-1",
          descripcion: "Laptop",
          mensualidad: 1000,
          meses_transcurridos: 2,
          meses_total: 12,
          saldo_pendiente: 8000,
        },
      ],
      cargando: false,
      fetchMsi: vi.fn(),
    });
    const tarjeta = { id: "t1", nombre: "Oro", dia_corte: 15, dia_pago: 5 };
    render(<TarjetaDetalleView tarjeta={tarjeta} onBack={vi.fn()} />);
    expect(screen.getByText("Laptop")).toBeInTheDocument();
    expect(screen.getByText("Mes 3 de 12")).toBeInTheDocument();
  });

  it("calls onBack when the back button is clicked", () => {
    useMsiDetalle.mockReturnValue({ compras: [], cargando: false, fetchMsi: vi.fn() });
    const onBack = vi.fn();
    const tarjeta = { id: "t1", nombre: "Oro", dia_corte: 15, dia_pago: 5 };
    render(<TarjetaDetalleView tarjeta={tarjeta} onBack={onBack} />);
    screen.getByTestId("tarjeta-detalle-back-button").click();
    expect(onBack).toHaveBeenCalled();
  });

  it("edits and saves dia_corte/dia_pago", async () => {
    useMsiDetalle.mockReturnValue({ compras: [], cargando: false, fetchMsi: vi.fn() });
    const onGuardarCortePago = vi.fn().mockResolvedValue(true);
    const tarjeta = { id: "t1", nombre: "Oro", dia_corte: null, dia_pago: null };
    render(<TarjetaDetalleView tarjeta={tarjeta} onBack={vi.fn()} onGuardarCortePago={onGuardarCortePago} />);

    fireEvent.click(screen.getByTestId("tarjeta-detalle-editar-button"));
    fireEvent.change(screen.getByTestId("tarjeta-detalle-dia-corte-input"), { target: { value: "15" } });
    fireEvent.change(screen.getByTestId("tarjeta-detalle-dia-pago-input"), { target: { value: "5" } });
    fireEvent.click(screen.getByTestId("tarjeta-detalle-guardar-button"));

    expect(onGuardarCortePago).toHaveBeenCalledWith("t1", { diaCorte: "15", diaPago: "5" });
  });

  it("registers a new compra a meses and refreshes the list and the parent", async () => {
    const fetchMsi = vi.fn();
    const registrarCompra = vi.fn().mockResolvedValue(true);
    useMsiDetalle.mockReturnValue({ compras: [], cargando: false, fetchMsi, registrarCompra });
    const onRegistrada = vi.fn();
    const tarjeta = { id: "t1", nombre: "Oro", dia_corte: 15, dia_pago: 5 };
    render(<TarjetaDetalleView tarjeta={tarjeta} onBack={vi.fn()} onRegistrada={onRegistrada} />);

    fireEvent.click(screen.getByTestId("msi-add-link"));
    fireEvent.change(screen.getByTestId("msi-descripcion-input"), { target: { value: "Laptop" } });
    fireEvent.change(screen.getByTestId("msi-monto-input"), { target: { value: "12000" } });
    fireEvent.change(screen.getByTestId("msi-meses-input"), { target: { value: "12" } });
    fireEvent.click(screen.getByTestId("msi-guardar-button"));

    await waitFor(() => expect(onRegistrada).toHaveBeenCalled());
    expect(registrarCompra).toHaveBeenCalledWith({
      tarjetaId: "t1",
      monto: "12000",
      meses: "12",
      descripcion: "Laptop",
      categoriaId: null,
    });
  });

  it("lets you pick a categoria for a compra a meses and create a new one inline", async () => {
    const fetchMsi = vi.fn();
    const registrarCompra = vi.fn().mockResolvedValue(true);
    useMsiDetalle.mockReturnValue({ compras: [], cargando: false, fetchMsi, registrarCompra });
    const crearCategoria = vi.fn().mockResolvedValue({ id: "cat-nueva", nombre: "Tecnología" });
    const tarjeta = { id: "t1", nombre: "Oro", dia_corte: 15, dia_pago: 5 };
    render(
      <TarjetaDetalleView
        tarjeta={tarjeta}
        categorias={[]}
        crearCategoria={crearCategoria}
        onBack={vi.fn()}
        onRegistrada={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("msi-add-link"));
    fireEvent.change(screen.getByTestId("msi-categoria-select"), { target: { value: "__nueva__" } });
    fireEvent.change(screen.getByTestId("msi-categoria-nueva-input"), { target: { value: "Tecnología" } });
    fireEvent.click(screen.getByTestId("msi-categoria-crear-button"));

    expect(crearCategoria).toHaveBeenCalledWith("Tecnología");

    await screen.findByTestId("msi-categoria-select");
    fireEvent.change(screen.getByTestId("msi-descripcion-input"), { target: { value: "Laptop" } });
    fireEvent.change(screen.getByTestId("msi-monto-input"), { target: { value: "12000" } });
    fireEvent.change(screen.getByTestId("msi-meses-input"), { target: { value: "12" } });
    fireEvent.click(screen.getByTestId("msi-guardar-button"));

    expect(registrarCompra).toHaveBeenCalledWith({
      tarjetaId: "t1",
      monto: "12000",
      meses: "12",
      descripcion: "Laptop",
      categoriaId: "cat-nueva",
    });
  });
});
