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

// Blueprint Registry - Central configuration for all blueprint types
export const BLUEPRINT_REGISTRY: Record<string, BlueprintConfig> = {
  // Core Strategy (Mandatory: strategic-context)
  'strategic-context': strategicContextConfig,
  'vision': visionConfig,
  'value-proposition': valuePropositionConfig,
  
  // Research & Analysis
  'personas': personaConfig,
  'customer-journey': customerJourneyConfig,
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
  'workstream': workstreamConfig,
  'epic': epicConfig,
  'feature': featureConfig,
  'user-journey': userJourneyConfig,
  'experience-section': experienceSectionConfig,
  'service-blueprint': serviceBlueprintConfig,
  'organisational-capability': organisationalCapabilityConfig,
  'gtm-play': gtmPlayConfig,
  'tech-stack': techStackConfig,
  'technical-requirement': technicalRequirementConfig,
  'market-insight': marketInsightConfig,
  'experiment': experimentConfig,
  'strategic-bet': strategicBetConfig,
  
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
  'Core Strategy': ['strategic-context', 'vision', 'value-proposition', 'strategic-bet'],
  'Research & Analysis': ['personas', 'customer-journey', 'swot-analysis', 'competitive-analysis', 'market-insight', 'experiment'],
  'Planning & Execution': ['okrs', 'problem-statement', 'workstream', 'epic', 'feature', 'business-model', 'go-to-market', 'gtm-play', 'risk-assessment', 'roadmap'],
  'User Experience': ['user-journey', 'experience-section', 'service-blueprint'],
  'Organizational & Technical': ['organisational-capability', 'tech-stack', 'technical-requirement'],
  'Measurement': ['cost-driver', 'revenue-driver', 'kpis', 'financial-projections']
}

// Mandatory blueprints (always enabled)
export const MANDATORY_BLUEPRINTS = ['strategic-context']

// Get blueprint configuration by ID
export function getBlueprintConfig(blueprintId: string): BlueprintConfig | undefined {
  return BLUEPRINT_REGISTRY[blueprintId]
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