import React from 'react'

export interface CardCreatorConfig {
  bankType: 'development' | 'template' | 'strategy' | 'intelligence'
  
  // Section configuration with custom labels
  sections: {
    id: string
    label: string
    icon?: React.ComponentType
    cardTypes: string[]
    maxCards?: number
    description?: string
    category?: 'strategy' | 'intelligence' | 'development'
    required?: boolean
    suggested?: boolean
  }[]
  
  // AI generation configuration
  generation: {
    endpoint: string
    model?: 'gpt-4' | 'gpt-4o-mini' | 'claude-3'
    maxTokens?: number
    temperature?: number
    systemPromptTemplate?: string
  }
  
  // Cost optimization settings
  costOptimization?: {
    enableBatching?: boolean
    cacheTimeout?: number
    maxConcurrentRequests?: number
    maxTokensPerRequest?: number
  }
}

export interface GenerationContext {
  contextCards: Card[]
  targetSection: string
  targetCardType: string
  quantity: number
  quality: 'fast' | 'balanced' | 'high'
  userId: string
  strategyId?: string | number
}

export interface GenerationResult {
  success: boolean
  cards?: GeneratedCard[]
  error?: string
  tokensUsed?: number
  estimatedCost?: number
  fromCache?: boolean
}

export interface GeneratedCard {
  id: string
  title: string
  description: string
  card_type: string
  priority: string
  card_data: any
  confidence?: number
  source: 'ai_generated'
}

export interface Card {
  id: string
  title: string
  description?: string
  card_type: string
  priority: string
  card_data: any
  created_at: string
  updated_at: string
}

export interface CostEstimate {
  inputTokens: number
  estimatedCost: number
  withinBudget: boolean
  compressionSuggested?: boolean
}

export interface CardCreatorPlugin {
  id: string
  name: string
  
  // Hooks into generation lifecycle
  beforeGenerate?: (context: GenerationContext) => Promise<GenerationContext> | GenerationContext
  afterGenerate?: (result: GenerationResult) => Promise<GenerationResult> | GenerationResult
  
  // Custom validation
  validateInput?: (input: any) => ValidationResult
  
  // UI customization
  renderCustomSection?: (props: any) => React.ReactNode
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}

export interface TokenUsage {
  input: number
  output: number
  total: number
  cost: number
  model: string
}