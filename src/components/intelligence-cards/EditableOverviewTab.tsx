'use client'

import React, { useState, useCallback } from 'react'
import { CardData } from '@/types/card'
import { getCategoryTheme, getCategoryDisplayName } from './utils/categoryThemes'
import { Calendar, User, Tag, Target, Shield, TrendingUp, Edit2, Check, X } from 'lucide-react'
import { useAutoSave, SaveIndicator } from '@/components/shared/cards'
import { toast } from 'react-hot-toast'

interface EditableOverviewTabProps {
  card: CardData
  onUpdate: (updates: Partial<CardData>) => Promise<void>
  onDelete: () => Promise<void>
}

interface EditableFieldProps {
  value: string
  onSave: (newValue: string) => void
  multiline?: boolean
  placeholder?: string
  className?: string
}

// Inline editable field component
function EditableField({ value, onSave, multiline = false, placeholder = 'Click to edit', className = '' }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleSave = () => {
    onSave(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className={`editable-field-container ${className}`}>
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel()
              if (e.key === 'Enter' && e.metaKey) handleSave()
            }}
            className="w-full p-2 text-[12px] border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') handleCancel()
            }}
            className="w-full p-1 text-[12px] border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        )}
        <div className="flex gap-1 mt-1">
          <button onClick={handleSave} className="text-green-600 hover:text-green-700">
            <Check className="w-3 h-3" />
          </button>
          <button onClick={handleCancel} className="text-gray-600 hover:text-gray-700">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`editable-field group cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1 transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <span className={value ? '' : 'text-gray-400 italic'}>
        {value || placeholder}
      </span>
      <Edit2 className="w-3 h-3 text-gray-400 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

export default function EditableOverviewTab({ card, onUpdate, onDelete }: EditableOverviewTabProps) {
  const theme = getCategoryTheme(card.cardType || 'market')
  const categoryName = getCategoryDisplayName(card.cardType || 'market')
  
  // Initialize auto-save
  const {
    data: localData,
    updateField,
    updateFields,
    forceSave,
    isDirty,
    isSaving,
    saveStatus,
    lastSaved
  } = useAutoSave({
    initialData: card,
    onSave: async (data) => {
      await onUpdate(data)
      return { success: true }
    },
    debounceMs: 1000,
    enableOptimisticUpdates: true,
    enableOfflineQueue: true
  })
  
  // Format date for display
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // Handle field updates
  const handleFieldUpdate = useCallback((field: string, value: any) => {
    updateField(field, value)
  }, [updateField])
  
  // Extract key insights
  const getKeyInsights = () => {
    const insights = []
    if (localData.key_findings && Array.isArray(localData.key_findings)) {
      insights.push(...localData.key_findings)
    }
    return insights
  }
  
  const keyInsights = getKeyInsights()
  
  return (
    <div className="overview-tab-content">
      {/* Save Indicator */}
      <div className="flex justify-end mb-4">
        <SaveIndicator status={saveStatus} size="sm" />
      </div>

      {/* Executive Summary Section */}
      <section className="mb-8">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${theme.dot}`}></div>
          Executive Summary
        </h3>
        <div className="text-[12px] leading-relaxed text-gray-700">
          <EditableField
            value={localData.description || ''}
            onSave={(value) => handleFieldUpdate('description', value)}
            multiline={true}
            placeholder="Add an executive summary..."
            className="whitespace-pre-wrap"
          />
        </div>
      </section>
      
      {/* Strategic Context Section */}
      <section className="mb-8">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-600" />
          Strategic Context
        </h3>
        <EditableField
          value={localData.strategicAlignment || ''}
          onSave={(value) => handleFieldUpdate('strategicAlignment', value)}
          multiline={true}
          placeholder="Add strategic context..."
          className="text-[12px] leading-relaxed text-gray-700"
        />
      </section>
      
      {/* Metadata Grid */}
      <section className="mb-8">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-600" />
          Intelligence Metadata
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Priority Level</p>
            <select
              value={localData.priority || 'Medium'}
              onChange={(e) => handleFieldUpdate('priority', e.target.value)}
              className="text-[12px] text-gray-900 font-medium bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          {/* Confidence */}
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Confidence Level</p>
            <select
              value={localData.confidenceLevel || 'Medium'}
              onChange={(e) => handleFieldUpdate('confidenceLevel', e.target.value)}
              className="text-[12px] text-gray-900 font-medium bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          {/* Owner */}
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Owner</p>
            <div className="text-[12px] text-gray-900 flex items-center gap-1">
              <User className="w-3 h-3 text-gray-400" />
              <EditableField
                value={localData.owner || localData.creator || ''}
                onSave={(value) => handleFieldUpdate('owner', value)}
                placeholder="Assign owner..."
              />
            </div>
          </div>
          
          {/* Category */}
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Category</p>
            <p className="text-[12px] text-gray-900">{categoryName}</p>
          </div>
        </div>
      </section>
      
      {/* Tags Section */}
      <section className="mb-8">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-600" />
          Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {localData.tags && localData.tags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="px-2 py-1 text-[11px] rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer group relative"
            >
              {tag}
              <button
                onClick={() => {
                  const newTags = localData.tags.filter((_: string, i: number) => i !== idx)
                  handleFieldUpdate('tags', newTags)
                }}
                className="ml-1 text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={() => {
              const newTag = prompt('Add a tag:')
              if (newTag) {
                handleFieldUpdate('tags', [...(localData.tags || []), newTag])
              }
            }}
            className="px-2 py-1 text-[11px] rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600"
          >
            + Add tag
          </button>
        </div>
      </section>
      
      {/* Timeline */}
      <section className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Created {formatDate(localData.created_at || localData.createdDate)}</span>
          </div>
          <div>
            Last updated {formatDate(localData.updated_at || localData.lastModified)}
          </div>
        </div>
      </section>
      
      {/* Actions */}
      <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end gap-2">
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          Delete Card
        </button>
      </div>
    </div>
  )
}