-- Add system_prompt column to ai_generation_rules table
-- This allows users to provide custom system prompts for automation rules

ALTER TABLE ai_generation_rules 
ADD COLUMN IF NOT EXISTS system_prompt TEXT;

-- Add a comment to document the purpose
COMMENT ON COLUMN ai_generation_rules.system_prompt IS 'Custom system prompt to guide AI generation for this automation rule';
