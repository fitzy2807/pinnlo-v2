-- Alternative: Create proper test data for authenticated user
-- Run this in Supabase SQL Editor

-- 1. Re-enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- 2. Get your current user ID
SELECT auth.uid() as your_user_id;

-- 3. Create a new test strategy owned by you
INSERT INTO strategies (title, description, "userId") 
VALUES (
  'My Authenticated Test Strategy', 
  'Testing with proper RLS and authentication', 
  auth.uid()
);

-- 4. Get the ID of the new strategy
SELECT id, title, "userId" FROM strategies WHERE title = 'My Authenticated Test Strategy';

-- 5. Test that you can access it
SELECT id, title FROM strategies WHERE "userId" = auth.uid();