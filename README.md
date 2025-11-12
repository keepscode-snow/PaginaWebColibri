Colibrí — Monorepo Frontend + Backend

Resumen
- Frontend: React + Vite (SPA) en `frontend/`
- Backend: Django + DRF + JWT + MySQL en `backend/`
- Desarrollo: Frontend en http://localhost:5173, Backend en http://localhost:8000, proxy `/api` configurado

Estructura
- `backend/`  (Proyecto Django y app `gestion`)
- `frontend/` (Aplicación React con Vite)

Requisitos
- Node.js >= 18 y npm
- Python 3.12
- MySQL 8 (o compatible) en `127.0.0.1:3308`

Base de datos
- Configuración por defecto en `backend/proyecto_colibri/settings.py`:
  - NAME: `colibri`
  - USER: `colibri_usuario`
  - PASSWORD: `colibri_usuario`
  - HOST: `127.0.0.1`
  - PORT: `3308`
- Creación rápida:
  - CREATE DATABASE colibri CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  - CREATE USER 'colibri_usuario'@'%' IDENTIFIED BY 'colibri_usuario';
  - GRANT ALL PRIVILEGES ON colibri.* TO 'colibri_usuario'@'%';
  - FLUSH PRIVILEGES;

Backend (Django)
1) Instalación
   - cd `backend`
   - py -3.12 -m venv .venv
   - .venv\Scripts\Activate.ps1
   - pip install -U pip
   - pip install -r requirements.txt
2) Migraciones y superusuario
   - python manage.py migrate
   - python manage.py createsuperuser
3) Ejecutar
   - python manage.py runserver 0.0.0.0:8000
   - Se abrirá automáticamente `http://127.0.0.1:8000/admin/` en tu navegador.
     - Para desactivar esta apertura automática, exporta `DISABLE_AUTO_BROWSER=1` en tu entorno.
4) Autenticación y CORS/CSRF
   - CORS permitido: http://localhost:5173 y http://localhost:3000
   - Endpoints JWT:
     - POST `/api/auth/token/` {"username","password"}
     - POST `/api/auth/refresh/` {"refresh"}
5) API disponible (fase 1)
   - Auth: POST `/api/auth/token/` y `/api/auth/refresh/`
   - Usuario actual: GET `/api/me/`
   - Productos: GET `/api/productos/`
   - Actualizar producto: PATCH `/api/productos/<id>/` (admin)
   - Ventas: POST `/api/ventas/` con items
   - Pedidos: GET `/api/pedidos/`, POST `/api/pedidos/`, PATCH `/api/pedidos/<id>/` (estado)

Frontend (Vite)
1) Instalación
   - cd `frontend`
   - npm ci
2) Desarrollo
   - npm run dev  (sirve en http://localhost:5173)
   - Proxy `/api` → http://localhost:8000 (config en `vite.config.js`)
   - El frontend usa API real para login, productos (listado y actualización de precio), ventas y pedidos (listar/crear/cambiar estado).
3) Producción
   - npm run build (genera `dist/`)

Flujo de trabajo sugerido
- Mantener mocks del frontend mientras se integran endpoints reales.
- Migración progresiva:
  1) Reemplazar login mock por `/api/auth/token/`.
  2) Reemplazar productos mock por `GET /api/productos/`.
  3) Agregar endpoints de ventas/pedidos según modelo existente.

Convenciones
- Ramas: `feature/*`, `fix/*`, `chore/*`
- Commits convencionales: `feat`, `fix`, `docs`, `chore`, `refactor`
- Prefijo API: `/api` (futuro versionado `/api/v1`)

Solución de problemas
- CORS/CSRF 403: verifica `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` en settings.
- mysqlclient en Windows: requiere Build Tools; como alternativa usar `PyMySQL`.
- Puertos ocupados: cambia `5173` (Vite) o `8000` (Django) y actualiza CORS.

Notas
- Se eliminaron las plantillas HTML del backend (Django) porque el frontend (SPA) consume solo la API.
- Se eliminó un duplicado de la app `gestion` que estaba dentro del paquete del proyecto para evitar ambigüedades de importación.
- Zona horaria y locale configurados: `es-cl`, `America/Santiago`.
