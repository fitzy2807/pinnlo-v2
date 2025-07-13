'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AISuggestion } from '../hooks/useAISuggestions'
import { Brain, Lightbulb, History, Zap, AlertCircle } from 'lucide-react'

interface SuggestionsDropdownProps {
  suggestions: AISuggestion[]
  isLoading: boolean
  error: string | null
  onSelect: (suggestion: AISuggestion) => void
  onClose: () => void
  position: { top: number; left: number; width: number }
  maxHeight?: number
}

const SUGGESTION_ICONS = {
  template: Lightbulb,
  completion: Zap,
  enhancement: Brain,
  correction: AlertCircle
}

export function SuggestionsDropdown({
  suggestions,
  isLoading,
  error,
  onSelect,
  onClose,
  position,
  maxHeight = 200
}: SuggestionsDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => (prev + 1) % suggestions.length)
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
          break
        case 'Enter':
          event.preventDefault()
          if (suggestions[selectedIndex]) {
            onSelect(suggestions[selectedIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [suggestions, selectedIndex, onSelect, onClose])

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = itemRefs.current[selectedIndex]
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [selectedIndex])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(0)
  }, [suggestions])

  if (!isLoading && !error && suggestions.length === 0) {
    return null
  }

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        width: Math.max(position.width, 300),
        maxHeight,
        minWidth: 250
      }}
    >
      <div className="max-h-full overflow-y-auto">
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <Brain className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">
              AI Suggestions
            </span>
            {isLoading && (
              <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin ml-auto" />
            )}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && suggestions.length === 0 && (
          <div className="px-3 py-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <div className="w-4 h-4 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-xs">Generating suggestions...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="px-3 py-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs">{error}</span>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="py-1">
            {suggestions.map((suggestion, index) => {
              const Icon = SUGGESTION_ICONS[suggestion.type] || Lightbulb
              const isSelected = index === selectedIndex

              return (
                <div
                  key={suggestion.id}
                  ref={el => itemRefs.current[index] = el}
                  className={`
                    px-3 py-2 cursor-pointer flex items-start gap-2 text-xs
                    ${isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => onSelect(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <Icon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${getIconColor(suggestion.type)}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 break-words">
                      {suggestion.text.length > 100 
                        ? `${suggestion.text.substring(0, 100)}...`
                        : suggestion.text
                      }
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getTypeColor(suggestion.type)}`}>
                        {suggestion.type}
                      </span>
                      
                      {suggestion.context && (
                        <span className="text-gray-500 text-xs">
                          {suggestion.context}
                        </span>
                      )}
                      
                      <div className="flex-1" />
                      
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${getConfidenceColor(suggestion.confidence)}`} />
                        <span className="text-gray-400 text-xs">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer with keyboard hints */}
        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>↑↓ Navigate</span>
            <span>Enter Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getIconColor(type: string): string {
  switch (type) {
    case 'template': return 'text-yellow-600'
    case 'completion': return 'text-green-600'
    case 'enhancement': return 'text-blue-600'
    case 'correction': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'template': return 'bg-yellow-100 text-yellow-800'
    case 'completion': return 'bg-green-100 text-green-800'
    case 'enhancement': return 'bg-blue-100 text-blue-800'
    case 'correction': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'bg-green-500'
  if (confidence >= 0.6) return 'bg-yellow-500'
  return 'bg-red-500'
}