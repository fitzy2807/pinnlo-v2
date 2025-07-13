'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Trash2, Copy, FileText, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Import shared components
import { 
  useAutoSave,
  useKeyboardShortcuts,
  useValidation,
  validators,
  CardContainer,
  CardHeader,
  CollapsibleSection,
  AIEnhancedField,
  SaveIndicator,
  ErrorBoundary,
  SectionPreview
} from '@/components/shared/cards'

interface TechnicalRequirementCardProps {
  requirement: {
    id: string
    title: string
    description: string
    card_data: any
    created_at: string
    updated_at: string
  }
  onUpdate?: (id: string, updates: any) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
  onCommitToTasks?: (requirement: any) => void
  isSelected?: boolean
  onSelect?: (id: string) => void
}

// TRD-specific section colors
const sectionColors = {
  'executive-summary': 'blue',
  'system-architecture': 'green',
  'feature-requirements': 'purple',
  'data-architecture': 'orange',
  'api-specifications': 'cyan',
  'security-requirements': 'red',
  'performance-scalability': 'yellow',
  'infrastructure': 'indigo',
  'testing-strategy': 'pink',
  'implementation-guidelines': 'gray'
} as const

export default function TechnicalRequirementCard({ 
  requirement, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onCommitToTasks,
  isSelected,
  onSelect 
}: TechnicalRequirementCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)

  // Initialize TRD data with defaults
  const initialData = useMemo(() => {
    const data = requirement.card_data || {}
    return {
      title: requirement.title,
      description: requirement.description,
      
      // Header fields
      trd_id: data.trd_id || '',
      version: data.version || '1.0.0',
      status: data.status || 'Draft',
      assigned_team: data.assigned_team || '',
      
      // Section 1: Executive Summary
      system_overview: data.system_overview || '',
      business_purpose: data.business_purpose || '',
      key_architectural_decisions: data.key_architectural_decisions || '',
      strategic_alignment: data.strategic_alignment || '',
      success_criteria: data.success_criteria || '',
      
      // Section 2: System Architecture
      high_level_design: data.high_level_design || '',
      component_interactions: data.component_interactions || '',
      technology_stack_frontend: data.technology_stack_frontend || '',
      technology_stack_backend: data.technology_stack_backend || '',
      technology_stack_database: data.technology_stack_database || '',
      technology_stack_other: data.technology_stack_other || '',
      integration_points: data.integration_points || '',
      data_flow: data.data_flow || '',
      
      // Section 3: Feature-Specific Requirements
      feature_overview: data.feature_overview || '',
      technical_approach: data.technical_approach || '',
      required_components: data.required_components || '',
      data_flow_processing: data.data_flow_processing || '',
      business_logic: data.business_logic || '',
      ui_requirements: data.ui_requirements || '',
      
      // Section 4: Data Architecture
      database_schema: data.database_schema || '',
      data_relationships: data.data_relationships || '',
      validation_rules: data.validation_rules || '',
      migration_strategies: data.migration_strategies || '',
      data_governance: data.data_governance || '',
      
      // Section 5: API Specifications
      endpoint_definitions: data.endpoint_definitions || '',
      request_response_formats: data.request_response_formats || '',
      authentication_methods: data.authentication_methods || '',
      rate_limiting: data.rate_limiting || '',
      error_handling: data.error_handling || '',
      
      // Section 6: Security Requirements
      authentication_authorization: data.authentication_authorization || '',
      data_encryption: data.data_encryption || '',
      input_validation: data.input_validation || '',
      security_headers: data.security_headers || '',
      compliance_requirements: data.compliance_requirements || '',
      
      // Section 7: Performance & Scalability
      performance_targets: data.performance_targets || '',
      caching_strategies: data.caching_strategies || '',
      load_balancing: data.load_balancing || '',
      database_optimization: data.database_optimization || '',
      scaling_plans: data.scaling_plans || '',
      
      // Section 8: Infrastructure Requirements
      hosting_deployment: data.hosting_deployment || '',
      environment_configurations: data.environment_configurations || '',
      monitoring_logging: data.monitoring_logging || '',
      backup_recovery: data.backup_recovery || '',
      resource_requirements: data.resource_requirements || '',
      
      // Section 9: Testing Strategy
      unit_testing: data.unit_testing || '',
      integration_testing: data.integration_testing || '',
      performance_testing: data.performance_testing || '',
      security_testing: data.security_testing || '',
      user_acceptance_testing: data.user_acceptance_testing || '',
      
      // Section 10: Implementation Guidelines
      development_standards: data.development_standards || '',
      code_organization: data.code_organization || '',
      documentation_requirements: data.documentation_requirements || '',
      version_control: data.version_control || '',
      deployment_pipeline: data.deployment_pipeline || '',
      
      // Metadata & Relationships
      linked_features: data.linked_features || '',
      dependencies: data.dependencies || '',
      tags: data.tags || '',
      complexity_notes: data.complexity_notes || '',
      confidence_notes: data.confidence_notes || '',
      review_notes: data.review_notes || '',
      implementation_notes: data.implementation_notes || ''
    }
  }, [requirement])

  // Initialize auto-save
  const {
    data: trdData,
    updateField,
    forceSave,
    isDirty,
    saveStatus,
    lastSaved,
    saveError
  } = useAutoSave(
    initialData,
    async (updates) => {
      if (onUpdate) {
        // Extract title and description for main card update
        const { title, description, ...cardData } = updates
        await onUpdate(requirement.id, {
          title,
          description,
          card_data: cardData
        })
      }
    },
    {
      debounceMs: 1000,
      enableConflictDetection: true,
      enableOfflineQueue: true
    }
  )

  // Validation rules
  const validationRules = useMemo(() => [
    {
      field: 'trd_id',
      validate: validators.required('TRD ID is required')
    },
    {
      field: 'trd_id',
      validate: validators.pattern(/^TRD-\d+$/, 'Format must be TRD-XXX')
    },
    {
      field: 'version',
      validate: validators.required('Version is required')
    },
    {
      field: 'version',
      validate: validators.pattern(/^\d+\.\d+\.\d+$/, 'Format must be X.Y.Z')
    }
  ], [])

  const { errors, validateField, touchField, getFieldError } = useValidation(trdData, {
    rules: validationRules
  })

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'cmd+s': () => {
      forceSave()
      toast.success('TRD saved!')
    },
    'cmd+e': () => setIsEditMode(!isEditMode)
  })

  // Update field with validation
  const updateTrdField = useCallback((field: string, value: string) => {
    updateField(field, value)
    if (field === 'trd_id' || field === 'version') {
      validateField(field, value)
    }
  }, [updateField, validateField])

  const isCommitted = trdData.implementation_notes?.includes('committed') || false

  // Metadata display
  const metadata = (
    <>
      {trdData.trd_id || 'TRD-001'} • 
      v{trdData.version} • 
      {trdData.status} • 
      {trdData.assigned_team || 'Unassigned'}
    </>
  )

  // Card actions
  const actions = (
    <>
      {onCommitToTasks && (
        <button
          onClick={() => onCommitToTasks(requirement)}
          disabled={isCommitted}
          className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
            isCommitted
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
          title={isCommitted ? 'Already committed to tasks' : 'Convert TRD to actionable tasks'}
        >
          <FileText className="w-3 h-3 inline mr-1" />
          {isCommitted ? 'Committed' : 'Commit to Tasks'}
        </button>
      )}
      {onDuplicate && (
        <button
          onClick={() => onDuplicate(requirement.id)}
          className="p-1.5 text-gray-600 hover:text-green-600 rounded transition-colors"
          title="Duplicate"
        >
          <Copy className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={() => onDelete(requirement.id)}
          className="p-1.5 text-gray-600 hover:text-red-600 rounded transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </>
  )

  return (
    <ErrorBoundary>
      <CardContainer 
        isSelected={isSelected} 
        onClick={onSelect ? () => onSelect(requirement.id) : undefined}
      >
        <CardHeader
          title={trdData.title}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          onTitleEdit={isEditMode ? (newTitle) => updateTrdField('title', newTitle) : undefined}
          metadata={metadata}
          saveStatus={saveStatus}
          actions={actions}
          onSelect={onSelect ? () => onSelect(requirement.id) : undefined}
          isSelected={isSelected}
        />

        {!isCollapsed && (
          <>
            {/* Description */}
            <div className="p-3 border-b border-gray-100">
              <AIEnhancedField
                label="Description"
                value={trdData.description}
                onChange={(value) => updateTrdField('description', value)}
                placeholder="Brief description of this technical requirement..."
                isEditMode={isEditMode}
                aiContext="trd_description"
              />
            </div>

            {/* Section 1: Executive Summary */}
            <CollapsibleSection
              title="1. Executive Summary"
              colorScheme={sectionColors['executive-summary']}
              defaultExpanded={true}
              preview={<SectionPreview 
                data={trdData} 
                fields={['system_overview', 'business_purpose']} 
              />}
            >
              <AIEnhancedField
                label="System Overview"
                value={trdData.system_overview}
                onChange={(value) => updateTrdField('system_overview', value)}
                placeholder="Describe the high-level system architecture and purpose..."
                aiContext="system_overview"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Business Purpose"
                value={trdData.business_purpose}
                onChange={(value) => updateTrdField('business_purpose', value)}
                placeholder="Why this system is needed from a business perspective..."
                aiContext="business_justification"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Key Architectural Decisions"
                value={trdData.key_architectural_decisions}
                onChange={(value) => updateTrdField('key_architectural_decisions', value)}
                placeholder="Major technical choices and their rationale..."
                aiContext="architectural_decisions"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Strategic Alignment"
                value={trdData.strategic_alignment}
                onChange={(value) => updateTrdField('strategic_alignment', value)}
                placeholder="How this aligns with business strategy..."
                aiContext="strategic_alignment"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Success Criteria"
                value={trdData.success_criteria}
                onChange={(value) => updateTrdField('success_criteria', value)}
                placeholder="What defines success for this project..."
                aiContext="success_criteria"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 2: System Architecture */}
            <CollapsibleSection
              title="2. System Architecture"
              colorScheme={sectionColors['system-architecture']}
              preview={<SectionPreview 
                data={trdData} 
                fields={['high_level_design', 'technology_stack_backend']} 
              />}
            >
              <AIEnhancedField
                label="High-Level Design"
                value={trdData.high_level_design}
                onChange={(value) => updateTrdField('high_level_design', value)}
                placeholder="Overall architecture approach and design principles..."
                aiContext="system_design"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Component Interactions"
                value={trdData.component_interactions}
                onChange={(value) => updateTrdField('component_interactions', value)}
                placeholder="How different components communicate and work together..."
                aiContext="component_interactions"
                isEditMode={isEditMode}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Frontend Technologies"
                  value={trdData.technology_stack_frontend}
                  onChange={(value) => updateTrdField('technology_stack_frontend', value)}
                  placeholder="React.js, Vue.js, Angular..."
                  aiContext="frontend_tech"
                  isEditMode={isEditMode}
                  fieldType="text"
                />
                <AIEnhancedField
                  label="Backend Technologies"
                  value={trdData.technology_stack_backend}
                  onChange={(value) => updateTrdField('technology_stack_backend', value)}
                  placeholder="Node.js, Python, Java..."
                  aiContext="backend_tech"
                  isEditMode={isEditMode}
                  fieldType="text"
                />
              </div>
              <AIEnhancedField
                label="Database Technologies"
                value={trdData.technology_stack_database}
                onChange={(value) => updateTrdField('technology_stack_database', value)}
                placeholder="PostgreSQL, MongoDB, Redis..."
                aiContext="database_tech"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Other Technologies"
                value={trdData.technology_stack_other}
                onChange={(value) => updateTrdField('technology_stack_other', value)}
                placeholder="Docker, Kubernetes, CI/CD tools..."
                aiContext="other_technologies"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Integration Points"
                value={trdData.integration_points}
                onChange={(value) => updateTrdField('integration_points', value)}
                placeholder="External APIs, services, and system integrations..."
                aiContext="integration_points"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Data Flow"
                value={trdData.data_flow}
                onChange={(value) => updateTrdField('data_flow', value)}
                placeholder="How data moves through the system..."
                aiContext="data_flow"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 3: Feature-Specific Requirements */}
            <CollapsibleSection
              title="3. Feature-Specific Requirements"
              colorScheme={sectionColors['feature-requirements']}
              preview={<SectionPreview 
                data={trdData} 
                fields={['feature_overview', 'technical_approach']} 
              />}
            >
              <AIEnhancedField
                label="Feature Overview"
                value={trdData.feature_overview}
                onChange={(value) => updateTrdField('feature_overview', value)}
                placeholder="High-level description of features being implemented..."
                aiContext="feature_overview"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Technical Approach"
                value={trdData.technical_approach}
                onChange={(value) => updateTrdField('technical_approach', value)}
                placeholder="How features will be technically implemented..."
                aiContext="technical_approach"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Required Components"
                value={trdData.required_components}
                onChange={(value) => updateTrdField('required_components', value)}
                placeholder="Services, modules, and components needed..."
                aiContext="required_components"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Data Flow & Processing"
                value={trdData.data_flow_processing}
                onChange={(value) => updateTrdField('data_flow_processing', value)}
                placeholder="Step-by-step data handling and processing..."
                aiContext="data_processing"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Business Logic"
                value={trdData.business_logic}
                onChange={(value) => updateTrdField('business_logic', value)}
                placeholder="Rules, workflows, and business constraints..."
                aiContext="business_logic"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="UI Requirements"
                value={trdData.ui_requirements}
                onChange={(value) => updateTrdField('ui_requirements', value)}
                placeholder="User interface specifications and requirements..."
                aiContext="ui_requirements"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 4: Data Architecture */}
            <CollapsibleSection
              title="4. Data Architecture"
              colorScheme={sectionColors['data-architecture']}
              preview={<SectionPreview 
                data={trdData} 
                fields={['database_schema', 'data_relationships']} 
              />}
            >
              <AIEnhancedField
                label="Database Schema"
                value={trdData.database_schema}
                onChange={(value) => updateTrdField('database_schema', value)}
                placeholder="Tables, collections, and data structures..."
                aiContext="database_schema"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Data Relationships"
                value={trdData.data_relationships}
                onChange={(value) => updateTrdField('data_relationships', value)}
                placeholder="How data entities relate to each other..."
                aiContext="data_relationships"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Validation Rules"
                value={trdData.validation_rules}
                onChange={(value) => updateTrdField('validation_rules', value)}
                placeholder="Data validation and integrity constraints..."
                aiContext="validation_rules"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Migration Strategies"
                value={trdData.migration_strategies}
                onChange={(value) => updateTrdField('migration_strategies', value)}
                placeholder="How to migrate existing data..."
                aiContext="migration_strategies"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Data Governance"
                value={trdData.data_governance}
                onChange={(value) => updateTrdField('data_governance', value)}
                placeholder="Data retention, privacy, and compliance..."
                aiContext="data_governance"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 5: API Specifications */}
            <CollapsibleSection
              title="5. API Specifications"
              colorScheme={sectionColors['api-specifications']}
              preview={<SectionPreview 
                data={trdData} 
                fields={['endpoint_definitions', 'authentication_methods']} 
              />}
            >
              <AIEnhancedField
                label="Endpoint Definitions"
                value={trdData.endpoint_definitions}
                onChange={(value) => updateTrdField('endpoint_definitions', value)}
                placeholder="REST/GraphQL endpoints and their purposes..."
                aiContext="endpoint_definitions"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Request/Response Formats"
                value={trdData.request_response_formats}
                onChange={(value) => updateTrdField('request_response_formats', value)}
                placeholder="Data formats and schemas..."
                aiContext="request_response_formats"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Authentication Methods"
                value={trdData.authentication_methods}
                onChange={(value) => updateTrdField('authentication_methods', value)}
                placeholder="JWT, OAuth, API keys..."
                aiContext="authentication_methods"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Rate Limiting"
                value={trdData.rate_limiting}
                onChange={(value) => updateTrdField('rate_limiting', value)}
                placeholder="Request limits and throttling..."
                aiContext="rate_limiting"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Error Handling"
                value={trdData.error_handling}
                onChange={(value) => updateTrdField('error_handling', value)}
                placeholder="Error codes and handling strategies..."
                aiContext="error_handling"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 6: Security Requirements */}
            <CollapsibleSection
              title="6. Security Requirements"
              colorScheme={sectionColors['security-requirements']}
              preview={<SectionPreview 
                data={trdData} 
                fields={['authentication_authorization', 'data_encryption']} 
              />}
            >
              <AIEnhancedField
                label="Authentication & Authorization"
                value={trdData.authentication_authorization}
                onChange={(value) => updateTrdField('authentication_authorization', value)}
                placeholder="User authentication and access control..."
                aiContext="authentication_authorization"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Data Encryption"
                value={trdData.data_encryption}
                onChange={(value) => updateTrdField('data_encryption', value)}
                placeholder="Encryption at rest and in transit..."
                aiContext="data_encryption"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Input Validation"
                value={trdData.input_validation}
                onChange={(value) => updateTrdField('input_validation', value)}
                placeholder="Sanitization and validation strategies..."
                aiContext="input_validation"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Security Headers"
                value={trdData.security_headers}
                onChange={(value) => updateTrdField('security_headers', value)}
                placeholder="CORS, CSP, and other security headers..."
                aiContext="security_headers"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Compliance Requirements"
                value={trdData.compliance_requirements}
                onChange={(value) => updateTrdField('compliance_requirements', value)}
                placeholder="GDPR, HIPAA, SOC2, etc..."
                aiContext="compliance_requirements"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 7: Performance & Scalability */}
            <CollapsibleSection
              title="7. Performance & Scalability"
              colorScheme={sectionColors['performance-scalability']}
              preview={<SectionPreview 
                data={trdData} 
                fields={['performance_targets', 'scaling_plans']} 
              />}
            >
              <AIEnhancedField
                label="Performance Targets"
                value={trdData.performance_targets}
                onChange={(value) => updateTrdField('performance_targets', value)}
                placeholder="Response times, throughput, concurrent users..."
                aiContext="performance_targets"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Caching Strategies"
                value={trdData.caching_strategies}
                onChange={(value) => updateTrdField('caching_strategies', value)}
                placeholder="Redis, CDN, browser caching..."
                aiContext="caching_strategies"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Load Balancing"
                value={trdData.load_balancing}
                onChange={(value) => updateTrdField('load_balancing', value)}
                placeholder="Distribution strategies and algorithms..."
                aiContext="load_balancing"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Database Optimization"
                value={trdData.database_optimization}
                onChange={(value) => updateTrdField('database_optimization', value)}
                placeholder="Indexing, query optimization, sharding..."
                aiContext="database_optimization"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Scaling Plans"
                value={trdData.scaling_plans}
                onChange={(value) => updateTrdField('scaling_plans', value)}
                placeholder="Horizontal/vertical scaling strategies..."
                aiContext="scaling_plans"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 8: Infrastructure Requirements */}
            <CollapsibleSection
              title="8. Infrastructure Requirements"
              colorScheme={sectionColors['infrastructure']}
              preview={<SectionPreview 
                data={trdData} 
                fields={['hosting_deployment', 'monitoring_logging']} 
              />}
            >
              <AIEnhancedField
                label="Hosting & Deployment"
                value={trdData.hosting_deployment}
                onChange={(value) => updateTrdField('hosting_deployment', value)}
                placeholder="Cloud providers, deployment strategies..."
                aiContext="hosting_deployment"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Environment Configurations"
                value={trdData.environment_configurations}
                onChange={(value) => updateTrdField('environment_configurations', value)}
                placeholder="Dev, staging, production setups..."
                aiContext="environment_configurations"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Monitoring & Logging"
                value={trdData.monitoring_logging}
                onChange={(value) => updateTrdField('monitoring_logging', value)}
                placeholder="Observability tools and strategies..."
                aiContext="monitoring_logging"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Backup & Recovery"
                value={trdData.backup_recovery}
                onChange={(value) => updateTrdField('backup_recovery', value)}
                placeholder="Backup strategies and disaster recovery..."
                aiContext="backup_recovery"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Resource Requirements"
                value={trdData.resource_requirements}
                onChange={(value) => updateTrdField('resource_requirements', value)}
                placeholder="CPU, memory, storage needs..."
                aiContext="resource_requirements"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 9: Testing Strategy */}
            <CollapsibleSection
              title="9. Testing Strategy"
              colorScheme={sectionColors['testing-strategy']}
              preview={<SectionPreview 
                data={trdData} 
                fields={['unit_testing', 'integration_testing']} 
              />}
            >
              <AIEnhancedField
                label="Unit Testing"
                value={trdData.unit_testing}
                onChange={(value) => updateTrdField('unit_testing', value)}
                placeholder="Unit test coverage and strategies..."
                aiContext="unit_testing"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Integration Testing"
                value={trdData.integration_testing}
                onChange={(value) => updateTrdField('integration_testing', value)}
                placeholder="API and component integration tests..."
                aiContext="integration_testing"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Performance Testing"
                value={trdData.performance_testing}
                onChange={(value) => updateTrdField('performance_testing', value)}
                placeholder="Load testing and benchmarks..."
                aiContext="performance_testing"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Security Testing"
                value={trdData.security_testing}
                onChange={(value) => updateTrdField('security_testing', value)}
                placeholder="Penetration testing and vulnerability scans..."
                aiContext="security_testing"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="User Acceptance Testing"
                value={trdData.user_acceptance_testing}
                onChange={(value) => updateTrdField('user_acceptance_testing', value)}
                placeholder="UAT criteria and process..."
                aiContext="user_acceptance_testing"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 10: Implementation Guidelines */}
            <CollapsibleSection
              title="10. Implementation Guidelines"
              colorScheme={sectionColors['implementation-guidelines']}
              preview={<SectionPreview 
                data={trdData} 
                fields={['development_standards', 'deployment_pipeline']} 
              />}
            >
              <AIEnhancedField
                label="Development Standards"
                value={trdData.development_standards}
                onChange={(value) => updateTrdField('development_standards', value)}
                placeholder="Coding standards and best practices..."
                aiContext="development_standards"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Code Organization"
                value={trdData.code_organization}
                onChange={(value) => updateTrdField('code_organization', value)}
                placeholder="Project structure and module organization..."
                aiContext="code_organization"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Documentation Requirements"
                value={trdData.documentation_requirements}
                onChange={(value) => updateTrdField('documentation_requirements', value)}
                placeholder="Code comments, API docs, user guides..."
                aiContext="documentation_requirements"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Version Control"
                value={trdData.version_control}
                onChange={(value) => updateTrdField('version_control', value)}
                placeholder="Git workflow and branching strategy..."
                aiContext="version_control"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Deployment Pipeline"
                value={trdData.deployment_pipeline}
                onChange={(value) => updateTrdField('deployment_pipeline', value)}
                placeholder="CI/CD process and deployment steps..."
                aiContext="deployment_pipeline"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Metadata & Relationships Section */}
            <CollapsibleSection
              title="Metadata & Relationships"
              colorScheme="gray"
              preview={<SectionPreview 
                data={trdData} 
                fields={['trd_id', 'linked_features']} 
              />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="TRD ID"
                  value={trdData.trd_id}
                  onChange={(value) => updateTrdField('trd_id', value)}
                  onBlur={() => touchField('trd_id')}
                  placeholder="TRD-001"
                  fieldType="text"
                  isEditMode={isEditMode}
                  error={getFieldError('trd_id')}
                  isRequired
                />
                <AIEnhancedField
                  label="Version"
                  value={trdData.version}
                  onChange={(value) => updateTrdField('version', value)}
                  onBlur={() => touchField('version')}
                  placeholder="1.0.0"
                  fieldType="text"
                  isEditMode={isEditMode}
                  error={getFieldError('version')}
                  isRequired
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Status"
                  value={trdData.status}
                  onChange={(value) => updateTrdField('status', value)}
                  placeholder="Draft, Review, Approved"
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Assigned Team"
                  value={trdData.assigned_team}
                  onChange={(value) => updateTrdField('assigned_team', value)}
                  placeholder="Team name"
                  fieldType="text"
                  isEditMode={isEditMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Linked Features"
                  value={trdData.linked_features}
                  onChange={(value) => updateTrdField('linked_features', value)}
                  placeholder="Feature-001, User-Auth-Feature..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Dependencies"
                  value={trdData.dependencies}
                  onChange={(value) => updateTrdField('dependencies', value)}
                  placeholder="TRD-DATABASE-001, TRD-AUTH-002..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Tags"
                  value={trdData.tags}
                  onChange={(value) => updateTrdField('tags', value)}
                  placeholder="payment, security, integration..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Implementation Notes"
                  value={trdData.implementation_notes}
                  onChange={(value) => updateTrdField('implementation_notes', value)}
                  placeholder="Current status and blockers..."
                  isEditMode={isEditMode}
                />
              </div>
            </CollapsibleSection>

            {/* Save Error Display */}
            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">Error saving: {saveError.message}</p>
              </div>
            )}
          </>
        )}
      </CardContainer>
    </ErrorBoundary>
  )
}