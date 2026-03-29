# Seed de Cultivos

Script para poblar la tabla `crop_catalog` con datos de cultivos españoles.

## Fuentes de datos

1. **Datos embebidos**: 25 cultivos básicos con características agronómicas completas
   - Tomate, Pimiento, Lechuga, Zanahoria, Cebolla, Ajo, Judía Verde, Guisante, Calabacín, Pepino, Berenjena, Patata, Acelga, Espinaca, Coliflor, Brócoli, Remolacha, Rábano, Albahaca, Perejil, Cilantro, Melón, Sandía, Fresa

2. **Aragón Open Data** (opcional): Catálogo de variedades y cultivos PAC
   - URL: https://opendata.aragon.es/GA_OD_Core/download?resource_id=82&formato=json
   - Se combina automáticamente con los datos embebidos

## Uso

```bash
# Ejecutar el seed
npm run seed:crops

# O directamente con ts-node
npx ts-node src/db/seed/crops/index.ts
```

## Requisitos

- Base de datos PostgreSQL configurada
- Tabla `crop_catalog` creada (ejecutar migraciones)
- Variables de entorno en `.env`:
  - DB_HOST
  - DB_PORT
  - DB_USER
  - DB_PASSWORD
  - DB_NAME

## Estructura del script

```
src/db/seed/crops/
├── index.ts          # Script principal
└── data/
    └── crops-data.json  # Datos embebidos
```

## Campos incluidos

- Identificación: nombre común, nombre científico, familia
- Clasificación: categoría, ciclo de vida, hábito de crecimiento
- Ciclo de cultivo: días hasta cosecha, germinación
- Requisitos de clima: temperatura, heladas, calor
- Requisitos de luz: sol, horas de sol, sombra
- Requisitos de suelo: tipo, pH, profundidad, fertilidad
- Necesidades de agua: riego, sequía, encharcamiento
- Siembra y espaciado
- Calendario: meses de siembra y cosecha
- Rotación de cultivos
- Plagas y enfermedades comunes
- Indicadores ecológicos: fijador de nitrógeno, polinizadores
- Producción: rendimiento, tipo de cosecha
- Información adicional: descripción, consejos, usos culinarios
