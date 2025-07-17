'use client'

import React, { useState, useEffect } from 'react'
import Draggable from 'react-draggable'
import { X, Minimize2, Maximize2, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface AIProcessingStatus {
  isActive: boolean
  progress: number // 0-100
  message: string
  status: 'processing' | 'complete' | 'error' | 'idle'
  startTime?: number
  endTime?: number
}

interface AIProcessingIndicatorProps {
  status: AIProcessingStatus
  onClose?: () => void
  defaultPosition?: { x: number; y: number }
  onPositionChange?: (position: { x: number; y: number }) => void
}

export default function AIProcessingIndicator({
  status,
  onClose,
  defaultPosition = { x: -140, y: -60 }, // Bottom-right corner
  onPositionChange
}: AIProcessingIndicatorProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState(defaultPosition)
  const [isDragging, setIsDragging] = useState(false)

  // Auto-minimize after completion
  useEffect(() => {
    if (status.status === 'complete' || status.status === 'error') {
      const timer = setTimeout(() => {
        setIsMinimized(true)
      }, 3000) // Auto-minimize after 3 seconds
      
      return () => clearTimeout(timer)
    }
  }, [status.status])

  // Handle position changes
  const handleDrag = (e: any, data: any) => {
    const newPosition = { x: data.x, y: data.y }
    setPosition(newPosition)
    onPositionChange?.(newPosition)
  }

  // Get status color
  const getStatusColor = () => {
    switch (status.status) {
      case 'processing':
        return {
          bg: 'bg-orange-500',
          text: 'text-orange-500',
          border: 'border-orange-500',
          glow: 'shadow-orange-500/50'
        }
      case 'complete':
        return {
          bg: 'bg-green-500',
          text: 'text-green-500',
          border: 'border-green-500',
          glow: 'shadow-green-500/50'
        }
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'text-red-500',
          border: 'border-red-500',
          glow: 'shadow-red-500/50'
        }
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-500',
          border: 'border-gray-500',
          glow: 'shadow-gray-500/50'
        }
    }
  }

  // Get status icon
  const getStatusIcon = () => {
    switch (status.status) {
      case 'processing':
        return <Sparkles className="w-3 h-3 animate-pulse" />
      case 'complete':
        return <CheckCircle className="w-3 h-3" />
      case 'error':
        return <AlertCircle className="w-3 h-3" />
      default:
        return <Sparkles className="w-3 h-3" />
    }
  }

  const colors = getStatusColor()

  // Don't render if not active
  if (!status.isActive) return null

  return (
    <Draggable
      position={position}
      onDrag={handleDrag}
      onStart={() => setIsDragging(true)}
      onStop={() => setIsDragging(false)}
      handle=".drag-handle"
      bounds="parent"
    >
      <div className="fixed z-50 select-none">
        <AnimatePresence mode="wait">
          {isMinimized ? (
            // Minimized state - tiny colored dot
            <motion.div
              key="minimized"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`
                w-5 h-5 rounded-full cursor-pointer
                ${colors.bg} ${colors.glow}
                shadow-lg border-2 border-white
                flex items-center justify-center
                hover:scale-110 transition-transform
                ${status.status === 'processing' ? 'animate-pulse' : ''}
              `}
              onClick={() => setIsMinimized(false)}
              title={`AI Processing: ${status.message}`}
            >
              <div className="w-2 h-2 bg-white rounded-full opacity-80" />
            </motion.div>
          ) : (
            // Normal state - small progress indicator
            <motion.div
              key="normal"
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 20 }}
              className={`
                bg-white rounded-lg shadow-lg border-2 ${colors.border}
                min-w-[160px] max-w-[200px] p-3
                ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                hover:${colors.glow} transition-shadow
              `}
            >
              {/* Header */}
              <div className="drag-handle flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={colors.text}>
                    {getStatusIcon()}
                  </div>
                  <span className="text-xs font-medium text-gray-700 truncate">
                    AI Processing
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors"
                    title="Minimize"
                  >
                    <Minimize2 className="w-3 h-3" />
                  </button>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors"
                      title="Close"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs font-medium text-gray-700">
                    {Math.round(status.progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <motion.div
                    className={`h-1.5 rounded-full ${colors.bg}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${status.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Status Message */}
              <div className="text-xs text-gray-600 truncate" title={status.message}>
                {status.message}
              </div>

              {/* Processing Time */}
              {status.startTime && (
                <div className="text-xs text-gray-500 mt-1">
                  {status.status === 'processing' && (
                    <span>
                      {Math.round((Date.now() - status.startTime) / 1000)}s
                    </span>
                  )}
                  {status.status === 'complete' && status.endTime && (
                    <span>
                      Completed in {Math.round((status.endTime - status.startTime) / 1000)}s
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Draggable>
  )
}