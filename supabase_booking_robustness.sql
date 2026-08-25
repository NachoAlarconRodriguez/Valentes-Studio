-- ============================================================
-- SCRIPT DE BLINDAJE Y ROBUSTEZ DEL SISTEMA DE AGENDAMIENTO
-- Ejecutar en el Editor SQL de Supabase Dashboard
-- ============================================================

-- 1. Añadir columna specialist_id a la tabla bookings si no existe
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS specialist_id TEXT;

-- 2. Migrar y mapear specialist_id en todas las reservas históricas
UPDATE bookings b
SET specialist_id = s.id
FROM specialists s
WHERE LOWER(TRIM(b.specialist_name)) = LOWER(TRIM(s.name))
  AND (b.specialist_id IS NULL OR b.specialist_id = '');

-- Fallback para reservas con nombres especiales o asignaciones directas
UPDATE bookings
SET specialist_id = (SELECT id FROM specialists LIMIT 1)
WHERE (specialist_id IS NULL OR specialist_id = '')
  AND specialist_name ILIKE '%jef%';

-- 3. Crear índices para optimizar consultas de disponibilidad y colisiones
CREATE INDEX IF NOT EXISTS idx_bookings_date_specialist_id ON bookings(date, specialist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_specialist_name ON bookings(date, specialist_name);
CREATE INDEX IF NOT EXISTS idx_bookings_active_slots ON bookings(date, specialist_name, status);

-- 4. Recrear la vista de administración admin_bookings con specialist_id y campos de abono
CREATE OR REPLACE VIEW admin_bookings AS
SELECT 
  b.id,
  b.client_phone,
  c.name as client_name,
  c.email as client_email,
  b.category,
  b.service_name,
  b.price,
  b.specialist_name,
  b.specialist_id,
  b.date,
  b.time,
  b.channel,
  b.status,
  b.created_at,
  b.gift_card_used,
  b.abono_transferido,
  b.abono_confirmado,
  b.metodo_pago
FROM bookings b
LEFT JOIN clients c ON b.client_phone = c.phone;

-- 5. Recrear la vista pública public_bookings con SECURITY DEFINER (security_invoker = false)
-- Esto permite que los clientes públicos ('anon') consulten los bloques ocupados
-- sin exponer datos personales de clientes (nombres, teléfonos, emails)
DROP VIEW IF EXISTS public_bookings CASCADE;

CREATE VIEW public_bookings 
WITH (security_invoker = false)
AS
SELECT 
  id, 
  specialist_id,
  specialist_name, 
  date, 
  time, 
  service_name, 
  status
FROM bookings
WHERE status NOT IN ('cancelado', 'no_llego');

-- 6. Otorgar permisos de lectura a la vista pública para usuarios anónimos y autenticados
GRANT SELECT ON public_bookings TO anon, authenticated;
GRANT SELECT ON admin_bookings TO authenticated;

-- 7. Consulta de verificación: Listar reservas para comprobar que specialist_id quedó asignado
SELECT id, specialist_id, specialist_name, date, time, service_name, status
FROM bookings
ORDER BY date DESC, time DESC
LIMIT 10;
