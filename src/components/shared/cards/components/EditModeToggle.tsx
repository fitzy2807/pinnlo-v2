'use client'

import React from 'react'
import { Eye, Edit } from 'lucide-react'

interface EditModeToggleProps {
  isEditMode: boolean
  onToggle: () => void
  size?: 'sm' | 'md'
  disabled?: boolean
}

export function EditModeToggle({ 
  isEditMode, 
  onToggle, 
  size = 'sm',
  disabled = false 
}: EditModeToggleProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  }

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        ${sizeClasses[size]} rounded transition-colors inline-flex items-center gap-1
        ${isEditMode 
          ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200' 
          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={isEditMode ? 'Switch to Preview Mode' : 'Switch to Edit Mode'}
    >
      {isEditMode ? (
        <>
          <Eye className={iconSize} />
          Preview
        </>
      ) : (
        <>
          <Edit className={iconSize} />
          Edit
        </>
      )}
    </button>
  )
}