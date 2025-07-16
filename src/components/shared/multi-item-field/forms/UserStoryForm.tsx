'use client'

import React, { useState, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { PRDUserStory, CreatePRDUserStory } from '@/types/prd-multi-item'

interface UserStoryFormProps {
  item: PRDUserStory | CreatePRDUserStory
  onChange: (item: PRDUserStory | CreatePRDUserStory) => void
  aiContext?: string
}

export default function UserStoryForm({ item, onChange, aiContext }: UserStoryFormProps) {
  const [newCriteria, setNewCriteria] = useState('')
  const [newFeature, setNewFeature] = useState('')

  const handleFieldChange = useCallback((field: keyof PRDUserStory, value: any) => {
    onChange({
      ...item,
      [field]: value
    })
  }, [item, onChange])

  const handleAddCriteria = useCallback(() => {
    if (newCriteria.trim()) {
      const updatedCriteria = [...(item.acceptance_criteria || []), newCriteria.trim()]
      handleFieldChange('acceptance_criteria', updatedCriteria)
      setNewCriteria('')
    }
  }, [newCriteria, item.acceptance_criteria, handleFieldChange])

  const handleRemoveCriteria = useCallback((index: number) => {
    const updatedCriteria = item.acceptance_criteria?.filter((_, i) => i !== index) || []
    handleFieldChange('acceptance_criteria', updatedCriteria)
  }, [item.acceptance_criteria, handleFieldChange])

  const handleAddFeature = useCallback(() => {
    if (newFeature.trim()) {
      const updatedFeatures = [...(item.linked_features || []), newFeature.trim()]
      handleFieldChange('linked_features', updatedFeatures)
      setNewFeature('')
    }
  }, [newFeature, item.linked_features, handleFieldChange])

  const handleRemoveFeature = useCallback((index: number) => {
    const updatedFeatures = item.linked_features?.filter((_, i) => i !== index) || []
    handleFieldChange('linked_features', updatedFeatures)
  }, [item.linked_features, handleFieldChange])

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={item.title || ''}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="As a [user], I want [feature] so that [benefit]"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          value={item.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Detailed description of the user story..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Priority and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={item.priority || 'medium'}
            onChange={(e) => handleFieldChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={item.status || 'draft'}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="ready">Ready</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Story Points */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Story Points (optional)
        </label>
        <input
          type="number"
          value={item.story_points || ''}
          onChange={(e) => handleFieldChange('story_points', e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="1, 2, 3, 5, 8, 13..."
          min="1"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Acceptance Criteria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Acceptance Criteria
        </label>
        <div className="space-y-2">
          {item.acceptance_criteria?.map((criteria, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                {criteria}
              </div>
              <button
                onClick={() => handleRemoveCriteria(index)}
                className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
                title="Remove criteria"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCriteria}
              onChange={(e) => setNewCriteria(e.target.value)}
              placeholder="Add acceptance criteria..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCriteria()}
            />
            <button
              onClick={handleAddCriteria}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              title="Add criteria"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Linked Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Linked Features (optional)
        </label>
        <div className="space-y-2">
          {item.linked_features?.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                {feature}
              </div>
              <button
                onClick={() => handleRemoveFeature(index)}
                className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
                title="Remove feature"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add linked feature..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
            />
            <button
              onClick={handleAddFeature}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              title="Add feature"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}