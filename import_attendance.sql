-- This script helps you import existing attendance data into your Supabase database.
-- It includes checks to prevent duplicate insertions and provides verification queries.

-- IMPORTANT: Before running this script, ensure you have:
-- 1. Connected to your Supabase project's SQL Editor.
-- 2. Created the 'attendance' table as defined in DATABASE_SETUP.md.
-- 3. Enabled Row Level Security (RLS) for the 'attendance' table.
-- 4. Created the RLS policies for 'attendance' as defined in DATABASE_SETUP.md.

-- Step 1: Verify the 'attendance' table exists
SELECT 'Verifying attendance table existence...' AS status;
SELECT * FROM information_schema.tables WHERE table_name = 'attendance';

-- If the above query returns no rows, the table does not exist.
-- Please create it using the schema in DATABASE_SETUP.md before proceeding.

-- Step 2: Insert your provided sample data
-- This INSERT statement uses ON CONFLICT DO NOTHING to prevent errors if the rows already exist.
-- Adjust the 'staff_id' to match existing user IDs in your 'profiles' table if necessary.

SELECT 'Attempting to insert sample attendance records...' AS status;

INSERT INTO "public"."attendance" ("id", "staff_id", "check_in", "check_out", "location_lat", "location_lng", "status", "notes", "created_at") VALUES 
('3d7a363e-ed17-4e68-940f-cce08999ed53', '59444240-51b4-4793-bbad-a910233d7cd5', '2025-09-28 15:04:37.894+00', null, '17.87', '120.46', 'present', null, '2025-09-28 15:04:38.010729+00'), 
('6acd3cfb-9106-4a3d-8181-b3a9061ce5e7', '59444240-51b4-4793-bbad-a910233d7cd5', '2025-09-28 15:16:22.633+00', null, '17.87', '120.46', 'present', null, '2025-09-28 15:16:22.868503+00'), 
('6b7ab0c9-687d-4c37-b02c-ceb60d10d6ab', '59444240-51b4-4793-bbad-a910233d7cd5', '2025-09-28 15:05:01.525+00', null, null, null, 'present', null, '2025-09-28 15:05:01.564728+00'), 
('9e3115c9-894b-4bf9-ae1b-7bad3e07df0f', '59444240-51b4-4793-bbad-a910233d7cd5', '2025-09-28 15:04:37.894+00', null, '17.87', '120.46', 'present', null, '2025-09-28 15:04:38.025433+00'), 
('ad086c67-d0f3-46e1-bbbd-8016d233029b', '59444240-51b4-4793-bbad-a910233d7cd5', '2025-09-28 15:04:37.894+00', null, '17.87', '120.46', 'present', null, '2025-09-28 15:04:38.013713+00'), 
('f560d3d6-be50-423f-b713-137cec3bd8c6', 'bcbcba73-828b-493c-8608-e0d283af0534', '2025-09-28 15:47:34.625+00', null, '17.87', '120.46', 'present', null, '2025-09-28 15:47:34.860581+00')
ON CONFLICT (id) DO NOTHING;

SELECT 'Sample attendance records insertion attempt complete.' AS status;

-- Step 3: Verify the inserted data
SELECT 'Verifying inserted attendance records...' AS status;
SELECT id, staff_id, check_in, check_out, status, created_at FROM public.attendance ORDER BY created_at DESC;

-- Step 4: Check RLS policies (optional, but good for troubleshooting)
-- This query will show if RLS is enabled and what policies are active for the table.
SELECT 'Checking RLS policies for attendance...' AS status;
SELECT * FROM pg_policies WHERE tablename = 'attendance';

-- If you encounter RLS errors, ensure your RLS policies are correctly set up
-- as per DATABASE_SETUP.md, especially for the 'staff_id' and 'auth.uid()' checks.

-- Step 5: Test the attendance system
-- This query shows attendance records with staff information
SELECT 'Testing attendance system with staff info...' AS status;
SELECT 
  a.id,
  a.staff_id,
  a.check_in,
  a.check_out,
  a.status,
  a.location_lat,
  a.location_lng,
  p.full_name as staff_name,
  p.role as staff_role
FROM attendance a
LEFT JOIN profiles p ON a.staff_id = p.id
ORDER BY a.created_at DESC;
