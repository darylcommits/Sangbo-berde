-- Import existing citizen reports data
-- Run this in your Supabase SQL editor

-- First, let's check if the data already exists
SELECT COUNT(*) as existing_reports FROM citizen_reports;

-- If you want to insert the sample data (only if it doesn't exist)
INSERT INTO "public"."citizen_reports" (
  "id", 
  "reporter_id", 
  "report_type", 
  "title", 
  "description", 
  "location_lat", 
  "location_lng", 
  "address", 
  "status", 
  "assigned_to", 
  "priority", 
  "photos", 
  "created_at", 
  "updated_at"
) VALUES 
  (
    '3c2c1ffb-08c8-496f-930e-64a279ffd763', 
    'b83c42fa-5794-4933-8838-be0d06b5ad1b', 
    'missed_collection', 
    'Nakalimutan', 
    'Sample', 
    null, 
    null, 
    'Ilocos Sur', 
    'pending', 
    null, 
    'urgent', 
    null, 
    '2025-09-28 14:50:03.824313+00', 
    '2025-09-28 14:50:03.824313+00'
  ), 
  (
    'fd81c042-9f7b-4e4a-b60a-ec042005bfd4', 
    'b83c42fa-5794-4933-8838-be0d06b5ad1b', 
    'missed_collection', 
    'Sample', 
    'Sample', 
    null, 
    null, 
    'Sample', 
    'pending', 
    null, 
    'low', 
    null, 
    '2025-09-28 15:30:58.485281+00', 
    '2025-09-28 15:30:58.485281+00'
  )
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 
  id,
  report_type,
  title,
  status,
  priority,
  created_at
FROM citizen_reports 
ORDER BY created_at DESC;
