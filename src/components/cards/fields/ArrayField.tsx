'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'

interface ArrayFieldProps {
  value: string[]
  onChange: (value: string[]) => void
  label: string
  description?: string
  itemType: 'text' | 'textarea'
  placeholder?: string
  maxItems?: number
  minItems?: number
  required?: boolean
}

export default function ArrayField({
  value = [],
  onChange,
  label,
  description,
  itemType = 'text',
  placeholder,
  maxItems,
  minItems = 0,
  required = false
}: ArrayFieldProps) {
  const [newItem, setNewItem] = useState('')

  const addItem = () => {
    if (newItem.trim() && (!maxItems || value.length < maxItems)) {
      onChange([...value, newItem.trim()])
      setNewItem('')
    }
  }

  const removeItem = (index: number) => {
    if (!required || value.length > minItems) {
      onChange(value.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, newValue: string) => {
    const updated = [...value]
    updated[index] = newValue
    onChange(updated)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && itemType === 'text') {
      e.preventDefault()
      addItem()
    }
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
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className="flex-1">
              {itemType === 'text' ? (
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  className="input input-sm"
                  placeholder={placeholder}
                />
              ) : (
                <textarea
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  className="input input-sm"
                  rows={2}
                  placeholder={placeholder}
                />
              )}
            </div>
            <button
              onClick={() => removeItem(index)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Remove item"
              disabled={required && value.length <= minItems}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      {(!maxItems || value.length < maxItems) && (
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            {itemType === 'text' ? (
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input input-sm"
                placeholder={placeholder || `Add new ${label.toLowerCase()}...`}
              />
            ) : (
              <textarea
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="input input-sm"
                rows={2}
                placeholder={placeholder || `Add new ${label.toLowerCase()}...`}
              />
            )}
          </div>
          <button
            onClick={addItem}
            disabled={!newItem.trim()}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add item"
          >
            <Plus size={14} />
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {itemType === 'text' ? 'Press Enter to add' : 'Click + to add'}
        </span>
        {maxItems && (
          <span>{value.length}/{maxItems} items</span>
        )}
      </div>
    </div>
  )
}
