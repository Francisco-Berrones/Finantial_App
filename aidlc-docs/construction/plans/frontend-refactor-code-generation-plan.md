# Code Generation Plan — Unit: frontend-refactor

**Unit context**: Único unit del proyecto (no hubo Units Generation — proyecto pequeño de un solo módulo). Cubre toda la reorganización de `App.jsx` en la estructura `src/` por feature, sin cambios funcionales, más setup de Vitest + RTL.
**Dependencies**: Ninguna (no hay otros units).
**Database entities**: Ninguna (sin cambios de esquema Supabase).

## Steps

- [x] Step 1 — Project Structure Setup: crear `src/` con subcarpetas `shared/lib`, `shared/auth`, `features/cuentas`, `features/tarjetas`, `features/movimientos`, `pages/`; mover `main.jsx` a `src/main.jsx` y actualizar referencia en `index.html`.
- [x] Step 2 — Shared Layer: mover `supabaseClient.js` → `src/shared/lib/supabaseClient.js`; crear `src/shared/format.js` (`fmt`, `fmtFecha`) y `src/shared/constants.js` (`ACCIONES`); extraer `Login` → `src/shared/auth/Login.jsx`.
- [x] Step 3 — Feature `cuentas`: crear `src/features/cuentas/useCuentas.js` (fetch, add, delete) y `src/features/cuentas/CuentaTicket.jsx` (presentación del ticket de cuenta usado en Inicio).
- [x] Step 4 — Feature `tarjetas`: crear `src/features/tarjetas/useTarjetas.js` (fetch, add, delete), `src/features/tarjetas/TarjetaTicket.jsx` (ticket en Inicio) y `src/features/tarjetas/TarjetaCardVisual.jsx` (tarjeta visual en gestión).
- [x] Step 5 — Vista de gestión `cuentas` (manage view): crear `src/features/cuentas/CuentasManager.jsx` y `src/features/tarjetas/TarjetasManager.jsx` para reemplazar el bloque `view === "cuentas"`.
- [x] Step 6 — Feature `movimientos`: crear `src/features/movimientos/useMovimientos.js` (fetch, commitMovimiento, deleteMovimiento), `src/features/movimientos/MovimientoRow.jsx`, `src/features/movimientos/MovimientoWizard.jsx` (bottom sheet 3 pasos) y `src/features/movimientos/HistorialView.jsx` (vista "historial").
- [x] Step 7 — Page `InicioView`: crear `src/pages/InicioView.jsx` componiendo resumen + tickets de cuentas/tarjetas + últimos movimientos.
- [x] Step 8 — Orquestador: reescribir `src/MainApp.jsx` usando los hooks/vistas anteriores (state `view`, sheet wizard, tabbar); simplificar `src/App.jsx` para que solo gestione sesión y renderice `Login`/`MainApp`.
- [x] Step 9 — Automation-friendly attributes: agregar `data-testid` estables a botones/inputs clave (login, tabbar, fab, guardar movimiento, eliminar) siguiendo convención `{component}-{element-role}`.
- [x] Step 10 — Testing setup: agregar devDependencies `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`; crear `vitest.config.js` y `src/test/setup.js`; agregar script `"test": "vitest run"` en `package.json`.
- [x] Step 11 — Smoke tests por feature: `CuentasManager.test.jsx`, `TarjetasManager.test.jsx`, `MovimientoWizard.test.jsx` (render básico + interacción principal, mockeando `supabase`).
- [x] Step 12 — Documentation: generar resumen en `aidlc-docs/construction/frontend-refactor/code/summary.md` con el mapeo archivo-viejo → archivo-nuevo.

## Story Traceability
Refactor puro (sin user stories generadas) — trazabilidad directa a `requirements.md` FR1–FR4.
