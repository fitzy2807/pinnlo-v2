'use client'

import React, { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

interface TaskCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: any) => Promise<void>
  categories: Array<{
    id: string
    name: string
    icon: string
  }>
  selectedCategoryId?: string
}

const PRIORITY_OPTIONS = [
  { value: 'Critical', label: 'Critical', color: 'text-red-600 bg-red-50' },
  { value: 'High', label: 'High', color: 'text-orange-600 bg-orange-50' },
  { value: 'Medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'Low', label: 'Low', color: 'text-green-600 bg-green-50' }
]

const STATUS_OPTIONS = [
  { value: 'Not Started', label: 'Not Started' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Review', label: 'Review' },
  { value: 'Done', label: 'Done' }
]

const EFFORT_OPTIONS = [1, 2, 3, 5, 8, 13, 21]

export default function TaskCreateModal({
  isOpen,
  onClose,
  onSave,
  categories,
  selectedCategoryId
}: TaskCreateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: selectedCategoryId || '',
    priority: 'Medium' as 'Critical' | 'High' | 'Medium' | 'Low',
    status: 'Not Started' as 'Not Started' | 'In Progress' | 'Review' | 'Done',
    effort: 3,
    assignee: '',
    acceptanceCriteria: ['']
  })
  const [isSaving, setIsSaving] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        category: selectedCategoryId || (categories.length > 0 ? categories[0].id : ''),
        priority: 'Medium',
        status: 'Not Started',
        effort: 3,
        assignee: '',
        acceptanceCriteria: ['']
      })
    }
  }, [isOpen, selectedCategoryId, categories])

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Task title is required')
      return
    }

    if (!formData.category) {
      alert('Please select a category')
      return
    }

    setIsSaving(true)
    try {
      const category = categories.find(cat => cat.id === formData.category)
      const categoryPrefix = category?.name.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4) || 'TASK'
      const taskId = `${categoryPrefix}-${Date.now().toString().slice(-6)}`

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        card_type: 'task',
        card_data: {
          taskId,
          category: formData.category,
          metadata: {
            taskId,
            priority: formData.priority,
            effort: formData.effort,
            status: formData.status,
            assignee: formData.assignee.trim(),
            sprint: '',
            labels: [formData.category],
            dueDate: null,
            completionPercentage: 0
          },
          description: {
            objective: formData.description.trim(),
            businessValue: '',
            technicalContext: ''
          },
          acceptanceCriteria: formData.acceptanceCriteria
            .filter(criteria => criteria.trim())
            .map((criterion, index) => ({
              id: `ac-${index + 1}`,
              criterion: criterion.trim(),
              status: 'Not Started' as const
            })),
          dependencies: {
            blocks: [],
            blockedBy: [],
            related: []
          },
          technicalImplementation: {
            approach: '',
            filesToCreate: [],
            configuration: [],
            testing: ''
          },
          definitionOfDone: [
            { id: 'dod-1', criterion: 'All acceptance criteria met', status: 'Not Started' },
            { id: 'dod-2', criterion: 'Code review approved', status: 'Not Started' },
            { id: 'dod-3', criterion: 'Tests passing', status: 'Not Started' },
            { id: 'dod-4', criterion: 'Documentation updated', status: 'Not Started' }
          ],
          resources: {
            documentation: [],
            examples: [],
            tools: []
          },
          comments: [],
          attachments: []
        }
      }

      await onSave(taskData)
      onClose()
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Failed to save task')
    } finally {
      setIsSaving(false)
    }
  }

  const addAcceptanceCriterion = () => {
    setFormData(prev => ({
      ...prev,
      acceptanceCriteria: [...prev.acceptanceCriteria, '']
    }))
  }

  const updateAcceptanceCriterion = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      acceptanceCriteria: prev.acceptanceCriteria.map((criterion, i) => 
        i === index ? value : criterion
      )
    }))
  }

  const removeAcceptanceCriterion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      acceptanceCriteria: prev.acceptanceCriteria.filter((_, i) => i !== index)
    }))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Add New Task
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Implement user authentication"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Detailed description of what needs to be accomplished..."
                maxLength={500}
              />
            </div>

            {/* Category, Priority, Status, Effort */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effort (Story Points)
                </label>
                <select
                  value={formData.effort}
                  onChange={(e) => setFormData(prev => ({ ...prev, effort: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {EFFORT_OPTIONS.map((points) => (
                    <option key={points} value={points}>
                      {points} {points === 1 ? 'point' : 'points'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., john.doe@company.com"
              />
            </div>

            {/* Acceptance Criteria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acceptance Criteria
              </label>
              <div className="space-y-2">
                {formData.acceptanceCriteria.map((criterion, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={criterion}
                      onChange={(e) => updateAcceptanceCriterion(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Acceptance criterion ${index + 1}...`}
                    />
                    {formData.acceptanceCriteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAcceptanceCriterion(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAcceptanceCriterion}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add acceptance criterion
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.title.trim() || !formData.category}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Creating...' : 'Create Task'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}