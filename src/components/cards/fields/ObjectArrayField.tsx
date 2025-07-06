'use client'

import { useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import DynamicField from './DynamicField'
import { BlueprintField } from '@/types/blueprintTypes'

interface ObjectArrayFieldProps {
  value: Array<Record<string, any>>
  onChange: (value: Array<Record<string, any>>) => void
  label: string
  description?: string
  schema: BlueprintField[]
  maxItems?: number
  addButtonText?: string
  required?: boolean
}

export default function ObjectArrayField({
  value = [],
  onChange,
  label,
  description,
  schema,
  maxItems,
  addButtonText,
  required = false
}: ObjectArrayFieldProps) {
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const addItem = () => {
    if (!maxItems || value.length < maxItems) {
      const newItem: Record<string, any> = {}
      // Initialize with default values
      schema.forEach(field => {
        if (field.defaultValue !== undefined) {
          newItem[field.key] = field.defaultValue
        } else if (field.type === 'array') {
          newItem[field.key] = []
        } else if (field.type === 'objectArray') {
          newItem[field.key] = []
        } else if (field.type === 'boolean') {
          newItem[field.key] = false
        } else {
          newItem[field.key] = ''
        }
      })
      
      const updated = [...value, newItem]
      onChange(updated)
      
      // Auto-expand the new item
      setExpandedItems(prev => [...prev, updated.length - 1])
    }
  }

  const removeItem = (index: number) => {
    if (!required || value.length > 1) {
      onChange(value.filter((_, i) => i !== index))
      setExpandedItems(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i))
    }
  }

  const updateItem = (index: number, field: string, newValue: any) => {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: newValue }
    onChange(updated)
  }

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const getItemTitle = (item: Record<string, any>, index: number) => {
    // Try to find a title field
    const titleField = schema.find(f => f.key === 'title' || f.key === 'name' || f.key === 'objective')
    if (titleField && item[titleField.key]) {
      return item[titleField.key]
    }
    return `${label.slice(0, -1)} ${index + 1}` // Remove 's' from plural label
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="form-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* Existing Items */}
      <div className="space-y-3">
        {value.map((item, index) => {
          const isExpanded = expandedItems.includes(index)
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg">
              {/* Item Header */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg border-b border-gray-200">
                <button
                  onClick={() => toggleExpanded(index)}
                  className="flex items-center space-x-2 flex-1 text-left"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {getItemTitle(item, index)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                  )}
                </button>
                
                <button
                  onClick={() => removeItem(index)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove item"
                  disabled={required && value.length <= 1}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Item Content */}
              {isExpanded && (
                <div className="p-3 space-y-3">
                  {schema.map((field) => (
                    <DynamicField
                      key={field.key}
                      field={field}
                      value={item[field.key]}
                      onChange={(newValue) => updateItem(index, field.key, newValue)}
                      mode="edit"
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add New Item */}
      {(!maxItems || value.length < maxItems) && (
        <button
          onClick={addItem}
          className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-gray-600"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">
            {addButtonText || `Add ${label.slice(0, -1)}`}
          </span>
        </button>
      )}

      {/* Help Text */}
      {maxItems && (
        <p className="text-xs text-gray-500 text-right">
          {value.length}/{maxItems} items
        </p>
      )}
    </div>
  )
}
