-- Quick fix to add system_prompt column
-- Run this in Supabase SQL Editor

ALTER TABLE ai_generation_rules 
ADD COLUMN IF NOT EXISTS system_prompt TEXT;
