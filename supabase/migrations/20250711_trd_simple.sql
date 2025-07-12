-- Simple Technical Requirements Table
CREATE TABLE IF NOT EXISTS technical_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    source_feature_ids TEXT[],
    version TEXT DEFAULT '1.0.0',
    status TEXT DEFAULT 'draft',
    document_control JSONB DEFAULT '{}',
    business_context JSONB DEFAULT '{}',
    functional_requirements JSONB DEFAULT '[]',
    system_architecture JSONB DEFAULT '{}',
    performance_requirements JSONB DEFAULT '[]',
    scalability_requirements JSONB DEFAULT '[]',
    security_requirements JSONB DEFAULT '[]',
    data_model JSONB DEFAULT '{}',
    api_specifications JSONB DEFAULT '[]',
    testing_strategy JSONB DEFAULT '{}',
    quality_gates JSONB DEFAULT '[]',
    monitoring JSONB DEFAULT '{}',
    deployment JSONB DEFAULT '{}',
    risk_assessment JSONB DEFAULT '[]',
    compliance_requirements JSONB DEFAULT '[]',
    implementation_phases JSONB DEFAULT '[]',
    generated_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE technical_requirements ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy
DROP POLICY IF EXISTS "Enable all for users" ON technical_requirements;
CREATE POLICY "Enable all for users" ON technical_requirements FOR ALL USING (created_by = auth.uid()::text);
