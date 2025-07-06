-- Fix RLS policies to work with current authentication
-- Run this in Supabase SQL Editor

-- 1. Re-enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- 2. Check current user authentication
SELECT auth.uid() as current_user_id;

-- 3. Update strategies to have proper user ownership
-- First, let's see what we have
SELECT id, title, "userId" FROM strategies;

-- 4. Update the strategy to be owned by current authenticated user
UPDATE strategies 
SET "userId" = auth.uid()
WHERE id = 2;  -- Your test strategy

-- 5. Verify the update worked
SELECT id, title, "userId" FROM strategies WHERE id = 2;

-- 6. Test card access with RLS enabled
SELECT count(*) as card_count FROM cards WHERE strategy_id = 2;