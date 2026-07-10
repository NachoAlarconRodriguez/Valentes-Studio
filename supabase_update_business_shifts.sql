-- 1. Add business column to work_shifts table with default value 'todos'
ALTER TABLE work_shifts ADD COLUMN IF NOT EXISTS business TEXT NOT NULL DEFAULT 'todos';

-- 2. Drop the old unique constraint (which was only specialist_id + day_of_week)
ALTER TABLE work_shifts DROP CONSTRAINT IF EXISTS work_shifts_specialist_id_day_of_week_key;

-- 3. Add the new unique constraint including the business column
ALTER TABLE work_shifts ADD CONSTRAINT work_shifts_specialist_id_day_of_week_business_key UNIQUE (specialist_id, day_of_week, business);

-- 4. Force Supabase API to reload schema cache
NOTIFY pgrst, 'reload schema';

