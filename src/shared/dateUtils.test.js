import { describe, it, expect, vi, afterEach } from "vitest";
import { diasHasta, formatDiasFaltantes, fechaUltimoCorte, fechaPagoDeCorte } from "./dateUtils";

describe("diasHasta", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when no día is provided", () => {
    expect(diasHasta(null)).toBeNull();
    expect(diasHasta(undefined)).toBeNull();
  });

  it("returns 0 when the día is today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15));
    expect(diasHasta(15)).toBe(0);
  });

  it("returns days remaining later this month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 10));
    expect(diasHasta(20)).toBe(10);
  });

  it("rolls over to next month when the día already passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 25));
    expect(diasHasta(5)).toBe(10);
  });

  it("clamps día 30 to the last day of a short month (february, non-leap year)", () => {
    vi.useFakeTimers();
    // 2026 is not a leap year, so February has 28 days.
    vi.setSystemTime(new Date(2026, 1, 20));
    expect(diasHasta(30)).toBe(8); // 28 - 20
  });

  it("clamps día 31 to the last day of the month when rolling over into february", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 31));
    expect(diasHasta(31)).toBe(0); // today already is the clamped 31st of january
  });
});

describe("fechaUltimoCorte / fechaPagoDeCorte", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("finds the most recent past corte, not the next future one", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 7)); // July 7
    const ultimo = fechaUltimoCorte(25); // día 25 -> most recent was June 25
    expect(ultimo.getMonth()).toBe(5);
    expect(ultimo.getDate()).toBe(25);
  });

  it("places the pago in the month after the corte when the pago día is numerically smaller", () => {
    // Corte día 25, pago día 15 -> pago belongs to the month AFTER the corte.
    const corte = new Date(2026, 5, 25); // June 25
    const pago = fechaPagoDeCorte(corte, 15);
    expect(pago.getMonth()).toBe(6); // July
    expect(pago.getDate()).toBe(15);
  });

  it("keeps the pago in the same month as the corte when the pago día is larger", () => {
    // Corte día 10, pago día 30 -> same month.
    const corte = new Date(2026, 5, 10); // June 10
    const pago = fechaPagoDeCorte(corte, 30);
    expect(pago.getMonth()).toBe(5);
    expect(pago.getDate()).toBe(30);
  });
});

describe("formatDiasFaltantes", () => {
  it("formats 0, 1, and N days", () => {
    expect(formatDiasFaltantes(0)).toBe("hoy");
    expect(formatDiasFaltantes(1)).toBe("en 1 día");
    expect(formatDiasFaltantes(8)).toBe("en 8 días");
  });
});
