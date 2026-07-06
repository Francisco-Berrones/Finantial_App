# Unit Test Execution

## Run Unit Tests

### 1. Execute All Unit Tests
```bash
npm run test
```

### 2. Review Test Results
- **Expected**: 3 archivos de test, 7 casos en total, 0 fallos:
  - `src/features/cuentas/CuentasManager.test.jsx` (3 casos: render, agregar, eliminar)
  - `src/features/tarjetas/TarjetasManager.test.jsx` (3 casos: render, agregar, eliminar)
  - `src/features/movimientos/MovimientoWizard.test.jsx` (2 casos: flujo completo, botones deshabilitados)
- **Test Coverage**: no configurado (fuera de alcance de este refactor); los tests son smoke tests, no cobertura exhaustiva.
- **Test Report Location**: salida de consola de Vitest (no hay reporter HTML configurado)

### 3. Fix Failing Tests
Si fallan:
1. Revisar el mensaje de Vitest en consola
2. Casos típicos: `data-testid` no coincide entre el componente y el test, o prop faltante al renderizar
3. Corregir el componente o el test según corresponda
4. Volver a correr `npm run test`

## Verificación manual complementaria (paridad funcional)
Dado que este es un refactor puro sin cambios de comportamiento, además de los tests automatizados corre `npm run dev` y confirma manualmente:
- [ ] Login funciona igual (mismo formulario, mismo error visible)
- [ ] Vista Inicio: resumen, tickets de cuentas/tarjetas, últimos 6 movimientos — igual que antes
- [ ] Vista Historial: lista completa + eliminar movimiento funciona
- [ ] Vista Cuentas: agregar/eliminar cuenta y tarjeta funciona
- [ ] Wizard de movimiento (botón "+"): los 3 pasos y el guardado funcionan para los 4 tipos de acción
- [ ] Estilos visuales idénticos (paleta, tipografía, layout) en las 3 vistas
