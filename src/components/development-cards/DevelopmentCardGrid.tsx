'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { CardData } from '@/types/card'
import DevelopmentCardPreview from './DevelopmentCardPreview'
import DevelopmentCardModal from './DevelopmentCardModal'
import { Loader2, Plus, LayoutGrid, LayoutList, Square, Maximize2 } from 'lucide-react'

interface DevelopmentCardGridProps {
  cards: CardData[]
  onCreateCard?: () => Promise<void>
  onUpdateCard?: (id: string, updates: Partial<CardData>) => Promise<void>
  onDeleteCard?: (id: string) => Promise<void>
  searchQuery?: string
  selectedCardIds?: Set<string>
  onSelectCard?: (cardId: string) => void
  viewMode?: 'grid' | 'list'
  loading?: boolean
  currentStrategyId?: string
}

type ViewDensity = 'compact' | 'comfortable' | 'expanded'

export default function DevelopmentCardGrid({
  cards,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  searchQuery = '',
  selectedCardIds = new Set<string>(),
  onSelectCard,
  viewMode = 'grid',
  loading = false,
  currentStrategyId
}: DevelopmentCardGridProps) {
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
      (card.card_data?.product_vision && card.card_data.product_vision.toLowerCase().includes(query)) ||
      (card.card_data?.system_overview && card.card_data.system_overview.toLowerCase().includes(query)) ||
      (card.card_data?.stack_name && card.card_data.stack_name.toLowerCase().includes(query))
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
  
  // Handle card update
  const handleCardUpdate = useCallback(async (id: string, updates: Partial<CardData>) => {
    if (onUpdateCard) {
      await onUpdateCard(id, updates)
    }
  }, [onUpdateCard])
  
  // Handle card delete
  const handleCardDelete = useCallback(async (id: string) => {
    if (onDeleteCard) {
      await onDeleteCard(id)
    }
  }, [onDeleteCard])
  
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
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading development cards...</span>
        </div>
      </div>
    )
  }
  
  if (filteredCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No development cards found</h3>
          <p className="text-sm mb-4">
            {searchQuery 
              ? `No cards match "${searchQuery}". Try a different search term.`
              : "Get started by creating your first development card."
            }
          </p>
          {onCreateCard && (
            <button
              onClick={onCreateCard}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Development Card
            </button>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <>
      {/* View Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'}
          </span>
          {searchQuery && (
            <span className="text-sm text-gray-500">
              matching "{searchQuery}"
            </span>
          )}
        </div>
        
        {/* Density Controls */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewDensity('compact')}
            className={`p-1.5 rounded-md transition-colors ${
              viewDensity === 'compact' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Compact view (Ctrl+1)"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewDensity('comfortable')}
            className={`p-1.5 rounded-md transition-colors ${
              viewDensity === 'comfortable' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Comfortable view (Ctrl+2)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewDensity('expanded')}
            className={`p-1.5 rounded-md transition-colors ${
              viewDensity === 'expanded' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Expanded view (Ctrl+3)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Cards Grid */}
      <div className={`
        grid gap-4 auto-rows-max
        ${viewMode === 'grid' 
          ? viewDensity === 'compact' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
            : viewDensity === 'expanded'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1'
        }
      `}>
        {filteredCards.map((card) => (
          <DevelopmentCardPreview
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
      <DevelopmentCardModal
        card={selectedCard}
        isOpen={modalOpen}
        onClose={handleModalClose}
        onUpdate={handleCardUpdate}
        onDelete={handleCardDelete}
        currentStrategyId={currentStrategyId}
      />
    </>
  )
}