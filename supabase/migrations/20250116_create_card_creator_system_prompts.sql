-- Create table for Card Creator System Prompts
CREATE TABLE IF NOT EXISTS card_creator_system_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Type and identifier
  prompt_type VARCHAR(50) NOT NULL CHECK (prompt_type IN ('blueprint', 'intelligence', 'development')),
  section_id VARCHAR(100) NOT NULL, -- e.g., 'value-proposition', 'market-analysis', 'technical-requirement'
  
  -- Prompts
  preview_prompt TEXT NOT NULL,
  generation_prompt TEXT NOT NULL,
  
  -- Metadata
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Configuration
  config JSONB DEFAULT '{}', -- For any additional configuration like token limits, chunking settings
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure unique section_id per type
  UNIQUE(prompt_type, section_id)
);

-- Create updated_at trigger
CREATE TRIGGER update_card_creator_system_prompts_updated_at
  BEFORE UPDATE ON card_creator_system_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_card_creator_prompts_type ON card_creator_system_prompts(prompt_type);
CREATE INDEX idx_card_creator_prompts_section ON card_creator_system_prompts(section_id);

-- Insert default prompts for common blueprint types
INSERT INTO card_creator_system_prompts (prompt_type, section_id, display_name, preview_prompt, generation_prompt, config) VALUES
-- Blueprint prompts
('blueprint', 'value-proposition', 'Value Proposition Cards', 
 'You are a strategic analyst helping users understand how their source material will be interpreted for generating value proposition cards. Analyze the context through the lens of: target customers, pain points, and differentiation opportunities.',
 'You are a strategic planning expert specializing in value proposition cards. Generate cards that clearly articulate unique value delivery, customer pain points addressed, and competitive differentiation. Each card must include specific details about target customer, pain points, unique value, and differentiation.',
 '{"max_tokens": 4000, "chunk_size": 5}'::jsonb),

('blueprint', 'strategic-context', 'Strategic Context Cards',
 'You are a strategic analyst helping users understand how their source material will be interpreted for generating strategic context cards. Focus on: market environment, competitive landscape, and internal capabilities.',
 'You are a strategic planning expert specializing in strategic context cards. Generate cards that analyze current situation, market forces, competitive positioning, and strategic opportunities. Include specific market environment, competitive landscape, and internal capability assessments.',
 '{"max_tokens": 4000, "chunk_size": 5}'::jsonb),

('blueprint', 'personas', 'Persona Cards',
 'You are a user research expert helping users understand how their source material will be interpreted for generating persona cards. Focus on: user demographics, behaviors, needs, and goals.',
 'You are a user research expert specializing in persona cards. Generate detailed user profiles with demographics, behaviors, needs, pain points, and goals. Each persona should be distinct and actionable for product/service design.',
 '{"max_tokens": 4000, "chunk_size": 5}'::jsonb),

('blueprint', 'customer-journey', 'Customer Journey Cards',
 'You are a customer experience expert helping users understand how their source material will be interpreted for generating customer journey cards. Focus on: journey stages, touchpoints, emotions, and opportunities.',
 'You are a customer experience expert specializing in journey mapping. Generate cards that detail customer journey stages, touchpoints, emotions, pain points, and improvement opportunities. Include specific actions and insights for each stage.',
 '{"max_tokens": 4000, "chunk_size": 5}'::jsonb),

-- Intelligence prompts
('intelligence', 'market', 'Market Intelligence Cards',
 'You are a market analyst helping users understand how their source material will be interpreted for generating market intelligence cards. Focus on: market trends, competitive dynamics, and emerging opportunities.',
 'You are a market intelligence expert. Generate cards that analyze market trends, competitive dynamics, emerging opportunities, and potential threats. Include specific data points, sources, and actionable insights.',
 '{"max_tokens": 4000, "chunk_size": 5}'::jsonb),

('intelligence', 'consumer', 'Consumer Intelligence Cards',
 'You are a consumer insights expert helping users understand how their source material will be interpreted for generating consumer intelligence cards. Focus on: consumer behaviors, preferences, and unmet needs.',
 'You are a consumer intelligence expert. Generate cards that reveal consumer behaviors, preferences, purchase patterns, and unmet needs. Include demographic insights and psychographic profiles.',
 '{"max_tokens": 4000, "chunk_size": 5}'::jsonb),

-- Development prompts
('development', 'technical-requirement', 'Technical Requirement Cards',
 'You are a technical architect helping users understand how their source material will be interpreted for generating technical requirement cards. Focus on: system requirements, constraints, and implementation details.',
 'You are a technical architect specializing in requirement documentation. Generate cards that detail technical specifications, system requirements, constraints, dependencies, and implementation guidelines.',
 '{"max_tokens": 4000, "chunk_size": 5}'::jsonb),

('development', 'feature', 'Feature Cards',
 'You are a product manager helping users understand how their source material will be interpreted for generating feature cards. Focus on: user needs, functional requirements, and success criteria.',
 'You are a product management expert. Generate feature cards that clearly define functionality, user benefits, acceptance criteria, and implementation priority. Include user stories and success metrics.',
 '{"max_tokens": 4000, "chunk_size": 5}'::jsonb);

-- Add RLS policies
ALTER TABLE card_creator_system_prompts ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Users can read card creator system prompts"
  ON card_creator_system_prompts FOR SELECT
  TO authenticated
  USING (true);

-- Only allow admins or the creator to update
CREATE POLICY "Users can update their own card creator system prompts"
  ON card_creator_system_prompts FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  ));

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can create card creator system prompts"
  ON card_creator_system_prompts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Only admins can delete
CREATE POLICY "Only admins can delete card creator system prompts"
  ON card_creator_system_prompts FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  ));

-- Grant permissions
GRANT ALL ON card_creator_system_prompts TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;