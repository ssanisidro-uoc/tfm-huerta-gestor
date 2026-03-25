-- seed_initial_roles.sql
-- Script para inicializar los roles del sistema
-- Ejecutar DESPUÉS de crear las tablas pero ANTES de crear usuarios

-- Insertar roles del sistema
INSERT INTO roles (name, description, hierarchy_level, is_active) VALUES
    ('user', 'Usuario regular con acceso básico', 0, true),
    ('moderator', 'Moderador con permisos ampliados', 1, true),
    ('admin', 'Administrador con acceso completo', 2, true),
    ('super_admin', 'Super administrador del sistema', 3, true)
ON CONFLICT (name) DO NOTHING;

-- Verificar inserción
SELECT name, hierarchy_level, is_active FROM roles ORDER BY hierarchy_level;
