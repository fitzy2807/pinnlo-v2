-- TRD Multi-Item Structure Migration
-- Creates tables for structured TRD fields that need multi-item support
-- Created: 2025-01-17

-- Create trd_api_endpoints table
CREATE TABLE IF NOT EXISTS trd_api_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    endpoint_id TEXT NOT NULL, -- e.g., "EP-001"
    endpoint_path TEXT NOT NULL, -- e.g., "/api/v1/users"
    http_method TEXT NOT NULL CHECK (http_method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
    description TEXT NOT NULL,
    request_format JSONB DEFAULT '{}', -- JSON schema for request
    response_format JSONB DEFAULT '{}', -- JSON schema for response  
    authentication_required BOOLEAN DEFAULT true,
    rate_limit_requests INTEGER,
    rate_limit_window TEXT, -- e.g., "1 hour", "1 minute"
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'implemented', 'deprecated')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    owner TEXT,
    implementation_notes TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trd_security_controls table
CREATE TABLE IF NOT EXISTS trd_security_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    control_id TEXT NOT NULL, -- e.g., "SEC-001"
    control_title TEXT NOT NULL,
    control_description TEXT NOT NULL,
    control_type TEXT DEFAULT 'preventive' CHECK (control_type IN ('preventive', 'detective', 'corrective')),
    security_domain TEXT DEFAULT 'application' CHECK (security_domain IN ('application', 'data', 'network', 'infrastructure', 'identity')),
    implementation_method TEXT NOT NULL,
    validation_criteria TEXT NOT NULL,
    compliance_frameworks TEXT[], -- e.g., ["SOC2", "GDPR", "HIPAA"]
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    implementation_status TEXT DEFAULT 'planned' CHECK (implementation_status IN ('planned', 'in_progress', 'implemented', 'verified')),
    owner TEXT,
    target_date DATE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trd_performance_requirements table
CREATE TABLE IF NOT EXISTS trd_performance_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    requirement_id TEXT NOT NULL, -- e.g., "PERF-001"
    requirement_title TEXT NOT NULL,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('response_time', 'throughput', 'availability', 'scalability', 'resource_usage')),
    target_value NUMERIC NOT NULL,
    target_unit TEXT NOT NULL, -- e.g., "ms", "rps", "percent", "GB"
    measurement_method TEXT NOT NULL,
    baseline_value NUMERIC,
    threshold_warning NUMERIC,
    threshold_critical NUMERIC,
    monitoring_frequency TEXT DEFAULT 'continuous' CHECK (monitoring_frequency IN ('continuous', 'hourly', 'daily', 'weekly')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'defined' CHECK (status IN ('defined', 'measured', 'validated', 'met')),
    owner TEXT,
    validation_notes TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trd_test_cases table
CREATE TABLE IF NOT EXISTS trd_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    test_case_id TEXT NOT NULL, -- e.g., "TC-001"
    test_title TEXT NOT NULL,
    test_description TEXT NOT NULL,
    test_type TEXT DEFAULT 'functional' CHECK (test_type IN ('unit', 'integration', 'functional', 'performance', 'security', 'acceptance')),
    test_category TEXT DEFAULT 'positive' CHECK (test_category IN ('positive', 'negative', 'boundary', 'edge_case')),
    preconditions TEXT,
    test_steps TEXT NOT NULL,
    expected_result TEXT NOT NULL,
    actual_result TEXT,
    test_data_requirements TEXT,
    automation_status TEXT DEFAULT 'manual' CHECK (automation_status IN ('manual', 'automated', 'semi_automated')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'passed', 'failed', 'blocked', 'skipped')),
    assigned_tester TEXT,
    execution_date DATE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trd_implementation_standards table
CREATE TABLE IF NOT EXISTS trd_implementation_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    standard_id TEXT NOT NULL, -- e.g., "STD-001"
    standard_title TEXT NOT NULL,
    standard_description TEXT NOT NULL,
    standard_category TEXT DEFAULT 'coding' CHECK (standard_category IN ('coding', 'documentation', 'testing', 'deployment', 'security', 'performance')),
    implementation_details TEXT NOT NULL,
    compliance_criteria TEXT NOT NULL,
    validation_method TEXT NOT NULL,
    tools_required TEXT[],
    examples TEXT,
    exceptions TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    enforcement_level TEXT DEFAULT 'required' CHECK (enforcement_level IN ('required', 'recommended', 'optional')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'deprecated')),
    owner TEXT,
    review_date DATE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trd_infrastructure_components table
CREATE TABLE IF NOT EXISTS trd_infrastructure_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    component_id TEXT NOT NULL, -- e.g., "INFRA-001"
    component_name TEXT NOT NULL,
    component_type TEXT DEFAULT 'service' CHECK (component_type IN ('service', 'database', 'cache', 'queue', 'cdn', 'load_balancer', 'storage', 'monitoring')),
    component_description TEXT NOT NULL,
    technology_stack TEXT NOT NULL,
    resource_requirements JSONB DEFAULT '{}', -- CPU, memory, storage specs
    scaling_configuration JSONB DEFAULT '{}', -- Auto-scaling rules
    monitoring_requirements TEXT NOT NULL,
    backup_strategy TEXT,
    disaster_recovery TEXT,
    security_considerations TEXT,
    cost_estimate NUMERIC,
    cost_frequency TEXT CHECK (cost_frequency IN ('hourly', 'daily', 'monthly', 'yearly')),
    deployment_environment TEXT DEFAULT 'production' CHECK (deployment_environment IN ('development', 'staging', 'production', 'all')),
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'provisioned', 'configured', 'deployed', 'operational')),
    owner TEXT,
    implementation_date DATE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trd_data_models table
CREATE TABLE IF NOT EXISTS trd_data_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL, -- e.g., "DM-001"
    model_name TEXT NOT NULL,
    model_description TEXT NOT NULL,
    model_type TEXT DEFAULT 'entity' CHECK (model_type IN ('entity', 'aggregate', 'value_object', 'event', 'dto')),
    schema_definition JSONB NOT NULL, -- JSON schema or table structure
    relationships JSONB DEFAULT '[]', -- References to other models
    validation_rules TEXT NOT NULL,
    indexing_strategy TEXT,
    migration_notes TEXT,
    data_retention_policy TEXT,
    privacy_considerations TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'implemented')),
    owner TEXT,
    version TEXT DEFAULT '1.0',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trd_api_endpoints_card_id ON trd_api_endpoints(card_id);
CREATE INDEX IF NOT EXISTS idx_trd_api_endpoints_order ON trd_api_endpoints(card_id, order_index);
CREATE INDEX IF NOT EXISTS idx_trd_security_controls_card_id ON trd_security_controls(card_id);
CREATE INDEX IF NOT EXISTS idx_trd_security_controls_order ON trd_security_controls(card_id, order_index);
CREATE INDEX IF NOT EXISTS idx_trd_performance_requirements_card_id ON trd_performance_requirements(card_id);
CREATE INDEX IF NOT EXISTS idx_trd_performance_requirements_order ON trd_performance_requirements(card_id, order_index);
CREATE INDEX IF NOT EXISTS idx_trd_test_cases_card_id ON trd_test_cases(card_id);
CREATE INDEX IF NOT EXISTS idx_trd_test_cases_order ON trd_test_cases(card_id, order_index);
CREATE INDEX IF NOT EXISTS idx_trd_implementation_standards_card_id ON trd_implementation_standards(card_id);
CREATE INDEX IF NOT EXISTS idx_trd_implementation_standards_order ON trd_implementation_standards(card_id, order_index);
CREATE INDEX IF NOT EXISTS idx_trd_infrastructure_components_card_id ON trd_infrastructure_components(card_id);
CREATE INDEX IF NOT EXISTS idx_trd_infrastructure_components_order ON trd_infrastructure_components(card_id, order_index);
CREATE INDEX IF NOT EXISTS idx_trd_data_models_card_id ON trd_data_models(card_id);
CREATE INDEX IF NOT EXISTS idx_trd_data_models_order ON trd_data_models(card_id, order_index);

-- Create update triggers for all tables
CREATE TRIGGER update_trd_api_endpoints_updated_at 
    BEFORE UPDATE ON trd_api_endpoints 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trd_security_controls_updated_at 
    BEFORE UPDATE ON trd_security_controls 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trd_performance_requirements_updated_at 
    BEFORE UPDATE ON trd_performance_requirements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trd_test_cases_updated_at 
    BEFORE UPDATE ON trd_test_cases 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trd_implementation_standards_updated_at 
    BEFORE UPDATE ON trd_implementation_standards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trd_infrastructure_components_updated_at 
    BEFORE UPDATE ON trd_infrastructure_components 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trd_data_models_updated_at 
    BEFORE UPDATE ON trd_data_models 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for all tables
ALTER TABLE trd_api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE trd_security_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE trd_performance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE trd_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE trd_implementation_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE trd_infrastructure_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE trd_data_models ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - users can access items for cards they own
CREATE POLICY "Users can access API endpoints for their cards" ON trd_api_endpoints
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access security controls for their cards" ON trd_security_controls
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access performance requirements for their cards" ON trd_performance_requirements
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access test cases for their cards" ON trd_test_cases
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access implementation standards for their cards" ON trd_implementation_standards
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access infrastructure components for their cards" ON trd_infrastructure_components
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access data models for their cards" ON trd_data_models
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

-- Create a view for easy TRD data retrieval with all related items
CREATE OR REPLACE VIEW trd_card_complete AS
SELECT 
    c.id,
    c.title,
    c.description,
    c.card_data,
    c.created_at,
    c.updated_at,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', ae.id,
                'endpoint_id', ae.endpoint_id,
                'endpoint_path', ae.endpoint_path,
                'http_method', ae.http_method,
                'description', ae.description,
                'request_format', ae.request_format,
                'response_format', ae.response_format,
                'authentication_required', ae.authentication_required,
                'rate_limit_requests', ae.rate_limit_requests,
                'rate_limit_window', ae.rate_limit_window,
                'status', ae.status,
                'priority', ae.priority,
                'owner', ae.owner,
                'implementation_notes', ae.implementation_notes,
                'order_index', ae.order_index
            )
        ) FILTER (WHERE ae.id IS NOT NULL),
        '[]'::json
    ) AS api_endpoints,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', sc.id,
                'control_id', sc.control_id,
                'control_title', sc.control_title,
                'control_description', sc.control_description,
                'control_type', sc.control_type,
                'security_domain', sc.security_domain,
                'implementation_method', sc.implementation_method,
                'validation_criteria', sc.validation_criteria,
                'compliance_frameworks', sc.compliance_frameworks,
                'risk_level', sc.risk_level,
                'implementation_status', sc.implementation_status,
                'owner', sc.owner,
                'target_date', sc.target_date,
                'order_index', sc.order_index
            )
        ) FILTER (WHERE sc.id IS NOT NULL),
        '[]'::json
    ) AS security_controls,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', pr.id,
                'requirement_id', pr.requirement_id,
                'requirement_title', pr.requirement_title,
                'metric_type', pr.metric_type,
                'target_value', pr.target_value,
                'target_unit', pr.target_unit,
                'measurement_method', pr.measurement_method,
                'baseline_value', pr.baseline_value,
                'threshold_warning', pr.threshold_warning,
                'threshold_critical', pr.threshold_critical,
                'monitoring_frequency', pr.monitoring_frequency,
                'priority', pr.priority,
                'status', pr.status,
                'owner', pr.owner,
                'validation_notes', pr.validation_notes,
                'order_index', pr.order_index
            )
        ) FILTER (WHERE pr.id IS NOT NULL),
        '[]'::json
    ) AS performance_requirements,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', tc.id,
                'test_case_id', tc.test_case_id,
                'test_title', tc.test_title,
                'test_description', tc.test_description,
                'test_type', tc.test_type,
                'test_category', tc.test_category,
                'preconditions', tc.preconditions,
                'test_steps', tc.test_steps,
                'expected_result', tc.expected_result,
                'actual_result', tc.actual_result,
                'test_data_requirements', tc.test_data_requirements,
                'automation_status', tc.automation_status,
                'priority', tc.priority,
                'status', tc.status,
                'assigned_tester', tc.assigned_tester,
                'execution_date', tc.execution_date,
                'order_index', tc.order_index
            )
        ) FILTER (WHERE tc.id IS NOT NULL),
        '[]'::json
    ) AS test_cases,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', ist.id,
                'standard_id', ist.standard_id,
                'standard_title', ist.standard_title,
                'standard_description', ist.standard_description,
                'standard_category', ist.standard_category,
                'implementation_details', ist.implementation_details,
                'compliance_criteria', ist.compliance_criteria,
                'validation_method', ist.validation_method,
                'tools_required', ist.tools_required,
                'examples', ist.examples,
                'exceptions', ist.exceptions,
                'priority', ist.priority,
                'enforcement_level', ist.enforcement_level,
                'status', ist.status,
                'owner', ist.owner,
                'review_date', ist.review_date,
                'order_index', ist.order_index
            )
        ) FILTER (WHERE ist.id IS NOT NULL),
        '[]'::json
    ) AS implementation_standards,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', ic.id,
                'component_id', ic.component_id,
                'component_name', ic.component_name,
                'component_type', ic.component_type,
                'component_description', ic.component_description,
                'technology_stack', ic.technology_stack,
                'resource_requirements', ic.resource_requirements,
                'scaling_configuration', ic.scaling_configuration,
                'monitoring_requirements', ic.monitoring_requirements,
                'backup_strategy', ic.backup_strategy,
                'disaster_recovery', ic.disaster_recovery,
                'security_considerations', ic.security_considerations,
                'cost_estimate', ic.cost_estimate,
                'cost_frequency', ic.cost_frequency,
                'deployment_environment', ic.deployment_environment,
                'status', ic.status,
                'owner', ic.owner,
                'implementation_date', ic.implementation_date,
                'order_index', ic.order_index
            )
        ) FILTER (WHERE ic.id IS NOT NULL),
        '[]'::json
    ) AS infrastructure_components,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', dm.id,
                'model_id', dm.model_id,
                'model_name', dm.model_name,
                'model_description', dm.model_description,
                'model_type', dm.model_type,
                'schema_definition', dm.schema_definition,
                'relationships', dm.relationships,
                'validation_rules', dm.validation_rules,
                'indexing_strategy', dm.indexing_strategy,
                'migration_notes', dm.migration_notes,
                'data_retention_policy', dm.data_retention_policy,
                'privacy_considerations', dm.privacy_considerations,
                'status', dm.status,
                'owner', dm.owner,
                'version', dm.version,
                'order_index', dm.order_index
            )
        ) FILTER (WHERE dm.id IS NOT NULL),
        '[]'::json
    ) AS data_models
FROM cards c
LEFT JOIN trd_api_endpoints ae ON c.id = ae.card_id
LEFT JOIN trd_security_controls sc ON c.id = sc.card_id
LEFT JOIN trd_performance_requirements pr ON c.id = pr.card_id
LEFT JOIN trd_test_cases tc ON c.id = tc.card_id
LEFT JOIN trd_implementation_standards ist ON c.id = ist.card_id
LEFT JOIN trd_infrastructure_components ic ON c.id = ic.card_id
LEFT JOIN trd_data_models dm ON c.id = dm.card_id
WHERE c.card_type IN ('trd', 'technical-requirement', 'technical-requirement-structured')
GROUP BY c.id, c.title, c.description, c.card_data, c.created_at, c.updated_at;

-- Grant permissions on the view
GRANT SELECT ON trd_card_complete TO authenticated;