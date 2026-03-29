# Huerta Gestor - TFM

Aplicación full-stack para la gestión de huertas y cultivos, desarrollada con Angular 19 (frontend) y Node.js/Express (backend) con PostgreSQL.

## Requisitos previos

- **Node.js** 18+ 
- **PostgreSQL** 16+
- **npm** 9+

## Estructura del proyecto

```
TFM/
├── App-Back/           # Backend (Node.js + Express + PostgreSQL)
├── APP-Front/         # Frontend (Angular 19)
└── wireframes/        # Wireframes de la aplicación
```

## Configuración de la base de datos

### 1. Crear la base de datos

```bash
psql -U postgres -c "CREATE DATABASE huerta_gestor;"
```

### 2. Ejecutar las migraciones

```bash
cd App-Back
psql -U postgres -d huerta_gestor -f src/db/tables/tables.sql
psql -U postgres -d huerta_gestor -f src/db/tables/seed_initial_roles.sql
```

### 3. Poblar datos iniciales (cultivos)

```bash
cd App-Back
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
npm run seed:crops
```

---

## Backend

### Instalación

```bash
cd App-Back
npm install
```

### Configuración

Crear archivo `.env` basado en `.env.example`:

```env
PORT=3000
DATABASE_URL=postgresql://usuario:password@localhost:5432/huerta_gestor
NODE_ENV=development
```

### Ejecución

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm run build
node build/src/apps/backend/server.js
```

El backend estará disponible en: `http://localhost:3000`

---

## Frontend

### Instalación

```bash
cd APP-Front/app-front
npm install
```

### Ejecución

```bash
# Desarrollo
npm start

# O con Angular CLI
ng serve
```

La aplicación estará disponible en: `http://localhost:4200`

### Construcción

```bash
npm run build
```

Los archivos se generarán en `APP-Front/app-front/dist/`

---

## Uso de la aplicación

1. **Iniciar el backend** en `http://localhost:3000`
2. **Iniciar el frontend** en `http://localhost:4200`
3. **Registrarse** en la aplicación
4. **Crear una Huerta** con ubicación y zona climática
5. **Crear Parcelas** dentro de la Huerta
6. **Consultar el Catálogo de Cultivos** y seleccionar especies
7. **Registrar Siembra** en una parcela
8. **Seguimiento** del cultivo hasta la cosecha

---

## Herramientas de desarrollo

### Linting y formato

```bash
# Backend
cd App-Back
npm run lint

# Frontend
cd APP-Front/app-front
npm run lint        # ESLint
npm run lint:fix    # ESLint con auto-corrección
npm run prettier    # Formatear código
```

### Pruebas

```bash
# Backend
cd App-Back
npm run test           # Todas las pruebas
npm run test:unit      # Pruebas unitarias
npm run test:features  # Pruebas de características

# Frontend
cd APP-Front/app-front
npm test
```

### Thunder Client (API)

Importar colección desde `.vscode/tfm-huerta-gestor-api.json` para probar los endpoints.

---

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | Angular 19, TypeScript, RxJS |
| Backend | Node.js, Express, TypeScript |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT (jsonwebtoken) |
| Testing | Jest (backend), Karma/Jasmine (frontend) |
| Formato | ESLint, Prettier |

---

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuarios |
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/auth/me` | Usuario actual |
| GET/POST | `/api/gardens` | Listar/Crear huertas |
| GET/PUT/DELETE | `/api/gardens/:id` | CRUD huerta |
| GET/POST | `/api/plots` | Listar/Crear parcelas |
| GET | `/api/crops` | Catálogo de cultivos |
| GET/POST | `/api/plantings` | Listar/Crear siembras |
| POST | `/api/plantings/:id/harvest` | Cosechar cultivo |

---

## Licencia

ISC - Sergio Sanisidro
