'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CardData } from '@/types/card'
import { toast } from 'react-hot-toast'

// Intelligence blueprint types mapped from old categories
const INTELLIGENCE_BLUEPRINT_MAP: Record<string, string> = {
  'market': 'market-intelligence',
  'competitor': 'competitor-intelligence',
  'trends': 'trends-intelligence',
  'technology': 'technology-intelligence',
  'stakeholder': 'stakeholder-intelligence',
  'consumer': 'consumer-intelligence',
  'risk': 'risk-intelligence',
  'opportunities': 'opportunities-intelligence'
}

export function useIntelligenceBankCards() {
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch cards that use intelligence blueprints
  const fetchCards = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get Intelligence Hub strategy ID
      const strategyId = await getOrCreateIntelligenceStrategy(user.id)

      // Get all intelligence blueprint card types
      const blueprintTypes = Object.values(INTELLIGENCE_BLUEPRINT_MAP)
      
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('strategy_id', strategyId)
        .in('card_type', blueprintTypes)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform database fields to match CardData interface
      const transformedCards = (data || []).map(card => ({
        ...card,
        cardType: card.card_type, // Map card_type to cardType
        tags: card.card_data?.tags || [],
        relationships: card.card_data?.relationships || [],
        strategicAlignment: card.card_data?.strategicAlignment || '',
        createdDate: card.created_at,
        lastModified: card.updated_at,
        creator: card.card_data?.creator || '',
        owner: card.card_data?.owner || '',
        confidenceLevel: card.card_data?.confidenceLevel || 'Medium',
        priorityRationale: card.card_data?.priorityRationale || '',
        confidenceRationale: card.card_data?.confidenceRationale || ''
      }))
      
      setCards(transformedCards)
    } catch (error) {
      console.error('Error fetching intelligence cards:', error)
      setError('Failed to load intelligence cards')
      toast.error('Failed to load intelligence cards')
    } finally {
      setLoading(false)
    }
  }

  // Get cards by category (for backward compatibility)
  const getCardsByCategory = (category: string) => {
    const blueprintType = INTELLIGENCE_BLUEPRINT_MAP[category]
    if (!blueprintType) return []
    return cards.filter(card => card.card_type === blueprintType)
  }

  // Get cards by status (saved/archived)
  const getCardsByStatus = (status: 'saved' | 'archived') => {
    return cards.filter(card => card.card_data?.[status] === true)
  }

  // Get category counts
  const getCategoryCounts = () => {
    const counts: Record<string, number> = {}
    
    Object.entries(INTELLIGENCE_BLUEPRINT_MAP).forEach(([category, blueprintType]) => {
      counts[category] = cards.filter(card => card.card_type === blueprintType).length
    })
    
    return counts
  }

  // Get status counts
  const getStatusCounts = () => {
    return {
      saved: cards.filter(card => card.card_data?.saved === true).length,
      archived: cards.filter(card => card.card_data?.archived === true).length
    }
  }

  // Get or create Intelligence Hub strategy
  const getOrCreateIntelligenceStrategy = async (userId: string) => {
    // First, try to find existing Intelligence Hub strategy
    const { data: existingStrategy } = await supabase
      .from('strategies')
      .select('id')
      .eq('"userId"', userId)
      .eq('title', 'Intelligence Hub')
      .single()

    if (existingStrategy) {
      return existingStrategy.id
    }

    // Create new Intelligence Hub strategy
    const { data: newStrategy, error } = await supabase
      .from('strategies')
      .insert({
        "userId": userId,
        title: 'Intelligence Hub',
        description: 'Central hub for all intelligence cards',
        visibility: 'private',
        status: 'active'
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating Intelligence Hub strategy:', error)
      throw new Error('Failed to create Intelligence Hub strategy')
    }

    return newStrategy.id
  }

  // Create a new intelligence card
  const createCard = async (cardData: Partial<CardData>) => {
    console.log('=== createCard Hook START ===')
    console.log('Input cardData:', cardData)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('User from auth:', user?.id)
      if (!user) throw new Error('Not authenticated')

      // Get or create Intelligence Hub strategy
      const strategyId = await getOrCreateIntelligenceStrategy(user.id)
      console.log('Strategy ID for intelligence cards:', strategyId)

      // Extract intelligence-specific data
      const { title, description, priority, cardType, card_type, card_data, ...otherFields } = cardData

      const dbInsertData = {
        strategy_id: strategyId,
        created_by: user.id,
        title: title || 'Untitled Intelligence',
        description: description || '',
        card_type: card_type || cardType || 'market-intelligence',
        priority: priority?.toLowerCase() || 'medium',
        card_data: card_data || otherFields || {}
      }
      
      console.log('DB Insert Data:', dbInsertData)

      const { data, error } = await supabase
        .from('cards')
        .insert(dbInsertData)
        .select()
        .single()

      console.log('Supabase response - data:', data)
      console.log('Supabase response - error:', error)
      
      if (error) throw error

      // Transform the created card to match CardData interface
      const transformedCard = {
        ...data,
        cardType: data.card_type,
        tags: data.card_data?.tags || [],
        relationships: data.card_data?.relationships || [],
        strategicAlignment: data.card_data?.strategicAlignment || '',
        createdDate: data.created_at,
        lastModified: data.updated_at,
        creator: data.card_data?.creator || '',
        owner: data.card_data?.owner || '',
        confidenceLevel: data.card_data?.confidenceLevel || 'Medium',
        priorityRationale: data.card_data?.priorityRationale || '',
        confidenceRationale: data.card_data?.confidenceRationale || ''
      }

      setCards([transformedCard, ...cards])
      toast.success('Card created successfully')
      return { success: true, data: transformedCard }
    } catch (error) {
      console.error('Error creating card:', error)
      toast.error('Failed to create card')
      return { success: false, error: error.message }
    }
  }

  // Update an intelligence card
  const updateCard = async (id: string, updates: Partial<CardData>) => {
    try {
      // Transform CardData fields back to database fields
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      }
      
      // Map direct fields
      if (updates.title !== undefined) dbUpdates.title = updates.title
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority
      if (updates.cardType !== undefined) dbUpdates.card_type = updates.cardType
      
      // Map fields that go into card_data
      const cardDataUpdates: any = {}
      if (updates.tags !== undefined) cardDataUpdates.tags = updates.tags
      if (updates.relationships !== undefined) cardDataUpdates.relationships = updates.relationships
      if (updates.strategicAlignment !== undefined) cardDataUpdates.strategicAlignment = updates.strategicAlignment
      if (updates.confidenceLevel !== undefined) cardDataUpdates.confidenceLevel = updates.confidenceLevel
      if (updates.priorityRationale !== undefined) cardDataUpdates.priorityRationale = updates.priorityRationale
      if (updates.confidenceRationale !== undefined) cardDataUpdates.confidenceRationale = updates.confidenceRationale
      if (updates.creator !== undefined) cardDataUpdates.creator = updates.creator
      if (updates.owner !== undefined) cardDataUpdates.owner = updates.owner
      
      // Merge with existing card_data
      const existingCard = cards.find(c => c.id === id)
      if (existingCard) {
        dbUpdates.card_data = {
          ...existingCard.card_data,
          ...cardDataUpdates
        }
      }
      
      const { error } = await supabase
        .from('cards')
        .update(dbUpdates)
        .eq('id', id)

      if (error) throw error

      setCards(cards.map(card => 
        card.id === id ? { ...card, ...updates } : card
      ))
      
      toast.success('Card updated successfully')
      return { success: true }
    } catch (error) {
      console.error('Error updating card:', error)
      toast.error('Failed to update card')
      return { success: false, error: error.message }
    }
  }

  // Delete an intelligence card
  const deleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCards(cards.filter(card => card.id !== id))
      toast.success('Card deleted successfully')
    } catch (error) {
      console.error('Error deleting card:', error)
      toast.error('Failed to delete card')
      throw error
    }
  }

  // Toggle saved status
  const toggleSaved = async (id: string) => {
    const card = cards.find(c => c.id === id)
    if (!card) return

    const newSaved = !card.card_data?.saved
    
    return updateCard(id, {
      card_data: {
        ...card.card_data,
        saved: newSaved
      }
    })
  }

  // Toggle archived status
  const toggleArchived = async (id: string) => {
    const card = cards.find(c => c.id === id)
    if (!card) return

    const newArchived = !card.card_data?.archived
    
    return updateCard(id, {
      card_data: {
        ...card.card_data,
        archived: newArchived
      }
    })
  }

  useEffect(() => {
    fetchCards()
  }, [])

  return {
    cards,
    loading,
    error,
    refetch: fetchCards,
    getCardsByCategory,
    getCardsByStatus,
    getCategoryCounts,
    getStatusCounts,
    createCard,
    updateCard,
    deleteCard,
    toggleSaved,
    toggleArchived
  }
}