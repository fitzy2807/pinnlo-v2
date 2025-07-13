-- Development Groups Migration
-- Creates groups functionality for Development Bank components

-- Groups table for development components
CREATE TABLE IF NOT EXISTS development_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id INTEGER NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(50) DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add group_ids column to tech_stack_components if it doesn't exist
ALTER TABLE tech_stack_components 
ADD COLUMN IF NOT EXISTS group_ids UUID[] DEFAULT '{}';

-- Create view for groups with card counts
CREATE OR REPLACE VIEW development_groups_with_counts AS
SELECT 
    g.*,
    (
        SELECT COUNT(*)
        FROM tech_stack_components tsc
        WHERE tsc.group_ids @> ARRAY[g.id]
    ) as card_count
FROM development_groups g;

-- Row Level Security policies
ALTER TABLE development_groups ENABLE ROW LEVEL SECURITY;

-- Users can only see their own groups
CREATE POLICY "Users can view their own development groups" ON development_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM strategies s 
            WHERE s.id = development_groups.strategy_id 
            AND s.userId = auth.uid()::varchar
        )
    );

-- Users can create groups for their own strategies
CREATE POLICY "Users can create development groups for their strategies" ON development_groups
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM strategies s 
            WHERE s.id = development_groups.strategy_id 
            AND s.userId = auth.uid()::varchar
        )
    );

-- Users can update their own groups
CREATE POLICY "Users can update their own development groups" ON development_groups
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM strategies s 
            WHERE s.id = development_groups.strategy_id 
            AND s.userId = auth.uid()::varchar
        )
    );

-- Users can delete their own groups
CREATE POLICY "Users can delete their own development groups" ON development_groups
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM strategies s 
            WHERE s.id = development_groups.strategy_id 
            AND s.userId = auth.uid()::varchar
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_development_groups_strategy_id ON development_groups(strategy_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_components_group_ids ON tech_stack_components USING GIN(group_ids);

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_development_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_development_groups_updated_at ON development_groups;
CREATE TRIGGER update_development_groups_updated_at
    BEFORE UPDATE ON development_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_development_groups_updated_at();
