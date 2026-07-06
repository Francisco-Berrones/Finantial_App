# Reverse Engineering — Mi Cartera (Registro Financiero)

## Business Overview
App móvil-first de finanzas personales ("Mi cartera"): un único usuario autenticado con Supabase Auth registra cuentas de ahorro y tarjetas de crédito, y crea movimientos (gastos con tarjeta, gastos/retiros de débito, pagos a tarjeta, ingresos). La UI muestra un resumen (ahorro total / crédito disponible), listas de cuentas/tarjetas, historial de movimientos y un asistente tipo "bottom sheet" de 3 pasos para registrar movimientos.

## Technology Stack
- **Frontend**: React 18 + Vite 5, JSX, sin TypeScript
- **Backend/BaaS**: Supabase (Postgres + Auth + RPC), acceso vía `@supabase/supabase-js`
- **Icons**: lucide-react
- **Estilos**: CSS-in-JS inline (`<style>` embebido) por componente, sin framework CSS
- **PWA**: `manifest.json` + meta tags apple-mobile-web-app

## Architecture
Frontend puro (SPA) sin servidor Node propio: toda la persistencia y lógica de negocio de escritura (transacciones atómicas) vive en funciones RPC de Postgres (`registrar_movimiento`, `eliminar_movimiento`) expuestas por Supabase. No hay backend Express/Node en este repo.

## Code Structure (estado actual)
```
/main.jsx            entry point, monta <App/>
/App.jsx              TODO el frontend en un solo archivo (565 líneas):
                        - Login()          componente de autenticación
                        - MainApp(session)  componente principal (estado, fetch, mutaciones, 3 vistas, sheet wizard)
                        - App()             root: gestiona sesión y decide Login vs MainApp
/supabaseClient.js     cliente supabase singleton (env vars VITE_SUPABASE_URL/ANON_KEY)
/index.html, manifest.json, vite.config.js   config de Vite/PWA
```

## Component Inventory
| Componente | Responsabilidad | Estado local |
|---|---|---|
| `Login` | formulario email/password, `signInWithPassword` | email, password, error, loading |
| `MainApp` | orquesta todo: fetch de datos, 3 vistas (inicio/historial/cuentas), CRUD cuentas/tarjetas, wizard de movimientos | ~15 variables de estado |
| `App` (root) | sesión Supabase (`getSession`, `onAuthStateChange`) | session, checking |

No hay componentes de presentación reutilizables extraídos: tickets de cuenta/tarjeta, filas de movimiento, tarjetas visuales, formularios y el sheet-wizard están todos inline dentro de `MainApp`.

## API / Data Access (Supabase)
- Tablas: `cuentas`, `tarjetas`, `movimientos` (SELECT, INSERT, DELETE directos vía supabase-js)
- RPC: `registrar_movimiento(p_tipo_accion, p_target_tipo, p_target_id, p_monto, p_nota)`, `eliminar_movimiento(p_movimiento_id)`
- Auth: `auth.signInWithPassword`, `auth.getSession`, `auth.onAuthStateChange`, `auth.signOut`

## Interaction Diagram (flujo principal)
```
App (root)
 └─ getSession/onAuthStateChange ─▶ session?
     ├─ no  ─▶ Login ─▶ signInWithPassword ─▶ (listener actualiza session)
     └─ sí  ─▶ MainApp
         ├─ fetchAll() ─▶ select cuentas, tarjetas, movimientos (Promise.all)
         ├─ vista "inicio"    ─▶ resumen + tickets + últimos movimientos
         ├─ vista "historial" ─▶ lista completa + eliminar_movimiento (RPC)
         ├─ vista "cuentas"   ─▶ CRUD cuentas/tarjetas (insert/delete directo)
         └─ sheet wizard (3 pasos) ─▶ registrar_movimiento (RPC) ─▶ fetchAll()
```

## Dependencies
```json
"dependencies": { "@supabase/supabase-js", "lucide-react", "react", "react-dom" }
"devDependencies": { "@vitejs/plugin-react", "vite" }
```
Sin backend Node/Express propio, sin router (una sola pantalla con `view` como state), sin gestor de estado externo (todo con `useState`/`useCallback`).

## Pain Point Identificado (motivo de esta solicitud)
Todo el frontend (formularios, vistas, estilos, llamadas a datos, lógica de negocio) vive en un único archivo `App.jsx` de 565 líneas / 30 KB. No existe separación entre componentes de presentación, hooks de datos, y capa de acceso a Supabase.
