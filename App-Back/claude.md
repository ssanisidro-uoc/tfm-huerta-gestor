# Claude.md - Trabajo Fin de Máster (TFM) - Backend Agrícola

## 📋 Descripción del Proyecto

Backend para un sistema de gestión agrícola desarrollado en **Node.js + Express + TypeScript** con base de datos **PostgreSQL**.

Sistema completo para:
- Gestión de usuarios con roles jerárquicos
- Administración de huertos (jardines) y parcelas
- Planificación de cultivos y rotación de cosechas
- Gestión de tareas agrícolas con recurrencia
- Integración de datos meteorológicos
- Calendario lunar para agricultura biodinámica
- Observaciones y análisis de compatibilidad de cultivos

---

## 🏗️ Stack Tecnológico

| Componente | Versión | Propósito |
|-----------|---------|----------|
| Node.js | LTS | Runtime |
| TypeScript | ^5.2.2 | Type safety |
| Express | ^4.18.2 | Framework web |
| PostgreSQL | 14+ | Base de datos |
| pg | ^8.11.0 | Driver PostgreSQL |
| dotenv | ^16.0.3 | Variables de entorno |
| ts-node-dev | ^2.0.0 | Dev con hot-reload |
| ESLint + Prettier | Latest | Code quality |

---

## ⚙️ Inyección de Dependencias (DI)

### **Estructura**

```
src/apps/backend/dependency-injection/
├── index.ts                    # Contenedor YAML
├── application.yaml            # Configuración principal (servicios compartidos)
└── <BoundedContext>/
    └── application.yaml        # Configuración del contexto acotado
    
Ejemplo:
src/apps/backend/dependency-injection/
├── index.ts
├── application.yaml
└── User/
    └── application.yaml
```

### **Patrón de Codely**

Seguimos el patrón de **Codely**: 
- Un contenedor centralizado (`index.ts`)
- Archivo YAML por bounded context
- Los YAML cargan automáticamente todas las carpetas que contienen `application.yaml`

### **Definir un nuevo Bounded Context**

1. Crear carpeta: `src/apps/backend/dependency-injection/<BoundedContext>/`
2. Crear archivo: `src/apps/backend/dependency-injection/<BoundedContext>/application.yaml`
3. Definir servicios en YAML (será cargado automáticamente)

```yaml
# User/application.yaml
services:
  user.creator:
    class: "@/src/Contexts/User/application/Create/UserCreator"
    arguments:
      - "@user.repository"

  user.repository:
    class: "@/src/Contexts/User/infrastructure/persistence/PostgresUserRepository"
    arguments:
      - "@database.pool"
```

### **Sintaxis YAML**

```yaml
services:
  my.service.key:
    class: "@/ruta/a/La/Clase"  # @ = ruta absoluta desde src
    arguments:
      - "@otro.servicio"         # @ = referencia a otro servicio
      - "%env(VARIABLE_NAME)%"    # %env(...) = variable de entorno
      - valor_literal
      - 123
```

---

## 📚 Bounded Contexts Implementados

### **1️⃣ User Context** (Usuario)
```
src/Contexts/User/
├── domain/
│   ├── User.ts
│   ├── UserId.ts
│   ├── UserEmail.ts
│   ├── UserRepository.ts
│   └── UserCreatedDomainEvent.ts
├── application/
│   ├── Create/
│   ├── Find/
│   └── mappers/
└── infrastructure/
    └── persistence/
        └── PostgresUserRepository.ts
```
- **Responsabilidades**: Gestión de usuarios, autenticación, perfiles
- **Agregados**: User
- **Repositorios**: PostgresUserRepository

### **2️⃣ Garden Context** (Huerto/Jardín)
```
src/Contexts/Garden/
├── domain/
│   ├── Garden.ts
│   ├── GardenId.ts
│   ├── GardenName.ts
│   └── GardenRepository.ts
├── application/
│   ├── GardenCreator.ts
│   └── GardenFinder.ts
└── infrastructure/
    └── persistence/
        └── PostgresGardenRepository.ts
```
- **Responsabilidades**: Creación y gestión de huertos
- **Agregados**: Garden
- **Operaciones**: crear, buscar por ID, listar por dueño
- **DI**: `src/apps/backend/dependency-injection/Garden/application.yaml`

### **3️⃣ Crop Context** (Cultivo)
```
src/Contexts/Crop/
├── domain/
│   ├── Crop.ts
│   ├── CropId.ts
│   ├── CropName.ts
│   └── CropRepository.ts
├── application/
│   └── CropFinder.ts
└── infrastructure/
    └── persistence/
        └── PostgresCropRepository.ts
```
- **Responsabilidades**: Catálogo de cultivos, datos agronómicos
- **Agregados**: Crop (solo lectura del catálogo)
- **Operaciones**: listar todos, buscar por ID, filtrar por familia
- **DI**: `src/apps/backend/dependency-injection/Crop/application.yaml`

### **4️⃣ Planting Context** (Plantación)
```
src/Contexts/Planting/
├── domain/
│   ├── Planting.ts
│   ├── PlantingId.ts
│   └── PlantingRepository.ts
├── application/
│   ├── PlantingCreator.ts
│   └── PlantingFinder.ts
└── infrastructure/
    └── persistence/
        └── PostgresPlantingRepository.ts
```
- **Responsabilidades**: Instancias de cultivos en parcelas, ciclo de cultivo
- **Agregados**: Planting
- **Relaciones**: Crop (referencia), Garden (referencia)
- **Operaciones**: crear, buscar, listar por huerto, listar activas
- **DI**: `src/apps/backend/dependency-injection/Planting/application.yaml`

### **5️⃣ Task Context** (Tarea)
```
src/Contexts/Task/
├── domain/
│   ├── Task.ts
│   ├── TaskId.ts
│   ├── TaskTitle.ts
│   └── TaskRepository.ts
├── application/
│   ├── TaskCreator.ts
│   └── TaskFinder.ts
└── infrastructure/
    └── persistence/
        └── PostgresTaskRepository.ts
```
- **Responsabilidades**: Gestión de tareas agrícolas con recurrencia
- **Agregados**: Task
- **Relaciones**: Garden (referencia), User (asignado)
- **Operaciones**: crear, buscar, listar pendientes, marcar completadas
- **Propiedades especiales**: recurrencia, estado (pending/completed)
- **DI**: `src/apps/backend/dependency-injection/Task/application.yaml`

---

## 🔗 Relaciones entre Contextos

```
User ──────┐
           │
           ├──→ Garden ──────┐
           │                  │
           │                  ├──→ Planting ←── Crop
           │                  │
           └──────────────→ Task
```

- **User** es propietario de **Gardens**
- **Garden** contiene **Plantings** (cultivos sembrados)
- **Planting** referencia **Crop** (del catálogo)
- **Task** está asociada a un **Garden** y puede asignarse a un **User**

---

```
src/
├── app.ts                    # Express server entry point
├── db/
│   ├── connection.ts         # Pool de PostgreSQL
│   └── tables/
│       ├── tables.sql        # Schema SQL (28 tablas)
│       └── seed_initial_roles.sql
├── controllers/
│   ├── auth.controller.ts
│   ├── users.controller.ts
│   ├── gardens.controller.ts
│   ├── tasks.controller.ts
│   └── [...]
├── services/
│   ├── auth.service.ts
│   ├── users.service.ts
│   ├── gardens.service.ts
│   └── [...]
├── routes/
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   ├── gardens.routes.ts
│   └── index.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
├── types/
│   ├── index.ts             # Tipos globales
│   ├── user.types.ts
│   ├── garden.types.ts
│   └── [...]
├── utils/
│   ├── errors.ts            # AppError class
│   ├── logger.ts
│   └── validators.ts
└── constants/
    ├── roles.ts
    ├── http_status.ts
    └── messages.ts
```

---

## 🔐 Convenciones de Código

### **Variables y Funciones**

```typescript
// ✅ CORRECTO: snake_case para variables
const user_id: string = '550e8400-e29b-41d4-a716-446655440000';
const garden_name: string = 'Mi huerto principal';
let is_active: boolean = true;
const max_plot_surface: number = 1000;

// ❌ INCORRECTO: NO usar camelCase
// const userId = '...';
// const gardenName = '...';
// let isActive = true;
```

```typescript
// ✅ CORRECTO: Funciones descriptivas con tipos explícitos
async function get_user_by_id(user_id: string): Promise<User | null> {
  // ...
}

async function create_garden(user_id: string, garden_data: CreateGardenDTO): Promise<Garden> {
  // ...
}

function validate_email(email: string): boolean {
  // ...
}

// ❌ INCORRECTO: NO usar any
// async function getUserById(userId: any): Promise<any> { }
```

### **Tipos Explícitos (NUNCA usar `any`)**

```typescript
// ✅ CORRECTO: Tipos siempre definidos
interface User {
  id: string;
  email: string;
  password_hash: string;
  role_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

class UserService {
  async get_user(user_id: string): Promise<User | null> {
    // return type explícito
  }
}

// ❌ INCORRECTO: NO esto
// function getUserData(id: any): any { }
// const data: any = { ... };
```

### **DTOs (Data Transfer Objects)**

```typescript
// Request DTOs
interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

interface UpdateGardenDTO {
  name?: string;
  surface_m2?: number;
  climate_zone?: string;
}

// Response DTOs
interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: UserRole };
  created_at: Date;
}
```

### **Manejo de Errores**

```typescript
// ✅ CORRECTO: Usar AppError personalizado
class AppError extends Error {
  constructor(
    public status_code: number,
    public message: string,
    public is_operational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Uso:
if (!user) {
  throw new AppError(404, 'Usuario no encontrado', true);
}

// ❌ INCORRECTO: No lanzar Error genérico
// throw new Error('User not found');
```

### **Async/Await (NUNCA Callbacks)**

```typescript
// ✅ CORRECTO: async/await
async function process_garden_data(garden_id: string): Promise<void> {
  try {
    const garden = await get_garden(garden_id);
    const plots = await get_plots_by_garden(garden_id);
    // ...
  } catch (error) {
    // handle error
  }
}

// ❌ INCORRECTO: NO callbacks
// function processGardenData(gardenId, callback) {
//   getGarden(gardenId, (err, garden) => {
//     // callback hell
//   });
// }
```

### **Transacciones PostgreSQL**

```typescript
// ✅ CORRECTO: Usar transacciones para operaciones relacionadas
async function create_garden_with_user_access(
  user_id: string,
  garden_data: CreateGardenDTO
): Promise<Garden> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const garden_result = await client.query(
      'INSERT INTO gardens (owner_id, name, surface_m2) VALUES ($1, $2, $3) RETURNING *',
      [user_id, garden_data.name, garden_data.surface_m2]
    );
    
    const garden = garden_result.rows[0] as Garden;
    
    await client.query(
      'INSERT INTO user_gardens (user_id, garden_id, garden_role) VALUES ($1, $2, $3)',
      [user_id, garden.id, 'owner']
    );
    
    await client.query('COMMIT');
    return garden;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

---

## 🗄️ Base de Datos (28 Tablas)

### **Módulo de Usuarios**
- `roles`: Roles del sistema (user, moderator, admin, super_admin)
- `users`: Cuentas de usuario con role_id
- `user_preferences`: Preferencias individuales
- `user_sessions`: Sesiones activas con tokens
- `user_gardens`: Acceso de usuarios a huertos (garden_role)

### **Módulo de Huertos y Parcelas**
- `gardens`: Huertos/jardines (owner_id, surface_m2, climate_zone)
- `plots`: Parcelas dentro de huertos (surface_m2, soil_type, pH)
- `weather_locations`: Ubicaciones meteorológicas

### **Módulo de Cultivos**
- `crop_catalog`: Catálogo de 128 cultivos con datos agrónomicos
- `plantings`: Instancias específicas de cultivos en parcelas
- `crop_compatibilities`: Compatibilidades entre cultivos
- `planting_associations`: Asociaciones verificadas entre plantaciones

### **Módulo de Rotación**
- `crop_rotation_rules`: Reglas de rotación entre cultivos
- `rotation_plans`: Planes de rotación por huerto
- `rotation_observations`: Observaciones de cumplimiento

### **Módulo de Tareas**
- `tasks`: Tareas agrícolas con recurrencia y dependencias
- `task_templates`: Plantillas de tareas

### **Módulo Lunar**
- `lunar_calendar`: Calendario lunar (fases, nodos, apogeo)
- `lunar_monthly_calendar`: Vista mensual
- `lunar_agricultural_rules`: Reglas para siembra/cosecha por luna
- `lunar_task_recommendations`: Tareas recomendadas por fase lunar
- `lunar_observations`: Registros de actividades según luna

### **Módulo Meteorológico**
- `weather_daily`: Datos diarios de 80+ variables meteorológicas
- `weather_forecast_accuracy`: Validación de pronósticos
- `weather_agricultural_rules`: Reglas para alertas agrícolas
- `weather_alerts`: Alertas generadas
- `weather_observations`: Observaciones de campo
- `weather_api_requests`: Log de peticiones a API

### **Módulo de Observaciones**
- `association_observations`: Observaciones de compatibilidad
- `rotation_observations`: Observaciones de rotación

### **Relaciones**
- **70 Foreign Keys** establecidas
- Integridad referencial: ON DELETE CASCADE/RESTRICT/SET NULL
- Triggers automáticos para timestamps (updated_at)

---

## 🔑 Foreign Keys Principales

```
users.role_id → roles.id
users.id → gardens.owner_id
users.id → user_gardens.user_id
gardens.id → user_gardens.garden_id
gardens.id → plots.garden_id
plots.id → plantings.plot_id
plantings.crop_catalog_id → crop_catalog.id
tasks.garden_id → gardens.id
tasks.assigned_to → users.id
tasks.parent_task_id → tasks.id (self-referential)
... (total 70 FK)
```

---

## 🔒 Roles Jerárquicos

```
user (0)           → Acceso básico a propios huertos
├─ moderator (1)   → Gestiona múltiples huertos
├─ admin (2)       → Administra plataforma
└─ super_admin (3) → Control total
```

Cada usuario en `user_gardens` tiene un `garden_role`:
- `owner`: Propietario del huerto
- `manager`: Gestor (puede modificar)
- `viewer`: Solo lectura

---

## 📝 Normas de Desarrollo

### **1. NUNCA dar nada por hecho**

```typescript
// ❌ INCORRECTO: Asumir que existe
const user = await get_user(user_id);
const name = user.name; // ¿Qué si user es null?

// ✅ CORRECTO: Validar siempre
const user = await get_user(user_id);
if (!user) {
  throw new AppError(404, `Usuario ${user_id} no encontrado`, true);
}
if (!user.name || user.name.trim().length === 0) {
  throw new AppError(400, 'El nombre del usuario es requerido', true);
}
const name = user.name;
```

### **2. SIEMPRE preguntar ambigüedades**

Si hay duda sobre:
- Validaciones requeridas
- Lógica de negocio
- Restricciones de permisos
- Casos edge

**Preguntar explícitamente en formato:**
```
❓ PREGUNTA: ¿Un usuario puede tener múltiples huertos?
❓ PREGUNTA: ¿Qué permisos necesita para crear una parcela?
❓ PREGUNTA: ¿Las tareas recurrentes se generan automáticamente o bajo demanda?
```

### **3. Validación en capas**

```typescript
// Layer 1: Validación de request (Express middleware)
router.post('/gardens', validate_create_garden_dto, create_garden);

// Layer 2: Validación de negocio (Service)
async function create_garden(user_id: string, data: CreateGardenDTO): Promise<Garden> {
  if (data.surface_m2 <= 0) {
    throw new AppError(400, 'Superficie debe ser positiva', true);
  }
  // ...
}

// Layer 3: Validación de BD (Triggers/Constraints)
-- CHECK constraints en PostgreSQL
CONSTRAINT gardens_surface_valid CHECK (surface_m2 > 0)
```

### **4. Logging explícito**

```typescript
// ✅ CORRECTO: Logs con contexto
logger.info('Creating garden', { 
  user_id, 
  garden_name: garden_data.name,
  timestamp: new Date().toISOString()
});

logger.error('Failed to create garden', {
  user_id,
  error: error.message,
  error_code: error.status_code,
  timestamp: new Date().toISOString()
});
```

### **5. Mappers como métodos estáticos en la clase User**

Los métodos de mapeo (conversión entre capa de persistencia y dominio) deben residir **como métodos estáticos directamente en la clase de dominio**, no en archivos separados de mapper.

```typescript
// ✅ CORRECTO: Métodos estáticos y de instancia en la clase User del dominio
export class User extends AggregateRoot {
  // ...propiedades

  // Método de instancia: convertir desde instancia de dominio a datos de BD
  to_persistence(): any {
    return {
      id: this.id.get_value(),
      email: this.email.get_value(),
      password_hash: this.password_hash,
      role_id: this.role_id,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Método de instancia: convertir desde instancia de dominio a DTO de respuesta
  to_response(): any {
    return {
      id: this.id.get_value(),
      email: this.email.get_value(),
      role_id: this.role_id,
      is_active: this.is_active,
      created_at: this.created_at
    };
  }

  // Método estático: convertir desde datos crudos de BD a instancia de dominio
  static from_persistence(raw: any): User {
    return new User(
      new UserId(raw.id),
      new UserEmail(raw.email),
      raw.password_hash,
      raw.role_id,
      raw.is_active,
      new Date(raw.created_at),
      new Date(raw.updated_at)
    );
  }
}
```

**Uso en la capa de persistencia:**

```typescript
// En PostgresUserRepository
export class PostgresUserRepository {
  async search_by_id(id: string): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    
    // Convertir desde BD a dominio
    return User.from_persistence(result.rows[0]);
  }

  async save(user: User): Promise<void> {
    // Convertir desde dominio a BD
    const user_data = user.to_persistence();
    await this.pool.query('INSERT INTO users ...', Object.values(user_data));
  }
}
```

**Ventajas:**
- La lógica de transformación vive en el agregado (responsabilidad única)
- No hay archivos separados de mapper que duplican la lógica
- Acceso directo a métodos desde instancias y desde la clase
- Código más limpio y menos boilerplate

---

## 🔄 Flujo de Autenticación (A IMPLEMENTAR)

```
POST /auth/register
├─ Validar email no existe
├─ Hash password con bcrypt
├─ Crear usuario con role_id = 'user'
└─ Retornar token JWT

POST /auth/login
├─ Validar credenciales
├─ Generar JWT token
├─ Guardar sesión en user_sessions
└─ Retornar token + refresh_token

GET /users/profile
├─ Middleware: verify_jwt_token
├─ Validar session activa
├─ Retornar usuario + roles
└─ HTTP 200
```

---

## 📌 Endpoints Planeados (REQUIERE CONFIRMACIÓN)

### **¿Cuáles son las prioridades?**

**Tier 1 (MVP):**
- [ ] POST /auth/register
- [ ] POST /auth/login
- [ ] GET /users/profile
- [ ] POST /gardens (crear huerto)
- [ ] GET /gardens (listar huertos del usuario)
- [ ] GET /gardens/:id (detalle con parcelas)

**Tier 2 (Core Features):**
- [ ] POST /gardens/:id/plots (crear parcela)
- [ ] POST /gardens/:id/plantings (plantar cultivo)
- [ ] GET /gardens/:id/tasks (tareas por huerto)
- [ ] POST /gardens/:id/tasks (crear tarea)

**Tier 3 (Avanzado):**
- [ ] Rotación de cultivos
- [ ] Compatibilidad de cultivos
- [ ] Integración lunar
- [ ] Integración meteorológica

**¿En qué orden quieres implementar?**

---

## ⚙️ Variables de Entorno

```env
# Base de datos
DATABASE_URL=postgresql://ssanisidro:Galleta21!@localhost:5432/tfm

# Servidor
PORT=3000
NODE_ENV=development

# JWT (A DEFINIR)
JWT_SECRET=?? (pregunta)
JWT_EXPIRE=?? (pregunta)

# Logging
LOG_LEVEL=debug|info|warn|error

# API Externos (A DEFINIR)
WEATHER_API_KEY=?? (pregunta)
WEATHER_API_URL=?? (pregunta)
```

---

## 🧪 Testing (A DEFINIR)

**¿Qué framework prefieres?**
- Jest + supertest
- Mocha + chai
- Vitest

---

## 📚 Documentación Existente

- `PROJECT.md` - Convenciones generales
- `ANALISIS_TABLAS.md` - Análisis del schema
- `CAMBIOS_REFACTORIZACION.md` - Historial de cambios

---

## ❓ Preguntas Clave Pendientes de Responder

1. ¿Autenticación con JWT o sesiones?
2. ¿CORS habilitado? ¿Qué dominios?
3. ¿Rate limiting en endpoints?
4. ¿Versionado de API (v1, v2)?
5. ¿Paginación en listados? (limit, offset o cursor-based?)
6. ¿Soft deletes o hard deletes?
7. ¿Auditoría de cambios?
8. ¿Notificaciones en tiempo real (WebSockets)?
9. ¿Deploy strategy?
10. ¿Base de datos para caché (Redis)?

---

## 📞 Patrón de Comunicación

En cada tarea, especificaré:
- ✅ **Lo que está claro**
- ❓ **Lo que necesito preguntar**
- 🔧 **Cambios propuestos**
- 📋 **Checklist de validación**

**Ejemplo:**
```
✅ Claro: Endpoint debe validar usuario existe
❓ Pregunta: ¿Retornamos datos sensibles (password_hash)?
🔧 Propuesta: Crear UserResponseDTO sin campos sensibles
📋 Tests: 
  - [ ] 200 con usuario válido
  - [ ] 404 si usuario no existe
  - [ ] 401 si no autorizado
```

---

**Última actualización:** 11 de febrero de 2026
**Versión:** 1.0
