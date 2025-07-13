-- Test Organisation Bank database tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'organisation_%'
ORDER BY table_name;

-- Test the view was created
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'organisation_groups_with_counts'
ORDER BY ordinal_position;

-- Test RLS policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'organisation_%'
ORDER BY tablename, policyname;