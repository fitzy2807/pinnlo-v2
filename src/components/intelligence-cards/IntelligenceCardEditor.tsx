'use client'

import React, { useState } from 'react'
import { X, Save } from 'lucide-react'
import { CardData } from '@/types/card'
import { getBlueprintConfig } from '../blueprints/registry'
import { BlueprintFieldAdapter, getDefaultValue } from '../cards/BlueprintFieldAdapter'
import { BlueprintField } from '../blueprints/types'

interface IntelligenceCardEditorProps {
  card?: CardData | null
  cardType?: string
  onSave: (data: Partial<CardData>) => Promise<void>
  onCancel: () => void
}

export default function IntelligenceCardEditor({
  card,
  cardType,
  onSave,
  onCancel
}: IntelligenceCardEditorProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  
  // Determine the blueprint type
  const blueprintType = card?.card_type || cardType || 'market-intelligence'
  const blueprintConfig = getBlueprintConfig(blueprintType)
  
  // Initialize form data
  React.useEffect(() => {
    if (card) {
      setFormData({
        title: card.title,
        description: card.description,
        ...card.card_data
      })
    } else if (blueprintConfig) {
      // Initialize with default values
      const defaults: Record<string, any> = {
        title: '',
        description: ''
      }
      blueprintConfig.fields.forEach(field => {
        defaults[field.id] = getDefaultValue(field)
      })
      setFormData(defaults)
    }
  }, [card, blueprintConfig])
  
  if (!blueprintConfig) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-lg">
          <p className="text-red-600">Blueprint configuration not found for type: {blueprintType}</p>
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const { title, description, ...cardData } = formData
      
      await onSave({
        title: title || 'Untitled Intelligence',
        description: description || '',
        card_type: blueprintType,
        priority: cardData.priority || 'medium',
        card_data: {
          ...cardData,
          // Ensure intelligence-specific fields are preserved
          saved: card?.card_data?.saved,
          archived: card?.card_data?.archived
        }
      })
    } catch (error) {
      console.error('Failed to save card:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {card ? 'Edit' : 'Create'} {blueprintConfig.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {blueprintConfig.description}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={saving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter card title"
                required
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter card description"
                rows={3}
              />
            </div>

            {/* Blueprint Fields */}
            {blueprintConfig.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.name} {field.required && '*'}
                </label>
                {field.description && (
                  <p className="text-xs text-gray-500 mb-2">{field.description}</p>
                )}
                <BlueprintFieldAdapter
                  field={field}
                  value={formData[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  isEditMode={true}
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : (card ? 'Update Card' : 'Create Card')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}