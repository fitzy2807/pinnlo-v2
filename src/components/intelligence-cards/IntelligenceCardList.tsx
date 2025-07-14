'use client'

import React, { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import MasterCard from '../cards/MasterCard'
import { CardData } from '@/types/card'

interface IntelligenceCardListProps {
  cards: CardData[]
  onEditCard?: (card: CardData) => void
  onUpdateCard?: (id: string, updates: Partial<CardData>) => Promise<void>
  onDeleteCard?: (id: string) => Promise<void>
  onCreateCard?: () => Promise<void>
  onRefresh?: () => void
  viewMode?: 'list' | 'grid'
  searchQuery?: string
  selectedCardIds?: Set<string>
  onSelectCard?: (cardId: string) => void
}

export default function IntelligenceCardList({
  cards,
  onEditCard,
  onUpdateCard,
  onDeleteCard,
  onCreateCard,
  onRefresh,
  viewMode = 'grid',
  searchQuery = '',
  selectedCardIds = new Set<string>(),
  onSelectCard
}: IntelligenceCardListProps) {
  const [loading] = useState(false)
  
  // Filter cards based on search query
  const filteredCards = React.useMemo(() => {
    if (!searchQuery) return cards
    
    const query = searchQuery.toLowerCase()
    return cards.filter(card => 
      card.title.toLowerCase().includes(query) ||
      (card.description && card.description.toLowerCase().includes(query)) ||
      (card.card_data?.intelligence_content && card.card_data.intelligence_content.toLowerCase().includes(query))
    )
  }, [cards, searchQuery])

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

  return (
    <div className="space-y-4">
      {/* Cards Display */}
      {filteredCards.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <button
            onClick={onCreateCard}
            className="max-w-md p-8 border-2 border-dashed border-gray-300 rounded-lg text-center space-y-3 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Add New Card</div>
              <div className="text-xs text-gray-500">
                {searchQuery
                  ? 'No cards match your search'
                  : 'Create a new intelligence card'}
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredCards.map((card) => (
            <div key={card.id} className="relative">
              <MasterCard 
                cardData={card}
                isSelected={selectedCardIds.has(card.id)}
                onSelect={() => onSelectCard?.(card.id)}
                onUpdate={async (updates) => {
                  if (onUpdateCard) {
                    await onUpdateCard(card.id, updates)
                  }
                }}
                onDelete={async () => {
                  if (onDeleteCard) {
                    const confirmed = window.confirm('Are you sure you want to delete this card?')
                    if (confirmed) {
                      await onDeleteCard(card.id)
                    }
                  }
                }}
                onDuplicate={() => {
                  // Create a duplicate card
                  if (onEditCard) {
                    const duplicatedCard = {
                      ...card,
                      id: '',
                      title: `${card.title} (Copy)`,
                      createdDate: new Date().toISOString(),
                      lastModified: new Date().toISOString()
                    }
                    onEditCard(duplicatedCard)
                  }
                }}
                onAIEnhance={() => {
                  console.log('AI enhance card:', card.id)
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}