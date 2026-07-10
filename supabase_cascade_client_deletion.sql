-- 1. Drop the existing restricted foreign key constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_client;

-- 2. Re-create the constraint with ON DELETE CASCADE to allow deletion of clients
ALTER TABLE bookings 
  ADD CONSTRAINT fk_bookings_client 
  FOREIGN KEY (client_phone) REFERENCES clients(phone) 
  ON UPDATE CASCADE ON DELETE CASCADE;

-- 3. Force Supabase API to reload schema cache
NOTIFY pgrst, 'reload schema';
