# Build Instructions

## Prerequisites
- **Build Tool**: Vite 5 (via npm scripts)
- **Runtime**: Node.js (LTS recomendado, ej. 18.x o 20.x) + npm
- **Dependencies**: ver `package.json` (react, react-dom, @supabase/supabase-js, lucide-react + devDependencies de Vite/Vitest)
- **Environment Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (en `.env.local`, ver `.env.example`)
- **System Requirements**: cualquier OS con Node.js instalado

## Build Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# edita .env.local con tus credenciales reales de Supabase
```

### 3. Build
```bash
npm run build
```

### 4. Verify Build Success
- **Expected Output**: Vite genera `dist/` sin errores, resolviendo todos los imports de `src/` (incluyendo la nueva estructura por feature).
- **Build Artifacts**: `dist/index.html`, `dist/assets/*.js`, `dist/assets/*.css`
- **Common Warnings**: ninguno esperado; si aparecen warnings de "unused import" revisar que no haya quedado un import huérfano tras el refactor.

## Troubleshooting

### Build Fails with Dependency Errors
- **Cause**: `npm install` no se corrió después de agregar las devDependencies de testing (vitest, @testing-library/*, jsdom).
- **Solution**: `rm -rf node_modules package-lock.json && npm install`

### Build Fails with Compilation/Import Errors
- **Cause**: import relativo roto tras mover archivos a `src/features/*` o `src/shared/*`.
- **Solution**: verificar que las rutas relativas (`../../shared/...`) coincidan con la profundidad de carpetas de cada archivo.

## Nota de esta sesión
Este entorno de trabajo no tiene Node.js instalado, por lo que estos comandos **no fueron ejecutados automáticamente**. Debes correrlos localmente para confirmar que el build es exitoso.
