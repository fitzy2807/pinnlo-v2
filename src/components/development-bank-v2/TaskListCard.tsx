'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Trash2, Copy, Clock, Check } from 'lucide-react'
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

// Task List-specific section colors
const sectionColors = {
  'task-overview': 'blue',
  'development-tasks': 'green',
  'testing-qa': 'purple',
  'dependencies-blockers': 'orange',
  'documentation': 'cyan',
  'timeline-milestones': 'yellow'
} as const

export default function TaskListCard({ 
  taskList, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onConvertToSprint,
  isSelected,
  onSelect 
}: TaskListCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)

  // Initialize Task List data with defaults
  const initialData = useMemo(() => {
    const data = taskList.card_data || {}
    return {
      title: taskList.title,
      description: taskList.description,
      
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
  }, [taskList])

  // Initialize auto-save
  const {
    data: taskData,
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
        await onUpdate(taskList.id, {
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
      field: 'task_list_id',
      validate: validators.required('Task List ID is required')
    },
    {
      field: 'task_list_id',
      validate: validators.pattern(/^TASK-\d+$/, 'Format must be TASK-XXX')
    },
    {
      field: 'version',
      validate: validators.required('Version is required')
    }
  ], [])

  const { errors, validateField, touchField, getFieldError } = useValidation(taskData, {
    rules: validationRules
  })

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'cmd+s': () => {
      forceSave()
      toast.success('Task List saved!')
    },
    'cmd+e': () => setIsEditMode(!isEditMode)
  })

  // Update field with validation
  const updateTaskField = useCallback((field: string, value: string) => {
    updateField(field, value)
    if (field === 'task_list_id' || field === 'version') {
      validateField(field, value)
    }
  }, [updateField, validateField])

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

  const completionPercentage = parseInt(taskData.completion_percentage) || 0
  const isCompleted = taskData.status === 'Completed'

  // Metadata display
  const metadata = (
    <>
      {taskData.task_list_id || 'TASK-001'} • 
      v{taskData.version} • 
      {taskData.status} • 
      {taskData.assigned_team || 'Unassigned'}
      {taskData.sprint && (
        <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
          {taskData.sprint}
        </span>
      )}
    </>
  )

  // Card actions
  const actions = (
    <>
      {onConvertToSprint && (
        <button
          onClick={() => onConvertToSprint(taskList)}
          className="px-3 py-1.5 text-xs rounded-md transition-colors bg-black text-white hover:bg-gray-800"
          title="Convert to Sprint"
        >
          <Clock className="w-3 h-3 inline mr-1" />
          To Sprint
        </button>
      )}
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
    </>
  )

  return (
    <ErrorBoundary>
      <CardContainer 
        isSelected={isSelected} 
        onClick={onSelect ? () => onSelect(taskList.id) : undefined}
      >
        <CardHeader
          title={taskData.title}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          onTitleEdit={isEditMode ? (newTitle) => updateTaskField('title', newTitle) : undefined}
          metadata={metadata}
          saveStatus={saveStatus}
          actions={actions}
          onSelect={onSelect ? () => onSelect(taskList.id) : undefined}
          isSelected={isSelected}
        />

        {!isCollapsed && (
          <>
            {/* Description */}
            <div className="p-3 border-b border-gray-100">
              <AIEnhancedField
                label="Description"
                value={taskData.description}
                onChange={(value) => updateTaskField('description', value)}
                placeholder="Brief description of this task list..."
                isEditMode={isEditMode}
                aiContext="task_list_description"
              />
            </div>

            {/* Progress Bar */}
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Section 1: Task Overview */}
            <CollapsibleSection
              title="1. Task Overview"
              colorScheme={sectionColors['task-overview']}
              defaultExpanded={true}
              preview={<SectionPreview 
                data={taskData} 
                fields={['task_summary', 'business_value']} 
              />}
            >
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
            </CollapsibleSection>

            {/* Section 2: Development Tasks */}
            <CollapsibleSection
              title="2. Development Tasks"
              colorScheme={sectionColors['development-tasks']}
              preview={<SectionPreview 
                data={taskData} 
                fields={['backend_tasks', 'frontend_tasks']} 
              />}
            >
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
            </CollapsibleSection>

            {/* Section 3: Testing & QA Tasks */}
            <CollapsibleSection
              title="3. Testing & QA Tasks"
              colorScheme={sectionColors['testing-qa']}
              preview={<SectionPreview 
                data={taskData} 
                fields={['unit_testing_tasks', 'integration_testing_tasks']} 
              />}
            >
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
            </CollapsibleSection>

            {/* Section 4: Dependencies & Blockers */}
            <CollapsibleSection
              title="4. Dependencies & Blockers"
              colorScheme={sectionColors['dependencies-blockers']}
              preview={<SectionPreview 
                data={taskData} 
                fields={['technical_dependencies', 'current_blockers']} 
              />}
            >
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
            </CollapsibleSection>

            {/* Section 5: Documentation Tasks */}
            <CollapsibleSection
              title="5. Documentation Tasks"
              colorScheme={sectionColors['documentation']}
              preview={<SectionPreview 
                data={taskData} 
                fields={['technical_documentation', 'user_documentation']} 
              />}
            >
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
            </CollapsibleSection>

            {/* Section 6: Timeline & Milestones */}
            <CollapsibleSection
              title="6. Timeline & Milestones"
              colorScheme={sectionColors['timeline-milestones']}
              preview={<SectionPreview 
                data={taskData} 
                fields={['phase_breakdown', 'key_milestones']} 
              />}
            >
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
            </CollapsibleSection>
            
            {/* Metadata & Relationships Section */}
            <CollapsibleSection
              title="Metadata & Relationships"
              colorScheme="gray"
              preview={<SectionPreview 
                data={taskData} 
                fields={['task_list_id', 'linked_features']} 
              />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Task List ID"
                  value={taskData.task_list_id}
                  onChange={(value) => updateTaskField('task_list_id', value)}
                  onBlur={() => touchField('task_list_id')}
                  placeholder="TASK-001"
                  fieldType="text"
                  isEditMode={isEditMode}
                  error={getFieldError('task_list_id')}
                  isRequired
                />
                <AIEnhancedField
                  label="Version"
                  value={taskData.version}
                  onChange={(value) => updateTaskField('version', value)}
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
                  value={taskData.status}
                  onChange={(value) => updateTaskField('status', value)}
                  placeholder="Not Started, In Progress, Completed"
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Priority"
                  value={taskData.priority}
                  onChange={(value) => updateTaskField('priority', value)}
                  placeholder="Low, Medium, High, Critical"
                  fieldType="text"
                  isEditMode={isEditMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Assigned Team"
                  value={taskData.assigned_team}
                  onChange={(value) => updateTaskField('assigned_team', value)}
                  placeholder="Team name"
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Sprint"
                  value={taskData.sprint}
                  onChange={(value) => updateTaskField('sprint', value)}
                  placeholder="Sprint 1, Sprint 2..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Estimated Effort"
                  value={taskData.estimated_effort}
                  onChange={(value) => updateTaskField('estimated_effort', value)}
                  placeholder="2 weeks, 3 days..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Completion Percentage"
                  value={taskData.completion_percentage}
                  onChange={(value) => updateTaskField('completion_percentage', value)}
                  placeholder="0-100"
                  fieldType="text"
                  isEditMode={isEditMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Linked Features"
                  value={taskData.linked_features}
                  onChange={(value) => updateTaskField('linked_features', value)}
                  placeholder="Feature-001, User-Auth-Feature..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Source Requirements"
                  value={taskData.source_requirements}
                  onChange={(value) => updateTaskField('source_requirements', value)}
                  placeholder="TRD-001, PRD-AUTH-2025..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AIEnhancedField
                  label="Tags"
                  value={taskData.tags}
                  onChange={(value) => updateTaskField('tags', value)}
                  placeholder="sprint, backend, urgent, testing..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                <AIEnhancedField
                  label="Progress Notes"
                  value={taskData.progress_notes}
                  onChange={(value) => updateTaskField('progress_notes', value)}
                  placeholder="Current status, blockers, updates..."
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
                    fieldType="text"
                    isEditMode={isEditMode}
                  />
                  <AIEnhancedField
                    label="Generated From"
                    value={taskData.generated_from}
                    onChange={(value) => updateTaskField('generated_from', value)}
                    placeholder="AI Generated from TRD-PAYMENT-001"
                    isEditMode={isEditMode}
                  />
                </div>
              )}
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