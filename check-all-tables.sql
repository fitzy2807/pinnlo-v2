-- Query to see all tables in the public schema
SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name;

-- Query to see all columns for each table
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM 
    information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE 
    t.table_schema = 'public' 
    AND c.table_schema = 'public'
ORDER BY 
    t.table_name, 
    c.ordinal_position;

-- Check if specific tables exist
SELECT 
    'strategies' as table_name, 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strategies') as exists
UNION ALL
SELECT 
    'cards', 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cards')
UNION ALL
SELECT 
    'intelligence_cards', 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'intelligence_cards')
UNION ALL
SELECT 
    'intelligence_profiles', 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'intelligence_profiles')
UNION ALL
SELECT 
    'strategy_creator_sessions', 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strategy_creator_sessions')
UNION ALL
SELECT 
    'strategy_creator_history', 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strategy_creator_history')
UNION ALL
SELECT 
    'intelligence_groups', 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'intelligence_groups')
UNION ALL
SELECT 
    'intelligence_group_cards', 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'intelligence_group_cards')
UNION ALL
SELECT 
    'users', 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')
UNION ALL
SELECT 
    'strategySummaries', 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strategySummaries');