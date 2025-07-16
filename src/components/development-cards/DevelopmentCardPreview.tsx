'use client'

import React, { useState, useMemo } from 'react'
import { CardData } from '@/types/card'
import { 
  FileText, 
  Database, 
  Settings, 
  Code, 
  Bookmark, 
  Share2, 
  MoreVertical, 
  ChevronDown, 
  ChevronUp,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { getDevelopmentTheme, getDevelopmentDisplayName } from './utils/developmentThemes'

interface DevelopmentCardPreviewProps {
  card: CardData
  onClick: () => void
  isSelected?: boolean
  onSelect?: (e: React.MouseEvent) => void
  viewDensity?: 'compact' | 'comfortable' | 'expanded'
}

// Generate development-specific preview data
const generateDevelopmentPreview = (card: CardData) => {
  const cardType = card.cardType || card.card_type || 'development'
  const cardData = card.card_data || {}
  
  switch (cardType) {
    case 'prd':
      const userStories = cardData.user_stories || []
      const functionalReqs = cardData.functional_requirements || []
      const risks = cardData.risks_and_mitigation || []
      
      return {
        headline: card.title || 'Untitled PRD',
        summary: card.description || cardData.product_vision || 'Product requirements document',
        insights: {
          preview: [
            userStories.length > 0 && `${userStories.length} user stories`,
            functionalReqs.length > 0 && `${functionalReqs.length} functional requirements`,
            risks.length > 0 && `${risks.length} risks identified`
          ].filter(Boolean),
          total: userStories.length + functionalReqs.length + risks.length
        },
        metadata: {
          status: cardData.status || 'draft',
          priority: cardData.priority || 'medium',
          owner: cardData.product_manager || 'Unassigned',
          version: cardData.version || '1.0'
        }
      }
    
    case 'technical-requirement':
    case 'trd':
      return {
        headline: card.title || 'Untitled TRD',
        summary: card.description || cardData.system_overview || 'Technical requirements document',
        insights: {
          preview: [
            cardData.technology_stack_frontend && 'Frontend tech defined',
            cardData.technology_stack_backend && 'Backend tech defined',
            cardData.database_schema && 'Database schema defined'
          ].filter(Boolean),
          total: Object.keys(cardData).length
        },
        metadata: {
          status: cardData.status || 'draft',
          priority: cardData.priority || 'medium',
          owner: cardData.assigned_team || 'Unassigned',
          version: cardData.version || '1.0'
        }
      }
    
    case 'tech-stack':
      return {
        headline: card.title || 'Untitled Tech Stack',
        summary: card.description || 'Technology stack definition',
        insights: {
          preview: [
            cardData.stack_type && `${cardData.stack_type} stack`,
            cardData.layers && `${Object.keys(cardData.layers).length} layers`,
            'Architecture defined'
          ].filter(Boolean),
          total: Object.keys(cardData.layers || {}).length
        },
        metadata: {
          status: 'active',
          priority: 'high',
          owner: 'Tech Team',
          version: '1.0'
        }
      }
    
    default:
      return {
        headline: card.title || 'Untitled Development Card',
        summary: card.description || 'Development asset',
        insights: {
          preview: ['Development item'],
          total: 1
        },
        metadata: {
          status: 'draft',
          priority: 'medium',
          owner: 'Unassigned',
          version: '1.0'
        }
      }
  }
}

export default function DevelopmentCardPreview({
  card,
  onClick,
  isSelected = false,
  onSelect,
  viewDensity = 'comfortable'
}: DevelopmentCardPreviewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Get development theme
  const theme = useMemo(() => getDevelopmentTheme(card.cardType || card.card_type || 'development'), [card.cardType, card.card_type])
  const categoryName = useMemo(() => getDevelopmentDisplayName(card.cardType || card.card_type || 'development'), [card.cardType, card.card_type])
  const IconComponent = theme.icon
  
  // Generate preview data
  const previewData = useMemo(() => generateDevelopmentPreview(card), [card])
  
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'text-green-600'
      case 'in_progress':
      case 'review':
        return 'text-yellow-600'
      case 'blocked':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }
  
  return (
    <div
      className={`
        development-card-preview
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
        e.preventDefault()
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconComponent className={`w-3 h-3 ${theme.accent}`} />
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
          isHovered ? theme.accent : ''
        } transition-colors duration-200 ${
          viewDensity === 'compact' ? 'text-sm' : 'text-[14px]'
        }`}>
          {previewData.headline}
        </h3>
        
        {/* Summary */}
        <p className={`text-gray-600 leading-relaxed ${
          viewDensity === 'compact' ? 'text-xs line-clamp-2' : 'text-[12px] line-clamp-3'
        }`}>
          {previewData.summary}
        </p>
        
        {/* Expandable Content */}
        <div className={`
          expansion-content overflow-hidden transition-all duration-200 ease-out
          ${isExpanded ? 'opacity-100 max-h-[200px] mt-3' : 'opacity-0 max-h-0'}
        `}>
          {/* Key Insights */}
          {previewData.insights.preview.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-medium text-gray-700 mb-1.5">Key Components:</p>
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
          
          {/* Status and Priority */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-medium text-gray-700 mb-0.5">Status:</p>
              <p className={`text-[11px] font-medium ${getStatusColor(previewData.metadata.status)}`}>
                {previewData.metadata.status.charAt(0).toUpperCase() + previewData.metadata.status.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-700 mb-0.5">Priority:</p>
              <p className={`text-[11px] font-medium ${getPriorityColor(previewData.metadata.priority)}`}>
                {previewData.metadata.priority.charAt(0).toUpperCase() + previewData.metadata.priority.slice(1)}
              </p>
            </div>
          </div>
          
          {/* Owner and Version */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-600">Owner: {previewData.metadata.owner}</span>
              <span className="text-gray-600">v{previewData.metadata.version}</span>
            </div>
          </div>
          
          {/* Action Hint */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            className="w-full text-[10px] text-gray-500 hover:text-blue-600 text-center py-1 rounded hover:bg-blue-50 transition-all duration-200"
          >
            Click to view full details and edit
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3">
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <IconComponent className="w-3 h-3" />
            {previewData.insights.total} {isExpanded ? 'components' : ''}
          </span>
          {!isExpanded && (
            <>
              <span className={`flex items-center gap-1 ${getStatusColor(previewData.metadata.status)}`}>
                {previewData.metadata.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : 
                 previewData.metadata.status === 'blocked' ? <AlertTriangle className="w-3 h-3" /> : 
                 <Clock className="w-3 h-3" />}
                {previewData.metadata.status}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {previewData.metadata.owner}
              </span>
            </>
          )}
        </div>
        
        {/* Expand/Collapse */}
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
        
        {/* Quick Actions */}
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