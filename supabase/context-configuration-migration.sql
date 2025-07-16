-- Context Configuration Migration
-- Add context configuration to ai_system_prompts table

-- Add context_config column to store blueprint-specific context settings
ALTER TABLE ai_system_prompts 
ADD COLUMN IF NOT EXISTS context_config JSONB DEFAULT NULL;

-- Update existing prompts with context configurations
-- Feature blueprint context
UPDATE ai_system_prompts 
SET context_config = '{
  "contextBlueprints": [
    {
      "blueprint": "personas",
      "maxCards": 3,
      "inclusionStrategy": "if_exists",
      "summarizationRequired": false,
      "weight": 1.0,
      "description": "Related personas to understand user needs"
    },
    {
      "blueprint": "epic",
      "maxCards": 2,
      "inclusionStrategy": "if_exists", 
      "summarizationRequired": false,
      "weight": 0.8,
      "description": "Parent epics for feature context"
    },
    {
      "blueprint": "strategicContext",
      "maxCards": 1,
      "inclusionStrategy": "if_exists",
      "summarizationRequired": false,
      "weight": 0.6,
      "description": "Strategic context for alignment"
    }
  ]
}'::jsonb
WHERE blueprint_type = 'feature' AND is_active = true;

-- Strategic Context blueprint context
UPDATE ai_system_prompts 
SET context_config = '{
  "contextBlueprints": [
    {
      "blueprint": "vision",
      "maxCards": 1,
      "inclusionStrategy": "if_exists",
      "summarizationRequired": false,
      "weight": 1.0,
      "description": "Strategic vision for context"
    },
    {
      "blueprint": "okrs",
      "maxCards": 3,
      "inclusionStrategy": "if_exists",
      "summarizationRequired": false,
      "weight": 0.9,
      "description": "Related objectives and key results"
    },
    {
      "blueprint": "swotAnalysis",
      "maxCards": 1,
      "inclusionStrategy": "if_exists",
      "summarizationRequired": false,
      "weight": 0.7,
      "description": "SWOT analysis for strategic context"
    }
  ]
}'::jsonb
WHERE blueprint_type = 'strategicContext' AND is_active = true;

-- Customer Experience blueprint context
UPDATE ai_system_prompts 
SET context_config = '{
  "contextBlueprints": [
    {
      "blueprint": "personas",
      "maxCards": 3,
      "inclusionStrategy": "if_exists",
      "summarizationRequired": false,
      "weight": 1.0,
      "description": "Customer personas for journey context"
    },
    {
      "blueprint": "userJourneys",
      "maxCards": 2,
      "inclusionStrategy": "if_exists",
      "summarizationRequired": false,
      "weight": 0.9,
      "description": "Related user journeys"
    },
    {
      "blueprint": "strategicContext",
      "maxCards": 1,
      "inclusionStrategy": "if_exists",
      "summarizationRequired": false,
      "weight": 0.6,
      "description": "Strategic context for alignment"
    }
  ]
}'::jsonb
WHERE blueprint_type = 'customerExperience' AND is_active = true;

-- Experience Sections blueprint context
UPDATE ai_system_prompts 
SET context_config = '{
  "contextBlueprints": [
    {
      "blueprint": "customerExperience",
      "maxCards": 2,
      "inclusionStrategy": "if_exists",
      "summarizationRequired": false,
      "weight": 1.0,
      "description": "Parent customer experience context"
    },
    {
      "blueprint": "userJourneys",
      "maxCards": 2,
      "inclusionStrategy": "if_exists",
      "summarizationRequired": false,
      "weight": 0.9,
      "description": "Related user journeys"
    },
    {
      "blueprint": "personas",
      "maxCards": 1,
      "inclusionStrategy": "if_exists",
      "summarizationRequired": false,
      "weight": 0.7,
      "description": "Relevant user personas"
    }
  ]
}'::jsonb
WHERE blueprint_type = 'experienceSections' AND is_active = true;

-- Create function to get context config from system prompts
CREATE OR REPLACE FUNCTION get_ai_context_config_from_prompts(p_blueprint_type TEXT)
RETURNS TABLE (
    context_blueprint TEXT,
    max_cards INTEGER,
    inclusion_strategy TEXT,
    summarization_required BOOLEAN,
    weight REAL,
    description TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (context_item->>'blueprint')::TEXT as context_blueprint,
        (context_item->>'maxCards')::INTEGER as max_cards,
        (context_item->>'inclusionStrategy')::TEXT as inclusion_strategy,
        (context_item->>'summarizationRequired')::BOOLEAN as summarization_required,
        (context_item->>'weight')::REAL as weight,
        (context_item->>'description')::TEXT as description
    FROM ai_system_prompts,
         jsonb_array_elements(context_config->'contextBlueprints') as context_item
    WHERE blueprint_type = p_blueprint_type 
      AND is_active = true
      AND context_config IS NOT NULL;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_ai_context_config_from_prompts(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_context_config_from_prompts(TEXT) TO service_role;

-- Test the function
SELECT * FROM get_ai_context_config_from_prompts('feature');
SELECT * FROM get_ai_context_config_from_prompts('strategicContext');
SELECT * FROM get_ai_context_config_from_prompts('customerExperience');