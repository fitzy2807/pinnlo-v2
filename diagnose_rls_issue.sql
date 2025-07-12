-- Step 1: Check strategies table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'strategies' 
ORDER BY ordinal_position;

-- Step 2: Check current user authentication
SELECT 
    auth.uid() as current_user_id,
    pg_typeof(auth.uid()) as user_id_type;

-- Step 3: Check RLS policies on strategies table
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
WHERE tablename = 'strategies';

-- Step 4: Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'strategies';
