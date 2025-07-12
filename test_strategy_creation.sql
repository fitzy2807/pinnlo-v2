-- Step 5: Try to insert a test strategy (this should fail with the current issue)
INSERT INTO strategies (
    "userId", 
    title, 
    description, 
    status, 
    blueprint_config
) VALUES (
    auth.uid()::text,  -- Cast to text in case userId is VARCHAR
    'Test Strategy - RLS Debug',
    'Testing RLS policy issues',
    'draft',
    '{}'::jsonb
);

-- Step 6: If above fails, try with explicit text casting
INSERT INTO strategies (
    "userId", 
    title, 
    description, 
    status, 
    blueprint_config
) VALUES (
    auth.uid()::varchar,  -- Explicit VARCHAR cast
    'Test Strategy - RLS Debug 2',
    'Testing with VARCHAR cast',
    'draft',
    '{}'::jsonb
);

-- Step 7: Check if any strategies exist for current user
SELECT 
    id,
    "userId",
    title,
    pg_typeof("userId") as userid_type
FROM strategies 
WHERE "userId" = auth.uid()::text
LIMIT 5;
