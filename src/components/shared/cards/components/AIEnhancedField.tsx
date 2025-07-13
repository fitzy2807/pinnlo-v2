'use client'

import React, { useState, useCallback } from 'react'
import { Brain } from 'lucide-react'
import { toast } from 'react-hot-toast'

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
  cardType
}: AIEnhancedFieldProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [localValue, setLocalValue] = useState(value)

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

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue)
    onChange(newValue)
  }, [onChange])

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
    <div className="field-group mb-2">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {fieldType !== 'select' && (
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
        )}
      </div>
      
      {fieldType === 'textarea' ? (
        <textarea
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
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
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
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
    </div>
  )
}