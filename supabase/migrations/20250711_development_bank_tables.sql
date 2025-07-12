-- Development Bank Tables Migration
-- Creates tables for tech stacks and development assets

-- Create tech_stacks table
CREATE TABLE IF NOT EXISTS tech_stacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id INTEGER NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    stack_name TEXT NOT NULL,
    stack_type TEXT NOT NULL CHECK (stack_type IN ('ai-generated', 'template', 'custom')),
    layers JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create dev_bank_assets table
CREATE TABLE IF NOT EXISTS dev_bank_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id INTEGER NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('tech-spec', 'api-spec', 'database-schema', 'deployment-guide', 'test-scenario', 'task-list')),
    source_card_ids TEXT[],
    tech_stack_id UUID REFERENCES tech_stacks(id) ON DELETE SET NULL,
    content JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create ai_vendor_recommendations table
CREATE TABLE IF NOT EXISTS ai_vendor_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id INTEGER NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    confidence_score NUMERIC(3,2) DEFAULT 0.0,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    generated_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tech_stacks_strategy_id ON tech_stacks(strategy_id);
CREATE INDEX IF NOT EXISTS idx_tech_stacks_created_by ON tech_stacks(created_by);
CREATE INDEX IF NOT EXISTS idx_dev_bank_assets_strategy_id ON dev_bank_assets(strategy_id);
CREATE INDEX IF NOT EXISTS idx_dev_bank_assets_asset_type ON dev_bank_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_dev_bank_assets_tech_stack_id ON dev_bank_assets(tech_stack_id);
CREATE INDEX IF NOT EXISTS idx_ai_vendor_recommendations_strategy_id ON ai_vendor_recommendations(strategy_id);
CREATE INDEX IF NOT EXISTS idx_ai_vendor_recommendations_category ON ai_vendor_recommendations(category);

-- Enable Row Level Security
ALTER TABLE tech_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_bank_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_vendor_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tech_stacks
CREATE POLICY "Users can view their own tech stacks" ON tech_stacks
    FOR SELECT USING (created_by = auth.uid()::text);

CREATE POLICY "Users can insert their own tech stacks" ON tech_stacks
    FOR INSERT WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Users can update their own tech stacks" ON tech_stacks
    FOR UPDATE USING (created_by = auth.uid()::text);

CREATE POLICY "Users can delete their own tech stacks" ON tech_stacks
    FOR DELETE USING (created_by = auth.uid()::text);

-- RLS Policies for dev_bank_assets
CREATE POLICY "Users can view their own dev bank assets" ON dev_bank_assets
    FOR SELECT USING (created_by = auth.uid()::text);

CREATE POLICY "Users can insert their own dev bank assets" ON dev_bank_assets
    FOR INSERT WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Users can update their own dev bank assets" ON dev_bank_assets
    FOR UPDATE USING (created_by = auth.uid()::text);

CREATE POLICY "Users can delete their own dev bank assets" ON dev_bank_assets
    FOR DELETE USING (created_by = auth.uid()::text);

-- RLS Policies for ai_vendor_recommendations
CREATE POLICY "Users can view their own vendor recommendations" ON ai_vendor_recommendations
    FOR SELECT USING (generated_by = auth.uid()::text);

CREATE POLICY "Users can insert their own vendor recommendations" ON ai_vendor_recommendations
    FOR INSERT WITH CHECK (generated_by = auth.uid()::text);

CREATE POLICY "Users can update their own vendor recommendations" ON ai_vendor_recommendations
    FOR UPDATE USING (generated_by = auth.uid()::text);

CREATE POLICY "Users can delete their own vendor recommendations" ON ai_vendor_recommendations
    FOR DELETE USING (generated_by = auth.uid()::text);
