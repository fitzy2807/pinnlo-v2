import { supabase } from '@/lib/supabase'
import { Strategy, CreateStrategyData, UpdateStrategyData } from '@/types/strategy'

export interface DatabaseStrategy {
  id: number  // Database uses SERIAL (number)
  title: string
  description: string
  created_at?: string
  updated_at?: string
  userId: string  // Note: Database uses "userId" not "user_id"
  status: 'active' | 'archived' | 'draft'
  color?: string
  tags?: string[]
  lastModified?: string
  blueprint_config?: {
    enabledBlueprints: string[]
    mandatoryBlueprints: string[]
    lastUpdated: string | null
  }
}

export class StrategyService {
  /**
   * Get all strategies for the current user
   */
  static async getStrategies(): Promise<Strategy[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('userId', user.id)
      .order('lastModified', { ascending: false })

    if (error) {
      console.error('Error fetching strategies:', error)
      throw new Error(`Failed to fetch strategies: ${error.message}`)
    }

    if (!data) {
      return []
    }

    return data.map((strategy) => StrategyService.transformDatabaseStrategyToStrategy(strategy))
  }

  /**
   * Create a new strategy
   */
  static async createStrategy(strategyData: CreateStrategyData): Promise<Strategy> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const dbStrategy = {
      title: strategyData.title,
      description: strategyData.description,
      userId: user.id,
      status: 'active' as const,
      color: '#3B82F6',
      lastModified: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('strategies')
      .insert([dbStrategy])
      .select()
      .single()

    if (error) {
      console.error('Error creating strategy:', error)
      throw new Error(`Failed to create strategy: ${error.message}`)
    }

    return StrategyService.transformDatabaseStrategyToStrategy(data)
  }

  /**
   * Update an existing strategy
   */
  static async updateStrategy(strategyId: string, updates: UpdateStrategyData): Promise<Strategy> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const dbUpdates = {
      ...updates,
      lastModified: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('strategies')
      .update(dbUpdates)
      .eq('id', strategyId)
      .eq('userId', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating strategy:', error)
      throw new Error(`Failed to update strategy: ${error.message}`)
    }

    return StrategyService.transformDatabaseStrategyToStrategy(data)
  }

  /**
   * Delete a strategy
   */
  static async deleteStrategy(strategyId: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', strategyId)
      .eq('userId', user.id)

    if (error) {
      console.error('Error deleting strategy:', error)
      throw new Error(`Failed to delete strategy: ${error.message}`)
    }
  }

  /**
   * Get a single strategy by ID
   */
  static async getStrategy(strategyId: string): Promise<Strategy | null> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', strategyId)
      .eq('userId', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Strategy not found
      }
      console.error('Error fetching strategy:', error)
      throw new Error(`Failed to fetch strategy: ${error.message}`)
    }

    return StrategyService.transformDatabaseStrategyToStrategy(data)
  }

  /**
   * Update blueprint configuration for a strategy
   */
  static async updateBlueprintConfig(
    strategyId: string, 
    blueprintConfig: { enabledBlueprints: string[]; mandatoryBlueprints: string[] }
  ): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const { error } = await supabase
      .from('strategies')
      .update({
        blueprint_config: {
          ...blueprintConfig,
          lastUpdated: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', strategyId)
      .eq('userId', user.id)

    if (error) {
      console.error('Error updating blueprint config:', error)
      throw new Error(`Failed to update blueprint config: ${error.message}`)
    }
  }

  /**
   * Transform database strategy to Strategy format
   */
  private static transformDatabaseStrategyToStrategy(dbStrategy: DatabaseStrategy): Strategy {
    return {
      id: dbStrategy.id.toString(), // Convert number to string
      title: dbStrategy.title,
      description: dbStrategy.description,
      created_at: dbStrategy.created_at || new Date().toISOString(),
      updated_at: dbStrategy.lastModified || new Date().toISOString(),
      user_id: dbStrategy.userId,
      creator: 'User', // TODO: Get actual user name from profiles table
      status: dbStrategy.status,
      color: dbStrategy.color || '#3B82F6',
      tags: dbStrategy.tags || []
    }
  }
}

export default StrategyService