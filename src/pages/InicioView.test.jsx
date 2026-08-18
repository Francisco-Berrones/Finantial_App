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

  it("shows the destacado recordatorio (al_dia) and calls onPagarTarjeta when it's a tarjeta", () => {
    const recordatorios = [
      { tipo: "tarjeta", id: "t1", nombre: "Oro", monto: 4587, estado: "al_dia", fecha_referencia: "2026-07-20", dias: 5 },
    ];
    const onPagarTarjeta = vi.fn();
    const onVerTarjeta = vi.fn();

    render(
      <InicioView
        cuentas={cuentas}
        tarjetas={tarjetas}
        movimientos={[]}
        recordatorios={recordatorios}
        onNavigateCuentas={vi.fn()}
        onVerTarjeta={onVerTarjeta}
        onAbrirResumen={vi.fn()}
        onAbrirHistorial={vi.fn()}
        onPagarTarjeta={onPagarTarjeta}
        onPagarSuscripcion={vi.fn()}
      />
    );

    const card = screen.getByTestId("inicio-recordatorio-card");
    expect(card).toBeInTheDocument();
    expect(card).not.toHaveClass("atrasado");
    expect(screen.getByText(/Oro · en 5 días/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("inicio-recordatorio-ver"));
    expect(onVerTarjeta).toHaveBeenCalledWith("t1");

    fireEvent.click(screen.getByTestId("inicio-pagar-ahora-button"));
    expect(onPagarTarjeta).toHaveBeenCalledWith("t1");
  });

  it("shows the atrasado tone (no negative number) and calls onPagarSuscripcion for a suscripción", () => {
    const recordatorios = [
      { tipo: "suscripcion", id: "s1", nombre: "Netflix", monto: 249, estado: "atrasado", fecha_referencia: "2026-06-30", dias: 3 },
    ];
    const onPagarSuscripcion = vi.fn();

    render(
      <InicioView
        cuentas={cuentas}
        tarjetas={tarjetas}
        movimientos={[]}
        recordatorios={recordatorios}
        onNavigateCuentas={vi.fn()}
        onVerTarjeta={vi.fn()}
        onAbrirResumen={vi.fn()}
        onAbrirHistorial={vi.fn()}
        onPagarTarjeta={vi.fn()}
        onPagarSuscripcion={onPagarSuscripcion}
      />
    );

    const card = screen.getByTestId("inicio-recordatorio-card");
    expect(card).toHaveClass("atrasado");
    expect(screen.getByText(/Netflix · atrasado 3 días/)).toBeInTheDocument();
    expect(card.textContent).not.toContain("-3");

    fireEvent.click(screen.getByTestId("inicio-pagar-ahora-button"));
    expect(onPagarSuscripcion).toHaveBeenCalledWith(recordatorios[0]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
