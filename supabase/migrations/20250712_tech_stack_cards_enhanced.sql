-- Enhanced Tech Stack Cards System
-- Created: 2025-07-12
-- Purpose: Comprehensive tech stack management with AI generation support

-- Create tech_stack_cards table for specialized tech stack management
CREATE TABLE IF NOT EXISTS tech_stack_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Technology Identity & Classification (AI Auto-Generatable)
  technology_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Frontend', 'Backend', 'Database', 'Infrastructure', 'DevOps', 'Analytics', 'Security', 'Integration', 'Mobile')),
  subcategory TEXT,
  version_current TEXT,
  vendor TEXT,
  license_type TEXT,
  language_ecosystem TEXT,
  
  -- Technical Capabilities & Constraints (AI Auto-Generatable + Company Context)
  primary_functions JSONB DEFAULT '[]'::jsonb,
  technical_specifications JSONB DEFAULT '{}'::jsonb, -- performance, scalability, resources, security
  
  -- Company-Specific Implementation
  our_implementation JSONB DEFAULT '{}'::jsonb, -- version_used, features_enabled, configurations, optimizations
  
  -- Integration Architecture (AI Auto-Generatable Capabilities)
  integration_capabilities JSONB DEFAULT '{}'::jsonb, -- APIs, data formats, auth methods, patterns
  
  -- Company-Specific Integration Implementation
  our_integrations JSONB DEFAULT '{}'::jsonb, -- connects_to, data_flow, auth_impl, error_handling
  
  -- Development & Deployment Context (AI Auto-Generatable Patterns)
  development_patterns JSONB DEFAULT '{}'::jsonb, -- build tools, testing, deployment targets
  
  -- Company-Specific Development Workflow
  our_workflow JSONB DEFAULT '{}'::jsonb, -- build process, testing approach, deployment method, CI/CD
  
  -- Dependencies & Ecosystem (AI Auto-Generatable)
  dependencies JSONB DEFAULT '{}'::jsonb, -- runtime, development, peer dependencies
  ecosystem_compatibility JSONB DEFAULT '{}'::jsonb, -- works with, common libraries
  
  -- Company-Specific Technology Stack
  our_dependencies JSONB DEFAULT '{}'::jsonb, -- specific libraries, versions, configurations
  
  -- Implementation Standards & Patterns (AI Auto-Generatable Best Practices)
  recommended_patterns JSONB DEFAULT '{}'::jsonb, -- component structure, state management, error handling
  
  -- Company-Specific Standards
  our_standards JSONB DEFAULT '{}'::jsonb, -- code structure, naming, testing requirements, documentation
  
  -- Performance & Monitoring (AI Auto-Generatable Capabilities)
  performance_features JSONB DEFAULT '{}'::jsonb, -- optimization techniques, monitoring options, caching
  
  -- Company-Specific Performance Metrics
  our_performance JSONB DEFAULT '{}'::jsonb, -- target metrics, monitoring tools, performance budget
  
  -- Security & Compliance (AI Auto-Generatable Security Features)
  security_capabilities JSONB DEFAULT '{}'::jsonb, -- built-in protections, secure coding, vulnerability scanning
  
  -- Company-Specific Security Implementation
  our_security JSONB DEFAULT '{}'::jsonb, -- authentication flow, data protection, compliance measures
  
  -- Troubleshooting & Support (AI Auto-Generatable Common Issues)
  common_issues JSONB DEFAULT '{}'::jsonb, -- typical problems, debugging tools, community resources
  
  -- Company-Specific Support Structure
  our_support JSONB DEFAULT '{}'::jsonb, -- internal expertise, escalation path, documentation location
  
  -- TRD Generation Context (Company-Specific - Critical for TRD Generation)
  implementation_guidance JSONB DEFAULT '{}'::jsonb, -- typical tasks, code patterns, quality requirements
  
  -- Universal card fields from existing system
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tech_stack_cards_strategy_id ON tech_stack_cards(strategy_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_cards_user_id ON tech_stack_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_cards_category ON tech_stack_cards(category);
CREATE INDEX IF NOT EXISTS idx_tech_stack_cards_technology_name ON tech_stack_cards(technology_name);
CREATE INDEX IF NOT EXISTS idx_tech_stack_cards_ai_generated ON tech_stack_cards(ai_generated);

-- Create GIN indexes for JSONB fields that will be queried frequently
CREATE INDEX IF NOT EXISTS idx_tech_stack_cards_tags ON tech_stack_cards USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_tech_stack_cards_our_implementation ON tech_stack_cards USING GIN(our_implementation);
CREATE INDEX IF NOT EXISTS idx_tech_stack_cards_dependencies ON tech_stack_cards USING GIN(dependencies);
CREATE INDEX IF NOT EXISTS idx_tech_stack_cards_implementation_guidance ON tech_stack_cards USING GIN(implementation_guidance);

-- Create update trigger for updated_at
CREATE TRIGGER update_tech_stack_cards_updated_at 
    BEFORE UPDATE ON tech_stack_cards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE tech_stack_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own tech stack cards" ON tech_stack_cards
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tech stack cards" ON tech_stack_cards
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tech stack cards" ON tech_stack_cards
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tech stack cards" ON tech_stack_cards
  FOR DELETE USING (user_id = auth.uid());

-- Create function to generate streamlined tech stack summary
CREATE OR REPLACE FUNCTION generate_tech_stack_summary(card_id UUID)
RETURNS JSONB AS $$
DECLARE
  card_data RECORD;
  summary JSONB;
BEGIN
  SELECT * INTO card_data FROM tech_stack_cards WHERE id = card_id;
  
  IF NOT FOUND THEN
    RETURN '{"error": "Card not found"}'::jsonb;
  END IF;
  
  summary := jsonb_build_object(
    'technology_identity', jsonb_build_object(
      'name', card_data.technology_name,
      'category', card_data.category,
      'subcategory', card_data.subcategory,
      'version', card_data.version_current,
      'ecosystem', card_data.language_ecosystem
    ),
    'technical_implementation', jsonb_build_object(
      'capabilities', card_data.primary_functions,
      'our_setup', card_data.our_implementation
    ),
    'integration_context', jsonb_build_object(
      'connects_to', (card_data.our_integrations->>'connects_to')::jsonb,
      'data_patterns', (card_data.our_integrations->>'data_flow_patterns')::jsonb,
      'auth_method', card_data.our_integrations->>'authentication_implementation'
    ),
    'development_standards', jsonb_build_object(
      'structure', card_data.our_standards->>'code_structure',
      'testing', card_data.our_standards->>'testing_requirements',
      'performance', card_data.our_performance->>'target_metrics'
    ),
    'trd_generation_context', card_data.implementation_guidance
  );
  
  RETURN summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create tech stack templates for common technologies
CREATE TABLE IF NOT EXISTS tech_stack_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technology_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  template_data JSONB NOT NULL, -- Pre-filled AI-generatable data
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some common technology templates
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
  }
}'::jsonb),
('PostgreSQL', 'Database', '{
  "subcategory": "Relational Database",
  "vendor": "PostgreSQL Global Development Group",
  "license_type": "PostgreSQL License",
  "language_ecosystem": "SQL",
  "primary_functions": ["Data storage", "ACID transactions", "Advanced querying"],
  "technical_specifications": {
    "performance_characteristics": "MVCC, parallel queries, indexing",
    "scalability_limits": "Single-master by default, horizontal scaling via extensions",
    "resource_requirements": "1GB+ RAM, SSD storage recommended",
    "security_features": ["Row Level Security", "SSL/TLS", "Role-based access control"]
  }
}'::jsonb);

-- Create function to create tech stack card from template
CREATE OR REPLACE FUNCTION create_tech_stack_from_template(
  p_strategy_id UUID,
  p_user_id UUID,
  p_technology_name TEXT,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  template_record RECORD;
  new_card_id UUID;
  card_title TEXT;
  card_description TEXT;
BEGIN
  -- Get template data
  SELECT * INTO template_record 
  FROM tech_stack_templates 
  WHERE technology_name = p_technology_name;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found for technology: %', p_technology_name;
  END IF;
  
  -- Set defaults
  card_title := COALESCE(p_title, p_technology_name || ' - ' || (template_record.template_data->>'subcategory'));
  card_description := COALESCE(p_description, 'Technology stack component for ' || p_technology_name);
  
  -- Insert new tech stack card
  INSERT INTO tech_stack_cards (
    strategy_id,
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
    p_strategy_id,
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
    card_title,
    card_description,
    true,
    jsonb_build_object('template_used', p_technology_name, 'generated_at', NOW())
  ) RETURNING id INTO new_card_id;
  
  RETURN new_card_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes on templates table
CREATE INDEX IF NOT EXISTS idx_tech_stack_templates_technology_name ON tech_stack_templates(technology_name);
CREATE INDEX IF NOT EXISTS idx_tech_stack_templates_category ON tech_stack_templates(category);
