---
name: clean-ddd-hexagonal
description: Genera estructura de proyecto con arquitectura limpia, DDD y patrón hexagonal para TypeScript + Express + PostgreSQL
license: MIT
compatibility: opencode
metadata:
  audience: developers
  framework: express-typescript
  architecture: hexagonal-ddd
  database: postgresql
---

## ¿Qué hago?

Genero una estructura de proyecto completa basada en **Clean Architecture**, **Domain-Driven Design (DDD)** y **Arquitectura Hexagonal**, organizando el código en **Bounded Contexts** según DDD.

Esta skill es específica para:
- **Backend**: Node.js + Express
- **Lenguaje**: TypeScript (strict mode)
- **Base de datos**: PostgreSQL
- **Naming**: snake_case (NUNCA camelCase)
- **Tipado**: Explícito siempre (NUNCA any)
- **Organización**: Cada módulo de negocio (User, Garden, Plot, etc.) es un bounded context independiente con su propia estructura DDD

## Cuándo usarme

✅ Inicializar proyectos con estructura profesional
✅ Crear entidades (Entity + Service + Controller + Routes)
✅ Implementar casos de uso complejos
✅ Generar tipos/DTOs con validaciones
✅ Estructurar middleware de autenticación

## Estructura que genero (Basada en CodelyTV)

```
src/
├── Contexts/                              # Todos los bounded contexts DDD
│   ├── Shared/                            # Código compartido entre contextos
│   │   ├── domain/
│   │   │   ├── value-object/
│   │   │   │   ├── ValueObject.ts
│   │   │   │   ├── Uuid.ts
│   │   │   │   ├── StringValueObject.ts
│   │   │   │   └── IntegerValueObject.ts
│   │   │   ├── Command.ts
│   │   │   ├── Query.ts
│   │   │   ├── Response.ts
│   │   │   ├── CommandBus.ts
│   │   │   ├── QueryBus.ts
│   │   │   ├── Logger.ts
│   │   │   ├── EventBus.ts
│   │   │   ├── DomainEvent.ts
│   │   │   └── DomainEventSubscriber.ts
│   │   ├── infrastructure/
│   │   │   ├── CommandBus/
│   │   │   ├── QueryBus/
│   │   │   ├── EventBus/
│   │   │   ├── persistence/
│   │   │   └── WinstonLogger.ts
│   │   └── utils/ (helpers, validators)
│   │
│   ├── User/                              # Bounded Context: User
│   │   ├── domain/
│   │   │   ├── User.ts (Aggregate Root)
│   │   │   ├── UserId.ts (Value Object)
│   │   │   ├── UserEmail.ts (Value Object)
│   │   │   ├── UserRepository.ts (interface)
│   │   │   ├── UserCreatedDomainEvent.ts
│   │   │   └── [otras entidades/value-objects]
│   │   ├── application/
│   │   │   ├── Create/
│   │   │   │   ├── CreateUserCommand.ts
│   │   │   │   ├── CreateUserCommandHandler.ts
│   │   │   │   └── UserCreator.ts (finder/creator)
│   │   │   ├── Find/
│   │   │   │   ├── FindUserByIdQuery.ts
│   │   │   │   ├── FindUserByIdQueryHandler.ts
│   │   │   │   ├── FindUserByIdResponse.ts
│   │   │   │   └── UserFinder.ts
│   │   │   ├── FindAll/
│   │   │   │   ├── FindAllUsersQuery.ts
│   │   │   │   ├── FindAllUsersQueryHandler.ts
│   │   │   │   └── FindAllUsersResponse.ts
│   │   │   └── mappers/
│   │   │       └── UserMapper.ts (to_domain, to_persistence, to_response)
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   │   └── PostgresUserRepository.ts (implementa UserRepository)
│   │   │   └── subscribers/
│   │   │       └── UserCreatedDomainEventSubscriber.ts
│   │   └── Shared/domain/
│   │       └── UserId.ts (si se usa en otros contextos)
│   │
│   ├── Garden/                            # Bounded Context: Garden
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── Shared/domain/
│   │
│   └── [otros bounded contexts]/
│
├── apps/                                   # Aplicaciones (backends/frontends)
│   └── mooc/
│       └── backend/
│           ├── server.ts (Express config + middlewares)
│           ├── start.ts (punto de entrada)
│           ├── MoocBackendApp.ts
│           ├── dependency-injection/
│           │   ├── index.ts
│           │   └── application_dev.yaml (config YAML DI)
│           ├── routes/
│           │   ├── index.ts (carga todas las rutas con glob)
│           │   └── user.route.ts
│           ├── controllers/
│           │   ├── Controller.ts (interface)
│           │   └── user/
│           │       ├── CreateUserController.ts
│           │       ├── FindUserByIdController.ts
│           │       └── FindAllUsersController.ts
│           └── command/ (para configuraciones especiales)
│               └── ConfigureRabbitMQCommand.ts
│
└── index.ts (punto de entrada principal)
```

**Estructura en resumen:**
- **`src/Contexts/`** → DDD puro: cada bounded context tiene domain/application/infrastructure
- **`src/Contexts/Shared/`** → Código compartido (buses, value objects base, logger, etc.)
- **`src/apps/[name]/backend/`** → Servidor Express, rutas, controllers, DI
- **CQRS Pattern** → Commands (escritura) + Queries (lectura) + Handlers
- **Dependency Injection** → YAML + node-dependency-injection (no container en código)
- **Domain Events** → Publicados por agregados, suscritos por handlers


## Convenciones que aplico

### ✅ NO usar carpeta "dto" o "dtos" en application

**REGLA: Los Response DTOs van dentro de su carpeta de operación correspondiente**

```
// ✅ CORRECTO - Response dentro de su carpeta
application/
├── Create/
│   ├── CreateUserCommand.ts
│   └── UserCreator.ts
└── Find/
    ├── FindUserByIdQuery.ts
    ├── FindUserByIdQueryHandler.ts
    ├── FindUserByIdResponse.ts    ← Aquí va el Response
    └── UserFinder.ts

// ❌ INCORRECTO - NO usar carpeta dto
application/
├── Create/
│   └── ...
└── dto/                          ← NO HACER ESTO
    ├── FindUserByIdResponse.ts
    └── ...
```

### ✅ Archivos (PascalCase)

```typescript
// domain/
UserId.ts (Value Object)
User.ts (Aggregate Root)
UserRepository.ts (interface)
UserCreatedDomainEvent.ts

// application/Create/
CreateUserCommand.ts
CreateUserCommandHandler.ts
UserCreator.ts (finder/creator para ejecutar lógica)

// application/Find/
FindUserByIdQuery.ts
FindUserByIdQueryHandler.ts
FindUserByIdResponse.ts
UserFinder.ts

// infrastructure/persistence/
PostgresUserRepository.ts (implementa UserRepository)

// Controllers
CreateUserController.ts
FindUserByIdController.ts
```

### ✅ Variables y Funciones (snake_case, NUNCA camelCase)

```typescript
const user_id: string = '550e8400-e29b-41d4-a716-446655440000';
const garden_name: string = 'Mi huerto principal';
let is_active: boolean = true;
const password_hash: string = 'bcrypt_hash...';
const created_at: Date = new Date();

async function find_user_by_id(user_id: string): Promise<User | null> {
  // ...
}

async function search_all_users(): Promise<User[]> {
  // ...
}

class UserFinder {
  async run(user_id: string): Promise<User> {
    return this.repository.search_by_id(user_id);
  }
}
```

### ✅ Tipos explícitos (NUNCA any/unknown)

```typescript
type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Métodos siempre con tipos de retorno
async function process_garden(garden_id: string): Promise<void> {
  try {
    const garden = await this.finder.run(garden_id);
    // lógica
  } catch (error) {
    throw new AppError('Error procesando jardín', 500, true);
  }
}
```

### ✅ Value Objects (Tipado fuerte)

```typescript
// domain/UserId.ts
import { Uuid } from '../../Shared/domain/value-object/Uuid';

export class UserId extends Uuid {}

// domain/UserEmail.ts
import { StringValueObject } from '../../Shared/domain/value-object/StringValueObject';

export class UserEmail extends StringValueObject {
  constructor(value: string) {
    super();
    if (!this.is_valid_email(value)) {
      throw new Error('Invalid email');
    }
    this.value = value;
  }
  
  private is_valid_email(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

### ✅ Aggregates (Aggregate Root)

```typescript
// domain/User.ts
import { AggregateRoot } from '../../Shared/domain/AggregateRoot';
import { UserId } from './UserId';
import { UserEmail } from './UserEmail';
import { UserCreatedDomainEvent } from './UserCreatedDomainEvent';

export class User extends AggregateRoot {
  readonly id: UserId;
  readonly email: UserEmail;
  readonly password_hash: string;
  readonly is_active: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(
    id: UserId,
    email: UserEmail,
    password_hash: string,
    is_active: boolean,
    created_at: Date,
    updated_at: Date
  ) {
    super();
    this.id = id;
    this.email = email;
    this.password_hash = password_hash;
    this.is_active = is_active;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static create(
    id: UserId,
    email: UserEmail,
    password_hash: string
  ): User {
    const user = new User(
      id,
      email,
      password_hash,
      true,
      new Date(),
      new Date()
    );
    user.record(new UserCreatedDomainEvent(id.value, email.value));
    return user;
  }
}
```

### ✅ Mappers (Conversión entre capas)

```typescript
// application/mappers/UserMapper.ts
import { User } from '../../domain/User';

export class UserMapper {
  static to_persistence(user: User): any {
    return {
      id: user.id.value,
      email: user.email.value,
      password_hash: user.password_hash,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  static to_domain(raw: any): User {
    return new User(
      new UserId(raw.id),
      new UserEmail(raw.email),
      raw.password_hash,
      raw.is_active,
      raw.created_at,
      raw.updated_at
    );
  }

  static to_response(user: User): any {
    return {
      id: user.id.value,
      email: user.email.value,
      is_active: user.is_active,
      created_at: user.created_at
      // NUNCA retornar password_hash en response
    };
  }
}
```


## Flujo request → response (CQRS + Hexagonal)

```
HTTP GET /api/users/123
  ↓
apps/mooc/backend/routes/user.route.ts (registra rutas)
  ↓
apps/mooc/backend/controllers/user/FindUserByIdController.ts
  ↓
Container.get('User.FindUserByIdQueryHandler')
  ↓
FindUserByIdQuery {id: "123"}
  ↓
QueryBus.ask(query)
  ↓
FindUserByIdQueryHandler.handle(query)
  ↓
Contexts/User/application/Find/UserFinder.run(id)
  ↓
Contexts/User/infrastructure/persistence/PostgresUserRepository.searchById(id)
  ↓
PostgreSQL: SELECT * FROM users WHERE id = $1
  ↓
User (Aggregate) ← Domain Entity
  ↓
UserMapper.to_response(user)
  ↓
FindUserByIdResponse {id, name, email, ...}
  ↓
HTTP 200 {id, name, email, ...}
```

## CQRS Pattern (Comando/Queries)

**Commands** (escribir):
```typescript
// Contexts/User/application/Create/CreateUserCommand.ts
export class CreateUserCommand implements Command {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
    readonly password_hash: string
  ) {}
}

// Handler ejecuta el comando
export class CreateUserCommandHandler implements CommandHandler<CreateUserCommand> {
  constructor(private creator: UserCreator) {}
  
  async handle(command: CreateUserCommand): Promise<void> {
    await this.creator.run(command);
  }
}
```

**Queries** (leer):
```typescript
// Contexts/User/application/Find/FindUserByIdQuery.ts
export class FindUserByIdQuery implements Query {
  constructor(readonly id: string) {}
}

// Handler retorna Response
export class FindUserByIdQueryHandler implements QueryHandler<FindUserByIdQuery, FindUserByIdResponse> {
  subscribedTo(): Query {
    return FindUserByIdQuery;
  }

  async handle(query: FindUserByIdQuery): Promise<FindUserByIdResponse> {
    const user = await this.finder.run(query.id);
    return new FindUserByIdResponse(user);
  }
}
```