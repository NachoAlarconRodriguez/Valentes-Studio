-- ==============================================================================
-- Migración: Control de Acceso y Permisos para Profesionales
-- ==============================================================================

-- 1. Control de Acceso al Panel de Administración (/admin)
ALTER TABLE specialists ADD COLUMN IF NOT EXISTS can_access_admin BOOLEAN DEFAULT TRUE;
UPDATE specialists SET can_access_admin = TRUE WHERE can_access_admin IS NULL;

-- 2. Permiso para Bloquear / Desbloquear Horarios en la Agenda
ALTER TABLE specialists ADD COLUMN IF NOT EXISTS can_block_schedule BOOLEAN DEFAULT TRUE;
UPDATE specialists SET can_block_schedule = TRUE WHERE can_block_schedule IS NULL;
