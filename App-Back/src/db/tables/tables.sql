-- tables.sql
-- Archivo único con la definición inicial de las tablas de la aplicación
-- Ejecutar con: psql -h <host> -U <user> -d <db> -f tables.sql

BEGIN;

-- ========================================
-- FUNCIÓN AUXILIAR (debe definirse primero)
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TABLA: roles (Roles de Usuario)
-- ========================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    hierarchy_level INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT roles_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT roles_hierarchy_valid CHECK (hierarchy_level >= 0)
);

-- Índices
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_is_active ON roles(is_active);
CREATE INDEX idx_roles_hierarchy_level ON roles(hierarchy_level);

-- Trigger para updated_at
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE roles IS 'System roles with hierarchy levels for flexible access control';
COMMENT ON COLUMN roles.hierarchy_level IS 'Numeric hierarchy (0=user, 1=moderator, 2=admin, 3=super_admin)';

-- ========================================
-- TABLA: users (Usuarios)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    email_verified BOOLEAN DEFAULT false NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT users_email_lowercase CHECK (email = LOWER(email))
);

-- Índices para optimización
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Trigger para updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- TABLA: user_preferences (Preferencias de Usuario)
-- ========================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'es' NOT NULL,
    theme VARCHAR(20) DEFAULT 'light' NOT NULL,
    notifications_enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT user_preferences_language_valid CHECK (language IN ('es', 'ca', 'en', 'fr')),
    CONSTRAINT user_preferences_theme_valid CHECK (theme IN ('light', 'dark', 'auto'))
);

-- Trigger para updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- TABLA: user_sessions (Sesiones de Usuario)
-- ========================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT user_sessions_expires_future CHECK (expires_at > created_at)
);

-- Índices
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Índice compuesto para limpieza de sesiones expiradas
CREATE INDEX idx_user_sessions_cleanup ON user_sessions(is_active, expires_at);

-- ========================================
-- TABLA: gardens (Huertas)
-- ========================================
CREATE TABLE IF NOT EXISTS gardens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    
    -- Ubicación geográfica estructurada
    location_address VARCHAR(255),
    location_city VARCHAR(100),
    location_region VARCHAR(100),
    location_country VARCHAR(2) DEFAULT 'ES' NOT NULL,
    location_latitude NUMERIC(10, 7),
    location_longitude NUMERIC(10, 7),
    location_timezone VARCHAR(50) DEFAULT 'Europe/Madrid',
    
    -- Características agroclimáticas
    climate_zone VARCHAR(50) NOT NULL,
    hardiness_zone VARCHAR(10),
    
    -- Dimensiones
    surface_m2 NUMERIC(10, 2),
    
    -- Estado y auditoría
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT gardens_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT gardens_surface_positive CHECK (surface_m2 IS NULL OR surface_m2 > 0),
    CONSTRAINT gardens_surface_reasonable CHECK (surface_m2 IS NULL OR surface_m2 <= 1000000),
    CONSTRAINT gardens_climate_zone_valid CHECK (
        climate_zone IN (
            'mediterranean_coast',
            'mediterranean_interior', 
            'atlantic',
            'continental',
            'mountain',
            'subtropical',
            'semiarid',
            'canary_islands'
        )
    ),
    CONSTRAINT gardens_coordinates_valid CHECK (
        (location_latitude IS NULL AND location_longitude IS NULL) OR
        (location_latitude BETWEEN -90 AND 90 AND location_longitude BETWEEN -180 AND 180)
    ),
    CONSTRAINT gardens_country_iso CHECK (LENGTH(location_country) = 2)
);

-- Índices optimizados
CREATE INDEX idx_gardens_owner_id ON gardens(owner_id);
CREATE INDEX idx_gardens_is_active ON gardens(is_active);
CREATE INDEX idx_gardens_climate_zone ON gardens(climate_zone);
CREATE INDEX idx_gardens_created_at ON gardens(created_at DESC);

-- Índice espacial para búsquedas geográficas (requiere PostGIS, opcional)
-- CREATE INDEX idx_gardens_location ON gardens USING GIST(
--     ll_to_earth(location_latitude, location_longitude)
-- );

-- Índice de búsqueda de texto completo (opcional, para búsquedas)
CREATE INDEX idx_gardens_search_text ON gardens USING GIN(
    to_tsvector('spanish', COALESCE(name, '') || ' ' || COALESCE(description, ''))
);

-- Trigger para updated_at
CREATE TRIGGER update_gardens_updated_at
    BEFORE UPDATE ON gardens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- TABLA: user_gardens (Acceso a Huertas)
-- ========================================
CREATE TABLE IF NOT EXISTS user_gardens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    garden_role VARCHAR(50) NOT NULL,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invitation_accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT user_gardens_unique UNIQUE (user_id, garden_id),
    CONSTRAINT user_gardens_garden_role_valid CHECK (
        garden_role IN ('owner', 'manager', 'collaborator', 'viewer')
    )
);

-- Índices
CREATE INDEX idx_user_gardens_user_id ON user_gardens(user_id);
CREATE INDEX idx_user_gardens_garden_id ON user_gardens(garden_id);
CREATE INDEX idx_user_gardens_garden_role ON user_gardens(garden_role);

-- Índice compuesto para consultas frecuentes
CREATE INDEX idx_user_gardens_user_garden ON user_gardens(user_id, garden_id);

-- Trigger para updated_at
CREATE TRIGGER update_user_gardens_updated_at
    BEFORE UPDATE ON user_gardens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION user_has_garden_permission(
    p_user_id UUID,
    p_garden_id UUID,
    p_required_role VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    v_user_garden_role VARCHAR;
    v_role_hierarchy JSONB := '{
        "owner": 4,
        "manager": 3,
        "collaborator": 2,
        "viewer": 1
    }'::JSONB;
BEGIN
    -- Obtener el rol del usuario en la huerta
    SELECT garden_role INTO v_user_garden_role
    FROM user_gardens
    WHERE user_id = p_user_id 
      AND garden_id = p_garden_id;
    
    -- Si no existe relación, retornar false
    IF v_user_garden_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Comparar jerarquía de roles
    RETURN (v_role_hierarchy->>v_user_garden_role)::INT >= (v_role_hierarchy->>p_required_role)::INT;
END;
$$ LANGUAGE plpgsql STABLE;

-- Ejemplo: SELECT user_has_garden_permission('user-uuid', 'garden-uuid', 'collaborator');

-- ========================================
-- TABLA: plots (Parcelas)
-- ========================================
CREATE TABLE IF NOT EXISTS plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- Identificación
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20),  -- Código alfanumérico opcional (ej: "P1", "A-01")
    description TEXT,
    
    -- Dimensiones y forma
    surface_m2 NUMERIC(10, 2) NOT NULL,
    length_m NUMERIC(8, 2),  -- Largo en metros
    width_m NUMERIC(8, 2),   -- Ancho en metros
    shape VARCHAR(30),       -- Forma de la parcela
    
    -- Posicionamiento dentro de la huerta
    position_x INTEGER,  -- Coordenada X en grid (opcional para visualización)
    position_y INTEGER,  -- Coordenada Y en grid (opcional para visualización)
    plot_order INTEGER,  -- Orden de visualización/prioridad
    
    -- Características del suelo
    soil_type VARCHAR(50),
    soil_ph NUMERIC(3, 1),  -- pH del suelo (0.0 - 14.0)
    soil_quality VARCHAR(20),  -- Calidad general del suelo
    soil_notes TEXT,
    last_soil_analysis_date DATE,  -- Última vez que se analizó el suelo
    
    -- Sistema de riego
    irrigation_type VARCHAR(50) NOT NULL DEFAULT 'manual',
    irrigation_flow_rate NUMERIC(6, 2),  -- Litros por hora (si aplica)
    irrigation_notes TEXT,
    has_water_access BOOLEAN DEFAULT true NOT NULL,
    
    -- Exposición solar y orientación
    orientation VARCHAR(20),
    sun_exposure_hours NUMERIC(3, 1),  -- Horas de sol directo diarias (promedio)
    shade_level VARCHAR(20),  -- Nivel de sombra
    
    -- Características adicionales
    has_greenhouse BOOLEAN DEFAULT false NOT NULL,
    has_raised_bed BOOLEAN DEFAULT false NOT NULL,  -- Bancal elevado
    has_mulch BOOLEAN DEFAULT false NOT NULL,  -- Acolchado
    accessibility VARCHAR(20),  -- Nivel de accesibilidad
    
    -- Restricciones y observaciones
    restrictions TEXT,  -- Restricciones especiales (ej: "No plantar raíces profundas - tubería enterrada")
    
    -- Estado y auditoría
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    -- Validación de nombre
    CONSTRAINT plots_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    
    -- Validación de superficie
    CONSTRAINT plots_surface_positive CHECK (surface_m2 > 0),
    CONSTRAINT plots_surface_reasonable CHECK (surface_m2 <= 500000),  -- Máx 50 hectáreas por parcela
    
    -- Validación de dimensiones (si se proporcionan)
    CONSTRAINT plots_length_positive CHECK (length_m IS NULL OR length_m > 0),
    CONSTRAINT plots_width_positive CHECK (width_m IS NULL OR width_m > 0),
    CONSTRAINT plots_dimensions_match_surface CHECK (
        (length_m IS NULL OR width_m IS NULL) OR 
        (ABS((length_m * width_m) - surface_m2) < 1.0)  -- Tolerancia de 1m² para formas irregulares
    ),
    
    -- Validación de forma
    CONSTRAINT plots_shape_valid CHECK (
        shape IS NULL OR shape IN (
            'rectangular',
            'square',
            'circular',
            'L_shaped',
            'triangular',
            'irregular',
            'raised_bed'
        )
    ),
    
    -- Validación de tipo de suelo (en español para consistencia)
    CONSTRAINT plots_soil_type_valid CHECK (
        soil_type IS NULL OR soil_type IN (
            'clay',        -- ES: Arcilloso
            'sandy',       -- ES: Arenoso
            'loamy',       -- ES: Franco
            'silty',       -- ES: Limoso
            'chalky',      -- ES: Calcáreo
            'humus_rich',  -- ES: Humífero
            'rocky',       -- ES: Pedregoso
            'mixed',       -- ES: Mixto
            'unknown'      -- ES: Desconocido
        )
    ),
    
    -- Validación de pH del suelo (escala 0-14)
    CONSTRAINT plots_soil_ph_valid CHECK (
        soil_ph IS NULL OR (soil_ph >= 0.0 AND soil_ph <= 14.0)
    ),
    
    -- Validación de calidad del suelo
   CONSTRAINT plots_soil_quality_valid CHECK (
        soil_quality IS NULL OR soil_quality IN (
            'excellent',      -- ES: Excelente
            'good',           -- ES: Buena
            'average',        -- ES: Media
            'poor',           -- ES: Pobre
            'very_poor',      -- ES: Muy pobre
            'not_evaluated'   -- ES: No evaluada
        )
    ),

    
    -- Validación de tipo de riego
    CONSTRAINT plots_irrigation_type_valid CHECK (
        irrigation_type IN (
            'manual',         -- ES: Riego manual
            'drip',           -- ES: Goteo
            'sprinkler',      -- ES: Aspersión
            'flood',          -- ES: Inundación
            'subsurface',     -- ES: Subterráneo / ollas
            'automatic',      -- ES: Automático
            'rainfed'         -- ES: Solo lluvia (secano)
        )
    ),
    
    -- Validación de caudal de riego
    CONSTRAINT plots_irrigation_flow_positive CHECK (
        irrigation_flow_rate IS NULL OR irrigation_flow_rate > 0
    ),
    
    -- Validación de orientación
    CONSTRAINT plots_orientation_valid CHECK (
        orientation IS NULL OR orientation IN (
            'north',        -- ES: Norte
            'south',        -- ES: Sur
            'east',         -- ES: Este
            'west',         -- ES: Oeste
            'northeast',    -- ES: Noreste
            'northwest',    -- ES: Noroeste
            'southeast',    -- ES: Sureste
            'southwest',    -- ES: Suroeste
            'flat',         -- ES: Sin orientación dominante
            'variable'      -- ES: Orientación variable
        )
    ),
    
    -- Validación de horas de sol (0-24)
    CONSTRAINT plots_sun_exposure_valid CHECK (
        sun_exposure_hours IS NULL OR (sun_exposure_hours >= 0 AND sun_exposure_hours <= 24)
    ),
    
    -- Validación de nivel de sombra
    CONSTRAINT plots_shade_level_valid CHECK (
        shade_level IS NULL OR shade_level IN (
             'full_sun',        -- ES: Pleno sol (>6h)
            'partial_sun',     -- ES: Sol parcial (4–6h)
            'partial_shade',   -- ES: Sombra parcial (2–4h)
            'shade',           -- ES: Sombra (<2h)
            'deep_shade'       -- ES: Sombra total
        )
    ),
    
    -- Validación de accesibilidad
    CONSTRAINT plots_accessibility_valid CHECK (
        accessibility IS NULL OR accessibility IN (
            'excellent',      -- ES: Acceso excelente
            'good',           -- ES: Acceso bueno
            'moderate',       -- ES: Acceso moderado
            'difficult',      -- ES: Acceso difícil
            'very_difficult'  -- ES: Acceso muy difícil
        )
    ),
    
    -- Validación de orden de parcela
    CONSTRAINT plots_order_positive CHECK (plot_order IS NULL OR plot_order > 0)
);

-- =====================================
-- ÍNDICES
-- =====================================

-- Índice principal para consultas por huerta
CREATE INDEX idx_plots_garden_id ON plots(garden_id);

-- Índice para filtrado de parcelas activas
CREATE INDEX idx_plots_is_active ON plots(is_active);

-- Índice para tipo de riego (consultas analíticas)
CREATE INDEX idx_plots_irrigation_type ON plots(irrigation_type);

-- Índice para tipo de suelo (búsquedas por compatibilidad)
CREATE INDEX idx_plots_soil_type ON plots(soil_type);

-- Índice para ordenamiento temporal
CREATE INDEX idx_plots_created_at ON plots(created_at DESC);

-- Índice compuesto para consultas frecuentes
CREATE INDEX idx_plots_garden_active ON plots(garden_id, is_active);

-- Índice para orden de visualización
CREATE INDEX idx_plots_order ON plots(garden_id, plot_order) WHERE plot_order IS NOT NULL;

-- Índice de búsqueda de texto completo
CREATE INDEX idx_plots_search_text ON plots USING GIN(
    to_tsvector('spanish', 
        COALESCE(name, '') || ' ' || 
        COALESCE(code, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(soil_notes, '')
    )
);

-- =====================================
-- TRIGGERS
-- =====================================

-- Trigger para actualizar updated_at
CREATE TRIGGER update_plots_updated_at
    BEFORE UPDATE ON plots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para validar superficie total de parcelas vs huerta
CREATE OR REPLACE FUNCTION validate_plot_surface_against_garden()
RETURNS TRIGGER AS $$
DECLARE
    v_garden_surface NUMERIC(10, 2);
    v_total_plots_surface NUMERIC(10, 2);
BEGIN
    -- Obtener superficie de la huerta
    SELECT surface_m2 INTO v_garden_surface
    FROM gardens
    WHERE id = NEW.garden_id;
    
    -- Si la huerta no tiene superficie definida, permitir
    IF v_garden_surface IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Calcular superficie total de parcelas (incluyendo la nueva/modificada)
    SELECT COALESCE(SUM(surface_m2), 0) INTO v_total_plots_surface
    FROM plots
    WHERE garden_id = NEW.garden_id
      AND id != NEW.id  -- Excluir la parcela actual si es UPDATE
      AND is_active = true;
    
    -- Añadir la superficie de la parcela actual
    v_total_plots_surface := v_total_plots_surface + NEW.surface_m2;
    
    -- Validar que no exceda la superficie de la huerta (con 5% de tolerancia)
    IF v_total_plots_surface > v_garden_surface * 1.05 THEN
        RAISE EXCEPTION 'La suma de superficies de parcelas (% m²) excede la superficie de la huerta (% m²)',
            v_total_plots_surface, v_garden_surface
            USING HINT = 'Reduce la superficie de esta parcela o de otras existentes';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_plot_surface_before_insert
    BEFORE INSERT ON plots
    FOR EACH ROW
    EXECUTE FUNCTION validate_plot_surface_against_garden();

CREATE TRIGGER validate_plot_surface_before_update
    BEFORE UPDATE OF surface_m2, garden_id ON plots
    FOR EACH ROW
    EXECUTE FUNCTION validate_plot_surface_against_garden();

-- Trigger para asignar plot_order automáticamente si no se proporciona
CREATE OR REPLACE FUNCTION auto_assign_plot_order()
RETURNS TRIGGER AS $$
DECLARE
    v_max_order INTEGER;
BEGIN
    -- Solo asignar si plot_order es NULL
    IF NEW.plot_order IS NULL THEN
        -- Obtener el máximo orden actual para esta huerta
        SELECT COALESCE(MAX(plot_order), 0) INTO v_max_order
        FROM plots
        WHERE garden_id = NEW.garden_id;
        
        -- Asignar el siguiente orden
        NEW.plot_order := v_max_order + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_plot_order_before_insert
    BEFORE INSERT ON plots
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_plot_order();

-- ========================================
-- TABLA: crop_catalog (Catálogo Maestro)
-- ========================================
CREATE TABLE IF NOT EXISTS crop_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- IDENTIFICACIÓN BOTÁNICA
    -- =====================================
    common_name VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(150),
    family VARCHAR(100),                        -- Solanaceae, Brassicaceae, etc.
    
    -- =====================================
    -- CLASIFICACIÓN AGRONÓMICA
    -- =====================================
    category VARCHAR(50) NOT NULL,
    lifecycle VARCHAR(30) NOT NULL,
    growth_habit VARCHAR(30),
    
    -- =====================================
    -- CICLO DE CULTIVO
    -- =====================================
    days_to_harvest_min INTEGER NOT NULL,
    days_to_harvest_max INTEGER NOT NULL,
    days_to_germination INTEGER,               -- Days until germination
    
    -- =====================================
    -- REQUISITOS DE CLIMA
    -- =====================================
    min_temperature_c NUMERIC(4, 1),
    max_temperature_c NUMERIC(4, 1),
    optimal_temperature_min_c NUMERIC(4, 1),
    optimal_temperature_max_c NUMERIC(4, 1),
    frost_tolerant BOOLEAN DEFAULT false NOT NULL,
    heat_tolerant BOOLEAN DEFAULT false NOT NULL,
    
    -- =====================================
    -- REQUISITOS DE LUZ
    -- =====================================
    sun_requirement VARCHAR(30) NOT NULL,
    min_sun_hours NUMERIC(3, 1) NOT NULL,
    shade_tolerance VARCHAR(20),
    
    -- =====================================
    -- REQUISITOS DE SUELO
    -- =====================================
    preferred_soil_types VARCHAR(50)[],         -- Array: ['loamy', 'sandy']
    min_soil_ph NUMERIC(3, 1),
    max_soil_ph NUMERIC(3, 1),
    soil_depth_requirement VARCHAR(20),         -- shallow, medium, deep
    soil_fertility_requirement VARCHAR(30),
    
    -- =====================================
    -- NECESIDADES DE AGUA
    -- =====================================
    water_requirement VARCHAR(30) NOT NULL,
    drought_tolerant BOOLEAN DEFAULT false NOT NULL,
    waterlogging_tolerant BOOLEAN DEFAULT false NOT NULL,
    
    -- =====================================
    -- ESPACIADO Y SIEMBRA
    -- =====================================
    recommended_spacing_cm INTEGER,
    recommended_row_spacing_cm INTEGER,
    seed_depth_cm NUMERIC(4, 1),
    recommended_planting_methods VARCHAR(30)[],
    
    -- =====================================
    -- CALENDARIO (Meses 1-12)
    -- =====================================
    sowing_start_month INTEGER,
    sowing_end_month INTEGER,
    harvest_start_month INTEGER,
    harvest_end_month INTEGER,
    
    -- =====================================
    -- COMPATIBILIDADES (Companion Planting)
    -- =====================================
    companion_crops UUID[],
    incompatible_crops UUID[],
    
    -- =====================================
    -- ROTACIÓN DE CULTIVOS
    -- =====================================
    rotation_group VARCHAR(50),                 -- solanaceae, brassicaceae, legumes, etc.
    years_before_replant INTEGER,               -- Years to wait before replanting
    
    -- =====================================
    -- PLAGAS Y ENFERMEDADES
    -- =====================================
    common_pests JSONB,
    common_diseases JSONB,
    pest_resistance_level VARCHAR(20),
    
    -- =====================================
    -- INDICADORES ECOLÓGICOS
    -- =====================================
    nitrogen_fixer BOOLEAN DEFAULT false NOT NULL,
    attracts_pollinators BOOLEAN DEFAULT false NOT NULL,
    attracts_beneficial_insects BOOLEAN DEFAULT false NOT NULL,
    
    -- =====================================
    -- PRODUCCIÓN
    -- =====================================
    average_yield_kg_per_m2 NUMERIC(6, 2),
    harvest_type VARCHAR(30),                   -- single, continuous, cut_and_come_again
    
    -- =====================================
    -- CALENDARIO BIODINÁMICO (Opcional)
    -- =====================================
    preferred_moon_phase VARCHAR(30),
    biodynamic_type VARCHAR(30),
    
    -- =====================================
    -- INFORMACIÓN ADICIONAL
    -- =====================================
    description TEXT,
    growing_tips TEXT,
    culinary_uses TEXT,
    nutritional_info JSONB,
    
    -- =====================================
    -- AUDITORÍA
    -- =====================================
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT crop_catalog_name_not_empty CHECK (LENGTH(TRIM(common_name)) > 0),
    
    CONSTRAINT crop_catalog_category_valid CHECK (
        category IN (
            'vegetable_fruit',      -- Tomate, pimiento, berenjena
            'vegetable_leaf',       -- Lechuga, espinaca, acelga
            'vegetable_root',       -- Zanahoria, remolacha, rábano
            'vegetable_bulb',       -- Cebolla, ajo, puerro
            'legume',               -- Judía, guisante, haba
            'cucurbit',             -- Calabacín, pepino, melón, calabaza
            'herb',                 -- Albahaca, perejil, cilantro
            'grain',                -- Maíz, trigo (poco común en huertas)
            'tuber',                -- Patata, boniato
            'brassica',             -- Col, brócoli, coliflor
            'allium',               -- Familia de cebollas y ajos
            'cover_crop',           -- Abono verde
            'flower'                -- Flores comestibles o para polinizadores
        )
    ),
    
    CONSTRAINT crop_catalog_lifecycle_valid CHECK (
        lifecycle IN (
            'annual',
            'biennial',
            'perennial'
        )
    ),
    
    CONSTRAINT crop_catalog_growth_habit_valid CHECK (
        growth_habit IS NULL OR growth_habit IN (
            'upright',
            'bush',
            'climbing',
            'vining',
            'creeping',
            'rosette',
            'spreading'
        )
    ),
    
    CONSTRAINT crop_catalog_days_valid CHECK (
        days_to_harvest_max >= days_to_harvest_min AND
        days_to_harvest_min > 0
    ),
    
    CONSTRAINT crop_catalog_germination_valid CHECK (
        days_to_germination IS NULL OR days_to_germination > 0
    ),
    
    CONSTRAINT crop_catalog_temp_valid CHECK (
        (min_temperature_c IS NULL OR max_temperature_c IS NULL) OR 
        (max_temperature_c > min_temperature_c)
    ),
    
    CONSTRAINT crop_catalog_optimal_temp_valid CHECK (
        (optimal_temperature_min_c IS NULL OR optimal_temperature_max_c IS NULL) OR
        (optimal_temperature_max_c >= optimal_temperature_min_c)
    ),
    
    CONSTRAINT crop_catalog_sun_requirement_valid CHECK (
        sun_requirement IN (
            'full_sun',         -- >6 hours direct sun
            'partial_sun',      -- 4-6 hours
            'partial_shade',    -- 2-4 hours
            'full_shade'        -- <2 hours
        )
    ),
    
    CONSTRAINT crop_catalog_sun_hours_valid CHECK (
        min_sun_hours >= 0 AND min_sun_hours <= 24
    ),
    
    CONSTRAINT crop_catalog_shade_tolerance_valid CHECK (
        shade_tolerance IS NULL OR shade_tolerance IN (
            'none',
            'low',
            'medium',
            'high'
        )
    ),
    
    CONSTRAINT crop_catalog_soil_ph_valid CHECK (
        (min_soil_ph IS NULL OR (min_soil_ph >= 0 AND min_soil_ph <= 14)) AND
        (max_soil_ph IS NULL OR (max_soil_ph >= 0 AND max_soil_ph <= 14)) AND
        (min_soil_ph IS NULL OR max_soil_ph IS NULL OR max_soil_ph >= min_soil_ph)
    ),
    
    CONSTRAINT crop_catalog_soil_depth_valid CHECK (
        soil_depth_requirement IS NULL OR soil_depth_requirement IN (
            'shallow',      -- <30cm (radishes, lettuce)
            'medium',       -- 30-60cm (tomatoes, beans)
            'deep'          -- >60cm (carrots, potatoes)
        )
    ),
    
    CONSTRAINT crop_catalog_soil_fertility_valid CHECK (
        soil_fertility_requirement IS NULL OR soil_fertility_requirement IN (
            'low',
            'medium',
            'high',
            'very_high'
        )
    ),
    
    CONSTRAINT crop_catalog_water_requirement_valid CHECK (
        water_requirement IN (
            'low',
            'medium',
            'high',
            'very_high'
        )
    ),
    
    CONSTRAINT crop_catalog_spacing_valid CHECK (
        recommended_spacing_cm IS NULL OR recommended_spacing_cm > 0
    ),
    
    CONSTRAINT crop_catalog_row_spacing_valid CHECK (
        recommended_row_spacing_cm IS NULL OR recommended_row_spacing_cm > 0
    ),
    
    CONSTRAINT crop_catalog_seed_depth_valid CHECK (
        seed_depth_cm IS NULL OR seed_depth_cm > 0
    ),
    
    CONSTRAINT crop_catalog_months_valid CHECK (
        (sowing_start_month IS NULL OR (sowing_start_month >= 1 AND sowing_start_month <= 12)) AND
        (sowing_end_month IS NULL OR (sowing_end_month >= 1 AND sowing_end_month <= 12)) AND
        (harvest_start_month IS NULL OR (harvest_start_month >= 1 AND harvest_start_month <= 12)) AND
        (harvest_end_month IS NULL OR (harvest_end_month >= 1 AND harvest_end_month <= 12))
    ),
    
    CONSTRAINT crop_catalog_replant_years_valid CHECK (
        years_before_replant IS NULL OR years_before_replant >= 0
    ),
    
    CONSTRAINT crop_catalog_pest_resistance_valid CHECK (
        pest_resistance_level IS NULL OR pest_resistance_level IN (
            'very_low',
            'low',
            'medium',
            'high',
            'very_high'
        )
    ),
    
    CONSTRAINT crop_catalog_yield_valid CHECK (
        average_yield_kg_per_m2 IS NULL OR average_yield_kg_per_m2 > 0
    ),
    
    CONSTRAINT crop_catalog_harvest_type_valid CHECK (
        harvest_type IS NULL OR harvest_type IN (
            'single',               -- One harvest (carrots, onions)
            'continuous',           -- Multiple harvests (tomatoes, peppers)
            'cut_and_come_again'    -- Regrows after cutting (lettuce, herbs)
        )
    ),
    
    CONSTRAINT crop_catalog_moon_phase_valid CHECK (
        preferred_moon_phase IS NULL OR preferred_moon_phase IN (
            'new_moon',
            'waxing_crescent',
            'first_quarter',
            'waxing_gibbous',
            'full_moon',
            'waning_gibbous',
            'last_quarter',
            'waning_crescent'
        )
    ),
    
    CONSTRAINT crop_catalog_biodynamic_type_valid CHECK (
        biodynamic_type IS NULL OR biodynamic_type IN (
            'root_day',
            'leaf_day',
            'fruit_day',
            'flower_day'
        )
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

CREATE INDEX idx_crop_catalog_common_name ON crop_catalog(common_name);
CREATE INDEX idx_crop_catalog_category ON crop_catalog(category);
CREATE INDEX idx_crop_catalog_family ON crop_catalog(family);
CREATE INDEX idx_crop_catalog_lifecycle ON crop_catalog(lifecycle);
CREATE INDEX idx_crop_catalog_water_requirement ON crop_catalog(water_requirement);
CREATE INDEX idx_crop_catalog_sun_requirement ON crop_catalog(sun_requirement);
CREATE INDEX idx_crop_catalog_rotation_group ON crop_catalog(rotation_group);
CREATE INDEX idx_crop_catalog_is_active ON crop_catalog(is_active);

-- Índice de búsqueda de texto completo
CREATE INDEX idx_crop_catalog_search ON crop_catalog USING GIN(
    to_tsvector('english', 
        COALESCE(common_name, '') || ' ' || 
        COALESCE(scientific_name, '') || ' ' || 
        COALESCE(description, '')
    )
);

-- Índice para arrays (compatibilidades)
CREATE INDEX idx_crop_catalog_companion_crops ON crop_catalog USING GIN(companion_crops);
CREATE INDEX idx_crop_catalog_incompatible_crops ON crop_catalog USING GIN(incompatible_crops);

-- Índice para JSONB
CREATE INDEX idx_crop_catalog_pests ON crop_catalog USING GIN(common_pests);
CREATE INDEX idx_crop_catalog_diseases ON crop_catalog USING GIN(common_diseases);

-- =====================================
-- TRIGGER
-- =====================================

CREATE TRIGGER update_crop_catalog_updated_at
    BEFORE UPDATE ON crop_catalog
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- COMENTARIOS (Para documentación)
-- =====================================

COMMENT ON TABLE crop_catalog IS 'Master catalog of crop types with agronomic data';
COMMENT ON COLUMN crop_catalog.companion_crops IS 'Array of crop IDs that grow well together (companion planting)';
COMMENT ON COLUMN crop_catalog.incompatible_crops IS 'Array of crop IDs that should not be planted together';
COMMENT ON COLUMN crop_catalog.rotation_group IS 'Group identifier for crop rotation planning';
COMMENT ON COLUMN crop_catalog.years_before_replant IS 'Recommended years to wait before replanting same crop in same plot';
COMMENT ON COLUMN crop_catalog.common_pests IS 'JSON array of common pests: [{"name": "aphid", "severity": "high"}]';
COMMENT ON COLUMN crop_catalog.common_diseases IS 'JSON array of common diseases: [{"name": "blight", "prevention": "..."}]';
COMMENT ON COLUMN crop_catalog.harvest_type IS 'single: one harvest, continuous: multiple, cut_and_come_again: regrows';

-- ========================================
-- TABLA: plantings (Plantaciones)
-- ========================================
CREATE TABLE IF NOT EXISTS plantings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- RELACIONES PRINCIPALES
    -- =====================================
    crop_catalog_id UUID NOT NULL REFERENCES crop_catalog(id) ON DELETE RESTRICT,
    plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- =====================================
    -- IDENTIFICACIÓN
    -- =====================================
    variety VARCHAR(100),                       -- Specific variety (e.g., "Cherry", "RAF", "Beefsteak")
    custom_name VARCHAR(150),                   -- User's custom name for this planting
    
    -- =====================================
    -- FECHAS DEL CICLO DE VIDA
    -- =====================================
    planned_planting_date DATE,
    actual_planting_date DATE,
    germination_date DATE,                      -- When seeds germinated
    transplant_date DATE,                       -- If transplanted from seedbed
    expected_harvest_date DATE,
    first_harvest_date DATE,
    last_harvest_date DATE,
    removal_date DATE,                          -- When plant was removed
    
    -- =====================================
    -- ESTADO DEL CULTIVO
    -- =====================================
    status VARCHAR(30) NOT NULL DEFAULT 'planned',
    health_status VARCHAR(30) DEFAULT 'healthy',
    
    -- =====================================
    -- DETALLES DE PLANTACIÓN
    -- =====================================
    planting_method VARCHAR(30),
    quantity INTEGER,                            -- Number of plants/seeds
    actual_spacing_cm INTEGER,
    actual_row_spacing_cm INTEGER,
    
    -- =====================================
    -- ESPACIO OCUPADO
    -- =====================================
    surface_m2 NUMERIC(8, 2),
    position_in_plot VARCHAR(100),              -- e.g., "North corner", "Central row"
    
    -- =====================================
    -- PRODUCCIÓN Y RENDIMIENTO
    -- =====================================
    total_harvest_kg NUMERIC(10, 2),
    harvest_quality VARCHAR(20),
    harvest_notes TEXT,
    
    -- =====================================
    -- GESTIÓN DE FALLOS
    -- =====================================
    failure_reason VARCHAR(50),
    failure_notes TEXT,
    
    -- =====================================
    -- TRATAMIENTOS APLICADOS
    -- =====================================
    fertilizers_applied JSONB,
    pesticides_applied JSONB,
    other_treatments JSONB,
    
    -- =====================================
    -- AGRICULTURA BIODINÁMICA (Opcional)
    -- =====================================
    moon_phase_at_planting VARCHAR(30),
    biodynamic_calendar_type VARCHAR(30),
    
    -- =====================================
    -- ASOCIACIONES
    -- =====================================
    companion_planting_ids UUID[],
    
    -- =====================================
    -- OBSERVACIONES
    -- =====================================
    notes TEXT,
    photos JSONB,                               -- Array of photo URLs
    
    -- =====================================
    -- AUDITORÍA
    -- =====================================
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT plantings_quantity_positive CHECK (
        quantity IS NULL OR quantity > 0
    ),
    
    CONSTRAINT plantings_spacing_positive CHECK (
        actual_spacing_cm IS NULL OR actual_spacing_cm > 0
    ),
    
    CONSTRAINT plantings_row_spacing_positive CHECK (
        actual_row_spacing_cm IS NULL OR actual_row_spacing_cm > 0
    ),
    
    CONSTRAINT plantings_surface_positive CHECK (
        surface_m2 IS NULL OR surface_m2 > 0
    ),
    
    CONSTRAINT plantings_harvest_positive CHECK (
        total_harvest_kg IS NULL OR total_harvest_kg >= 0
    ),
    
    CONSTRAINT plantings_status_valid CHECK (
        status IN (
            'planned',
            'sowed',
            'germinating',
            'growing',
            'flowering',
            'fruiting',
            'harvesting',
            'harvested',
            'failed',
            'cancelled'
        )
    ),
    
    CONSTRAINT plantings_health_status_valid CHECK (
        health_status IN (
            'healthy',
            'stressed',
            'pest_affected',
            'disease_affected',
            'recovering',
            'dying',
            'dead'
        )
    ),
    
    CONSTRAINT plantings_planting_method_valid CHECK (
        planting_method IS NULL OR planting_method IN (
            'direct_seed',
            'transplant',
            'broadcast',
            'seedling_tray',
            'cutting',
            'bulb',
            'tuber',
            'division'
        )
    ),
    
    CONSTRAINT plantings_harvest_quality_valid CHECK (
        harvest_quality IS NULL OR harvest_quality IN (
            'excellent',
            'good',
            'acceptable',
            'poor',
            'unmarketable'
        )
    ),
    
    CONSTRAINT plantings_failure_reason_valid CHECK (
        failure_reason IS NULL OR failure_reason IN (
            'pest',
            'disease',
            'adverse_weather',
            'frost',
            'drought',
            'waterlogging',
            'poor_seed_quality',
            'human_error',
            'weed_competition',
            'animal_damage',
            'inadequate_soil',
            'nutrient_deficiency',
            'other'
        )
    ),
    
    CONSTRAINT plantings_moon_phase_valid CHECK (
        moon_phase_at_planting IS NULL OR moon_phase_at_planting IN (
            'new_moon',
            'waxing_crescent',
            'first_quarter',
            'waxing_gibbous',
            'full_moon',
            'waning_gibbous',
            'last_quarter',
            'waning_crescent'
        )
    ),
    
    CONSTRAINT plantings_biodynamic_type_valid CHECK (
        biodynamic_calendar_type IS NULL OR biodynamic_calendar_type IN (
            'root_day',
            'leaf_day',
            'fruit_day',
            'flower_day'
        )
    ),
    
    -- Validación lógica de fechas
    CONSTRAINT plantings_dates_logical CHECK (
        (actual_planting_date IS NULL OR expected_harvest_date IS NULL OR 
         expected_harvest_date >= actual_planting_date) AND
        (actual_planting_date IS NULL OR germination_date IS NULL OR 
         germination_date >= actual_planting_date) AND
        (actual_planting_date IS NULL OR transplant_date IS NULL OR 
         transplant_date >= actual_planting_date) AND
        (actual_planting_date IS NULL OR first_harvest_date IS NULL OR 
         first_harvest_date >= actual_planting_date) AND
        (first_harvest_date IS NULL OR last_harvest_date IS NULL OR 
         last_harvest_date >= first_harvest_date) AND
        (actual_planting_date IS NULL OR removal_date IS NULL OR 
         removal_date >= actual_planting_date)
    ),
    
    -- Si status='failed', debe haber razón
    CONSTRAINT plantings_failure_requires_reason CHECK (
        status != 'failed' OR failure_reason IS NOT NULL
    ),
    
    -- Al menos una fecha de plantación debe existir
    CONSTRAINT plantings_requires_planting_date CHECK (
        planned_planting_date IS NOT NULL OR actual_planting_date IS NOT NULL
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

-- Índices de relaciones
CREATE INDEX idx_plantings_crop_catalog_id ON plantings(crop_catalog_id);
CREATE INDEX idx_plantings_plot_id ON plantings(plot_id);
CREATE INDEX idx_plantings_garden_id ON plantings(garden_id);
CREATE INDEX idx_plantings_created_by ON plantings(created_by);

-- Índices de estado y fechas
CREATE INDEX idx_plantings_status ON plantings(status);
CREATE INDEX idx_plantings_health_status ON plantings(health_status);
CREATE INDEX idx_plantings_actual_planting_date ON plantings(actual_planting_date);
CREATE INDEX idx_plantings_expected_harvest_date ON plantings(expected_harvest_date);
CREATE INDEX idx_plantings_is_active ON plantings(is_active);

-- Índices compuestos para queries frecuentes
CREATE INDEX idx_plantings_plot_active_status ON plantings(plot_id, is_active, status);
CREATE INDEX idx_plantings_garden_active ON plantings(garden_id, is_active);
CREATE INDEX idx_plantings_harvest_window ON plantings(expected_harvest_date, status) 
    WHERE status IN ('growing', 'flowering', 'fruiting', 'harvesting');

-- Índice para búsqueda de texto
CREATE INDEX idx_plantings_search_text ON plantings USING GIN(
    to_tsvector('english', 
        COALESCE(variety, '') || ' ' || 
        COALESCE(custom_name, '') || ' ' || 
        COALESCE(notes, '')
    )
);

-- Índice parcial para plantaciones activas
CREATE INDEX idx_plantings_active_growing ON plantings(plot_id, actual_planting_date)
    WHERE is_active = true AND status IN ('growing', 'flowering', 'fruiting', 'harvesting');

-- Índices para arrays
CREATE INDEX idx_plantings_companion_ids ON plantings USING GIN(companion_planting_ids);

-- Índices para JSONB
CREATE INDEX idx_plantings_fertilizers ON plantings USING GIN(fertilizers_applied);
CREATE INDEX idx_plantings_pesticides ON plantings USING GIN(pesticides_applied);
CREATE INDEX idx_plantings_photos ON plantings USING GIN(photos);

-- =====================================
-- TRIGGERS
-- =====================================

-- Trigger para updated_at
CREATE TRIGGER update_plantings_updated_at
    BEFORE UPDATE ON plantings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para calcular expected_harvest_date automáticamente
CREATE OR REPLACE FUNCTION calculate_expected_harvest_date()
RETURNS TRIGGER AS $$
DECLARE
    v_days_to_harvest INTEGER;
BEGIN
    -- Solo calcular si no se proporciona manualmente y hay fecha de plantación real
    IF NEW.expected_harvest_date IS NULL AND NEW.actual_planting_date IS NOT NULL THEN
        -- Obtener días promedio hasta cosecha del catálogo
        SELECT (days_to_harvest_min + days_to_harvest_max) / 2 
        INTO v_days_to_harvest
        FROM crop_catalog
        WHERE id = NEW.crop_catalog_id;
        
        IF v_days_to_harvest IS NOT NULL THEN
            NEW.expected_harvest_date := NEW.actual_planting_date + (v_days_to_harvest || ' days')::INTERVAL;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_harvest_date
    BEFORE INSERT OR UPDATE OF actual_planting_date, crop_catalog_id ON plantings
    FOR EACH ROW
    EXECUTE FUNCTION calculate_expected_harvest_date();

-- Trigger para validar superficie ocupada vs parcela
CREATE OR REPLACE FUNCTION validate_planting_surface_in_plot()
RETURNS TRIGGER AS $$
DECLARE
    v_plot_surface NUMERIC(10, 2);
    v_total_plantings_surface NUMERIC(10, 2);
BEGIN
    -- Si no se especifica superficie de plantación, permitir
    IF NEW.surface_m2 IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Obtener superficie de la parcela
    SELECT surface_m2 INTO v_plot_surface
    FROM plots
    WHERE id = NEW.plot_id;
    
    -- Calcular superficie total ocupada por plantaciones activas
    SELECT COALESCE(SUM(surface_m2), 0) INTO v_total_plantings_surface
    FROM plantings
    WHERE plot_id = NEW.plot_id
      AND id != NEW.id
      AND is_active = true
      AND status NOT IN ('harvested', 'failed', 'cancelled');
    
    v_total_plantings_surface := v_total_plantings_surface + NEW.surface_m2;
    
    -- Validar que no exceda (con 2% de tolerancia)
    IF v_total_plantings_surface > v_plot_surface * 1.02 THEN
        RAISE EXCEPTION 'Total planting surface (% m²) exceeds plot surface (% m²)',
            v_total_plantings_surface, v_plot_surface
            USING HINT = 'Reduce surface of this planting or harvest/remove other plantings';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_planting_surface_before_save
    BEFORE INSERT OR UPDATE OF surface_m2, plot_id, status ON plantings
    FOR EACH ROW
    EXECUTE FUNCTION validate_planting_surface_in_plot();

-- Trigger para auto-actualizar estado basado en fechas
CREATE OR REPLACE FUNCTION auto_update_planting_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se registra última fecha de cosecha y status no es final, actualizar
    IF NEW.last_harvest_date IS NOT NULL AND OLD.last_harvest_date IS NULL 
       AND NEW.status NOT IN ('harvested', 'failed', 'cancelled') THEN
        NEW.status := 'harvested';
    END IF;
    
    -- Si se marca como removida, actualizar status
    IF NEW.removal_date IS NOT NULL AND OLD.removal_date IS NULL
       AND NEW.status NOT IN ('harvested', 'failed', 'cancelled') THEN
        NEW.status := 'harvested';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_status_on_dates
    BEFORE UPDATE OF last_harvest_date, removal_date ON plantings
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION auto_update_planting_status();

-- Trigger para validar compatibilidad con rotación de cultivos
CREATE OR REPLACE FUNCTION validate_crop_rotation()
RETURNS TRIGGER AS $$
DECLARE
    v_rotation_group VARCHAR(50);
    v_years_before_replant INTEGER;
    v_last_planting_date DATE;
    v_days_since_last INTEGER;
BEGIN
    -- Solo validar en INSERT o cambio de crop/plot
    IF TG_OP = 'UPDATE' AND OLD.crop_catalog_id = NEW.crop_catalog_id 
       AND OLD.plot_id = NEW.plot_id THEN
        RETURN NEW;
    END IF;
    
    -- Solo validar si hay fecha real de plantación
    IF NEW.actual_planting_date IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Obtener grupo de rotación del cultivo
    SELECT rotation_group, years_before_replant 
    INTO v_rotation_group, v_years_before_replant
    FROM crop_catalog
    WHERE id = NEW.crop_catalog_id;
    
    -- Si no hay restricción de rotación, permitir
    IF v_rotation_group IS NULL OR v_years_before_replant IS NULL OR v_years_before_replant = 0 THEN
        RETURN NEW;
    END IF;
    
    -- Buscar última plantación del mismo grupo en la parcela
    SELECT MAX(actual_planting_date) INTO v_last_planting_date
    FROM plantings p
    JOIN crop_catalog cc ON p.crop_catalog_id = cc.id
    WHERE p.plot_id = NEW.plot_id
      AND cc.rotation_group = v_rotation_group
      AND p.id != NEW.id
      AND p.actual_planting_date IS NOT NULL;
    
    -- Validar que haya pasado el tiempo necesario
    IF v_last_planting_date IS NOT NULL THEN
        v_days_since_last := NEW.actual_planting_date - v_last_planting_date;
        
        IF v_days_since_last < (v_years_before_replant * 365) THEN
            RAISE WARNING 'Crop rotation: It is recommended to wait % years before replanting crops from group "%" in this plot (last planting: %, days since: %)',
                v_years_before_replant, v_rotation_group, v_last_planting_date, v_days_since_last
                USING HINT = 'This is a warning, not a blocking error. Consider planting a different crop family.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar rotación de cultivos
CREATE TRIGGER validate_crop_rotation_before_insert
    BEFORE INSERT ON plantings
    FOR EACH ROW
    EXECUTE FUNCTION validate_crop_rotation();

CREATE TRIGGER validate_crop_rotation_before_update
    BEFORE UPDATE OF crop_catalog_id, plot_id, actual_planting_date ON plantings
    FOR EACH ROW
    EXECUTE FUNCTION validate_crop_rotation();

-- ========================================
-- TABLA: tasks (Tareas Agrícolas)
-- ========================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- CONTEXTO JERÁRQUICO
    -- =====================================
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    plot_id UUID REFERENCES plots(id) ON DELETE SET NULL,
    planting_id UUID REFERENCES plantings(id) ON DELETE SET NULL, -- NO Cascade JUSTIFICAMOS por mantener historical
    
    -- =====================================
    -- CLASIFICACIÓN Y ORIGEN
    -- =====================================
    task_type VARCHAR(50) NOT NULL,
    task_category VARCHAR(30),                  -- Grouping of related tasks
    generated_by VARCHAR(30) NOT NULL DEFAULT 'system',
    template_id UUID,                           -- Reference to task template (if auto-generated)
    
    -- =====================================
    -- PLANIFICACIÓN TEMPORAL
    -- =====================================
    scheduled_date DATE NOT NULL,
    due_date DATE,
    estimated_duration_minutes INTEGER,
    
    -- Soporte para tareas recurrentes
    is_recurring BOOLEAN DEFAULT false NOT NULL,
    recurrence_pattern VARCHAR(50),             -- daily, weekly, biweekly, monthly
    recurrence_interval INTEGER,                -- Every N days/weeks/months
    recurrence_end_date DATE,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,  -- Original task if this is a recurrence
    
    -- =====================================
    -- ESTADO Y EJECUCIÓN
    -- =====================================
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium' NOT NULL,
    
    -- Fechas de completado/cancelación
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    actual_duration_minutes INTEGER,
    
    postponed_at TIMESTAMP WITH TIME ZONE,
    postponed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    postponed_reason TEXT,
    postponed_until DATE,
    
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    cancellation_reason TEXT,
    
    -- =====================================
    -- JUSTIFICACIÓN Y CONTEXTO
    -- =====================================
    reason VARCHAR(50),
    related_moon_phase VARCHAR(30),
    related_weather_event VARCHAR(50),
    climate_triggered BOOLEAN DEFAULT false,    -- True if triggered by weather alerts
    
    -- =====================================
    -- CONTENIDO
    -- =====================================
    title VARCHAR(200) NOT NULL,
    description TEXT,
    instructions TEXT,                          -- Step-by-step instructions
    
    -- =====================================
    -- GESTIÓN DE USUARIO
    -- =====================================
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- =====================================
    -- RESULTADOS Y OBSERVACIONES
    -- =====================================
    completion_notes TEXT,
    observations TEXT,
    photos JSONB,                               -- Array of photo URLs with metadata
    
    -- =====================================
    -- DEPENDENCIAS
    -- =====================================
    depends_on_task_ids UUID[],                 -- Tasks that must be completed first
    blocks_task_ids UUID[],                     -- Tasks that cannot start until this is done
    
    -- =====================================
    -- METADATA ADICIONAL
    -- =====================================
    tags VARCHAR(50)[],                         -- Custom tags for filtering
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- =====================================
    -- AUDITORÍA
    -- =====================================
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT tasks_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
    
    CONSTRAINT tasks_task_type_valid CHECK (
        task_type IN (
            'watering',
            'weeding',
            'fertilizing',
            'planting',
            'sowing',
            'transplanting',
            'harvesting',
            'pruning',
            'thinning',              -- Thinning seedlings
            'staking',               -- Installing stakes/supports
            'treatment',             -- Pest/disease treatment
            'observation',
            'soil_preparation',
            'soil_amendment',        -- Adding compost, amendments
            'mulching',
            'crop_rotation',
            'cover_crop',
            'pest_control',
            'disease_management',
            'irrigation_setup',
            'maintenance',           -- General maintenance
            'cleanup',               -- Plot cleanup
            'composting',
            'seed_collection',
            'record_keeping',
            'other'
        )
    ),
    
    CONSTRAINT tasks_task_category_valid CHECK (
        task_category IS NULL OR task_category IN (
            'planting',
            'maintenance',
            'watering',
            'nutrition',
            'pest_disease',
            'harvesting',
            'preparation',
            'observation'
        )
    ),
    
    CONSTRAINT tasks_generated_by_valid CHECK (
        generated_by IN (
            'system',
            'user',
            'weather_alert',         -- Auto-generated from weather conditions
            'pest_detection'         -- Auto-generated from pest observation
        )
    ),
    
    CONSTRAINT tasks_status_valid CHECK (
        status IN (
            'pending',
            'in_progress',           -- User started the task
            'completed',
            'postponed',
            'cancelled',
            'skipped',               -- Deliberately skipped (e.g., rain made watering unnecessary)
            'overdue'                -- System can auto-update if past due_date
        )
    ),
    
    CONSTRAINT tasks_priority_valid CHECK (
        priority IN (
            'critical',              -- Must be done today (e.g., harvest before spoiling)
            'high',                  -- Should be done soon
            'medium',                -- Normal priority
            'low',                   -- Can wait
            'optional'               -- Nice to have
        )
    ),
    
    CONSTRAINT tasks_reason_valid CHECK (
        reason IS NULL OR reason IN (
            'crop_calendar',
            'growth_stage',          -- Based on current growth stage
            'weather_forecast',
            'moon_calendar',
            'user_request',
            'preventive',
            'corrective',
            'emergency',             -- Urgent issue (pest outbreak, disease)
            'seasonal',              -- Seasonal activity
            'maintenance_schedule'
        )
    ),
    
    CONSTRAINT tasks_moon_phase_valid CHECK (
        related_moon_phase IS NULL OR related_moon_phase IN (
            'new_moon',
            'waxing_crescent',
            'first_quarter',
            'waxing_gibbous',
            'full_moon',
            'waning_gibbous',
            'last_quarter',
            'waning_crescent'
        )
    ),
    
    CONSTRAINT tasks_recurrence_pattern_valid CHECK (
        recurrence_pattern IS NULL OR recurrence_pattern IN (
            'daily',
            'weekly',
            'biweekly',
            'monthly',
            'custom'                 -- Uses recurrence_interval
        )
    ),
    
    CONSTRAINT tasks_recurrence_interval_valid CHECK (
        recurrence_interval IS NULL OR recurrence_interval > 0
    ),
    
    CONSTRAINT tasks_estimated_duration_valid CHECK (
        estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0
    ),
    
    CONSTRAINT tasks_actual_duration_valid CHECK (
        actual_duration_minutes IS NULL OR actual_duration_minutes >= 0
    ),
    
    CONSTRAINT tasks_dates_valid CHECK (
        (due_date IS NULL OR due_date >= scheduled_date) AND
        (postponed_until IS NULL OR postponed_until > scheduled_date) AND
        (recurrence_end_date IS NULL OR recurrence_end_date >= scheduled_date)
    ),
    
    -- Si es recurrente, debe tener patrón
    CONSTRAINT tasks_recurring_requires_pattern CHECK (
        is_recurring = false OR recurrence_pattern IS NOT NULL
    ),
    
    -- Si está postponed, debe tener razón
    CONSTRAINT tasks_postponed_requires_reason CHECK (
        status != 'postponed' OR postponed_reason IS NOT NULL
    ),
    
    -- Si está cancelled, debe tener razón
    CONSTRAINT tasks_cancelled_requires_reason CHECK (
        status != 'cancelled' OR cancellation_reason IS NOT NULL
    ),
    
    -- Si está completada, debe tener completed_at
    CONSTRAINT tasks_completed_requires_timestamp CHECK (
        status != 'completed' OR completed_at IS NOT NULL
    ),
    
    -- Al menos debe estar asociada a garden (plot y planting son opcionales)
    CONSTRAINT tasks_requires_context CHECK (
        garden_id IS NOT NULL
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

-- Índices de relaciones
CREATE INDEX idx_tasks_garden_id ON tasks(garden_id);
CREATE INDEX idx_tasks_plot_id ON tasks(plot_id) WHERE plot_id IS NOT NULL;
CREATE INDEX idx_tasks_planting_id ON tasks(planting_id) WHERE planting_id IS NOT NULL;
CREATE INDEX idx_tasks_template_id ON tasks(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;

-- Índices de estado y fechas
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_task_type ON tasks(task_type);
CREATE INDEX idx_tasks_task_category ON tasks(task_category) WHERE task_category IS NOT NULL;
CREATE INDEX idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_is_active ON tasks(is_active);

-- Índices de asignación
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_tasks_completed_by ON tasks(completed_by) WHERE completed_by IS NOT NULL;

-- Índices compuestos para queries frecuentes
CREATE INDEX idx_tasks_calendar ON tasks(garden_id, scheduled_date, status);
CREATE INDEX idx_tasks_pending_by_date ON tasks(scheduled_date, priority) 
    WHERE status = 'pending' AND is_active = true;
CREATE INDEX idx_tasks_user_pending ON tasks(assigned_to, status, scheduled_date)
    WHERE status IN ('pending', 'in_progress');
CREATE INDEX idx_tasks_overdue ON tasks(garden_id, due_date)
    WHERE status = 'pending';

-- Índice para tareas recurrentes
CREATE INDEX idx_tasks_recurring ON tasks(is_recurring, recurrence_end_date)
    WHERE is_recurring = true;

-- Índices para arrays
CREATE INDEX idx_tasks_depends_on ON tasks USING GIN(depends_on_task_ids);
CREATE INDEX idx_tasks_blocks ON tasks USING GIN(blocks_task_ids);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);

-- Índice para JSONB
CREATE INDEX idx_tasks_photos ON tasks USING GIN(photos);

-- Índice de búsqueda de texto completo
CREATE INDEX idx_tasks_search ON tasks USING GIN(
    to_tsvector('english', 
        COALESCE(title, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(instructions, '')
    )
);

-- =====================================
-- TRIGGERS
-- =====================================

-- Trigger para updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para auto-marcar como overdue
CREATE OR REPLACE FUNCTION auto_mark_tasks_overdue()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la tarea está pendiente y pasó su due_date, marcar como overdue
    IF NEW.status = 'pending' AND NEW.due_date IS NOT NULL AND NEW.due_date < CURRENT_DATE THEN
        NEW.status := 'overdue';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_task_overdue
    BEFORE INSERT OR UPDATE OF status, due_date ON tasks
    FOR EACH ROW
    WHEN (NEW.status = 'pending')
    EXECUTE FUNCTION auto_mark_tasks_overdue();

-- Trigger para registrar timestamps al completar/posponer/cancelar
CREATE OR REPLACE FUNCTION set_task_action_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Al completar
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        IF NEW.completed_at IS NULL THEN
            NEW.completed_at := NOW();
        END IF;
    END IF;
    
    -- Al posponer
    IF NEW.status = 'postponed' AND OLD.status != 'postponed' THEN
        IF NEW.postponed_at IS NULL THEN
            NEW.postponed_at := NOW();
        END IF;
    END IF;
    
    -- Al cancelar
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        IF NEW.cancelled_at IS NULL THEN
            NEW.cancelled_at := NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_set_task_timestamps
    BEFORE UPDATE OF status ON tasks
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION set_task_action_timestamps();

-- Trigger para validar dependencias de tareas
CREATE OR REPLACE FUNCTION validate_task_dependencies()
RETURNS TRIGGER AS $$
DECLARE
    v_incomplete_dependencies INTEGER;
BEGIN
    -- Solo validar si la tarea se está marcando como completada
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        RETURN NEW;
    END IF;
    
    -- Si la tarea tiene dependencias, verificar que estén completadas
    IF NEW.depends_on_task_ids IS NOT NULL AND array_length(NEW.depends_on_task_ids, 1) > 0 THEN
        SELECT COUNT(*) INTO v_incomplete_dependencies
        FROM tasks
        WHERE id = ANY(NEW.depends_on_task_ids)
          AND status NOT IN ('completed', 'skipped');
        
        IF v_incomplete_dependencies > 0 THEN
            RAISE WARNING 'This task has % incomplete dependencies. Consider completing them first.',
                v_incomplete_dependencies
                USING HINT = 'This is a warning, not a blocking error.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_task_dependencies
    BEFORE UPDATE OF status ON tasks
    FOR EACH ROW
    WHEN (NEW.status IN ('in_progress', 'completed'))
    EXECUTE FUNCTION validate_task_dependencies();

-- Trigger para generar tareas recurrentes
CREATE OR REPLACE FUNCTION generate_next_recurring_task()
RETURNS TRIGGER AS $$
DECLARE
    v_next_date DATE;
    v_interval_days INTEGER;
BEGIN
    -- Solo proceder si la tarea es recurrente y se completó
    IF NOT NEW.is_recurring OR NEW.status != 'completed' OR OLD.status = 'completed' THEN
        RETURN NEW;
    END IF;
    
    -- Verificar que no haya pasado la fecha de fin de recurrencia
    IF NEW.recurrence_end_date IS NOT NULL AND CURRENT_DATE >= NEW.recurrence_end_date THEN
        RETURN NEW;
    END IF;
    
    -- Calcular próxima fecha según patrón
    CASE NEW.recurrence_pattern
        WHEN 'daily' THEN
            v_interval_days := COALESCE(NEW.recurrence_interval, 1);
        WHEN 'weekly' THEN
            v_interval_days := COALESCE(NEW.recurrence_interval, 1) * 7;
        WHEN 'biweekly' THEN
            v_interval_days := COALESCE(NEW.recurrence_interval, 1) * 14;
        WHEN 'monthly' THEN
            v_interval_days := COALESCE(NEW.recurrence_interval, 1) * 30;
        WHEN 'custom' THEN
            v_interval_days := NEW.recurrence_interval;
        ELSE
            RETURN NEW;
    END CASE;
    
    v_next_date := NEW.scheduled_date + v_interval_days;
    
    -- Verificar que la próxima fecha no exceda el fin de recurrencia
    IF NEW.recurrence_end_date IS NOT NULL AND v_next_date > NEW.recurrence_end_date THEN
        RETURN NEW;
    END IF;
    
    -- Crear nueva tarea
    INSERT INTO tasks (
        garden_id, plot_id, planting_id,
        task_type, task_category, generated_by, template_id,
        scheduled_date, due_date, estimated_duration_minutes,
        is_recurring, recurrence_pattern, recurrence_interval, recurrence_end_date,
        parent_task_id,
        status, priority,
        reason, related_moon_phase,
        title, description, instructions,
        assigned_to,
        tags
    ) VALUES (
        NEW.garden_id, NEW.plot_id, NEW.planting_id,
        NEW.task_type, NEW.task_category, 'system', NEW.template_id,
        v_next_date, 
        CASE WHEN NEW.due_date IS NOT NULL THEN v_next_date + (NEW.due_date - NEW.scheduled_date) ELSE NULL END,
        NEW.estimated_duration_minutes,
        true, NEW.recurrence_pattern, NEW.recurrence_interval, NEW.recurrence_end_date,
        COALESCE(NEW.parent_task_id, NEW.id),
        'pending', NEW.priority,
        NEW.reason, NEW.related_moon_phase,
        NEW.title, NEW.description, NEW.instructions,
        NEW.assigned_to,
        NEW.tags
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_recurring_task
    AFTER UPDATE OF status ON tasks
    FOR EACH ROW
    WHEN (NEW.is_recurring = true)
    EXECUTE FUNCTION generate_next_recurring_task();

-- =====================================
-- COMENTARIOS
-- =====================================

COMMENT ON TABLE tasks IS 'Agricultural tasks for gardens, plots, and specific plantings';
COMMENT ON COLUMN tasks.template_id IS 'Reference to task template if auto-generated from crop calendar';
COMMENT ON COLUMN tasks.is_recurring IS 'Whether this task repeats on a schedule';
COMMENT ON COLUMN tasks.parent_task_id IS 'Original task if this is a recurring instance';
COMMENT ON COLUMN tasks.depends_on_task_ids IS 'Array of task IDs that must be completed before this one';
COMMENT ON COLUMN tasks.blocks_task_ids IS 'Array of task IDs that cannot start until this is completed';
COMMENT ON COLUMN tasks.photos IS 'JSON array: [{"url": "https://...", "caption": "Before treatment", "timestamp": "2025-05-01T10:00:00Z"}]';
COMMENT ON COLUMN tasks.tags IS 'Custom tags for filtering and categorization';
COMMENT ON COLUMN tasks.climate_triggered IS 'True if task was auto-generated from weather alerts';

-- ========================================
-- TABLA: crop_compatibilities (Base de Conocimiento)
-- ========================================
CREATE TABLE IF NOT EXISTS crop_compatibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- RELACIÓN DIRECCIONAL
    -- =====================================
    crop_catalog_id UUID NOT NULL REFERENCES crop_catalog(id) ON DELETE CASCADE,
    companion_crop_catalog_id UUID NOT NULL REFERENCES crop_catalog(id) ON DELETE CASCADE,
    
    -- =====================================
    -- TIPO Y FUERZA DE LA RELACIÓN
    -- =====================================
    compatibility_type VARCHAR(30) NOT NULL,
    
    -- Fuerza del efecto (-10 a +10, escala ampliada para mayor granularidad)
    compatibility_strength INTEGER NOT NULL,
    severity_level VARCHAR(20),                 -- For incompatibilities: how bad?
    
    -- =====================================
    -- EFECTOS ESPECÍFICOS
    -- =====================================
    primary_effect VARCHAR(50) NOT NULL,
    secondary_effects VARCHAR(50)[],            -- Additional benefits/problems
    mechanism VARCHAR(100),                     -- How does it work?
    
    -- =====================================
    -- DESCRIPCIÓN Y EVIDENCIA
    -- =====================================
    description TEXT,
    practical_tips TEXT,
    
    -- Nivel de evidencia científica
    evidence_level VARCHAR(20) NOT NULL DEFAULT 'traditional',
    source_type VARCHAR(30) NOT NULL DEFAULT 'traditional',
    source_references TEXT[],                   -- Array of citations/URLs
    confidence_score INTEGER,                   -- 1-10: How confident are we?
    
    -- =====================================
    -- REQUISITOS Y CONDICIONES
    -- =====================================
    
    -- Distancia óptima entre cultivos
    optimal_distance_cm INTEGER,
    min_distance_cm INTEGER,
    max_distance_cm INTEGER,
    
    -- Ratio de plantas recomendado
    recommended_ratio VARCHAR(20),              -- e.g., "1:4" (1 basil per 4 tomato plants)
    
    -- Disposición espacial
    planting_arrangement VARCHAR(30),           -- border, intercropped, alternating_rows
    
    -- Etapas de crecimiento donde aplica
    effective_growth_stages VARCHAR(30)[],      -- When is this compatibility most important?
    
    -- Condiciones climáticas
    climate_zones_applicable VARCHAR(50)[],     -- Which climates does this apply to?
    season_dependency VARCHAR(20),              -- Does it only work in certain seasons?
    
    -- =====================================
    -- METADATA
    -- =====================================
    is_verified BOOLEAN DEFAULT false NOT NULL, -- Verified by agronomist/scientist
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    user_rating_avg NUMERIC(3, 2),              -- Community rating (1-5)
    user_rating_count INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    -- No auto-relaciones
    CONSTRAINT crop_compatibilities_no_self CHECK (
        crop_catalog_id <> companion_crop_catalog_id
    ),
    
    CONSTRAINT crop_compatibilities_type_valid CHECK (
        compatibility_type IN (
            'highly_beneficial',    -- Strong positive synergy
            'beneficial',           -- Moderate positive effect
            'neutral',              -- No significant interaction
            'cautionary',           -- Can work but requires care
            'incompatible',         -- Negative interaction
            'highly_incompatible'   -- Severe negative impact (allelopathy, disease vector)
        )
    ),
    
    -- Fuerza: -10 (muy perjudicial) a +10 (muy beneficioso)
    CONSTRAINT crop_compatibilities_strength_valid CHECK (
        compatibility_strength BETWEEN -10 AND 10
    ),
    
    -- Coherencia entre tipo y fuerza
    CONSTRAINT crop_compatibilities_type_strength_coherent CHECK (
        (compatibility_type IN ('highly_beneficial', 'beneficial') AND compatibility_strength > 0) OR
        (compatibility_type = 'neutral' AND compatibility_strength = 0) OR
        (compatibility_type IN ('cautionary', 'incompatible', 'highly_incompatible') AND compatibility_strength < 0)
    ),
    
    CONSTRAINT crop_compatibilities_severity_valid CHECK (
        severity_level IS NULL OR severity_level IN (
            'minimal',              -- Minor inconvenience
            'moderate',             -- Noticeable reduction in yield
            'severe',               -- Significant crop failure risk
            'critical'              -- One or both crops will likely fail
        )
    ),
    
    -- Severity solo para incompatibilidades
    CONSTRAINT crop_compatibilities_severity_for_incompatible CHECK (
        (compatibility_type NOT IN ('incompatible', 'highly_incompatible')) OR 
        (severity_level IS NOT NULL)
    ),
    
    CONSTRAINT crop_compatibilities_primary_effect_valid CHECK (
        primary_effect IN (
            'pest_repellent',           -- Repels pests from companion
            'pest_trap',                -- Attracts pests away from companion
            'beneficial_insect_attractor', -- Attracts predatory insects
            'disease_suppression',      -- Reduces disease in companion
            'nitrogen_fixation',        -- Provides nitrogen
            'nutrient_accumulation',    -- Deep roots bring up nutrients
            'nutrient_competition',     -- Competes for same nutrients
            'allelopathy_positive',     -- Releases growth-promoting compounds
            'allelopathy_negative',     -- Releases growth-inhibiting compounds
            'physical_support',         -- Provides structure (e.g., corn for beans)
            'shade_provision',          -- Provides beneficial shade
            'shade_competition',        -- Blocks needed sunlight
            'soil_improvement',         -- Improves soil structure
            'moisture_retention',       -- Helps retain soil moisture
            'water_competition',        -- Competes for water
            'space_optimization',       -- Uses different vertical/horizontal space
            'space_competition',        -- Competes for same space
            'pollinator_attraction',    -- Attracts pollinators
            'ground_cover',             -- Suppresses weeds, retains moisture
            'disease_vector',           -- Shares diseases
            'pest_habitat',             -- Provides habitat for shared pests
            'root_exudate_synergy',     -- Beneficial root interactions
            'microclimate_improvement', -- Creates beneficial microclimate
            'wind_protection',          -- Protects from wind damage
            'other'
        )
    ),
    
    CONSTRAINT crop_compatibilities_evidence_level_valid CHECK (
        evidence_level IN (
            'peer_reviewed',        -- Published in scientific journals
            'field_trial',          -- Documented field experiments
            'observational_study',  -- Systematic observation
            'traditional',          -- Traditional farming knowledge
            'anecdotal',            -- User reports, not systematic
            'theoretical',          -- Hypothetical based on plant properties
            'unknown'
        )
    ),
    
    CONSTRAINT crop_compatibilities_source_type_valid CHECK (
        source_type IN (
            'scientific_literature',
            'extension_service',    -- Agricultural extension publications
            'traditional_knowledge',
            'user_contributed',
            'system_generated',     -- Inferred from plant properties
            'expert_recommendation'
        )
    ),
    
    CONSTRAINT crop_compatibilities_confidence_valid CHECK (
        confidence_score IS NULL OR (confidence_score BETWEEN 1 AND 10)
    ),
    
    CONSTRAINT crop_compatibilities_distance_valid CHECK (
        (min_distance_cm IS NULL OR min_distance_cm > 0) AND
        (max_distance_cm IS NULL OR max_distance_cm > 0) AND
        (optimal_distance_cm IS NULL OR optimal_distance_cm > 0) AND
        (min_distance_cm IS NULL OR optimal_distance_cm IS NULL OR optimal_distance_cm >= min_distance_cm) AND
        (optimal_distance_cm IS NULL OR max_distance_cm IS NULL OR max_distance_cm >= optimal_distance_cm)
    ),
    
    CONSTRAINT crop_compatibilities_arrangement_valid CHECK (
        planting_arrangement IS NULL OR planting_arrangement IN (
            'intercropped',         -- Mixed throughout
            'alternating_rows',     -- Row of A, row of B
            'border',               -- One surrounds the other
            'understory',           -- One grows under the other
            'nurse_crop',           -- Temporary companion
            'relay',                -- Sequential planting
            'three_sisters'         -- Specific traditional arrangement
        )
    ),
    
    CONSTRAINT crop_compatibilities_season_valid CHECK (
        season_dependency IS NULL OR season_dependency IN (
            'any',
            'spring_summer',
            'fall_winter',
            'warm_season_only',
            'cool_season_only'
        )
    ),
    
    CONSTRAINT crop_compatibilities_rating_valid CHECK (
        user_rating_avg IS NULL OR (user_rating_avg BETWEEN 1.0 AND 5.0)
    ),
    
    CONSTRAINT crop_compatibilities_rating_count_valid CHECK (
        user_rating_count >= 0
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

CREATE INDEX idx_crop_compatibilities_crop_id ON crop_compatibilities(crop_catalog_id);
CREATE INDEX idx_crop_compatibilities_companion_id ON crop_compatibilities(companion_crop_catalog_id);
CREATE INDEX idx_crop_compatibilities_type ON crop_compatibilities(compatibility_type);
CREATE INDEX idx_crop_compatibilities_strength ON crop_compatibilities(compatibility_strength);
CREATE INDEX idx_crop_compatibilities_primary_effect ON crop_compatibilities(primary_effect);
CREATE INDEX idx_crop_compatibilities_evidence_level ON crop_compatibilities(evidence_level);
CREATE INDEX idx_crop_compatibilities_is_verified ON crop_compatibilities(is_verified);
CREATE INDEX idx_crop_compatibilities_is_active ON crop_compatibilities(is_active);

-- Índice compuesto para búsqueda de compatibilidades bidireccionales
CREATE INDEX idx_crop_compatibilities_bidirectional ON crop_compatibilities(
    LEAST(crop_catalog_id, companion_crop_catalog_id),
    GREATEST(crop_catalog_id, companion_crop_catalog_id)
);

-- Evitar duplicados exactos (misma dirección, mismo tipo)
CREATE UNIQUE INDEX idx_crop_compatibilities_unique 
ON crop_compatibilities(crop_catalog_id, companion_crop_catalog_id, compatibility_type)
WHERE is_active = true;

-- Índice para arrays
CREATE INDEX idx_crop_compatibilities_secondary_effects ON crop_compatibilities USING GIN(secondary_effects);
CREATE INDEX idx_crop_compatibilities_growth_stages ON crop_compatibilities USING GIN(effective_growth_stages);
CREATE INDEX idx_crop_compatibilities_climate_zones ON crop_compatibilities USING GIN(climate_zones_applicable);

-- =====================================
-- TRIGGERS
-- =====================================

CREATE TRIGGER update_crop_compatibilities_updated_at
    BEFORE UPDATE ON crop_compatibilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para sincronizar bidireccionalidad (opcional)
CREATE OR REPLACE FUNCTION create_reverse_compatibility()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la compatibilidad es simétrica (e.g., ambos se benefician igual),
    -- crear automáticamente la relación inversa
    -- Esto es OPCIONAL y depende de la lógica de negocio
    
    -- Ejemplo: Si planto tomate y albahaca, y la albahaca repele plagas del tomate,
    -- NO necesariamente el tomate hace lo mismo por la albahaca
    
    -- Solo para efectos verdaderamente simétricos:
    IF NEW.primary_effect IN ('nutrient_competition', 'water_competition', 'space_competition', 
                               'disease_vector', 'pest_habitat') THEN
        -- Estos efectos son inherentemente bidireccionales
        INSERT INTO crop_compatibilities (
            crop_catalog_id,
            companion_crop_catalog_id,
            compatibility_type,
            compatibility_strength,
            severity_level,
            primary_effect,
            secondary_effects,
            mechanism,
            description,
            evidence_level,
            source_type,
            optimal_distance_cm,
            planting_arrangement,
            is_active
        ) VALUES (
            NEW.companion_crop_catalog_id,
            NEW.crop_catalog_id,
            NEW.compatibility_type,
            NEW.compatibility_strength,
            NEW.severity_level,
            NEW.primary_effect,
            NEW.secondary_effects,
            NEW.mechanism,
            'Auto-generated reverse compatibility: ' || NEW.description,
            NEW.evidence_level,
            'system_generated',
            NEW.optimal_distance_cm,
            NEW.planting_arrangement,
            NEW.is_active
        )
        ON CONFLICT (crop_catalog_id, companion_crop_catalog_id, compatibility_type) 
        WHERE is_active = true
        DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Este trigger es OPCIONAL - comentado por defecto
-- CREATE TRIGGER auto_create_reverse_compatibility
--     AFTER INSERT ON crop_compatibilities
--     FOR EACH ROW
--     EXECUTE FUNCTION create_reverse_compatibility();

-- =====================================
-- COMENTARIOS
-- =====================================

COMMENT ON TABLE crop_compatibilities IS 'Companion planting knowledge base - directional relationships between crops';
COMMENT ON COLUMN crop_compatibilities.compatibility_strength IS 'Strength from -10 (very harmful) to +10 (very beneficial)';
COMMENT ON COLUMN crop_compatibilities.mechanism IS 'How the effect works (e.g., "Basil releases volatile oils that repel aphids")';
COMMENT ON COLUMN crop_compatibilities.recommended_ratio IS 'Plant ratio for optimal effect (e.g., "1:4" means 1 companion per 4 main crops)';
COMMENT ON COLUMN crop_compatibilities.effective_growth_stages IS 'Growth stages where compatibility is most important';
COMMENT ON COLUMN crop_compatibilities.evidence_level IS 'Quality of evidence supporting this compatibility';
COMMENT ON COLUMN crop_compatibilities.confidence_score IS 'Our confidence in this data (1=low, 10=high)';

-- ========================================
-- TABLA: planting_associations (Asociaciones Reales)
-- ========================================
CREATE TABLE IF NOT EXISTS planting_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- PLANTACIONES ASOCIADAS
    -- =====================================
    primary_planting_id UUID NOT NULL REFERENCES plantings(id) ON DELETE CASCADE,
    companion_planting_id UUID NOT NULL REFERENCES plantings(id) ON DELETE CASCADE,
    
    -- =====================================
    -- RELACIÓN CON CONOCIMIENTO BASE
    -- =====================================
    compatibility_id UUID REFERENCES crop_compatibilities(id) ON DELETE SET NULL,
    
    -- =====================================
    -- IMPLEMENTACIÓN FÍSICA
    -- =====================================
    actual_distance_cm INTEGER,
    actual_arrangement VARCHAR(30),
    actual_ratio VARCHAR(20),
    
    -- =====================================
    -- FECHAS
    -- =====================================
    association_started DATE NOT NULL,
    association_ended DATE,
    
    -- =====================================
    -- RAZÓN Y OBJETIVO
    -- =====================================
    purpose VARCHAR(100),                       -- Why did user create this association?
    expected_benefit VARCHAR(50),
    
    -- =====================================
    -- TRACKING
    -- =====================================
    user_notes TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT planting_associations_no_self CHECK (
        primary_planting_id <> companion_planting_id
    ),
    
    CONSTRAINT planting_associations_distance_positive CHECK (
        actual_distance_cm IS NULL OR actual_distance_cm > 0
    ),
    
    CONSTRAINT planting_associations_arrangement_valid CHECK (
        actual_arrangement IS NULL OR actual_arrangement IN (
            'intercropped', 'alternating_rows', 'border', 'understory',
            'nurse_crop', 'relay', 'three_sisters', 'custom'
        )
    ),
    
    CONSTRAINT planting_associations_expected_benefit_valid CHECK (
        expected_benefit IS NULL OR expected_benefit IN (
            'pest_control', 'disease_prevention', 'nutrient_sharing',
            'space_optimization', 'pollinator_attraction', 'soil_improvement',
            'microclimate', 'aesthetic', 'experimentation', 'other'
        )
    ),
    
    CONSTRAINT planting_associations_dates_valid CHECK (
        association_ended IS NULL OR association_ended >= association_started
    )
);

-- Índices
CREATE INDEX idx_planting_associations_primary ON planting_associations(primary_planting_id);
CREATE INDEX idx_planting_associations_companion ON planting_associations(companion_planting_id);
CREATE INDEX idx_planting_associations_compatibility ON planting_associations(compatibility_id);
CREATE INDEX idx_planting_associations_active ON planting_associations(is_active);

-- Evitar duplicados
CREATE UNIQUE INDEX idx_planting_associations_unique 
ON planting_associations(
    LEAST(primary_planting_id, companion_planting_id),
    GREATEST(primary_planting_id, companion_planting_id)
)
WHERE is_active = true;

CREATE TRIGGER update_planting_associations_updated_at
    BEFORE UPDATE ON planting_associations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE planting_associations IS 'Actual companion planting relationships between specific plantings in the garden';
-- ========================================
-- TABLA: association_observations (Observaciones)
-- ========================================
CREATE TABLE IF NOT EXISTS association_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    association_id UUID NOT NULL REFERENCES planting_associations(id) ON DELETE CASCADE,
    observed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- =====================================
    -- OBSERVACIÓN
    -- =====================================
    observation_date DATE NOT NULL,
    observation_type VARCHAR(30) NOT NULL,
    
    -- =====================================
    -- RESULTADO
    -- =====================================
    outcome VARCHAR(20) NOT NULL,
    effectiveness_rating INTEGER,              -- 1-5: How well did it work?
    
    -- =====================================
    -- DETALLES
    -- =====================================
    description TEXT NOT NULL,
    photos JSONB,
    measured_data JSONB,                       -- e.g., {"pest_count": 5, "yield_kg": 3.2}
    
    -- =====================================
    -- AUDITORÍA
    -- =====================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT association_observations_type_valid CHECK (
        observation_type IN (
            'pest_observation',
            'disease_observation',
            'growth_observation',
            'yield_observation',
            'general_health',
            'failure',
            'success',
            'other'
        )
    ),
    
    CONSTRAINT association_observations_outcome_valid CHECK (
        outcome IN (
            'highly_positive',
            'positive',
            'neutral',
            'negative',
            'highly_negative',
            'inconclusive'
        )
    ),
    
    CONSTRAINT association_observations_rating_valid CHECK (
        effectiveness_rating IS NULL OR (effectiveness_rating BETWEEN 1 AND 5)
    )
);

CREATE INDEX idx_association_observations_association ON association_observations(association_id);
CREATE INDEX idx_association_observations_date ON association_observations(observation_date);
CREATE INDEX idx_association_observations_outcome ON association_observations(outcome);

CREATE TRIGGER update_association_observations_updated_at
    BEFORE UPDATE ON association_observations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION get_recommended_companions(
    p_crop_catalog_id UUID,
    p_climate_zone VARCHAR DEFAULT NULL,
    p_min_strength INTEGER DEFAULT 3
)
RETURNS TABLE (
    companion_crop_id UUID,
    companion_name VARCHAR,
    compatibility_type VARCHAR,
    strength INTEGER,
    primary_effect VARCHAR,
    description TEXT,
    optimal_distance_cm INTEGER,
    recommended_ratio VARCHAR,
    evidence_level VARCHAR,
    confidence_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc_companion.id,
        cc_companion.common_name,
        comp.compatibility_type,
        comp.compatibility_strength,
        comp.primary_effect,
        comp.description,
        comp.optimal_distance_cm,
        comp.recommended_ratio,
        comp.evidence_level,
        comp.confidence_score
    FROM crop_compatibilities comp
    JOIN crop_catalog cc_companion ON comp.companion_crop_catalog_id = cc_companion.id
    WHERE comp.crop_catalog_id = p_crop_catalog_id
      AND comp.compatibility_type IN ('highly_beneficial', 'beneficial')
      AND comp.compatibility_strength >= p_min_strength
      AND comp.is_active = true
      AND comp.is_verified = true
      AND (p_climate_zone IS NULL OR p_climate_zone = ANY(comp.climate_zones_applicable) OR comp.climate_zones_applicable IS NULL)
    ORDER BY comp.compatibility_strength DESC, comp.confidence_score DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION validate_proposed_association(
    p_crop1_id UUID,
    p_crop2_id UUID
)
RETURNS TABLE (
    is_compatible BOOLEAN,
    compatibility_type VARCHAR,
    strength INTEGER,
    warnings TEXT[]
) AS $$
DECLARE
    v_compat RECORD;
    v_warnings TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Buscar compatibilidad en ambas direcciones
    SELECT * INTO v_compat
    FROM crop_compatibilities
    WHERE ((crop_catalog_id = p_crop1_id AND companion_crop_catalog_id = p_crop2_id)
           OR (crop_catalog_id = p_crop2_id AND companion_crop_catalog_id = p_crop1_id))
      AND is_active = true
    ORDER BY ABS(compatibility_strength) DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'neutral'::VARCHAR, 0, ARRAY['No documented compatibility data']::TEXT[];
        RETURN;
    END IF;
    
    -- Agregar warnings según el caso
    IF v_compat.compatibility_type IN ('incompatible', 'highly_incompatible') THEN
        v_warnings := array_append(v_warnings, 'WARNING: These crops are incompatible');
        v_warnings := array_append(v_warnings, 'Reason: ' || v_compat.primary_effect);
        
        IF v_compat.severity_level IN ('severe', 'critical') THEN
            v_warnings := array_append(v_warnings, 'CRITICAL: High risk of crop failure');
        END IF;
    END IF;
    
    IF v_compat.evidence_level = 'anecdotal' THEN
        v_warnings := array_append(v_warnings, 'Note: Evidence is anecdotal - results may vary');
    END IF;
    
    IF v_compat.confidence_score IS NOT NULL AND v_compat.confidence_score < 5 THEN
        v_warnings := array_append(v_warnings, 'Note: Low confidence in this data');
    END IF;
    
    RETURN QUERY SELECT 
        v_compat.compatibility_strength >= 0,
        v_compat.compatibility_type,
        v_compat.compatibility_strength,
        v_warnings;
END;
$$ LANGUAGE plpgsql STABLE;

-- ========================================
-- TABLA: crop_rotation_rules (Conocimiento Base)
-- ========================================
CREATE TABLE IF NOT EXISTS crop_rotation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- RELACIÓN ENTRE CULTIVOS
    -- =====================================
    previous_crop_catalog_id UUID NOT NULL REFERENCES crop_catalog(id) ON DELETE CASCADE,
    next_crop_catalog_id UUID NOT NULL REFERENCES crop_catalog(id) ON DELETE CASCADE,
    
    -- =====================================
    -- TIPO Y FUERZA DE LA ROTACIÓN
    -- =====================================
    rotation_type VARCHAR(30) NOT NULL,
    rotation_effect_strength INTEGER NOT NULL,
    severity_level VARCHAR(20),                 -- For discouraged/prohibited
    
    -- =====================================
    -- BENEFICIOS/PROBLEMAS ESPECÍFICOS
    -- =====================================
    primary_reason VARCHAR(50) NOT NULL,
    secondary_reasons VARCHAR(50)[],
    mechanism TEXT,
    
    -- =====================================
    -- IMPACTOS ESPECÍFICOS
    -- =====================================
    
    -- Suelo
    soil_effect VARCHAR(30),
    soil_structure_impact VARCHAR(30),          -- improved, maintained, degraded
    organic_matter_impact VARCHAR(30),          -- increased, stable, decreased
    
    -- Nutrientes
    nitrogen_impact VARCHAR(30),                -- depletes, neutral, enriches
    phosphorus_impact VARCHAR(30),
    potassium_impact VARCHAR(30),
    micronutrient_impact VARCHAR(30),
    
    -- Plagas y enfermedades
    disease_risk VARCHAR(30),
    disease_types VARCHAR(50)[],                -- Specific diseases that may increase
    pest_risk VARCHAR(30),
    pest_types VARCHAR(50)[],                   -- Specific pests that may increase
    
    -- =====================================
    -- BENEFICIOS CUANTIFICABLES
    -- =====================================
    expected_yield_change_percent INTEGER,      -- Expected change in yield (+/- %)
    soil_health_improvement_score INTEGER,      -- 1-10 scale
    pest_pressure_reduction_percent INTEGER,    -- Expected reduction in pest issues
    
    -- =====================================
    -- RECOMENDACIONES TEMPORALES
    -- =====================================
    minimum_gap_days INTEGER,                   -- Días mínimos (consistente con plantings)
    recommended_gap_days INTEGER,               -- Días óptimos
    maximum_beneficial_gap_days INTEGER,        -- Después de esto, beneficio se pierde
    
    season_dependency VARCHAR(30),              -- Does timing matter?
    
    -- =====================================
    -- CONTEXTO DE APLICACIÓN
    -- =====================================
    climate_zones_applicable VARCHAR(50)[],
    soil_types_applicable VARCHAR(50)[],
    soil_ph_range_min NUMERIC(3,1),
    soil_ph_range_max NUMERIC(3,1),
    
    -- =====================================
    -- EVIDENCIA Y VERIFICACIÓN
    -- =====================================
    evidence_level VARCHAR(20) NOT NULL DEFAULT 'traditional',
    source_references TEXT[],
    confidence_score INTEGER,
    
    is_verified BOOLEAN DEFAULT false NOT NULL,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Rating de usuarios
    user_rating_avg NUMERIC(3,2),
    user_rating_count INTEGER DEFAULT 0,
    
    -- =====================================
    -- NOTAS ADICIONALES
    -- =====================================
    description TEXT,
    practical_tips TEXT,
    common_mistakes TEXT,
    
    -- =====================================
    -- METADATA
    -- =====================================
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT crop_rotation_no_self CHECK (
        previous_crop_catalog_id <> next_crop_catalog_id
    ),
    
    CONSTRAINT crop_rotation_type_valid CHECK (
        rotation_type IN (
            'highly_recommended',
            'recommended',
            'neutral',
            'cautionary',
            'discouraged',
            'prohibited'
        )
    ),
    
    CONSTRAINT crop_rotation_strength_valid CHECK (
        rotation_effect_strength BETWEEN -10 AND 10
    ),
    
    CONSTRAINT crop_rotation_type_strength_coherent CHECK (
        (rotation_type IN ('highly_recommended', 'recommended') AND rotation_effect_strength > 0) OR
        (rotation_type = 'neutral' AND rotation_effect_strength = 0) OR
        (rotation_type IN ('cautionary', 'discouraged', 'prohibited') AND rotation_effect_strength < 0)
    ),
    
    CONSTRAINT crop_rotation_severity_valid CHECK (
        severity_level IS NULL OR severity_level IN (
            'minimal',
            'moderate',
            'severe',
            'critical'
        )
    ),
    
    CONSTRAINT crop_rotation_severity_for_negative CHECK (
        (rotation_type NOT IN ('discouraged', 'prohibited')) OR 
        (severity_level IS NOT NULL)
    ),
    
    CONSTRAINT crop_rotation_primary_reason_valid CHECK (
        primary_reason IN (
            'nutrient_replenishment',
            'nutrient_depletion_prevention',
            'disease_prevention',
            'disease_cycle_break',
            'pest_cycle_break',
            'pest_confusion',
            'soil_structure_improvement',
            'soil_organic_matter',
            'nitrogen_fixation',
            'allelopathy_positive',
            'allelopathy_negative',
            'weed_suppression',
            'deep_root_benefit',
            'mycorrhizal_continuity',
            'yield_optimization',
            'soil_recovery',
            'cover_crop_integration',
            'complementary_nutrient_use',
            'other'
        )
    ),
    
    CONSTRAINT crop_rotation_soil_effect_valid CHECK (
        soil_effect IS NULL OR soil_effect IN (
            'highly_beneficial',
            'beneficial',
            'neutral',
            'detrimental',
            'highly_detrimental'
        )
    ),
    
    CONSTRAINT crop_rotation_soil_structure_valid CHECK (
        soil_structure_impact IS NULL OR soil_structure_impact IN (
            'improved',
            'maintained',
            'degraded'
        )
    ),
    
    CONSTRAINT crop_rotation_organic_matter_valid CHECK (
        organic_matter_impact IS NULL OR organic_matter_impact IN (
            'increased',
            'stable',
            'decreased'
        )
    ),
    
    CONSTRAINT crop_rotation_nutrient_impact_valid CHECK (
        (nitrogen_impact IS NULL OR nitrogen_impact IN ('depletes', 'neutral', 'enriches')) AND
        (phosphorus_impact IS NULL OR phosphorus_impact IN ('depletes', 'neutral', 'enriches')) AND
        (potassium_impact IS NULL OR potassium_impact IN ('depletes', 'neutral', 'enriches')) AND
        (micronutrient_impact IS NULL OR micronutrient_impact IN ('depletes', 'neutral', 'enriches'))
    ),
    
    CONSTRAINT crop_rotation_risk_valid CHECK (
        (disease_risk IS NULL OR disease_risk IN ('increased', 'neutral', 'reduced', 'eliminated')) AND
        (pest_risk IS NULL OR pest_risk IN ('increased', 'neutral', 'reduced', 'eliminated'))
    ),
    
    CONSTRAINT crop_rotation_yield_change_valid CHECK (
        expected_yield_change_percent IS NULL OR 
        (expected_yield_change_percent BETWEEN -100 AND 200)
    ),
    
    CONSTRAINT crop_rotation_soil_health_score_valid CHECK (
        soil_health_improvement_score IS NULL OR 
        (soil_health_improvement_score BETWEEN 1 AND 10)
    ),
    
    CONSTRAINT crop_rotation_pest_reduction_valid CHECK (
        pest_pressure_reduction_percent IS NULL OR 
        (pest_pressure_reduction_percent BETWEEN -100 AND 100)
    ),
    
    CONSTRAINT crop_rotation_gaps_valid CHECK (
        (minimum_gap_days IS NULL OR minimum_gap_days >= 0) AND
        (recommended_gap_days IS NULL OR recommended_gap_days >= 0) AND
        (maximum_beneficial_gap_days IS NULL OR maximum_beneficial_gap_days >= 0) AND
        (minimum_gap_days IS NULL OR recommended_gap_days IS NULL OR recommended_gap_days >= minimum_gap_days) AND
        (recommended_gap_days IS NULL OR maximum_beneficial_gap_days IS NULL OR maximum_beneficial_gap_days >= recommended_gap_days)
    ),
    
    CONSTRAINT crop_rotation_season_valid CHECK (
        season_dependency IS NULL OR season_dependency IN (
            'any',
            'spring_only',
            'summer_only',
            'fall_only',
            'winter_only',
            'warm_season',
            'cool_season'
        )
    ),
    
    CONSTRAINT crop_rotation_ph_range_valid CHECK (
        (soil_ph_range_min IS NULL OR (soil_ph_range_min >= 0 AND soil_ph_range_min <= 14)) AND
        (soil_ph_range_max IS NULL OR (soil_ph_range_max >= 0 AND soil_ph_range_max <= 14)) AND
        (soil_ph_range_min IS NULL OR soil_ph_range_max IS NULL OR soil_ph_range_max >= soil_ph_range_min)
    ),
    
    CONSTRAINT crop_rotation_evidence_valid CHECK (
        evidence_level IN (
            'peer_reviewed',
            'field_trial',
            'observational_study',
            'extension_service',
            'traditional',
            'anecdotal',
            'theoretical',
            'unknown'
        )
    ),
    
    CONSTRAINT crop_rotation_confidence_valid CHECK (
        confidence_score IS NULL OR (confidence_score BETWEEN 1 AND 10)
    ),
    
    CONSTRAINT crop_rotation_rating_valid CHECK (
        user_rating_avg IS NULL OR (user_rating_avg BETWEEN 1.0 AND 5.0)
    ),
    
    CONSTRAINT crop_rotation_rating_count_valid CHECK (
        user_rating_count >= 0
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

CREATE INDEX idx_crop_rotation_prev_crop ON crop_rotation_rules(previous_crop_catalog_id);
CREATE INDEX idx_crop_rotation_next_crop ON crop_rotation_rules(next_crop_catalog_id);
CREATE INDEX idx_crop_rotation_type ON crop_rotation_rules(rotation_type);
CREATE INDEX idx_crop_rotation_strength ON crop_rotation_rules(rotation_effect_strength);
CREATE INDEX idx_crop_rotation_primary_reason ON crop_rotation_rules(primary_reason);
CREATE INDEX idx_crop_rotation_evidence_level ON crop_rotation_rules(evidence_level);
CREATE INDEX idx_crop_rotation_is_verified ON crop_rotation_rules(is_verified);
CREATE INDEX idx_crop_rotation_active ON crop_rotation_rules(is_active);

-- Índice compuesto para búsqueda bidireccional
CREATE INDEX idx_crop_rotation_bidirectional ON crop_rotation_rules(
    LEAST(previous_crop_catalog_id, next_crop_catalog_id),
    GREATEST(previous_crop_catalog_id, next_crop_catalog_id)
);

-- Evitar duplicados
CREATE UNIQUE INDEX idx_crop_rotation_unique
ON crop_rotation_rules(previous_crop_catalog_id, next_crop_catalog_id)
WHERE is_active = true;

-- Índices para arrays
CREATE INDEX idx_crop_rotation_secondary_reasons ON crop_rotation_rules USING GIN(secondary_reasons);
CREATE INDEX idx_crop_rotation_disease_types ON crop_rotation_rules USING GIN(disease_types);
CREATE INDEX idx_crop_rotation_pest_types ON crop_rotation_rules USING GIN(pest_types);
CREATE INDEX idx_crop_rotation_climate_zones ON crop_rotation_rules USING GIN(climate_zones_applicable);
CREATE INDEX idx_crop_rotation_soil_types ON crop_rotation_rules USING GIN(soil_types_applicable);

-- =====================================
-- TRIGGER
-- =====================================

CREATE TRIGGER update_crop_rotation_updated_at
    BEFORE UPDATE ON crop_rotation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- COMENTARIOS
-- =====================================

COMMENT ON TABLE crop_rotation_rules IS 'Agronomic knowledge base for crop rotation sequences';
COMMENT ON COLUMN crop_rotation_rules.rotation_effect_strength IS 'Effect strength from -10 (very harmful) to +10 (very beneficial)';
COMMENT ON COLUMN crop_rotation_rules.expected_yield_change_percent IS 'Expected yield change when following this rotation (e.g., +15 means 15% increase)';
COMMENT ON COLUMN crop_rotation_rules.minimum_gap_days IS 'Minimum days required between harvesting previous crop and planting next';
COMMENT ON COLUMN crop_rotation_rules.maximum_beneficial_gap_days IS 'After this period, rotation benefits are lost (soil reverts to baseline)';


-- =====================================
-- VISTA: plot_rotation_history
-- =====================================
CREATE OR REPLACE VIEW plot_rotation_history AS
SELECT 
    p.id AS planting_id,
    p.plot_id,
    p.crop_catalog_id,
    p.actual_planting_date AS planted_at,
    p.last_harvest_date AS harvested_at,
    p.removal_date,
    CASE 
        WHEN p.status = 'harvested' THEN 'completed'
        WHEN p.status = 'failed' THEN 'failed'
        WHEN p.status = 'cancelled' THEN 'abandoned'
        ELSE 'ongoing'
    END AS crop_cycle_status,
    p.total_harvest_kg AS yield_kg,
    p.health_status,
    CASE 
        WHEN p.health_status IN ('pest_affected') THEN true 
        ELSE false 
    END AS had_pest_issues,
    CASE 
        WHEN p.health_status IN ('disease_affected') THEN true 
        ELSE false 
    END AS had_disease_issues,
    p.notes,
    p.created_at
FROM plantings p
WHERE p.actual_planting_date IS NOT NULL
ORDER BY p.plot_id, p.actual_planting_date DESC;

CREATE INDEX idx_plot_rotation_last_crop
ON plantings (plot_id, actual_planting_date DESC)
WHERE actual_planting_date IS NOT NULL;

COMMENT ON VIEW plot_rotation_history IS 'Historical view of crops planted in each plot, derived from plantings table';

-- ========================================
-- TABLA: rotation_plans (Planificación Futura)
-- ========================================
CREATE TABLE IF NOT EXISTS rotation_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- CONTEXTO
    -- =====================================
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- =====================================
    -- CULTIVO PLANIFICADO
    -- =====================================
    planned_crop_catalog_id UUID NOT NULL REFERENCES crop_catalog(id),
    variety VARCHAR(100),
    
    -- =====================================
    -- PLANIFICACIÓN TEMPORAL
    -- =====================================
    planned_planting_date DATE NOT NULL,
    planned_harvest_date DATE,
    estimated_duration_days INTEGER,
    
    -- =====================================
    -- SECUENCIA DE ROTACIÓN
    -- =====================================
    sequence_order INTEGER,                     -- Order in multi-year rotation plan
    rotation_cycle_year INTEGER,                -- Year in rotation cycle (e.g., year 2 of 4-year rotation)
    is_part_of_cycle BOOLEAN DEFAULT false,
    
    -- =====================================
    -- VALIDACIÓN AUTOMÁTICA
    -- =====================================
    based_on_rotation_rule UUID REFERENCES crop_rotation_rules(id) ON DELETE SET NULL,
    rotation_score INTEGER,                     -- Calculated score based on history
    validation_status VARCHAR(20) DEFAULT 'pending',
    validation_warnings TEXT[],
    validation_details JSONB,                   -- Detailed validation results
    
    -- =====================================
    -- JUSTIFICACIÓN
    -- =====================================
    primary_goal VARCHAR(50),
    expected_benefits TEXT[],
    user_notes TEXT,
    
    -- =====================================
    -- ESTADO DEL PLAN
    -- =====================================
    plan_status VARCHAR(20) DEFAULT 'draft',
    executed_planting_id UUID REFERENCES plantings(id) ON DELETE SET NULL,
    
    -- =====================================
    -- AUDITORÍA
    -- =====================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    executed_at TIMESTAMP WITH TIME ZONE,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT rotation_plans_dates_valid CHECK (
        planned_harvest_date IS NULL OR planned_harvest_date >= planned_planting_date
    ),
    
    CONSTRAINT rotation_plans_duration_positive CHECK (
        estimated_duration_days IS NULL OR estimated_duration_days > 0
    ),
    
    CONSTRAINT rotation_plans_sequence_positive CHECK (
        sequence_order IS NULL OR sequence_order > 0
    ),
    
    CONSTRAINT rotation_plans_cycle_year_positive CHECK (
        rotation_cycle_year IS NULL OR rotation_cycle_year > 0
    ),
    
    CONSTRAINT rotation_plans_validation_status_valid CHECK (
        validation_status IN (
            'pending',              -- Not yet validated
            'valid',                -- Passed validation
            'valid_with_warnings',  -- Valid but has warnings
            'invalid',              -- Failed validation
            'override'              -- User overrode validation
        )
    ),
    
    CONSTRAINT rotation_plans_goal_valid CHECK (
        primary_goal IS NULL OR primary_goal IN (
            'soil_improvement',
            'pest_management',
            'disease_prevention',
            'nutrient_balance',
            'yield_optimization',
            'weed_control',
            'biodiversity',
            'experimentation',
            'other'
        )
    ),
    
    CONSTRAINT rotation_plans_status_valid CHECK (
        plan_status IN (
            'draft',                -- Being planned
            'approved',             -- Ready to execute
            'scheduled',            -- Waiting for planting date
            'executed',             -- Has been planted
            'cancelled',            -- Cancelled before execution
            'superseded'            -- Replaced by newer plan
        )
    ),
    
    CONSTRAINT rotation_plans_score_valid CHECK (
        rotation_score IS NULL OR (rotation_score BETWEEN -100 AND 100)
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

CREATE INDEX idx_rotation_plans_garden ON rotation_plans(garden_id);
CREATE INDEX idx_rotation_plans_plot ON rotation_plans(plot_id);
CREATE INDEX idx_rotation_plans_crop ON rotation_plans(planned_crop_catalog_id);
CREATE INDEX idx_rotation_plans_created_by ON rotation_plans(created_by);
CREATE INDEX idx_rotation_plans_planting_date ON rotation_plans(planned_planting_date);
CREATE INDEX idx_rotation_plans_validation_status ON rotation_plans(validation_status);
CREATE INDEX idx_rotation_plans_plan_status ON rotation_plans(plan_status);
CREATE INDEX idx_rotation_plans_executed_planting ON rotation_plans(executed_planting_id) WHERE executed_planting_id IS NOT NULL;

-- Índice compuesto para calendario
CREATE INDEX idx_rotation_plans_calendar ON rotation_plans(garden_id, planned_planting_date, plan_status);

-- Índice para ciclos de rotación
CREATE INDEX idx_rotation_plans_cycle ON rotation_plans(plot_id, is_part_of_cycle, rotation_cycle_year, sequence_order)
WHERE is_part_of_cycle = true;

-- Índices para arrays
CREATE INDEX idx_rotation_plans_warnings ON rotation_plans USING GIN(validation_warnings);
CREATE INDEX idx_rotation_plans_benefits ON rotation_plans USING GIN(expected_benefits);

-- Índice para JSONB
CREATE INDEX idx_rotation_plans_validation_details ON rotation_plans USING GIN(validation_details);

-- =====================================
-- TRIGGER
-- =====================================

CREATE TRIGGER update_rotation_plans_updated_at
    BEFORE UPDATE ON rotation_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para auto-validar al crear/modificar
CREATE OR REPLACE FUNCTION auto_validate_rotation_plan()
RETURNS TRIGGER AS $$
DECLARE
    v_validation RECORD;
BEGIN
    -- Solo validar si es nuevo o cambió el cultivo/plot/fecha
    IF TG_OP = 'INSERT' OR 
       OLD.planned_crop_catalog_id IS DISTINCT FROM NEW.planned_crop_catalog_id OR
       OLD.plot_id IS DISTINCT FROM NEW.plot_id OR
       OLD.planned_planting_date IS DISTINCT FROM NEW.planned_planting_date THEN
        
        -- Llamar a función de validación
        SELECT * INTO v_validation
        FROM validate_crop_rotation_advanced(
            NEW.plot_id,
            NEW.planned_crop_catalog_id,
            NEW.planned_planting_date
        );
        
        NEW.rotation_score := v_validation.score;
        NEW.validation_status := v_validation.status;
        NEW.validation_warnings := v_validation.warnings;
        NEW.validation_details := v_validation.details;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_validate_rotation_plan
    BEFORE INSERT OR UPDATE ON rotation_plans
    FOR EACH ROW
    EXECUTE FUNCTION auto_validate_rotation_plan();

COMMENT ON TABLE rotation_plans IS 'Future crop rotation plans for plots';
COMMENT ON COLUMN rotation_plans.rotation_score IS
'Aggregated score (-100 to 100) considering crop history, rotation rules, soil impact and timing';


-- =====================================
-- TABLA: rotation_observations
-- =====================================
CREATE TABLE IF NOT EXISTS rotation_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- CONTEXTO
    -- =====================================
    rotation_plan_id UUID REFERENCES rotation_plans(id) ON DELETE SET NULL,
    previous_planting_id UUID REFERENCES plantings(id) ON DELETE SET NULL,
    current_planting_id UUID NOT NULL REFERENCES plantings(id) ON DELETE CASCADE,
    rotation_rule_id UUID REFERENCES crop_rotation_rules(id) ON DELETE SET NULL,
    
    observed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    observation_date DATE NOT NULL,
    
    -- =====================================
    -- RESULTADOS OBSERVADOS
    -- =====================================
    observed_outcome VARCHAR(20) NOT NULL,
    effectiveness_rating INTEGER,               -- 1-5
    
    -- Impactos específicos
    soil_condition VARCHAR(30),
    pest_pressure VARCHAR(30),
    disease_incidence VARCHAR(30),
    weed_pressure VARCHAR(30),
    yield_compared_to_expected VARCHAR(30),
    
    -- =====================================
    -- DETALLES
    -- =====================================
    description TEXT NOT NULL,
    unexpected_issues TEXT,
    positive_surprises TEXT,
    lessons_learned TEXT,
    
    photos JSONB,
    measured_data JSONB,                        -- e.g., {"soil_ph": 6.5, "yield_kg": 12.5}
    
    -- =====================================
    -- RECOMENDACIONES
    -- =====================================
    would_repeat BOOLEAN,
    recommended_modifications TEXT,
    
    -- =====================================
    -- AUDITORÍA
    -- =====================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT rotation_observations_outcome_valid CHECK (
        observed_outcome IN (
            'excellent',
            'good',
            'as_expected',
            'below_expectations',
            'poor',
            'failed'
        )
    ),
    
    CONSTRAINT rotation_observations_rating_valid CHECK (
        effectiveness_rating IS NULL OR (effectiveness_rating BETWEEN 1 AND 5)
    ),
    
    CONSTRAINT rotation_observations_condition_valid CHECK (
        (soil_condition IS NULL OR soil_condition IN ('improved', 'maintained', 'degraded', 'severely_degraded')) AND
        (pest_pressure IS NULL OR pest_pressure IN ('none', 'low', 'moderate', 'high', 'severe')) AND
        (disease_incidence IS NULL OR disease_incidence IN ('none', 'low', 'moderate', 'high', 'severe')) AND
        (weed_pressure IS NULL OR weed_pressure IN ('none', 'low', 'moderate', 'high', 'severe'))
    ),
    
    CONSTRAINT rotation_observations_yield_comparison_valid CHECK (
        yield_compared_to_expected IS NULL OR yield_compared_to_expected IN (
            'much_better',
            'better',
            'as_expected',
            'worse',
            'much_worse'
        )
    )
);

-- Índices
CREATE INDEX idx_rotation_observations_rotation_plan ON rotation_observations(rotation_plan_id);
CREATE INDEX idx_rotation_observations_prev_planting ON rotation_observations(previous_planting_id);
CREATE INDEX idx_rotation_observations_curr_planting ON rotation_observations(current_planting_id);
CREATE INDEX idx_rotation_observations_rule ON rotation_observations(rotation_rule_id);
CREATE INDEX idx_rotation_observations_outcome ON rotation_observations(observed_outcome);
CREATE INDEX idx_rotation_observations_date ON rotation_observations(observation_date);

CREATE TRIGGER update_rotation_observations_updated_at
    BEFORE UPDATE ON rotation_observations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE rotation_observations IS 'Real-world observations of crop rotation outcomes';

-- ========================================
-- TABLA: lunar_calendar (Datos Astronómicos)
-- ========================================
CREATE TABLE IF NOT EXISTS lunar_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- FECHA Y UBICACIÓN
    -- =====================================
    calendar_date DATE NOT NULL,
    hemisphere VARCHAR(10) DEFAULT 'northern',  -- northern, southern
    
    -- =====================================
    -- FASE LUNAR
    -- =====================================
    moon_phase VARCHAR(30) NOT NULL,
    moon_phase_precise NUMERIC(6, 3),           -- 0.000 = new moon, 0.500 = full moon
    illumination_percent NUMERIC(5, 2) NOT NULL,
    moon_age_days NUMERIC(5, 2) NOT NULL,       -- Days since last new moon
    
    -- =====================================
    -- EVENTOS LUNARES PRINCIPALES
    -- =====================================
    is_new_moon BOOLEAN DEFAULT false NOT NULL,
    is_full_moon BOOLEAN DEFAULT false NOT NULL,
    is_first_quarter BOOLEAN DEFAULT false NOT NULL,
    is_last_quarter BOOLEAN DEFAULT false NOT NULL,
    
    -- Eventos especiales
    is_supermoon BOOLEAN DEFAULT false,         -- Perigee + full moon
    is_blue_moon BOOLEAN DEFAULT false,         -- Second full moon in month
    is_eclipse BOOLEAN DEFAULT false,
    eclipse_type VARCHAR(20),                   -- lunar, solar, partial, total
    
    -- =====================================
    -- DISTANCIA LUNAR (Perigeo/Apogeo)
    -- =====================================
    lunar_distance_km INTEGER,
    is_perigee BOOLEAN DEFAULT false NOT NULL,  -- Closest to Earth
    is_apogee BOOLEAN DEFAULT false NOT NULL,   -- Farthest from Earth
    perigee_effect_strength NUMERIC(3, 2),      -- 0.00-1.00 (how close to actual perigee)
    
    -- =====================================
    -- SIGNO ZODIACAL (Agricultura Tradicional)
    -- =====================================
    zodiac_sign VARCHAR(20),
    zodiac_element VARCHAR(10),
    
    -- Calendario biodinámico (Steiner)
    biodynamic_day_type VARCHAR(15),            -- root, leaf, flower, fruit
    biodynamic_quality VARCHAR(20),             -- favorable, neutral, unfavorable
    
    -- =====================================
    -- HORA LUNAR (para siembras muy precisas)
    -- =====================================
    moonrise_time TIME,
    moonset_time TIME,
    moon_culmination_time TIME,                 -- Moon highest in sky
    
    -- =====================================
    -- METADATA
    -- =====================================
    data_source VARCHAR(50) DEFAULT 'calculation',
    source_reference TEXT,
    calculation_method VARCHAR(50),             -- meeus_algorithm, nasa_api, etc.
    is_verified BOOLEAN DEFAULT true NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT lunar_calendar_hemisphere_valid CHECK (
        hemisphere IN ('northern', 'southern')
    ),
    
    CONSTRAINT lunar_calendar_phase_valid CHECK (
        moon_phase IN (
            'new_moon',
            'waxing_crescent',
            'first_quarter',
            'waxing_gibbous',
            'full_moon',
            'waning_gibbous',
            'last_quarter',
            'waning_crescent'
        )
    ),
    
    CONSTRAINT lunar_calendar_phase_precise_valid CHECK (
        moon_phase_precise >= 0 AND moon_phase_precise < 1
    ),
    
    CONSTRAINT lunar_calendar_illumination_valid CHECK (
        illumination_percent >= 0 AND illumination_percent <= 100
    ),
    
    CONSTRAINT lunar_calendar_age_valid CHECK (
        moon_age_days >= 0 AND moon_age_days < 29.531
    ),
    
    CONSTRAINT lunar_calendar_eclipse_type_valid CHECK (
        eclipse_type IS NULL OR eclipse_type IN (
            'lunar_total',
            'lunar_partial',
            'lunar_penumbral',
            'solar_total',
            'solar_partial',
            'solar_annular'
        )
    ),
    
    CONSTRAINT lunar_calendar_distance_positive CHECK (
        lunar_distance_km IS NULL OR lunar_distance_km > 0
    ),
    
    CONSTRAINT lunar_calendar_perigee_apogee_exclusive CHECK (
        NOT (is_perigee AND is_apogee)
    ),
    
    CONSTRAINT lunar_calendar_perigee_effect_valid CHECK (
        perigee_effect_strength IS NULL OR 
        (perigee_effect_strength >= 0 AND perigee_effect_strength <= 1)
    ),
    
    CONSTRAINT lunar_calendar_zodiac_sign_valid CHECK (
        zodiac_sign IS NULL OR zodiac_sign IN (
            'aries', 'taurus', 'gemini', 'cancer',
            'leo', 'virgo', 'libra', 'scorpio',
            'sagittarius', 'capricorn', 'aquarius', 'pisces'
        )
    ),
    
    CONSTRAINT lunar_calendar_zodiac_element_valid CHECK (
        zodiac_element IS NULL OR zodiac_element IN (
            'fire',     -- Aries, Leo, Sagittarius
            'earth',    -- Taurus, Virgo, Capricorn
            'air',      -- Gemini, Libra, Aquarius
            'water'     -- Cancer, Scorpio, Pisces
        )
    ),
    
    CONSTRAINT lunar_calendar_biodynamic_day_valid CHECK (
        biodynamic_day_type IS NULL OR biodynamic_day_type IN (
            'root_day',
            'leaf_day',
            'flower_day',
            'fruit_day',
            'unfavorable'  -- Nodes, perigee, etc.
        )
    ),
    
    CONSTRAINT lunar_calendar_biodynamic_quality_valid CHECK (
        biodynamic_quality IS NULL OR biodynamic_quality IN (
            'very_favorable',
            'favorable',
            'neutral',
            'unfavorable',
            'very_unfavorable'
        )
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

CREATE UNIQUE INDEX idx_lunar_calendar_date_hemisphere ON lunar_calendar(calendar_date, hemisphere);
CREATE INDEX idx_lunar_calendar_date ON lunar_calendar(calendar_date);
CREATE INDEX idx_lunar_calendar_phase ON lunar_calendar(moon_phase);
CREATE INDEX idx_lunar_calendar_zodiac_sign ON lunar_calendar(zodiac_sign);
CREATE INDEX idx_lunar_calendar_zodiac_element ON lunar_calendar(zodiac_element);
CREATE INDEX idx_lunar_calendar_biodynamic_day ON lunar_calendar(biodynamic_day_type);
CREATE INDEX idx_lunar_calendar_events ON lunar_calendar(calendar_date) 
    WHERE is_new_moon OR is_full_moon OR is_eclipse;

-- =====================================
-- TRIGGER
-- =====================================

CREATE TRIGGER update_lunar_calendar_updated_at
    BEFORE UPDATE ON lunar_calendar
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- COMENTARIOS
-- =====================================

COMMENT ON TABLE lunar_calendar IS 'Astronomical lunar data - objective, verifiable information';
COMMENT ON COLUMN lunar_calendar.moon_phase_precise IS '0.000 = new moon, 0.250 = first quarter, 0.500 = full moon, 0.750 = last quarter';
COMMENT ON COLUMN lunar_calendar.biodynamic_day_type IS 'Based on moon position in zodiac: Earth signs = root day, Water = leaf, Air = flower, Fire = fruit';
COMMENT ON COLUMN lunar_calendar.perigee_effect_strength IS 'How strongly perigee affects this day (1.0 = actual perigee, 0.5 = halfway to average distance)';

-- ========================================
-- TABLA: lunar_agricultural_rules (Conocimiento Tradicional)
-- ========================================
CREATE TABLE IF NOT EXISTS lunar_agricultural_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- CONDICIONES LUNARES
    -- =====================================
    moon_phase VARCHAR(30),                     -- NULL = applies to all phases
    moon_phase_range_min NUMERIC(6, 3),        -- e.g., 0.0-0.25 for waxing crescent
    moon_phase_range_max NUMERIC(6, 3),
    
    zodiac_sign VARCHAR(20),
    zodiac_element VARCHAR(10),
    biodynamic_day_type VARCHAR(15),
    
    -- Eventos especiales
    applies_to_perigee BOOLEAN DEFAULT false,
    applies_to_apogee BOOLEAN DEFAULT false,
    applies_to_eclipse BOOLEAN DEFAULT false,
    
    -- =====================================
    -- ACCIÓN AGRÍCOLA Y CULTIVO
    -- =====================================
    agricultural_action VARCHAR(50) NOT NULL,
    crop_catalog_id UUID REFERENCES crop_catalog(id) ON DELETE CASCADE,  -- NULL = applies to all crops
    crop_category VARCHAR(50),                  -- NULL = applies to all
    crop_part VARCHAR(30),                      -- root, leaf, flower, fruit, seed
    
    -- =====================================
    -- RECOMENDACIÓN
    -- =====================================
    recommendation_type VARCHAR(30) NOT NULL,
    recommendation_strength INTEGER NOT NULL,   -- -10 to +10
    urgency_level VARCHAR(20) DEFAULT 'suggestion',
    
    -- =====================================
    -- DESCRIPCIÓN Y EVIDENCIA
    -- =====================================
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    practical_advice TEXT,
    traditional_saying TEXT,                    -- e.g., "Plant above-ground crops in waxing moon"
    
    mechanism_claimed TEXT,                     -- What the tradition claims happens
    scientific_basis TEXT,                      -- Any scientific explanation (if exists)
    
    evidence_level VARCHAR(20) NOT NULL DEFAULT 'traditional',
    source_references TEXT[],
    confidence_score INTEGER,
    
    -- =====================================
    -- CONTEXTO DE APLICACIÓN
    -- =====================================
    climate_zones_applicable VARCHAR(50)[],
    hemisphere_applicable VARCHAR(10),          -- northern, southern, both
    season_applicable VARCHAR(20),
    
    -- =====================================
    -- VALIDACIÓN COMUNITARIA
    -- =====================================
    user_rating_avg NUMERIC(3, 2),
    user_rating_count INTEGER DEFAULT 0,
    times_followed INTEGER DEFAULT 0,          -- How many times users followed this rule
    success_rate_percent NUMERIC(5, 2),        -- Based on observations
    
    -- =====================================
    -- METADATA
    -- =====================================
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT lunar_rules_phase_range_valid CHECK (
        (moon_phase_range_min IS NULL AND moon_phase_range_max IS NULL) OR
        (moon_phase_range_min >= 0 AND moon_phase_range_min < 1 AND
         moon_phase_range_max >= 0 AND moon_phase_range_max < 1 AND
         moon_phase_range_max > moon_phase_range_min)
    ),
    
    CONSTRAINT lunar_rules_action_valid CHECK (
        agricultural_action IN (
            'sowing',
            'planting',
            'transplanting',
            'pruning',
            'harvesting',
            'fertilizing',
            'composting',
            'watering',
            'soil_work',
            'tilling',
            'weed_control',
            'pest_treatment',
            'grafting',
            'taking_cuttings',
            'storing_produce',
            'preserving',
            'bottling',
            'general_farm_work'
        )
    ),
    
    CONSTRAINT lunar_rules_crop_category_valid CHECK (
        crop_category IS NULL OR crop_category IN (
            'vegetable_fruit', 'vegetable_leaf', 'vegetable_root', 'vegetable_bulb',
            'legume', 'cucurbit', 'herb', 'grain', 'tuber', 'brassica'
        )
    ),
    
    CONSTRAINT lunar_rules_crop_part_valid CHECK (
        crop_part IS NULL OR crop_part IN (
            'root', 'leaf', 'flower', 'fruit', 'seed', 'bulb', 'tuber'
        )
    ),
    
    CONSTRAINT lunar_rules_recommendation_valid CHECK (
        recommendation_type IN (
            'highly_recommended',
            'recommended',
            'favorable',
            'neutral',
            'unfavorable',
            'not_recommended',
            'avoid'
        )
    ),
    
    CONSTRAINT lunar_rules_strength_valid CHECK (
        recommendation_strength BETWEEN -10 AND 10
    ),
    
    CONSTRAINT lunar_rules_strength_type_coherent CHECK (
        (recommendation_type IN ('highly_recommended', 'recommended', 'favorable') AND recommendation_strength > 0) OR
        (recommendation_type = 'neutral' AND recommendation_strength = 0) OR
        (recommendation_type IN ('unfavorable', 'not_recommended', 'avoid') AND recommendation_strength < 0)
    ),
    
    CONSTRAINT lunar_rules_urgency_valid CHECK (
        urgency_level IN (
            'suggestion',       -- Gentle suggestion
            'recommendation',   -- Stronger recommendation
            'warning',          -- Advises against
            'strong_warning'    -- Strongly advises against
        )
    ),
    
    CONSTRAINT lunar_rules_evidence_valid CHECK (
        evidence_level IN (
            'peer_reviewed',        -- Scientific studies exist
            'field_trial',          -- Documented trials
            'observational',        -- Systematic observation
            'traditional',          -- Traditional knowledge
            'anecdotal',            -- User reports
            'theoretical',          -- Hypothetical
            'folklore',             -- Cultural tradition
            'unknown'
        )
    ),
    
    CONSTRAINT lunar_rules_confidence_valid CHECK (
        confidence_score IS NULL OR (confidence_score BETWEEN 1 AND 10)
    ),
    
    CONSTRAINT lunar_rules_hemisphere_valid CHECK (
        hemisphere_applicable IS NULL OR hemisphere_applicable IN (
            'northern', 'southern', 'both'
        )
    ),
    
    CONSTRAINT lunar_rules_season_valid CHECK (
        season_applicable IS NULL OR season_applicable IN (
            'any', 'spring', 'summer', 'fall', 'winter',
            'warm_season', 'cool_season'
        )
    ),
    
    CONSTRAINT lunar_rules_rating_valid CHECK (
        user_rating_avg IS NULL OR (user_rating_avg BETWEEN 1.0 AND 5.0)
    ),
    
    CONSTRAINT lunar_rules_success_rate_valid CHECK (
        success_rate_percent IS NULL OR (success_rate_percent >= 0 AND success_rate_percent <= 100)
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

CREATE INDEX idx_lunar_rules_phase ON lunar_agricultural_rules(moon_phase);
CREATE INDEX idx_lunar_rules_zodiac_sign ON lunar_agricultural_rules(zodiac_sign);
CREATE INDEX idx_lunar_rules_zodiac_element ON lunar_agricultural_rules(zodiac_element);
CREATE INDEX idx_lunar_rules_biodynamic_day ON lunar_agricultural_rules(biodynamic_day_type);
CREATE INDEX idx_lunar_rules_action ON lunar_agricultural_rules(agricultural_action);
CREATE INDEX idx_lunar_rules_crop_id ON lunar_agricultural_rules(crop_catalog_id);
CREATE INDEX idx_lunar_rules_crop_category ON lunar_agricultural_rules(crop_category);
CREATE INDEX idx_lunar_rules_crop_part ON lunar_agricultural_rules(crop_part);
CREATE INDEX idx_lunar_rules_recommendation ON lunar_agricultural_rules(recommendation_type);
CREATE INDEX idx_lunar_rules_evidence ON lunar_agricultural_rules(evidence_level);
CREATE INDEX idx_lunar_rules_active ON lunar_agricultural_rules(is_active);

-- Índice compuesto para búsqueda de reglas aplicables
CREATE INDEX idx_lunar_rules_lookup ON lunar_agricultural_rules(
    agricultural_action, crop_category, recommendation_type
) WHERE is_active = true;

CREATE INDEX idx_lunar_rules_climate ON lunar_agricultural_rules USING GIN(climate_zones_applicable);

-- =====================================
-- TRIGGER
-- =====================================

CREATE TRIGGER update_lunar_agricultural_rules_updated_at
    BEFORE UPDATE ON lunar_agricultural_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE lunar_agricultural_rules IS 'Traditional agricultural knowledge related to lunar cycles - NOT scientific fact';
COMMENT ON COLUMN lunar_agricultural_rules.mechanism_claimed IS 'What traditional knowledge claims happens (not necessarily scientifically proven)';
COMMENT ON COLUMN lunar_agricultural_rules.success_rate_percent IS 'Success rate based on user observations (may be correlation, not causation)';

-- ========================================
-- TABLA: lunar_task_recommendations
-- ========================================
CREATE TABLE IF NOT EXISTS lunar_task_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- RELACIONES
    -- =====================================
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    lunar_calendar_id UUID NOT NULL REFERENCES lunar_calendar(id) ON DELETE CASCADE,
    lunar_rule_id UUID REFERENCES lunar_agricultural_rules(id) ON DELETE SET NULL,
    
    -- =====================================
    -- RECOMENDACIÓN
    -- =====================================
    recommendation_type VARCHAR(30) NOT NULL,
    recommendation_score INTEGER NOT NULL,      -- -10 to +10
    urgency_level VARCHAR(20) DEFAULT 'suggestion',
    
    recommendation_title VARCHAR(200),
    recommendation_summary TEXT,
    detailed_advice TEXT,
    
    -- =====================================
    -- APLICACIÓN POR USUARIO
    -- =====================================
    is_shown_to_user BOOLEAN DEFAULT false,
    shown_at TIMESTAMP WITH TIME ZONE,
    
    user_response VARCHAR(20),                  -- followed, ignored, postponed, dismissed
    user_response_at TIMESTAMP WITH TIME ZONE,
    user_notes TEXT,
    
    -- =====================================
    -- METADATA
    -- =====================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT lunar_task_recommendation_type_valid CHECK (
        recommendation_type IN (
            'highly_favorable',
            'favorable',
            'neutral',
            'unfavorable',
            'avoid'
        )
    ),
    
    CONSTRAINT lunar_task_score_valid CHECK (
        recommendation_score BETWEEN -10 AND 10
    ),
    
    CONSTRAINT lunar_task_urgency_valid CHECK (
        urgency_level IN (
            'suggestion',
            'recommendation',
            'warning',
            'strong_warning'
        )
    ),
    
    CONSTRAINT lunar_task_user_response_valid CHECK (
        user_response IS NULL OR user_response IN (
            'followed',
            'ignored',
            'postponed',
            'dismissed',
            'modified'
        )
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

CREATE INDEX idx_lunar_task_task ON lunar_task_recommendations(task_id);
CREATE INDEX idx_lunar_task_lunar_calendar ON lunar_task_recommendations(lunar_calendar_id);
CREATE INDEX idx_lunar_task_rule ON lunar_task_recommendations(lunar_rule_id);
CREATE INDEX idx_lunar_task_recommendation_type ON lunar_task_recommendations(recommendation_type);
CREATE INDEX idx_lunar_task_user_response ON lunar_task_recommendations(user_response);

-- Índice compuesto para análisis de adherencia
CREATE INDEX idx_lunar_task_response_analysis ON lunar_task_recommendations(
    lunar_rule_id, user_response
) WHERE user_response IS NOT NULL;

-- =====================================
-- TRIGGER
-- =====================================

CREATE TRIGGER update_lunar_task_recommendations_updated_at
    BEFORE UPDATE ON lunar_task_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE lunar_task_recommendations IS 'Lunar-based recommendations for specific tasks';
COMMENT ON COLUMN lunar_task_recommendations.user_response IS 'Tracks whether user actually followed the lunar recommendation';

-- ========================================
-- TABLA: lunar_observations
-- ========================================
CREATE TABLE IF NOT EXISTS lunar_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- CONTEXTO
    -- =====================================
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    planting_id UUID REFERENCES plantings(id) ON DELETE SET NULL,
    lunar_calendar_id UUID NOT NULL REFERENCES lunar_calendar(id),
    lunar_rule_id UUID REFERENCES lunar_agricultural_rules(id) ON DELETE SET NULL,
    lunar_recommendation_id UUID REFERENCES lunar_task_recommendations(id) ON DELETE SET NULL,
    
    observed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- =====================================
    -- OBSERVACIÓN
    -- =====================================
    observation_date DATE NOT NULL,
    observation_type VARCHAR(30) NOT NULL,
    
    -- ¿Siguió la recomendación lunar?
    followed_lunar_advice BOOLEAN NOT NULL,
    lunar_advice_followed VARCHAR(200),         -- What advice was followed/ignored
    
    -- =====================================
    -- RESULTADO
    -- =====================================
    observed_outcome VARCHAR(20) NOT NULL,
    effectiveness_rating INTEGER,               -- 1-5
    
    -- Comparación con expectativas
    compared_to_expected VARCHAR(30),
    compared_to_non_lunar VARCHAR(30),          -- If they have comparison data
    
    -- =====================================
    -- DETALLES
    -- =====================================
    description TEXT NOT NULL,
    unexpected_results TEXT,
    contributing_factors TEXT,                  -- Other factors that may have influenced results
    
    photos JSONB,
    measured_data JSONB,
    
    -- =====================================
    -- CONCLUSIÓN DEL USUARIO
    -- =====================================
    would_follow_again BOOLEAN,
    confidence_in_lunar_effect INTEGER,         -- 1-5: How confident they are it was lunar influence
    
    -- =====================================
    -- AUDITORÍA
    -- =====================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT lunar_observations_type_valid CHECK (
        observation_type IN (
            'germination',
            'growth_rate',
            'pest_incidence',
            'disease_incidence',
            'yield',
            'quality',
            'storage_duration',
            'general',
            'failure',
            'other'
        )
    ),
    
    CONSTRAINT lunar_observations_outcome_valid CHECK (
        observed_outcome IN (
            'excellent',
            'very_positive',
            'positive',
            'as_expected',
            'neutral',
            'disappointing',
            'negative',
            'very_negative',
            'inconclusive'
        )
    ),
    
    CONSTRAINT lunar_observations_rating_valid CHECK (
        effectiveness_rating IS NULL OR (effectiveness_rating BETWEEN 1 AND 5)
    ),
    
    CONSTRAINT lunar_observations_comparison_valid CHECK (
        (compared_to_expected IS NULL OR compared_to_expected IN (
            'much_better', 'better', 'as_expected', 'worse', 'much_worse'
        )) AND
        (compared_to_non_lunar IS NULL OR compared_to_non_lunar IN (
            'much_better', 'better', 'similar', 'worse', 'much_worse', 'no_comparison'
        ))
    ),
    
    CONSTRAINT lunar_observations_confidence_valid CHECK (
        confidence_in_lunar_effect IS NULL OR (confidence_in_lunar_effect BETWEEN 1 AND 5)
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

CREATE INDEX idx_lunar_observations_task ON lunar_observations(task_id);
CREATE INDEX idx_lunar_observations_planting ON lunar_observations(planting_id);
CREATE INDEX idx_lunar_observations_lunar_calendar ON lunar_observations(lunar_calendar_id);
CREATE INDEX idx_lunar_observations_rule ON lunar_observations(lunar_rule_id);
CREATE INDEX idx_lunar_observations_recommendation ON lunar_observations(lunar_recommendation_id);
CREATE INDEX idx_lunar_observations_garden ON lunar_observations(garden_id);
CREATE INDEX idx_lunar_observations_observed_by ON lunar_observations(observed_by);
CREATE INDEX idx_lunar_observations_date ON lunar_observations(observation_date);
CREATE INDEX idx_lunar_observations_outcome ON lunar_observations(observed_outcome);
CREATE INDEX idx_lunar_observations_followed ON lunar_observations(followed_lunar_advice);

-- Índice para análisis estadístico
CREATE INDEX idx_lunar_observations_analysis ON lunar_observations(
    lunar_rule_id, followed_lunar_advice, observed_outcome
);

-- =====================================
-- TRIGGER
-- =====================================

CREATE TRIGGER update_lunar_observations_updated_at
    BEFORE UPDATE ON lunar_observations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar success_rate en lunar_agricultural_rules
CREATE OR REPLACE FUNCTION update_lunar_rule_success_rate()
RETURNS TRIGGER AS $$
DECLARE
    v_success_count INTEGER;
    v_total_count INTEGER;
    v_success_rate NUMERIC(5, 2);
BEGIN
    IF NEW.lunar_rule_id IS NOT NULL AND NEW.followed_lunar_advice = true THEN
        -- Contar observaciones exitosas (positive, very_positive, excellent)
        SELECT COUNT(*) INTO v_success_count
        FROM lunar_observations
        WHERE lunar_rule_id = NEW.lunar_rule_id
          AND followed_lunar_advice = true
          AND observed_outcome IN ('excellent', 'very_positive', 'positive');
        
        -- Contar total de observaciones donde se siguió el consejo
        SELECT COUNT(*) INTO v_total_count
        FROM lunar_observations
        WHERE lunar_rule_id = NEW.lunar_rule_id
          AND followed_lunar_advice = true;
        
        IF v_total_count > 0 THEN
            v_success_rate := (v_success_count::NUMERIC / v_total_count::NUMERIC) * 100;
            
            UPDATE lunar_agricultural_rules
            SET success_rate_percent = v_success_rate,
                times_followed = v_total_count
            WHERE id = NEW.lunar_rule_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lunar_rule_success_rate
    AFTER INSERT OR UPDATE ON lunar_observations
    FOR EACH ROW
    WHEN (NEW.lunar_rule_id IS NOT NULL)
    EXECUTE FUNCTION update_lunar_rule_success_rate();

COMMENT ON TABLE lunar_observations IS 'Empirical observations of outcomes when following (or not following) lunar agricultural advice';
COMMENT ON COLUMN lunar_observations.followed_lunar_advice IS 'Whether the user actually followed the lunar recommendation';
COMMENT ON COLUMN lunar_observations.confidence_in_lunar_effect IS 'User confidence that lunar cycle (not other factors) caused the result';

-- ========================================
-- TABLA: lunar_monthly_calendar (Pre-calculado para UX)
-- ========================================
CREATE TABLE IF NOT EXISTS lunar_monthly_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    hemisphere VARCHAR(10) NOT NULL,

    -- =====================================
    -- EVENTOS DEL MES
    -- =====================================
    new_moon_dates DATE[],
    full_moon_dates DATE[],
    first_quarter_dates DATE[],
    last_quarter_dates DATE[],

    eclipse_dates DATE[],
    perigee_dates DATE[],
    apogee_dates DATE[],

    -- =====================================
    -- PERÍODOS FAVORABLES (PRE-CALCULADOS)
    -- =====================================
    favorable_sowing_dates_root DATE[],
    favorable_sowing_dates_leaf DATE[],
    favorable_sowing_dates_flower DATE[],
    favorable_sowing_dates_fruit DATE[],

    favorable_pruning_dates DATE[],
    favorable_harvesting_dates DATE[],

    unfavorable_dates DATE[],                  -- Nodes, eclipses, critical perigees, etc.

    -- =====================================
    -- RESUMEN PARA USUARIO
    -- =====================================
    monthly_summary TEXT,
    key_dates_summary JSONB,                   -- { "best_sowing": [...], "avoid": [...] }

    -- =====================================
    -- METADATA
    -- =====================================
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    calculation_version VARCHAR(20),
    data_source VARCHAR(50) DEFAULT 'internal',

    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    CONSTRAINT lunar_monthly_year_valid CHECK (
        year >= 2020 AND year <= 2100
    ),

    CONSTRAINT lunar_monthly_month_valid CHECK (
        month BETWEEN 1 AND 12
    ),

    CONSTRAINT lunar_monthly_hemisphere_valid CHECK (
        hemisphere IN ('northern', 'southern')
    ),

    CONSTRAINT lunar_monthly_unique UNIQUE (year, month, hemisphere)
);

-- =====================================
-- ÍNDICES
-- =====================================

CREATE INDEX idx_lunar_monthly_lookup
    ON lunar_monthly_calendar(year, month, hemisphere);

CREATE INDEX idx_lunar_monthly_calculated_at
    ON lunar_monthly_calendar(calculated_at DESC);

COMMENT ON TABLE lunar_monthly_calendar IS
'Precomputed monthly lunar calendar for fast UX rendering and planning';

-- ========================================
-- TABLA: weather_locations (Ubicaciones Meteorológicas)
-- ========================================
CREATE TABLE IF NOT EXISTS weather_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- GEOLOCALIZACIÓN
    -- =====================================
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    elevation_m INTEGER,
    
    -- =====================================
    -- IDENTIFICACIÓN
    -- =====================================
    location_name VARCHAR(200),
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(2) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    
    -- =====================================
    -- CLIMA
    -- =====================================
    climate_zone VARCHAR(50),
    koppen_classification VARCHAR(10),          -- Cfb, Csa, etc.
    hardiness_zone VARCHAR(10),
    
    -- =====================================
    -- METADATA
    -- =====================================
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT weather_locations_coords_valid CHECK (
        latitude BETWEEN -90 AND 90 AND
        longitude BETWEEN -180 AND 180
    ),
    
    CONSTRAINT weather_locations_elevation_reasonable CHECK (
        elevation_m IS NULL OR (elevation_m BETWEEN -500 AND 9000)
    ),
    
    CONSTRAINT weather_locations_country_iso CHECK (
        LENGTH(country) = 2
    )
);

-- Índice espacial
CREATE INDEX idx_weather_locations_coords ON weather_locations(latitude, longitude);
CREATE INDEX idx_weather_locations_active ON weather_locations(is_active);

-- Evitar duplicados de ubicación (redondeo a 3 decimales = ~100m precisión)
CREATE UNIQUE INDEX idx_weather_locations_unique_coords ON weather_locations(
    ROUND(latitude::NUMERIC, 3),
    ROUND(longitude::NUMERIC, 3)
);

CREATE TRIGGER update_weather_locations_updated_at
    BEFORE UPDATE ON weather_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE weather_locations IS 'Weather data locations - shared by multiple gardens';

-- Conectar gardens con weather_locations
ALTER TABLE gardens ADD COLUMN weather_location_id UUID REFERENCES weather_locations(id) ON DELETE SET NULL;
CREATE INDEX idx_gardens_weather_location ON gardens(weather_location_id);

-- ========================================
-- TABLA: weather_daily (Datos Meteorológicos Completos)
-- ========================================
CREATE TABLE IF NOT EXISTS weather_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- UBICACIÓN Y FECHA
    -- =====================================
    weather_location_id UUID NOT NULL REFERENCES weather_locations(id) ON DELETE CASCADE,
    weather_date DATE NOT NULL,
    
    -- =====================================
    -- TIPO DE DATOS
    -- =====================================
    data_type VARCHAR(20) NOT NULL,             -- observed, forecast
    forecast_generated_at TIMESTAMP WITH TIME ZONE,
    days_ahead INTEGER,                         -- For forecasts: how many days in advance
    
    -- =====================================
    -- TEMPERATURA (°C)
    -- =====================================
    temp_min_c NUMERIC(4, 1),
    temp_max_c NUMERIC(4, 1),
    temp_avg_c NUMERIC(4, 1),
    temp_feels_like_c NUMERIC(4, 1),           -- Apparent temperature
    temp_dew_point_c NUMERIC(4, 1),            -- Dew point
    
    -- =====================================
    -- PRECIPITACIÓN
    -- =====================================
    precipitation_mm NUMERIC(6, 2),
    precipitation_type VARCHAR(20),             -- rain, snow, sleet, hail, mixed
    snow_depth_cm NUMERIC(5, 1),
    precipitation_probability_percent INTEGER,  -- For forecasts
    
    -- =====================================
    -- HUMEDAD
    -- =====================================
    humidity_min_percent INTEGER,
    humidity_max_percent INTEGER,
    humidity_avg_percent INTEGER,
    
    -- =====================================
    -- VIENTO
    -- =====================================
    wind_speed_avg_kmh NUMERIC(5, 2),
    wind_speed_max_kmh NUMERIC(5, 2),
    wind_gust_max_kmh NUMERIC(5, 2),
    wind_direction_degrees INTEGER,             -- 0-360
    wind_direction_cardinal VARCHAR(3),         -- N, NE, E, SE, S, SW, W, NW
    
    -- =====================================
    -- PRESIÓN Y NUBES
    -- =====================================
    pressure_hpa NUMERIC(6, 2),
    pressure_trend VARCHAR(10),                 -- rising, falling, steady
    cloud_cover_percent INTEGER,
    
    -- =====================================
    -- RADIACIÓN SOLAR
    -- =====================================
    sunshine_hours NUMERIC(4, 2),
    solar_radiation_mj_m2 NUMERIC(6, 2),
    uv_index NUMERIC(3, 1),
    uv_index_max NUMERIC(3, 1),
    
    -- =====================================
    -- EVAPOTRANSPIRACIÓN
    -- =====================================
    eto_mm NUMERIC(5, 2),                       -- Reference evapotranspiration (FAO-56)
    
    -- =====================================
    -- CONDICIÓN GENERAL
    -- =====================================
    weather_condition VARCHAR(30),              -- clear, partly_cloudy, cloudy, rainy, etc.
    weather_description TEXT,
    
    -- =====================================
    -- EVENTOS EXTREMOS
    -- =====================================
    had_frost BOOLEAN DEFAULT false NOT NULL,
    frost_severity VARCHAR(20),                 -- light, moderate, severe
    
    had_heatwave BOOLEAN DEFAULT false NOT NULL,
    heat_index_max_c NUMERIC(4, 1),
    
    had_heavy_rain BOOLEAN DEFAULT false NOT NULL,
    rain_intensity_mm_h NUMERIC(6, 2),
    
    had_storm BOOLEAN DEFAULT false NOT NULL,
    storm_type VARCHAR(20),                     -- thunderstorm, hailstorm, windstorm
    
    had_drought_conditions BOOLEAN DEFAULT false,
    
    -- =====================================
    -- ÍNDICES AGRONÓMICOS CALCULADOS
    -- =====================================
    gdd_base_10 NUMERIC(5, 2),                  -- Growing Degree Days (base 10°C)
    gdd_base_5 NUMERIC(5, 2),                   -- Growing Degree Days (base 5°C)
    chill_hours INTEGER,                        -- Hours below 7°C
    chill_portions NUMERIC(5, 2),               -- Dynamic chill model
    
    frost_risk_score INTEGER,                   -- 0-10: probability/severity of frost
    heat_stress_score INTEGER,                  -- 0-10: heat stress for plants
    
    -- =====================================
    -- CALIDAD Y ORIGEN DE DATOS
    -- =====================================
    data_source VARCHAR(50) NOT NULL,
    data_source_api VARCHAR(100),
    confidence_score INTEGER,                   -- 1-10
    data_quality VARCHAR(20),                   -- excellent, good, fair, poor
    
    -- =====================================
    -- METADATA
    -- =====================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT weather_daily_temp_valid CHECK (
        (temp_min_c IS NULL OR temp_max_c IS NULL OR temp_max_c >= temp_min_c) AND
        (temp_min_c IS NULL OR (temp_min_c >= -60 AND temp_min_c <= 60)) AND
        (temp_max_c IS NULL OR (temp_max_c >= -60 AND temp_max_c <= 60))
    ),
    
    CONSTRAINT weather_daily_data_type_valid CHECK (
        data_type IN ('observed', 'forecast', 'historical')
    ),
    
    CONSTRAINT weather_daily_forecast_requires_timestamp CHECK (
        data_type != 'forecast' OR forecast_generated_at IS NOT NULL
    ),
    
    CONSTRAINT weather_daily_days_ahead_valid CHECK (
        days_ahead IS NULL OR (days_ahead >= 0 AND days_ahead <= 14)
    ),
    
    CONSTRAINT weather_daily_precipitation_valid CHECK (
        precipitation_mm IS NULL OR precipitation_mm >= 0
    ),
    
    CONSTRAINT weather_daily_precip_type_valid CHECK (
        precipitation_type IS NULL OR precipitation_type IN (
            'none', 'rain', 'snow', 'sleet', 'hail', 'freezing_rain', 'mixed'
        )
    ),
    
    CONSTRAINT weather_daily_precip_prob_valid CHECK (
        precipitation_probability_percent IS NULL OR 
        (precipitation_probability_percent >= 0 AND precipitation_probability_percent <= 100)
    ),
    
    CONSTRAINT weather_daily_humidity_valid CHECK (
        (humidity_min_percent IS NULL OR (humidity_min_percent >= 0 AND humidity_min_percent <= 100)) AND
        (humidity_max_percent IS NULL OR (humidity_max_percent >= 0 AND humidity_max_percent <= 100)) AND
        (humidity_avg_percent IS NULL OR (humidity_avg_percent >= 0 AND humidity_avg_percent <= 100)) AND
        (humidity_min_percent IS NULL OR humidity_max_percent IS NULL OR humidity_max_percent >= humidity_min_percent)
    ),
    
    CONSTRAINT weather_daily_wind_valid CHECK (
        (wind_speed_avg_kmh IS NULL OR wind_speed_avg_kmh >= 0) AND
        (wind_speed_max_kmh IS NULL OR wind_speed_max_kmh >= 0) AND
        (wind_gust_max_kmh IS NULL OR wind_gust_max_kmh >= 0) AND
        (wind_speed_avg_kmh IS NULL OR wind_speed_max_kmh IS NULL OR wind_speed_max_kmh >= wind_speed_avg_kmh)
    ),
    
    CONSTRAINT weather_daily_wind_direction_valid CHECK (
        wind_direction_degrees IS NULL OR (wind_direction_degrees >= 0 AND wind_direction_degrees < 360)
    ),
    
    CONSTRAINT weather_daily_wind_cardinal_valid CHECK (
        wind_direction_cardinal IS NULL OR wind_direction_cardinal IN (
            'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
            'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
        )
    ),
    
    CONSTRAINT weather_daily_pressure_valid CHECK (
        pressure_hpa IS NULL OR (pressure_hpa >= 870 AND pressure_hpa <= 1085)
    ),
    
    CONSTRAINT weather_daily_pressure_trend_valid CHECK (
        pressure_trend IS NULL OR pressure_trend IN ('rising', 'falling', 'steady')
    ),
    
    CONSTRAINT weather_daily_cloud_cover_valid CHECK (
        cloud_cover_percent IS NULL OR (cloud_cover_percent >= 0 AND cloud_cover_percent <= 100)
    ),
    
    CONSTRAINT weather_daily_sunshine_valid CHECK (
        sunshine_hours IS NULL OR (sunshine_hours >= 0 AND sunshine_hours <= 24)
    ),
    
    CONSTRAINT weather_daily_uv_valid CHECK (
        (uv_index IS NULL OR (uv_index >= 0 AND uv_index <= 15)) AND
        (uv_index_max IS NULL OR (uv_index_max >= 0 AND uv_index_max <= 15))
    ),
    
    CONSTRAINT weather_daily_eto_valid CHECK (
        eto_mm IS NULL OR (eto_mm >= 0 AND eto_mm <= 20)
    ),
    
    CONSTRAINT weather_daily_condition_valid CHECK (
        weather_condition IS NULL OR weather_condition IN (
            'clear',
            'partly_cloudy',
            'cloudy',
            'overcast',
            'light_rain',
            'rain',
            'heavy_rain',
            'drizzle',
            'thunderstorm',
            'snow',
            'sleet',
            'hail',
            'fog',
            'mist',
            'windy'
        )
    ),
    
    CONSTRAINT weather_daily_frost_severity_valid CHECK (
        frost_severity IS NULL OR frost_severity IN (
            'light',        -- 0 to -2°C
            'moderate',     -- -2 to -5°C
            'severe',       -- -5 to -10°C
            'extreme'       -- < -10°C
        )
    ),
    
    CONSTRAINT weather_daily_storm_type_valid CHECK (
        storm_type IS NULL OR storm_type IN (
            'thunderstorm', 'hailstorm', 'windstorm', 'ice_storm', 'dust_storm'
        )
    ),
    
    CONSTRAINT weather_daily_gdd_valid CHECK (
        (gdd_base_10 IS NULL OR gdd_base_10 >= 0) AND
        (gdd_base_5 IS NULL OR gdd_base_5 >= 0)
    ),
    
    CONSTRAINT weather_daily_chill_valid CHECK (
        (chill_hours IS NULL OR chill_hours >= 0) AND
        (chill_portions IS NULL OR chill_portions >= 0)
    ),
    
    CONSTRAINT weather_daily_risk_scores_valid CHECK (
        (frost_risk_score IS NULL OR (frost_risk_score >= 0 AND frost_risk_score <= 10)) AND
        (heat_stress_score IS NULL OR (heat_stress_score >= 0 AND heat_stress_score <= 10))
    ),
    
    CONSTRAINT weather_daily_confidence_valid CHECK (
        confidence_score IS NULL OR (confidence_score >= 1 AND confidence_score <= 10)
    ),
    
    CONSTRAINT weather_daily_data_quality_valid CHECK (
        data_quality IS NULL OR data_quality IN ('excellent', 'good', 'fair', 'poor', 'incomplete')
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

CREATE INDEX idx_weather_daily_location_date ON weather_daily(weather_location_id, weather_date);
CREATE INDEX idx_weather_daily_date ON weather_daily(weather_date);
CREATE INDEX idx_weather_daily_data_type ON weather_daily(data_type);
CREATE INDEX idx_weather_daily_source ON weather_daily(data_source);

-- Índice compuesto para forecast lookups
CREATE INDEX idx_weather_daily_forecast ON weather_daily(
    weather_location_id, weather_date, data_type
) WHERE data_type = 'forecast';

-- Índice para eventos extremos
CREATE INDEX idx_weather_daily_extreme_events ON weather_daily(weather_date)
WHERE had_frost OR had_heatwave OR had_heavy_rain OR had_storm;

-- Evitar duplicados
CREATE UNIQUE INDEX idx_weather_daily_unique ON weather_daily(
    weather_location_id, weather_date, data_type, COALESCE(forecast_generated_at, '1970-01-01'::TIMESTAMP WITH TIME ZONE)
);

-- =====================================
-- TRIGGERS
-- =====================================

CREATE TRIGGER update_weather_daily_updated_at
    BEFORE UPDATE ON weather_daily
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para calcular índices agronómicos automáticamente
CREATE OR REPLACE FUNCTION calculate_agricultural_indices()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular GDD (Growing Degree Days) base 10°C
    IF NEW.temp_avg_c IS NOT NULL THEN
        NEW.gdd_base_10 := GREATEST(0, NEW.temp_avg_c - 10);
        NEW.gdd_base_5 := GREATEST(0, NEW.temp_avg_c - 5);
    END IF;
    
    -- Calcular horas de frío (aproximación: si temp_min < 7°C)
    IF NEW.temp_min_c IS NOT NULL AND NEW.temp_min_c < 7 THEN
        NEW.chill_hours := GREATEST(0, LEAST(24, (7 - NEW.temp_min_c) * 2));
    END IF;
    
    -- Calcular frost risk score
    IF NEW.temp_min_c IS NOT NULL THEN
        NEW.frost_risk_score := CASE
            WHEN NEW.temp_min_c >= 5 THEN 0
            WHEN NEW.temp_min_c >= 2 THEN 3
            WHEN NEW.temp_min_c >= 0 THEN 6
            WHEN NEW.temp_min_c >= -2 THEN 8
            ELSE 10
        END;
        
        -- Marcar had_frost si temp < 0
        IF NEW.temp_min_c < 0 THEN
            NEW.had_frost := true;
            NEW.frost_severity := CASE
                WHEN NEW.temp_min_c >= -2 THEN 'light'
                WHEN NEW.temp_min_c >= -5 THEN 'moderate'
                WHEN NEW.temp_min_c >= -10 THEN 'severe'
                ELSE 'extreme'
            END;
        END IF;
    END IF;
    
    -- Calcular heat stress score
    IF NEW.temp_max_c IS NOT NULL THEN
        NEW.heat_stress_score := CASE
            WHEN NEW.temp_max_c <= 30 THEN 0
            WHEN NEW.temp_max_c <= 33 THEN 3
            WHEN NEW.temp_max_c <= 36 THEN 6
            WHEN NEW.temp_max_c <= 40 THEN 8
            ELSE 10
        END;
        
        IF NEW.temp_max_c >= 35 THEN
            NEW.had_heatwave := true;
        END IF;
    END IF;
    
    -- Marcar heavy rain
    IF NEW.precipitation_mm IS NOT NULL AND NEW.precipitation_mm >= 20 THEN
        NEW.had_heavy_rain := true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_agricultural_indices
    BEFORE INSERT OR UPDATE ON weather_daily
    FOR EACH ROW
    EXECUTE FUNCTION calculate_agricultural_indices();

COMMENT ON TABLE weather_daily IS 'Comprehensive daily weather data with agricultural indices';
COMMENT ON COLUMN weather_daily.gdd_base_10 IS 'Growing Degree Days with base 10°C - for warm-season crops';
COMMENT ON COLUMN weather_daily.eto_mm IS 'Reference evapotranspiration (FAO-56 Penman-Monteith) in mm';
COMMENT ON COLUMN weather_daily.chill_hours IS 'Chill hours (hours below 7°C) - important for fruit trees';

-- ========================================
-- TABLA: weather_forecast_accuracy
-- ========================================
CREATE TABLE IF NOT EXISTS weather_forecast_accuracy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    forecast_id UUID NOT NULL REFERENCES weather_daily(id) ON DELETE CASCADE,
    observed_id UUID NOT NULL REFERENCES weather_daily(id) ON DELETE CASCADE,
    
    weather_date DATE NOT NULL,
    days_ahead INTEGER NOT NULL,
    
    -- =====================================
    -- ERRORES CALCULADOS
    -- =====================================
    temp_min_error_c NUMERIC(4, 1),
    temp_max_error_c NUMERIC(4, 1),
    precipitation_error_mm NUMERIC(6, 2),
    
    -- =====================================
    -- PRECISIÓN
    -- =====================================
    overall_accuracy_score INTEGER,             -- 1-10
    
    was_frost_predicted_correctly BOOLEAN,
    was_rain_predicted_correctly BOOLEAN,
    
    -- =====================================
    -- METADATA
    -- =====================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT weather_accuracy_days_ahead_valid CHECK (days_ahead >= 0),
    CONSTRAINT weather_accuracy_score_valid CHECK (
        overall_accuracy_score IS NULL OR (overall_accuracy_score >= 1 AND overall_accuracy_score <= 10)
    )
);

CREATE INDEX idx_weather_accuracy_forecast ON weather_forecast_accuracy(forecast_id);
CREATE INDEX idx_weather_accuracy_observed ON weather_forecast_accuracy(observed_id);
CREATE INDEX idx_weather_accuracy_date ON weather_forecast_accuracy(weather_date);
CREATE INDEX idx_weather_accuracy_days_ahead ON weather_forecast_accuracy(days_ahead);

COMMENT ON TABLE weather_forecast_accuracy IS 'Validation of forecast accuracy vs observed data';

-- ========================================
-- TABLA: weather_agricultural_rules
-- ========================================
CREATE TABLE IF NOT EXISTS weather_agricultural_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- CONDICIONES CLIMÁTICAS (Rangos)
    -- =====================================
    temp_min_c NUMERIC(4, 1),
    temp_max_c NUMERIC(4, 1),
    
    precipitation_min_mm NUMERIC(6, 2),
    precipitation_max_mm NUMERIC(6, 2),
    
    humidity_min_percent INTEGER,
    humidity_max_percent INTEGER,
    
    wind_speed_max_kmh NUMERIC(5, 2),          -- Maximum safe wind speed
    
    frost_risk_min INTEGER,                     -- Minimum frost risk score (0-10)
    heat_stress_max INTEGER,                    -- Maximum heat stress tolerable
    
    -- =====================================
    -- CONDICIONES ESPECÍFICAS
    -- =====================================
    requires_frost BOOLEAN DEFAULT false,
    prohibits_frost BOOLEAN DEFAULT false,
    
    requires_rain BOOLEAN DEFAULT false,
    prohibits_rain BOOLEAN DEFAULT false,
    
    requires_dry_conditions BOOLEAN DEFAULT false,
    
    ideal_weather_condition VARCHAR(30)[],      -- Array of ideal conditions
    prohibited_weather_conditions VARCHAR(30)[], -- Array of prohibited conditions
    
    -- =====================================
    -- ACCIÓN AGRÍCOLA
    -- =====================================
    agricultural_action VARCHAR(50) NOT NULL,
    crop_catalog_id UUID REFERENCES crop_catalog(id) ON DELETE CASCADE,
    crop_category VARCHAR(50),
    crop_growth_stage VARCHAR(30),
    
    -- =====================================
    -- RECOMENDACIÓN
    -- =====================================
    recommendation_type VARCHAR(30) NOT NULL,
    recommendation_strength INTEGER NOT NULL,
    urgency_level VARCHAR(20) DEFAULT 'recommendation',
    
    -- =====================================
    -- VENTANA TEMPORAL
    -- =====================================
    hours_before_event INTEGER,                 -- Start rule N hours before conditions
    hours_after_event INTEGER,                  -- Rule applies N hours after
    
    season_applicable VARCHAR(20),
    
    -- =====================================
    -- DESCRIPCIÓN
    -- =====================================
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    mechanism TEXT,
    practical_advice TEXT,
    
    evidence_level VARCHAR(20) NOT NULL DEFAULT 'field_trial',
    source_references TEXT[],
    confidence_score INTEGER,
    
    -- =====================================
    -- VALIDACIÓN COMUNITARIA
    -- =====================================
    user_rating_avg NUMERIC(3, 2),
    user_rating_count INTEGER DEFAULT 0,
    success_rate_percent NUMERIC(5, 2),
    
    -- =====================================
    -- METADATA
    -- =====================================
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT weather_rules_temp_range_valid CHECK (
        temp_min_c IS NULL OR temp_max_c IS NULL OR temp_max_c >= temp_min_c
    ),
    
    CONSTRAINT weather_rules_precip_range_valid CHECK (
        precipitation_min_mm IS NULL OR precipitation_max_mm IS NULL OR 
        precipitation_max_mm >= precipitation_min_mm
    ),
    
    CONSTRAINT weather_rules_humidity_range_valid CHECK (
        (humidity_min_percent IS NULL OR (humidity_min_percent >= 0 AND humidity_min_percent <= 100)) AND
        (humidity_max_percent IS NULL OR (humidity_max_percent >= 0 AND humidity_max_percent <= 100)) AND
        (humidity_min_percent IS NULL OR humidity_max_percent IS NULL OR humidity_max_percent >= humidity_min_percent)
    ),
    
    CONSTRAINT weather_rules_wind_positive CHECK (
        wind_speed_max_kmh IS NULL OR wind_speed_max_kmh >= 0
    ),
    
    CONSTRAINT weather_rules_frost_risk_valid CHECK (
        frost_risk_min IS NULL OR (frost_risk_min >= 0 AND frost_risk_min <= 10)
    ),
    
    CONSTRAINT weather_rules_heat_stress_valid CHECK (
        heat_stress_max IS NULL OR (heat_stress_max >= 0 AND heat_stress_max <= 10)
    ),
    
    CONSTRAINT weather_rules_frost_not_both CHECK (
        NOT (requires_frost AND prohibits_frost)
    ),
    
    CONSTRAINT weather_rules_rain_not_both CHECK (
        NOT (requires_rain AND prohibits_rain)
    ),
    
    CONSTRAINT weather_rules_action_valid CHECK (
        agricultural_action IN (
            'sowing', 'planting', 'transplanting', 'watering', 'irrigation_adjustment',
            'fertilizing', 'pesticide_application', 'fungicide_application',
            'harvesting', 'pruning', 'mowing',
            'frost_protection', 'shade_installation', 'mulching',
            'soil_work', 'tilling', 'composting',
            'general_farm_work', 'delay_all_activities'
        )
    ),
    
    CONSTRAINT weather_rules_growth_stage_valid CHECK (
        crop_growth_stage IS NULL OR crop_growth_stage IN (
            'sowing', 'germination', 'seedling', 'vegetative',
            'flowering', 'fruiting', 'ripening', 'harvest'
        )
    ),
    
    CONSTRAINT weather_rules_recommendation_valid CHECK (
        recommendation_type IN (
            'highly_recommended',
            'recommended',
            'favorable',
            'neutral',
            'caution',
            'not_recommended',
            'avoid',
            'prohibited'
        )
    ),
    
    CONSTRAINT weather_rules_strength_valid CHECK (
        recommendation_strength BETWEEN -10 AND 10
    ),
    
    CONSTRAINT weather_rules_strength_type_coherent CHECK (
        (recommendation_type IN ('highly_recommended', 'recommended', 'favorable') AND recommendation_strength > 0) OR
        (recommendation_type = 'neutral' AND recommendation_strength = 0) OR
        (recommendation_type IN ('caution', 'not_recommended', 'avoid', 'prohibited') AND recommendation_strength < 0)
    ),
    
    CONSTRAINT weather_rules_urgency_valid CHECK (
        urgency_level IN (
            'suggestion',
            'recommendation',
            'warning',
            'critical_warning',
            'emergency'
        )
    ),
    
    CONSTRAINT weather_rules_temporal_valid CHECK (
        (hours_before_event IS NULL OR hours_before_event >= 0) AND
        (hours_after_event IS NULL OR hours_after_event >= 0)
    ),
    
    CONSTRAINT weather_rules_season_valid CHECK (
        season_applicable IS NULL OR season_applicable IN (
            'any', 'spring', 'summer', 'fall', 'winter',
            'warm_season', 'cool_season'
        )
    ),
    
    CONSTRAINT weather_rules_evidence_valid CHECK (
        evidence_level IN (
            'peer_reviewed',
            'field_trial',
            'extension_service',
            'observational',
            'traditional',
            'expert_opinion',
            'theoretical'
        )
    ),
    
    CONSTRAINT weather_rules_confidence_valid CHECK (
        confidence_score IS NULL OR (confidence_score >= 1 AND confidence_score <= 10)
    ),
    
    CONSTRAINT weather_rules_rating_valid CHECK (
        user_rating_avg IS NULL OR (user_rating_avg >= 1.0 AND user_rating_avg <= 5.0)
    ),
    
    CONSTRAINT weather_rules_success_rate_valid CHECK (
        success_rate_percent IS NULL OR (success_rate_percent >= 0 AND success_rate_percent <= 100)
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

CREATE INDEX idx_weather_rules_action ON weather_agricultural_rules(agricultural_action);
CREATE INDEX idx_weather_rules_crop_id ON weather_agricultural_rules(crop_catalog_id);
CREATE INDEX idx_weather_rules_crop_category ON weather_agricultural_rules(crop_category);
CREATE INDEX idx_weather_rules_recommendation ON weather_agricultural_rules(recommendation_type);
CREATE INDEX idx_weather_rules_evidence ON weather_agricultural_rules(evidence_level);
CREATE INDEX idx_weather_rules_active ON weather_agricultural_rules(is_active);

-- Índice compuesto para búsqueda de reglas aplicables
CREATE INDEX idx_weather_rules_lookup ON weather_agricultural_rules(
    agricultural_action, is_active
) WHERE is_active = true;

CREATE INDEX idx_weather_rules_ideal_conditions ON weather_agricultural_rules USING GIN(ideal_weather_condition);
CREATE INDEX idx_weather_rules_prohibited_conditions ON weather_agricultural_rules USING GIN(prohibited_weather_conditions);

-- =====================================
-- TRIGGER
-- =====================================

CREATE TRIGGER update_weather_agricultural_rules_updated_at
    BEFORE UPDATE ON weather_agricultural_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE weather_agricultural_rules IS 'Agricultural recommendations based on weather conditions';
COMMENT ON COLUMN weather_agricultural_rules.hours_before_event IS 'Start applying rule N hours before weather event occurs';
COMMENT ON COLUMN weather_agricultural_rules.prohibited_weather_conditions IS 'Weather conditions where this action must NOT be performed';

-- ========================================
-- TABLA: weather_alerts
-- ========================================
CREATE TABLE IF NOT EXISTS weather_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- CONTEXTO
    -- =====================================
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    weather_location_id UUID REFERENCES weather_locations(id) ON DELETE SET NULL,
    weather_daily_id UUID REFERENCES weather_daily(id) ON DELETE SET NULL,
    weather_rule_id UUID REFERENCES weather_agricultural_rules(id) ON DELETE SET NULL,
    
    -- =====================================
    -- TEMPORALIDAD DE LA ALERTA
    -- =====================================
    alert_date DATE NOT NULL,                    -- When alert was issued
    event_start_date DATE NOT NULL,              -- When weather event starts
    event_end_date DATE,                         -- When weather event ends
    expires_at TIMESTAMP WITH TIME ZONE,         -- When alert becomes obsolete
    
    lead_time_hours INTEGER,                     -- Hours between alert and event
    
    -- =====================================
    -- CLASIFICACIÓN
    -- =====================================
    alert_type VARCHAR(30) NOT NULL,
    alert_category VARCHAR(30),
    severity_level VARCHAR(20) NOT NULL,
    confidence_level VARCHAR(20),
    
    -- =====================================
    -- CONTENIDO
    -- =====================================
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    impact_assessment TEXT,
    
    recommended_actions TEXT[],
    urgent_actions TEXT[],
    
    -- =====================================
    -- CULTIVOS/TAREAS AFECTADAS
    -- =====================================
    affected_planting_ids UUID[],                -- Plantings at risk
    affected_task_ids UUID[],                    -- Tasks that should be postponed/expedited
    estimated_risk_level VARCHAR(20),
    
    -- =====================================
    -- RESPUESTA DEL USUARIO
    -- =====================================
    is_acknowledged BOOLEAN DEFAULT false NOT NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    user_action_taken VARCHAR(30),
    action_notes TEXT,
    
    -- =====================================
    -- METADATA
    -- =====================================
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT weather_alerts_dates_valid CHECK (
        event_start_date >= alert_date AND
        (event_end_date IS NULL OR event_end_date >= event_start_date)
    ),
    
    CONSTRAINT weather_alerts_lead_time_valid CHECK (
        lead_time_hours IS NULL OR lead_time_hours >= 0
    ),
    
    CONSTRAINT weather_alerts_type_valid CHECK (
        alert_type IN (
            'frost',
            'freeze',
            'heatwave',
            'drought',
            'heavy_rain',
            'flooding',
            'hail',
            'thunderstorm',
            'high_wind',
            'snow',
            'ice_storm',
            'extreme_cold',
            'extreme_heat',
            'rapid_temperature_change',
            'low_humidity',
            'high_uv',
            'pest_favorable_conditions',
            'disease_favorable_conditions',
            'general'
        )
    ),
    
    CONSTRAINT weather_alerts_category_valid CHECK (
        alert_category IS NULL OR alert_category IN (
            'temperature',
            'precipitation',
            'wind',
            'pest_disease',
            'general_weather'
        )
    ),
    
    CONSTRAINT weather_alerts_severity_valid CHECK (
        severity_level IN (
            'info',
            'advisory',
            'watch',
            'warning',
            'critical',
            'emergency'
        )
    ),
    
    CONSTRAINT weather_alerts_confidence_valid CHECK (
        confidence_level IS NULL OR confidence_level IN (
            'very_high',
            'high',
            'medium',
            'low'
        )
    ),
    
    CONSTRAINT weather_alerts_risk_valid CHECK (
        estimated_risk_level IS NULL OR estimated_risk_level IN (
            'minimal',
            'low',
            'moderate',
            'high',
            'severe',
            'catastrophic'
        )
    ),
    
    CONSTRAINT weather_alerts_user_action_valid CHECK (
        user_action_taken IS NULL OR user_action_taken IN (
            'protective_measures_taken',
            'tasks_rescheduled',
            'emergency_harvest',
            'no_action_needed',
            'monitoring',
            'dismissed'
        )
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

CREATE INDEX idx_weather_alerts_garden ON weather_alerts(garden_id);
CREATE INDEX idx_weather_alerts_location ON weather_alerts(weather_location_id);
CREATE INDEX idx_weather_alerts_weather_daily ON weather_alerts(weather_daily_id);
CREATE INDEX idx_weather_alerts_rule ON weather_alerts(weather_rule_id);
CREATE INDEX idx_weather_alerts_alert_date ON weather_alerts(alert_date);
CREATE INDEX idx_weather_alerts_event_date ON weather_alerts(event_start_date);
CREATE INDEX idx_weather_alerts_type ON weather_alerts(alert_type);
CREATE INDEX idx_weather_alerts_severity ON weather_alerts(severity_level);
CREATE INDEX idx_weather_alerts_acknowledged ON weather_alerts(is_acknowledged);

-- Índice compuesto para alertas activas no reconocidas
CREATE INDEX idx_weather_alerts_active_unacknowledged ON weather_alerts(
    garden_id, alert_date, severity_level
) WHERE is_acknowledged = false AND is_active = true;

-- Índices para arrays
CREATE INDEX idx_weather_alerts_affected_plantings ON weather_alerts USING GIN(affected_planting_ids);
CREATE INDEX idx_weather_alerts_affected_tasks ON weather_alerts USING GIN(affected_task_ids);

-- =====================================
-- TRIGGER
-- =====================================

CREATE TRIGGER update_weather_alerts_updated_at
    BEFORE UPDATE ON weather_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE weather_alerts IS 'Weather alerts for gardens with affected plantings and tasks';
COMMENT ON COLUMN weather_alerts.lead_time_hours IS 'Hours between alert issuance and weather event - for preparedness';
COMMENT ON COLUMN weather_alerts.affected_planting_ids IS 'Specific plantings at risk from this weather event';

-- ========================================
-- TABLA: weather_observations
-- ========================================
CREATE TABLE IF NOT EXISTS weather_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- =====================================
    -- CONTEXTO
    -- =====================================
    weather_alert_id UUID REFERENCES weather_alerts(id) ON DELETE SET NULL,
    weather_rule_id UUID REFERENCES weather_agricultural_rules(id) ON DELETE SET NULL,
    planting_id UUID REFERENCES plantings(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    
    observed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    observation_date DATE NOT NULL,
    
    -- =====================================
    -- ACCIÓN TOMADA
    -- =====================================
    action_taken BOOLEAN NOT NULL,
    action_type VARCHAR(50),
    action_description TEXT,
    action_cost_eur NUMERIC(8, 2),               -- Cost of protective measures
    
    -- =====================================
    -- RESULTADO OBSERVADO
    -- =====================================
    observed_outcome VARCHAR(30) NOT NULL,
    effectiveness_rating INTEGER,                -- 1-5: How effective was the action/alert
    
    -- Damage assessment
    damage_occurred BOOLEAN DEFAULT false,
    damage_severity VARCHAR(20),
    damage_type VARCHAR(50)[],
    damage_description TEXT,
    
    -- Quantified impact
    yield_loss_percent NUMERIC(5, 2),
    plants_lost_count INTEGER,
    financial_loss_eur NUMERIC(8, 2),
    
    -- =====================================
    -- COMPARACIÓN
    -- =====================================
    compared_to_no_action VARCHAR(30),           -- What would have happened without action
    would_follow_alert_again BOOLEAN,
    confidence_in_weather_effect INTEGER,        -- 1-5
    
    -- =====================================
    -- DETALLES
    -- =====================================
    notes TEXT,
    lessons_learned TEXT,
    photos JSONB,
    measured_data JSONB,
    
    -- =====================================
    -- METADATA
    -- =====================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- =====================================
    -- CONSTRAINTS
    -- =====================================
    
    CONSTRAINT weather_observations_action_type_valid CHECK (
        action_type IS NULL OR action_type IN (
            'frost_protection_installed',
            'shade_cloth_installed',
            'mulching_applied',
            'extra_watering',
            'emergency_harvest',
            'task_postponed',
            'task_expedited',
            'pesticide_application',
            'fungicide_application',
            'cover_applied',
            'windbreak_installed',
            'no_action_possible',
            'other'
        )
    ),
    
    CONSTRAINT weather_observations_outcome_valid CHECK (
        observed_outcome IN (
            'no_damage',
            'damage_avoided',
            'damage_reduced',
            'minimal_damage',
            'moderate_damage',
            'severe_damage',
            'total_loss',
            'inconclusive'
        )
    ),
    
    CONSTRAINT weather_observations_rating_valid CHECK (
        effectiveness_rating IS NULL OR (effectiveness_rating BETWEEN 1 AND 5)
    ),
    
    CONSTRAINT weather_observations_damage_severity_valid CHECK (
        damage_severity IS NULL OR damage_severity IN (
            'negligible',
            'minor',
            'moderate',
            'major',
            'catastrophic'
        )
    ),
    
    CONSTRAINT weather_observations_yield_loss_valid CHECK (
        yield_loss_percent IS NULL OR (yield_loss_percent >= 0 AND yield_loss_percent <= 100)
    ),
    
    CONSTRAINT weather_observations_plants_lost_valid CHECK (
        plants_lost_count IS NULL OR plants_lost_count >= 0
    ),
    
    CONSTRAINT weather_observations_cost_valid CHECK (
        (action_cost_eur IS NULL OR action_cost_eur >= 0) AND
        (financial_loss_eur IS NULL OR financial_loss_eur >= 0)
    ),
    
    CONSTRAINT weather_observations_comparison_valid CHECK (
        compared_to_no_action IS NULL OR compared_to_no_action IN (
            'much_better',
            'better',
            'similar',
            'worse',
            'unknown'
        )
    ),
    
    CONSTRAINT weather_observations_confidence_valid CHECK (
        confidence_in_weather_effect IS NULL OR (confidence_in_weather_effect BETWEEN 1 AND 5)
    )
);

-- =====================================
-- ÍNDICES
-- =====================================

CREATE INDEX idx_weather_observations_alert ON weather_observations(weather_alert_id);
CREATE INDEX idx_weather_observations_rule ON weather_observations(weather_rule_id);
CREATE INDEX idx_weather_observations_planting ON weather_observations(planting_id);
CREATE INDEX idx_weather_observations_task ON weather_observations(task_id);
CREATE INDEX idx_weather_observations_garden ON weather_observations(garden_id);
CREATE INDEX idx_weather_observations_observed_by ON weather_observations(observed_by);
CREATE INDEX idx_weather_observations_date ON weather_observations(observation_date);
CREATE INDEX idx_weather_observations_outcome ON weather_observations(observed_outcome);
CREATE INDEX idx_weather_observations_action_taken ON weather_observations(action_taken);

-- Índice para análisis estadístico
CREATE INDEX idx_weather_observations_analysis ON weather_observations(
    weather_rule_id, action_taken, observed_outcome
);

CREATE INDEX idx_weather_observations_damage_types ON weather_observations USING GIN(damage_type);

-- =====================================
-- TRIGGER
-- =====================================

CREATE TRIGGER update_weather_observations_updated_at
    BEFORE UPDATE ON weather_observations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar success_rate en weather_agricultural_rules
CREATE OR REPLACE FUNCTION update_weather_rule_success_rate()
RETURNS TRIGGER AS $$
DECLARE
    v_success_count INTEGER;
    v_total_count INTEGER;
    v_success_rate NUMERIC(5, 2);
BEGIN
    IF NEW.weather_rule_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_success_count
        FROM weather_observations
        WHERE weather_rule_id = NEW.weather_rule_id
          AND action_taken = true
          AND observed_outcome IN ('no_damage', 'damage_avoided', 'damage_reduced', 'minimal_damage');
        
        SELECT COUNT(*) INTO v_total_count
        FROM weather_observations
        WHERE weather_rule_id = NEW.weather_rule_id
          AND action_taken = true;
        
        IF v_total_count > 0 THEN
            v_success_rate := (v_success_count::NUMERIC / v_total_count::NUMERIC) * 100;
            
            UPDATE weather_agricultural_rules
            SET success_rate_percent = v_success_rate
            WHERE id = NEW.weather_rule_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_weather_rule_success_rate
    AFTER INSERT OR UPDATE ON weather_observations
    FOR EACH ROW
    WHEN (NEW.weather_rule_id IS NOT NULL)
    EXECUTE FUNCTION update_weather_rule_success_rate();

COMMENT ON TABLE weather_observations IS 'User observations of weather event outcomes and action effectiveness';
COMMENT ON COLUMN weather_observations.action_cost_eur IS 'Cost of protective measures taken (labor + materials)';
COMMENT ON COLUMN weather_observations.financial_loss_eur IS 'Estimated financial loss from weather damage';

-- ========================================
-- TABLA: weather_api_requests (Gestión de APIs)
-- ========================================
CREATE TABLE IF NOT EXISTS weather_api_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    weather_location_id UUID NOT NULL REFERENCES weather_locations(id) ON DELETE CASCADE,
    
    -- =====================================
    -- REQUEST
    -- =====================================
    request_type VARCHAR(20) NOT NULL,           -- forecast, historical, current
    request_url TEXT,
    request_params JSONB,
    
    -- =====================================
    -- RESPONSE
    -- =====================================
    response_status_code INTEGER,
    response_data JSONB,
    response_time_ms INTEGER,
    
    -- =====================================
    -- API INFO
    -- =====================================
    api_provider VARCHAR(50) NOT NULL,
    api_endpoint VARCHAR(200),
    api_key_used VARCHAR(50),                    -- Identifier, not actual key
    
    -- =====================================
    -- RESULTADO
    -- =====================================
    was_successful BOOLEAN NOT NULL,
    error_message TEXT,
    data_points_returned INTEGER,
    
    -- =====================================
    -- RATE LIMITING
    -- =====================================
    rate_limit_remaining INTEGER,
    rate_limit_reset_at TIMESTAMP WITH TIME ZONE,
    
    -- =====================================
    -- COST TRACKING
    -- =====================================
    estimated_cost_usd NUMERIC(8, 4),
    
    -- =====================================
    -- METADATA
    -- =====================================
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT weather_api_request_type_valid CHECK (
        request_type IN ('current', 'forecast', 'historical', 'alerts')
    ),
    
    CONSTRAINT weather_api_provider_valid CHECK (
        api_provider IN (
            'openweathermap',
            'weatherapi',
            'meteostat',
            'visualcrossing',
            'tomorrow_io',
            'aeris_weather',
            'aemet',  -- Spanish met office
            'manual_entry',
            'other'
        )
    )
);

CREATE INDEX idx_weather_api_location ON weather_api_requests(weather_location_id);
CREATE INDEX idx_weather_api_provider ON weather_api_requests(api_provider);
CREATE INDEX idx_weather_api_requested_at ON weather_api_requests(requested_at);
CREATE INDEX idx_weather_api_success ON weather_api_requests(was_successful);

COMMENT ON TABLE weather_api_requests IS 'Log of weather API requests for rate limiting and cost tracking';

CREATE OR REPLACE FUNCTION generate_weather_alerts_from_forecast(
    p_weather_location_id UUID,
    p_forecast_date DATE
)
RETURNS TABLE (
    alert_id UUID,
    alert_type VARCHAR,
    severity VARCHAR
) AS $$
DECLARE
    v_forecast RECORD;
    v_garden RECORD;
    v_alert_id UUID;
BEGIN
    -- Obtener forecast
    SELECT * INTO v_forecast
    FROM weather_daily
    WHERE weather_location_id = p_weather_location_id
      AND weather_date = p_forecast_date
      AND data_type = 'forecast'
    ORDER BY forecast_generated_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Iterar sobre huertas en esta ubicación
    FOR v_garden IN 
        SELECT * FROM gardens 
        WHERE weather_location_id = p_weather_location_id AND is_active = true
    LOOP
        -- Alerta de helada
        IF v_forecast.had_frost OR v_forecast.frost_risk_score >= 7 THEN
            INSERT INTO weather_alerts (
                garden_id,
                weather_location_id,
                weather_daily_id,
                alert_date,
                event_start_date,
                lead_time_hours,
                alert_type,
                severity_level,
                confidence_level,
                title,
                description,
                recommended_actions,
                affected_planting_ids
            ) VALUES (
                v_garden.id,
                p_weather_location_id,
                v_forecast.id,
                CURRENT_DATE,
                p_forecast_date,
                EXTRACT(EPOCH FROM (p_forecast_date - CURRENT_DATE)) / 3600,
                'frost',
                CASE 
                    WHEN v_forecast.temp_min_c < -5 THEN 'critical'
                    WHEN v_forecast.temp_min_c < -2 THEN 'warning'
                    ELSE 'watch'
                END,
                CASE 
                    WHEN v_forecast.days_ahead <= 1 THEN 'very_high'
                    WHEN v_forecast.days_ahead <= 3 THEN 'high'
                    ELSE 'medium'
                END,
                format('Frost Warning: %s°C expected', v_forecast.temp_min_c),
                format('Temperatures are forecast to drop to %s°C on %s. Frost-sensitive plants may be damaged.', 
                    v_forecast.temp_min_c, p_forecast_date),
                ARRAY[
                    'Cover sensitive plants with frost cloth',
                    'Water plants before nightfall',
                    'Move potted plants indoors',
                    'Harvest frost-sensitive crops early'
                ],
                (SELECT ARRAY_AGG(id) FROM plantings 
                 WHERE garden_id = v_garden.id 
                   AND status IN ('growing', 'flowering', 'fruiting')
                   AND is_active = true)
            )
            RETURNING id INTO v_alert_id;
            
            RETURN QUERY SELECT v_alert_id, 'frost'::VARCHAR, 
                CASE 
                    WHEN v_forecast.temp_min_c < -5 THEN 'critical'
                    WHEN v_forecast.temp_min_c < -2 THEN 'warning'
                    ELSE 'watch'
                END::VARCHAR;
        END IF;
        
        -- Alerta de ola de calor
        IF v_forecast.had_heatwave OR v_forecast.heat_stress_score >= 7 THEN
            INSERT INTO weather_alerts (
                garden_id,
                weather_location_id,
                weather_daily_id,
                alert_date,
                event_start_date,
                alert_type,
                severity_level,
                title,
                description,
                recommended_actions
            ) VALUES (
                v_garden.id,
                p_weather_location_id,
                v_forecast.id,
                CURRENT_DATE,
                p_forecast_date,
                'heatwave',
                CASE 
                    WHEN v_forecast.temp_max_c > 40 THEN 'critical'
                    WHEN v_forecast.temp_max_c > 36 THEN 'warning'
                    ELSE 'advisory'
                END,
                format('Heat Warning: %s°C expected', v_forecast.temp_max_c),
                format('Extreme heat up to %s°C forecast for %s.', v_forecast.temp_max_c, p_forecast_date),
                ARRAY[
                    'Increase watering frequency',
                    'Install shade cloth',
                    'Water early morning or late evening',
                    'Mulch to retain soil moisture'
                ]
            )
            RETURNING id INTO v_alert_id;
            
            RETURN QUERY SELECT v_alert_id, 'heatwave'::VARCHAR,
                CASE 
                    WHEN v_forecast.temp_max_c > 40 THEN 'critical'
                    WHEN v_forecast.temp_max_c > 36 THEN 'warning'
                    ELSE 'advisory'
                END::VARCHAR;
        END IF;
        
        -- Alerta de lluvia intensa
        IF v_forecast.had_heavy_rain OR (v_forecast.precipitation_mm > 30) THEN
            INSERT INTO weather_alerts (
                garden_id,
                weather_location_id,
                weather_daily_id,
                alert_date,
                event_start_date,
                alert_type,
                severity_level,
                title,
                description,
                recommended_actions
            ) VALUES (
                v_garden.id,
                p_weather_location_id,
                v_forecast.id,
                CURRENT_DATE,
                p_forecast_date,
                'heavy_rain',
                CASE 
                    WHEN v_forecast.precipitation_mm > 50 THEN 'warning'
                    ELSE 'watch'
                END,
                format('Heavy Rain: %smm expected', v_forecast.precipitation_mm),
                format('Heavy rainfall of %smm forecast for %s. Risk of waterlogging.', 
                    v_forecast.precipitation_mm, p_forecast_date),
                ARRAY[
                    'Ensure drainage is clear',
                    'Delay watering',
                    'Protect young seedlings',
                    'Postpone fungicide applications'
                ]
            )
            RETURNING id INTO v_alert_id;
            
            RETURN QUERY SELECT v_alert_id, 'heavy_rain'::VARCHAR,
                CASE 
                    WHEN v_forecast.precipitation_mm > 50 THEN 'warning'
                    ELSE 'watch'
                END::VARCHAR;
        END IF;
        
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_weather_alerts_from_forecast IS 'Auto-generate weather alerts from forecast data';

COMMIT;
