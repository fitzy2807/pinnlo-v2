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
import { goToMarketConfig } from './configs/goToMarketConfig'
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
import { userJourneyConfig } from './configs/userJourneyConfig'
import { experienceSectionConfig } from './configs/experienceSectionConfig'
import { serviceBlueprintConfig } from './configs/serviceBlueprintConfig'
import { organisationalCapabilityConfig } from './configs/organisationalCapabilityConfig'
import { gtmPlayConfig } from './configs/gtmPlayConfig'
import { techStackConfig } from './configs/techStackConfig'
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

// Blueprint Registry - Central configuration for all blueprint types
export const BLUEPRINT_REGISTRY: Record<string, BlueprintConfig> = {
  // Core Strategy (Mandatory: strategicContext)
  'strategicContext': strategicContextConfig,
  'vision': visionConfig,
  'valuePropositions': valuePropositionConfig,
  
  // Research & Analysis
  'personas': personaConfig,
  'customerExperience': customerJourneyConfig,
  'swot-analysis': swotConfig,
  'competitive-analysis': competitiveAnalysisConfig,
  
  // Planning & Execution
  'okrs': okrConfig,
  'business-model': businessModelConfig,
  'go-to-market': goToMarketConfig,
  'risk-assessment': riskAssessmentConfig,
  'roadmap': roadmapConfig,
  
  // Measurement
  'kpis': kpiConfig,
  'financial-projections': financialProjectionsConfig,
  'cost-driver': costDriverConfig,
  'revenue-driver': revenueDriverConfig,

  // 20 New Blueprint Configurations
  'problem-statement': problemStatementConfig,
  'workstreams': workstreamConfig,
  'epics': epicConfig,
  'features': featureConfig,
  'userJourneys': userJourneyConfig,
  'experienceSections': experienceSectionConfig,
  'serviceBlueprints': serviceBlueprintConfig,
  'organisationalCapabilities': organisationalCapabilityConfig,
  'gtmPlays': gtmPlayConfig,
  'techStack': techStackConfig,
  'techRequirements': technicalRequirementConfig,
  'market-insight': marketInsightConfig,
  'experiment': experimentConfig,
  'strategic-bet': strategicBetConfig,
  
  // Template blueprint for testing
  'template': templateConfig,
  
  // Organisation blueprints
  'organisation': organisationConfig,
  'company': companyConfig,
  'department': departmentConfig,
  'team': teamConfig,
  'person': personConfig,
  
  // Intelligence blueprints
  'market-intelligence': marketIntelligenceConfig,
  'competitor-intelligence': competitorIntelligenceConfig,
  'trends-intelligence': trendsIntelligenceConfig,
  'technology-intelligence': technologyIntelligenceConfig,
  'stakeholder-intelligence': stakeholderIntelligenceConfig,
  'consumer-intelligence': consumerIntelligenceConfig,
  'risk-intelligence': riskIntelligenceConfig,
  'opportunities-intelligence': opportunitiesIntelligenceConfig,
  
  // TODO: Add remaining blueprint configs when needed
  // 'stakeholder-map': stakeholderMapConfig,
  // 'strategy-analytics': strategyAnalyticsConfig,
  // 'business-requirements': businessRequirementsConfig,
  // 'implementation-plan': implementationPlanConfig,
  // 'resource-plan': resourcePlanConfig,
  // 'communication-plan': communicationPlanConfig,
  // 'change-management': changeManagementConfig,
  // 'performance-review': performanceReviewConfig,
  // 'workspace-settings': workspaceSettingsConfig,
}

// Blueprint Categories for organization
export const BLUEPRINT_CATEGORIES: Record<string, string[]> = {
  'Core Strategy': ['strategicContext', 'vision', 'valuePropositions', 'strategic-bet'],
  'Research & Analysis': ['personas', 'customerExperience', 'swot-analysis', 'competitive-analysis', 'market-insight', 'experiment', 'market-intelligence', 'competitor-intelligence', 'trends-intelligence', 'technology-intelligence', 'stakeholder-intelligence', 'consumer-intelligence', 'risk-intelligence', 'opportunities-intelligence'],
  'Planning & Execution': ['okrs', 'problem-statement', 'workstreams', 'epics', 'features', 'business-model', 'go-to-market', 'gtmPlays', 'risk-assessment', 'roadmap'],
  'User Experience': ['userJourneys', 'experienceSections', 'serviceBlueprints'],
  'Organizational & Technical': ['organisationalCapabilities', 'techStack', 'techRequirements'],
  'Measurement': ['cost-driver', 'revenue-driver', 'kpis', 'financial-projections'],
  'Template': ['template'],
  'Organisation': ['organisation', 'company', 'department', 'team', 'person']
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
  
  // Try some specific mappings for inconsistent naming
  const mappings: Record<string, string> = {
    'strategic-context': 'strategicContext',
    'value-proposition': 'valuePropositions',
    'customer-journey': 'customerExperience',
    'personas': 'personas',
    'okrs': 'okrs',
    'kpis': 'kpis',
    'workstream': 'workstreams',
    'epic': 'epics',
    'feature': 'features',
    'user-journey': 'userJourneys',
    'experience-section': 'experienceSections',
    'service-blueprint': 'serviceBlueprints',
    'organisational-capability': 'organisationalCapabilities',
    'gtm-play': 'gtmPlays',
    'tech-requirements': 'techRequirements',
    // Development card type mappings
    'prd': 'features',
    'technical-requirement': 'techRequirements',
    'technical-requirement-structured': 'techRequirements',
    'task-list': 'features'
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

// Get blueprints by category
export function getBlueprintsByCategory(category: string): BlueprintConfig[] {
  const blueprintIds = BLUEPRINT_CATEGORIES[category] || []
  return blueprintIds.map(id => BLUEPRINT_REGISTRY[id]).filter(Boolean)
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