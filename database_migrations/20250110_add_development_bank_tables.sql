-- Development Bank Feature Migration
-- Creates tables for tech stack recommendations, assets, and AI vendor recommendations

-- 1. Tech Stack Selections Table
CREATE TABLE IF NOT EXISTS tech_stacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id INTEGER REFERENCES strategies(id) ON DELETE CASCADE,
    stack_name VARCHAR(255) NOT NULL,
    stack_type VARCHAR(50) NOT NULL CHECK (stack_type IN ('ai-generated', 'template', 'custom')),
    layers JSONB NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL
);

-- 2. Development Bank Assets Table  
CREATE TABLE IF NOT EXISTS dev_bank_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id INTEGER REFERENCES strategies(id) ON DELETE CASCADE,
    asset_type VARCHAR(100) NOT NULL CHECK (asset_type IN ('tech-spec', 'api-spec', 'database-schema', 'deployment-guide')),
    source_card_ids TEXT[], -- Array of card IDs that generated this asset
    tech_stack_id UUID REFERENCES tech_stacks(id) ON DELETE SET NULL,
    content JSONB NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL
);

-- 3. AI Vendor Recommendations Cache Table
CREATE TABLE IF NOT EXISTS ai_vendor_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id INTEGER REFERENCES strategies(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    context JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    generated_by VARCHAR(255) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tech_stacks_strategy_id ON tech_stacks(strategy_id);
CREATE INDEX IF NOT EXISTS idx_tech_stacks_created_at ON tech_stacks(created_at);

CREATE INDEX IF NOT EXISTS idx_dev_bank_assets_strategy_id ON dev_bank_assets(strategy_id);
CREATE INDEX IF NOT EXISTS idx_dev_bank_assets_asset_type ON dev_bank_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_dev_bank_assets_tech_stack_id ON dev_bank_assets(tech_stack_id);
CREATE INDEX IF NOT EXISTS idx_dev_bank_assets_created_at ON dev_bank_assets(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_vendor_recommendations_strategy_id ON ai_vendor_recommendations(strategy_id);
CREATE INDEX IF NOT EXISTS idx_ai_vendor_recommendations_category ON ai_vendor_recommendations(category);
CREATE INDEX IF NOT EXISTS idx_ai_vendor_recommendations_expires_at ON ai_vendor_recommendations(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE tech_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_bank_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_vendor_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tech_stacks
CREATE POLICY "Users can view tech stacks from their strategies" ON tech_stacks
    FOR SELECT USING (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert tech stacks for their strategies" ON tech_stacks
    FOR INSERT WITH CHECK (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their tech stacks" ON tech_stacks
    FOR UPDATE USING (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their tech stacks" ON tech_stacks
    FOR DELETE USING (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for dev_bank_assets
CREATE POLICY "Users can view assets from their strategies" ON dev_bank_assets
    FOR SELECT USING (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert assets for their strategies" ON dev_bank_assets
    FOR INSERT WITH CHECK (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their assets" ON dev_bank_assets
    FOR UPDATE USING (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their assets" ON dev_bank_assets
    FOR DELETE USING (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for ai_vendor_recommendations
CREATE POLICY "Users can view AI recommendations from their strategies" ON ai_vendor_recommendations
    FOR SELECT USING (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert AI recommendations for their strategies" ON ai_vendor_recommendations
    FOR INSERT WITH CHECK (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their AI recommendations" ON ai_vendor_recommendations
    FOR UPDATE USING (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their AI recommendations" ON ai_vendor_recommendations
    FOR DELETE USING (
        strategy_id IN (
            SELECT id FROM strategies 
            WHERE user_id = auth.uid()
        )
    );

-- Cleanup function for expired AI recommendations
CREATE OR REPLACE FUNCTION cleanup_expired_ai_recommendations()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_vendor_recommendations 
    WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a periodic job to clean up expired recommendations
-- This would typically be done via pg_cron or similar extension
-- SELECT cron.schedule('cleanup-ai-recommendations', '0 2 * * *', 'SELECT cleanup_expired_ai_recommendations();');