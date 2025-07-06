-- MANUAL MIGRATION SCRIPT
-- Copy and paste this into your Supabase SQL Editor
-- This will set up the cards table and update the strategies table

-- 1. Create cards table
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
  card_data JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT cards_card_type_check CHECK (card_type ~ '^[a-z-]+$')
);

-- 2. Add blueprint configuration to strategies table
ALTER TABLE strategies 
ADD COLUMN IF NOT EXISTS blueprint_config JSONB DEFAULT '{
  "enabledBlueprints": ["strategic-context"],
  "mandatoryBlueprints": ["strategic-context"],
  "lastUpdated": null
}'::jsonb;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cards_strategy_id ON cards(strategy_id);
CREATE INDEX IF NOT EXISTS idx_cards_card_type ON cards(card_type);
CREATE INDEX IF NOT EXISTS idx_cards_created_by ON cards(created_by);
CREATE INDEX IF NOT EXISTS idx_cards_updated_at ON cards(updated_at);

-- 4. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Create trigger for cards table
DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at 
    BEFORE UPDATE ON cards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable RLS (Row Level Security)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view cards from their strategies" ON cards;
DROP POLICY IF EXISTS "Users can insert cards to their strategies" ON cards;
DROP POLICY IF EXISTS "Users can update cards in their strategies" ON cards;
DROP POLICY IF EXISTS "Users can delete cards from their strategies" ON cards;

-- 8. Create RLS policies for cards
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

-- 9. Optional: Insert a sample card for testing
-- (Replace 'YOUR_STRATEGY_ID' with an actual strategy ID from your strategies table)
/*
INSERT INTO cards (
  strategy_id, 
  title, 
  description, 
  card_type, 
  priority, 
  confidence_level, 
  strategic_alignment, 
  tags, 
  card_data,
  created_by
) VALUES (
  'YOUR_STRATEGY_ID',
  'Sample Market Analysis',
  'A sample strategic context card for testing the new database integration.',
  'strategic-context',
  'High',
  'Medium',
  'This sample card demonstrates the database integration functionality.',
  '["Sample", "Testing", "Database"]'::jsonb,
  '{
    "marketContext": "Testing market context field",
    "competitiveLandscape": "Sample competitive landscape",
    "keyTrends": ["Trend 1", "Trend 2"],
    "stakeholders": ["Test User"],
    "timeframe": "1 year"
  }'::jsonb,
  auth.uid()
);
*/