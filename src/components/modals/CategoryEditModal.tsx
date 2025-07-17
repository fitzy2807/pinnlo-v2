'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, Trash2 } from 'lucide-react'

interface CategoryEditModalProps {
  category?: {
    id: string
    name: string
    icon: string
    description: string
    priority: 'Critical' | 'High' | 'Medium' | 'Low'
  } | null
  isOpen: boolean
  onClose: () => void
  onSave: (categoryData: any) => Promise<void>
  onDelete?: (categoryId: string) => Promise<void>
  mode: 'add' | 'edit'
}

const EMOJI_OPTIONS = [
  '🏗️', '🔐', '🗄️', '🔄', '🎨', '🔌', '🧪', '📊', '📚',
  '⚡', '🚀', '🔧', '🎯', '📱', '💾', '🌐', '🔍', '📝',
  '⚙️', '🛠️', '📦', '🔔', '📈', '🎛️', '🗂️', '📋', '🔗'
]

const PRIORITY_OPTIONS = [
  { value: 'Critical', label: 'Critical', color: 'text-red-600 bg-red-50' },
  { value: 'High', label: 'High', color: 'text-orange-600 bg-orange-50' },
  { value: 'Medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'Low', label: 'Low', color: 'text-green-600 bg-green-50' }
]

export default function CategoryEditModal({
  category,
  isOpen,
  onClose,
  onSave,
  onDelete,
  mode
}: CategoryEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    icon: '📁',
    description: '',
    priority: 'Medium' as 'Critical' | 'High' | 'Medium' | 'Low'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Initialize form data when category changes
  useEffect(() => {
    if (category && mode === 'edit') {
      setFormData({
        name: category.name,
        icon: category.icon,
        description: category.description,
        priority: category.priority
      })
    } else if (mode === 'add') {
      setFormData({
        name: '',
        icon: '📁',
        description: '',
        priority: 'Medium'
      })
    }
  }, [category, mode])

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Category name is required')
      return
    }

    setIsSaving(true)
    try {
      const categoryData = {
        ...formData,
        id: category?.id || `category-${Date.now()}`,
        taskCount: category?.taskCount || 0,
        completedCount: category?.completedCount || 0,
        estimatedEffort: category?.estimatedEffort || 0,
        isExpanded: category?.isExpanded || false,
        status: 'Not Started' as const
      }
      
      await onSave(categoryData)
      onClose()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!category || !onDelete) return
    
    if (confirm(`Are you sure you want to delete the "${category.name}" category? This will also delete all tasks in this category.`)) {
      try {
        await onDelete(category.id)
        onClose()
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Failed to delete category')
      }
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'add' ? 'Add Category' : 'Edit Category'}
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
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Custom Integration"
                maxLength={50}
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center space-x-2"
                >
                  <span className="text-xl">{formData.icon}</span>
                  <span className="text-gray-700">Click to change icon</span>
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-3">
                    <div className="grid grid-cols-8 gap-2">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, icon: emoji }))
                            setShowEmojiPicker(false)
                          }}
                          className="text-xl p-2 hover:bg-gray-100 rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                placeholder="Brief description of this category's purpose..."
                maxLength={200}
              />
            </div>

            {/* Priority */}
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
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div>
              {mode === 'edit' && onDelete && (
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.name.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}