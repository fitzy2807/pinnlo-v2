-- PHASE 1: DATABASE INFRASTRUCTURE FOR INTELLIGENCE AUTOMATION
-- This migration adds automation capabilities to the existing AI system

-- Step 1.1: Create/Extend ai_generation_rules Table
CREATE TABLE IF NOT EXISTS ai_generation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR NOT NULL, -- Match ai_preferences pattern
  name VARCHAR(255) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  blueprint_type VARCHAR NOT NULL,
  context_requirements TEXT[],
  custom_prompt TEXT,
  model VARCHAR DEFAULT 'gpt-4o-mini',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  is_public BOOLEAN DEFAULT false,
  created_by_user_id VARCHAR,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add automation columns (whether creating new or extending existing)
DO $$
BEGIN
  -- Add each column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_generation_rules' AND column_name = 'automation_enabled') THEN
    ALTER TABLE ai_generation_rules ADD COLUMN automation_enabled BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_generation_rules' AND column_name = 'schedule_frequency') THEN
    ALTER TABLE ai_generation_rules ADD COLUMN schedule_frequency VARCHAR CHECK (schedule_frequency IN ('hourly', 'daily', 'weekly')) DEFAULT 'daily';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_generation_rules' AND column_name = 'next_run_at') THEN
    ALTER TABLE ai_generation_rules ADD COLUMN next_run_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_generation_rules' AND column_name = 'intelligence_categories') THEN
    ALTER TABLE ai_generation_rules ADD COLUMN intelligence_categories TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_generation_rules' AND column_name = 'target_groups') THEN
    ALTER TABLE ai_generation_rules ADD COLUMN target_groups TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_generation_rules' AND column_name = 'optimization_level') THEN
    ALTER TABLE ai_generation_rules ADD COLUMN optimization_level VARCHAR DEFAULT 'balanced' CHECK (optimization_level IN ('maximum_quality', 'balanced', 'maximum_savings'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_generation_rules' AND column_name = 'max_cards_per_run') THEN
    ALTER TABLE ai_generation_rules ADD COLUMN max_cards_per_run INTEGER DEFAULT 5 CHECK (max_cards_per_run > 0 AND max_cards_per_run <= 20);
  END IF;
END $$;

-- Step 1.2: Add RLS Policies
ALTER TABLE ai_generation_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can manage own generation rules" ON ai_generation_rules;
CREATE POLICY "Users can manage own generation rules" ON ai_generation_rules
  FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can view public rules" ON ai_generation_rules;
CREATE POLICY "Users can view public rules" ON ai_generation_rules
  FOR SELECT USING (is_public = true);

-- Step 1.3: Create Indexes
CREATE INDEX IF NOT EXISTS idx_ai_generation_rules_user_id ON ai_generation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_rules_automation_next_run 
  ON ai_generation_rules(automation_enabled, next_run_at) 
  WHERE automation_enabled = true;

-- Step 1.4: Create ai_automation_executions Table
CREATE TABLE IF NOT EXISTS ai_automation_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES ai_generation_rules(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL,
  trigger_type VARCHAR NOT NULL CHECK (trigger_type IN ('scheduled', 'manual')),
  status VARCHAR NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  cards_created INTEGER DEFAULT 0,
  cards_updated INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost_incurred DECIMAL(10,4) DEFAULT 0,
  processing_time_ms INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE ai_automation_executions ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view own automation executions" ON ai_automation_executions;
CREATE POLICY "Users can view own automation executions" ON ai_automation_executions
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can create own automation executions" ON ai_automation_executions;
CREATE POLICY "Users can create own automation executions" ON ai_automation_executions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own automation executions" ON ai_automation_executions;
CREATE POLICY "Users can update own automation executions" ON ai_automation_executions
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_automation_executions_rule_started ON ai_automation_executions(rule_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_automation_executions_user_started ON ai_automation_executions(user_id, started_at DESC);

-- Step 1.5: Create Helper Functions
-- Function to calculate next run time
CREATE OR REPLACE FUNCTION calculate_next_run_time(
  frequency VARCHAR,
  base_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) RETURNS TIMESTAMPTZ AS $$
BEGIN
  CASE frequency
    WHEN 'hourly' THEN RETURN base_time + INTERVAL '1 hour';
    WHEN 'daily' THEN RETURN base_time + INTERVAL '1 day';
    WHEN 'weekly' THEN RETURN base_time + INTERVAL '1 week';
    ELSE RETURN base_time + INTERVAL '1 day';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to update next_run_at
CREATE OR REPLACE FUNCTION update_next_run_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.automation_enabled = true AND (OLD.automation_enabled = false OR OLD.automation_enabled IS NULL) THEN
    IF NEW.next_run_at IS NULL THEN
      NEW.next_run_at := calculate_next_run_time(NEW.schedule_frequency);
    END IF;
  END IF;
  
  IF NEW.automation_enabled = false THEN
    NEW.next_run_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_next_run_at ON ai_generation_rules;
CREATE TRIGGER trigger_update_next_run_at
  BEFORE UPDATE ON ai_generation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_next_run_at();

-- Step 1.6: Enhance ai_usage Table
-- Add missing columns for automation tracking
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS model_used VARCHAR;
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0 CHECK (tokens_used >= 0);
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS cost_incurred DECIMAL(10,4) DEFAULT 0 CHECK (cost_incurred >= 0);
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS feature_used VARCHAR DEFAULT 'card_generation';
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS request_type VARCHAR CHECK (request_type IN ('generation', 'analysis', 'enhancement', 'automation'));

-- Step 1.7: Create Monitoring View
CREATE OR REPLACE VIEW automation_rules_with_stats AS
SELECT 
  agr.*,
  COUNT(aae.id) as total_executions,
  COUNT(aae.id) FILTER (WHERE aae.status = 'completed') as successful_executions,
  COALESCE(SUM(aae.cards_created), 0) as total_cards_created,
  MAX(aae.started_at) as last_execution_at
FROM ai_generation_rules agr
LEFT JOIN ai_automation_executions aae ON agr.id = aae.rule_id
WHERE agr.automation_enabled = true
GROUP BY agr.id;

-- Grant permissions on the view
GRANT SELECT ON automation_rules_with_stats TO authenticated;
GRANT SELECT ON automation_rules_with_stats TO anon;