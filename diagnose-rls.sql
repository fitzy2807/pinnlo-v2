-- PINNLO V2 RLS DIAGNOSTIC SCRIPT
-- Run this in Supabase SQL Editor to diagnose RLS issues

-- =================================================================================
-- 1. CHECK CURRENT STRATEGY OWNERSHIP
-- =================================================================================
SELECT 
    id,
    title,
    "userId",
    "createdAt",
    "updatedAt"
FROM strategies 
WHERE id IN (2, 4)
ORDER BY id;

-- Expected: Should show strategies 2 and 4, check if userId = '900903ff-4a27-4b57-b82b-73a0bb57d776'

-- =================================================================================
-- 2. CHECK ALL STRATEGIES FOR CONTEXT
-- =================================================================================
SELECT 
    id,
    title,
    "userId",
    CASE 
        WHEN "userId" = '900903ff-4a27-4b57-b82b-73a0bb57d776' THEN 'TARGET USER ✓'
        ELSE 'Different User'
    END AS ownership_status
FROM strategies 
ORDER BY id;

-- =================================================================================
-- 3. EXAMINE CARDS TABLE STRUCTURE
-- =================================================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cards' 
ORDER BY ordinal_position;

-- =================================================================================
-- 4. CHECK CURRENT RLS POLICIES ON CARDS TABLE
-- =================================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'cards'
ORDER BY policyname;

-- =================================================================================
-- 5. CHECK IF RLS IS ENABLED
-- =================================================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('cards', 'strategies');

-- =================================================================================
-- 6. TEST CURRENT USER CONTEXT (simulated)
-- =================================================================================
-- This shows what auth.uid() returns and its type
SELECT 
    auth.uid() as current_user_id,
    pg_typeof(auth.uid()) as auth_uid_type,
    pg_typeof('900903ff-4a27-4b57-b82b-73a0bb57d776'::text) as varchar_type,
    auth.uid()::text as auth_uid_as_text,
    CASE 
        WHEN auth.uid()::text = '900903ff-4a27-4b57-b82b-73a0bb57d776' THEN 'MATCH ✓'
        ELSE 'NO MATCH ✗'
    END as type_cast_test;

-- =================================================================================
-- 7. CHECK FOR EXISTING CARDS (if any)
-- =================================================================================
SELECT 
    id,
    strategy_id,
    title,
    card_type,
    created_at
FROM cards 
ORDER BY created_at DESC
LIMIT 5;

-- =================================================================================
-- 8. VERIFY STRATEGIES TABLE FOREIGN KEY CONSTRAINTS
-- =================================================================================
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('cards', 'strategies');

-- =================================================================================
-- DIAGNOSTIC SUMMARY
-- =================================================================================
-- After running this script, check:
-- 1. Do strategies 2 and 4 have the correct userId?
-- 2. Are there RLS policies on the cards table?
-- 3. Do the policies correctly cast auth.uid() to text?
-- 4. Is RLS enabled on both tables?
-- 5. Does auth.uid() match the expected user ID when cast to text?