'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useStrategies } from '@/hooks/useStrategies'
import { X } from 'lucide-react'

interface CreateStrategyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateStrategyModal({ isOpen, onClose }: CreateStrategyModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createStrategy } = useStrategies()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    try {
      await createStrategy({
        title: formData.title,
        description: formData.description
      })
      
      // Reset form and close modal
      setFormData({ title: '', description: '' })
      onClose()
    } catch (error) {
      console.error('Failed to create strategy:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Strategy</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="form-group">
            <label className="form-label">
              Strategy Title *
            </label>
            <Input
              type="text"
              placeholder="Enter strategy title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Description
            </label>
            <Textarea
              placeholder="Describe your strategy..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>


          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!formData.title.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Strategy'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
