-- Enhanced Tech Stack Cards for Development Bank
-- Migration: 20250712_tech_stack_cards_enhanced.sql
-- Purpose: Add comprehensive tech stack component cards to Development Bank

-- Create tech_stack_components table for individual technology components
CREATE TABLE IF NOT EXISTS tech_stack_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tech_stack_id UUID NOT NULL REFERENCES tech_stacks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Technology Identity & Classification (🤖 AI Auto-Generatable)
  technology_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Frontend', 'Backend', 'Database', 'Infrastructure', 'DevOps', 'Analytics', 'Security', 'Integration', 'Mobile')),
  subcategory TEXT,
  version_current TEXT,
  vendor TEXT,
  license_type TEXT,
  language_ecosystem TEXT,
  
  -- Technical Capabilities & Constraints (🤖 AI Auto-Generatable + 🏢 Company Context)
  primary_functions JSONB DEFAULT '[]'::jsonb,
  technical_specifications JSONB DEFAULT '{
    "performance_characteristics": "",
    "scalability_limits": "",
    "resource_requirements": "",
    "security_features": []
  }'::jsonb,
  
  -- Company-Specific Implementation (🏢 Company Context)
  our_implementation JSONB DEFAULT '{
    "version_used": "",
    "key_features_enabled": [],
    "custom_configurations": [],
    "performance_optimizations": []
  }'::jsonb,
  
  -- Integration Architecture (🤖 AI Auto-Generatable Capabilities)
  integration_capabilities JSONB DEFAULT '{
    "apis_supported": [],
    "data_formats": [],
    "authentication_methods": [],
    "communication_patterns": []
  }'::jsonb,
  
  -- Company-Specific Integration Implementation (🏢 Company Context)
  our_integrations JSONB DEFAULT '{
    "connects_to": [],
    "data_flow_patterns": [],
    "authentication_implementation": "",
    "error_handling_strategy": ""
  }'::jsonb,
  
  -- Development & Deployment Context (🤖 AI Auto-Generatable Patterns)
  development_patterns JSONB DEFAULT '{
    "build_tools": [],
    "testing_frameworks": [],
    "deployment_targets": []
  }'::jsonb,
  
  -- Company-Specific Development Workflow (🏢 Company Context)
  our_workflow JSONB DEFAULT '{
    "build_process": "",
    "testing_approach": "",
    "deployment_method": "",
    "environment_config": "",
    "ci_cd_integration": ""
  }'::jsonb,
  
  -- Dependencies & Ecosystem (🤖 AI Auto-Generatable)
  dependencies JSONB DEFAULT '{
    "runtime_dependencies": [],
    "development_dependencies": [],
    "peer_dependencies": []
  }'::jsonb,
  
  ecosystem_compatibility JSONB DEFAULT '{
    "works_with": [],
    "common_libraries": []
  }'::jsonb,
  
  -- Company-Specific Technology Stack (🏢 Company Context)
  our_dependencies JSONB DEFAULT '{
    "ui_library": "",
    "state_management": "",
    "routing": "",
    "http_client": "",
    "form_handling": ""
  }'::jsonb,
  
  -- Implementation Standards & Patterns (🤖 AI Auto-Generatable Best Practices)
  recommended_patterns JSONB DEFAULT '{
    "component_structure": "",
    "state_management": "",
    "error_handling": "",
    "performance": ""
  }'::jsonb,
  
  -- Company-Specific Standards (🏢 Company Context)
  our_standards JSONB DEFAULT '{
    "code_structure": "",
    "naming_conventions": "",
    "state_patterns": "",
    "testing_requirements": "",
    "documentation": ""
  }'::jsonb,
  
  -- Performance & Monitoring (🤖 AI Auto-Generatable Capabilities)
  performance_features JSONB DEFAULT '{
    "optimization_techniques": [],
    "monitoring_options": [],
    "caching_strategies": []
  }'::jsonb,
  
  -- Company-Specific Performance Metrics (🏢 Company Context)
  our_performance JSONB DEFAULT '{
    "target_metrics": {},
    "monitoring_tools": "",
    "performance_budget": ""
  }'::jsonb,
  
  -- Security & Compliance (🤖 AI Auto-Generatable Security Features)
  security_capabilities JSONB DEFAULT '{
    "built_in_protections": [],
    "secure_coding_practices": [],
    "vulnerability_scanning": ""
  }'::jsonb,
  
  -- Company-Specific Security Implementation (🏢 Company Context)
  our_security JSONB DEFAULT '{
    "authentication_flow": "",
    "data_protection": "",
    "compliance_measures": "",
    "security_tools": ""
  }'::jsonb,
  
  -- Troubleshooting & Support (🤖 AI Auto-Generatable Common Issues)
  common_issues JSONB DEFAULT '{
    "typical_problems": [],
    "debugging_tools": [],
    "community_resources": []
  }'::jsonb,
  
  -- Company-Specific Support Structure (🏢 Company Context)
  our_support JSONB DEFAULT '{
    "internal_expertise": [],
    "escalation_path": "",
    "documentation_location": "",
    "known_issues": ""
  }'::jsonb,
  
  -- TRD Generation Context (🏢 Company-Specific - Critical for TRD Generation)
  implementation_guidance JSONB DEFAULT '{
    "typical_tasks": [],
    "code_patterns": {},
    "quality_requirements": {},
    "deployment_considerations": {}
  }'::jsonb,
  
  -- Universal fields
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  confidence_level TEXT DEFAULT 'Medium' CHECK (confidence_level IN ('High', 'Medium', 'Low')),
  priority_rationale TEXT DEFAULT '',
  confidence_rationale TEXT DEFAULT '',
  strategic_alignment TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  relationships JSONB DEFAULT '[]'::jsonb,
  
  -- AI Generation Metadata
  ai_generated BOOLEAN DEFAULT false,
  ai_generation_context JSONB DEFAULT '{}'::jsonb,
  generation_quality_score INTEGER DEFAULT NULL CHECK (generation_quality_score >= 1 AND generation_quality_score <= 10),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create tech_stack_templates table for reusable technology templates
CREATE TABLE IF NOT EXISTS tech_stack_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technology_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  template_data JSONB NOT NULL, -- Pre-filled AI-generatable data
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tech_stack_components_tech_stack_id ON tech_stack_components(tech_stack_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_components_user_id ON tech_stack_components(user_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_components_category ON tech_stack_components(category);
CREATE INDEX IF NOT EXISTS idx_tech_stack_components_technology_name ON tech_stack_components(technology_name);
CREATE INDEX IF NOT EXISTS idx_tech_stack_components_ai_generated ON tech_stack_components(ai_generated);

-- Create GIN indexes for JSONB fields that will be queried frequently
CREATE INDEX IF NOT EXISTS idx_tech_stack_components_tags ON tech_stack_components USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_tech_stack_components_our_implementation ON tech_stack_components USING GIN(our_implementation);
CREATE INDEX IF NOT EXISTS idx_tech_stack_components_dependencies ON tech_stack_components USING GIN(dependencies);
CREATE INDEX IF NOT EXISTS idx_tech_stack_components_implementation_guidance ON tech_stack_components USING GIN(implementation_guidance);

-- Create indexes on templates table
CREATE INDEX IF NOT EXISTS idx_tech_stack_templates_technology_name ON tech_stack_templates(technology_name);
CREATE INDEX IF NOT EXISTS idx_tech_stack_templates_category ON tech_stack_templates(category);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tech_stack_components_updated_at 
    BEFORE UPDATE ON tech_stack_components 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tech_stack_templates_updated_at 
    BEFORE UPDATE ON tech_stack_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE tech_stack_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tech_stack_components
CREATE POLICY "Users can view their own tech stack components" ON tech_stack_components
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tech stack components" ON tech_stack_components
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tech stack components" ON tech_stack_components
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tech stack components" ON tech_stack_components
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for tech_stack_templates (read-only for all users, admin insert/update)
CREATE POLICY "All users can view tech stack templates" ON tech_stack_templates
  FOR SELECT TO authenticated USING (true);

-- Only allow inserts/updates from service role (for seeding templates)
CREATE POLICY "Service role can manage templates" ON tech_stack_templates
  FOR ALL TO service_role USING (true);

-- Function to generate streamlined tech stack summary
CREATE OR REPLACE FUNCTION generate_tech_stack_summary(component_id UUID)
RETURNS JSONB AS $$
DECLARE
  component_data RECORD;
  summary JSONB;
BEGIN
  SELECT * INTO component_data FROM tech_stack_components WHERE id = component_id;
  
  IF NOT FOUND THEN
    RETURN '{"error": "Component not found"}'::jsonb;
  END IF;
  
  summary := jsonb_build_object(
    'technology_identity', jsonb_build_object(
      'name', component_data.technology_name,
      'category', component_data.category,
      'subcategory', component_data.subcategory,
      'version', component_data.version_current,
      'ecosystem', component_data.language_ecosystem
    ),
    'technical_implementation', jsonb_build_object(
      'capabilities', component_data.primary_functions,
      'our_setup', component_data.our_implementation
    ),
    'integration_context', jsonb_build_object(
      'connects_to', (component_data.our_integrations->>'connects_to')::jsonb,
      'data_patterns', (component_data.our_integrations->>'data_flow_patterns')::jsonb,
      'auth_method', component_data.our_integrations->>'authentication_implementation'
    ),
    'development_standards', jsonb_build_object(
      'structure', component_data.our_standards->>'code_structure',
      'testing', component_data.our_standards->>'testing_requirements',
      'performance', component_data.our_performance->>'target_metrics'
    ),
    'trd_generation_context', component_data.implementation_guidance
  );
  
  RETURN summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create tech stack component from template
CREATE OR REPLACE FUNCTION create_tech_stack_from_template(
  p_tech_stack_id UUID,
  p_user_id UUID,
  p_technology_name TEXT,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  template_record RECORD;
  new_component_id UUID;
  component_title TEXT;
  component_description TEXT;
BEGIN
  -- Get template data
  SELECT * INTO template_record 
  FROM tech_stack_templates 
  WHERE technology_name = p_technology_name;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found for technology: %', p_technology_name;
  END IF;
  
  -- Set defaults
  component_title := COALESCE(p_title, p_technology_name || ' - ' || (template_record.template_data->>'subcategory'));
  component_description := COALESCE(p_description, 'Technology stack component for ' || p_technology_name);
  
  -- Insert new tech stack component
  INSERT INTO tech_stack_components (
    tech_stack_id,
    user_id,
    technology_name,
    category,
    subcategory,
    vendor,
    license_type,
    language_ecosystem,
    primary_functions,
    technical_specifications,
    integration_capabilities,
    development_patterns,
    dependencies,
    ecosystem_compatibility,
    recommended_patterns,
    performance_features,
    security_capabilities,
    common_issues,
    title,
    description,
    ai_generated,
    ai_generation_context
  ) VALUES (
    p_tech_stack_id,
    p_user_id,
    p_technology_name,
    template_record.category,
    template_record.template_data->>'subcategory',
    template_record.template_data->>'vendor',
    template_record.template_data->>'license_type',
    template_record.template_data->>'language_ecosystem',
    template_record.template_data->'primary_functions',
    template_record.template_data->'technical_specifications',
    template_record.template_data->'integration_capabilities',
    template_record.template_data->'development_patterns',
    template_record.template_data->'dependencies',
    template_record.template_data->'ecosystem_compatibility',
    template_record.template_data->'recommended_patterns',
    template_record.template_data->'performance_features',
    template_record.template_data->'security_capabilities',
    template_record.template_data->'common_issues',
    component_title,
    component_description,
    true,
    jsonb_build_object('template_used', p_technology_name, 'generated_at', NOW())
  ) RETURNING id INTO new_component_id;
  
  RETURN new_component_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert common technology templates
INSERT INTO tech_stack_templates (technology_name, category, template_data) VALUES
('React', 'Frontend', '{
  "subcategory": "UI Framework",
  "vendor": "Meta",
  "license_type": "MIT",
  "language_ecosystem": "JavaScript/TypeScript",
  "primary_functions": ["Component-based UI development", "State management", "Client-side routing"],
  "technical_specifications": {
    "performance_characteristics": "Virtual DOM, 60fps rendering",
    "scalability_limits": "Client-side only, requires bundling optimization",
    "resource_requirements": "Modern browser, 16MB+ memory",
    "security_features": ["XSS protection", "Content Security Policy support"]
  },
  "integration_capabilities": {
    "apis_supported": ["REST", "GraphQL", "WebSocket"],
    "data_formats": ["JSON", "XML", "FormData"],
    "authentication_methods": ["JWT", "OAuth 2.0", "Session cookies"],
    "communication_patterns": ["HTTP client", "Real-time subscriptions"]
  },
  "development_patterns": {
    "build_tools": ["Webpack", "Vite", "Create React App"],
    "testing_frameworks": ["Jest", "React Testing Library", "Cypress"],
    "deployment_targets": ["Static hosting", "CDN", "Server-side rendering"]
  },
  "dependencies": {
    "runtime_dependencies": ["react-dom", "react-router", "axios"],
    "development_dependencies": ["typescript", "@types/react", "eslint"],
    "peer_dependencies": ["node.js >=14"]
  },
  "ecosystem_compatibility": {
    "works_with": ["Express.js", "Next.js", "Gatsby", "Electron"],
    "common_libraries": ["Material-UI", "Styled Components", "Redux", "Zustand"]
  },
  "recommended_patterns": {
    "component_structure": "Functional components with hooks",
    "state_management": "Context API for global state, local state for components",
    "error_handling": "Error boundaries, try-catch for async operations",
    "performance": "React.memo, useMemo, useCallback for optimization"
  },
  "performance_features": {
    "optimization_techniques": ["Code splitting", "Tree shaking", "Bundle analysis"],
    "monitoring_options": ["React DevTools", "Performance API", "Core Web Vitals"],
    "caching_strategies": ["Browser caching", "Service workers", "Memory caching"]
  },
  "security_capabilities": {
    "built_in_protections": ["XSS prevention", "CSRF protection"],
    "secure_coding_practices": ["Input sanitization", "Output encoding"],
    "vulnerability_scanning": "npm audit, Snyk integration"
  },
  "common_issues": {
    "typical_problems": ["Bundle size bloat", "Memory leaks", "Hydration mismatches"],
    "debugging_tools": ["React DevTools", "Browser DevTools", "Source maps"],
    "community_resources": ["Official docs", "Stack Overflow", "GitHub issues"]
  }
}'::jsonb),

('Node.js', 'Backend', '{
  "subcategory": "Runtime Environment",
  "vendor": "Node.js Foundation",
  "license_type": "MIT",
  "language_ecosystem": "JavaScript/TypeScript",
  "primary_functions": ["Server-side JavaScript execution", "API development", "Microservices"],
  "technical_specifications": {
    "performance_characteristics": "Event-driven, non-blocking I/O",
    "scalability_limits": "CPU-intensive tasks may block event loop",
    "resource_requirements": "512MB+ RAM, modern CPU",
    "security_features": ["Built-in crypto module", "HTTPS support", "Process isolation"]
  },
  "integration_capabilities": {
    "apis_supported": ["REST", "GraphQL", "gRPC", "WebSocket"],
    "data_formats": ["JSON", "XML", "Protocol Buffers", "MessagePack"],
    "authentication_methods": ["JWT", "OAuth 2.0", "Passport.js", "Session-based"],
    "communication_patterns": ["HTTP/HTTPS", "WebSocket", "Server-sent events", "Message queues"]
  },
  "development_patterns": {
    "build_tools": ["npm", "yarn", "webpack", "rollup"],
    "testing_frameworks": ["Jest", "Mocha", "Chai", "Supertest"],
    "deployment_targets": ["Docker", "PM2", "Serverless", "Cloud platforms"]
  }
}'::jsonb),

('PostgreSQL', 'Database', '{
  "subcategory": "Relational Database",
  "vendor": "PostgreSQL Global Development Group",
  "license_type": "PostgreSQL License",
  "language_ecosystem": "SQL",
  "primary_functions": ["Data storage", "ACID transactions", "Advanced querying", "JSON support"],
  "technical_specifications": {
    "performance_characteristics": "MVCC, parallel queries, advanced indexing",
    "scalability_limits": "Single-master by default, horizontal scaling via extensions",
    "resource_requirements": "1GB+ RAM, SSD storage recommended",
    "security_features": ["Row Level Security", "SSL/TLS", "Role-based access control", "Data encryption"]
  },
  "integration_capabilities": {
    "apis_supported": ["Native protocol", "JDBC", "ODBC", "libpq"],
    "data_formats": ["SQL", "JSON", "JSONB", "XML", "CSV"],
    "authentication_methods": ["Password", "LDAP", "Kerberos", "Certificate"],
    "communication_patterns": ["Connection pooling", "Replication", "Logical replication"]
  }
}'::jsonb)

ON CONFLICT (technology_name) DO NOTHING;
