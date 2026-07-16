import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import InicioView from "./InicioView";

describe("InicioView", () => {
  const cuentas = [{ id: "c1", nombre: "Cuenta Nómina", saldo: 5000 }];
  const tarjetas = [{ id: "t1", nombre: "Oro", banco: "Banorte", linea_total: 10000, saldo_usado: 2000, dia_corte: 25, dia_pago: 15 }];

  it("shows the empty state and hides the summary cards when there are no cuentas or tarjetas", () => {
    render(
      <InicioView
        cuentas={[]}
        tarjetas={[]}
        movimientos={[]}
        onNavigateCuentas={vi.fn()}
        onVerTarjeta={vi.fn()}
        onAbrirResumen={vi.fn()}
        onAbrirHistorial={vi.fn()}
        onPagarTarjeta={vi.fn()}
      />
    );
    expect(screen.getByText(/Todavía no tienes cuentas ni tarjetas/)).toBeInTheDocument();
    expect(screen.getByTestId("inicio-agregar-primera-button")).toBeInTheDocument();
  });

  it("shows the saldo total and recent movimientos", () => {
    const movimientos = [
      { id: 1, tipo_accion: "gasto_credito", target_id: "t1", target_nombre: "Oro", monto: 100, fecha: new Date().toISOString(), nota: "" },
    ];
    render(
      <InicioView
        cuentas={cuentas}
        tarjetas={tarjetas}
        movimientos={movimientos}
        onNavigateCuentas={vi.fn()}
        onVerTarjeta={vi.fn()}
        onAbrirResumen={vi.fn()}
        onAbrirHistorial={vi.fn()}
        onPagarTarjeta={vi.fn()}
      />
    );
    expect(screen.getByText("$5,000.00")).toBeInTheDocument();
  });

  it("calls onAbrirHistorial when 'Ver todo' is clicked", () => {
    const onAbrirHistorial = vi.fn();
    render(
      <InicioView
        cuentas={cuentas}
        tarjetas={tarjetas}
        movimientos={[]}
        onNavigateCuentas={vi.fn()}
        onVerTarjeta={vi.fn()}
        onAbrirResumen={vi.fn()}
        onAbrirHistorial={onAbrirHistorial}
        onPagarTarjeta={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("inicio-vertodo-button"));
    expect(onAbrirHistorial).toHaveBeenCalled();
  });

  it("shows the próximo vencimiento card and calls onPagarTarjeta when confirmed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 7));

    const movimientos = [
      { id: 1, tipo_accion: "gasto_credito", target_id: "t1", monto: 300, fecha: "2026-06-10T00:00:00Z", nota: "" },
    ];
    const onPagarTarjeta = vi.fn();

    render(
      <InicioView
        cuentas={cuentas}
        tarjetas={tarjetas}
        movimientos={movimientos}
        onNavigateCuentas={vi.fn()}
        onVerTarjeta={vi.fn()}
        onAbrirResumen={vi.fn()}
        onAbrirHistorial={vi.fn()}
        onPagarTarjeta={onPagarTarjeta}
      />
    );

    expect(screen.getByTestId("inicio-vencimiento-card")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("inicio-pagar-ahora-button"));
    expect(onPagarTarjeta).toHaveBeenCalledWith("t1");
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
