import { describe, it, expect, vi, afterEach } from "vitest";
import { proximoPagoDeTarjeta, proximaTarjetaAPagar } from "./calcularPagoTarjeta";

describe("proximoPagoDeTarjeta", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("sums gasto normal from the closed cycle plus MSI mensualidades, excluding the MSI original charge", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 7)); // July 7 -> último corte fue el 25 de junio

    const tarjeta = { id: "t1", dia_corte: 25, dia_pago: 15 };
    const movimientos = [
      // Gasto normal dentro del ciclo cerrado (25 mayo - 25 junio)
      { tipo_accion: "gasto_credito", target_id: "t1", monto: 500, nota: "Súper", fecha: "2026-06-10T00:00:00Z" },
      // Cargo original de una MSI -- debe excluirse (ya se cuenta como mensualidad aparte)
      { tipo_accion: "gasto_credito", target_id: "t1", monto: 5000, nota: "Laptop (a 6 meses sin intereses)", fecha: "2026-06-05T00:00:00Z" },
      // Gasto de otra tarjeta -- no debe contarse
      { tipo_accion: "gasto_credito", target_id: "t2", monto: 999, nota: "", fecha: "2026-06-10T00:00:00Z" },
      // Gasto fuera de la ventana del ciclo cerrado (ya es del ciclo actual, abierto)
      { tipo_accion: "gasto_credito", target_id: "t1", monto: 300, nota: "", fecha: "2026-07-01T00:00:00Z" },
    ];
    const msiActivas = [{ tarjeta_id: "t1", mensualidad: 833.33, meses_restantes: 5, saldo_pendiente: 4166.65 }];

    const resultado = proximoPagoDeTarjeta(tarjeta, movimientos, msiActivas);

    expect(resultado.monto).toBeCloseTo(500 + 833.33, 2);
    expect(resultado.fecha.getMonth()).toBe(6); // July
    expect(resultado.fecha.getDate()).toBe(15);
  });

  it("returns null when the tarjeta has no día de corte configured", () => {
    const resultado = proximoPagoDeTarjeta({ id: "t1", dia_corte: null, dia_pago: 15 }, [], []);
    expect(resultado).toBeNull();
  });

  it("subtracts pagos already made to this tarjeta since the corte closed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 7)); // último corte fue el 25 de junio

    const tarjeta = { id: "t1", dia_corte: 25, dia_pago: 15 };
    const movimientos = [
      { tipo_accion: "gasto_credito", target_id: "t1", monto: 500, nota: "", fecha: "2026-06-10T00:00:00Z" },
      // Pago parcial ya hecho después de que cerró el corte
      { tipo_accion: "pago_tarjeta", target_id: "t1", monto: 200, nota: "", fecha: "2026-07-02T00:00:00Z" },
      // Pago a otra tarjeta -- no debe descontarse de esta
      { tipo_accion: "pago_tarjeta", target_id: "t2", monto: 999, nota: "", fecha: "2026-07-02T00:00:00Z" },
    ];

    const resultado = proximoPagoDeTarjeta(tarjeta, movimientos, []);

    expect(resultado.monto).toBeCloseTo(300, 2);
  });

  it("never returns a negative monto when payments exceed the amount owed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 7));

    const tarjeta = { id: "t1", dia_corte: 25, dia_pago: 15 };
    const movimientos = [
      { tipo_accion: "gasto_credito", target_id: "t1", monto: 500, nota: "", fecha: "2026-06-10T00:00:00Z" },
      { tipo_accion: "pago_tarjeta", target_id: "t1", monto: 500, nota: "", fecha: "2026-07-02T00:00:00Z" },
    ];

    const resultado = proximoPagoDeTarjeta(tarjeta, movimientos, []);

    expect(resultado.monto).toBe(0);
  });
});

describe("proximaTarjetaAPagar", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("picks the tarjeta with the soonest pago among those that actually owe something", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 7));

    const tarjetas = [
      { id: "lejos", nombre: "Lejos", dia_corte: 1, dia_pago: 20 }, // próximo pago más lejano (20 julio)
      { id: "cero", nombre: "Sin deuda", dia_corte: 25, dia_pago: 15 }, // sin movimientos -> monto 0, se excluye
      { id: "cerca", nombre: "Cerca", dia_corte: 1, dia_pago: 8 }, // próximo pago más cercano (8 julio)
    ];
    const movimientos = [
      { tipo_accion: "gasto_credito", target_id: "lejos", monto: 100, nota: "", fecha: "2026-06-15T00:00:00Z" },
      { tipo_accion: "gasto_credito", target_id: "cerca", monto: 200, nota: "", fecha: "2026-06-10T00:00:00Z" },
    ];

    const resultado = proximaTarjetaAPagar(tarjetas, movimientos, []);
    expect(resultado.tarjeta.id).toBe("cerca");
  });

  it("switches to the next closest tarjeta once the nearest one is fully paid off", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 7));

    const tarjetas = [
      { id: "lejos", nombre: "Lejos", dia_corte: 1, dia_pago: 20 }, // próximo pago más lejano (20 julio)
      { id: "cerca", nombre: "Cerca", dia_corte: 1, dia_pago: 8 }, // próximo pago más cercano, pero ya pagada
    ];
    const movimientos = [
      { tipo_accion: "gasto_credito", target_id: "lejos", monto: 100, nota: "", fecha: "2026-06-15T00:00:00Z" },
      { tipo_accion: "gasto_credito", target_id: "cerca", monto: 200, nota: "", fecha: "2026-06-10T00:00:00Z" },
      // El usuario ya liquidó "cerca" -- debe dejar de aparecer como pendiente
      { tipo_accion: "pago_tarjeta", target_id: "cerca", monto: 200, nota: "", fecha: "2026-07-02T00:00:00Z" },
    ];

    const resultado = proximaTarjetaAPagar(tarjetas, movimientos, []);
    expect(resultado.tarjeta.id).toBe("lejos");
  });

  it("returns null when no tarjeta has anything due", () => {
    const tarjetas = [{ id: "t1", nombre: "Oro", dia_corte: 25, dia_pago: 15 }];
    expect(proximaTarjetaAPagar(tarjetas, [], [])).toBeNull();
  });
});
