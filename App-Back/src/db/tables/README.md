# Tablas iniciales (SQL)

Archivos SQL de ejemplo para la estructura inicial de la base de datos PostgreSQL.

Archivos incluidos:

- `001_create_roles.sql` - tabla `roles`.
- `002_create_users.sql` - tabla `users`.
- `003_create_user_roles.sql` - tabla intermedia `user_roles` (many-to-many).

Ejecutar los scripts en orden con `psql`:

```bash
pSQL -h <host> -U <user> -d <database> -f 001_create_roles.sql
pSQL -h <host> -U <user> -d <database> -f 002_create_users.sql
pSQL -h <host> -U <user> -d <database> -f 003_create_user_roles.sql
```

Siguientes pasos sugeridos:

- Añadir scripts de migración (node-pg-migrate / knex / umzug).
- O crear modelos ORM (Sequelize / TypeORM / Prisma).
