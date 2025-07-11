-- Fix RLS policies for strategies table
-- This script will enable authenticated users to access their own strategies

-- Enable RLS on strategies table (if not already enabled)
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can insert their own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can update their own strategies" ON strategies;
DROP POLICY IF EXISTS "Users can delete their own strategies" ON strategies;

-- Create new RLS policies for strategies table
CREATE POLICY "Users can view their own strategies" ON strategies
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own strategies" ON strategies
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own strategies" ON strategies
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own strategies" ON strategies
  FOR DELETE USING (auth.uid()::text = "userId");

-- Check if there are any strategies and show their ownership
SELECT 
  id, 
  title, 
  "userId", 
  CASE 
    WHEN "userId" IS NULL THEN 'No owner'
    ELSE 'Has owner'
  END as ownership_status
FROM strategies 
LIMIT 10;

-- Show current user (for debugging)
SELECT auth.uid() as current_user_id;

-- Grant basic table permissions to authenticated role (this should already exist but let's be sure)
GRANT SELECT, INSERT, UPDATE, DELETE ON strategies TO authenticated;

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'strategies';
