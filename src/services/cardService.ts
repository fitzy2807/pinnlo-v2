import { supabase } from '@/lib/supabase'
import { CardData } from '@/types/card'

export interface DatabaseCard {
  id: string
  strategy_id: number  // FIXED: Changed from string to number
  title: string
  description: string
  card_type: string
  priority: 'High' | 'Medium' | 'Low'
  confidence_level: 'High' | 'Medium' | 'Low'
  priority_rationale: string
  confidence_rationale: string
  strategic_alignment: string
  tags: string[]
  relationships: any[]
  card_data: Record<string, any>
  created_at: string
  updated_at: string
  created_by: string
}

export class CardService {
  /**
   * Get all cards for a strategy
   */
  static async getCardsForStrategy(strategyId: number): Promise<CardData[]> {  // FIXED: Changed to number
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('strategy_id', strategyId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching cards:', error)
      throw new Error(`Failed to fetch cards: ${error.message}`)
    }

    // Transform database cards to CardData format
    return data.map(this.transformDatabaseCardToCardData)
  }

  /**
   * Create a new card
   */
  static async createCard(
    strategyId: number,  // FIXED: Changed to number
    cardData: Partial<CardData>
  ): Promise<CardData> {
    const dbCard = this.transformCardDataToDatabaseCard(strategyId, cardData)
    
    const { data, error } = await supabase
      .from('cards')
      .insert([dbCard])
      .select()
      .single()

    if (error) {
      console.error('Error creating card:', error)
      throw new Error(`Failed to create card: ${error.message}`)
    }

    return this.transformDatabaseCardToCardData(data)
  }

  /**
   * Update an existing card
   */
  static async updateCard(cardId: string, updates: Partial<CardData>): Promise<CardData> {
    const dbUpdates = this.transformCardDataToDatabaseCard(0, updates, true)  // 0 as placeholder for updates
    
    const { data, error } = await supabase
      .from('cards')
      .update(dbUpdates)
      .eq('id', cardId)
      .select()
      .single()

    if (error) {
      console.error('Error updating card:', error)
      throw new Error(`Failed to update card: ${error.message}`)
    }

    return this.transformDatabaseCardToCardData(data)
  }

  /**
   * Delete a card
   */
  static async deleteCard(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      console.error('Error deleting card:', error)
      throw new Error(`Failed to delete card: ${error.message}`)
    }
  }

  /**
   * Duplicate a card
   */
  static async duplicateCard(cardId: string): Promise<CardData> {
    // First, get the original card
    const { data: originalCard, error: fetchError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch original card: ${fetchError.message}`)
    }

    // Create a new card with duplicated data
    const duplicatedCard = {
      ...originalCard,
      id: undefined, // Let database generate new ID
      title: `${originalCard.title} (Copy)`,
      created_at: undefined,
      updated_at: undefined,
    }

    const { data, error } = await supabase
      .from('cards')
      .insert([duplicatedCard])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to duplicate card: ${error.message}`)
    }

    return this.transformDatabaseCardToCardData(data)
  }

  /**
   * Transform database card to CardData format
   */
  private static transformDatabaseCardToCardData(dbCard: DatabaseCard): CardData {
    return {
      id: dbCard.id,
      title: dbCard.title,
      description: dbCard.description,
      cardType: dbCard.card_type,
      priority: dbCard.priority,
      confidenceLevel: dbCard.confidence_level,
      priorityRationale: dbCard.priority_rationale,
      confidenceRationale: dbCard.confidence_rationale,
      strategicAlignment: dbCard.strategic_alignment,
      tags: dbCard.tags || [],
      relationships: dbCard.relationships || [],
      createdDate: dbCard.created_at,
      lastModified: dbCard.updated_at,
      creator: 'User', // TODO: Get actual user name
      owner: 'User',   // TODO: Get actual user name
      // Spread blueprint-specific fields from card_data
      ...dbCard.card_data
    }
  }

  /**
   * Transform CardData to database card format
   */
  private static transformCardDataToDatabaseCard(
    strategyId: number,  // FIXED: Changed to number
    cardData: Partial<CardData>,
    isUpdate = false
  ): Partial<DatabaseCard> {
    const {
      id,
      title,
      description,
      cardType,
      priority,
      confidenceLevel,
      priorityRationale,
      confidenceRationale,
      strategicAlignment,
      tags,
      relationships,
      createdDate,
      lastModified,
      creator,
      owner,
      ...blueprintFields
    } = cardData

    const dbCard: Partial<DatabaseCard> = {
      title,
      description,
      card_type: cardType,
      priority,
      confidence_level: confidenceLevel,
      priority_rationale: priorityRationale || '',
      confidence_rationale: confidenceRationale || '',
      strategic_alignment: strategicAlignment || '',
      tags: tags || [],
      relationships: relationships || [],
      card_data: blueprintFields
    }

    // Only include strategy_id for creation, not updates
    if (!isUpdate && strategyId) {
      dbCard.strategy_id = strategyId
    }

    return dbCard
  }
}

export default CardService