'use client'

import React from 'react'
import IntelligenceCardGrid from './IntelligenceCardGrid'
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
  // Use the new IntelligenceCardGrid component
  return (
    <IntelligenceCardGrid
      cards={cards}
      onCreateCard={onCreateCard}
      onUpdateCard={onUpdateCard}
      onDeleteCard={onDeleteCard}
      searchQuery={searchQuery}
      selectedCardIds={selectedCardIds}
      onSelectCard={onSelectCard}
      viewMode={viewMode}
      loading={false}
    />
  )
}