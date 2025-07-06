-- Migration: Add cards table and update strategies table for blueprint support
-- Created: 2025-01-06
-- Purpose: Enable card storage and blueprint configuration

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  
  -- Universal card fields
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  card_type TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  confidence_level TEXT DEFAULT 'Medium' CHECK (confidence_level IN ('High', 'Medium', 'Low')),
  priority_rationale TEXT DEFAULT '',
  confidence_rationale TEXT DEFAULT '',
  strategic_alignment TEXT DEFAULT '',
  
  -- Dynamic content
  tags JSONB DEFAULT '[]'::jsonb,
  relationships JSONB DEFAULT '[]'::jsonb,
  card_data JSONB DEFAULT '{}'::jsonb, -- Blueprint-specific fields
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Indexes for performance
  CONSTRAINT cards_card_type_check CHECK (card_type ~ '^[a-z-]+$')
);

-- Add blueprint configuration to strategies table
ALTER TABLE strategies 
ADD COLUMN IF NOT EXISTS blueprint_config JSONB DEFAULT '{
  "enabledBlueprints": ["strategic-context"],
  "mandatoryBlueprints": ["strategic-context"],
  "lastUpdated": null
}'::jsonb;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cards_strategy_id ON cards(strategy_id);
CREATE INDEX IF NOT EXISTS idx_cards_card_type ON cards(card_type);
CREATE INDEX IF NOT EXISTS idx_cards_created_by ON cards(created_by);
CREATE INDEX IF NOT EXISTS idx_cards_updated_at ON cards(updated_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for cards table
CREATE TRIGGER update_cards_updated_at 
    BEFORE UPDATE ON cards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cards
CREATE POLICY "Users can view cards from their strategies" ON cards
  FOR SELECT USING (
    strategy_id IN (
      SELECT id FROM strategies 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cards to their strategies" ON cards
  FOR INSERT WITH CHECK (
    strategy_id IN (
      SELECT id FROM strategies 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in their strategies" ON cards
  FOR UPDATE USING (
    strategy_id IN (
      SELECT id FROM strategies 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards from their strategies" ON cards
  FOR DELETE USING (
    strategy_id IN (
      SELECT id FROM strategies 
      WHERE user_id = auth.uid()
    )
  );

-- Insert sample data for testing (optional)
INSERT INTO cards (strategy_id, title, description, card_type, priority, confidence_level, strategic_alignment, tags, card_data, created_by)
SELECT 
  s.id,
  'Market Analysis Framework',
  'Comprehensive analysis of market trends, competitive landscape, and strategic opportunities in the emerging SaaS platform space.',
  'strategic-context',
  'High',
  'Medium',
  'Directly supports our strategic objective to understand market dynamics and inform go-to-market strategy.',
  '["Market Research", "Competitive Analysis", "Strategic Planning"]'::jsonb,
  '{
    "marketContext": "Rapidly growing SaaS market with increasing demand for integrated solutions",
    "competitiveLandscape": "Fragmented market with several established players and emerging startups",
    "keyTrends": ["Digital transformation", "Remote work adoption", "API-first solutions"],
    "stakeholders": ["Product Team", "Sales Leadership", "Customer Success"],
    "timeframe": "1 year"
  }'::jsonb,
  s.user_id
FROM strategies s 
WHERE s.user_id = auth.uid()
LIMIT 1
ON CONFLICT DO NOTHING;