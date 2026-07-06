# Code Generation Summary — frontend-refactor

## Estado de ejecución del entorno
**No se pudo ejecutar `npm install` / `npm run build` / `npm run test` en esta sesión**: el entorno no tiene Node.js instalado (`node`/`npm` no encontrados en PATH). El código fue verificado manualmente (rutas de import, exports, props) pero **debes correr localmente**:
```bash
npm install
npm run dev     # verificación visual/funcional
npm run build   # verificación de compilación
npm run test    # smoke tests con Vitest
```
antes de dar por cerrado el Build and Test.

## Mapeo archivo viejo → archivo nuevo

| Antes | Ahora |
|---|---|
| `main.jsx` | `src/main.jsx` (import actualizado en `index.html` a `/src/main.jsx`) |
| `supabaseClient.js` | `src/shared/lib/supabaseClient.js` |
| `App.jsx` → `fmt`, `fmtFecha` | `src/shared/format.js` |
| `App.jsx` → `ACCIONES` | `src/shared/constants.js` |
| `App.jsx` → `Login()` | `src/shared/auth/Login.jsx` |
| `App.jsx` → `App()` (root, sesión) | `src/App.jsx` |
| `App.jsx` → `MainApp()` (fetch, `<style>`, header, tabbar, view switch) | `src/MainApp.jsx` |
| `App.jsx` → estado/fetch/CRUD de `cuentas` | `src/features/cuentas/useCuentas.js` |
| `App.jsx` → ticket de cuenta (vista Inicio) | `src/features/cuentas/CuentaTicket.jsx` |
| `App.jsx` → bloque de gestión de cuentas (vista "cuentas") | `src/features/cuentas/CuentasManager.jsx` (+ `CuentasManager.test.jsx`) |
| `App.jsx` → estado/fetch/CRUD de `tarjetas` | `src/features/tarjetas/useTarjetas.js` |
| `App.jsx` → ticket de tarjeta (vista Inicio) | `src/features/tarjetas/TarjetaTicket.jsx` |
| `App.jsx` → tarjeta visual (vista "cuentas") | `src/features/tarjetas/TarjetaCardVisual.jsx` |
| `App.jsx` → bloque de gestión de tarjetas (vista "cuentas") | `src/features/tarjetas/TarjetasManager.jsx` (+ `TarjetasManager.test.jsx`) |
| `App.jsx` → estado/fetch/`commitMovimiento`/`deleteMovimiento` | `src/features/movimientos/useMovimientos.js` |
| `App.jsx` → fila de movimiento | `src/features/movimientos/MovimientoRow.jsx` |
| `App.jsx` → vista "historial" | `src/features/movimientos/HistorialView.jsx` |
| `App.jsx` → sheet wizard de 3 pasos | `src/features/movimientos/MovimientoWizard.jsx` (+ `MovimientoWizard.test.jsx`) |
| `App.jsx` → vista "inicio" | `src/pages/InicioView.jsx` |

## Decisiones de diseño
- El bloque `<style>` compartido (tokens de color, `.ticket`, `.mov-row`, `.sheet`, `.card-visual`, etc.) permaneció en `MainApp.jsx` porque define el sistema visual usado por múltiples features dentro del wrapper `.app-root`; separarlo habría sido un refactor de CSS fuera de alcance (NFR3 de `requirements.md`).
- Los managers de `cuentas`/`tarjetas` y el `MovimientoWizard` reciben las funciones de mutación (`addCuenta`, `deleteCuenta`, `commitMovimiento`, etc.) como props en lugar de importar `supabase` directamente — esto permite testear estos componentes con mocks simples, sin necesidad de mockear el cliente de Supabase.
- `data-testid` agregados con convención `{component}-{element-role}` (o `-{id}` cuando aplica a un ítem de lista) en todos los elementos interactivos.

## Archivos creados
- Estructura completa `src/` (17 archivos de aplicación + 3 archivos de test)
- `vitest.config.js`, `src/test/setup.js`
- `package.json` actualizado: script `test`, devDependencies de testing

## Archivos eliminados (migrados)
- `App.jsx`, `main.jsx`, `supabaseClient.js` (raíz)
