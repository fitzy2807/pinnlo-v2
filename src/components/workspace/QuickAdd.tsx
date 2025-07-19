'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Zap } from 'lucide-react'

interface QuickAddProps {
  isVisible: boolean
  onClose: () => void
  onSubmit: (title: string, description: string) => Promise<void>
  loading?: boolean
  blueprintId: string
}

export default function QuickAdd({
  isVisible,
  onClose,
  onSubmit,
  loading = false,
  blueprintId
}: QuickAddProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Focus title input when panel opens with slight delay for animation
  useEffect(() => {
    if (isVisible && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 150)
    }
  }, [isVisible])

  // Clear form when panel closes
  useEffect(() => {
    if (!isVisible) {
      setTimeout(() => {
        setTitle('')
        setDescription('')
      }, 300) // Wait for animation to complete
    }
  }, [isVisible])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      return
    }

    try {
      await onSubmit(title.trim(), description.trim())
      setTitle('')
      setDescription('')
      onClose()
    } catch (error) {
      console.error('Failed to create card:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e)
    }
  }

  return (
    <div 
      className={`absolute left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg overflow-hidden transition-all duration-300 ease-out ${
        isVisible ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
      }`}
      style={{ top: '100%' }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900">Quick Add Card</h3>
            <span className="text-xs text-gray-500">to {blueprintId.replace('-', ' ')}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Card title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Description (optional)..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">Esc</kbd> to close • <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">⌘↵</kbd> to save
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Card'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}