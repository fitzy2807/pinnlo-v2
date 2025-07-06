'use client'

import ArrayField from './ArrayField'
import ObjectArrayField from './ObjectArrayField'
import LinkedCardField from './LinkedCardField'
import { BlueprintField } from '@/types/blueprintTypes'

interface DynamicFieldProps {
  field: BlueprintField
  value: any
  onChange: (value: any) => void
  mode: 'view' | 'edit'
  availableCards?: Array<{ id: string; title: string; cardType: string }>
  currentCardId?: string
}

export default function DynamicField({ 
  field, 
  value, 
  onChange, 
  mode,
  availableCards,
  currentCardId 
}: DynamicFieldProps) {
  // Check conditional rendering
  if (field.conditional && field.conditional.dependsOn) {
    // Note: This would need access to full form data to check conditions
    // For now, we'll render all fields
  }

  // View mode rendering
  if (mode === 'view') {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return null // Don't show empty fields in view mode
    }

    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
          {field.label}
        </label>
        <div className="text-xs text-gray-600">
          {renderViewValue(field, value)}
        </div>
      </div>
    )
  }

  // Edit mode rendering
  const commonProps = {
    label: field.label,
    description: field.description,
    required: field.required,
    value: value ?? getDefaultValue(field),
    onChange
  }

  switch (field.type) {
    case 'text':
      return (
        <div>
          <label className="form-label">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.description && (
            <p className="text-xs text-gray-500 mb-2">{field.description}</p>
          )}
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="input input-sm"
            maxLength={field.type === 'text' ? field.maxLength : undefined}
            pattern={field.type === 'text' ? field.pattern : undefined}
            required={field.required}
          />
        </div>
      )

    case 'textarea':
      return (
        <div>
          <label className="form-label">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.description && (
            <p className="text-xs text-gray-500 mb-2">{field.description}</p>
          )}
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="input input-sm"
            rows={field.type === 'textarea' ? field.rows || 3 : undefined}
            maxLength={field.type === 'textarea' ? field.maxLength : undefined}
            required={field.required}
          />
        </div>
      )

    case 'enum':
      return (
        <div>
          <label className="form-label">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.description && (
            <p className="text-xs text-gray-500 mb-2">{field.description}</p>
          )}
          {field.multiple ? (
            <div className="space-y-2">
              {field.options.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(value || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = value || []
                      if (e.target.checked) {
                        onChange([...currentValues, option])
                      } else {
                        onChange(currentValues.filter((v: string) => v !== option))
                      }
                    }}
                    className="rounded text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="input input-sm"
              required={field.required}
            >
              <option value="">Select {field.label.toLowerCase()}...</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </div>
      )

    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded text-gray-900 focus:ring-gray-900"
          />
          <label className="form-label mb-0">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.description && (
            <p className="text-xs text-gray-500">{field.description}</p>
          )}
        </div>
      )

    case 'number':
      return (
        <div>
          <label className="form-label">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.description && (
            <p className="text-xs text-gray-500 mb-2">{field.description}</p>
          )}
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            placeholder={field.placeholder}
            className="input input-sm"
            min={field.type === 'number' ? field.min : undefined}
            max={field.type === 'number' ? field.max : undefined}
            step={field.type === 'number' ? field.step : undefined}
            required={field.required}
          />
        </div>
      )

    case 'date':
      return (
        <div>
          <label className="form-label">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.description && (
            <p className="text-xs text-gray-500 mb-2">{field.description}</p>
          )}
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="input input-sm"
            required={field.required}
          />
        </div>
      )

    case 'dateRange':
      const dateRangeValue = value || { start: '', end: '' }
      return (
        <div>
          <label className="form-label">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.description && (
            <p className="text-xs text-gray-500 mb-2">{field.description}</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={dateRangeValue.start || ''}
              onChange={(e) => onChange({ ...dateRangeValue, start: e.target.value })}
              placeholder="Start date"
              className="input input-sm"
              required={field.required}
            />
            <input
              type="date"
              value={dateRangeValue.end || ''}
              onChange={(e) => onChange({ ...dateRangeValue, end: e.target.value })}
              placeholder="End date"
              className="input input-sm"
              required={field.required}
            />
          </div>
        </div>
      )

    case 'array':
      return (
        <ArrayField
          {...commonProps}
          itemType={field.itemType}
          maxItems={field.maxItems}
          minItems={field.minItems}
          placeholder={field.placeholder}
        />
      )

    case 'objectArray':
      return (
        <ObjectArrayField
          {...commonProps}
          schema={field.schema}
          maxItems={field.maxItems}
          addButtonText={field.addButtonText}
        />
      )

    case 'linkedCard':
      return (
        <LinkedCardField
          {...commonProps}
          targetBlueprintType={field.targetBlueprintType}
          multiple={false}
          availableCards={availableCards}
          currentCardId={currentCardId}
        />
      )

    case 'linkedCards':
      return (
        <LinkedCardField
          {...commonProps}
          targetBlueprintType={field.targetBlueprintType}
          multiple={true}
          maxItems={field.maxItems}
          availableCards={availableCards}
          currentCardId={currentCardId}
        />
      )

    default:
      return (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
          Unknown field type: {(field as any).type}
        </div>
      )
  }
}

// Helper function to render view mode values
function renderViewValue(field: BlueprintField, value: any): React.ReactNode {
  switch (field.type) {
    case 'array':
      return (
        <div className="space-y-1">
          {value.map((item: string, index: number) => (
            <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {item}
            </div>
          ))}
        </div>
      )
    
    case 'objectArray':
      return (
        <div className="space-y-2">
          {value.map((item: any, index: number) => (
            <div key={index} className="p-2 bg-gray-100 rounded-md">
              {Object.entries(item).map(([key, val]) => (
                <div key={key} className="text-xs">
                  <span className="font-medium">{key}:</span> {String(val)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )
    
    case 'boolean':
      return value ? 'Yes' : 'No'
    
    case 'enum':
      return Array.isArray(value) ? value.join(', ') : value
    
    case 'dateRange':
      return `${value.start || 'TBD'} - ${value.end || 'TBD'}`
    
    default:
      return String(value)
  }
}

// Helper function to get default values
function getDefaultValue(field: BlueprintField): any {
  if (field.defaultValue !== undefined) {
    return field.defaultValue
  }
  
  switch (field.type) {
    case 'array':
    case 'objectArray':
    case 'linkedCards':
      return []
    case 'boolean':
      return false
    case 'dateRange':
      return { start: '', end: '' }
    default:
      return ''
  }
}
