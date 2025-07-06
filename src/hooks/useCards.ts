import { useState, useEffect, useCallback } from 'react'
import { CardData } from '@/types/card'
import CardService from '@/services/cardService'

interface UseCardsResult {
  cards: CardData[]
  loading: boolean
  error: string | null
  createCard: (cardData: Partial<CardData>) => Promise<CardData | null>
  updateCard: (cardId: string, updates: Partial<CardData>) => Promise<CardData | null>
  deleteCard: (cardId: string) => Promise<boolean>
  duplicateCard: (cardId: string) => Promise<CardData | null>
  refreshCards: () => Promise<void>
}

export function useCards(strategyId: number): UseCardsResult {  // FIXED: Changed to number
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load cards from database
  const loadCards = useCallback(async () => {
    if (!strategyId) return

    try {
      setLoading(true)
      setError(null)
      const fetchedCards = await CardService.getCardsForStrategy(strategyId)
      setCards(fetchedCards)
    } catch (err) {
      console.error('Failed to load cards:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cards')
    } finally {
      setLoading(false)
    }
  }, [strategyId])

  // Initial load
  useEffect(() => {
    loadCards()
  }, [loadCards])

  // Create a new card
  const createCard = useCallback(async (cardData: Partial<CardData>): Promise<CardData | null> => {
    try {
      setError(null)
      const newCard = await CardService.createCard(strategyId, cardData)
      setCards(prev => [newCard, ...prev]) // Add to beginning of list
      return newCard
    } catch (err) {
      console.error('Failed to create card:', err)
      setError(err instanceof Error ? err.message : 'Failed to create card')
      return null
    }
  }, [strategyId])

  // Update an existing card
  const updateCard = useCallback(async (cardId: string, updates: Partial<CardData>): Promise<CardData | null> => {
    try {
      setError(null)
      const updatedCard = await CardService.updateCard(cardId, updates)
      setCards(prev => prev.map(card => 
        card.id === cardId ? updatedCard : card
      ))
      return updatedCard
    } catch (err) {
      console.error('Failed to update card:', err)
      setError(err instanceof Error ? err.message : 'Failed to update card')
      return null
    }
  }, [])

  // Delete a card
  const deleteCard = useCallback(async (cardId: string): Promise<boolean> => {
    try {
      setError(null)
      await CardService.deleteCard(cardId)
      setCards(prev => prev.filter(card => card.id !== cardId))
      return true
    } catch (err) {
      console.error('Failed to delete card:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete card')
      return false
    }
  }, [])

  // Duplicate a card
  const duplicateCard = useCallback(async (cardId: string): Promise<CardData | null> => {
    try {
      setError(null)
      const duplicatedCard = await CardService.duplicateCard(cardId)
      setCards(prev => [duplicatedCard, ...prev]) // Add to beginning of list
      return duplicatedCard
    } catch (err) {
      console.error('Failed to duplicate card:', err)
      setError(err instanceof Error ? err.message : 'Failed to duplicate card')
      return null
    }
  }, [])

  // Refresh cards manually
  const refreshCards = useCallback(async () => {
    await loadCards()
  }, [loadCards])

  return {
    cards,
    loading,
    error,
    createCard,
    updateCard,
    deleteCard,
    duplicateCard,
    refreshCards
  }
}