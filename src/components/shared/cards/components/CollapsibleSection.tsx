'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'gray' | 'red' | 'indigo' | 'pink' | 'cyan'
  defaultExpanded?: boolean
  badge?: React.ReactNode
  preview?: React.ReactNode
  sectionNumber?: number
  className?: string
  headerClassName?: string
  contentClassName?: string
}

const colorMap = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  purple: 'bg-purple-50 border-purple-200',
  orange: 'bg-orange-50 border-orange-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  gray: 'bg-gray-50 border-gray-200',
  red: 'bg-red-50 border-red-200',
  indigo: 'bg-indigo-50 border-indigo-200',
  pink: 'bg-pink-50 border-pink-200',
  cyan: 'bg-cyan-50 border-cyan-200'
}

export function CollapsibleSection({
  title,
  children,
  colorScheme = 'gray',
  defaultExpanded = false,
  badge,
  preview,
  sectionNumber,
  className = '',
  headerClassName = '',
  contentClassName = ''
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const contentRef = useRef<HTMLDivElement>(null)
  const resizeTimeoutRef = useRef<NodeJS.Timeout>()

  // Add throttled ResizeObserver for better performance
  useEffect(() => {
    if (!contentRef.current || !isExpanded) return

    let animationFrameId: number | null = null
    let resizeObserver: ResizeObserver | null = null
    
    const handleResize = () => {
      // Cancel any pending animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      // Throttle resize handling with requestAnimationFrame
      animationFrameId = requestAnimationFrame(() => {
        // Clear any existing timeout
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current)
        }

        // Debounce the actual resize logic
        resizeTimeoutRef.current = setTimeout(() => {
          // Add any resize-dependent logic here if needed
          // For now, we're just preventing excessive observer callbacks
        }, 150)
      })
    }

    const handleWindowResize = () => {
      // Handle window resize events if needed
      handleResize()
    }

    try {
      resizeObserver = new ResizeObserver(handleResize)
      if (contentRef.current) {
        resizeObserver.observe(contentRef.current)
      }
      
      // Add window resize listener for complete coverage
      window.addEventListener('resize', handleWindowResize, { passive: true })
    } catch (error) {
      console.warn('ResizeObserver not supported:', error)
    }

    return () => {
      // Cleanup ResizeObserver
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
      
      // Cleanup window event listener
      window.removeEventListener('resize', handleWindowResize)
      
      // Cleanup animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      
      // Cleanup timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
        resizeTimeoutRef.current = undefined
      }
    }
  }, [isExpanded])

  return (
    <div className={`border-b border-gray-100 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full flex items-center justify-between p-3 text-left 
          hover:bg-gray-50 transition-colors
          ${headerClassName}
        `}
      >
        <div className="flex items-center gap-2 flex-1">
          {sectionNumber !== undefined && (
            <span className="text-xs font-medium text-gray-400">
              {sectionNumber}.
            </span>
          )}
          <span className="text-sm font-medium text-gray-900">{title}</span>
          {badge}
        </div>
        
        {/* Preview when collapsed */}
        {!isExpanded && preview && (
          <div className="flex-1 mx-4 max-w-md">
            <div className="text-xs text-gray-600 truncate">
              {preview}
            </div>
          </div>
        )}
        
        {isExpanded ? 
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" /> : 
          <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
        }
      </button>
      
      {isExpanded && (
        <div 
          ref={contentRef}
          className={`p-2 space-y-2 ${colorMap[colorScheme]} ${contentClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  )
}

// Helper component for generating section preview
export function SectionPreview({ data, fields }: { data: any, fields: string[] }) {
  const previewParts = fields
    .map(field => data[field])
    .filter(Boolean)
    .slice(0, 2) // Show first 2 non-empty fields

  if (previewParts.length === 0) {
    return <span className="italic">No content</span>
  }

  return (
    <>
      {previewParts.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="mx-1">•</span>}
          <span>{part}</span>
        </React.Fragment>
      ))}
    </>
  )
}