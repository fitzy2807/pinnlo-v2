-- Intelligence Groups: Allows users to curate collections of intelligence cards
-- for focused strategic analysis and AI-powered strategy generation

-- Create intelligence_groups table
CREATE TABLE IF NOT EXISTS intelligence_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  card_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for group-card relationships
CREATE TABLE IF NOT EXISTS intelligence_group_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES intelligence_groups(id) ON DELETE CASCADE NOT NULL,
  intelligence_card_id UUID REFERENCES intelligence_cards(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  position INTEGER DEFAULT 0,
  UNIQUE(group_id, intelligence_card_id)
);

-- Add indexes for performance
CREATE INDEX idx_intelligence_groups_user_id ON intelligence_groups(user_id);
CREATE INDEX idx_intelligence_groups_last_used ON intelligence_groups(user_id, last_used_at DESC);
CREATE INDEX idx_intelligence_group_cards_group_id ON intelligence_group_cards(group_id);
CREATE INDEX idx_intelligence_group_cards_card_id ON intelligence_group_cards(intelligence_card_id);

-- Enable Row Level Security
ALTER TABLE intelligence_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_group_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for intelligence_groups
CREATE POLICY "Users can view their own intelligence groups" ON intelligence_groups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own intelligence groups" ON intelligence_groups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intelligence groups" ON intelligence_groups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own intelligence groups" ON intelligence_groups
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for intelligence_group_cards
CREATE POLICY "Users can view their own group cards" ON intelligence_group_cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM intelligence_groups 
      WHERE intelligence_groups.id = intelligence_group_cards.group_id 
      AND intelligence_groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add cards to their own groups" ON intelligence_group_cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM intelligence_groups 
      WHERE intelligence_groups.id = intelligence_group_cards.group_id 
      AND intelligence_groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove cards from their own groups" ON intelligence_group_cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM intelligence_groups 
      WHERE intelligence_groups.id = intelligence_group_cards.group_id 
      AND intelligence_groups.user_id = auth.uid()
    )
  );

-- Function to auto-update card_count
CREATE OR REPLACE FUNCTION update_intelligence_group_card_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE intelligence_groups 
    SET card_count = card_count + 1,
        last_used_at = NOW()
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE intelligence_groups 
    SET card_count = card_count - 1,
        last_used_at = NOW()
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_group_card_count_insert
  AFTER INSERT ON intelligence_group_cards
  FOR EACH ROW EXECUTE FUNCTION update_intelligence_group_card_count();

CREATE TRIGGER trigger_update_group_card_count_delete
  AFTER DELETE ON intelligence_group_cards
  FOR EACH ROW EXECUTE FUNCTION update_intelligence_group_card_count();

-- Update trigger for updated_at
CREATE TRIGGER update_intelligence_groups_updated_at
  BEFORE UPDATE ON intelligence_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();