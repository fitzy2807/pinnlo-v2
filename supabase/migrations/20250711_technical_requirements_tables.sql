-- Technical Requirements Document (TRD) Tables
-- Creates comprehensive structure for technical requirements based on best practices

-- Main technical requirements table
CREATE TABLE IF NOT EXISTS technical_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id INTEGER NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Feature relationships
    source_feature_ids TEXT[], -- IDs of feature cards this TRD is based on
    
    -- Document control
    version TEXT DEFAULT '1.0.0',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'deprecated')),
    
    -- Structured TRD data (JSONB for flexibility)
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
    
    -- Generated content
    generated_content TEXT, -- Full generated text from Claude 4
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- TRD approval workflow
CREATE TABLE IF NOT EXISTS trd_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trd_id UUID NOT NULL REFERENCES technical_requirements(id) ON DELETE CASCADE,
    approver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRD change log
CREATE TABLE IF NOT EXISTS trd_change_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trd_id UUID NOT NULL REFERENCES technical_requirements(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    changes TEXT NOT NULL,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_technical_requirements_strategy_id ON technical_requirements(strategy_id);
CREATE INDEX IF NOT EXISTS idx_technical_requirements_created_by ON technical_requirements(created_by);
CREATE INDEX IF NOT EXISTS idx_technical_requirements_status ON technical_requirements(status);
CREATE INDEX IF NOT EXISTS idx_trd_approvals_trd_id ON trd_approvals(trd_id);
CREATE INDEX IF NOT EXISTS idx_trd_change_log_trd_id ON trd_change_log(trd_id);

-- GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_technical_requirements_functional_requirements ON technical_requirements USING GIN(functional_requirements);
CREATE INDEX IF NOT EXISTS idx_technical_requirements_security_requirements ON technical_requirements USING GIN(security_requirements);
CREATE INDEX IF NOT EXISTS idx_technical_requirements_api_specifications ON technical_requirements USING GIN(api_specifications);

-- Enable Row Level Security
ALTER TABLE technical_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE trd_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE trd_change_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for technical_requirements
CREATE POLICY "Users can view their own technical requirements" ON technical_requirements
    FOR SELECT USING (created_by = auth.uid()::text);

CREATE POLICY "Users can insert their own technical requirements" ON technical_requirements
    FOR INSERT WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Users can update their own technical requirements" ON technical_requirements
    FOR UPDATE USING (created_by = auth.uid()::text);

CREATE POLICY "Users can delete their own technical requirements" ON technical_requirements
    FOR DELETE USING (created_by = auth.uid()::text);

-- RLS Policies for trd_approvals
CREATE POLICY "Users can view approvals for their TRDs" ON trd_approvals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM technical_requirements 
            WHERE technical_requirements.id = trd_approvals.trd_id 
            AND technical_requirements.created_by = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage approvals for their TRDs" ON trd_approvals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM technical_requirements 
            WHERE technical_requirements.id = trd_approvals.trd_id 
            AND technical_requirements.created_by = auth.uid()::text
        )
    );

-- RLS Policies for trd_change_log
CREATE POLICY "Users can view change log for their TRDs" ON trd_change_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM technical_requirements 
            WHERE technical_requirements.id = trd_change_log.trd_id 
            AND technical_requirements.created_by = auth.uid()::text
        )
    );

CREATE POLICY "Users can add to change log for their TRDs" ON trd_change_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM technical_requirements 
            WHERE technical_requirements.id = trd_change_log.trd_id 
            AND technical_requirements.created_by = auth.uid()::text
        )
    );

-- Update trigger for technical_requirements
CREATE OR REPLACE FUNCTION update_technical_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_technical_requirements_updated_at 
    BEFORE UPDATE ON technical_requirements
    FOR EACH ROW EXECUTE FUNCTION update_technical_requirements_updated_at();
