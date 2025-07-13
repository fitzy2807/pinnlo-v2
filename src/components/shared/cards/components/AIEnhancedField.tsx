'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Brain, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAISuggestions } from '../hooks/useAISuggestions'
import { SuggestionsDropdown } from './SuggestionsDropdown'

interface AIEnhancedFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  fieldType?: 'text' | 'textarea' | 'select'
  selectOptions?: Array<{ value: string; label: string }>
  aiContext?: string
  isEditMode: boolean
  onEnhance?: (enhancedValue: string) => void
  required?: boolean
  error?: string
  disabled?: boolean
  rows?: number
  debounceMs?: number
  cardType?: string
  enableSuggestions?: boolean
  suggestionTrigger?: 'typing' | 'manual' | 'both'
}

export function AIEnhancedField({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  fieldType = 'textarea', 
  selectOptions,
  aiContext,
  isEditMode,
  onEnhance,
  required = false,
  error,
  disabled = false,
  rows = 3,
  debounceMs = 300,
  cardType,
  enableSuggestions = true,
  suggestionTrigger = 'both'
}: AIEnhancedFieldProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorPositionRef = useRef<number>(0)

  // AI suggestions hook
  const {
    suggestions,
    isLoading: isSuggestionsLoading,
    error: suggestionsError,
    getSuggestions,
    clearSuggestions,
    learnFromSelection
  } = useAISuggestions({
    fieldType: aiContext || label.toLowerCase(),
    cardType,
    context: aiContext,
    debounceMs: debounceMs || 300,
    maxSuggestions: 5,
    enableLearning: true
  })

  const handleAIEnhance = useCallback(async () => {
    if (!value.trim()) {
      toast.error('Please add some content first before enhancing')
      return
    }

    setIsEnhancing(true)
    try {
      const response = await fetch('/api/development-bank/enhance-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldContent: value,
          fieldType: aiContext || label,
          enhancementType: 'improve',
          cardType: cardType
        })
      })

      const result = await response.json()
      if (result.success) {
        const enhancedContent = result.enhancedContent
        onChange(enhancedContent)
        onEnhance?.(enhancedContent)
        toast.success('Content enhanced by AI')
      } else {
        toast.error('Failed to enhance content')
      }
    } catch (error) {
      console.error('Enhancement error:', error)
      toast.error('Failed to enhance content')
    } finally {
      setIsEnhancing(false)
    }
  }, [value, aiContext, label, cardType, onChange, onEnhance])

  // Update cursor position tracking
  const updateCursorPosition = useCallback(() => {
    if (inputRef.current && 'selectionStart' in inputRef.current) {
      cursorPositionRef.current = inputRef.current.selectionStart || 0
    }
  }, [])

  // Calculate dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (!containerRef.current || !inputRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const inputRect = inputRef.current.getBoundingClientRect()
    
    setDropdownPosition({
      top: inputRect.bottom + window.scrollY + 4,
      left: inputRect.left + window.scrollX,
      width: inputRect.width
    })
  }, [])

  // Handle input changes with suggestions
  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue)
    onChange(newValue)

    // Trigger suggestions if enabled
    if (enableSuggestions && (suggestionTrigger === 'typing' || suggestionTrigger === 'both')) {
      if (newValue.trim().length >= 2) {
        calculateDropdownPosition()
        getSuggestions(newValue, cursorPositionRef.current)
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
        clearSuggestions()
      }
    }
  }, [onChange, enableSuggestions, suggestionTrigger, getSuggestions, clearSuggestions, calculateDropdownPosition])

  // Handle manual suggestion trigger
  const handleManualSuggestions = useCallback(() => {
    if (!enableSuggestions) return

    if (localValue.trim().length === 0) {
      toast.info('Add some content to get suggestions')
      return
    }

    calculateDropdownPosition()
    getSuggestions(localValue, cursorPositionRef.current)
    setShowSuggestions(true)
  }, [enableSuggestions, localValue, getSuggestions, calculateDropdownPosition])

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: any) => {
    const newValue = suggestion.text
    setLocalValue(newValue)
    onChange(newValue)
    setShowSuggestions(false)
    
    // Learn from selection for future improvements
    learnFromSelection(suggestion, localValue)
    
    toast.success('Applied suggestion')
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }, [onChange, learnFromSelection, localValue])

  // Handle suggestion dropdown close
  const handleSuggestionsClose = useCallback(() => {
    setShowSuggestions(false)
    clearSuggestions()
  }, [clearSuggestions])

  // Handle input focus
  const handleFocus = useCallback(() => {
    updateCursorPosition()
    calculateDropdownPosition()
  }, [updateCursorPosition, calculateDropdownPosition])

  // Handle input key events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    updateCursorPosition()

    // Trigger suggestions with Ctrl+Space
    if (event.key === ' ' && event.ctrlKey) {
      event.preventDefault()
      handleManualSuggestions()
      return
    }

    // Don't interfere with suggestion navigation
    if (showSuggestions && ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
      return
    }
  }, [updateCursorPosition, handleManualSuggestions, showSuggestions])

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSuggestions])

  if (!isEditMode) {
    // Preview mode - show content as clean text
    return (
      <div className="field-group mb-2">
        <label className="text-xs font-medium text-gray-700 block mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="text-xs text-black leading-relaxed">
          {value || <span className="italic text-gray-400">No content</span>}
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="field-group mb-2 relative">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {fieldType !== 'select' && (
          <div className="flex items-center gap-1">
            {enableSuggestions && (suggestionTrigger === 'manual' || suggestionTrigger === 'both') && (
              <button
                onClick={handleManualSuggestions}
                disabled={disabled || isSuggestionsLoading}
                className={`
                  p-1 rounded transition-colors
                  ${disabled || isSuggestionsLoading
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                  }
                `}
                title="Get AI suggestions (Ctrl+Space)"
                type="button"
              >
                {isSuggestionsLoading ? (
                  <div className="w-3 h-3 border border-gray-300 border-t-purple-600 rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
              </button>
            )}
            <button
              onClick={handleAIEnhance}
              disabled={isEnhancing || !value.trim() || disabled}
              className={`
                p-1 rounded transition-colors
                ${isEnhancing || !value.trim() || disabled
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                }
              `}
              title="Enhance with AI"
              type="button"
            >
              {isEnhancing ? (
                <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <Brain className="w-3 h-3" />
              )}
            </button>
          </div>
        )}
      </div>
      
      {fieldType === 'textarea' ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onSelect={updateCursorPosition}
          onMouseUp={updateCursorPosition}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`
            w-full p-2 text-xs text-black border rounded-md 
            focus:outline-none focus:ring-1 resize-y
            ${error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          `}
        />
      ) : fieldType === 'select' ? (
        <select
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full p-2 text-xs text-black border rounded-md 
            focus:outline-none focus:ring-1
            ${error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          `}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {selectOptions?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onSelect={updateCursorPosition}
          onMouseUp={updateCursorPosition}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full p-2 text-xs text-black border rounded-md 
            focus:outline-none focus:ring-1
            ${error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          `}
        />
      )}
      
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* AI Suggestions Dropdown */}
      {showSuggestions && enableSuggestions && (
        <SuggestionsDropdown
          suggestions={suggestions}
          isLoading={isSuggestionsLoading}
          error={suggestionsError}
          onSelect={handleSuggestionSelect}
          onClose={handleSuggestionsClose}
          position={dropdownPosition}
          maxHeight={300}
        />
      )}
    </div>
  )
}