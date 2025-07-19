-- Update section_id values in card_creator_system_prompts to match card_type values
-- This ensures proper integration between system prompts and card generation

-- Update value-proposition to valuePropositions
UPDATE card_creator_system_prompts 
SET section_id = 'valuePropositions' 
WHERE section_id = 'value-proposition';

-- Update strategic-context to strategicContext (if exists)
UPDATE card_creator_system_prompts 
SET section_id = 'strategicContext' 
WHERE section_id = 'strategic-context';

-- Add missing section_id entries for epics and features
INSERT INTO card_creator_system_prompts (
    prompt_type, 
    section_id, 
    display_name, 
    preview_prompt, 
    generation_prompt, 
    description,
    config
) VALUES 
(
    'blueprint', 
    'epics', 
    'Epic Cards', 
    'I will analyze the provided context and create epic cards that group related features and initiatives into manageable development streams.',
    'Based on the strategic context and requirements, generate epic cards that represent high-level initiatives. Each epic should group related features and provide clear business value.',
    'Generate epic cards for strategic planning and development organization',
    '{"max_tokens": 4000, "chunk_size": 5}'::jsonb
),
(
    'blueprint', 
    'features', 
    'Feature Cards', 
    'I will analyze the provided context and create feature cards that define specific product capabilities and user-facing functionality.',
    'Based on the strategic context and requirements, generate feature cards that represent specific product capabilities. Each feature should have clear acceptance criteria and business value.',
    'Generate feature cards for product development and planning',
    '{"max_tokens": 4000, "chunk_size": 5}'::jsonb
)
ON CONFLICT (prompt_type, section_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    preview_prompt = EXCLUDED.preview_prompt,
    generation_prompt = EXCLUDED.generation_prompt,
    description = EXCLUDED.description,
    config = EXCLUDED.config;

-- Verify the updates
SELECT prompt_type, section_id, display_name 
FROM card_creator_system_prompts 
WHERE section_id IN ('valuePropositions', 'strategicContext', 'epics', 'features')
ORDER BY prompt_type, section_id;