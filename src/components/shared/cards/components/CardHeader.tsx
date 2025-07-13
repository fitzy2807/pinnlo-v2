'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Edit3, Check, X, Eye, Edit } from 'lucide-react'
import { EditModeToggle } from './EditModeToggle'
import { SaveIndicator } from './SaveIndicator'
import type { SaveStatus } from '../hooks/useAutoSave'

interface CardHeaderProps {
  title: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  isEditMode: boolean
  onToggleEditMode: () => void
  metadata?: React.ReactNode
  actions?: React.ReactNode
  status?: React.ReactNode
  onTitleEdit?: (newTitle: string) => void
  onSelect?: () => void
  isSelected?: boolean
  saveStatus?: SaveStatus
  className?: string
}

interface TitleEditorProps {
  value: string
  onSave: (value: string) => void
  onCancel: () => void
}

function TitleEditor({ value, onSave, onCancel }: TitleEditorProps) {
  const [titleValue, setTitleValue] = useState(value)
  const [isCanceling, setIsCanceling] = useState(false)

  const handleSave = () => {
    if (titleValue.trim() && titleValue !== value) {
      onSave(titleValue.trim())
    } else {
      onCancel()
    }
  }

  const handleCancel = () => {
    setIsCanceling(true)
    onCancel()
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Don't save if user is clicking cancel button or pressing escape
    const relatedTarget = e.relatedTarget as HTMLElement
    if (relatedTarget?.closest('[data-cancel-button]') || isCanceling) {
      return
    }
    
    // Only save if value actually changed
    if (titleValue.trim() && titleValue.trim() !== value) {
      handleSave()
    } else {
      onCancel()
    }
  }

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <input
        type="text"
        value={titleValue}
        onChange={(e) => setTitleValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSave()
          }
          if (e.key === 'Escape') {
            e.preventDefault()
            handleCancel()
          }
        }}
        onBlur={handleBlur}
        className="flex-1 px-2 py-1 text-sm text-black border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        autoFocus
      />
      <button 
        onClick={handleSave} 
        className="p-1 text-green-600 hover:text-green-700 transition-colors"
        title="Save"
      >
        <Check className="w-4 h-4" />
      </button>
      <button 
        onClick={handleCancel}
        data-cancel-button
        className="p-1 text-gray-600 hover:text-gray-700 transition-colors"
        title="Cancel"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function CardHeader({
  title,
  isCollapsed,
  onToggleCollapse,
  isEditMode,
  onToggleEditMode,
  metadata,
  actions,
  status,
  onTitleEdit,
  onSelect,
  isSelected = false,
  saveStatus,
  className = ''
}: CardHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  const handleTitleSave = (newTitle: string) => {
    onTitleEdit?.(newTitle)
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setIsEditingTitle(false)
  }

  return (
    <div className={`p-3 border-b border-gray-100 bg-gray-50 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {/* Selection Checkbox */}
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          )}
          
          {/* Collapse/Expand Button */}
          <button
            onClick={onToggleCollapse}
            className="flex items-center space-x-2 text-left flex-1"
          >
            {isCollapsed ? 
              <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" /> : 
              <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
            }
            
            {/* Title and Metadata */}
            <div className="flex-1 min-w-0">
              {isEditingTitle && onTitleEdit ? (
                <TitleEditor
                  value={title}
                  onSave={handleTitleSave}
                  onCancel={handleTitleCancel}
                />
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {title}
                  </h3>
                  {metadata && (
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {metadata}
                    </div>
                  )}
                </div>
              )}
            </div>
          </button>
          
          {/* Status Indicator */}
          {status}
          
          {/* Save Indicator */}
          {saveStatus && (
            <SaveIndicator status={saveStatus} />
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          {/* Edit/Preview Mode Toggle */}
          <EditModeToggle
            isEditMode={isEditMode}
            onToggle={onToggleEditMode}
          />
          
          {/* Custom Actions */}
          {actions}
          
          {/* Edit Title Button */}
          {onTitleEdit && !isEditingTitle && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditingTitle(true)
              }}
              className="p-1.5 text-gray-600 hover:text-blue-600 rounded transition-colors"
              title="Edit Title"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}