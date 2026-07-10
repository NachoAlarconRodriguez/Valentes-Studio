-- 1. ADD DEPOSIT (ABONO) COLUMNS TO BOOKINGS TABLE
-- Run this in the Supabase SQL Editor to add deposit support

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS abono_transferido BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS abono_confirmado BOOLEAN DEFAULT false;
