'use client'

import React from 'react'
import { BlueprintField } from '@/components/blueprints/types'
import { AIEnhancedField } from '@/components/shared/cards/components/AIEnhancedField'
import ArrayField from './fields/ArrayField'
import { EnumField } from './fields/EnumField'
import { DateField } from './fields/DateField'

interface BlueprintFieldAdapterProps {
  field: BlueprintField
  value: any
  onChange: (value: any) => void
  onBlur?: () => void
  isEditMode: boolean
  error?: string
}

/**
 * Adapter component that renders blueprint fields using shared components
 * Bridges the gap between blueprint field definitions and shared UI components
 */
export function BlueprintFieldAdapter({
  field,
  value,
  onChange,
  onBlur,
  isEditMode,
  error
}: BlueprintFieldAdapterProps) {
  // Convert field type to appropriate component
  switch (field.type) {
    case 'array':
      return (
        <ArrayField
          label={field.name}
          value={value || []}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={field.placeholder}
          helpText={field.description}
          disabled={!isEditMode}
          error={error}
        />
      )
    
    case 'enum':
      return (
        <EnumField
          label={field.name}
          value={value || ''}
          onChange={onChange}
          options={field.options || []}
          placeholder={field.placeholder}
          helpText={field.description}
          disabled={!isEditMode}
          error={error}
        />
      )
    
    case 'date':
      return (
        <DateField
          label={field.name}
          value={value || ''}
          onChange={onChange}
          placeholder={field.placeholder}
          helpText={field.description}
          disabled={!isEditMode}
          error={error}
        />
      )
    
    case 'boolean':
      // Use a simple checkbox for boolean fields
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={field.id}
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            disabled={!isEditMode}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={field.id} className="text-sm font-medium text-gray-700">
            {field.name}
          </label>
          {field.description && (
            <span className="text-xs text-gray-500">({field.description})</span>
          )}
          {error && (
            <span className="text-xs text-red-600">{error}</span>
          )}
        </div>
      )
    
    case 'number':
      return (
        <AIEnhancedField
          label={field.name}
          value={value?.toString() || ''}
          onChange={(newValue) => {
            const num = parseFloat(newValue)
            onChange(isNaN(num) ? '' : num)
          }}
          onBlur={onBlur}
          placeholder={field.placeholder}
          helpText={field.description}
          fieldType="text"
          isEditMode={isEditMode}
          isRequired={field.required}
          aiContext={`blueprint_${field.id}`}
          error={error}
          inputProps={{
            type: 'number',
            min: field.validation?.min,
            max: field.validation?.max
          }}
        />
      )
    
    case 'object':
      // For object types, render as JSON in a textarea
      return (
        <AIEnhancedField
          label={field.name}
          value={typeof value === 'object' ? JSON.stringify(value, null, 2) : ''}
          onChange={(newValue) => {
            try {
              onChange(JSON.parse(newValue))
            } catch (e) {
              // Keep as string if invalid JSON
              onChange(newValue)
            }
          }}
          onBlur={onBlur}
          placeholder={field.placeholder || '{}'}
          helpText={field.description}
          fieldType="textarea"
          isEditMode={isEditMode}
          isRequired={field.required}
          aiContext={`blueprint_${field.id}`}
          error={error}
        />
      )
    
    case 'textarea':
    case 'text':
    default:
      return (
        <AIEnhancedField
          label={field.name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={field.placeholder}
          helpText={field.description}
          fieldType={field.type === 'textarea' ? 'textarea' : 'text'}
          isEditMode={isEditMode}
          isRequired={field.required}
          aiContext={`blueprint_${field.id}`}
          error={error}
        />
      )
  }
}

// Helper function to get default value for a field type
export function getDefaultValue(field: BlueprintField): any {
  switch (field.type) {
    case 'array':
      return []
    case 'boolean':
      return false
    case 'number':
      return 0
    case 'object':
      return {}
    case 'date':
      return new Date().toISOString().split('T')[0]
    default:
      return ''
  }
}