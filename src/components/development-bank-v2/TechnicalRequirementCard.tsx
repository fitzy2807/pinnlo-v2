'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Edit3, Trash2, Copy, Brain, X, Check, Eye, Edit } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AIEnhancedFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  fieldType?: 'text' | 'textarea'
  aiContext?: string
  isEditMode: boolean
}

function AIEnhancedField({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  fieldType = 'textarea', 
  aiContext,
  isEditMode
}: AIEnhancedFieldProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)

  const handleAIEnhance = async () => {
    if (!value.trim()) {
      toast.error('Please add some content first before enhancing')
      return
    }

    setIsEnhancing(true)
    try {
      const response = await fetch('/api/development-bank/enhance-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldContent: value,
          fieldType: aiContext || label,
          enhancementType: 'improve'
        })
      })

      const result = await response.json()
      if (result.success) {
        onChange(result.enhancedContent)
        toast.success('Content enhanced by AI')
      } else {
        toast.error('Failed to enhance content')
      }
    } catch (error) {
      toast.error('Failed to enhance content')
    } finally {
      setIsEnhancing(false)
    }
  }

  if (!isEditMode) {
    // Preview mode - show content as clean text on background
    return (
      <div className="field-group mb-2">
        <label className="text-xs font-medium text-gray-700 block mb-1">{label}</label>
        <div className="text-xs text-black leading-relaxed">
          {value || <span className="italic text-gray-400">No content</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="field-group mb-2">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-700">{label}</label>
        <button
          onClick={handleAIEnhance}
          disabled={isEnhancing || !value.trim()}
          className={`
            p-1 rounded transition-colors
            ${isEnhancing || !value.trim() 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            }
          `}
          title="Enhance with AI"
        >
          {isEnhancing ? (
            <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <Brain className="w-3 h-3" />
          )}
        </button>
      </div>
      
      {fieldType === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-16 p-2 text-xs text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 text-xs text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )}
    </div>
  )
}

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

export default function TechnicalRequirementCard({ 
  requirement, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onCommitToTasks,
  isSelected,
  onSelect 
}: TechnicalRequirementCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(requirement.title)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)

  // Initialize TRD data with defaults
  const [trdData, setTrdData] = useState(() => {
    const data = requirement.card_data || {}
    return {
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
  })

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleTitleSave = () => {
    if (onUpdate && titleValue !== requirement.title) {
      onUpdate(requirement.id, { title: titleValue })
    }
    setEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setTitleValue(requirement.title)
    setEditingTitle(false)
  }

  const updateTrdField = (field: string, value: string) => {
    console.log('TRD updateField called:', field, value)
    const newTrdData = { ...trdData, [field]: value }
    setTrdData(newTrdData)
    
    // Ensure proper structure for database - TRDs might have similar constraints
    const updatedCardData = {
      ...newTrdData,
      // Maintain any required metadata structure
      last_updated: new Date().toISOString().split('T')[0]
    }
    
    console.log('TRD saving card_data:', updatedCardData)
    
    // Auto-save to database with proper structure
    if (onUpdate) {
      onUpdate(requirement.id, { card_data: updatedCardData })
    } else {
      console.log('No onUpdate function available')
    }
  }

  const isCommitted = trdData.implementation_notes?.includes('committed') || false

  // Section colors - different colors like MasterCard template
  const sectionColors = {
    'executive-summary': 'bg-blue-50 border-blue-200',
    'system-architecture': 'bg-green-50 border-green-200',
    'feature-requirements': 'bg-purple-50 border-purple-200',
    'data-architecture': 'bg-orange-50 border-orange-200',
    'api-specifications': 'bg-cyan-50 border-cyan-200',
    'security-requirements': 'bg-red-50 border-red-200',
    'performance-scalability': 'bg-yellow-50 border-yellow-200',
    'infrastructure': 'bg-indigo-50 border-indigo-200',
    'testing-strategy': 'bg-pink-50 border-pink-200',
    'implementation-guidelines': 'bg-gray-50 border-gray-200'
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Main TRD Header - Collapsible */}
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Selection Checkbox */}
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(requirement.id)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            )}
            
            {/* Collapse/Expand TRD */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center space-x-2 text-left flex-1"
            >
              {isCollapsed ? 
                <ChevronRight className="w-4 h-4 text-gray-500" /> : 
                <ChevronDown className="w-4 h-4 text-gray-500" />
              }
              
              {/* Title */}
              <div className="flex-1">
                {editingTitle ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm text-black border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                      autoFocus
                    />
                    <button onClick={handleTitleSave} className="p-1 text-green-600 hover:text-green-700">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={handleTitleCancel} className="p-1 text-gray-600 hover:text-gray-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {requirement.title}
                    </h3>
                    {/* Inline metadata like MasterCard */}
                    <div className="text-xs text-gray-500 mt-1">
                      {trdData.trd_id || 'TRD-001'} • {trdData.version} • {trdData.status} • {trdData.assigned_team || 'Unassigned'}
                    </div>
                  </div>
                )}
              </div>
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Edit/Preview Mode Toggle */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                isEditMode 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
              title={isEditMode ? 'Switch to Preview Mode' : 'Switch to Edit Mode'}
            >
              {isEditMode ? (
                <>
                  <Eye className="w-3 h-3 inline mr-1" />
                  Preview
                </>
              ) : (
                <>
                  <Edit className="w-3 h-3 inline mr-1" />
                  Edit
                </>
              )}
            </button>

            {onCommitToTasks && (
              <button
                onClick={() => onCommitToTasks(requirement)}
                disabled={isCommitted}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isCommitted
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
                title={isCommitted ? 'Already committed to tasks' : 'Convert TRD to actionable tasks'}
              >
                {isCommitted ? 'Committed' : 'Commit to Tasks'}
              </button>
            )}
            
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingTitle(true)
                }}
                className="p-1.5 text-gray-600 hover:text-blue-600 rounded transition-colors"
                title="Edit Title"
              >
                <Edit3 className="w-4 h-4" />
              </button>
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
            </div>
          </div>
        </div>
      </div>

      {/* TRD Content - Only show when not collapsed */}
      {!isCollapsed && (
        <>
          {/* Section 1: Executive Summary */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('executive-summary')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">1. Executive Summary</span>
              {expandedSections.has('executive-summary') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('executive-summary') && (
              <div className={`p-2 space-y-2 ${sectionColors['executive-summary']}`}>
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
              </div>
            )}
          </div>

          {/* Section 2: System Architecture */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('system-architecture')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">2. System Architecture</span>
              {expandedSections.has('system-architecture') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('system-architecture') && (
              <div className={`p-2 space-y-2 ${sectionColors['system-architecture']}`}>
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
                  />
                  <AIEnhancedField
                    label="Backend Technologies"
                    value={trdData.technology_stack_backend}
                    onChange={(value) => updateTrdField('technology_stack_backend', value)}
                    placeholder="Node.js, Python, Java..."
                    aiContext="backend_tech"
                    isEditMode={isEditMode}
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
              </div>
            )}
          </div>

          {/* Section 3: Feature-Specific Requirements */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('feature-requirements')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">3. Feature-Specific Requirements</span>
              {expandedSections.has('feature-requirements') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('feature-requirements') && (
              <div className={`p-2 space-y-2 ${sectionColors['feature-requirements']}`}>
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
              </div>
            )}
          </div>

          {/* Add remaining sections here with their respective colors */}
          {/* Section 4: Data Architecture */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('data-architecture')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">4. Data Architecture</span>
              {expandedSections.has('data-architecture') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('data-architecture') && (
              <div className={`p-2 space-y-2 ${sectionColors['data-architecture']}`}>
                <AIEnhancedField
                  label="Database Schema"
                  value={trdData.database_schema}
                  onChange={(value) => updateTrdField('database_schema', value)}
                  placeholder="Table definitions, relationships, and constraints..."
                  aiContext="database_schema"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Data Relationships"
                  value={trdData.data_relationships}
                  onChange={(value) => updateTrdField('data_relationships', value)}
                  placeholder="Entity relationships and data dependencies..."
                  aiContext="data_relationships"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Validation Rules"
                  value={trdData.validation_rules}
                  onChange={(value) => updateTrdField('validation_rules', value)}
                  placeholder="Data validation and integrity requirements..."
                  aiContext="validation_rules"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Migration Strategies"
                  value={trdData.migration_strategies}
                  onChange={(value) => updateTrdField('migration_strategies', value)}
                  placeholder="Data migration and versioning approach..."
                  aiContext="migration_strategies"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Data Governance"
                  value={trdData.data_governance}
                  onChange={(value) => updateTrdField('data_governance', value)}
                  placeholder="Access control, compliance, and data management..."
                  aiContext="data_governance"
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </div>

          {/* Section 5: API Specifications */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('api-specifications')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">5. API Specifications</span>
              {expandedSections.has('api-specifications') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('api-specifications') && (
              <div className={`p-2 space-y-2 ${sectionColors['api-specifications']}`}>
                <AIEnhancedField
                  label="Endpoint Definitions"
                  value={trdData.endpoint_definitions}
                  onChange={(value) => updateTrdField('endpoint_definitions', value)}
                  placeholder="API endpoints, methods, and URL patterns..."
                  aiContext="endpoint_definitions"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Request/Response Formats"
                  value={trdData.request_response_formats}
                  onChange={(value) => updateTrdField('request_response_formats', value)}
                  placeholder="JSON schemas, data structures..."
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
                  placeholder="Request limits, throttling strategies..."
                  aiContext="rate_limiting"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Error Handling"
                  value={trdData.error_handling}
                  onChange={(value) => updateTrdField('error_handling', value)}
                  placeholder="Error codes, response formats..."
                  aiContext="error_handling"
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </div>

          {/* Section 6: Security Requirements */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('security-requirements')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">6. Security Requirements</span>
              {expandedSections.has('security-requirements') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('security-requirements') && (
              <div className={`p-2 space-y-2 ${sectionColors['security-requirements']}`}>
                <AIEnhancedField
                  label="Authentication & Authorization"
                  value={trdData.authentication_authorization}
                  onChange={(value) => updateTrdField('authentication_authorization', value)}
                  placeholder="User authentication, role-based access..."
                  aiContext="authentication_authorization"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Data Encryption"
                  value={trdData.data_encryption}
                  onChange={(value) => updateTrdField('data_encryption', value)}
                  placeholder="Encryption standards, key management..."
                  aiContext="data_encryption"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Input Validation"
                  value={trdData.input_validation}
                  onChange={(value) => updateTrdField('input_validation', value)}
                  placeholder="Sanitization, validation rules..."
                  aiContext="input_validation"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Security Headers"
                  value={trdData.security_headers}
                  onChange={(value) => updateTrdField('security_headers', value)}
                  placeholder="CORS, CSP, security headers..."
                  aiContext="security_headers"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Compliance Requirements"
                  value={trdData.compliance_requirements}
                  onChange={(value) => updateTrdField('compliance_requirements', value)}
                  placeholder="GDPR, SOX, industry standards..."
                  aiContext="compliance_requirements"
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </div>

          {/* Section 7: Performance & Scalability */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('performance-scalability')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">7. Performance & Scalability</span>
              {expandedSections.has('performance-scalability') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('performance-scalability') && (
              <div className={`p-2 space-y-2 ${sectionColors['performance-scalability']}`}>
                <AIEnhancedField
                  label="Performance Targets"
                  value={trdData.performance_targets}
                  onChange={(value) => updateTrdField('performance_targets', value)}
                  placeholder="Response times, throughput requirements..."
                  aiContext="performance_targets"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Caching Strategies"
                  value={trdData.caching_strategies}
                  onChange={(value) => updateTrdField('caching_strategies', value)}
                  placeholder="Redis, CDN, application caching..."
                  aiContext="caching_strategies"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Load Balancing"
                  value={trdData.load_balancing}
                  onChange={(value) => updateTrdField('load_balancing', value)}
                  placeholder="Load balancer configuration, strategies..."
                  aiContext="load_balancing"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Database Optimization"
                  value={trdData.database_optimization}
                  onChange={(value) => updateTrdField('database_optimization', value)}
                  placeholder="Indexing, query optimization..."
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
              </div>
            )}
          </div>

          {/* Section 8: Infrastructure Requirements */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('infrastructure')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">8. Infrastructure Requirements</span>
              {expandedSections.has('infrastructure') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('infrastructure') && (
              <div className={`p-2 space-y-2 ${sectionColors['infrastructure']}`}>
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
                  placeholder="Dev, staging, production environments..."
                  aiContext="environment_configurations"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Monitoring & Logging"
                  value={trdData.monitoring_logging}
                  onChange={(value) => updateTrdField('monitoring_logging', value)}
                  placeholder="Application monitoring, log management..."
                  aiContext="monitoring_logging"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Backup & Recovery"
                  value={trdData.backup_recovery}
                  onChange={(value) => updateTrdField('backup_recovery', value)}
                  placeholder="Backup strategies, disaster recovery..."
                  aiContext="backup_recovery"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Resource Requirements"
                  value={trdData.resource_requirements}
                  onChange={(value) => updateTrdField('resource_requirements', value)}
                  placeholder="CPU, memory, storage specifications..."
                  aiContext="resource_requirements"
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </div>

          {/* Section 9: Testing Strategy */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('testing-strategy')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">9. Testing Strategy</span>
              {expandedSections.has('testing-strategy') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('testing-strategy') && (
              <div className={`p-2 space-y-2 ${sectionColors['testing-strategy']}`}>
                <AIEnhancedField
                  label="Unit Testing"
                  value={trdData.unit_testing}
                  onChange={(value) => updateTrdField('unit_testing', value)}
                  placeholder="Unit test frameworks, coverage requirements..."
                  aiContext="unit_testing"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Integration Testing"
                  value={trdData.integration_testing}
                  onChange={(value) => updateTrdField('integration_testing', value)}
                  placeholder="API testing, system integration tests..."
                  aiContext="integration_testing"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Performance Testing"
                  value={trdData.performance_testing}
                  onChange={(value) => updateTrdField('performance_testing', value)}
                  placeholder="Load testing, stress testing..."
                  aiContext="performance_testing"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Security Testing"
                  value={trdData.security_testing}
                  onChange={(value) => updateTrdField('security_testing', value)}
                  placeholder="Penetration testing, vulnerability scans..."
                  aiContext="security_testing"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="User Acceptance Testing"
                  value={trdData.user_acceptance_testing}
                  onChange={(value) => updateTrdField('user_acceptance_testing', value)}
                  placeholder="UAT processes, user testing protocols..."
                  aiContext="user_acceptance_testing"
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </div>
          
          {/* Section 10: Implementation Guidelines */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('implementation-guidelines')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">10. Implementation Guidelines</span>
              {expandedSections.has('implementation-guidelines') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('implementation-guidelines') && (
              <div className={`p-2 space-y-2 ${sectionColors['implementation-guidelines']}`}>
                <AIEnhancedField
                  label="Development Standards"
                  value={trdData.development_standards}
                  onChange={(value) => updateTrdField('development_standards', value)}
                  placeholder="Code quality standards, best practices..."
                  aiContext="development_standards"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Code Organization"
                  value={trdData.code_organization}
                  onChange={(value) => updateTrdField('code_organization', value)}
                  placeholder="Project structure, architectural patterns..."
                  aiContext="code_organization"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Documentation Requirements"
                  value={trdData.documentation_requirements}
                  onChange={(value) => updateTrdField('documentation_requirements', value)}
                  placeholder="API docs, technical documentation needs..."
                  aiContext="documentation_requirements"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Version Control"
                  value={trdData.version_control}
                  onChange={(value) => updateTrdField('version_control', value)}
                  placeholder="Git workflows, branching strategies..."
                  aiContext="version_control"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Deployment Pipeline"
                  value={trdData.deployment_pipeline}
                  onChange={(value) => updateTrdField('deployment_pipeline', value)}
                  placeholder="CI/CD processes, automation strategies..."
                  aiContext="deployment_pipeline"
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </div>
          
          {/* Metadata & Relationships Section */}
          <div className="p-2 bg-gray-50 space-y-2">
            <h4 className="text-xs font-medium text-gray-900">Metadata & Relationships</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <AIEnhancedField
                label="Linked Features"
                value={trdData.linked_features}
                onChange={(value) => updateTrdField('linked_features', value)}
                placeholder="Feature-001, User-Auth-Feature..."
                aiContext="linked_features"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Dependencies"
                value={trdData.dependencies}
                onChange={(value) => updateTrdField('dependencies', value)}
                placeholder="TRD-DATABASE-001, TRD-AUTH-002..."
                aiContext="dependencies"
                isEditMode={isEditMode}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <AIEnhancedField
                label="Tags"
                value={trdData.tags}
                onChange={(value) => updateTrdField('tags', value)}
                placeholder="payment, security, integration..."
                aiContext="tags"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Implementation Notes"
                value={trdData.implementation_notes}
                onChange={(value) => updateTrdField('implementation_notes', value)}
                placeholder="Current status and blockers..."
                aiContext="implementation_notes"
                isEditMode={isEditMode}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}