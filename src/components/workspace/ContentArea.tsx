'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
import { Plus } from 'lucide-react'
import MasterCard from '@/components/cards/MasterCard'
import { useCards } from '@/hooks/useCards'
import { CardData } from '@/types/card'

interface Blueprint {
  id: string
  name: string
  icon: string
  count: number
}

interface ContentAreaProps {
  blueprint?: Blueprint
  strategyId?: string
}

// Expose methods to parent component
export interface ContentAreaRef {
  createCard: (title?: string, description?: string) => Promise<void>
}

const ContentArea = forwardRef<ContentAreaRef, ContentAreaProps>(function ContentArea({ blueprint, strategyId }, ref) {
  const [availableCards, setAvailableCards] = useState<Array<{ id: string; title: string; cardType: string }>>([])
  
  // Always call useCards hook - conditional logic handled inside hook
  const cardsHook = useCards(strategyId ? Number(strategyId) : 0)
  const { cards = [], loading = false, error = null, createCard, updateCard, deleteCard, duplicateCard } = cardsHook || {}

  const handleCreateCard = useCallback(async (title?: string, description?: string) => {
    console.log('🎯 handleCreateCard called with:', { title, description });
    console.log('Blueprint:', blueprint);
    console.log('CreateCard function:', createCard);
    
    if (!createCard) {
      console.error('❌ No createCard function available');
      return;
    }

    if (!blueprint) {
      console.error('❌ No blueprint available');
      return;
    }

    const newCardData: Partial<CardData> = {
      title: title || `New ${blueprint.name} Card`,
      description: description || '',
      cardType: blueprint.id,
      priority: 'Medium',
      confidenceLevel: 'Medium',
      tags: [],
      relationships: []
    }

    console.log('📝 Creating card with data:', newCardData);
    
    try {
      await createCard(newCardData);
      console.log('✅ Card created successfully');
    } catch (error) {
      console.error('❌ Error creating card:', error);
    }
  }, [blueprint, createCard])

  // Expose createCard method to parent via ref
  useImperativeHandle(ref, () => ({
    createCard: handleCreateCard
  }), [handleCreateCard])

  // Prepare available cards for relationships
  useEffect(() => {
    if (cards.length > 0 && strategyId) {
      const cardOptions = cards.map(card => ({
        id: card.id,
        title: card.title,
        cardType: card.cardType
      }))
      setAvailableCards(cardOptions)
    }
  }, [cards, strategyId])

  if (!blueprint) return null

  // Filter cards by blueprint type
  const blueprintCards = cards.filter(card => card.cardType === blueprint.id)

  const handleUpdateCard = async (updatedCard: Partial<CardData>) => {
    if (!updateCard || !updatedCard.id) return
    await updateCard(updatedCard.id, updatedCard)
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!deleteCard) return
    if (confirm('Are you sure you want to delete this card?')) {
      await deleteCard(cardId)
    }
  }

  const handleDuplicateCard = async (cardId: string) => {
    if (!duplicateCard) return
    await duplicateCard(cardId)
  }

  const handleAIEnhance = async () => {
    // AI enhancement is handled within MasterCard component
    console.log('AI enhance triggered')
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 text-sm">
          Error loading cards: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Real Cards using MasterCard component */}
      <div className="space-y-4">
        {blueprintCards.map((card) => (
          <MasterCard
            key={card.id}
            cardData={card}
            onUpdate={handleUpdateCard}
            onDelete={() => handleDeleteCard(card.id)}
            onDuplicate={() => handleDuplicateCard(card.id)}
            onAIEnhance={handleAIEnhance}
            availableCards={availableCards}
          />
        ))}

        {/* Add New Card */}
        <div 
          className="card border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
          onClick={handleCreateCard}
        >
          <div className="flex items-center justify-center text-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                <Plus size={16} className="text-gray-400 group-hover:text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-700 group-hover:text-gray-800 text-sm">
                  Add New Card
                </h3>
                <p className="text-xs text-gray-500 group-hover:text-gray-600">
                  Create a new {blueprint.name.toLowerCase()} card
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

ContentArea.displayName = 'ContentArea'
export default ContentArea
