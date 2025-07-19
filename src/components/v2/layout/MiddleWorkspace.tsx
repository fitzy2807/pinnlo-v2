'use client'

import { useState, useEffect } from 'react'
import CardStack from '../workspace/CardStack'
import CardPreview from '../workspace/CardPreview'
import { useCards } from '@/hooks/useCards'
import { useBlueprintCards } from '@/hooks/useBlueprintCards'
import { useIntelligenceCards } from '@/hooks/useIntelligenceCards'
import { getSectionFromCardType, getCardTypeForSection } from '@/utils/blueprintConstants'

interface MiddleWorkspaceProps {
  selectedHub: string
  selectedSection: string
  selectedCard: string | null
  onCardSelect: (cardId: string) => void
  strategy: any
}

export default function MiddleWorkspace({ 
  selectedHub, 
  selectedSection, 
  selectedCard, 
  onCardSelect,
  strategy 
}: MiddleWorkspaceProps) {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load cards from appropriate hook based on selected hub
  const { cards: allCards } = useCards(strategy.id)
  const { cards: blueprintCards } = useBlueprintCards(strategy.id)
  const { cards: intelligenceCards } = useIntelligenceCards()

  useEffect(() => {
    setLoading(true)
    
    // Filter cards based on selected hub and section
    let filteredCards: any[] = []
    
    if (selectedHub === 'intelligence') {
      filteredCards = intelligenceCards.filter(card => 
        card.category === selectedSection || card.cardType === selectedSection
      )
    } else if (selectedHub === 'strategy') {
      // Use registry-based mapping for consistency
      const cardType = getCardTypeForSection(selectedSection)
      filteredCards = blueprintCards.filter(card => card.cardType === cardType)
    } else if (selectedHub === 'development') {
      // Use registry-based mapping for consistency
      const cardType = getCardTypeForSection(selectedSection)
      filteredCards = allCards.filter(card => card.cardType === cardType)
    } else {
      // For other hubs, show all cards for now
      filteredCards = allCards
    }

    setCards(filteredCards)
    setLoading(false)
    
    // Auto-select first card if none selected
    if (!selectedCard && filteredCards.length > 0) {
      onCardSelect(filteredCards[0].id)
    }
  }, [selectedHub, selectedSection, allCards, blueprintCards, intelligenceCards, selectedCard, onCardSelect])

  const currentCard = cards.find(card => card.id === selectedCard)

  return (
    <div className="h-full flex">
      {/* Left Side - Card Stack (50% of middle workspace) */}
      <div className="w-1/2 border-r border-gray-200">
        <CardStack
          cards={cards}
          loading={loading}
          selectedCard={selectedCard}
          onCardSelect={onCardSelect}
          selectedHub={selectedHub}
          selectedSection={selectedSection}
        />
      </div>

      {/* Right Side - Card Preview (50% of middle workspace) */}
      <div className="w-1/2">
        <CardPreview
          card={currentCard}
          selectedHub={selectedHub}
          selectedSection={selectedSection}
          onCardUpdate={(updatedCard) => {
            setCards(cards.map(card => 
              card.id === updatedCard.id ? updatedCard : card
            ))
          }}
        />
      </div>
    </div>
  )
}