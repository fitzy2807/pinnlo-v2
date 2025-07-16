-- =============================================
-- AI Edit Mode System - Management Queries
-- =============================================
-- Helpful queries for managing your AI prompts and context system

-- 1. View all active prompts
SELECT 
    blueprint_type,
    prompt_name,
    LEFT(system_prompt, 100) || '...' as prompt_preview,
    times_used,
    avg_user_rating,
    last_used_at
FROM ai_system_prompts
WHERE is_active = true
ORDER BY blueprint_type;

-- 2. View context mappings for a specific blueprint
-- Replace 'epics' with your blueprint type
SELECT 
    cm.context_blueprint,
    cm.priority,
    cm.max_cards,
    cm.inclusion_strategy,
    CASE 
        WHEN cs.strategy_type IS NOT NULL THEN cs.strategy_type
        ELSE 'none'
    END as summarization_strategy
FROM ai_context_mappings cm
LEFT JOIN ai_context_strategies cs ON cm.context_blueprint = cs.blueprint_type
WHERE cm.source_blueprint = 'epics'
ORDER BY cm.priority;

-- 3. Add a new prompt for a blueprint type
-- Example: Adding prompt for 'personas' blueprint
INSERT INTO ai_system_prompts (blueprint_type, prompt_name, system_prompt) 
VALUES (
    'personas',
    'User Persona Expert',
    'You are a user research and persona development expert. Create detailed, realistic personas based on user research and data. Include demographics, goals, pain points, and behavioral patterns. Make personas specific enough to guide product decisions.'
);

-- 4. Add context mapping
-- Example: Make personas consider market insights
INSERT INTO ai_context_mappings (source_blueprint, context_blueprint, priority, max_cards, inclusion_strategy)
VALUES ('personas', 'market-insight', 3, 5, 'if_exists');

-- 5. Update a prompt based on performance
UPDATE ai_system_prompts
SET 
    system_prompt = 'Your improved prompt here...',
    prompt_version = prompt_version + 1,
    updated_at = NOW()
WHERE blueprint_type = 'vision';

-- 6. View generation performance by blueprint
SELECT 
    blueprint_type,
    COUNT(*) as total_generations,
    AVG(generation_time_ms) as avg_time_ms,
    SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as success_rate,
    AVG(user_rating) as avg_rating
FROM ai_generation_history
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY blueprint_type
ORDER BY total_generations DESC;

-- 7. Find prompts that need improvement (low ratings)
SELECT 
    gh.blueprint_type,
    sp.prompt_name,
    COUNT(*) as generations,
    AVG(gh.user_rating) as avg_rating,
    COUNT(CASE WHEN gh.user_rating <= 2 THEN 1 END) as low_ratings
FROM ai_generation_history gh
JOIN ai_system_prompts sp ON gh.blueprint_type = sp.blueprint_type
WHERE gh.user_rating IS NOT NULL
GROUP BY gh.blueprint_type, sp.prompt_name
HAVING AVG(gh.user_rating) < 3.5
ORDER BY avg_rating ASC;

-- 8. See which context is most valuable
-- Shows which context blueprints are used most often and correlate with high ratings
SELECT 
    context_used->>'blueprint_type' as context_type,
    COUNT(*) as times_used,
    AVG(user_rating) as avg_rating_when_used
FROM ai_generation_history,
     jsonb_array_elements(context_used) as context_used
WHERE user_rating IS NOT NULL
GROUP BY context_used->>'blueprint_type'
ORDER BY avg_rating_when_used DESC;

-- 9. Quick prompt tester
-- Use this to see what context would be gathered for a blueprint
SELECT * FROM get_ai_context_config('epics');

-- 10. Bulk add prompts for all blueprint types
-- First, get a list of all blueprint types that don't have prompts
SELECT DISTINCT 
    c.card_type as missing_blueprint_type
FROM cards c
WHERE NOT EXISTS (
    SELECT 1 FROM ai_system_prompts sp 
    WHERE sp.blueprint_type = c.card_type
)
ORDER BY c.card_type;