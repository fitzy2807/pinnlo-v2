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

// Card types that the automation system might create (without -intelligence suffix)
const AUTOMATION_CARD_TYPES: Record<string, string> = {
  'market': 'market',
  'competitor': 'competitor',
  'trends': 'trends',
  'technology': 'technology',
  'stakeholder': 'stakeholder',
  'consumer': 'consumer',
  'risk': 'risk',
  'opportunities': 'opportunities'
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

      // Get all intelligence blueprint card types (both formats)
      const blueprintTypes = [
        ...Object.values(INTELLIGENCE_BLUEPRINT_MAP),
        ...Object.values(AUTOMATION_CARD_TYPES)
      ]
      console.log('Looking for card types:', blueprintTypes)
      
      // First, let's see ALL intelligence cards for this user to debug
      const { data: allIntelligenceCards, error: allCardsError } = await supabase
        .from('intelligence_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      console.log('ALL intelligence cards for user:', allIntelligenceCards?.map(c => ({ id: c.id, title: c.title, category: c.category, created_at: c.created_at })))
      console.log('Unique categories in intelligence_cards:', [...new Set(allIntelligenceCards?.map(c => c.category) || [])])
      
      // Fetch intelligence cards from the correct table
      const { data, error } = await supabase
        .from('intelligence_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log('All intelligence cards:', data?.map(c => ({ id: c.id, title: c.title, category: c.category })))
      
      if (error) throw error
      
      // Transform intelligence_cards fields to match CardData interface
      const transformedCards = (data || []).map(card => ({
        ...card,
        cardType: `${card.category}-intelligence`, // Map category to cardType format
        card_type: `${card.category}-intelligence`, // Also set card_type for compatibility
        description: card.summary, // Map summary to description
        tags: card.tags || [],
        relationships: [], // Intelligence cards don't have relationships
        strategicAlignment: card.strategic_implications || '',
        createdDate: card.created_at,
        lastModified: card.updated_at,
        creator: '',
        owner: '',
        priority: 'Medium', // Default priority for intelligence cards
        confidenceLevel: 'Medium', // Default confidence
        priorityRationale: '',
        confidenceRationale: '',
        // Intelligence-specific fields
        intelligence_content: card.intelligence_content,
        key_findings: card.key_findings || [],
        credibility_score: card.credibility_score || 5,
        relevance_score: card.relevance_score || 5,
        source_reference: card.source_reference || '',
        recommended_actions: card.recommended_actions || ''
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
    const automationType = AUTOMATION_CARD_TYPES[category]
    if (!blueprintType && !automationType) return []
    
    return cards.filter(card => 
      card.card_type === blueprintType || 
      card.card_type === automationType ||
      card.card_type === category // Direct match
    )
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

  // Get or create global Intelligence strategy (placeholder for DB requirement)
  const getOrCreateGlobalIntelligenceStrategy = async (userId: string) => {
    console.log('=== getOrCreateGlobalIntelligenceStrategy START ===')
    console.log('User ID:', userId)
    
    // First, try to find existing global Intelligence strategy
    const { data: existingStrategies, error: fetchError } = await supabase
      .from('strategies')
      .select('id')
      .eq('userId', userId)
      .eq('title', 'Global Intelligence')
      .limit(1)

    console.log('Existing global strategy query result:', existingStrategies)
    console.log('Existing global strategy query error:', fetchError)

    if (existingStrategies && existingStrategies.length > 0) {
      console.log('Found existing global Intelligence strategy:', existingStrategies[0].id)
      return existingStrategies[0].id
    }

    // Create new global Intelligence strategy
    console.log('Creating new global Intelligence strategy...')
    const { data: newStrategy, error } = await supabase
      .from('strategies')
      .insert({
        userId: userId,
        title: 'Global Intelligence',
        description: 'Global container for standalone intelligence cards (not user-facing)',
        status: 'active',
        created_by: userId
      })
      .select('id')
      .single()

    console.log('New global strategy creation result:', newStrategy)
    console.log('New global strategy creation error:', error)

    if (error) {
      console.error('Error creating global Intelligence strategy:', error)
      throw new Error(`Failed to create global Intelligence strategy: ${error.message}`)
    }

    console.log('Created new global Intelligence strategy:', newStrategy.id)
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

      // Extract intelligence-specific data
      const { title, description, cardType, card_type, card_data, ...otherFields } = cardData

      // Determine category from cardType
      let category = 'market' // default
      if (cardType) {
        category = cardType.replace('-intelligence', '')
      } else if (card_type) {
        category = card_type.replace('-intelligence', '')
      }

      const dbInsertData = {
        user_id: user.id,
        category: category,
        title: title || 'Untitled Intelligence',
        summary: description || 'New intelligence card',
        intelligence_content: card_data?.intelligence_content || '',
        key_findings: card_data?.key_findings || [],
        credibility_score: card_data?.credibility_score || 5,
        relevance_score: card_data?.relevance_score || 5,
        strategic_implications: card_data?.strategic_implications || '',
        recommended_actions: card_data?.recommended_actions || '',
        tags: card_data?.tags || [],
        status: 'active'
      }
      
      console.log('Intelligence DB Insert Data:', dbInsertData)

      const { data, error } = await supabase
        .from('intelligence_cards')
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
      console.log('=== updateCard START ===')
      console.log('Card ID:', id)
      console.log('Updates:', updates)
      
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('Auth user:', user?.id)
      console.log('Auth error:', authError)
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      // Transform CardData fields back to intelligence_cards schema
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      }
      
      // Map direct fields that exist in intelligence_cards table
      if (updates.title !== undefined) dbUpdates.title = updates.title
      if (updates.description !== undefined) dbUpdates.summary = updates.description // description maps to summary
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags
      
      // Map intelligence-specific fields
      if (updates.intelligence_content !== undefined) dbUpdates.intelligence_content = updates.intelligence_content
      if (updates.key_findings !== undefined) dbUpdates.key_findings = updates.key_findings
      if (updates.credibility_score !== undefined) dbUpdates.credibility_score = updates.credibility_score
      if (updates.relevance_score !== undefined) dbUpdates.relevance_score = updates.relevance_score
      if (updates.source_reference !== undefined) dbUpdates.source_reference = updates.source_reference
      if (updates.recommended_actions !== undefined) dbUpdates.recommended_actions = updates.recommended_actions
      if (updates.strategicAlignment !== undefined) dbUpdates.strategic_implications = updates.strategicAlignment
      
      // Handle card_data fields (for TRD and other structured data)
      if (updates.card_data !== undefined) {
        // Get existing card to preserve other card_data fields
        const existingCard = cards.find(c => c.id === id)
        const existingCardData = existingCard?.card_data || {}
        
        // Merge updates into existing card_data
        dbUpdates.card_data = {
          ...existingCardData,
          ...updates.card_data
        }
      }
      
      // Handle category update from cardType
      if (updates.cardType !== undefined) {
        const category = updates.cardType.replace('-intelligence', '')
        dbUpdates.category = category
      }
      
      console.log('Database updates:', dbUpdates)
      
      const { error } = await supabase
        .from('intelligence_cards')
        .update(dbUpdates)
        .eq('id', id)

      console.log('Update error:', error)
      
      if (error) throw error

      // Update local state
      setCards(cards.map(card => 
        card.id === id ? { ...card, ...updates, updated_at: dbUpdates.updated_at } : card
      ))
      
      console.log('=== updateCard SUCCESS ===')
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
        .from('intelligence_cards')
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