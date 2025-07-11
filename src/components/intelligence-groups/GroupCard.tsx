'use client'

import React, { useState } from 'react'
import { 
  Folder, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  FolderOpen,
  X,
  Eye,
  ExternalLink,
  Save,
  Archive,
  User,
  Tag,
  Calendar,
  LogOut
} from 'lucide-react'
import { IntelligenceGroup } from '@/types/intelligence-groups'
import { useIntelligenceGroups } from '@/hooks/useIntelligenceGroups'
import { IntelligenceCard } from '@/types/intelligence-cards'
import { useIntelligenceCardActions } from '@/hooks/useIntelligenceCards'

interface GroupCardProps {
  group: IntelligenceGroup
  isSelected?: boolean
  viewMode: 'grid' | 'list'
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  expandable?: boolean
  // Selection props for cards within the group
  selectedCardIds?: Set<string>
  setSelectedCardIds?: (ids: Set<string>) => void
  isSelectionMode?: boolean
  setIsSelectionMode?: (mode: boolean) => void
}

// Individual card component within group
interface GroupCardItemProps {
  card: IntelligenceCard
  onRemove: (cardId: string, e: React.MouseEvent) => void
  isSelected?: boolean
  onToggleSelect?: (cardId: string) => void
  isSelectionMode?: boolean
}

function GroupCardItem({ card, onRemove, isSelected = false, onToggleSelect, isSelectionMode = false }: GroupCardItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { save: saveCard, archive: archiveCard, delete: deleteCard } = useIntelligenceCardActions()

  const handleCardAction = async (action: 'save' | 'archive' | 'delete', e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      switch (action) {
        case 'save':
          await saveCard(card.id)
          break
        case 'archive':
          await archiveCard(card.id)
          break
        case 'delete':
          if (confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
            await deleteCard(card.id)
          }
          break
      }
    } catch (error) {
      console.error(`Error ${action}ing card:`, error)
      alert(`Failed to ${action} card. Please try again.`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className={`relative bg-white rounded border overflow-hidden ${
      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
    }`}>
      
      {/* Selection Checkbox */}
      {onToggleSelect && (isSelectionMode || isSelected) && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              onToggleSelect(card.id)
            }}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      )}
      
      {/* Card header */}
      <div className={`p-3 ${
        onToggleSelect && (isSelectionMode || isSelected) ? 'pl-10' : ''
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Expand/collapse button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="mt-1 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-gray-500" />
              ) : (
                <ChevronRight size={14} className="text-gray-500" />
              )}
            </button>
            
            {/* Card content */}
            <div className="flex-1 min-w-0">
              <h6 className="font-medium text-gray-900 text-sm truncate">{card.title}</h6>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{card.summary}</p>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="capitalize px-2 py-1 bg-gray-100 rounded">{card.category}</span>
                {card.credibility_score && (
                  <span>C: {card.credibility_score}/10</span>
                )}
                {card.relevance_score && (
                  <span>R: {card.relevance_score}/10</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-2">
            {/* Save card */}
            <button
              onClick={(e) => handleCardAction('save', e)}
              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="🎯 Lock and load this intel!"
            >
              <Save size={14} />
            </button>
            
            {/* Archive card */}
            <button
              onClick={(e) => handleCardAction('archive', e)}
              className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
              title="📦 Stash it away for later"
            >
              <Archive size={14} />
            </button>
            
            {/* Delete card */}
            <button
              onClick={(e) => handleCardAction('delete', e)}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="💥 DESTROY FOREVER (no takesies backsies!)"
            >
              <Trash2 size={14} />
            </button>
            
            {/* Remove from group */}
            <button
              onClick={(e) => onRemove(card.id, e)}
              className="p-1 text-orange-600 hover:bg-orange-50 rounded transition-colors"
              title="🚪 Kick it out of this group (card stays alive!)"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-3">
          <div className="space-y-3 text-xs">
            {/* Intelligence content */}
            <div>
              <h7 className="font-medium text-gray-700 block mb-1">Intelligence Content</h7>
              <p className="text-gray-600 leading-relaxed">{card.intelligence_content}</p>
            </div>
            
            {/* Key findings */}
            {card.key_findings && card.key_findings.length > 0 && (
              <div>
                <h7 className="font-medium text-gray-700 block mb-1">Key Findings</h7>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {card.key_findings.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Strategic implications */}
            {card.strategic_implications && (
              <div>
                <h7 className="font-medium text-gray-700 block mb-1">Strategic Implications</h7>
                <p className="text-gray-600">{card.strategic_implications}</p>
              </div>
            )}
            
            {/* Recommended actions */}
            {card.recommended_actions && (
              <div>
                <h7 className="font-medium text-gray-700 block mb-1">Recommended Actions</h7>
                <p className="text-gray-600">{card.recommended_actions}</p>
              </div>
            )}
            
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
              <div>
                <span className="font-medium text-gray-700">Source:</span>
                <p className="text-gray-600 mt-0.5">{card.source_reference || 'No source'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date Accessed:</span>
                <p className="text-gray-600 mt-0.5">
                  {card.date_accessed ? formatDate(card.date_accessed) : 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Tags */}
            {card.tags && card.tags.length > 0 && (
              <div>
                <span className="font-medium text-gray-700 block mb-1">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {card.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function GroupCard({
  group,
  isSelected = false,
  viewMode,
  onSelect,
  onEdit,
  onDelete,
  expandable = false,
  selectedCardIds = new Set<string>(),
  setSelectedCardIds,
  isSelectionMode = false,
  setIsSelectionMode
}: GroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [groupCards, setGroupCards] = useState<IntelligenceCard[]>([])
  const [loadingCards, setLoadingCards] = useState(false)
  const { getGroupCards, removeCardFromGroup } = useIntelligenceGroups()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const handleExpand = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!expandable) return
    
    if (!isExpanded && groupCards.length === 0) {
      setLoadingCards(true)
      try {
        const cards = await getGroupCards(group.id)
        setGroupCards(cards.map(gc => gc.intelligence_cards).filter(Boolean))
      } catch (error) {
        console.error('Error loading group cards:', error)
      } finally {
        setLoadingCards(false)
      }
    }
    setIsExpanded(!isExpanded)
  }

  const handleRemoveCard = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await removeCardFromGroup(group.id, cardId)
      setGroupCards(prev => prev.filter(card => card.id !== cardId))
    } catch (error) {
      console.error('Error removing card from group:', error)
      alert('Failed to remove card from group')
    }
  }

  const handleToggleCardSelect = (cardId: string) => {
    if (!setSelectedCardIds) return
    
    const newSelection = new Set(selectedCardIds)
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId)
      if (newSelection.size === 0) {
        setIsSelectionMode?.(false)
      }
    } else {
      newSelection.add(cardId)
      setIsSelectionMode?.(true)
    }
    setSelectedCardIds(newSelection)
  }

  const ExpandIcon = isExpanded ? ChevronDown : ChevronRight
  const FolderIcon = isExpanded ? FolderOpen : Folder

  if (viewMode === 'list') {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Main group row */}
        <div
          className={`flex items-center gap-4 p-4 transition-all cursor-pointer ${
            isSelected
              ? 'border-indigo-500 bg-indigo-50'
              : 'hover:border-gray-300 hover:bg-gray-50'
          }`}
          onClick={onSelect}
        >
          {/* Expand button */}
          {expandable && (
            <button
              onClick={handleExpand}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              disabled={loadingCards}
            >
              {loadingCards ? (
                <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ExpandIcon size={16} className="text-gray-500" />
              )}
            </button>
          )}

          {/* Color Icon */}
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: group.color + '20' }}
          >
            <FolderIcon size={20} style={{ color: group.color }} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{group.name}</h4>
            {group.description && (
              <p className="text-sm text-gray-600 mt-0.5">{group.description}</p>
            )}
          </div>

          {/* Metadata and Actions */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{group.card_count} cards</span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatDate(group.last_used_at)}
            </span>
            
            {/* Group Action buttons */}
            <div className="flex items-center gap-1 ml-2">
              {/* Edit group */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="✏️ Give this group a makeover!"
              >
                <Edit2 size={14} />
              </button>
              
              {/* Delete group */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="💣 Nuke this entire group (cards will survive!)"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded cards */}
        {isExpanded && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            {groupCards.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <FolderOpen size={32} className="mx-auto mb-2 text-gray-300" />
                <p>No cards in this group</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-medium text-gray-700">
                    Cards in {group.name} ({groupCards.length})
                  </h5>
                  
                  {/* Select all cards in group */}
                  {setSelectedCardIds && groupCards.length > 0 && (
                    <label className="flex items-center space-x-2 text-xs">
                      <input
                        type="checkbox"
                        checked={groupCards.every(card => selectedCardIds.has(card.id))}
                        ref={(el) => {
                          if (el) {
                            const selectedInGroup = groupCards.filter(card => selectedCardIds.has(card.id)).length
                            el.indeterminate = selectedInGroup > 0 && selectedInGroup < groupCards.length
                          }
                        }}
                        onChange={(e) => {
                          const newSelection = new Set(selectedCardIds)
                          if (e.target.checked) {
                            groupCards.forEach(card => newSelection.add(card.id))
                            setIsSelectionMode?.(true)
                          } else {
                            groupCards.forEach(card => newSelection.delete(card.id))
                            if (newSelection.size === 0) {
                              setIsSelectionMode?.(false)
                            }
                          }
                          setSelectedCardIds(newSelection)
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-600">Select all in group</span>
                    </label>
                  )}
                </div>
                
                {groupCards.map(card => (
                  <GroupCardItem
                    key={card.id}
                    card={card}
                    onRemove={handleRemoveCard}
                    isSelected={selectedCardIds.has(card.id)}
                    onToggleSelect={handleToggleCardSelect}
                    isSelectionMode={isSelectionMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Grid view
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Main group card */}
      <div
        className={`p-4 transition-all cursor-pointer ${
          isSelected
            ? 'border-indigo-500 bg-indigo-50'
            : 'hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={onSelect}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {expandable && (
              <button
                onClick={handleExpand}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                disabled={loadingCards}
              >
                {loadingCards ? (
                  <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ExpandIcon size={16} className="text-gray-500" />
                )}
              </button>
            )}
            
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: group.color + '20' }}
            >
              <FolderIcon size={20} style={{ color: group.color }} />
            </div>
          </div>
          
          {/* Group Action buttons */}
          <div className="flex items-center gap-1">
            {/* Edit group */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="✏️ Give this group a makeover!"
            >
              <Edit2 size={14} />
            </button>
            
            {/* Delete group */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="💣 Nuke this entire group (cards will survive!)"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <h4 className="font-medium text-gray-900 mb-1">{group.name}</h4>
        {group.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{group.card_count} cards</span>
          <span>{formatDate(group.last_used_at)}</span>
        </div>
      </div>

      {/* Expanded cards in grid */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          {groupCards.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <FolderOpen size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No cards in this group</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-gray-700">
                  Cards in {group.name} ({groupCards.length})
                </h5>
                
                {/* Select all cards in group */}
                {setSelectedCardIds && groupCards.length > 0 && (
                  <label className="flex items-center space-x-2 text-xs">
                    <input
                      type="checkbox"
                      checked={groupCards.every(card => selectedCardIds.has(card.id))}
                      ref={(el) => {
                        if (el) {
                          const selectedInGroup = groupCards.filter(card => selectedCardIds.has(card.id)).length
                          el.indeterminate = selectedInGroup > 0 && selectedInGroup < groupCards.length
                        }
                      }}
                      onChange={(e) => {
                        const newSelection = new Set(selectedCardIds)
                        if (e.target.checked) {
                          groupCards.forEach(card => newSelection.add(card.id))
                          setIsSelectionMode?.(true)
                        } else {
                          groupCards.forEach(card => newSelection.delete(card.id))
                          if (newSelection.size === 0) {
                            setIsSelectionMode?.(false)
                          }
                        }
                        setSelectedCardIds(newSelection)
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-600">Select all in group</span>
                  </label>
                )}
              </div>
              
              <div className="space-y-3">
                {groupCards.map(card => (
                  <GroupCardItem
                    key={card.id}
                    card={card}
                    onRemove={handleRemoveCard}
                    isSelected={selectedCardIds.has(card.id)}
                    onToggleSelect={handleToggleCardSelect}
                    isSelectionMode={isSelectionMode}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}