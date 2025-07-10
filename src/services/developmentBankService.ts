import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface TechStackSelection {
  id: string
  strategy_id: number
  stack_name: string
  stack_type: 'ai-generated' | 'template' | 'custom'
  layers: Record<string, Array<{
    vendor: string
    product: string
    version?: string
    pricing?: {
      model: string
      monthlyCost: number
    }
    rationale?: string
  }>>
  metadata?: {
    totalMonthlyCost?: number
    confidenceScore?: number
    strengths?: string[]
    considerations?: string[]
    bestFor?: string
  }
  created_at: string
  created_by: string
}

export interface DevBankAsset {
  id: string
  strategy_id: number
  asset_type: 'tech-spec' | 'api-spec' | 'database-schema' | 'deployment-guide' | 'test-scenario' | 'task-list'
  source_card_ids?: string[]
  tech_stack_id?: string
  content: {
    formats?: {
      aiReady?: string
      markdown?: string
      raw?: any
    }
    sections?: {
      overview?: string
      specification?: string
      [key: string]: any
    }
    raw?: any
  }
  metadata: {
    generatedAt?: string
    generatedBy?: string
    version?: number
    featureCount?: number
    epicCount?: number
    [key: string]: any
  }
  version: number
  created_at: string
  created_by: string
}

export interface AIVendorRecommendation {
  id: string
  strategy_id: number
  category: string
  context: Record<string, any>
  recommendations: Record<string, any>
  confidence_score: number
  generated_at: string
  expires_at: string
  generated_by: string
}

export class DevelopmentBankService {
  static async getTechStacks(strategyId: number): Promise<TechStackSelection[]> {
    const { data, error } = await supabase
      .from('tech_stacks')
      .select('*')
      .eq('strategy_id', strategyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tech stacks:', error)
      throw new Error(`Failed to fetch tech stacks: ${error.message}`)
    }

    return data || []
  }

  static async getTechStack(techStackId: string): Promise<TechStackSelection | null> {
    const { data, error } = await supabase
      .from('tech_stacks')
      .select('*')
      .eq('id', techStackId)
      .single()

    if (error) {
      console.error('Error fetching tech stack:', error)
      return null
    }

    return data
  }

  static async createTechStack(techStack: Omit<TechStackSelection, 'id' | 'created_at'>): Promise<TechStackSelection> {
    const { data, error } = await supabase
      .from('tech_stacks')
      .insert([techStack])
      .select()
      .single()

    if (error) {
      console.error('Error creating tech stack:', error)
      throw new Error(`Failed to create tech stack: ${error.message}`)
    }

    return data
  }

  static async getAssets(strategyId: number, assetType?: string): Promise<DevBankAsset[]> {
    let query = supabase
      .from('dev_bank_assets')
      .select('*')
      .eq('strategy_id', strategyId)

    if (assetType) {
      query = query.eq('asset_type', assetType)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assets:', error)
      throw new Error(`Failed to fetch assets: ${error.message}`)
    }

    return data || []
  }

  static async getAsset(assetId: string): Promise<DevBankAsset | null> {
    const { data, error } = await supabase
      .from('dev_bank_assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (error) {
      console.error('Error fetching asset:', error)
      return null
    }

    return data
  }

  static async createAsset(strategyId: number, asset: Omit<DevBankAsset, 'id' | 'strategy_id' | 'created_at'>): Promise<DevBankAsset> {
    const { data, error } = await supabase
      .from('dev_bank_assets')
      .insert([{ ...asset, strategy_id: strategyId }])
      .select()
      .single()

    if (error) {
      console.error('Error creating asset:', error)
      throw new Error(`Failed to create asset: ${error.message}`)
    }

    return data
  }

  static async updateAsset(assetId: string, updates: Partial<DevBankAsset>): Promise<DevBankAsset> {
    const { data, error } = await supabase
      .from('dev_bank_assets')
      .update(updates)
      .eq('id', assetId)
      .select()
      .single()

    if (error) {
      console.error('Error updating asset:', error)
      throw new Error(`Failed to update asset: ${error.message}`)
    }

    return data
  }

  static async deleteAsset(assetId: string): Promise<void> {
    const { error } = await supabase
      .from('dev_bank_assets')
      .delete()
      .eq('id', assetId)

    if (error) {
      console.error('Error deleting asset:', error)
      throw new Error(`Failed to delete asset: ${error.message}`)
    }
  }

  static async getVendorRecommendations(strategyId: number, category?: string): Promise<AIVendorRecommendation[]> {
    let query = supabase
      .from('ai_vendor_recommendations')
      .select('*')
      .eq('strategy_id', strategyId)
      .gt('expires_at', new Date().toISOString())

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query.order('generated_at', { ascending: false })

    if (error) {
      console.error('Error fetching vendor recommendations:', error)
      throw new Error(`Failed to fetch vendor recommendations: ${error.message}`)
    }

    return data || []
  }

  static async createVendorRecommendation(recommendation: Omit<AIVendorRecommendation, 'id' | 'generated_at'>): Promise<AIVendorRecommendation> {
    const { data, error } = await supabase
      .from('ai_vendor_recommendations')
      .insert([recommendation])
      .select()
      .single()

    if (error) {
      console.error('Error creating vendor recommendation:', error)
      throw new Error(`Failed to create vendor recommendation: ${error.message}`)
    }

    return data
  }

  // Utility methods for working with strategy context
  static async getStrategyCards(strategyId: number, cardType?: string): Promise<any[]> {
    let query = supabase
      .from('cards')
      .select('*')
      .eq('strategy_id', strategyId)

    if (cardType) {
      query = query.eq('card_type', cardType)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching strategy cards:', error)
      throw new Error(`Failed to fetch strategy cards: ${error.message}`)
    }

    return data || []
  }

  static async getStrategy(strategyId: number): Promise<any | null> {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', strategyId)
      .single()

    if (error) {
      console.error('Error fetching strategy:', error)
      return null
    }

    return data
  }
}