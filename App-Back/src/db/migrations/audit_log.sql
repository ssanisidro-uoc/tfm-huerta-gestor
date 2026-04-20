-- audit_log.sql
-- Tabla de auditoría para trazabilidad de acciones
-- Ejecutar con: psql -h <host> -U <user> -d <db> -f audit_log.sql

BEGIN;

-- ========================================
-- TABLA: audit_log (Registro de Auditoría)
-- ========================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- IDENTIFICACIÓN DE LA ACCIÓN
    -- =====================================
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    
    -- =====================================
    -- TIPO DE ACCIÓN
    -- =====================================
    action_type VARCHAR(50) NOT NULL,
    action_category VARCHAR(50) NOT NULL,
    
    -- =====================================
    -- RECURSOS AFECTADOS
    -- =====================================
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    resource_name VARCHAR(255),
    
    -- =====================================
    -- DETALLES DEL CAMBIO
    -- =====================================
    old_values JSONB,
    new_values JSONB,
    change_description TEXT,
    
    -- =====================================
    -- CONTEXTO
    -- =====================================
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path VARCHAR(500),
    
    -- =====================================
    -- RESULTADO
    -- =====================================
    success BOOLEAN DEFAULT true NOT NULL,
    error_message TEXT,
    
    -- =====================================
    -- TIMESTAMPS
    -- =====================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action_type ON audit_log(action_type);
CREATE INDEX idx_audit_log_action_category ON audit_log(action_category);
CREATE INDEX idx_audit_log_resource_type ON audit_log(resource_type);
CREATE INDEX idx_audit_log_resource_id ON audit_log(resource_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- Índice compuesto para auditoría de un recurso específico
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id, created_at DESC);

-- Índice para auditoría de usuario
CREATE INDEX idx_audit_log_user_actions ON audit_log(user_id, created_at DESC);

COMMENT ON TABLE audit_log IS 'Registro de auditoría para trazabilidad de acciones de usuarios';
COMMENT ON COLUMN audit_log.action_type IS 'Tipo de acción: create, update, delete, complete, postpone, cancel, login, logout, share, etc';
COMMENT ON COLUMN audit_log.action_category IS 'Categoría: auth, garden, plot, planting, crop, task, weather, etc';

-- ========================================
-- VIEW: Resumen de actividad por usuario
-- ========================================
CREATE OR REPLACE VIEW v_user_activity_summary AS
SELECT 
    user_id,
    user_email,
    action_category,
    COUNT(*) as action_count,
    MIN(created_at) as first_action,
    MAX(created_at) as last_action
FROM audit_log
WHERE user_id IS NOT NULL
GROUP BY user_id, user_email, action_category
ORDER BY last_action DESC;

-- ========================================
-- VIEW: Historial de un recurso
-- ========================================
CREATE OR REPLACE VIEW v_resource_history AS
SELECT 
    al.id,
    al.resource_type,
    al.resource_id,
    al.resource_name,
    al.action_type,
    al.change_description,
    al.user_email,
    al.created_at,
    al.old_values,
    al.new_values
FROM audit_log al
WHERE al.resource_type IS NOT NULL AND al.resource_id IS NOT NULL
ORDER BY al.created_at DESC;

COMMIT;