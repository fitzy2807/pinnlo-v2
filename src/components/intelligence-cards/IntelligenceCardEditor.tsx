'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Calendar, Info } from 'lucide-react'
import {
  IntelligenceCard,
  CreateIntelligenceCardData,
  UpdateIntelligenceCardData,
  IntelligenceCardCategory,
  CATEGORY_DISPLAY_NAMES
} from '@/types/intelligence-cards'

interface IntelligenceCardEditorProps {
  card?: IntelligenceCard | null  // If provided, edit mode
  category?: IntelligenceCardCategory  // Pre-select category for new cards
  onSave: (data: CreateIntelligenceCardData | UpdateIntelligenceCardData) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

export default function IntelligenceCardEditor({
  card,
  category,
  onSave,
  onCancel,
  isEditing = false
}: IntelligenceCardEditorProps) {
  // Form state
  const [formData, setFormData] = useState<CreateIntelligenceCardData>({
    category: card?.category || category || IntelligenceCardCategory.MARKET,
    title: card?.title || '',
    summary: card?.summary || '',
    intelligence_content: card?.intelligence_content || '',
    key_findings: card?.key_findings || [],
    source_reference: card?.source_reference || '',
    date_accessed: card?.date_accessed ? card.date_accessed.split('T')[0] : undefined,
    credibility_score: card?.credibility_score || undefined,
    relevance_score: card?.relevance_score || undefined,
    relevant_blueprint_pages: card?.relevant_blueprint_pages || [],
    strategic_implications: card?.strategic_implications || '',
    recommended_actions: card?.recommended_actions || '',
    tags: card?.tags || []
  })

  // Input states for tags and arrays
  const [keyFindingInput, setKeyFindingInput] = useState('')
  const [blueprintPageInput, setBlueprintPageInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary is required'
    }
    if (!formData.intelligence_content.trim()) {
      newErrors.intelligence_content = 'Intelligence content is required'
    }
    if (formData.credibility_score && (formData.credibility_score < 1 || formData.credibility_score > 10)) {
      newErrors.credibility_score = 'Score must be between 1 and 10'
    }
    if (formData.relevance_score && (formData.relevance_score < 1 || formData.relevance_score > 10)) {
      newErrors.relevance_score = 'Score must be between 1 and 10'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSaving(true)
    try {
      if (isEditing && card) {
        // For updates, only send changed fields
        const updates: UpdateIntelligenceCardData = {}
        Object.keys(formData).forEach((key) => {
          if (formData[key] !== card[key]) {
            updates[key] = formData[key]
          }
        })
        await onSave(updates)
      } else {
        await onSave(formData)
      }
    } catch (error) {
      console.error('Error saving card:', error)
    } finally {
      setSaving(false)
    }
  }

  // Add item to array field
  const addArrayItem = (field: 'key_findings' | 'relevant_blueprint_pages' | 'tags', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
    }
  }

  // Remove item from array field
  const removeArrayItem = (field: 'key_findings' | 'relevant_blueprint_pages' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onCancel} />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {isEditing ? 'Edit Intelligence Card' : 'Create Intelligence Card'}
              </h2>
              <button
                onClick={onCancel}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as IntelligenceCardCategory }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isEditing}
              >
                {Object.values(IntelligenceCardCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_DISPLAY_NAMES[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Brief, descriptive title"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.summary ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Executive summary of the key intelligence"
              />
              {errors.summary && (
                <p className="mt-1 text-xs text-red-600">{errors.summary}</p>
              )}
            </div>

            {/* Intelligence Content */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Intelligence Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.intelligence_content}
                onChange={(e) => setFormData(prev => ({ ...prev, intelligence_content: e.target.value }))}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.intelligence_content ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Full intelligence content and analysis"
              />
              {errors.intelligence_content && (
                <p className="mt-1 text-xs text-red-600">{errors.intelligence_content}</p>
              )}
            </div>

            {/* Key Findings */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Key Findings
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keyFindingInput}
                    onChange={(e) => setKeyFindingInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addArrayItem('key_findings', keyFindingInput)
                        setKeyFindingInput('')
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a key finding and press Enter"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addArrayItem('key_findings', keyFindingInput)
                      setKeyFindingInput('')
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.key_findings.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.key_findings.map((finding, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 text-green-800"
                      >
                        {finding}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('key_findings', index)}
                          className="ml-1 hover:text-green-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Source and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Source Reference
                </label>
                <input
                  type="text"
                  value={formData.source_reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, source_reference: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="URL or reference"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Date Accessed
                </label>
                <input
                  type="date"
                  value={formData.date_accessed || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_accessed: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Credibility Score (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.credibility_score || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    credibility_score: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.credibility_score ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.credibility_score && (
                  <p className="mt-1 text-xs text-red-600">{errors.credibility_score}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Relevance Score (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.relevance_score || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    relevance_score: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.relevance_score ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.relevance_score && (
                  <p className="mt-1 text-xs text-red-600">{errors.relevance_score}</p>
                )}
              </div>
            </div>

            {/* Strategic Implications */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Strategic Implications
              </label>
              <textarea
                value={formData.strategic_implications}
                onChange={(e) => setFormData(prev => ({ ...prev, strategic_implications: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Analysis of strategic implications"
              />
            </div>

            {/* Recommended Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Recommended Actions
              </label>
              <textarea
                value={formData.recommended_actions}
                onChange={(e) => setFormData(prev => ({ ...prev, recommended_actions: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Recommended actions based on this intelligence"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addArrayItem('tags', tagInput)
                        setTagInput('')
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addArrayItem('tags', tagInput)
                      setTagInput('')
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('tags', index)}
                          className="ml-1 hover:text-gray-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : isEditing ? 'Update Card' : 'Create Card'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}