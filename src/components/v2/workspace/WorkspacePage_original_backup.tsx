'use client'

import { useState, useEffect } from 'react'
import { 
  Save, 
  Edit, 
  X, 
  Calendar, 
  User, 
  Tag, 
  AlertCircle,
  Hash,
  Sparkles,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Mic
} from 'lucide-react'
import { CardData } from '@/types/card'
import { BLUEPRINT_REGISTRY, getBlueprintConfig } from '@/components/blueprints/registry'
import { BlueprintField } from '@/components/blueprints/types'
import { useStrategy } from '@/contexts/StrategyContext'

// Safety helper to render any value safely in JSX
function SafeValueRenderer({ value, className = '' }: { value: any, className?: string }) {
  if (value === null || value === undefined) {
    return <span className={`text-gray-400 italic ${className}`}>No value</span>
  }
  
  if (typeof value === 'object') {
    return (
      <pre className={`whitespace-pre-wrap font-mono text-xs bg-gray-100 p-2 rounded border ${className}`}>
        {JSON.stringify(value, null, 2)}
      </pre>
    )
  }
  
  return <span className={className}>{String(value)}</span>
}

interface WorkspacePageProps {
  page: CardData | null
  onUpdate: (updatedPage: Partial<CardData>) => Promise<void>
  onDelete: () => void
  onDuplicate: () => void
  onClose: () => void
}

interface UniversalFieldRendererProps {
  field: BlueprintField
  value: any
  onChange: (value: any) => void
  isEditing: boolean
  className?: string
}

function UniversalFieldRenderer({ field, value, onChange, isEditing, className = '' }: UniversalFieldRendererProps) {
  const [localValue, setLocalValue] = useState(value)
  
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: any) => {
    setLocalValue(newValue)
    onChange(newValue)
  }

  // Safety check: if value is an object but field type is not 'object', treat it as object
  const actualFieldType = (typeof value === 'object' && value !== null && !Array.isArray(value) && field.type !== 'array') 
    ? 'object' 
    : field.type

  if (!isEditing) {
    // Display mode
    switch (actualFieldType) {
      case 'textarea':
        return (
          <div className={`text-sm text-gray-900 whitespace-pre-wrap ${className}`}>
            {value || <span className="text-gray-400 italic">{field.placeholder || 'No value'}</span>}
          </div>
        )
      
      case 'enum':
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
            {value || <span className="text-gray-400 italic">Not set</span>}
          </span>
        )
      
      case 'boolean':
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          } ${className}`}>
            {value ? 'Yes' : 'No'}
          </span>
        )
      
      case 'array':
        return (
          <div className={`flex flex-wrap gap-1 ${className}`}>
            {value?.length > 0 ? (
              value.map((item: string, idx: number) => (
                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                  {item}
                </span>
              ))
            ) : (
              <span className="text-gray-400 italic text-xs">No items</span>
            )}
          </div>
        )
      
      case 'date':
        return (
          <div className={`text-sm text-gray-900 ${className}`}>
            {value ? new Date(value).toLocaleDateString() : <span className="text-gray-400 italic">No date</span>}
          </div>
        )
      
      case 'number':
        return (
          <div className={`text-sm text-gray-900 ${className}`}>
            {value !== undefined ? value : <span className="text-gray-400 italic">No value</span>}
          </div>
        )
      
      case 'object':
        return (
          <div className={`text-sm text-gray-900 ${className}`}>
            {value ? (
              <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-100 p-2 rounded border">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              <span className="text-gray-400 italic">No data</span>
            )}
          </div>
        )
      
      default: // text
        return (
          <div className={`text-sm text-gray-900 ${className}`}>
            {value || <span className="text-gray-400 italic">{field.placeholder || 'No value'}</span>}
          </div>
        )
    }
  }

  // Edit mode
  switch (actualFieldType) {
    case 'textarea':
      return (
        <textarea
          value={localValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          className={`w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
          rows={4}
        />
      )
    
    case 'enum':
      return (
        <select
          value={localValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={`w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        >
          <option value="">Select {field.name}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      )
    
    case 'boolean':
      return (
        <label className={`flex items-center space-x-2 ${className}`}>
          <input
            type="checkbox"
            checked={localValue || false}
            onChange={(e) => handleChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm text-gray-900">{field.name}</span>
        </label>
      )
    
    case 'array':
      return (
        <div className={`space-y-2 ${className}`}>
          <div className="flex flex-wrap gap-1">
            {localValue?.map((item: string, idx: number) => (
              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                {item}
                <button
                  onClick={() => {
                    const newArray = localValue.filter((_: any, i: number) => i !== idx)
                    handleChange(newArray)
                  }}
                  className="ml-1 text-gray-500 hover:text-red-600"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={field.placeholder || `Add ${field.name}`}
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement
                  if (input.value.trim()) {
                    handleChange([...(localValue || []), input.value.trim()])
                    input.value = ''
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector(`input[placeholder*="${field.name}"]`) as HTMLInputElement
                if (input?.value.trim()) {
                  handleChange([...(localValue || []), input.value.trim()])
                  input.value = ''
                }
              }}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    
    case 'date':
      return (
        <input
          type="date"
          value={localValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={`w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        />
      )
    
    case 'number':
      return (
        <input
          type="number"
          value={localValue || ''}
          onChange={(e) => handleChange(e.target.valueAsNumber)}
          placeholder={field.placeholder}
          className={`w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        />
      )
    
    case 'object':
      return (
        <textarea
          value={localValue ? JSON.stringify(localValue, null, 2) : ''}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value)
              handleChange(parsed)
            } catch {
              // Handle invalid JSON gracefully
            }
          }}
          placeholder={field.placeholder || 'Enter JSON object'}
          className={`w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${className}`}
          rows={6}
        />
      )
    
    default: // text
      return (
        <input
          type="text"
          value={localValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          className={`w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        />
      )
  }
}

export default function WorkspacePage({ page, onUpdate, onDelete, onDuplicate, onClose }: WorkspacePageProps) {
  const { currentStrategy } = useStrategy()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<CardData | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'content', 'details']))
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (page) {
      setEditData(page)
      setHasChanges(false)
    }
  }, [page])

  if (!page) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 mb-3">
            <Edit className="w-8 h-8 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No page selected</h3>
          <p className="text-sm text-gray-600">
            Select a page from the preview to start editing
          </p>
        </div>
      </div>
    )
  }

  const blueprint = getBlueprintConfig(page.cardType)
  const blueprintRegistry = BLUEPRINT_REGISTRY[page.cardType]

  const getBlueprintIcon = (cardType: string) => {
    return blueprintRegistry?.icon || '📄'
  }

  const getFormattedId = (page: CardData) => {
    const prefix = blueprintRegistry?.prefix || 'GEN'
    const numericId = page.id?.replace(/\D/g, '') || '1'
    return `${prefix}-${numericId}`
  }

  const handleSave = async () => {
    if (!editData) return
    
    try {
      setIsSaving(true)
      await onUpdate(editData)
      setIsEditing(false)
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save page:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData(page)
    setIsEditing(false)
    setHasChanges(false)
  }

  const handleFieldUpdate = (field: string, value: any) => {
    if (!editData) return
    
    const updated = { ...editData, [field]: value }
    setEditData(updated)
    setHasChanges(true)
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const groupedFields = blueprint?.fields?.reduce((acc, field) => {
    const section = getFieldSection(field)
    if (!acc[section]) acc[section] = []
    acc[section].push(field)
    return acc
  }, {} as Record<string, BlueprintField[]>) || {}

  function getFieldSection(field: BlueprintField): string {
    if (field.type === 'textarea' || field.id.includes('description') || field.id.includes('content')) {
      return 'content'
    }
    if (field.type === 'enum' || field.id.includes('status') || field.id.includes('priority')) {
      return 'status'
    }
    if (field.type === 'date' || field.id.includes('date') || field.id.includes('deadline')) {
      return 'timeline'
    }
    if (field.type === 'array' || field.id.includes('tags') || field.id.includes('categories')) {
      return 'organization'
    }
    return 'details'
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Unknown'
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (e) {
      return 'Invalid date'
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        {/* Strategy Context */}
        {currentStrategy && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentStrategy.color || '#3B82F6' }}
              />
              <span className="text-sm font-medium text-blue-900">
                {currentStrategy.title}
              </span>
              <span className="text-xs text-blue-700">
                • {currentStrategy.description}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getBlueprintIcon(page.cardType)}</span>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 font-mono">{getFormattedId(page)}</span>
                {hasChanges && <span className="text-xs text-orange-500">• Unsaved changes</span>}
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData?.title || ''}
                    onChange={(e) => handleFieldUpdate('title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Page title"
                  />
                ) : (
                  page.title || 'Untitled Page'
                )}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {blueprint?.name || page.cardType}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={onDuplicate}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Copy className="w-4 h-4" />
                <span>Duplicate</span>
              </button>
              <button
                onClick={onDelete}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={() => {
                  // TODO: Implement voice editor functionality
                  alert('Voice editing coming soon!')
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
                title="Voice editing"
              >
                <Mic className="w-4 h-4" />
                <span>Voice</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                title="AI Enhancement"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Enhance</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Overview Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('overview')}
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              {expandedSections.has('overview') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              <span>Overview</span>
            </h3>
          </div>
          
          {expandedSections.has('overview') && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                {isEditing ? (
                  <textarea
                    value={editData?.description || ''}
                    onChange={(e) => handleFieldUpdate('description', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add a description..."
                  />
                ) : (
                  <SafeValueRenderer value={page.description || 'No description provided'} className="text-sm text-gray-700" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  {isEditing ? (
                    <select
                      value={editData?.priority || 'Medium'}
                      onChange={(e) => handleFieldUpdate('priority', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      page.priority === 'High' ? 'bg-red-100 text-red-800' :
                      page.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {page.priority}
                    </span>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Owner</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData?.creator || ''}
                      onChange={(e) => handleFieldUpdate('creator', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Assign owner..."
                    />
                  ) : (
                    <SafeValueRenderer value={page.creator || 'Unassigned'} className="text-sm text-gray-700" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Blueprint Fields Sections */}
        {Object.entries(groupedFields).map(([section, fields]) => (
          <div key={section} className="bg-gray-50 rounded-lg p-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection(section)}
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 capitalize">
                {expandedSections.has(section) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                <span>{section}</span>
              </h3>
            </div>
            
            {expandedSections.has(section) && (
              <div className="mt-4 space-y-4">
                {fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <UniversalFieldRenderer
                      field={field}
                      value={editData?.[field.id]}
                      onChange={(value) => handleFieldUpdate(field.id, value)}
                      isEditing={isEditing}
                    />
                    {field.description && (
                      <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Tags */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('tags')}
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              {expandedSections.has('tags') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              <Tag className="w-5 h-5" />
              <span>Tags</span>
            </h3>
          </div>
          
          {expandedSections.has('tags') && (
            <div className="mt-4">
              <UniversalFieldRenderer
                field={{
                  id: 'tags',
                  name: 'Tags',
                  type: 'array',
                  placeholder: 'Add tags'
                }}
                value={editData?.tags || []}
                onChange={(value) => handleFieldUpdate('tags', value)}
                isEditing={isEditing}
              />
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Created: {formatDate(page.created_at || page.createdDate)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Updated: {formatDate(page.updated_at || page.lastModified)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Creator: {page.creator || 'Unknown'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4" />
              <span>ID: {page.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}