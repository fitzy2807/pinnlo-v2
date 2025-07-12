import React from 'react'
import { getBlueprintConfig } from './registry'
import { BlueprintField } from './types'
import ArrayField from '../cards/fields/ArrayField'
import { EnumField } from '../cards/fields/EnumField'
import { ObjectField } from '../cards/fields/ObjectField'
import { DateField } from '../cards/fields/DateField'

interface BlueprintFieldsProps {
  cardType: string
  cardData: Record<string, any>
  isEditing: boolean
  onChange: (field: string, value: any) => void
}

export function BlueprintFields({ cardType, cardData, isEditing, onChange }: BlueprintFieldsProps) {
  const blueprintConfig = getBlueprintConfig(cardType)
  
  if (!blueprintConfig) {
    return null
  }

  const getFieldValue = (field: BlueprintField) => {
    // Safety check for field
    if (!field || !field.id) {
      return ''
    }
    
    // Handle dot notation fields (e.g., 'our_implementation.version_used')
    if (field.id.includes('.')) {
      const [parent, child] = field.id.split('.')
      const parentValue = cardData[parent]
      const value = parentValue?.[child]
      
      // Return existing value if it exists
      if (value !== undefined && value !== null) {
        return value
      }
    } else {
      const value = cardData[field.id]
      
      // Return existing value if it exists
      if (value !== undefined && value !== null) {
        return value
      }
    }
    
    // Return appropriate default based on field type
    switch (field.type) {
      case 'array': return []
      case 'object': return {}
      case 'boolean': return false
      case 'number': return 0
      default: return ''
    }
  }

  const renderField = (field: BlueprintField) => {
    const value = getFieldValue(field)
    
    if (!isEditing) {
      // Display mode
      return renderDisplayValue(field, value)
    }

    // Edit mode
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="input text-black"
            required={field.required}
          />
        )
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="input min-h-[80px] text-black"
            required={field.required}
          />
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(field.id, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            className="input text-black"
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(field.id, e.target.checked)}
              className="rounded border-gray-300 focus:border-gray-900 focus:ring-gray-900"
            />
            <span className="text-sm text-gray-600">{field.name}</span>
          </div>
        )
      
      case 'enum':
        return (
          <EnumField
            value={value}
            options={field.options || []}
            onChange={(newValue) => onChange(field.id, newValue)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )
      
      case 'array':
        return (
          <ArrayField
            value={value}
            onChange={(newValue) => onChange(field.id, newValue)}
            label={field.name}
            placeholder={field.placeholder}
            itemType="text"
          />
        )
      
      case 'object':
        return (
          <ObjectField
            value={value}
            onChange={(newValue) => onChange(field.id, newValue)}
            placeholder={field.placeholder}
          />
        )
      
      case 'date':
        return (
          <DateField
            value={value}
            onChange={(newValue) => onChange(field.id, newValue)}
            required={field.required}
          />
        )
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="input text-black"
            required={field.required}
          />
        )
    }
  }

  const renderDisplayValue = (field: BlueprintField, value: any) => {
    if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)) {
      return <span className="text-gray-400 italic">Not specified</span>
    }

    switch (field.type) {
      case 'array':
        const arrayValue = Array.isArray(value) ? value : []
        return (
          <div className="flex flex-wrap gap-1">
            {arrayValue.map((item: any, index: number) => (
              <span key={index} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </span>
            ))}
          </div>
        )
      
      case 'object':
        return (
          <div className="space-y-1">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="text-sm">
                <span className="font-medium text-gray-600">{key}:</span>{' '}
                <span>{String(val)}</span>
              </div>
            ))}
          </div>
        )
      
      case 'boolean':
        return (
          <span className={`inline-block px-2 py-1 text-xs rounded ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value ? 'Yes' : 'No'}
          </span>
        )
      
      case 'textarea':
        return <div className="whitespace-pre-wrap">{value}</div>
      
      default:
        return <span>{String(value)}</span>
    }
  }

  const getFieldSectionColor = (index: number) => {
    const colors = [
      'border-indigo-200 bg-indigo-50',   // Purple theme
      'border-emerald-200 bg-emerald-50', // Green theme  
      'border-amber-200 bg-amber-50',     // Yellow theme
      'border-blue-200 bg-blue-50',       // Blue theme
      'border-rose-200 bg-rose-50',       // Rose theme
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-4">
      {/* Blueprint-Specific Fields Section */}
      <div className={`rounded-lg border-l-4 ${getFieldSectionColor(0)} p-4`}>
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {blueprintConfig.name} Details
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blueprintConfig.fields.map((field, index) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {renderField(field)}
              
              {field.description && (
                <p className="text-xs text-gray-500">{field.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}