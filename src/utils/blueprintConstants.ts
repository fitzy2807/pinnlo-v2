/**
 * Blueprint Registry Constants
 * 
 * This file provides registry-based constants to replace hardcoded blueprint references
 * throughout the PINNLO v2 codebase. All constants are derived from the blueprint registry.
 */

import { BLUEPRINT_REGISTRY, BLUEPRINT_CATEGORIES } from '@/components/blueprints/registry'

// Registry-derived blueprint keys (guaranteed to be in sync)
export const BLUEPRINT_KEYS = Object.keys(BLUEPRINT_REGISTRY) as const
export type BlueprintKey = typeof BLUEPRINT_KEYS[number]

// Blueprint categories from registry
export const STRATEGY_HUB_BLUEPRINTS = BLUEPRINT_CATEGORIES['Strategy Hub'] || []
export const INTELLIGENCE_HUB_BLUEPRINTS = BLUEPRINT_CATEGORIES['Intelligence Hub'] || []
export const USER_EXPERIENCE_HUB_BLUEPRINTS = BLUEPRINT_CATEGORIES['User Experience Hub'] || []
export const GO_TO_MARKET_HUB_BLUEPRINTS = BLUEPRINT_CATEGORIES['Go-to-Market Hub'] || []
export const DEVELOPMENT_HUB_BLUEPRINTS = BLUEPRINT_CATEGORIES['Development Hub'] || []
export const ORGANISATION_HUB_BLUEPRINTS = BLUEPRINT_CATEGORIES['Organisation Hub'] || []

// Core blueprint constants (replace hardcoded arrays)
export const CORE_STRATEGY_BLUEPRINTS = [
  'strategicContext',
  'vision', 
  'valuePropositions',
  'strategicBet'
] as const

export const RESEARCH_ANALYSIS_BLUEPRINTS = [
  'personas',
  'customerJourney',
  'swotAnalysis',
  'competitiveAnalysis',
  'marketInsight',
  'experiment'
] as const

export const PLANNING_EXECUTION_BLUEPRINTS = [
  'okrs',
  'problemStatement',
  'workstreams',
  'epics',
  'features',
  'businessModel',
  'gtmPlays',
  'goToMarket',
  'riskAssessment',
  'roadmap'
] as const

export const USER_EXPERIENCE_BLUEPRINTS = [
  'serviceBlueprints',
  'userJourney',
  'experienceSection',
  'customerJourney'
] as const

export const ORGANIZATIONAL_TECHNICAL_BLUEPRINTS = [
  'organisationalCapabilities',
  'techRequirements',
  'techStack',
  'techStackEnhanced'
] as const

export const MEASUREMENT_BLUEPRINTS = [
  'kpis',
  'financialProjections',
  'costDriver',
  'revenueDriver'
] as const

// Mandatory blueprints (always required)
export const MANDATORY_BLUEPRINTS = ['strategicContext'] as const

// Default blueprint selections for new strategies
export const DEFAULT_STRATEGY_HUB_BLUEPRINTS = [
  'strategicContext',
  'vision',
  'personas',
  'valuePropositions',
  'problemStatement',
  'epics',
  'features'
] as const

export const DEFAULT_INTELLIGENCE_HUB_BLUEPRINTS = [
  'marketIntelligence',
  'competitorIntelligence',
  'trendsIntelligence'
] as const

export const DEFAULT_USER_EXPERIENCE_HUB_BLUEPRINTS = [
  'userJourney',
  'customerJourney',
  'serviceBlueprints'
] as const

export const DEFAULT_DEVELOPMENT_HUB_BLUEPRINTS = [
  'prd',
  'trd',
  'techStack'
] as const

export const DEFAULT_ORGANISATION_HUB_BLUEPRINTS = [
  'company',
  'team',
  'person'
] as const

// Intelligence sequencing blueprint mapping (replacing hardcoded MCP mappings)
export const INTELLIGENCE_BLUEPRINT_DEPENDENCIES: Record<string, {
  dependencies: string[]
  intelligenceCategories: string[]
  contextSources: string[]
  priority: number
  canRunInParallel: boolean
}> = {
  // === FOUNDATION LAYER (Must be first) ===
  [BLUEPRINT_KEYS.find(k => k === 'strategicContext')!]: {
    dependencies: [],
    intelligenceCategories: ['market', 'competitor', 'trends', 'opportunities', 'risk'],
    contextSources: [],
    priority: 1,
    canRunInParallel: false
  },

  // === VISION LAYER ===
  'vision': {
    dependencies: ['strategicContext'],
    intelligenceCategories: ['market', 'opportunities', 'trends', 'stakeholder'],
    contextSources: ['strategicContext'],
    priority: 2,
    canRunInParallel: false
  },

  'valuePropositions': {
    dependencies: ['strategicContext', 'vision'],
    intelligenceCategories: ['market', 'competitor', 'consumer', 'opportunities'],
    contextSources: ['strategicContext', 'vision'],
    priority: 3,
    canRunInParallel: false
  },

  // === RESEARCH LAYER ===
  'personas': {
    dependencies: ['strategicContext', 'valuePropositions'],
    intelligenceCategories: ['consumer', 'market', 'stakeholder'],
    contextSources: ['strategicContext', 'valuePropositions'],
    priority: 4,
    canRunInParallel: true
  },

  'marketInsight': {
    dependencies: ['strategicContext'],
    intelligenceCategories: ['market', 'trends', 'competitor', 'opportunities'],
    contextSources: ['strategicContext'],
    priority: 4,
    canRunInParallel: true
  },

  'experiment': {
    dependencies: ['strategicContext', 'valuePropositions'],
    intelligenceCategories: ['market', 'consumer', 'technology', 'opportunities'],
    contextSources: ['strategicContext', 'valuePropositions', 'personas'],
    priority: 4,
    canRunInParallel: true
  },

  // === PLANNING LAYER ===
  'okrs': {
    dependencies: ['vision', 'strategicContext'],
    intelligenceCategories: ['stakeholder', 'market', 'opportunities'],
    contextSources: ['vision', 'strategicContext', 'personas'],
    priority: 5,
    canRunInParallel: true
  },

  'problemStatement': {
    dependencies: ['personas', 'valuePropositions'],
    intelligenceCategories: ['consumer', 'market', 'opportunities'],
    contextSources: ['personas', 'valuePropositions', 'marketInsight'],
    priority: 5,
    canRunInParallel: true
  },

  'strategicBet': {
    dependencies: ['strategicContext', 'marketInsight'],
    intelligenceCategories: ['market', 'opportunities', 'risk', 'competitor'],
    contextSources: ['strategicContext', 'marketInsight', 'vision'],
    priority: 5,
    canRunInParallel: true
  },

  // === USER EXPERIENCE LAYER ===
  'userJourney': {
    dependencies: ['personas', 'valuePropositions'],
    intelligenceCategories: ['consumer', 'technology', 'market'],
    contextSources: ['personas', 'valuePropositions', 'problemStatement'],
    priority: 6,
    canRunInParallel: true
  },

  'experienceSection': {
    dependencies: ['userJourney', 'personas'],
    intelligenceCategories: ['consumer', 'technology'],
    contextSources: ['userJourney', 'personas', 'valuePropositions'],
    priority: 7,
    canRunInParallel: true
  },

  'serviceBlueprints': {
    dependencies: ['userJourney', 'experienceSection'],
    intelligenceCategories: ['technology', 'stakeholder', 'consumer'],
    contextSources: ['userJourney', 'experienceSection', 'personas'],
    priority: 8,
    canRunInParallel: true
  },

  // === EXECUTION LAYER ===
  'workstreams': {
    dependencies: ['okrs', 'problemStatement'],
    intelligenceCategories: ['stakeholder', 'technology', 'risk'],
    contextSources: ['okrs', 'problemStatement', 'strategicContext'],
    priority: 6,
    canRunInParallel: true
  },

  'epics': {
    dependencies: ['workstreams', 'problemStatement'],
    intelligenceCategories: ['technology', 'stakeholder'],
    contextSources: ['workstreams', 'problemStatement', 'userJourney'],
    priority: 7,
    canRunInParallel: true
  },

  'features': {
    dependencies: ['epics', 'userJourney'],
    intelligenceCategories: ['technology', 'consumer'],
    contextSources: ['epics', 'userJourney', 'experienceSection'],
    priority: 8,
    canRunInParallel: true
  }
}

// Blueprint validation helpers
export function isBlueprintKey(key: string): key is BlueprintKey {
  return BLUEPRINT_KEYS.includes(key as BlueprintKey)
}

export function getBlueprintsByCategory(category: keyof typeof BLUEPRINT_CATEGORIES): string[] {
  return BLUEPRINT_CATEGORIES[category] || []
}

export function isMandatoryBlueprint(blueprintKey: string): boolean {
  return MANDATORY_BLUEPRINTS.includes(blueprintKey as any)
}

// Legacy kebab-case to camelCase mapping for backward compatibility
export const SECTION_TYPE_MAPPING = {
  // Strategy blueprints
  'strategic-context': 'strategicContext',
  'value-proposition': 'valuePropositions',
  'vision': 'vision',
  'personas': 'personas',
  'customer-journey': 'customerJourney',
  'swot-analysis': 'swotAnalysis',
  'competitive-analysis': 'competitiveAnalysis',
  'problem-statement': 'problemStatement',
  'okrs': 'okrs',
  'business-model': 'businessModel',
  'go-to-market': 'goToMarket',
  'risk-assessment': 'riskAssessment',
  'roadmap': 'roadmap',
  'kpis': 'kpis',
  'financial-projections': 'financialProjections',
  'workstream': 'workstreams',

  // Development blueprints
  'feature': 'features',
  'epic': 'epics',
  'prd': 'prd',
  'trd': 'trd',
  'tech-stack': 'techStack',
  'task-list': 'taskList',

  // Intelligence blueprints
  'market-research': 'marketInsight',
  'competitor-analysis': 'competitiveAnalysis',
  'customer-insights': 'personas',
  'trend-analysis': 'marketInsight',
  'risk-analysis': 'riskAssessment'
} as const

// Reverse mapping: camelCase to kebab-case for database compatibility
export const CAMEL_TO_KEBAB_MAPPING = Object.fromEntries(
  Object.entries(SECTION_TYPE_MAPPING).map(([kebab, camel]) => [camel, kebab])
) as Record<string, string>

// Get blueprint info by section ID (supports both camelCase and kebab-case)
export function getBlueprintInfo(sectionId: string) {
  // Convert kebab-case to camelCase if needed
  const normalizedId = SECTION_TYPE_MAPPING[sectionId as keyof typeof SECTION_TYPE_MAPPING] || sectionId
  return BLUEPRINT_REGISTRY[normalizedId]
}

// Get card type for database queries (keeps camelCase format for consistency with blueprint registry)
export function getCardTypeForSection(sectionId: string): string {
  // Normalize section ID first (convert kebab-case to camelCase if needed)
  const normalizedSectionId = SECTION_TYPE_MAPPING[sectionId as keyof typeof SECTION_TYPE_MAPPING] || sectionId
  
  // Return the normalized camelCase format for consistency with blueprint registry
  return normalizedSectionId
}

// Get section ID from card type (converts kebab-case to camelCase)
export function getSectionFromCardType(cardType: string): string {
  return SECTION_TYPE_MAPPING[cardType as keyof typeof SECTION_TYPE_MAPPING] || cardType
}

// Legacy blueprint name mapping (for backward compatibility)
export function normalizeBlueprintKey(legacyKey: string): string {
  return SECTION_TYPE_MAPPING[legacyKey as keyof typeof SECTION_TYPE_MAPPING] || legacyKey
}