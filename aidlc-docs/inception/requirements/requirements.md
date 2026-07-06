# Requirements — Reorganización de estructura del proyecto

**Profundidad**: Minimal/Standard (refactor puro, sin cambios funcionales, brownfield con reverse engineering ya completado)

## Intent
Separar la lógica y presentación actualmente concentradas en un único `App.jsx` (565 líneas) en una estructura de carpetas estándar para proyectos Vite + React, sin cambiar comportamiento, estilos visuales ni el modelo de datos de Supabase.

## Decisiones (de preguntas de clarificación)
1. **Convención de carpetas**: por feature — `src/features/cuentas`, `src/features/tarjetas`, `src/features/movimientos`, más una carpeta compartida (`src/shared` o similar) para el cliente Supabase, `Login`, formato de moneda/fecha, e iconos/estilos comunes.
2. **TypeScript**: no se migra en este cambio — se mantiene JavaScript (`.jsx`/`.js`).
3. **Testing**: se agrega Vitest + React Testing Library, con configuración base y al menos pruebas de humo para los componentes extraídos por feature.

## Functional Requirements
- FR1: El comportamiento visible de la app (login, vistas inicio/historial/cuentas, wizard de movimientos, CRUD de cuentas/tarjetas) debe permanecer idéntico tras la reorganización.
- FR2: Cada feature (`cuentas`, `tarjetas`, `movimientos`) debe encapsular sus propios componentes de presentación y su lógica de acceso a datos (hooks) relacionados con esa entidad.
- FR3: El cliente Supabase, el login, y utilidades compartidas (formato moneda/fecha, catálogo `ACCIONES`) deben vivir en un módulo compartido reutilizable por las features.
- FR4: Se agrega infraestructura de testing (Vitest + RTL) con al menos un test de humo por feature extraída.

## Non-Functional Requirements
- NFR1: Cero cambios de comportamiento — mismo `npm run dev` / `npm run build` deben producir la misma app funcionalmente.
- NFR2: No se modifica el esquema de Supabase (tablas, RPCs) ni las variables de entorno.
- NFR3: Los estilos (actualmente `<style>` inline por componente) se mueven junto con su componente, sin refactor de CSS en este cambio.

## Out of Scope
- Migración a TypeScript
- Cambios de UX/UI o nuevas funcionalidades
- Introducción de router o gestor de estado externo
- Cambios al esquema o funciones RPC de Supabase

## Assumptions
- El proyecto seguirá usando Vite como bundler (no se migra a Next.js ni otro framework)
- `npm` sigue siendo el gestor de paquetes
