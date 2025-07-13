'use client'

import React from 'react'

interface CardContainerProps {
  children: React.ReactNode
  isSelected?: boolean
  onClick?: () => void
  className?: string
  isDragging?: boolean
  isDropTarget?: boolean
}

export function CardContainer({ 
  children, 
  isSelected = false,
  onClick,
  className = '',
  isDragging = false,
  isDropTarget = false
}: CardContainerProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        border rounded-lg bg-white shadow-sm transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
          : 'border-gray-200 hover:border-gray-300'
        }
        ${isDragging ? 'opacity-50 cursor-move' : ''}
        ${isDropTarget ? 'border-blue-400 border-dashed border-2' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}