'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { CardData } from '@/types/card'
import IntelligenceCardPreview from './IntelligenceCardPreview'
import IntelligenceCardModal from './IntelligenceCardModal'
import { Loader2, Plus, LayoutGrid, LayoutList, Square, Maximize2 } from 'lucide-react'

interface IntelligenceCardGridProps {
  cards: CardData[]
  onCreateCard?: () => Promise<void>
  onUpdateCard?: (id: string, updates: Partial<CardData>) => Promise<void>
  onDeleteCard?: (id: string) => Promise<void>
  searchQuery?: string
  selectedCardIds?: Set<string>
  onSelectCard?: (cardId: string) => void
  viewMode?: 'grid' | 'list'
  loading?: boolean
}

type ViewDensity = 'compact' | 'comfortable' | 'expanded'

export default function IntelligenceCardGrid({
  cards,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  searchQuery = '',
  selectedCardIds = new Set<string>(),
  onSelectCard,
  viewMode = 'grid',
  loading = false
}: IntelligenceCardGridProps) {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewDensity, setViewDensity] = useState<ViewDensity>('comfortable')
  
  // Update selectedCard when the cards array changes (after save)
  useEffect(() => {
    if (selectedCard) {
      const updatedCard = cards.find(c => c.id === selectedCard.id)
      if (updatedCard) {
        setSelectedCard(updatedCard)
      }
    }
  }, [cards, selectedCard?.id])
  
  // Filter cards based on search query
  const filteredCards = useMemo(() => {
    if (!searchQuery) return cards
    
    const query = searchQuery.toLowerCase()
    return cards.filter(card => 
      card.title.toLowerCase().includes(query) ||
      (card.description && card.description.toLowerCase().includes(query)) ||
      (card.card_data?.intelligence_content && card.card_data.intelligence_content.toLowerCase().includes(query)) ||
      (card.intelligence_content && card.intelligence_content.toLowerCase().includes(query))
    )
  }, [cards, searchQuery])
  
  // Handle card click
  const handleCardClick = useCallback((card: CardData) => {
    setSelectedCard(card)
    setModalOpen(true)
  }, [])
  
  // Handle modal close
  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    // Keep selectedCard for animation purposes
    setTimeout(() => setSelectedCard(null), 300)
  }, [])
  
  // Handle card selection for bulk operations
  const handleCardSelect = useCallback((cardId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    onSelectCard?.(cardId)
  }, [onSelectCard])
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if no modal is open
      if (modalOpen) return
      
      // Density shortcuts
      if (e.key === '1' && e.ctrlKey) {
        setViewDensity('compact')
      } else if (e.key === '2' && e.ctrlKey) {
        setViewDensity('comfortable')
      } else if (e.key === '3' && e.ctrlKey) {
        setViewDensity('expanded')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalOpen])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading intelligence cards...</p>
        </div>
      </div>
    )
  }
  
  if (filteredCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <button
          onClick={onCreateCard}
          className="max-w-md p-8 border-2 border-dashed border-gray-300 rounded-lg text-center space-y-3 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Add New Intelligence</div>
            <div className="text-xs text-gray-500">
              {searchQuery
                ? 'No cards match your search'
                : 'Create your first intelligence card'}
            </div>
          </div>
        </button>
      </div>
    )
  }
  
  // Grid layout classes based on view mode and density
  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'grid grid-cols-1 gap-4 items-start auto-rows-min'
    }
    
    switch (viewDensity) {
      case 'compact':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start auto-rows-min'
      case 'expanded':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start auto-rows-min'
      default: // comfortable
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start auto-rows-min'
    }
  }
  
  return (
    <div className="px-6">
      {/* Density Controls */}
      <div className="flex items-center justify-end gap-2 mb-6">
        <span className="text-xs text-gray-500 mr-2">View Density:</span>
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewDensity('compact')}
            className={`p-1.5 rounded transition-colors ${
              viewDensity === 'compact'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Compact view (Ctrl+1)"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewDensity('comfortable')}
            className={`p-1.5 rounded transition-colors ${
              viewDensity === 'comfortable'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Comfortable view (Ctrl+2)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewDensity('expanded')}
            className={`p-1.5 rounded transition-colors ${
              viewDensity === 'expanded'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Expanded view (Ctrl+3)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Card Grid */}
      <div className={`${getGridClasses()} max-w-[1200px] mx-auto`}>
        {filteredCards.map((card) => (
          <IntelligenceCardPreview
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card)}
            isSelected={selectedCardIds.has(card.id)}
            onSelect={(e) => handleCardSelect(card.id, e)}
            viewDensity={viewDensity}
          />
        ))}
      </div>
      
      {/* Modal */}
      <IntelligenceCardModal
        card={selectedCard}
        isOpen={modalOpen}
        onClose={handleModalClose}
        onUpdate={onUpdateCard || (async () => {})}
        onDelete={onDeleteCard || (async () => {})}
      />
    </div>
  )
}