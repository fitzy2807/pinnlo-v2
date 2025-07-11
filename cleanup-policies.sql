-- Clean up conflicting RLS policies
-- Remove the old policy that references 'created_by' column

-- Drop the conflicting policy
DROP POLICY IF EXISTS "Users can only see their own strategies" ON strategies;

-- Verify only our correct policies remain
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'strategies';

-- Check if there are any strategies and who owns them
SELECT 
  id, 
  title, 
  "userId",
  "createdAt"
FROM strategies 
ORDER BY "createdAt" DESC
LIMIT 10;

-- Show current authenticated user ID for debugging
SELECT auth.uid() as current_user_id;
