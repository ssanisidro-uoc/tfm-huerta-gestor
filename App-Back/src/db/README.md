# Base de Datos - Huertis

Scripts para configurar y gestionar la base de datos PostgreSQL.

## Requisitos

- PostgreSQL 14+ instalado y ejecutándose
- Node.js 18+
- Archivo `.env` en la raíz del proyecto

## Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=huertis
```

## Scripts Disponibles

### `npm run db:setup`

Configura la base de datos completa desde cero. Este script:

1. ✅ Verifica las variables de entorno
2. ✅ Crea la base de datos si no existe
3. ✅ Ejecuta el schema completo (`tables.sql`)
4. ✅ Inserta los roles iniciales
5. ✅ Ejecuta los seeds de:
   - Cultivos (`crop_catalog`) - ~25 cultivos españoles
   - Compatibilidades (`crop_compatibilities`) - relaciones entre cultivos
   - Calendario lunar (`lunar_calendar`)
   - Reglas lunares (`lunar_agricultural_rules`)
6. ✅ Verifica que todas las tablas se crearon
7. ✅ Muestra un resumen de registros

```bash
npm run db:setup
```

### `npm run db:reset`

Reinicia la base de datos (elimina y recrea). Requiere confirmación.

```bash
npm run db:reset
```

### Seeds Individuales

Si ya tienes la base de datos configurada, puedes ejecutar seeds individualmente:

```bash
npm run seed:crops           # Poblar tabla de cultivos
npm run seed:compatibilities # Poblar compatibilidades
npm run seed:lunar          # Poblar calendario y reglas lunares
```

## Estructura de Archivos

```
src/db/
├── setup.ts           # Script principal de configuración
├── reset.ts          # Script para reiniciar base de datos
├── check.ts          # Verificar estado de la base de datos
├── tables/
│   ├── tables.sql                 # Schema completo
│   └── seed_initial_roles.sql     # Roles del sistema
└── seed/
    ├── crops/
    │   ├── index.ts              # Seed de cultivos
    │   └── compatibilities.ts    # Seed de compatibilidades
    └── lunar/
        ├── calendar.ts           # Seed calendario lunar
        └── rules.ts              # Seed reglas lunares
```

## Tablas Creadas

El script `db:setup` crea las siguientes tablas:

### Core
- `roles` - Roles del sistema (user, moderator, admin, super_admin)
- `users` - Usuarios
- `user_preferences` - Preferencias de usuario
- `user_sessions` - Sesiones

### Jardines
- `gardens` - Huertos
- `user_gardens` - Relación usuarios-huertos
- `plots` - Parcelas

### Cultivos
- `crop_catalog` - Catálogo de cultivos
- `plantings` - Siembras
- `plantings_harvests` - Cosechas individuales
- `tasks` - Tareas

### Compatibilidades y Rotación
- `crop_compatibilities` - Base de conocimiento de compatibilidades
- `planting_associations` - Asociaciones reales entre siembras
- `association_observations` - Observaciones de asociaciones
- `crop_rotation_rules` - Reglas de rotación
- `rotation_plans` - Planes de rotación
- `rotation_observations` - Observaciones de rotación

### Lunar
- `lunar_calendar` - Calendario lunar
- `lunar_agricultural_rules` - Reglas agrícolas lunares
- `lunar_task_recommendations` - Recomendaciones de tareas
- `lunar_observations` - Observaciones lunares
- `lunar_monthly_calendar` - Calendario mensual lunar

### Clima
- `weather_locations` - Ubicaciones climáticas
- `weather_daily` - Datos meteorológicos diarios
- `weather_forecast_accuracy` - Precisión de forecasts
- `weather_agricultural_rules` - Reglas agrícolas climáticas
- `weather_alerts` - Alertas meteorológicas
- `weather_observations` - Observaciones meteorológicas
- `weather_api_requests` - Registro de llamadas a API

### Sistema
- `audit_log` - Registro de auditoría

## Solución de Problemas

### Error: "Faltan variables de entorno"

Asegúrate de tener el archivo `.env` con todas las variables necesarias:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=huertis
```

### Error: "Database does not exist"

El script `db:setup` crea la base de datos automáticamente si no existe.

### Error: "Connection refused"

Verifica que PostgreSQL esté ejecutándose:

```bash
# Linux
sudo systemctl status postgresql

# macOS
brew services start postgresql

# Windows
net start postgresql
```

### Reiniciar desde cero

```bash
npm run db:reset
npm run db:setup
```

## Primeros Pasos

1. Clonar el repositorio
2. Crear archivo `.env`
3. Ejecutar `npm run db:setup`
4. Crear usuario admin (próximamente)
5. Iniciar servidor: `npm run dev`
