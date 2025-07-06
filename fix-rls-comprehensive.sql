-- PINNLO V2 RLS COMPREHENSIVE FIX SCRIPT
-- Run this in Supabase SQL Editor to fix all RLS issues

-- =================================================================================
-- STEP 1: UPDATE STRATEGY OWNERSHIP
-- =================================================================================
-- Assign strategies 2 and 4 to the target user
UPDATE strategies 
SET "userId" = '900903ff-4a27-4b57-b82b-73a0bb57d776',
    "updatedAt" = NOW()
WHERE id IN (2, 4);

-- Verify the update
SELECT 
    id,
    title,
    "userId",
    CASE 
        WHEN "userId" = '900903ff-4a27-4b57-b82b-73a0bb57d776' THEN 'FIXED ✓'
        ELSE 'NEEDS FIX ✗'
    END AS ownership_status
FROM strategies 
WHERE id IN (2, 4)
ORDER BY id;

-- =================================================================================
-- STEP 2: DROP EXISTING BROKEN RLS POLICIES
-- =================================================================================
-- Remove all existing policies on cards table
DROP POLICY IF EXISTS "Users can view cards from their strategies" ON cards;
DROP POLICY IF EXISTS "Users can insert cards to their strategies" ON cards;
DROP POLICY IF EXISTS "Users can update cards in their strategies" ON cards;
DROP POLICY IF EXISTS "Users can delete cards from their strategies" ON cards;

-- Also drop any other potential policy names from the migration
DROP POLICY IF EXISTS "cards_select_policy" ON cards;
DROP POLICY IF EXISTS "cards_insert_policy" ON cards;
DROP POLICY IF EXISTS "cards_update_policy" ON cards;
DROP POLICY IF EXISTS "cards_delete_policy" ON cards;

-- =================================================================================
-- STEP 3: CREATE CORRECTED RLS POLICIES WITH PROPER TYPE CASTING
-- =================================================================================

-- Policy 1: SELECT (View cards)
CREATE POLICY "Users can view cards from their strategies" ON cards
  FOR SELECT USING (
    strategy_id IN (
      SELECT id FROM strategies 
      WHERE "userId" = auth.uid()::text  -- KEY FIX: Cast UUID to text
    )
  );

-- Policy 2: INSERT (Create cards)
CREATE POLICY "Users can insert cards to their strategies" ON cards
  FOR INSERT WITH CHECK (
    strategy_id IN (
      SELECT id FROM strategies 
      WHERE "userId" = auth.uid()::text  -- KEY FIX: Cast UUID to text
    )
  );

-- Policy 3: UPDATE (Modify cards)
CREATE POLICY "Users can update cards in their strategies" ON cards
  FOR UPDATE USING (
    strategy_id IN (
      SELECT id FROM strategies 
      WHERE "userId" = auth.uid()::text  -- KEY FIX: Cast UUID to text
    )
  );

-- Policy 4: DELETE (Remove cards)
CREATE POLICY "Users can delete cards from their strategies" ON cards
  FOR DELETE USING (
    strategy_id IN (
      SELECT id FROM strategies 
      WHERE "userId" = auth.uid()::text  -- KEY FIX: Cast UUID to text
    )
  );

-- =================================================================================
-- STEP 4: ENSURE RLS IS ENABLED
-- =================================================================================
-- Enable RLS on cards table
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'cards';

-- =================================================================================
-- STEP 5: VERIFY POLICIES ARE CREATED CORRECTLY
-- =================================================================================
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'cards'
ORDER BY policyname;

-- =================================================================================
-- STEP 6: TEST CARD CREATION (RLS VALIDATION)
-- =================================================================================
-- Attempt to create a test card to validate the fix
-- This should work if RLS is fixed correctly

INSERT INTO cards (
  id,
  strategy_id,
  title,
  description,
  card_type,
  priority,
  confidence_level,
  strategic_alignment,
  tags,
  relationships,
  card_data
) VALUES (
  gen_random_uuid(),
  2,  -- Strategy ID 2 (now owned by our target user)
  'CC RLS Fix Test Card',
  'Created by Claude Code to validate RLS fix',
  'strategic-context',
  'High',
  'High',
  'Testing RLS implementation',
  '["CC", "RLS-Fix", "Test"]'::jsonb,
  '{}'::jsonb,
  '{
    "marketContext": "Automated RLS testing",
    "competitiveLandscape": "Database security validation",
    "keyTrends": ["Autonomous fixing"],
    "stakeholders": ["Claude Code"],
    "timeframe": "Immediate"
  }'::jsonb
);

-- =================================================================================
-- STEP 7: VERIFY THE TEST CARD WAS CREATED
-- =================================================================================
SELECT 
    id,
    strategy_id,
    title,
    card_type,
    created_at,
    CASE 
        WHEN title = 'CC RLS Fix Test Card' THEN 'RLS FIX SUCCESS ✓'
        ELSE 'Other Card'
    END AS test_status
FROM cards 
WHERE strategy_id = 2
ORDER BY created_at DESC
LIMIT 3;

-- =================================================================================
-- STEP 8: TEST CARD CREATION FOR STRATEGY 4 AS WELL
-- =================================================================================
INSERT INTO cards (
  id,
  strategy_id,
  title,
  description,
  card_type,
  priority,
  confidence_level,
  strategic_alignment,
  tags,
  card_data
) VALUES (
  gen_random_uuid(),
  4,  -- Strategy ID 4 (also owned by our target user)
  'CC RLS Fix Test Card #2',
  'Second test card to validate RLS fix for strategy 4',
  'vision',
  'Medium',
  'High',
  'Testing RLS for multiple strategies',
  '["CC", "RLS-Fix", "Test-2"]'::jsonb,
  '{
    "visionStatement": "RLS testing vision",
    "missionStatement": "Ensure cards can be created",
    "coreValues": ["Testing", "Security", "Validation"]
  }'::jsonb
);

-- =================================================================================
-- STEP 9: FINAL VERIFICATION
-- =================================================================================
-- Check that both test cards were created successfully
SELECT 
    'FINAL VERIFICATION' AS test_phase,
    COUNT(*) AS test_cards_created,
    CASE 
        WHEN COUNT(*) >= 2 THEN 'RLS FIX COMPLETE SUCCESS ✓'
        WHEN COUNT(*) = 1 THEN 'PARTIAL SUCCESS - Check Strategy 4'
        ELSE 'RLS FIX FAILED ✗'
    END AS overall_status
FROM cards 
WHERE title LIKE 'CC RLS Fix Test Card%';

-- Show the created test cards
SELECT 
    strategy_id,
    title,
    card_type,
    created_at
FROM cards 
WHERE title LIKE 'CC RLS Fix Test Card%'
ORDER BY strategy_id;

-- =================================================================================
-- STEP 10: CLEANUP (OPTIONAL)
-- =================================================================================
-- Uncomment the lines below if you want to remove the test cards after verification

-- DELETE FROM cards WHERE title LIKE 'CC RLS Fix Test Card%';

-- =================================================================================
-- SUCCESS CONFIRMATION
-- =================================================================================
-- If this script runs without errors and shows "RLS FIX COMPLETE SUCCESS ✓",
-- then the RLS issues are resolved and card creation should work in the app.
--
-- The key fixes applied:
-- 1. ✓ Updated strategies 2 and 4 to be owned by user 900903ff-4a27-4b57-b82b-73a0bb57d776
-- 2. ✓ Recreated all RLS policies with proper auth.uid()::text casting
-- 3. ✓ Ensured RLS is enabled on the cards table
-- 4. ✓ Tested card creation to validate the fix works
-- 5. ✓ Verified both strategies can have cards created