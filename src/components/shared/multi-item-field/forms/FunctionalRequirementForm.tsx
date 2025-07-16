'use client'

import React, { useState, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { PRDFunctionalRequirement, CreatePRDFunctionalRequirement } from '@/types/prd-multi-item'

interface FunctionalRequirementFormProps {
  item: PRDFunctionalRequirement | CreatePRDFunctionalRequirement
  onChange: (item: PRDFunctionalRequirement | CreatePRDFunctionalRequirement) => void
  aiContext?: string
}

export default function FunctionalRequirementForm({ 
  item, 
  onChange, 
  aiContext 
}: FunctionalRequirementFormProps) {
  const [newDependency, setNewDependency] = useState('')
  const [newLinkedStory, setNewLinkedStory] = useState('')

  const handleFieldChange = useCallback((field: keyof PRDFunctionalRequirement, value: any) => {
    onChange({
      ...item,
      [field]: value
    })
  }, [item, onChange])

  const handleAddDependency = useCallback(() => {
    if (newDependency.trim()) {
      const updatedDependencies = [...(item.dependencies || []), newDependency.trim()]
      handleFieldChange('dependencies', updatedDependencies)
      setNewDependency('')
    }
  }, [newDependency, item.dependencies, handleFieldChange])

  const handleRemoveDependency = useCallback((index: number) => {
    const updatedDependencies = item.dependencies?.filter((_, i) => i !== index) || []
    handleFieldChange('dependencies', updatedDependencies)
  }, [item.dependencies, handleFieldChange])

  const handleAddLinkedStory = useCallback(() => {
    if (newLinkedStory.trim()) {
      const updatedStories = [...(item.linked_user_stories || []), newLinkedStory.trim()]
      handleFieldChange('linked_user_stories', updatedStories)
      setNewLinkedStory('')
    }
  }, [newLinkedStory, item.linked_user_stories, handleFieldChange])

  const handleRemoveLinkedStory = useCallback((index: number) => {
    const updatedStories = item.linked_user_stories?.filter((_, i) => i !== index) || []
    handleFieldChange('linked_user_stories', updatedStories)
  }, [item.linked_user_stories, handleFieldChange])

  return (
    <div className="space-y-4">
      {/* Requirement ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Requirement ID *
        </label>
        <input
          type="text"
          value={item.requirement_id || ''}
          onChange={(e) => handleFieldChange('requirement_id', e.target.value)}
          placeholder="REQ-001"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={item.title || ''}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="Brief, clear title for the requirement"
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
          placeholder="Detailed description of what the system must do..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Priority, Status, and Complexity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <option value="approved">Approved</option>
            <option value="implemented">Implemented</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Complexity
          </label>
          <select
            value={item.complexity || 'medium'}
            onChange={(e) => handleFieldChange('complexity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Dependencies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dependencies (optional)
        </label>
        <div className="space-y-2">
          {item.dependencies?.map((dependency, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                {dependency}
              </div>
              <button
                onClick={() => handleRemoveDependency(index)}
                className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
                title="Remove dependency"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newDependency}
              onChange={(e) => setNewDependency(e.target.value)}
              placeholder="Add dependency..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddDependency()}
            />
            <button
              onClick={handleAddDependency}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              title="Add dependency"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Linked User Stories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Linked User Stories (optional)
        </label>
        <div className="space-y-2">
          {item.linked_user_stories?.map((story, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                {story}
              </div>
              <button
                onClick={() => handleRemoveLinkedStory(index)}
                className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
                title="Remove linked story"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newLinkedStory}
              onChange={(e) => setNewLinkedStory(e.target.value)}
              placeholder="Add linked user story ID..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddLinkedStory()}
            />
            <button
              onClick={handleAddLinkedStory}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              title="Add linked story"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}