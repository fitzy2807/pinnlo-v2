import { supabase } from '@/lib/supabase'
import {
  IntelligenceCard,
  CreateIntelligenceCardData,
  UpdateIntelligenceCardData,
  IntelligenceCardFilters,
  IntelligenceCardsResponse,
  IntelligenceCardStatus
} from '@/types/intelligence-cards'

/**
 * Create a new intelligence card
 */
export async function createIntelligenceCard(
  cardData: CreateIntelligenceCardData
): Promise<{ success: boolean; data?: IntelligenceCard; error?: string }> {
  try {
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()
    
    if (sessionError || !user) {
      throw new Error('Not authenticated')
    }

    // Prepare data with defaults and handle empty fields
    const insertData = {
      ...cardData,
      user_id: user.id,
      status: cardData.status || IntelligenceCardStatus.ACTIVE,
      key_findings: cardData.key_findings || [],
      relevant_blueprint_pages: cardData.relevant_blueprint_pages || [],
      tags: cardData.tags || [],
      // Convert undefined or empty strings to null for optional fields
      date_accessed: cardData.date_accessed || null,
      credibility_score: cardData.credibility_score || null,
      relevance_score: cardData.relevance_score || null,
      source_reference: cardData.source_reference || null,
      strategic_implications: cardData.strategic_implications || null,
      recommended_actions: cardData.recommended_actions || null
    }

    const { data, error } = await supabase
      .from('intelligence_cards')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data: data as IntelligenceCard
    }
  } catch (error) {
    console.error('Error creating intelligence card:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create intelligence card'
    }
  }
}

/**
 * Load intelligence cards with optional filters
 */
export async function loadIntelligenceCards(
  filters?: IntelligenceCardFilters
): Promise<{ success: boolean; data?: IntelligenceCardsResponse; error?: string }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Not authenticated')
    }

    // Build query
    let query = supabase
      .from('intelligence_cards')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }

    if (filters?.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,summary.ilike.%${filters.searchQuery}%,intelligence_content.ilike.%${filters.searchQuery}%`)
    }

    if (filters?.minCredibilityScore) {
      query = query.gte('credibility_score', filters.minCredibilityScore)
    }

    if (filters?.minRelevanceScore) {
      query = query.gte('relevance_score', filters.minRelevanceScore)
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    // Apply ordering
    query = query.order('created_at', { ascending: false })

    // Apply pagination
    const limit = filters?.limit || 50
    const offset = filters?.offset || 0
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      success: true,
      data: {
        cards: data as IntelligenceCard[],
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    }
  } catch (error) {
    console.error('Error loading intelligence cards:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load intelligence cards'
    }
  }
}

/**
 * Load a single intelligence card by ID
 */
export async function loadIntelligenceCard(
  id: string
): Promise<{ success: boolean; data?: IntelligenceCard; error?: string }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('intelligence_cards')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (error) throw error

    return {
      success: true,
      data: data as IntelligenceCard
    }
  } catch (error) {
    console.error('Error loading intelligence card:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load intelligence card'
    }
  }
}

/**
 * Update an existing intelligence card
 */
export async function updateIntelligenceCard(
  id: string,
  updates: UpdateIntelligenceCardData
): Promise<{ success: boolean; data?: IntelligenceCard; error?: string }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('intelligence_cards')
      .update(updates)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data: data as IntelligenceCard
    }
  } catch (error) {
    console.error('Error updating intelligence card:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update intelligence card'
    }
  }
}

/**
 * Delete an intelligence card permanently
 */
export async function deleteIntelligenceCard(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Not authenticated')
    }

    const { error } = await supabase
      .from('intelligence_cards')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error deleting intelligence card:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete intelligence card'
    }
  }
}

/**
 * Archive an intelligence card (set status to archived)
 */
export async function archiveIntelligenceCard(
  id: string
): Promise<{ success: boolean; data?: IntelligenceCard; error?: string }> {
  return updateIntelligenceCard(id, { status: IntelligenceCardStatus.ARCHIVED })
}

/**
 * Save an intelligence card (set status to saved)
 */
export async function saveIntelligenceCard(
  id: string
): Promise<{ success: boolean; data?: IntelligenceCard; error?: string }> {
  return updateIntelligenceCard(id, { status: IntelligenceCardStatus.SAVED })
}

/**
 * Restore an intelligence card to active status
 */
export async function restoreIntelligenceCard(
  id: string
): Promise<{ success: boolean; data?: IntelligenceCard; error?: string }> {
  return updateIntelligenceCard(id, { status: IntelligenceCardStatus.ACTIVE })
}

/**
 * Get count of cards by category
 */
export async function getCardCountsByCategory(): Promise<{
  success: boolean;
  data?: Record<string, number>;
  error?: string;
}> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('intelligence_cards')
      .select('category')
      .eq('user_id', session.user.id)
      .eq('status', IntelligenceCardStatus.ACTIVE)

    if (error) throw error

    // Count cards by category
    const counts: Record<string, number> = {}
    data.forEach(card => {
      counts[card.category] = (counts[card.category] || 0) + 1
    })

    return {
      success: true,
      data: counts
    }
  } catch (error) {
    console.error('Error getting card counts:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get card counts'
    }
  }
}

/**
 * Get count of cards by status
 */
export async function getCardCountsByStatus(): Promise<{
  success: boolean;
  data?: Record<string, number>;
  error?: string;
}> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('intelligence_cards')
      .select('status')
      .eq('user_id', session.user.id)

    if (error) throw error

    // Count cards by status
    const counts: Record<string, number> = {
      active: 0,
      saved: 0,
      archived: 0
    }
    
    data.forEach(card => {
      counts[card.status] = (counts[card.status] || 0) + 1
    })

    return {
      success: true,
      data: counts
    }
  } catch (error) {
    console.error('Error getting status counts:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get status counts'
    }
  }
}