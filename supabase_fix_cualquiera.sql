-- ============================================================
-- Fix: Reasignar reservas con "Cualquiera" a Jefito Lopes
-- Ejecutar en el Editor SQL de Supabase Dashboard
-- ============================================================

-- 1. Ver cuántas reservas serán afectadas (previsualización)
SELECT id, specialist_name, date, time, service_name, status
FROM bookings
WHERE specialist_name ILIKE 'cualquiera'
   OR specialist_name ILIKE 'sin asignar'
ORDER BY date, time;

-- 2. Ejecutar la reasignación
-- NOTA: Verifica el nombre exacto del especialista en tu tabla 'specialists'
-- corriendo: SELECT id, name FROM specialists WHERE name ILIKE '%jef%';

UPDATE bookings
SET specialist_name = 'Jefito Lopes'   -- <- Ajusta al nombre exacto que figura en tu DB
WHERE specialist_name ILIKE 'cualquiera'
   OR specialist_name ILIKE 'sin asignar';

-- 3. Verificar que quedó todo correcto
SELECT id, specialist_name, date, time, service_name, status
FROM bookings
WHERE specialist_name = 'Jefito Lopes'
ORDER BY date DESC, time;
