'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Trash2, Copy, FileText, ListTodo } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { PRDMultiItemData, PRDMultiItemCardProps, MultiItemOperation } from '@/types/prd-multi-item'

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

// Import multi-item field components
import MultiItemField from '@/components/shared/multi-item-field/MultiItemField'
import { prdMultiItemConfigs } from '@/components/shared/multi-item-field/configs/prdConfigs'

// PRD-specific section colors
const sectionColors = {
  'product-overview': 'blue',
  'requirements': 'green',
  'user-experience': 'purple',
  'business-context': 'orange',
  'implementation': 'yellow'
} as const

export default function PRDCardMultiItem({ 
  prd, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onConvertToTRD,
  onConvertToTasks,
  isSelected,
  onSelect 
}: PRDMultiItemCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)

  // Initialize PRD data with defaults for multi-item structure
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
      
      // Section 1: Product Overview (single fields)
      product_vision: data.product_vision || '',
      problem_statement: data.problem_statement || '',
      solution_overview: data.solution_overview || '',
      target_audience: data.target_audience || '',
      value_proposition: data.value_proposition || '',
      success_summary: data.success_summary || '',
      
      // Section 2: Requirements (mixed - some multi-item, some single)
      user_stories: data.user_stories || [],
      functional_requirements: data.functional_requirements || [],
      non_functional_requirements: data.non_functional_requirements || '',
      acceptance_criteria: data.acceptance_criteria || [],
      out_of_scope: data.out_of_scope || '',
      
      // Section 3: User Experience (single fields)
      user_flows: data.user_flows || '',
      wireframes_mockups: data.wireframes_mockups || '',
      interaction_design: data.interaction_design || '',
      accessibility_requirements: data.accessibility_requirements || '',
      mobile_considerations: data.mobile_considerations || '',
      
      // Section 4: Business Context (single fields)
      business_objectives: data.business_objectives || '',
      revenue_model: data.revenue_model || '',
      pricing_strategy: data.pricing_strategy || '',
      go_to_market_plan: data.go_to_market_plan || '',
      competitive_positioning: data.competitive_positioning || '',
      success_metrics: data.success_metrics || '',
      
      // Section 5: Implementation Planning (mixed - some multi-item, some single)
      mvp_definition: data.mvp_definition || '',
      release_phases: data.release_phases || '',
      feature_prioritization: data.feature_prioritization || '',
      timeline_milestones: data.timeline_milestones || [],
      dependencies: data.dependencies || [],
      risks_and_mitigation: data.risks_and_mitigation || [],
      
      // Metadata & Relationships (mixed)
      linked_trds: data.linked_trds || [],
      linked_tasks: data.linked_tasks || [],
      linked_features: data.linked_features || [],
      stakeholder_list: data.stakeholder_list || '',
      tags: data.tags || '',
      implementation_notes: data.implementation_notes || ''
    }
  }, [prd])

  // Initialize auto-save
  const {
    data: prdData,
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
        await onUpdate(prd.id, {
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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'cmd+s': () => {
      forceSave()
      toast.success('PRD saved!')
    },
    'cmd+e': () => setIsEditMode(!isEditMode)
  })

  // Update field with validation
  const updatePrdField = useCallback((field: string, value: any) => {
    updateField(field, value)
    if (field === 'prd_id' || field === 'version') {
      validateField(field, value)
    }
  }, [updateField, validateField])

  // Handle multi-item operations
  const handleMultiItemChange = useCallback((fieldName: string, operations: MultiItemOperation<any>[]) => {
    // This is a simplified implementation - in a real app, you'd make API calls
    // to update the database tables directly
    const currentItems = prdData[fieldName] || []
    let updatedItems = [...currentItems]

    operations.forEach(operation => {
      switch (operation.type) {
        case 'create':
          if (operation.item) {
            updatedItems.push({
              ...operation.item,
              id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
              card_id: prd.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
          break
        case 'update':
          if (operation.itemId && operation.updates) {
            const itemIndex = updatedItems.findIndex(item => item.id === operation.itemId)
            if (itemIndex !== -1) {
              updatedItems[itemIndex] = {
                ...updatedItems[itemIndex],
                ...operation.updates,
                updated_at: new Date().toISOString()
              }
            }
          }
          break
        case 'delete':
          if (operation.itemId) {
            updatedItems = updatedItems.filter(item => item.id !== operation.itemId)
          }
          break
        case 'reorder':
          if (operation.newOrder) {
            updatedItems = operation.newOrder.map((item, index) => ({
              ...item,
              order_index: index,
              updated_at: new Date().toISOString()
            }))
          }
          break
      }
    })

    updatePrdField(fieldName, updatedItems)
  }, [prdData, prd.id, updatePrdField])

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
      {onConvertToTRD && (
        <button
          onClick={() => onConvertToTRD(prd)}
          className="px-3 py-1.5 text-xs bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          title="Convert PRD to Technical Requirements Document"
        >
          <FileText className="w-3 h-3 inline mr-1" />
          To TRD
        </button>
      )}
      {onConvertToTasks && (
        <button
          onClick={() => onConvertToTasks(prd)}
          className="px-3 py-1.5 text-xs bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          title="Convert PRD to Task List"
        >
          <ListTodo className="w-3 h-3 inline mr-1" />
          To Tasks
        </button>
      )}
      {onDuplicate && (
        <button
          onClick={() => onDuplicate(prd.id)}
          className="p-1.5 text-gray-600 hover:text-green-600 rounded transition-colors"
          title="Duplicate"
        >
          <Copy className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
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
      <div className="bg-white">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={prdData.title}
                onChange={(e) => updatePrdField('title', e.target.value)}
                className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
                placeholder="PRD Title"
              />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {metadata}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isEditMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isEditMode ? 'View' : 'Edit'}
              </button>
              {actions}
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <textarea
              value={prdData.description}
              onChange={(e) => updatePrdField('description', e.target.value)}
              placeholder="Brief description of this product requirement..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="p-6 space-y-6">{/* Content sections */}

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

            {/* Section 2: Requirements (MULTI-ITEM) */}
            <CollapsibleSection
              title="2. Requirements"
              colorScheme={sectionColors['requirements']}
              preview={<SectionPreview 
                data={prdData} 
                fields={['user_stories', 'functional_requirements']} 
              />}
            >
              {/* User Stories - Multi-item */}
              <MultiItemField
                items={prdData.user_stories}
                config={prdMultiItemConfigs.user_stories}
                onItemsChange={(operations) => handleMultiItemChange('user_stories', operations)}
                isEditMode={isEditMode}
                aiContext="user_stories"
                isRequired={true}
              />
              
              {/* Functional Requirements - Multi-item */}
              <MultiItemField
                items={prdData.functional_requirements}
                config={prdMultiItemConfigs.functional_requirements}
                onItemsChange={(operations) => handleMultiItemChange('functional_requirements', operations)}
                isEditMode={isEditMode}
                aiContext="functional_requirements"
                isRequired={true}
              />
              
              {/* Non-Functional Requirements - Keep as single field */}
              <AIEnhancedField
                label="Non-Functional Requirements"
                value={prdData.non_functional_requirements}
                onChange={(value) => updatePrdField('non_functional_requirements', value)}
                placeholder="Performance, security, usability requirements..."
                aiContext="non_functional_requirements"
                isEditMode={isEditMode}
              />
              
              {/* Out of Scope - Keep as single field */}
              <AIEnhancedField
                label="Out of Scope"
                value={prdData.out_of_scope}
                onChange={(value) => updatePrdField('out_of_scope', value)}
                placeholder="What this product will NOT do..."
                aiContext="out_of_scope"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Section 3: User Experience (single fields) */}
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

            {/* Section 4: Business Context (single fields) */}
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

            {/* Section 5: Implementation Planning (MULTI-ITEM) */}
            <CollapsibleSection
              title="5. Implementation Planning"
              colorScheme={sectionColors['implementation']}
              preview={<SectionPreview 
                data={prdData} 
                fields={['mvp_definition', 'timeline_milestones']} 
              />}
            >
              {/* MVP Definition - Keep as single field */}
              <AIEnhancedField
                label="MVP Definition"
                value={prdData.mvp_definition}
                onChange={(value) => updatePrdField('mvp_definition', value)}
                placeholder="Minimum viable product scope..."
                aiContext="mvp_definition"
                isEditMode={isEditMode}
              />
              
              {/* Release Phases - Keep as single field */}
              <AIEnhancedField
                label="Release Phases"
                value={prdData.release_phases}
                onChange={(value) => updatePrdField('release_phases', value)}
                placeholder="Phase 1: [features], Phase 2: [features]..."
                aiContext="release_phases"
                isEditMode={isEditMode}
              />
              
              {/* Feature Prioritization - Keep as single field */}
              <AIEnhancedField
                label="Feature Prioritization"
                value={prdData.feature_prioritization}
                onChange={(value) => updatePrdField('feature_prioritization', value)}
                placeholder="Priority order of features..."
                aiContext="feature_prioritization"
                isEditMode={isEditMode}
              />
              
              {/* Timeline & Milestones - Multi-item */}
              <MultiItemField
                items={prdData.timeline_milestones}
                config={prdMultiItemConfigs.timeline_milestones}
                onItemsChange={(operations) => handleMultiItemChange('timeline_milestones', operations)}
                isEditMode={isEditMode}
                aiContext="timeline_milestones"
              />
              
              {/* Dependencies - Multi-item */}
              <MultiItemField
                items={prdData.dependencies}
                config={prdMultiItemConfigs.dependencies}
                onItemsChange={(operations) => handleMultiItemChange('dependencies', operations)}
                isEditMode={isEditMode}
                aiContext="dependencies"
              />
              
              {/* Risks & Mitigation - Multi-item */}
              <MultiItemField
                items={prdData.risks_and_mitigation}
                config={prdMultiItemConfigs.risks_and_mitigation}
                onItemsChange={(operations) => handleMultiItemChange('risks_and_mitigation', operations)}
                isEditMode={isEditMode}
                aiContext="risks_and_mitigation"
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
              
              {/* Linked Items - Multi-item (combined TRDs, Tasks, Features) */}
              <MultiItemField
                items={[...prdData.linked_trds, ...prdData.linked_tasks, ...prdData.linked_features]}
                config={prdMultiItemConfigs.linked_items}
                onItemsChange={(operations) => handleMultiItemChange('linked_items', operations)}
                isEditMode={isEditMode}
                aiContext="linked_items"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Stakeholder List"
                  value={prdData.stakeholder_list}
                  onChange={(value) => updatePrdField('stakeholder_list', value)}
                  placeholder="Product Manager, Tech Lead, Designer..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Tags"
                  value={prdData.tags}
                  onChange={(value) => updatePrdField('tags', value)}
                  placeholder="mvp, q1-2025, mobile, high-priority..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
              </div>
              
              <AIEnhancedField
                label="Implementation Notes"
                value={prdData.implementation_notes}
                onChange={(value) => updatePrdField('implementation_notes', value)}
                placeholder="Additional notes for implementation..."
                fieldType="text"
                isEditMode={isEditMode}
              />
              
              <AIEnhancedField
                label="Last Reviewed"
                value={prdData.last_reviewed}
                onChange={(value) => updatePrdField('last_reviewed', value)}
                placeholder="YYYY-MM-DD"
                fieldType="text"
                isEditMode={isEditMode}
              />
            </CollapsibleSection>

            {/* Save Error Display */}
            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">Error saving: {saveError.message}</p>
              </div>
            )}
        </div>
      </div>
    </ErrorBoundary>
  )
}