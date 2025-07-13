'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Edit3, Trash2, Copy, Brain, X, Check, Eye, Edit, FileText, ListTodo } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { PRDCardData, PRDCardProps } from '@/types/prd'

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
          enhancementType: 'improve',
          cardType: 'prd'
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(prd.title)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)

  // Initialize PRD data with defaults
  const [prdData, setPrdData] = useState<PRDCardData>(() => {
    const data = prd.card_data || {}
    return {
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
    if (onUpdate && titleValue !== prd.title) {
      onUpdate(prd.id, { title: titleValue })
    }
    setEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setTitleValue(prd.title)
    setEditingTitle(false)
  }

  const updatePrdField = (field: keyof PRDCardData, value: string) => {
    const newPrdData = { ...prdData, [field]: value }
    setPrdData(newPrdData)
    
    // Auto-save to database
    if (onUpdate) {
      onUpdate(prd.id, { card_data: newPrdData })
    }
  }

  // Section colors - matching the design system
  const sectionColors = {
    'product-overview': 'bg-blue-50 border-blue-200',
    'requirements': 'bg-green-50 border-green-200',
    'user-experience': 'bg-purple-50 border-purple-200',
    'business-context': 'bg-orange-50 border-orange-200',
    'implementation': 'bg-yellow-50 border-yellow-200'
  }

  // Status colors
  const statusColors = {
    'draft': 'bg-gray-100 text-gray-700 border-gray-300',
    'review': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'approved': 'bg-green-100 text-green-700 border-green-300',
    'released': 'bg-blue-100 text-blue-700 border-blue-300'
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Main PRD Header - Collapsible */}
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Selection Checkbox */}
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(prd.id)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            )}
            
            {/* Collapse/Expand PRD */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center space-x-2 text-left flex-1"
            >
              {isCollapsed ? 
                <ChevronRight className="w-4 h-4 text-gray-500" /> : 
                <ChevronDown className="w-4 h-4 text-gray-500" />
              }
              
              {/* Title and Metadata */}
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
                      {prd.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {prdData.prd_id} • v{prdData.version}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColors[prdData.status]}`}>
                        {prdData.status.charAt(0).toUpperCase() + prdData.status.slice(1)}
                      </span>
                      {prdData.product_manager && (
                        <span className="text-xs text-gray-500">
                          PM: {prdData.product_manager}
                        </span>
                      )}
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

            {/* Conversion Buttons */}
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
            </div>
          </div>
        </div>
      </div>

      {/* PRD Content - Only show when not collapsed */}
      {!isCollapsed && (
        <>
          {/* Section 1: Product Overview */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('product-overview')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">1. Product Overview</span>
              {expandedSections.has('product-overview') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('product-overview') && (
              <div className={`p-2 space-y-2 ${sectionColors['product-overview']}`}>
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
              </div>
            )}
          </div>

          {/* Section 2: Requirements */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('requirements')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">2. Requirements</span>
              {expandedSections.has('requirements') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('requirements') && (
              <div className={`p-2 space-y-2 ${sectionColors['requirements']}`}>
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
              </div>
            )}
          </div>

          {/* Section 3: User Experience */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('user-experience')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">3. User Experience</span>
              {expandedSections.has('user-experience') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('user-experience') && (
              <div className={`p-2 space-y-2 ${sectionColors['user-experience']}`}>
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
              </div>
            )}
          </div>

          {/* Section 4: Business Context */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('business-context')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">4. Business Context</span>
              {expandedSections.has('business-context') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('business-context') && (
              <div className={`p-2 space-y-2 ${sectionColors['business-context']}`}>
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
              </div>
            )}
          </div>

          {/* Section 5: Implementation Planning */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('implementation')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">5. Implementation Planning</span>
              {expandedSections.has('implementation') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('implementation') && (
              <div className={`p-2 space-y-2 ${sectionColors['implementation']}`}>
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
              </div>
            )}
          </div>
          
          {/* Metadata & Relationships Section */}
          <div className="p-2 bg-gray-50 space-y-2">
            <h4 className="text-xs font-medium text-gray-900">Metadata & Relationships</h4>
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
          </div>
        </>
      )}
    </div>
  )
}