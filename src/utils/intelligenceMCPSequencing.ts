/**
 * Intelligence-Driven MCP Sequencing System
 * 
 * This system uses the Intelligence Bank as the primary context source
 * for all AI generation, creating a sophisticated context-aware generation flow.
 */

import { CardData } from '@/types/card'
import { supabase } from '@/lib/supabase'

// Intelligence Bank Integration Types
export interface IntelligenceCard {
  id: string
  organizationId: string
  title: string
  summary: string
  category: 'market' | 'competitor' | 'trends' | 'technology' | 'stakeholder' | 'consumer' | 'risk' | 'opportunities'
  agentCommentary: string
  confidenceScore: number
  cardTags: string[]
  relevancyScore: number
  createdAt: string
}

export interface IntelligenceContext {
  strategyId: string
  intelligenceCards: IntelligenceCard[]
  contextProfile?: {
    industrySelected: string[]
    marketSelected: string[]
    competitorsSelected: string[]
    technologySelected: string[]
    prioritiesSelected: string[]
    stakeholdersSelected: string[]
    themesSelected: string[]
  }
  strategicBrief?: string
}

export interface MCPGenerationRequest {
  blueprintType: string
  strategyId: string
  intelligenceContext: IntelligenceContext
  existingCards: CardData[]
  generationMode: 'single' | 'batch' | 'sequential'
  contextDepth: 'minimal' | 'standard' | 'comprehensive'
}

export interface GenerationSequence {
  steps: GenerationStep[]
  intelligenceMapping: Record<string, string[]> // blueprint -> relevant intelligence categories
  contextFlow: Record<string, string[]> // blueprint -> context source blueprints
  estimatedDuration: number
}

export interface GenerationStep {
  blueprintType: string
  dependencies: string[] // Other blueprints this depends on
  intelligenceCategories: string[] // Which intelligence categories to use
  contextSources: string[] // Which existing cards to use as context
  priority: number
  canRunInParallel: boolean
}

/**
 * Intelligence-driven blueprint sequencing with MCP integration
 */
export class IntelligenceMCPSequencer {
  private supabase = supabase

  /**
   * Blueprint sequencing based on Intelligence Bank context
   */
  private readonly INTELLIGENCE_BLUEPRINT_MAPPING: Record<string, {
    dependencies: string[]
    intelligenceCategories: string[]
    contextSources: string[]
    priority: number
    canRunInParallel: boolean
  }> = {
    // === FOUNDATION LAYER (Must be first) ===
    'strategic-context': {
      dependencies: [],
      intelligenceCategories: ['market', 'competitor', 'trends', 'opportunities', 'risk'],
      contextSources: [],
      priority: 1,
      canRunInParallel: false
    },

    // === VISION LAYER (Depends on strategic context) ===
    'vision': {
      dependencies: ['strategic-context'],
      intelligenceCategories: ['market', 'opportunities', 'trends', 'stakeholder'],
      contextSources: ['strategic-context'],
      priority: 2,
      canRunInParallel: false
    },

    'value-proposition': {
      dependencies: ['strategic-context', 'vision'],
      intelligenceCategories: ['market', 'competitor', 'consumer', 'opportunities'],
      contextSources: ['strategic-context', 'vision'],
      priority: 3,
      canRunInParallel: false
    },

    // === RESEARCH LAYER (Can run in parallel after foundation) ===
    'personas': {
      dependencies: ['strategic-context', 'value-proposition'],
      intelligenceCategories: ['consumer', 'market', 'stakeholder'],
      contextSources: ['strategic-context', 'value-proposition'],
      priority: 4,
      canRunInParallel: true
    },

    'market-insight': {
      dependencies: ['strategic-context'],
      intelligenceCategories: ['market', 'trends', 'competitor', 'opportunities'],
      contextSources: ['strategic-context'],
      priority: 4,
      canRunInParallel: true
    },

    'experiment': {
      dependencies: ['strategic-context', 'value-proposition'],
      intelligenceCategories: ['market', 'consumer', 'technology', 'opportunities'],
      contextSources: ['strategic-context', 'value-proposition', 'personas'],
      priority: 4,
      canRunInParallel: true
    },

    // === PLANNING LAYER ===
    'okrs': {
      dependencies: ['vision', 'strategic-context'],
      intelligenceCategories: ['stakeholder', 'market', 'opportunities'],
      contextSources: ['vision', 'strategic-context', 'personas'],
      priority: 5,
      canRunInParallel: true
    },

    'problem-statement': {
      dependencies: ['personas', 'value-proposition'],
      intelligenceCategories: ['consumer', 'market', 'opportunities'],
      contextSources: ['personas', 'value-proposition', 'market-insight'],
      priority: 5,
      canRunInParallel: true
    },

    'strategic-bet': {
      dependencies: ['strategic-context', 'market-insight'],
      intelligenceCategories: ['market', 'opportunities', 'risk', 'competitor'],
      contextSources: ['strategic-context', 'market-insight', 'vision'],
      priority: 5,
      canRunInParallel: true
    },

    // === USER EXPERIENCE LAYER ===
    'user-journey': {
      dependencies: ['personas', 'value-proposition'],
      intelligenceCategories: ['consumer', 'technology', 'market'],
      contextSources: ['personas', 'value-proposition', 'problem-statement'],
      priority: 6,
      canRunInParallel: true
    },

    'experience-section': {
      dependencies: ['user-journey', 'personas'],
      intelligenceCategories: ['consumer', 'technology'],
      contextSources: ['user-journey', 'personas', 'value-proposition'],
      priority: 7,
      canRunInParallel: true
    },

    'service-blueprint': {
      dependencies: ['user-journey', 'experience-section'],
      intelligenceCategories: ['technology', 'stakeholder', 'consumer'],
      contextSources: ['user-journey', 'experience-section', 'personas'],
      priority: 8,
      canRunInParallel: true
    },

    // === EXECUTION LAYER ===
    'workstream': {
      dependencies: ['okrs', 'problem-statement'],
      intelligenceCategories: ['stakeholder', 'technology', 'risk'],
      contextSources: ['okrs', 'problem-statement', 'strategic-context'],
      priority: 6,
      canRunInParallel: true
    },

    'epic': {
      dependencies: ['workstream', 'problem-statement'],
      intelligenceCategories: ['technology', 'stakeholder'],
      contextSources: ['workstream', 'problem-statement', 'user-journey'],
      priority: 7,
      canRunInParallel: true
    },

    'feature': {
      dependencies: ['epic', 'user-journey'],
      intelligenceCategories: ['technology', 'consumer'],
      contextSources: ['epic', 'user-journey', 'experience-section'],
      priority: 8,
      canRunInParallel: true
    },

    // === TECHNICAL LAYER ===
    'tech-stack': {
      dependencies: ['strategic-context'],
      intelligenceCategories: ['technology', 'risk', 'market'],
      contextSources: ['strategic-context', 'feature'],
      priority: 6,
      canRunInParallel: true
    },

    'technical-requirement': {
      dependencies: ['tech-stack', 'feature'],
      intelligenceCategories: ['technology', 'risk'],
      contextSources: ['tech-stack', 'feature', 'epic'],
      priority: 7,
      canRunInParallel: true
    },

    'system-architecture': {
      dependencies: ['tech-stack', 'technical-requirement'],
      intelligenceCategories: ['technology', 'risk', 'stakeholder'],
      contextSources: ['tech-stack', 'technical-requirement', 'feature'],
      priority: 8,
      canRunInParallel: true
    },

    // === ORGANIZATIONAL LAYER ===
    'organisational-capability': {
      dependencies: ['strategic-context', 'okrs'],
      intelligenceCategories: ['stakeholder', 'market', 'risk'],
      contextSources: ['strategic-context', 'okrs', 'workstream'],
      priority: 6,
      canRunInParallel: true
    },

    'gtm-play': {
      dependencies: ['value-proposition', 'personas', 'market-insight'],
      intelligenceCategories: ['market', 'competitor', 'consumer', 'opportunities'],
      contextSources: ['value-proposition', 'personas', 'market-insight'],
      priority: 6,
      canRunInParallel: true
    },

    // === FINANCIAL LAYER ===
    'cost-driver': {
      dependencies: ['strategic-context'],
      intelligenceCategories: ['market', 'technology', 'stakeholder'],
      contextSources: ['strategic-context', 'tech-stack', 'organisational-capability'],
      priority: 7,
      canRunInParallel: true
    },

    'revenue-driver': {
      dependencies: ['value-proposition', 'market-insight'],
      intelligenceCategories: ['market', 'opportunities', 'competitor'],
      contextSources: ['value-proposition', 'market-insight', 'gtm-play'],
      priority: 7,
      canRunInParallel: true
    }
  }

  /**
   * Generate a complete strategy using Intelligence Bank context
   */
  async generateIntelligenceDrivenStrategy(request: MCPGenerationRequest): Promise<GenerationSequence> {
    // 1. Fetch Intelligence Bank context
    const intelligenceContext = await this.getIntelligenceContext(request.strategyId)
    
    // 2. Analyze existing cards to determine what's missing
    const existingBlueprintTypes = request.existingCards.map(card => card.cardType)
    const targetBlueprints = Object.keys(this.INTELLIGENCE_BLUEPRINT_MAPPING)
      .filter(blueprint => !existingBlueprintTypes.includes(blueprint))
    
    // 3. Create generation sequence based on dependencies and intelligence
    const sequence = this.createIntelligenceSequence(targetBlueprints, intelligenceContext, request.existingCards)
    
    return sequence
  }

  /**
   * Get Intelligence Bank context for a strategy
   */
  private async getIntelligenceContext(strategyId: string): Promise<IntelligenceContext> {
    // This would integrate with your existing Intelligence Bank API
    // For now, we'll mock the structure based on your architecture
    
    try {
      // Fetch intelligence cards from your Intelligence Bank
      const { data: intelligenceCards, error } = await this.supabase
        .from('intelligence_cards') // This would be your actual table
        .select('*')
        .eq('strategy_id', strategyId) // or organization_id depending on your schema
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Could not fetch intelligence context:', error)
        return {
          strategyId,
          intelligenceCards: [],
          contextProfile: undefined,
          strategicBrief: undefined
        }
      }

      // Fetch context profile
      const { data: contextProfile } = await this.supabase
        .from('intelligence_context_profiles')
        .select('*')
        .eq('strategy_id', strategyId) // or organization_id
        .single()

      return {
        strategyId,
        intelligenceCards: intelligenceCards || [],
        contextProfile,
        strategicBrief: contextProfile?.strategic_brief
      }
    } catch (error) {
      console.warn('Intelligence Bank integration not available:', error)
      return {
        strategyId,
        intelligenceCards: [],
        contextProfile: undefined,
        strategicBrief: undefined
      }
    }
  }

  /**
   * Create generation sequence with intelligence-driven context
   */
  private createIntelligenceSequence(
    targetBlueprints: string[], 
    intelligenceContext: IntelligenceContext,
    existingCards: CardData[]
  ): GenerationSequence {
    const steps: GenerationStep[] = []
    
    // Group blueprints by priority level
    const blueprintsByPriority = this.groupBlueprintsByPriority(targetBlueprints)
    
    Object.keys(blueprintsByPriority)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(priority => {
        const blueprintsAtLevel = blueprintsByPriority[priority]
        
        blueprintsAtLevel.forEach(blueprintType => {
          const config = this.INTELLIGENCE_BLUEPRINT_MAPPING[blueprintType]
          
          steps.push({
            blueprintType,
            dependencies: config.dependencies,
            intelligenceCategories: config.intelligenceCategories,
            contextSources: config.contextSources,
            priority: parseInt(priority),
            canRunInParallel: config.canRunInParallel
          })
        })
      })

    return {
      steps,
      intelligenceMapping: this.createIntelligenceMapping(targetBlueprints),
      contextFlow: this.createContextFlow(targetBlueprints),
      estimatedDuration: this.estimateGenerationDuration(steps)
    }
  }

  /**
   * Group blueprints by their priority level
   */
  private groupBlueprintsByPriority(blueprints: string[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {}
    
    blueprints.forEach(blueprint => {
      const config = this.INTELLIGENCE_BLUEPRINT_MAPPING[blueprint]
      if (config) {
        const priority = config.priority.toString()
        if (!grouped[priority]) grouped[priority] = []
        grouped[priority].push(blueprint)
      }
    })
    
    return grouped
  }

  /**
   * Create intelligence category mapping for each blueprint
   */
  private createIntelligenceMapping(blueprints: string[]): Record<string, string[]> {
    const mapping: Record<string, string[]> = {}
    
    blueprints.forEach(blueprint => {
      const config = this.INTELLIGENCE_BLUEPRINT_MAPPING[blueprint]
      if (config) {
        mapping[blueprint] = config.intelligenceCategories
      }
    })
    
    return mapping
  }

  /**
   * Create context flow mapping showing which cards provide context to others
   */
  private createContextFlow(blueprints: string[]): Record<string, string[]> {
    const flow: Record<string, string[]> = {}
    
    blueprints.forEach(blueprint => {
      const config = this.INTELLIGENCE_BLUEPRINT_MAPPING[blueprint]
      if (config) {
        flow[blueprint] = config.contextSources
      }
    })
    
    return flow
  }

  /**
   * Estimate generation duration based on number of steps and complexity
   */
  private estimateGenerationDuration(steps: GenerationStep[]): number {
    // Base time per card: 30 seconds
    // Additional time for intelligence processing: 15 seconds per intelligence category
    // Parallel execution reduces total time
    
    let totalTime = 0
    const priorityGroups = this.groupStepsByPriority(steps)
    
    Object.keys(priorityGroups).forEach(priority => {
      const stepsAtLevel = priorityGroups[priority]
      const parallelSteps = stepsAtLevel.filter(step => step.canRunInParallel)
      const sequentialSteps = stepsAtLevel.filter(step => !step.canRunInParallel)
      
      // Sequential steps add to total time
      sequentialSteps.forEach(step => {
        totalTime += 30 + (step.intelligenceCategories.length * 15)
      })
      
      // Parallel steps only add the longest duration
      if (parallelSteps.length > 0) {
        const maxParallelTime = Math.max(...parallelSteps.map(step => 
          30 + (step.intelligenceCategories.length * 15)
        ))
        totalTime += maxParallelTime
      }
    })
    
    return totalTime
  }

  /**
   * Group generation steps by priority
   */
  private groupStepsByPriority(steps: GenerationStep[]): Record<string, GenerationStep[]> {
    const grouped: Record<string, GenerationStep[]> = {}
    
    steps.forEach(step => {
      const priority = step.priority.toString()
      if (!grouped[priority]) grouped[priority] = []
      grouped[priority].push(step)
    })
    
    return grouped
  }

  /**
   * Execute a single generation step with Intelligence Bank context
   */
  async executeGenerationStep(
    step: GenerationStep,
    intelligenceContext: IntelligenceContext,
    existingCards: CardData[]
  ): Promise<CardData> {
    // Get relevant intelligence for this blueprint
    const relevantIntelligence = this.getRelevantIntelligence(
      intelligenceContext.intelligenceCards,
      step.intelligenceCategories
    )
    
    // Get context from existing cards
    const contextCards = this.getContextCards(existingCards, step.contextSources)
    
    // Build enhanced context for AI generation
    const enhancedContext = this.buildEnhancedContext(
      intelligenceContext,
      relevantIntelligence,
      contextCards,
      step
    )
    
    // Call your existing AI Enhancement Edge Function with enriched context
    const { data, error } = await this.supabase.functions.invoke('enhance-field', {
      body: {
        blueprintType: step.blueprintType,
        currentData: {},
        fieldsToEnhance: [], // All fields for a new card
        context: enhancedContext
      }
    })
    
    if (error) {
      throw new Error(`AI generation failed for ${step.blueprintType}: ${error.message}`)
    }
    
    // Create the new card with AI-generated content
    return this.createCardFromAIResponse(step.blueprintType, data.enhancedData, intelligenceContext.strategyId)
  }

  /**
   * Filter intelligence cards by relevant categories
   */
  private getRelevantIntelligence(
    intelligenceCards: IntelligenceCard[],
    categories: string[]
  ): IntelligenceCard[] {
    return intelligenceCards.filter(card => 
      categories.includes(card.category)
    ).sort((a, b) => b.relevancyScore - a.relevancyScore)
  }

  /**
   * Get context cards for generation
   */
  private getContextCards(existingCards: CardData[], contextSources: string[]): CardData[] {
    return existingCards.filter(card => 
      contextSources.includes(card.cardType)
    )
  }

  /**
   * Build enhanced context object for AI generation
   */
  private buildEnhancedContext(
    intelligenceContext: IntelligenceContext,
    relevantIntelligence: IntelligenceCard[],
    contextCards: CardData[],
    step: GenerationStep
  ) {
    const context: any = {
      // Base context
      strategyId: intelligenceContext.strategyId,
      blueprintType: step.blueprintType,
      
      // Intelligence Bank context
      marketIntelligence: relevantIntelligence
        .filter(card => card.category === 'market')
        .map(card => ({ title: card.title, summary: card.summary, commentary: card.agentCommentary })),
      
      competitorIntelligence: relevantIntelligence
        .filter(card => card.category === 'competitor')
        .map(card => ({ title: card.title, summary: card.summary, commentary: card.agentCommentary })),
      
      trendIntelligence: relevantIntelligence
        .filter(card => card.category === 'trends')
        .map(card => ({ title: card.title, summary: card.summary, commentary: card.agentCommentary })),
      
      stakeholderIntelligence: relevantIntelligence
        .filter(card => card.category === 'stakeholder')
        .map(card => ({ title: card.title, summary: card.summary, commentary: card.agentCommentary })),
      
      // Context from existing cards
      existingContext: contextCards.map(card => ({
        type: card.cardType,
        title: card.title,
        description: card.description,
        strategicAlignment: card.strategicAlignment
      })),
      
      // Context profile
      contextProfile: intelligenceContext.contextProfile,
      strategicBrief: intelligenceContext.strategicBrief
    }
    
    return context
  }

  /**
   * Create a new card from AI response
   */
  private createCardFromAIResponse(
    blueprintType: string,
    aiData: any,
    strategyId: string
  ): CardData {
    // This would create a new card with the AI-generated content
    // The exact implementation depends on your CardData interface
    return {
      id: crypto.randomUUID(),
      cardType: blueprintType,
      title: aiData.title || `Generated ${blueprintType}`,
      description: aiData.description || '',
      strategicAlignment: aiData.strategicAlignment || '',
      priority: aiData.priority || 'Medium',
      confidenceLevel: aiData.confidenceLevel || 'Medium',
      priorityRationale: aiData.priorityRationale || '',
      confidenceRationale: aiData.confidenceRationale || '',
      tags: aiData.tags || ['ai-generated', 'intelligence-driven'],
      relationships: [],
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      creator: 'AI Assistant',
      owner: 'Strategy Team',
      ...aiData // Include all blueprint-specific fields
    } as CardData
  }
}

// Export the main sequencer class
export const intelligenceMCPSequencer = new IntelligenceMCPSequencer()
