-- Just create the missing development bank tables
CREATE TABLE IF NOT EXISTS tech_stacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id INTEGER NOT NULL,
    stack_name TEXT NOT NULL,
    stack_type TEXT NOT NULL DEFAULT 'ai-generated',
    layers JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dev_bank_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id INTEGER NOT NULL,
    asset_type TEXT NOT NULL,
    source_card_ids TEXT[],
    tech_stack_id UUID,
    content JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE tech_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_bank_assets ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
DROP POLICY IF EXISTS "Enable read access for users" ON tech_stacks;
CREATE POLICY "Enable read access for users" ON tech_stacks FOR ALL USING (created_by = auth.uid()::text);

DROP POLICY IF EXISTS "Enable read access for users" ON dev_bank_assets;
CREATE POLICY "Enable read access for users" ON dev_bank_assets FOR ALL USING (created_by = auth.uid()::text);
