'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Edit3, Trash2, Copy, Brain, X, Check, Eye, Edit, Clock, Users, AlertTriangle } from 'lucide-react'
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

interface TaskListCardProps {
  taskList: {
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
  onConvertToSprint?: (taskList: any) => void
  isSelected?: boolean
  onSelect?: (id: string) => void
}

export default function TaskListCard({ 
  taskList, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onConvertToSprint,
  isSelected,
  onSelect 
}: TaskListCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(taskList.title)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)

  // Initialize Task List data with defaults
  const [taskData, setTaskData] = useState(() => {
    const data = taskList.card_data || {}
    return {
      // Header fields
      task_list_id: data.task_list_id || '',
      version: data.version || '1.0',
      status: data.status || 'Not Started',
      assigned_team: data.assigned_team || '',
      sprint: data.sprint || '',
      priority: data.priority || 'Medium',
      estimated_effort: data.estimated_effort || '',
      completion_percentage: data.completion_percentage || '0',
      
      // Section 1: Task Overview
      task_summary: data.task_summary || '',
      business_value: data.business_value || '',
      acceptance_criteria: data.acceptance_criteria || '',
      success_metrics: data.success_metrics || '',
      
      // Section 2: Development Tasks
      backend_tasks: data.backend_tasks || '',
      frontend_tasks: data.frontend_tasks || '',
      integration_tasks: data.integration_tasks || '',
      infrastructure_tasks: data.infrastructure_tasks || '',
      
      // Section 3: Testing & QA Tasks
      unit_testing_tasks: data.unit_testing_tasks || '',
      integration_testing_tasks: data.integration_testing_tasks || '',
      user_testing_tasks: data.user_testing_tasks || '',
      performance_testing_tasks: data.performance_testing_tasks || '',
      security_testing_tasks: data.security_testing_tasks || '',
      
      // Section 4: Dependencies & Blockers
      technical_dependencies: data.technical_dependencies || '',
      external_dependencies: data.external_dependencies || '',
      current_blockers: data.current_blockers || '',
      risk_mitigation: data.risk_mitigation || '',
      
      // Section 5: Documentation Tasks
      technical_documentation: data.technical_documentation || '',
      user_documentation: data.user_documentation || '',
      process_documentation: data.process_documentation || '',
      knowledge_transfer: data.knowledge_transfer || '',
      
      // Section 6: Timeline & Milestones
      phase_breakdown: data.phase_breakdown || '',
      key_milestones: data.key_milestones || '',
      deadline_requirements: data.deadline_requirements || '',
      resource_allocation: data.resource_allocation || '',
      
      // Metadata & Relationships
      linked_features: data.linked_features || '',
      source_requirements: data.source_requirements || '',
      tags: data.tags || '',
      progress_notes: data.progress_notes || '',
      source_trd_id: data.source_trd_id || '',
      generated_from: data.generated_from || '',
      last_sync_date: data.last_sync_date || ''
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
    if (onUpdate && titleValue !== taskList.title) {
      onUpdate(taskList.id, { title: titleValue })
    }
    setEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setTitleValue(taskList.title)
    setEditingTitle(false)
  }

  const updateTaskField = (field: string, value: string) => {
    const newTaskData = { ...taskData, [field]: value }
    setTaskData(newTaskData)
    
    // Ensure metadata object exists and maintain required structure for database
    const updatedCardData = {
      ...newTaskData,
      metadata: {
        task_list_id: newTaskData.task_list_id || taskData.task_list_id || 'TASK-001',
        version: newTaskData.version || taskData.version || '1.0',
        status: newTaskData.status || taskData.status || 'Not Started',
        assigned_team: newTaskData.assigned_team || taskData.assigned_team || 'Development Team',
        sprint: newTaskData.sprint || taskData.sprint || 'Sprint 1',
        priority: newTaskData.priority || taskData.priority || 'Medium',
        estimated_effort: newTaskData.estimated_effort || taskData.estimated_effort || '2 weeks',
        completion_percentage: newTaskData.completion_percentage || taskData.completion_percentage || '25',
        created_date: newTaskData.created_date || taskData.created_date || new Date().toISOString().split('T')[0],
        last_updated: new Date().toISOString().split('T')[0]
      },
      categories: [
        {
          id: 'general',
          name: 'General Tasks',
          description: 'General development and implementation tasks',
          tasks: []
        }
      ]
    }
    
    // Auto-save to database with proper structure
    if (onUpdate) {
      onUpdate(taskList.id, { card_data: updatedCardData })
    }
  }

  // Status colors for task management
  const statusColors = {
    'Not Started': 'bg-gray-100 text-gray-700 border-gray-300',
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-300',
    'Blocked': 'bg-red-100 text-red-700 border-red-300',
    'Review': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'Completed': 'bg-green-100 text-green-700 border-green-300'
  }

  const priorityColors = {
    'Low': 'bg-gray-100 text-gray-700',
    'Medium': 'bg-blue-100 text-blue-700',
    'High': 'bg-orange-100 text-orange-700',
    'Critical': 'bg-red-100 text-red-700'
  }

  // Section colors - different colors for task categories
  const sectionColors = {
    'task-overview': 'bg-blue-50 border-blue-200',
    'development-tasks': 'bg-green-50 border-green-200',
    'testing-qa': 'bg-purple-50 border-purple-200',
    'dependencies-blockers': 'bg-orange-50 border-orange-200',
    'documentation': 'bg-cyan-50 border-cyan-200',
    'timeline-milestones': 'bg-yellow-50 border-yellow-200'
  }

  const completionPercentage = parseInt(taskData.completion_percentage) || 0
  const isCompleted = taskData.status === 'Completed'

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Main Task List Header - Collapsible */}
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Selection Checkbox */}
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(taskList.id)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            )}
            
            {/* Collapse/Expand Task List */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center space-x-2 text-left flex-1"
            >
              {isCollapsed ? 
                <ChevronRight className="w-4 h-4 text-gray-500" /> : 
                <ChevronDown className="w-4 h-4 text-gray-500" />
              }
              
              {/* Title and Status */}
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
                      {taskList.title}
                    </h3>
                    {/* Task metadata and progress */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs text-gray-500">
                        {taskData.task_list_id || 'TASK-001'} • {taskData.version} • {taskData.assigned_team || 'Unassigned'}
                      </div>
                      {taskData.sprint && (
                        <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                          {taskData.sprint}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColors[taskData.status as keyof typeof statusColors] || statusColors['Not Started']}`}>
                        {taskData.status}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${priorityColors[taskData.priority as keyof typeof priorityColors] || priorityColors['Medium']}`}>
                        {taskData.priority}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
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

            {onConvertToSprint && (
              <button
                onClick={() => onConvertToSprint(taskList)}
                className="px-3 py-1.5 text-sm rounded-md transition-colors bg-black text-white hover:bg-gray-800"
                title="Convert to Sprint"
              >
                <Clock className="w-3 h-3 inline mr-1" />
                To Sprint
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
                  onClick={() => onDuplicate(taskList.id)}
                  className="p-1.5 text-gray-600 hover:text-green-600 rounded transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(taskList.id)}
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

      {/* Task List Content - Only show when not collapsed */}
      {!isCollapsed && (
        <>
          {/* Section 1: Task Overview */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('task-overview')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">1. Task Overview</span>
              {expandedSections.has('task-overview') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('task-overview') && (
              <div className={`p-2 space-y-2 ${sectionColors['task-overview']}`}>
                <AIEnhancedField
                  label="Task Summary"
                  value={taskData.task_summary}
                  onChange={(value) => updateTaskField('task_summary', value)}
                  placeholder="High-level description of what needs to be accomplished..."
                  aiContext="task_summary"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Business Value"
                  value={taskData.business_value}
                  onChange={(value) => updateTaskField('business_value', value)}
                  placeholder="Why this task list is important and valuable..."
                  aiContext="business_value"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Acceptance Criteria"
                  value={taskData.acceptance_criteria}
                  onChange={(value) => updateTaskField('acceptance_criteria', value)}
                  placeholder="What defines completion and success..."
                  aiContext="acceptance_criteria"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Success Metrics"
                  value={taskData.success_metrics}
                  onChange={(value) => updateTaskField('success_metrics', value)}
                  placeholder="How to measure success and impact..."
                  aiContext="success_metrics"
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </div>

          {/* Section 2: Development Tasks */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('development-tasks')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">2. Development Tasks</span>
              {expandedSections.has('development-tasks') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('development-tasks') && (
              <div className={`p-2 space-y-2 ${sectionColors['development-tasks']}`}>
                <AIEnhancedField
                  label="Backend Tasks"
                  value={taskData.backend_tasks}
                  onChange={(value) => updateTaskField('backend_tasks', value)}
                  placeholder="API development, database changes, server-side logic..."
                  aiContext="backend_tasks"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Frontend Tasks"
                  value={taskData.frontend_tasks}
                  onChange={(value) => updateTaskField('frontend_tasks', value)}
                  placeholder="UI components, user flows, client-side functionality..."
                  aiContext="frontend_tasks"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Integration Tasks"
                  value={taskData.integration_tasks}
                  onChange={(value) => updateTaskField('integration_tasks', value)}
                  placeholder="API integrations, third-party services, system connections..."
                  aiContext="integration_tasks"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Infrastructure Tasks"
                  value={taskData.infrastructure_tasks}
                  onChange={(value) => updateTaskField('infrastructure_tasks', value)}
                  placeholder="DevOps, deployment, environment setup, monitoring..."
                  aiContext="infrastructure_tasks"
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </div>

          {/* Section 3: Testing & QA Tasks */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('testing-qa')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">3. Testing & QA Tasks</span>
              {expandedSections.has('testing-qa') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('testing-qa') && (
              <div className={`p-2 space-y-2 ${sectionColors['testing-qa']}`}>
                <AIEnhancedField
                  label="Unit Testing Tasks"
                  value={taskData.unit_testing_tasks}
                  onChange={(value) => updateTaskField('unit_testing_tasks', value)}
                  placeholder="Unit test creation, test coverage requirements..."
                  aiContext="unit_testing_tasks"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Integration Testing Tasks"
                  value={taskData.integration_testing_tasks}
                  onChange={(value) => updateTaskField('integration_testing_tasks', value)}
                  placeholder="API testing, system integration validation..."
                  aiContext="integration_testing_tasks"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="User Testing Tasks"
                  value={taskData.user_testing_tasks}
                  onChange={(value) => updateTaskField('user_testing_tasks', value)}
                  placeholder="UAT, usability testing, user feedback collection..."
                  aiContext="user_testing_tasks"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Performance Testing Tasks"
                  value={taskData.performance_testing_tasks}
                  onChange={(value) => updateTaskField('performance_testing_tasks', value)}
                  placeholder="Load testing, optimization, performance benchmarks..."
                  aiContext="performance_testing_tasks"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Security Testing Tasks"
                  value={taskData.security_testing_tasks}
                  onChange={(value) => updateTaskField('security_testing_tasks', value)}
                  placeholder="Security validation, penetration testing, vulnerability scans..."
                  aiContext="security_testing_tasks"
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </div>

          {/* Section 4: Dependencies & Blockers */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('dependencies-blockers')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">4. Dependencies & Blockers</span>
              {expandedSections.has('dependencies-blockers') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('dependencies-blockers') && (
              <div className={`p-2 space-y-2 ${sectionColors['dependencies-blockers']}`}>
                <AIEnhancedField
                  label="Technical Dependencies"
                  value={taskData.technical_dependencies}
                  onChange={(value) => updateTaskField('technical_dependencies', value)}
                  placeholder="What technical work needs to be completed first..."
                  aiContext="technical_dependencies"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="External Dependencies"
                  value={taskData.external_dependencies}
                  onChange={(value) => updateTaskField('external_dependencies', value)}
                  placeholder="Third-party integrations, approvals, external resources..."
                  aiContext="external_dependencies"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Current Blockers"
                  value={taskData.current_blockers}
                  onChange={(value) => updateTaskField('current_blockers', value)}
                  placeholder="What's currently preventing progress..."
                  aiContext="current_blockers"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Risk Mitigation"
                  value={taskData.risk_mitigation}
                  onChange={(value) => updateTaskField('risk_mitigation', value)}
                  placeholder="How to handle potential issues and risks..."
                  aiContext="risk_mitigation"
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </div>

          {/* Section 5: Documentation Tasks */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('documentation')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">5. Documentation Tasks</span>
              {expandedSections.has('documentation') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('documentation') && (
              <div className={`p-2 space-y-2 ${sectionColors['documentation']}`}>
                <AIEnhancedField
                  label="Technical Documentation"
                  value={taskData.technical_documentation}
                  onChange={(value) => updateTaskField('technical_documentation', value)}
                  placeholder="API docs, architecture documentation, code comments..."
                  aiContext="technical_documentation"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="User Documentation"
                  value={taskData.user_documentation}
                  onChange={(value) => updateTaskField('user_documentation', value)}
                  placeholder="User guides, help content, tutorials..."
                  aiContext="user_documentation"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Process Documentation"
                  value={taskData.process_documentation}
                  onChange={(value) => updateTaskField('process_documentation', value)}
                  placeholder="Deployment guides, runbooks, operational procedures..."
                  aiContext="process_documentation"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Knowledge Transfer"
                  value={taskData.knowledge_transfer}
                  onChange={(value) => updateTaskField('knowledge_transfer', value)}
                  placeholder="Training requirements, handover documentation..."
                  aiContext="knowledge_transfer"
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </div>

          {/* Section 6: Timeline & Milestones */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('timeline-milestones')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">6. Timeline & Milestones</span>
              {expandedSections.has('timeline-milestones') ? 
                <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                <ChevronRight className="w-4 h-4 text-gray-500" />
              }
            </button>
            {expandedSections.has('timeline-milestones') && (
              <div className={`p-2 space-y-2 ${sectionColors['timeline-milestones']}`}>
                <AIEnhancedField
                  label="Phase Breakdown"
                  value={taskData.phase_breakdown}
                  onChange={(value) => updateTaskField('phase_breakdown', value)}
                  placeholder="Development phases and timeline breakdown..."
                  aiContext="phase_breakdown"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Key Milestones"
                  value={taskData.key_milestones}
                  onChange={(value) => updateTaskField('key_milestones', value)}
                  placeholder="Major deliverables and important dates..."
                  aiContext="key_milestones"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Deadline Requirements"
                  value={taskData.deadline_requirements}
                  onChange={(value) => updateTaskField('deadline_requirements', value)}
                  placeholder="Hard deadlines and time constraints..."
                  aiContext="deadline_requirements"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Resource Allocation"
                  value={taskData.resource_allocation}
                  onChange={(value) => updateTaskField('resource_allocation', value)}
                  placeholder="Team member assignments and resource planning..."
                  aiContext="resource_allocation"
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
                value={taskData.linked_features}
                onChange={(value) => updateTaskField('linked_features', value)}
                placeholder="Feature-001, User-Auth-Feature..."
                aiContext="linked_features"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Source Requirements"
                value={taskData.source_requirements}
                onChange={(value) => updateTaskField('source_requirements', value)}
                placeholder="TRD-001, PRD-AUTH-2025..."
                aiContext="source_requirements"
                isEditMode={isEditMode}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <AIEnhancedField
                label="Tags"
                value={taskData.tags}
                onChange={(value) => updateTaskField('tags', value)}
                placeholder="sprint, backend, urgent, testing..."
                aiContext="tags"
                isEditMode={isEditMode}
              />
              <AIEnhancedField
                label="Progress Notes"
                value={taskData.progress_notes}
                onChange={(value) => updateTaskField('progress_notes', value)}
                placeholder="Current status, blockers, updates..."
                aiContext="progress_notes"
                isEditMode={isEditMode}
              />
            </div>
            {taskData.source_trd_id && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Source TRD"
                  value={taskData.source_trd_id}
                  onChange={(value) => updateTaskField('source_trd_id', value)}
                  placeholder="TRD-001"
                  aiContext="source_trd"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Generated From"
                  value={taskData.generated_from}
                  onChange={(value) => updateTaskField('generated_from', value)}
                  placeholder="AI Generated from TRD-PAYMENT-001"
                  aiContext="generated_from"
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}