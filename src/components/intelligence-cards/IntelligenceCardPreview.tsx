'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { CardData } from '@/types/card'
import { getCategoryTheme, getCategoryDisplayName } from './utils/categoryThemes'
import { generateDesktopSummary, generateFallbackSummary, RichPreviewData } from './utils/generateRichSummary'
import { Eye, Lightbulb, Bookmark, Share2, MoreVertical, TrendingUp, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react'
import './styles/grid-layout.css'

interface IntelligenceCardPreviewProps {
  card: CardData
  onClick: () => void
  isSelected?: boolean
  onSelect?: (e: React.MouseEvent) => void
  viewDensity?: 'compact' | 'comfortable' | 'expanded'
}

export default function IntelligenceCardPreview({
  card,
  onClick,
  isSelected = false,
  onSelect,
  viewDensity = 'comfortable'
}: IntelligenceCardPreviewProps) {
  const [previewData, setPreviewData] = useState<RichPreviewData | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Get category theme
  const theme = useMemo(() => getCategoryTheme(card.cardType || 'market'), [card.cardType])
  const categoryName = useMemo(() => getCategoryDisplayName(card.cardType || 'market'), [card.cardType])
  
  // Generate preview data
  useEffect(() => {
    generateDesktopSummary(card)
      .then(setPreviewData)
      .catch(() => {
        // Fallback if generation fails
        setPreviewData(generateFallbackSummary(card))
      })
  }, [card])
  
  if (!previewData) {
    // Loading skeleton
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 animate-pulse min-h-[160px] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="flex items-center gap-3 mt-auto pt-3">
          <div className="h-3 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    )
  }
  
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }
  
  return (
    <div
      className={`
        intelligence-card-preview
        bg-white rounded-xl transition-all duration-200 cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-[0_0_0_2px_rgba(37,99,235,0.1)]' : 'border border-gray-50'}
        ${isHovered || isExpanded ? 'shadow-[0_4px_16px_rgba(0,0,0,0.06)] transform -translate-y-0.5 border-gray-100' : 'shadow-[0_1px_3px_rgba(0,0,0,0.04)]'}
        ${viewDensity === 'compact' ? 'p-4' : viewDensity === 'expanded' ? 'p-6' : 'p-5'}
        min-h-[160px]
        transition-all duration-200 ease-out
        ${isExpanded ? 'pb-4 is-expanded' : ''}
        self-start
        overflow-hidden
      `}
      style={{
        background: `linear-gradient(135deg, #ffffff 0%, ${theme.background} 100%)`,
        contain: 'layout style'
      }}
      onClick={(e) => {
        // Don't do anything on card click - only specific elements trigger actions
        e.preventDefault()
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${theme.dot} ${isHovered ? 'scale-125' : ''} transition-transform duration-200`}></div>
          <span className="text-[11px] font-medium text-gray-600">
            {categoryName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-500">
            {formatDate(card.created_at || card.createdDate)}
          </span>
          {/* Selection checkbox */}
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                onSelect(e)
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Title */}
        <h3 className={`font-semibold text-gray-900 leading-tight line-clamp-2 ${
          isHovered ? 'text-blue-600' : ''
        } transition-colors duration-200 ${
          viewDensity === 'compact' ? 'text-sm' : 'text-[14px]'
        }`}>
          {previewData.headline}
        </h3>
        
        {/* Summary - Always show at least 2 lines */}
        <p className={`text-gray-600 leading-relaxed ${
          viewDensity === 'compact' ? 'text-xs line-clamp-2' : 'text-[12px] line-clamp-3'
        }`}>
          {previewData.summary}
        </p>
        
        {/* Expandable Content - Smart preview */}
        <div className={`
          expansion-content overflow-hidden transition-all duration-200 ease-out
          ${isExpanded ? 'opacity-100 max-h-[200px] mt-3' : 'opacity-0 max-h-0'}
        `}>
          {/* Key Findings */}
          {previewData.insights.preview.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-medium text-gray-700 mb-1.5">Key Findings:</p>
              <ul className="space-y-1">
                {previewData.insights.preview.slice(0, 3).map((insight, idx) => (
                  <li key={idx} className="text-[11px] text-gray-600 pl-3 relative">
                    <span className="absolute left-0 top-0.5 text-gray-400">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Quick Metric - Relevance Score */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-600">Relevance</span>
              <span className="text-gray-700 font-medium">{card.relevance_score || 5}/10</span>
            </div>
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(card.relevance_score || 5) * 10}%` }}
              />
            </div>
          </div>
          
          {/* Action Hint with hover effect */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick() // Open modal
            }}
            className="w-full text-[10px] text-gray-500 hover:text-blue-600 text-center py-1 rounded hover:bg-blue-50 transition-all duration-200"
          >
            Click to view full details and edit
          </button>
        </div>
        
      </div>
      
      {/* Compact Footer */}
      <div className="flex items-center justify-between mt-auto pt-3">
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            💡 {previewData.insights.total} {isExpanded ? 'insights' : ''}
          </span>
          {!isExpanded && (
            <>
              <span className="flex items-center gap-1">
                👁 {previewData.metadata.views || 0}
              </span>
              {card.card_data?.saved && (
                <span className="text-blue-600">
                  💾
                </span>
              )}
            </>
          )}
        </div>
        
        {/* Expand/Collapse Indicator */}
        {!isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(true)
            }}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="Expand for more details"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        )}
        
        {isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(false)
            }}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="Collapse"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
        )}
        
        {/* Quick Actions (visible on hover when not expanded) */}
        {!isExpanded && (
          <div className={`flex items-center gap-0.5 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Handle save action
            }}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="Save"
          >
            <Bookmark className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Handle share action
            }}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="Share"
          >
            <Share2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Handle more actions
            }}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="More"
          >
            <MoreVertical className="w-3 h-3" />
          </button>
          </div>
        )}
      </div>
    </div>
  )
}