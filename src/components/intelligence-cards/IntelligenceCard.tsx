'use client'

import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Bookmark,
  Archive,
  Trash2,
  Edit,
  ExternalLink,
  Calendar,
  Shield,
  Target,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import {
  IntelligenceCard as IntelligenceCardType,
  IntelligenceCardCategory,
  IntelligenceCardStatus,
  CATEGORY_DISPLAY_NAMES
} from '@/types/intelligence-cards'
import { useIntelligenceCardActions } from '@/hooks/useIntelligenceCards'

interface IntelligenceCardProps {
  card: IntelligenceCardType
  onEdit?: (card: IntelligenceCardType) => void
  onRefresh?: () => void
  isSelected?: boolean
  onToggleSelect?: () => void
  isSelectionMode?: boolean
}

export default function IntelligenceCard({ card, onEdit, onRefresh, isSelected = false, onToggleSelect, isSelectionMode = false }: IntelligenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { save, archive, restore, delete: deleteCard, loading } = useIntelligenceCardActions()

  // Category colors
  const categoryColors: Record<IntelligenceCardCategory, string> = {
    [IntelligenceCardCategory.MARKET]: 'bg-green-100 text-green-800 border-green-200',
    [IntelligenceCardCategory.COMPETITOR]: 'bg-blue-100 text-blue-800 border-blue-200',
    [IntelligenceCardCategory.TRENDS]: 'bg-purple-100 text-purple-800 border-purple-200',
    [IntelligenceCardCategory.TECHNOLOGY]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    [IntelligenceCardCategory.STAKEHOLDER]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [IntelligenceCardCategory.CONSUMER]: 'bg-red-100 text-red-800 border-red-200',
    [IntelligenceCardCategory.RISK]: 'bg-orange-100 text-orange-800 border-orange-200',
    [IntelligenceCardCategory.OPPORTUNITIES]: 'bg-teal-100 text-teal-800 border-teal-200'
  }

  const handleAction = async (action: 'save' | 'archive' | 'restore' | 'delete') => {
    let result
    switch (action) {
      case 'save':
        result = await save(card.id)
        break
      case 'archive':
        result = await archive(card.id)
        break
      case 'restore':
        result = await restore(card.id)
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this intelligence card?')) {
          result = await deleteCard(card.id)
        }
        break
    }
    
    if (result?.success && onRefresh) {
      onRefresh()
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400'
    if (score >= 8) return 'text-green-600'
    if (score >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="relative">
      {/* Selection Checkbox - Top Right like Template Bank */}
      {onToggleSelect && (
        <div className="absolute top-2 right-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              onToggleSelect()
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black bg-white shadow-sm"
          />
        </div>
      )}
      
      <div className={`bg-white rounded-lg border ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} shadow-sm hover:shadow-md transition-all`}>
      
        {/* Card Header */}
        <div
          className="p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Category Badge */}
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${categoryColors[card.category]} mb-2`}>
              {CATEGORY_DISPLAY_NAMES[card.category]}
            </span>
            
            {/* Title */}
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{card.title}</h3>
            
            {/* Summary */}
            <p className="text-xs text-gray-600 line-clamp-2">{card.summary}</p>
            
            {/* Metadata */}
            <div className="flex items-center gap-4 mt-2">
              {card.date_accessed && (
                <span className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(card.date_accessed)}
                </span>
              )}
              {card.credibility_score && (
                <span className={`flex items-center text-xs ${getScoreColor(card.credibility_score)}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {card.credibility_score}/10
                </span>
              )}
              {card.relevance_score && (
                <span className={`flex items-center text-xs ${getScoreColor(card.relevance_score)}`}>
                  <Target className="w-3 h-3 mr-1" />
                  {card.relevance_score}/10
                </span>
              )}
            </div>
          </div>
          
          {/* Expand/Collapse Icon */}
          <div className="ml-4">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-4 space-y-4">
            {/* Intelligence Content */}
            <div>
              <h4 className="text-xs font-medium text-gray-900 mb-1">Intelligence Content</h4>
              <p className="text-xs text-gray-700 whitespace-pre-wrap">{card.intelligence_content}</p>
            </div>

            {/* Key Findings */}
            {card.key_findings.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Key Findings</h4>
                <ul className="space-y-1">
                  {card.key_findings.map((finding, index) => (
                    <li key={index} className="flex items-start text-xs text-gray-700">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strategic Implications */}
            {card.strategic_implications && (
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Strategic Implications</h4>
                <p className="text-xs text-gray-700">{card.strategic_implications}</p>
              </div>
            )}

            {/* Recommended Actions */}
            {card.recommended_actions && (
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Recommended Actions</h4>
                <p className="text-xs text-gray-700">{card.recommended_actions}</p>
              </div>
            )}

            {/* Source Reference */}
            {card.source_reference && (
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Source</h4>
                <a
                  href={card.source_reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  {card.source_reference}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}

            {/* Tags */}
            {card.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {card.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Blueprint Pages */}
            {card.relevant_blueprint_pages.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Related Blueprint Pages</h4>
                <div className="flex flex-wrap gap-1">
                  {card.relevant_blueprint_pages.map((page, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {page}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {card.status === IntelligenceCardStatus.ACTIVE && (
                  <>
                    <button
                      onClick={() => handleAction('save')}
                      disabled={loading}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Bookmark className="w-3 h-3 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => handleAction('archive')}
                      disabled={loading}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Archive className="w-3 h-3 mr-1" />
                      Archive
                    </button>
                  </>
                )}
                {(card.status === IntelligenceCardStatus.SAVED || card.status === IntelligenceCardStatus.ARCHIVED) && (
                  <button
                    onClick={() => handleAction('restore')}
                    disabled={loading}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Restore to Active
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(card)}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </button>
                )}
              </div>
              <button
                onClick={() => handleAction('delete')}
                disabled={loading}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}