'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Trash2, Copy, FileText, ListTodo, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { PRDCardData, PRDCardProps } from '@/types/prd'

// Import shared components
import { 
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

// PRD-specific section colors
const sectionColors = {
  'product-overview': 'blue',
  'requirements': 'green',
  'user-experience': 'purple',
  'business-context': 'orange',
  'implementation': 'yellow'
} as const

export default function PRDCard({ 
  prd, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onConvertToTRD,
  onConvertToTasks,
  isSelected,
  onSelect 
}: PRDCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localData, setLocalData] = useState<any>(null)

  // Initialize PRD data with defaults
  const initialData = useMemo(() => {
    const data = prd.card_data || {}
    return {
      title: prd.title,
      description: prd.description,
      
      // Document Control
      prd_id: data.prd_id || `PRD-${Date.now()}`,
      version: data.version || '1.0',
      status: data.status || 'draft',
      product_manager: data.product_manager || '',
      last_reviewed: data.last_reviewed || new Date().toISOString().split('T')[0],
      
      // Section 1: Product Overview
      product_vision: data.product_vision || '',
      problem_statement: data.problem_statement || '',
      solution_overview: data.solution_overview || '',
      target_audience: data.target_audience || '',
      value_proposition: data.value_proposition || '',
      success_summary: data.success_summary || '',
      
      // Section 2: Requirements
      user_stories: data.user_stories || '',
      functional_requirements: data.functional_requirements || '',
      non_functional_requirements: data.non_functional_requirements || '',
      acceptance_criteria: data.acceptance_criteria || '',
      out_of_scope: data.out_of_scope || '',
      
      // Section 3: User Experience
      user_flows: data.user_flows || '',
      wireframes_mockups: data.wireframes_mockups || '',
      interaction_design: data.interaction_design || '',
      accessibility_requirements: data.accessibility_requirements || '',
      mobile_considerations: data.mobile_considerations || '',
      
      // Section 4: Business Context
      business_objectives: data.business_objectives || '',
      revenue_model: data.revenue_model || '',
      pricing_strategy: data.pricing_strategy || '',
      go_to_market_plan: data.go_to_market_plan || '',
      competitive_positioning: data.competitive_positioning || '',
      success_metrics: data.success_metrics || '',
      
      // Section 5: Implementation Planning
      mvp_definition: data.mvp_definition || '',
      release_phases: data.release_phases || '',
      feature_prioritization: data.feature_prioritization || '',
      timeline_milestones: data.timeline_milestones || '',
      dependencies: data.dependencies || '',
      risks_and_mitigation: data.risks_and_mitigation || '',
      
      // Metadata & Relationships
      linked_trds: data.linked_trds || '',
      linked_tasks: data.linked_tasks || '',
      linked_features: data.linked_features || '',
      stakeholder_list: data.stakeholder_list || '',
      tags: data.tags || '',
      implementation_notes: data.implementation_notes || ''
    }
  }, [prd])

  // Initialize local data when entering edit mode
  useEffect(() => {
    if (isEditMode && !localData) {
      setLocalData(initialData)
    }
  }, [isEditMode, initialData, localData])

  // Use either local data (in edit mode) or initial data (in view mode)
  const prdData = isEditMode && localData ? localData : initialData

  // Update field locally (no auto-save)
  const updateField = useCallback((field: string, value: any) => {
    if (isEditMode && localData) {
      setLocalData((prev: any) => ({ ...prev, [field]: value }))
    }
  }, [isEditMode, localData])

  // Validation rules
  const validationRules = useMemo(() => [
    {
      field: 'prd_id',
      validate: validators.required('PRD ID is required')
    },
    {
      field: 'prd_id',
      validate: validators.pattern(/^PRD-\d+$/, 'Format must be PRD-XXX')
    },
    {
      field: 'version',
      validate: validators.required('Version is required')
    }
  ], [])

  const { errors, validateField, touchField, getFieldError } = useValidation(prdData, {
    rules: validationRules
  })

  // Manual save handler
  const handleSave = useCallback(async () => {
    if (!localData || !onUpdate) return
    
    setIsSaving(true)
    try {
      const { title, description, ...cardData } = localData
      await onUpdate(prd.id, {
        title,
        description,
        card_data: cardData
      })
      toast.success('PRD saved!')
      setIsEditMode(false)
      setLocalData(null) // Clear local data after save
    } catch (error) {
      toast.error('Failed to save PRD')
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [localData, onUpdate, prd.id])

  // Cancel edit handler
  const handleCancel = useCallback(() => {
    setIsEditMode(false)
    setLocalData(null) // Discard changes
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'cmd+s': isEditMode ? handleSave : undefined,
    'cmd+e': () => {
      if (!isEditMode) {
        setIsEditMode(true)
      }
    },
    'esc': isEditMode ? handleCancel : undefined
  })

  // Update field with validation
  const updatePrdField = useCallback((field: string, value: string) => {
    updateField(field, value)
    if (isEditMode && (field === 'prd_id' || field === 'version')) {
      validateField(field, value)
    }
  }, [updateField, validateField, isEditMode])

  // Status colors
  const statusColors = {
    'draft': 'bg-gray-100 text-gray-700 border-gray-300',
    'review': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'approved': 'bg-green-100 text-green-700 border-green-300',
    'released': 'bg-blue-100 text-blue-700 border-blue-300'
  }

  // Metadata display
  const metadata = (
    <>
      {prdData.prd_id} • 
      v{prdData.version} • 
      <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColors[prdData.status]}`}>
        {prdData.status.charAt(0).toUpperCase() + prdData.status.slice(1)}
      </span>
      {prdData.product_manager && (
        <span className="ml-2">
          PM: {prdData.product_manager}
        </span>
      )}
    </>
  )

  // Card actions
  const actions = (
    <>
      {/* Edit/Save/Cancel buttons */}
      {!isEditMode ? (
        <button
          onClick={() => setIsEditMode(true)}
          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          title="Edit (Cmd+E)"
        >
          Edit
        </button>
      ) : (
        <>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              isSaving
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            title="Save changes (Cmd+S)"
          >
            {isSaving ? (
              <>
                <span className="inline-block animate-spin mr-1">⟳</span>
                Saving...
              </>
            ) : (
              <>
                <Check className="w-3 h-3 inline mr-1" />
                Save
              </>
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            title="Cancel (Esc)"
          >
            Cancel
          </button>
        </>
      )}
      {onConvertToTRD && !isEditMode && (
        <button
          onClick={() => onConvertToTRD(prd)}
          className="px-3 py-1.5 text-xs bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          title="Convert PRD to Technical Requirements Document"
        >
          <FileText className="w-3 h-3 inline mr-1" />
          To TRD
        </button>
      )}
      {onConvertToTasks && !isEditMode && (
        <button
          onClick={() => onConvertToTasks(prd)}
          className="px-3 py-1.5 text-xs bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          title="Convert PRD to Task List"
        >
          <ListTodo className="w-3 h-3 inline mr-1" />
          To Tasks
        </button>
      )}
      {onDuplicate && !isEditMode && (
        <button
          onClick={() => onDuplicate(prd.id)}
          className="p-1.5 text-gray-600 hover:text-green-600 rounded transition-colors"
          title="Duplicate"
        >
          <Copy className="w-4 h-4" />
        </button>
      )}
      {onDelete && !isEditMode && (
        <button
          onClick={() => onDelete(prd.id)}
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
        onClick={onSelect ? () => onSelect(prd.id) : undefined}
      >
        <CardHeader
          title={prdData.title}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isEditMode={isEditMode}
          onToggleEditMode={undefined} // Disable header edit toggle
          onTitleEdit={isEditMode ? (newTitle) => updateField('title', newTitle) : undefined}
          metadata={metadata}
          actions={actions}
          onSelect={onSelect ? () => onSelect(prd.id) : undefined}
          isSelected={isSelected}
        />

        {!isCollapsed && (
          <>
            {/* Description */}
            <div className="p-3 border-b border-gray-100">
              <AIEnhancedField
                label="Description"
                value={prdData.description}
                onChange={(value) => updatePrdField('description', value)}
                placeholder="Brief description of this product requirement..."
                isEditMode={isEditMode}
                aiContext="prd_description"
              />
            </div>

            {/* Section 1: Product Overview */}
            <CollapsibleSection
              title="1. Product Overview"
              colorScheme={sectionColors['product-overview']}
              defaultExpanded={true}
              preview={<SectionPreview 
                data={prdData} 
                fields={['product_vision', 'problem_statement']} 
              />}
            >
              <AIEnhancedField
                label="Product Vision"
                value={prdData.product_vision}
                onChange={(value) => updatePrdField('product_vision', value)}
                placeholder="Long-term vision for this product..."
                aiContext="product_vision"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Problem Statement"
                value={prdData.problem_statement}
                onChange={(value) => updatePrdField('problem_statement', value)}
                placeholder="What problem are we solving and why..."
                aiContext="problem_statement"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Solution Overview"
                value={prdData.solution_overview}
                onChange={(value) => updatePrdField('solution_overview', value)}
                placeholder="High-level description of the solution..."
                aiContext="solution_overview"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Target Audience"
                value={prdData.target_audience}
                onChange={(value) => updatePrdField('target_audience', value)}
                placeholder="Who will use this product..."
                aiContext="target_audience"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Value Proposition"
                value={prdData.value_proposition}
                onChange={(value) => updatePrdField('value_proposition', value)}
                placeholder="Unique value this product provides..."
                aiContext="value_proposition"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Success Summary"
                value={prdData.success_summary}
                onChange={(value) => updatePrdField('success_summary', value)}
                placeholder="What success looks like..."
                aiContext="success_summary"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 2: Requirements */}
            <CollapsibleSection
              title="2. Requirements"
              colorScheme={sectionColors['requirements']}
              preview={<SectionPreview 
                data={prdData} 
                fields={['user_stories', 'functional_requirements']} 
              />}
            >
              <AIEnhancedField
                label="User Stories"
                value={prdData.user_stories}
                onChange={(value) => updatePrdField('user_stories', value)}
                placeholder="As a [user], I want [feature] so that [benefit]..."
                aiContext="user_stories"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Functional Requirements"
                value={prdData.functional_requirements}
                onChange={(value) => updatePrdField('functional_requirements', value)}
                placeholder="What the system must do..."
                aiContext="functional_requirements"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Non-Functional Requirements"
                value={prdData.non_functional_requirements}
                onChange={(value) => updatePrdField('non_functional_requirements', value)}
                placeholder="Performance, security, usability requirements..."
                aiContext="non_functional_requirements"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Acceptance Criteria"
                value={prdData.acceptance_criteria}
                onChange={(value) => updatePrdField('acceptance_criteria', value)}
                placeholder="Conditions for acceptance..."
                aiContext="acceptance_criteria"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Out of Scope"
                value={prdData.out_of_scope}
                onChange={(value) => updatePrdField('out_of_scope', value)}
                placeholder="What this product will NOT do..."
                aiContext="out_of_scope"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 3: User Experience */}
            <CollapsibleSection
              title="3. User Experience"
              colorScheme={sectionColors['user-experience']}
              preview={<SectionPreview 
                data={prdData} 
                fields={['user_flows', 'wireframes_mockups']} 
              />}
            >
              <AIEnhancedField
                label="User Flows"
                value={prdData.user_flows}
                onChange={(value) => updatePrdField('user_flows', value)}
                placeholder="Step-by-step user journeys..."
                aiContext="user_flows"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Wireframes & Mockups"
                value={prdData.wireframes_mockups}
                onChange={(value) => updatePrdField('wireframes_mockups', value)}
                placeholder="Links to design files or descriptions..."
                aiContext="wireframes_mockups"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Interaction Design"
                value={prdData.interaction_design}
                onChange={(value) => updatePrdField('interaction_design', value)}
                placeholder="How users interact with the product..."
                aiContext="interaction_design"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Accessibility Requirements"
                value={prdData.accessibility_requirements}
                onChange={(value) => updatePrdField('accessibility_requirements', value)}
                placeholder="WCAG compliance, accessibility features..."
                aiContext="accessibility_requirements"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Mobile Considerations"
                value={prdData.mobile_considerations}
                onChange={(value) => updatePrdField('mobile_considerations', value)}
                placeholder="Responsive design, mobile-specific features..."
                aiContext="mobile_considerations"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 4: Business Context */}
            <CollapsibleSection
              title="4. Business Context"
              colorScheme={sectionColors['business-context']}
              preview={<SectionPreview 
                data={prdData} 
                fields={['business_objectives', 'success_metrics']} 
              />}
            >
              <AIEnhancedField
                label="Business Objectives"
                value={prdData.business_objectives}
                onChange={(value) => updatePrdField('business_objectives', value)}
                placeholder="Business goals this product supports..."
                aiContext="business_objectives"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Revenue Model"
                value={prdData.revenue_model}
                onChange={(value) => updatePrdField('revenue_model', value)}
                placeholder="How this product generates revenue..."
                aiContext="revenue_model"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Pricing Strategy"
                value={prdData.pricing_strategy}
                onChange={(value) => updatePrdField('pricing_strategy', value)}
                placeholder="Pricing tiers, models, strategy..."
                aiContext="pricing_strategy"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Go-to-Market Plan"
                value={prdData.go_to_market_plan}
                onChange={(value) => updatePrdField('go_to_market_plan', value)}
                placeholder="Launch strategy, marketing approach..."
                aiContext="go_to_market_plan"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Competitive Positioning"
                value={prdData.competitive_positioning}
                onChange={(value) => updatePrdField('competitive_positioning', value)}
                placeholder="How we compete in the market..."
                aiContext="competitive_positioning"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Success Metrics"
                value={prdData.success_metrics}
                onChange={(value) => updatePrdField('success_metrics', value)}
                placeholder="KPIs, OKRs, success measurements..."
                aiContext="success_metrics"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 5: Implementation Planning */}
            <CollapsibleSection
              title="5. Implementation Planning"
              colorScheme={sectionColors['implementation']}
              preview={<SectionPreview 
                data={prdData} 
                fields={['mvp_definition', 'timeline_milestones']} 
              />}
            >
              <AIEnhancedField
                label="MVP Definition"
                value={prdData.mvp_definition}
                onChange={(value) => updatePrdField('mvp_definition', value)}
                placeholder="Minimum viable product scope..."
                aiContext="mvp_definition"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Release Phases"
                value={prdData.release_phases}
                onChange={(value) => updatePrdField('release_phases', value)}
                placeholder="Phase 1: [features], Phase 2: [features]..."
                aiContext="release_phases"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Feature Prioritization"
                value={prdData.feature_prioritization}
                onChange={(value) => updatePrdField('feature_prioritization', value)}
                placeholder="Priority order of features..."
                aiContext="feature_prioritization"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Timeline & Milestones"
                value={prdData.timeline_milestones}
                onChange={(value) => updatePrdField('timeline_milestones', value)}
                placeholder="Key dates and deliverables..."
                aiContext="timeline_milestones"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Dependencies"
                value={prdData.dependencies}
                onChange={(value) => updatePrdField('dependencies', value)}
                placeholder="Technical, business, and external dependencies..."
                aiContext="dependencies"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Risks & Mitigation"
                value={prdData.risks_and_mitigation}
                onChange={(value) => updatePrdField('risks_and_mitigation', value)}
                placeholder="Identified risks and mitigation strategies..."
                aiContext="risks_and_mitigation"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>
            
            {/* Metadata & Relationships Section */}
            <CollapsibleSection
              title="Metadata & Relationships"
              colorScheme="gray"
              preview={<SectionPreview 
                data={prdData} 
                fields={['prd_id', 'linked_features']} 
              />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="PRD ID"
                  value={prdData.prd_id}
                  onChange={(value) => updatePrdField('prd_id', value)}
                  onBlur={() => touchField('prd_id')}
                  placeholder="PRD-001"
                  fieldType="text"
                  isEditMode={isEditMode}
                  error={getFieldError('prd_id')}
                  isRequired
                />
                <AIEnhancedField
                  label="Version"
                  value={prdData.version}
                  onChange={(value) => updatePrdField('version', value)}
                  onBlur={() => touchField('version')}
                  placeholder="1.0"
                  fieldType="text"
                  isEditMode={isEditMode}
                  error={getFieldError('version')}
                  isRequired
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Status"
                  value={prdData.status}
                  onChange={(value) => updatePrdField('status', value)}
                  placeholder="draft, review, approved, released"
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Product Manager"
                  value={prdData.product_manager}
                  onChange={(value) => updatePrdField('product_manager', value)}
                  placeholder="PM name"
                  fieldType="text"
                  isEditMode={isEditMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Linked TRDs"
                  value={prdData.linked_trds}
                  onChange={(value) => updatePrdField('linked_trds', value)}
                  placeholder="TRD-001, TRD-002..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Linked Tasks"
                  value={prdData.linked_tasks}
                  onChange={(value) => updatePrdField('linked_tasks', value)}
                  placeholder="TASK-001, TASK-002..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Linked Features"
                  value={prdData.linked_features}
                  onChange={(value) => updatePrdField('linked_features', value)}
                  placeholder="Feature-001, Feature-002..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Stakeholder List"
                  value={prdData.stakeholder_list}
                  onChange={(value) => updatePrdField('stakeholder_list', value)}
                  placeholder="Product Manager, Tech Lead, Designer..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Tags"
                  value={prdData.tags}
                  onChange={(value) => updatePrdField('tags', value)}
                  placeholder="mvp, q1-2025, mobile, high-priority..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Implementation Notes"
                  value={prdData.implementation_notes}
                  onChange={(value) => updatePrdField('implementation_notes', value)}
                  placeholder="Additional notes for implementation..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
              </div>
              <AIEnhancedField
                label="Last Reviewed"
                value={prdData.last_reviewed}
                onChange={(value) => updatePrdField('last_reviewed', value)}
                placeholder="YYYY-MM-DD"
                fieldType="text"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

          </>
        )}
      </CardContainer>
    </ErrorBoundary>
  )
}