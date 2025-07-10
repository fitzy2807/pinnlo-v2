-- PHASE 1: Pre-requisites Check
-- Check what AI tables already exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%ai%'
ORDER BY table_name;

-- Check if ai_preferences exists and its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ai_preferences'
ORDER BY ordinal_position;

-- Check if ai_generation_rules exists and its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ai_generation_rules'
ORDER BY ordinal_position;

-- Check if ai_automation_executions exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ai_automation_executions'
ORDER BY ordinal_position;

-- Check if ai_usage exists and its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ai_usage'
ORDER BY ordinal_position;

-- Check existing functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%automation%' 
OR routine_name LIKE '%next_run%';