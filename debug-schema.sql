-- DEBUG: Check your current table schemas
-- Run this in Supabase SQL Editor to identify the type mismatches

-- 1. Check strategies table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'strategies' 
ORDER BY ordinal_position;

-- 2. Check if cards table already exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cards' 
ORDER BY ordinal_position;

-- 3. Check auth.users table structure (the problem might be here)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users' 
ORDER BY ordinal_position;

-- 4. Show all foreign key constraints on strategies table
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    kcu.data_type,
    ccu2.data_type AS foreign_data_type
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.columns AS ccu2
    ON ccu2.table_name = ccu.table_name 
    AND ccu2.column_name = ccu.column_name
    AND ccu2.table_schema = ccu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'strategies';
