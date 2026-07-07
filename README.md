# FinTrack — Mi Cartera

Aplicación web personal de finanzas, pensada primero para uso en móvil. Permite llevar
control de cuentas de ahorro, tarjetas de crédito (con fechas de corte/pago y compras a
meses sin intereses), categorizar gastos, dar seguimiento a suscripciones recurrentes, ver
gráficas de gasto por categoría, y consultar un asesor financiero con IA que responde
preguntas usando tus datos reales.

## Funcionalidades

- **Cuentas de ahorro y tarjetas de crédito** — alta, saldo, línea de crédito, día de corte
  y día de pago.
- **Movimientos** — registro de gastos con tarjeta, gastos/retiros de cuenta, pagos a
  tarjeta e ingresos, con historial filtrable por tipo, cuenta/tarjeta y rango de fechas.
- **Categorías** — predefinidas o creadas por el usuario, asignables a cualquier gasto,
  para dar trazabilidad de en qué se va el dinero.
- **Compras a meses sin intereses (MSI)** — registro por tarjeta, con seguimiento de
  mensualidad y saldo pendiente real (no estimado por calendario).
- **Trazabilidad de pagos a tarjeta** — al pagar una tarjeta puedes indicar si el dinero
  sale de una cuenta de ahorro (se descuenta su saldo) o es externo/efectivo.
- **Suscripciones recurrentes** — alta de suscripciones (Netflix, gimnasio, etc.) con
  frecuencia mensual o anual; la app detecta cuándo toca confirmar el cobro y lo registra
  como un movimiento normal con un toque.
- **Gráfica de gasto por categoría** — barras horizontales, filtrable por semana, mes, 3 o
  6 meses.
- **Asesor financiero (IA)** — chat con Claude que responde preguntas usando tus cuentas,
  tarjetas, gasto por categoría, suscripciones y compras a meses reales; con historial de
  conversaciones guardado y memoria dentro de cada conversación.

## Stack técnico

- **Frontend**: React 18 + Vite, sin router (navegación por estado interno), Framer Motion
  para transiciones, Recharts para gráficas, lucide-react para íconos.
- **Backend**: Supabase — Postgres con Row Level Security, Auth, funciones RPC para
  operaciones que afectan varias tablas de forma atómica, y una Edge Function (Deno) para
  el asesor de IA.
- **IA**: API de Anthropic (Claude Haiku), llamada solo desde la Edge Function — la llave
  nunca se expone al navegador.
- **Tests**: Vitest + React Testing Library.

## Estructura del proyecto

```
src/
  App.jsx                  Punto de entrada: maneja sesión y decide Login vs MainApp
  MainApp.jsx               Layout principal, navegación entre pantallas, estilos globales
  pages/
    InicioView.jsx           Pantalla de inicio (resumen, listas, accesos)
  features/
    cuentas/                 Cuentas de ahorro
    tarjetas/                 Tarjetas de crédito, compras a meses (MSI)
    movimientos/               Registro y consulta de movimientos
    categorias/                 Categorías de gasto
    suscripciones/               Suscripciones recurrentes
    resumen/                      Gráfica de gasto por categoría
    asesor/                        Chat con IA y su historial de conversaciones
  shared/
    auth/Login.jsx            Pantalla de login
    lib/supabaseClient.js       Cliente de Supabase configurado
    constants.js                 Catálogo de tipos de movimiento
    dateUtils.js                  Cálculo de días/fechas de corte y pago
    format.js                      Formato de moneda y fechas

supabase/
  functions/asesor-chat/       Edge Function: arma el resumen financiero y llama a Claude
```

Cada carpeta en `features/` sigue el mismo patrón: un hook `use*.js` que habla con
Supabase, y uno o más componentes `*View.jsx` / `*Manager.jsx` que arman la pantalla.

## Configuración

1. Copia `.env.example` a `.env.local` y llena tu URL y llave anónima de Supabase.
2. `npm install`
3. `npm run dev`

Para el asesor de IA, además necesitas:

```bash
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase secrets set ANTHROPIC_API_KEY=sk-ant-tu-llave
supabase functions deploy asesor-chat
```

## Tests

```bash
npm run test
```
