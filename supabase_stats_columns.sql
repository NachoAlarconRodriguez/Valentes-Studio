-- 1. ADD STATS COLUMNS TO CLIENTS TABLE
-- Run this in the Supabase SQL Editor to add native count support

ALTER TABLE clients ADD COLUMN IF NOT EXISTS cancellations_count INTEGER DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS no_shows_count INTEGER DEFAULT 0;
