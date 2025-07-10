-- PHASE 1 VERIFICATION SCRIPT
-- Run this after applying the migration to verify everything is set up correctly

-- 1. Verify all tables exist
SELECT 'Tables Check' as check_type, table_name, 
  CASE WHEN table_name IS NOT NULL THEN '✅ Exists' ELSE '❌ Missing' END as status
FROM (
  SELECT table_name FROM information_schema.tables 
  WHERE table_name IN ('ai_generation_rules', 'ai_automation_executions', 'ai_usage', 'ai_preferences')
) t
ORDER BY table_name;

-- 2. Verify automation columns in ai_generation_rules
SELECT 'Automation Columns' as check_type, column_name, data_type,
  CASE WHEN column_name IS NOT NULL THEN '✅ Exists' ELSE '❌ Missing' END as status
FROM information_schema.columns 
WHERE table_name = 'ai_generation_rules' 
AND column_name IN ('automation_enabled', 'schedule_frequency', 'next_run_at', 
                    'intelligence_categories', 'target_groups', 'optimization_level', 
                    'max_cards_per_run')
ORDER BY column_name;

-- 3. Verify functions exist
SELECT 'Functions Check' as check_type, routine_name,
  CASE WHEN routine_name IS NOT NULL THEN '✅ Exists' ELSE '❌ Missing' END as status
FROM information_schema.routines 
WHERE routine_name IN ('calculate_next_run_time', 'update_next_run_at')
ORDER BY routine_name;

-- 4. Verify triggers exist
SELECT 'Triggers Check' as check_type, trigger_name,
  CASE WHEN trigger_name IS NOT NULL THEN '✅ Exists' ELSE '❌ Missing' END as status
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_next_run_at';

-- 5. Verify view exists
SELECT 'View Check' as check_type, table_name as view_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ Exists' ELSE '❌ Missing' END as status
FROM information_schema.views
WHERE table_name = 'automation_rules_with_stats';

-- 6. Verify RLS is enabled
SELECT 'RLS Check' as check_type, tablename, 
  CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('ai_generation_rules', 'ai_automation_executions');

-- 7. Test trigger functionality
-- This will create a test rule and verify the trigger sets next_run_at
DO $$
DECLARE
  test_rule_id UUID;
  test_next_run TIMESTAMPTZ;
BEGIN
  -- Insert test rule with automation disabled
  INSERT INTO ai_generation_rules (
    user_id, name, blueprint_type, automation_enabled, schedule_frequency
  ) VALUES (
    'test-user-123', 'Test Automation Rule', 'market', false, 'daily'
  ) RETURNING id INTO test_rule_id;
  
  -- Enable automation and check if trigger sets next_run_at
  UPDATE ai_generation_rules 
  SET automation_enabled = true 
  WHERE id = test_rule_id
  RETURNING next_run_at INTO test_next_run;
  
  -- Check result
  IF test_next_run IS NOT NULL THEN
    RAISE NOTICE '✅ Trigger test passed: next_run_at was set to %', test_next_run;
  ELSE
    RAISE NOTICE '❌ Trigger test failed: next_run_at was not set';
  END IF;
  
  -- Clean up
  DELETE FROM ai_generation_rules WHERE id = test_rule_id;
END $$;

-- 8. Summary
SELECT 
  '=== PHASE 1 VERIFICATION COMPLETE ===' as summary,
  'Run the migration first, then run this script to verify all components are in place.' as instructions;