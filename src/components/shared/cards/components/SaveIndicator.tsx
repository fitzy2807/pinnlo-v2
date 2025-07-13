'use client'

import React from 'react'
import { Check, AlertCircle, Cloud, CloudOff, Loader } from 'lucide-react'
import type { SaveStatus } from '../hooks/useAutoSave'

interface SaveIndicatorProps {
  status: SaveStatus
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function SaveIndicator({ 
  status, 
  size = 'sm',
  showLabel = true 
}: SaveIndicatorProps) {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  const statusConfig = {
    idle: {
      icon: null,
      label: '',
      className: ''
    },
    saving: {
      icon: <Loader className={`${iconSize} animate-spin`} />,
      label: 'Saving...',
      className: 'text-blue-600'
    },
    saved: {
      icon: <Check className={iconSize} />,
      label: 'Saved',
      className: 'text-green-600'
    },
    error: {
      icon: <AlertCircle className={iconSize} />,
      label: 'Error',
      className: 'text-red-600'
    },
    dirty: {
      icon: <div className={`${size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'} bg-yellow-500 rounded-full`} />,
      label: 'Unsaved',
      className: 'text-yellow-600'
    },
    offline: {
      icon: <CloudOff className={iconSize} />,
      label: 'Offline',
      className: 'text-gray-600'
    }
  }

  const config = statusConfig[status]
  
  if (!config || (!config.icon && !config.label)) {
    return null
  }

  return (
    <div className={`flex items-center gap-1 ${textSize} ${config.className}`}>
      {config.icon}
      {showLabel && config.label && (
        <span className="font-medium">{config.label}</span>
      )}
    </div>
  )
}