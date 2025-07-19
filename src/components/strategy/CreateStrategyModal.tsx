'use client'

import { useState } from 'react'
import { X, Target, Sparkles } from 'lucide-react'
import { useStrategy } from '@/contexts/StrategyContext'
import { CreateStrategyData } from '@/types/strategy'

interface CreateStrategyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function CreateStrategyModal({ isOpen, onClose, onSuccess }: CreateStrategyModalProps) {
  const { createStrategy, isLoading } = useStrategy()
  const [formData, setFormData] = useState<CreateStrategyData>({
    title: '',
    description: ''
  })
  const [errors, setErrors] = useState<Partial<CreateStrategyData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateStrategyData> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Strategy title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Strategy title must be at least 3 characters'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Strategy title must be less than 100 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await createStrategy(formData)
      
      // Reset form
      setFormData({ title: '', description: '' })
      setErrors({})
      
      // Call success callback and close modal
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to create strategy:', error)
      // Error is handled by the context
    }
  }

  const handleClose = () => {
    setFormData({ title: '', description: '' })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: keyof CreateStrategyData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {/* Modal */}
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create New Strategy</h2>
                <p className="text-sm text-gray-500">Define your strategic direction</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title Field */}
            <div>
              <label htmlFor="strategy-title" className="block text-sm font-medium text-gray-700 mb-2">
                Strategy Title *
              </label>
              <input
                id="strategy-title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Q1 2025 Growth Strategy"
                className={`w-full p-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="strategy-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="strategy-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your strategy goals, focus areas, and key objectives..."
                rows={4}
                className={`w-full p-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
                maxLength={500}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">What happens next?</p>
                  <p>Once created, you'll be able to organize all your strategic content within this strategy. You can create cards, plans, and analyses that are all connected to this strategic direction.</p>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !formData.title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Strategy'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}