'use client'

import React, { useState, useCallback } from 'react'
import { Plus, X, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react'
import { TRDImplementationStandard, CreateTRDImplementationStandard } from '@/types/trd-multi-item'

interface ImplementationStandardFormProps {
  item: TRDImplementationStandard | CreateTRDImplementationStandard
  onChange: (item: TRDImplementationStandard | CreateTRDImplementationStandard) => void
  aiContext?: string
}

export default function ImplementationStandardForm({ item, onChange, aiContext }: ImplementationStandardFormProps) {
  const [newTool, setNewTool] = useState('')

  const handleFieldChange = useCallback((field: keyof TRDImplementationStandard, value: any) => {
    onChange({
      ...item,
      [field]: value
    })
  }, [item, onChange])

  const handleAddTool = useCallback(() => {
    if (newTool.trim()) {
      const updatedTools = [...(item.tools_required || []), newTool.trim()]
      handleFieldChange('tools_required', updatedTools)
      setNewTool('')
    }
  }, [newTool, item.tools_required, handleFieldChange])

  const handleRemoveTool = useCallback((index: number) => {
    const updatedTools = item.tools_required?.filter((_, i) => i !== index) || []
    handleFieldChange('tools_required', updatedTools)
  }, [item.tools_required, handleFieldChange])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'coding': return '💻'
      case 'testing': return '🧪'
      case 'documentation': return '📝'
      case 'deployment': return '🚀'
      case 'security': return '🔒'
      case 'performance': return '⚡'
      default: return '📋'
    }
  }

  const getEnforcementColor = (level: string) => {
    switch (level) {
      case 'required': return 'text-red-600 bg-red-50 border-red-200'
      case 'recommended': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'optional': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enforced': return 'text-green-600 bg-green-50'
      case 'implemented': return 'text-blue-600 bg-blue-50'
      case 'in_progress': return 'text-yellow-600 bg-yellow-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-4">
      {/* Standard ID and Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Standard ID *
          </label>
          <input
            type="text"
            value={item.standard_id || ''}
            onChange={(e) => handleFieldChange('standard_id', e.target.value)}
            placeholder="STD-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Standard Title *
          </label>
          <input
            type="text"
            value={item.standard_title || ''}
            onChange={(e) => handleFieldChange('standard_title', e.target.value)}
            placeholder="Code Review Standards"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Standard Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Standard Description *
        </label>
        <textarea
          value={item.standard_description || ''}
          onChange={(e) => handleFieldChange('standard_description', e.target.value)}
          placeholder="Detailed description of this implementation standard..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Category and Enforcement Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Standard Category
          </label>
          <select
            value={item.standard_category || 'coding'}
            onChange={(e) => handleFieldChange('standard_category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="coding">Coding {getCategoryIcon('coding')}</option>
            <option value="testing">Testing {getCategoryIcon('testing')}</option>
            <option value="documentation">Documentation {getCategoryIcon('documentation')}</option>
            <option value="deployment">Deployment {getCategoryIcon('deployment')}</option>
            <option value="security">Security {getCategoryIcon('security')}</option>
            <option value="performance">Performance {getCategoryIcon('performance')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enforcement Level
          </label>
          <select
            value={item.enforcement_level || 'required'}
            onChange={(e) => handleFieldChange('enforcement_level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="required">Required</option>
            <option value="recommended">Recommended</option>
            <option value="optional">Optional</option>
          </select>
          <div className="mt-1">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md border ${getEnforcementColor(item.enforcement_level || 'required')}`}>
              {item.enforcement_level?.toUpperCase() || 'REQUIRED'}
            </span>
          </div>
        </div>
      </div>

      {/* Implementation Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Implementation Details *
        </label>
        <textarea
          value={item.implementation_details || ''}
          onChange={(e) => handleFieldChange('implementation_details', e.target.value)}
          placeholder="Specific steps and guidelines for implementing this standard..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Compliance Criteria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Compliance Criteria *
        </label>
        <textarea
          value={item.compliance_criteria || ''}
          onChange={(e) => handleFieldChange('compliance_criteria', e.target.value)}
          placeholder="How to determine if this standard is being followed..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Validation Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Validation Method *
        </label>
        <textarea
          value={item.validation_method || ''}
          onChange={(e) => handleFieldChange('validation_method', e.target.value)}
          placeholder="How compliance with this standard will be validated..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Tools Required */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tools Required
        </label>
        <div className="space-y-2">
          {item.tools_required?.map((tool, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm">
                {tool}
              </div>
              <button
                onClick={() => handleRemoveTool(index)}
                className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
                title="Remove tool"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
              placeholder="Add required tool (e.g., ESLint, Prettier, Jest)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTool()}
            />
            <button
              onClick={handleAddTool}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              title="Add tool"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
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
            <option value="in_progress">In Progress</option>
            <option value="implemented">Implemented</option>
            <option value="enforced">Enforced</option>
          </select>
        </div>
      </div>

      {/* Owner and Review Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner
          </label>
          <input
            type="text"
            value={item.owner || ''}
            onChange={(e) => handleFieldChange('owner', e.target.value)}
            placeholder="Person or team responsible"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Date
          </label>
          <input
            type="date"
            value={item.review_date || ''}
            onChange={(e) => handleFieldChange('review_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Standard Summary */}
      <div className={`p-3 border rounded-md ${getStatusColor(item.status || 'draft')}`}>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium">
            Implementation Standard Summary
          </span>
        </div>
        <div className="text-xs mt-1 space-y-1">
          <p>Category: {getCategoryIcon(item.standard_category || 'coding')} {item.standard_category?.replace('_', ' ').toUpperCase()}</p>
          <p>Enforcement: {item.enforcement_level?.toUpperCase()}</p>
          <p>Priority: {item.priority?.toUpperCase()}</p>
          <p>Tools Required: {item.tools_required?.length || 0} tools</p>
          {item.owner && <p>Owner: {item.owner}</p>}
          {item.review_date && <p>Review Date: {item.review_date}</p>}
        </div>
      </div>
    </div>
  )
}