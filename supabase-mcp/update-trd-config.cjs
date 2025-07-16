const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const trdConfig = {
  id: 'trd',
  name: 'Technical Requirements Document',
  description: 'Generate comprehensive technical requirements with detailed specifications across all 52+ fields and 7 multi-item arrays',
  prompt: `You are generating a comprehensive Technical Requirements Document (TRD) that serves as the definitive technical specification for development teams. This TRD must be thorough, technically accurate, and implementation-ready.

CRITICAL REQUIREMENTS:
- Generate ALL 52+ individual fields with meaningful, detailed content
- Populate ALL 7 multi-item arrays with 5-15 items each
- Ensure technical accuracy and implementation readiness
- Provide specific, measurable criteria and targets
- Include realistic technology choices and architectural decisions

FIELD STRUCTURE - GENERATE ALL FIELDS:

1. Executive Summary (5 fields):
   - system_overview: Comprehensive technical architecture overview with specific technologies and patterns
   - business_purpose: Business context and strategic alignment with measurable outcomes
   - key_architectural_decisions: Critical technical decisions with rationale and trade-offs
   - strategic_alignment: Alignment with company tech strategy and platform roadmap
   - success_criteria: Specific, measurable technical and business success metrics

2. System Architecture (8 fields):
   - high_level_design: Overall system architecture with service decomposition and integration patterns
   - component_interactions: Inter-service communication protocols and data flow patterns
   - technology_stack_frontend: Frontend frameworks, libraries, and build tools with versions
   - technology_stack_backend: Backend frameworks, runtime environments, and middleware
   - technology_stack_database: Database systems, ORM, caching, and data storage solutions
   - technology_stack_other: Infrastructure components, monitoring, and deployment platforms
   - integration_points: External system integrations and third-party API dependencies
   - data_flow: Data movement patterns, transformation, and processing workflows

3. Feature-Specific Requirements (6 fields):
   - feature_overview: Comprehensive feature scope and functionality description
   - technical_approach: Implementation strategy with algorithms and design patterns
   - required_components: Necessary technical components, services, and dependencies
   - data_flow_processing: Data processing workflows and transformation logic
   - business_logic: Core business rules, validation logic, and decision-making processes
   - ui_requirements: User interface components, interactions, and experience requirements

4. Data Architecture (5 fields):
   - database_schema: Table structures, columns, data types, and constraints
   - data_relationships: Entity relationships, foreign keys, and referential integrity
   - validation_rules: Data validation constraints and business rule enforcement
   - migration_strategies: Database migration procedures and versioning approach
   - data_governance: Privacy policies, retention rules, and compliance requirements

5. API Specifications (5 fields):
   - endpoint_definitions: REST API endpoints with paths, methods, and parameters
   - request_response_formats: JSON schemas and data validation specifications
   - authentication_methods: Authentication flows and authorization implementation
   - rate_limiting: Rate limiting policies, quotas, and throttling strategies
   - error_handling: Error response patterns, status codes, and recovery procedures

6. Security Requirements (5 fields):
   - authentication_authorization: User authentication and access control mechanisms
   - data_encryption: Encryption at rest and in transit with key management
   - input_validation: Input sanitization and security filtering requirements
   - security_headers: HTTP security headers and browser protection mechanisms
   - compliance_requirements: Regulatory compliance and security standards

7. Performance & Scalability (5 fields):
   - performance_targets: Specific performance metrics with measurable targets
   - caching_strategies: Multi-layer caching implementation and optimization
   - load_balancing: Load distribution strategies and traffic management
   - database_optimization: Database performance tuning and optimization approaches
   - scaling_plans: Horizontal and vertical scaling strategies with auto-scaling

8. Infrastructure Requirements (5 fields):
   - hosting_deployment: Hosting platform and deployment architecture specifications
   - environment_configurations: Development, staging, and production environment setup
   - monitoring_logging: System monitoring, logging strategies, and alerting mechanisms
   - backup_recovery: Data backup procedures and disaster recovery planning
   - resource_requirements: Compute, storage, and network resource specifications

9. Testing Strategy (5 fields):
   - unit_testing: Unit testing frameworks, coverage targets, and quality gates
   - integration_testing: Integration testing strategy and API validation approaches
   - performance_testing: Load testing scenarios and performance benchmarking
   - security_testing: Security testing procedures and vulnerability assessment
   - user_acceptance_testing: UAT criteria and stakeholder validation processes

10. Implementation Guidelines (5 fields):
   - development_standards: Coding conventions and development best practices
   - code_organization: Project structure and architectural organization patterns
   - documentation_requirements: Technical documentation standards and requirements
   - version_control: Git workflows, branching strategies, and release management
   - deployment_pipeline: CI/CD pipeline stages and deployment automation

11. Metadata & Relationships (8 fields):
   - trd_id: Unique identifier (TRD-XXX format)
   - version: Document version (semantic versioning)
   - status: Approval status (Draft/Review/Approved)
   - assigned_team: Responsible development teams
   - linked_features: Related PRDs and feature dependencies
   - dependencies: Technical dependencies and prerequisites
   - tags: Searchable tags and categories
   - implementation_notes: Additional implementation guidance

MULTI-ITEM ARRAYS - GENERATE 5-15 ITEMS EACH:

1. api_endpoints: RESTful API specifications with complete CRUD operations
2. security_controls: Security implementations covering all domains
3. performance_requirements: Measurable performance targets and metrics
4. test_cases: Comprehensive test scenarios across all testing types
5. implementation_standards: Development standards and coding guidelines
6. infrastructure_components: Infrastructure specifications and resource requirements
7. data_models: Database schema and entity definitions

Generate comprehensive, technically accurate content for ALL fields. Use realistic technology choices, specific metrics, and implementation-ready specifications.`,
  config: {
    fieldCount: 52,
    sections: 10,
    multiItemArrays: 7,
    comprehensiveGeneration: true,
    technicalAccuracy: true,
    implementationReady: true
  }
};

async function updateTRDSystemPrompt() {
  try {
    const { data, error } = await supabase
      .from('card_creator_system_prompts')
      .upsert({
        id: 'b8f9e2c1-4d5a-4a7b-8e1f-3c2b1a9d8e7f',
        prompt_type: 'card_creator',
        section_id: 'trd',
        display_name: 'Technical Requirements Document',
        description: trdConfig.description,
        preview_prompt: 'Preview comprehensive technical requirements with detailed architecture, security, and implementation specifications.',
        generation_prompt: trdConfig.prompt,
        config: trdConfig.config,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'id' 
      });

    if (error) {
      console.error('Error updating TRD system prompt:', error);
      process.exit(1);
    }

    console.log('✅ Successfully updated TRD system prompt configuration');
    console.log('📊 Configuration includes:');
    console.log('   - 10 sections with 52+ individual fields');
    console.log('   - 7 multi-item array types with detailed specifications');
    console.log('   - Comprehensive field-specific generation instructions');
    console.log('   - Technical accuracy and implementation readiness requirements');
    
  } catch (err) {
    console.error('Failed to update TRD system prompt:', err);
    process.exit(1);
  }
}

updateTRDSystemPrompt();