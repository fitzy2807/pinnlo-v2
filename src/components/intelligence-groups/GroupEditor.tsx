'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { IntelligenceGroup, UpdateIntelligenceGroupData } from '@/types/intelligence-groups'

interface GroupEditorProps {
  group: IntelligenceGroup
  onClose: () => void
  onUpdate: (data: UpdateIntelligenceGroupData) => Promise<void>
}

const colorOptions = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
]

export default function GroupEditor({ group, onClose, onUpdate }: GroupEditorProps) {
  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description || '',
    color: group.color
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Group name is required')
      return
    }

    // Only include changed fields
    const updates: UpdateIntelligenceGroupData = {}
    if (formData.name !== group.name) updates.name = formData.name
    if (formData.description !== (group.description || '')) updates.description = formData.description
    if (formData.color !== group.color) updates.color = formData.color

    if (Object.keys(updates).length === 0) {
      onClose()
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onUpdate(updates)
    } catch (err: any) {
      setError(err.message || 'Failed to update group')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Group
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Market Analysis Q1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="Describe the purpose of this group..."
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-full h-10 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? 'border-gray-900 scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Cards in group:</span>
              <span className="font-medium">{group.card_count}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Created:</span>
              <span>{new Date(group.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}