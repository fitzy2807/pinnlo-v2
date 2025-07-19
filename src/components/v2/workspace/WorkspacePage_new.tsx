'use client'

import { useState, useEffect } from 'react'
import { 
  Save, 
  Edit, 
  Copy,
  Trash2
} from 'lucide-react'
import { CardData } from '@/types/card'
import { BLUEPRINT_REGISTRY, getBlueprintConfig } from '@/components/blueprints/registry'
import { BlueprintField } from '@/components/blueprints/types'
import { useStrategy } from '@/contexts/StrategyContext'

interface WorkspacePageProps {
  page: CardData | null
  onUpdate: (updatedPage: Partial<CardData>) => Promise<void>
  onDelete: () => void
  onDuplicate: () => void
  onClose: () => void
}

function SafeValueRenderer({ value, className = '' }: { value: any, className?: string }) {
  if (value === null || value === undefined) {
    return <span className={`text-gray-400 italic ${className}`}>No value</span>
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return <span className={className}>{value.join(', ')}</span>
    }
    return <span className={className}>{JSON.stringify(value)}</span>
  }
  
  return <span className={className}>{String(value)}</span>
}

export default function WorkspacePage({ page, onUpdate, onDelete, onDuplicate, onClose }: WorkspacePageProps) {
  const { currentStrategy } = useStrategy()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<CardData | null>(null)
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
      <div className="h-full flex items-center justify-center bg-white font-sans">
        <div className="text-center">
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

  return (
    <div className="h-full flex flex-col bg-white font-sans">
      {/* Header with Title and Action Buttons */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
              {isEditing ? (
                <input
                  type="text"
                  value={editData?.title || ''}
                  onChange={(e) => handleFieldUpdate('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Page title"
                />
              ) : (
                page.title || 'Untitled Page'
              )}
            </h1>
            <p className="text-base text-gray-600">
              {blueprint?.name || page.cardType}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 ml-6">
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
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Blueprint Fields */}
          {blueprint?.fields?.map((field) => (
            <div key={field.id} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
              
              {isEditing ? (
                <div>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={editData?.[field.id] || ''}
                      onChange={(e) => handleFieldUpdate(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full p-4 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={6}
                    />
                  ) : field.type === 'enum' ? (
                    <select
                      value={editData?.[field.id] || ''}
                      onChange={(e) => handleFieldUpdate(field.id, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select {field.name}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editData?.[field.id] || ''}
                      onChange={(e) => handleFieldUpdate(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
              ) : (
                <div className="prose prose-lg max-w-none">
                  <SafeValueRenderer 
                    value={page[field.id]} 
                    className="text-base text-gray-900 leading-relaxed"
                  />
                </div>
              )}
              
              {field.description && (
                <p className="text-sm text-gray-500">{field.description}</p>
              )}
            </div>
          ))}

          {/* Tags */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
            <div className="prose prose-lg max-w-none">
              {page.tags?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {page.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 italic">No tags</span>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-3 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Metadata</h3>
            <div className="grid grid-cols-2 gap-6 text-base text-gray-600">
              <div>
                <span className="font-medium">Created:</span> {new Date(page.created_at || page.createdDate || '').toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {new Date(page.updated_at || page.lastModified || '').toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Creator:</span> {page.creator || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">ID:</span> {page.id}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}