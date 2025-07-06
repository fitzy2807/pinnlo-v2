import React, { useState } from 'react'
import { Plus, X, Edit3 } from 'lucide-react'

interface ObjectFieldProps {
  value: Record<string, any>
  onChange: (value: Record<string, any>) => void
  placeholder?: string
}

export function ObjectField({ value, onChange, placeholder }: ObjectFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const addProperty = () => {
    if (newKey.trim() && newValue.trim()) {
      onChange({
        ...value,
        [newKey.trim()]: newValue.trim()
      })
      setNewKey('')
      setNewValue('')
    }
  }

  const removeProperty = (key: string) => {
    const newValue = { ...value }
    delete newValue[key]
    onChange(newValue)
  }

  const updateProperty = (key: string, newVal: string) => {
    onChange({
      ...value,
      [key]: newVal
    })
  }

  return (
    <div className="space-y-2">
      {/* Existing Properties */}
      {Object.entries(value).map(([key, val]) => (
        <div key={key} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
          <input
            type="text"
            value={key}
            onChange={(e) => {
              const newValue = { ...value }
              delete newValue[key]
              newValue[e.target.value] = val
              onChange(newValue)
            }}
            className="input-sm text-xs font-medium flex-1"
            placeholder="Property name"
          />
          <span className="text-gray-400">:</span>
          <input
            type="text"
            value={String(val)}
            onChange={(e) => updateProperty(key, e.target.value)}
            className="input-sm text-xs flex-2"
            placeholder="Property value"
          />
          <button
            onClick={() => removeProperty(key)}
            className="p-1 text-red-400 hover:text-red-600 transition-colors"
            title="Remove property"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      {/* Add New Property */}
      <div className="flex items-center space-x-2 p-2 border-2 border-dashed border-gray-200 rounded">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="input-sm text-xs flex-1"
          placeholder="Property name"
        />
        <span className="text-gray-400">:</span>
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="input-sm text-xs flex-2"
          placeholder="Property value"
          onKeyPress={(e) => e.key === 'Enter' && addProperty()}
        />
        <button
          onClick={addProperty}
          disabled={!newKey.trim() || !newValue.trim()}
          className="p-1 text-blue-400 hover:text-blue-600 transition-colors disabled:text-gray-300"
          title="Add property"
        >
          <Plus size={12} />
        </button>
      </div>

      {Object.keys(value).length === 0 && !newKey && (
        <p className="text-xs text-gray-400 italic">{placeholder || 'No properties defined'}</p>
      )}
    </div>
  )
}