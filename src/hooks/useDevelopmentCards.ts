import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Development-specific card types
const DEVELOPMENT_CARD_TYPES = [
  'prd', // Add PRD card type
  'technical-requirement-structured',
  'technical-requirement', 
  'trd', // Add TRD card type
  'feature',
  'tech-stack',
  'task-list'
] as const

interface DevelopmentCard {
  id: string
  strategy_id: number
  title: string
  description: string | null
  card_type: string
  priority: string
  confidence_level: string
  priority_rationale: string | null
  confidence_rationale: string | null
  strategic_alignment: string | null
  tags: any[]
  relationships: any[]
  card_data: any
  created_at: string
  updated_at: string
  created_by: string
  group_ids: string[]
}

interface CreateCardData {
  title: string
  description?: string
  card_type: string
  priority?: string
  confidence_level?: string
  priority_rationale?: string
  confidence_rationale?: string
  strategic_alignment?: string
  tags?: any[]
  relationships?: any[]
  card_data?: any
  group_ids?: string[]
}

export function useDevelopmentCards(strategyId?: number) {
  const [cards, setCards] = useState<DevelopmentCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load cards for development context
  const loadCards = useCallback(async () => {
    if (!strategyId) {
      setCards([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('strategy_id', strategyId)
        .in('card_type', DEVELOPMENT_CARD_TYPES)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Ensure all cards have proper structure for Template Bank compatibility
      const processedCards = (data || []).map(card => ({
        ...card,
        description: card.description || '',
        priority: card.priority || 'Medium',
        confidence_level: card.confidence_level || 'Medium',
        priority_rationale: card.priority_rationale || '',
        confidence_rationale: card.confidence_rationale || '',
        strategic_alignment: card.strategic_alignment || '',
        tags: Array.isArray(card.tags) ? card.tags : [],
        relationships: Array.isArray(card.relationships) ? card.relationships : [],
        card_data: card.card_data || {},
        group_ids: Array.isArray(card.group_ids) ? card.group_ids : []
      }))

      setCards(processedCards)
    } catch (err) {
      console.error('Failed to load development cards:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cards')
    } finally {
      setLoading(false)
    }
  }, [strategyId])

  // Create new development card
  const createCard = useCallback(async (cardData: CreateCardData) => {
    if (!strategyId) {
      throw new Error('Strategy ID is required')
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Auth user:', user ? 'found' : 'not found', user?.id)

      const newCard = {
        strategy_id: strategyId,
        created_by: user?.id || 'system', // Fallback to 'system' if no user
        title: cardData.title,
        description: cardData.description || '',
        card_type: cardData.card_type,
        priority: cardData.priority || 'Medium',
        confidence_level: cardData.confidence_level || 'Medium',
        priority_rationale: cardData.priority_rationale || '',
        confidence_rationale: cardData.confidence_rationale || '',
        strategic_alignment: cardData.strategic_alignment || '',
        tags: cardData.tags || [],
        relationships: cardData.relationships || [],
        card_data: cardData.card_data || {},
        group_ids: cardData.group_ids || []
      }

      console.log('Attempting to insert card:', newCard)

      const { data, error } = await supabase
        .from('cards')
        .insert(newCard)
        .select()
        .single()

      if (error) {
        console.error('Database error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      // Add to local state
      setCards(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Failed to create development card:', err)
      throw err
    }
  }, [strategyId])

  // Update existing card
  const updateCard = useCallback(async (cardId: string, updates: Partial<DevelopmentCard>) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', cardId)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setCards(prev => prev.map(card => card.id === cardId ? data : card))
      return data
    } catch (err) {
      console.error('Failed to update development card:', err)
      throw err
    }
  }, [])

  // Delete card
  const deleteCard = useCallback(async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId)

      if (error) throw error

      // Remove from local state
      setCards(prev => prev.filter(card => card.id !== cardId))
      return true
    } catch (err) {
      console.error('Failed to delete development card:', err)
      throw err
    }
  }, [])

  // Get cards by type for section filtering
  const getCardsByType = useCallback((cardType: string) => {
    return cards.filter(card => card.card_type === cardType)
  }, [cards])

  // Get cards by section (for Template Bank compatibility)
  const getCardsBySection = useCallback((section: string) => {
    // Map sections to card types for development context
    const sectionTypeMap: Record<string, string[]> = {
      'prd': ['prd'], // PRD mapping
      'tech-stack': ['tech-stack'],
      'technical-requirements': ['technical-requirement-structured', 'technical-requirement', 'trd'],
      'task-lists': ['task-list'],
      // Template Bank compatibility mapping
      'section1': ['prd'], // Changed from 'feature' to 'prd'
      'section2': ['tech-stack'], 
      'section3': ['technical-requirement-structured', 'technical-requirement', 'trd'],
      'section4': ['task-list'],
      'section5': ['technical-requirement-structured', 'technical-requirement', 'trd'],
      'section6': ['technical-requirement-structured', 'technical-requirement', 'trd'],
      'section7': ['technical-requirement-structured', 'technical-requirement', 'trd'],
      'section8': ['technical-requirement-structured', 'technical-requirement', 'trd']
    }

    const cardTypes = sectionTypeMap[section] || []
    return cards.filter(card => cardTypes.includes(card.card_type))
  }, [cards])

  // Get section counts for sidebar display
  const getSectionCounts = useCallback(() => {
    return {
      prd: getCardsByType('prd').length, // Changed from 'feature' to 'prd'
      'tech-stack': getCardsByType('tech-stack').length,
      'technical-requirements': getCardsByType('technical-requirement-structured').length + 
                               getCardsByType('technical-requirement').length + 
                               getCardsByType('trd').length,
      'task-lists': getCardsByType('task-list').length,
      // Template Bank compatibility
      section1: getCardsByType('prd').length, // Changed from 'feature' to 'prd'
      section2: getCardsByType('tech-stack').length,
      section3: getCardsByType('technical-requirement-structured').length + 
               getCardsByType('technical-requirement').length + 
               getCardsByType('trd').length,
      section4: getCardsByType('task-list').length,
      section5: 0,
      section6: 0,
      section7: 0,
      section8: 0
    }
  }, [getCardsByType])

  // Load cards on mount
  useEffect(() => {
    loadCards()
  }, [loadCards])

  return {
    // Data
    cards,
    loading,
    error,

    // Filtered data
    getCardsByType,
    getCardsBySection,
    getSectionCounts,

    // CRUD operations
    createCard,
    updateCard,
    deleteCard,

    // Utility
    refetch: loadCards,

    // Development-specific helpers
    technicalRequirements: [
      ...getCardsByType('technical-requirement-structured'),
      ...getCardsByType('technical-requirement'),
      ...getCardsByType('trd')
    ],
    features: getCardsByType('feature'),
    techStackCards: getCardsByType('tech-stack'),
    taskLists: getCardsByType('task-list')
  }
}