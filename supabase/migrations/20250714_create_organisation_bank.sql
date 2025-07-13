-- Organisation Bank Database Schema - Exact Mirror of Template Bank Structure

-- Organisation cards table (mirrors template_cards)
CREATE TABLE IF NOT EXISTS organisation_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    card_type VARCHAR(50) NOT NULL DEFAULT 'organisation',
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    card_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organisation groups table (what template_groups should be)
CREATE TABLE IF NOT EXISTS organisation_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(50) DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organisation group cards junction table (what template_group_cards should be)
CREATE TABLE IF NOT EXISTS organisation_group_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES organisation_groups(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES organisation_cards(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, card_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organisation_cards_user_id ON organisation_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_organisation_cards_created_at ON organisation_cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_organisation_cards_card_type ON organisation_cards(card_type);
CREATE INDEX IF NOT EXISTS idx_organisation_cards_card_data ON organisation_cards USING GIN (card_data);
CREATE INDEX IF NOT EXISTS idx_organisation_groups_user_id ON organisation_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_organisation_group_cards_group_id ON organisation_group_cards(group_id);
CREATE INDEX IF NOT EXISTS idx_organisation_group_cards_card_id ON organisation_group_cards(card_id);

-- Create view for groups with card counts
CREATE OR REPLACE VIEW organisation_groups_with_counts AS
SELECT 
    g.*,
    COUNT(ogc.card_id) as card_count
FROM organisation_groups g
LEFT JOIN organisation_group_cards ogc ON g.id = ogc.group_id
GROUP BY g.id, g.user_id, g.name, g.description, g.color, g.created_at, g.updated_at;

-- Enable Row Level Security
ALTER TABLE organisation_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation_group_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organisation_cards
CREATE POLICY "Users can view their own organisation cards" ON organisation_cards
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own organisation cards" ON organisation_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own organisation cards" ON organisation_cards
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own organisation cards" ON organisation_cards
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for organisation_groups
CREATE POLICY "Users can view their own organisation groups" ON organisation_groups
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own organisation groups" ON organisation_groups
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own organisation groups" ON organisation_groups
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own organisation groups" ON organisation_groups
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for organisation_group_cards
CREATE POLICY "Users can view their own organisation group cards" ON organisation_group_cards
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM organisation_groups og WHERE og.id = organisation_group_cards.group_id AND og.user_id = auth.uid())
    );
CREATE POLICY "Users can create organisation group cards" ON organisation_group_cards
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM organisation_groups og WHERE og.id = organisation_group_cards.group_id AND og.user_id = auth.uid())
    );
CREATE POLICY "Users can update organisation group cards" ON organisation_group_cards
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM organisation_groups og WHERE og.id = organisation_group_cards.group_id AND og.user_id = auth.uid())
    );
CREATE POLICY "Users can delete organisation group cards" ON organisation_group_cards
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM organisation_groups og WHERE og.id = organisation_group_cards.group_id AND og.user_id = auth.uid())
    );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_organisation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organisation_cards_updated_at
    BEFORE UPDATE ON organisation_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_organisation_updated_at();

CREATE TRIGGER update_organisation_groups_updated_at
    BEFORE UPDATE ON organisation_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_organisation_updated_at();