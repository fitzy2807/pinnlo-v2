import { BlueprintConfig } from './types'

// Import all blueprint configurations
import { strategicContextConfig } from './configs/strategicContextConfig'
import { visionConfig } from './configs/visionConfig'
import { valuePropositionConfig } from './configs/valuePropositionConfig'
import { personaConfig } from './configs/personaConfig'
import { okrConfig } from './configs/okrConfig'
import { customerJourneyConfig } from './configs/customerJourneyConfig'
import { swotConfig } from './configs/swotConfig'
import { competitiveAnalysisConfig } from './configs/competitiveAnalysisConfig'
import { businessModelConfig } from './configs/businessModelConfig'
import { financialProjectionsConfig } from './configs/financialProjectionsConfig'
import { riskAssessmentConfig } from './configs/riskAssessmentConfig'
import { roadmapConfig } from './configs/roadmapConfig'
import { kpiConfig } from './configs/kpiConfig'
import { templateConfig } from './configs/templateConfig'

// Import 20 new blueprint configurations
import { problemStatementConfig } from './configs/problemStatementConfig'
import { workstreamConfig } from './configs/workstreamConfig'
import { epicConfig } from './configs/epicConfig'
import { featureConfig } from './configs/featureConfig'
import { serviceBlueprintConfig } from './configs/serviceBlueprintConfig'
import { organisationalCapabilityConfig } from './configs/organisationalCapabilityConfig'
import { gtmPlayConfig } from './configs/gtmPlayConfig'
import { techStackConfig } from './configs/techStackConfig'
import { techStackEnhancedConfig } from './configs/techStackEnhancedConfig'
import { technicalRequirementConfig } from './configs/technicalRequirementConfig'
import { costDriverConfig } from './configs/costDriverConfig'
import { revenueDriverConfig } from './configs/revenueDriverConfig'
import { marketInsightConfig } from './configs/marketInsightConfig'
import { experimentConfig } from './configs/experimentConfig'
import { strategicBetConfig } from './configs/strategicBetConfig'
import { organisationConfig } from './configs/organisationConfig'
import { companyConfig } from './configs/companyConfig'
import { departmentConfig } from './configs/departmentConfig'
import { teamConfig } from './configs/teamConfig'
import { personConfig } from './configs/personConfig'

// Import intelligence blueprint configurations
import { marketIntelligenceConfig } from './configs/marketIntelligenceConfig'
import { competitorIntelligenceConfig } from './configs/competitorIntelligenceConfig'
import { trendsIntelligenceConfig } from './configs/trendsIntelligenceConfig'
import { technologyIntelligenceConfig } from './configs/technologyIntelligenceConfig'
import { stakeholderIntelligenceConfig } from './configs/stakeholderIntelligenceConfig'
import { consumerIntelligenceConfig } from './configs/consumerIntelligenceConfig'
import { riskIntelligenceConfig } from './configs/riskIntelligenceConfig'
import { opportunitiesIntelligenceConfig } from './configs/opportunitiesIntelligenceConfig'

// Import PRD and TRD configs
import { prdConfig } from './configs/prdConfig'
import { trdConfig } from './configs/trdConfig'

// Import missing blueprint configurations
import { userJourneyConfig } from './configs/userJourneyConfig'
import { experienceSectionConfig } from './configs/experienceSectionConfig'
import { goToMarketConfig } from './configs/goToMarketConfig'

// Blueprint Registry - Central configuration for all blueprint types
export const BLUEPRINT_REGISTRY: Record<string, BlueprintConfig> = {
  // Core Strategy (Mandatory: strategicContext)
  'strategicContext': strategicContextConfig,
  'vision': visionConfig,
  'valuePropositions': valuePropositionConfig,
  'strategicBet': strategicBetConfig,
  
  // Research & Analysis
  'personas': personaConfig,
  'customerJourney': customerJourneyConfig,
  'swotAnalysis': swotConfig,
  'competitiveAnalysis': competitiveAnalysisConfig,
  'marketInsight': marketInsightConfig,
  'experiment': experimentConfig,
  
  // Planning & Execution
  'okrs': okrConfig,
  'problemStatement': problemStatementConfig,
  'workstreams': workstreamConfig,
  'epics': epicConfig,
  'features': featureConfig,
  'businessModel': businessModelConfig,
  'gtmPlays': gtmPlayConfig,
  'goToMarket': goToMarketConfig,
  'riskAssessment': riskAssessmentConfig,
  'roadmap': roadmapConfig,
  
  // User Experience
  'serviceBlueprints': serviceBlueprintConfig,
  'userJourney': userJourneyConfig,
  'experienceSection': experienceSectionConfig,
  
  // Organizational & Technical
  'organisationalCapabilities': organisationalCapabilityConfig,
  'techRequirements': technicalRequirementConfig,
  
  // Measurement
  'kpis': kpiConfig,
  'financialProjections': financialProjectionsConfig,
  'costDriver': costDriverConfig,
  'revenueDriver': revenueDriverConfig,
  
  // Template blueprint for testing
  'template': templateConfig,
  
  // Organisation blueprints
  'organisation': organisationConfig,
  'company': companyConfig,
  'department': departmentConfig,
  'team': teamConfig,
  'person': personConfig,
  
  // Intelligence blueprints
  'marketIntelligence': marketIntelligenceConfig,
  'competitorIntelligence': competitorIntelligenceConfig,
  'trendsIntelligence': trendsIntelligenceConfig,
  'technologyIntelligence': technologyIntelligenceConfig,
  'stakeholderIntelligence': stakeholderIntelligenceConfig,
  'consumerIntelligence': consumerIntelligenceConfig,
  'riskIntelligence': riskIntelligenceConfig,
  'opportunitiesIntelligence': opportunitiesIntelligenceConfig,
  
  // Development blueprints
  'prd': prdConfig,
  'trd': trdConfig,
  'techStack': techStackConfig,
  'techStackEnhanced': techStackEnhancedConfig,
  
  // TODO: Add remaining blueprint configs when needed
  // 'stakeholderMap': stakeholderMapConfig,
  // 'strategyAnalytics': strategyAnalyticsConfig,
  // 'businessRequirements': businessRequirementsConfig,
  // 'implementationPlan': implementationPlanConfig,
  // 'resourcePlan': resourcePlanConfig,
  // 'communicationPlan': communicationPlanConfig,
  // 'changeManagement': changeManagementConfig,
  // 'performanceReview': performanceReviewConfig,
  // 'workspaceSettings': workspaceSettingsConfig,
}

// Priority-ordered Strategy Hub blueprints (user's preferred sequence)
export const STRATEGY_HUB_PRIORITY_ORDER = [
  // Priority blueprints (first 7)
  'strategicContext',
  'vision', 
  'personas',
  'valuePropositions',
  'problemStatement',
  'epics',
  'features',
  // Additional core blueprints
  'strategicBet',
  'okrs',
  'businessModel',
  'workstreams',
  'roadmap',
  // Research & Analysis
  'customerJourney',
  'swotAnalysis', 
  'competitiveAnalysis',
  'marketInsight',
  'experiment',
  // User Experience
  'serviceBlueprints',
  // Organizational & Technical
  'organisationalCapabilities',
  'techRequirements',
  // Go-to-Market
  'gtmPlays',
  'riskAssessment',
  // Measurement
  'kpis',
  'financialProjections',
  'costDriver',
  'revenueDriver',
  // Template
  'template'
]

// Blueprint Categories organized by Hub
export const BLUEPRINT_CATEGORIES: Record<string, string[]> = {
  'Strategy Hub': STRATEGY_HUB_PRIORITY_ORDER,
  'Intelligence Hub': [
    'marketIntelligence', 'competitorIntelligence', 'trendsIntelligence', 'technologyIntelligence', 
    'stakeholderIntelligence', 'consumerIntelligence', 'riskIntelligence', 'opportunitiesIntelligence'
  ],
  'User Experience Hub': [
    'userJourney', 'experienceSection', 'serviceBlueprints', 'customerJourney'
  ],
  'Go-to-Market Hub': [
    'goToMarket', 'gtmPlays', 'marketInsight', 'competitiveAnalysis'
  ],
  'Development Hub': [
    'prd', 'trd', 'techStack', 'techStackEnhanced'
  ],
  'Organisation Hub': [
    'organisation', 'company', 'department', 'team', 'person'
  ]
}

// Mandatory blueprints (always enabled)
export const MANDATORY_BLUEPRINTS = ['strategicContext']

// Get blueprint configuration by ID
export function getBlueprintConfig(blueprintId: string): BlueprintConfig | undefined {
  // Safety check for undefined blueprintId
  if (!blueprintId) {
    console.warn('getBlueprintConfig called with undefined blueprintId')
    return undefined
  }
  
  // First try direct lookup
  if (BLUEPRINT_REGISTRY[blueprintId]) {
    return BLUEPRINT_REGISTRY[blueprintId]
  }
  
  // Convert kebab-case to camelCase for legacy compatibility
  const camelCaseId = blueprintId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  if (BLUEPRINT_REGISTRY[camelCaseId]) {
    return BLUEPRINT_REGISTRY[camelCaseId]
  }
  
  // Try some specific mappings for inconsistent naming (legacy support)
  const mappings: Record<string, string> = {
    // Legacy kebab-case to camelCase mappings
    'strategic-context': 'strategicContext',
    'value-proposition': 'valuePropositions',
    'value-propositions': 'valuePropositions',
    'customer-journey': 'customerJourney',
    'swot-analysis': 'swotAnalysis',
    'competitive-analysis': 'competitiveAnalysis',
    'business-model': 'businessModel',
    'risk-assessment': 'riskAssessment',
    'financial-projections': 'financialProjections',
    'problem-statement': 'problemStatement',
    'strategic-bet': 'strategicBet',
    'market-insight': 'marketInsight',
    'cost-driver': 'costDriver',
    'revenue-driver': 'revenueDriver',
    'service-blueprint': 'serviceBlueprints',
    'organisational-capability': 'organisationalCapabilities',
    'gtm-play': 'gtmPlays',
    'tech-requirements': 'techRequirements',
    // Intelligence blueprint mappings
    'market-intelligence': 'marketIntelligence',
    'competitor-intelligence': 'competitorIntelligence',
    'trends-intelligence': 'trendsIntelligence',
    'technology-intelligence': 'technologyIntelligence',
    'stakeholder-intelligence': 'stakeholderIntelligence',
    'consumer-intelligence': 'consumerIntelligence',
    'risk-intelligence': 'riskIntelligence',
    'opportunities-intelligence': 'opportunitiesIntelligence',
    // Development card type mappings
    'product-requirements': 'prd',
    'technical-requirements': 'trd',
    'technical-requirement': 'trd',
    'technical-requirement-structured': 'trd',
    'task-list': 'features',
    // User Experience mappings
    'user-journey': 'userJourney',
    'experience-section': 'experienceSection',
    // Go-to-Market mappings
    'go-to-market': 'goToMarket',
    // Legacy task mappings
    'task': 'features',
    'test-scenario': 'features',
    // Tech stack mappings
    'tech-stack': 'techStack',
    'tech-stack-enhanced': 'techStackEnhanced',
    // Customer Experience aliases
    'customerExperience': 'customerJourney',
    'experienceSections': 'experienceSection',
    'user-journeys': 'userJourney',
    // Singular/plural variations
    'persona': 'personas',
    'okr': 'okrs',
    'kpi': 'kpis',
    'workstream': 'workstreams',
    'epic': 'epics',
    'feature': 'features'
  }
  
  if (mappings[blueprintId] && BLUEPRINT_REGISTRY[mappings[blueprintId]]) {
    return BLUEPRINT_REGISTRY[mappings[blueprintId]]
  }
  
  return undefined
}

// Get all blueprint configurations
export function getAllBlueprints(): BlueprintConfig[] {
  return Object.values(BLUEPRINT_REGISTRY)
}

// Get blueprints by category (hub)
export function getBlueprintsByCategory(category: string): BlueprintConfig[] {
  const blueprintIds = BLUEPRINT_CATEGORIES[category] || []
  return blueprintIds.map(id => BLUEPRINT_REGISTRY[id]).filter(Boolean)
}

// Get blueprints by hub (alias for getBlueprintsByCategory)
export function getBlueprintsByHub(hubName: string): BlueprintConfig[] {
  const hubKey = `${hubName.charAt(0).toUpperCase()}${hubName.slice(1)} Hub`
  return getBlueprintsByCategory(hubKey)
}

// Get Strategy Hub blueprints in priority order
export function getStrategyHubBlueprintsInOrder(): BlueprintConfig[] {
  return STRATEGY_HUB_PRIORITY_ORDER
    .map(id => BLUEPRINT_REGISTRY[id])
    .filter(Boolean)
}

// Get default Strategy Hub blueprint selections (first 7 priority blueprints)
export function getDefaultStrategyHubSelections(): string[] {
  return STRATEGY_HUB_PRIORITY_ORDER.slice(0, 7)
}

// Get default Intelligence Hub blueprint selections
export function getDefaultIntelligenceHubSelections(): string[] {
  return ['marketIntelligence', 'competitorIntelligence', 'trendsIntelligence']
}

// Get default Development Hub blueprint selections
export function getDefaultDevelopmentHubSelections(): string[] {
  return ['prd', 'trd', 'techStack']
}

// Get default Organisation Hub blueprint selections
export function getDefaultOrganisationHubSelections(): string[] {
  return ['company', 'team', 'person']
}

// Validate blueprint dependencies
export function validateBlueprintDependencies(selectedBlueprints: string[]): {
  isValid: boolean
  missingDependencies: string[]
  errors: string[]
} {
  const errors: string[] = []
  const missingDependencies: string[] = []

  // Check mandatory blueprints
  for (const mandatoryId of MANDATORY_BLUEPRINTS) {
    if (!selectedBlueprints.includes(mandatoryId)) {
      missingDependencies.push(mandatoryId)
      errors.push(`${BLUEPRINT_REGISTRY[mandatoryId]?.name} is mandatory`)
    }
  }

  // Check blueprint-specific dependencies
  for (const blueprintId of selectedBlueprints) {
    const config = BLUEPRINT_REGISTRY[blueprintId]
    if (config?.relationships?.requiredBlueprints) {
      for (const requiredId of config.relationships.requiredBlueprints) {
        if (!selectedBlueprints.includes(requiredId)) {
          missingDependencies.push(requiredId)
          errors.push(`${config.name} requires ${BLUEPRINT_REGISTRY[requiredId]?.name}`)
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    missingDependencies: Array.from(new Set(missingDependencies)),
    errors
  }
}

// Get suggested blueprints based on current selection
export function getSuggestedBlueprints(selectedBlueprints: string[]): string[] {
  const suggestions = new Set<string>()

  for (const blueprintId of selectedBlueprints) {
    const config = BLUEPRINT_REGISTRY[blueprintId]
    if (config?.relationships?.linkedBlueprints) {
      for (const linkedId of config.relationships.linkedBlueprints) {
        if (!selectedBlueprints.includes(linkedId)) {
          suggestions.add(linkedId)
        }
      }
    }
  }

  return Array.from(suggestions)
}

// Export the registry for use in other components
export const blueprintRegistry = BLUEPRINT_REGISTRY