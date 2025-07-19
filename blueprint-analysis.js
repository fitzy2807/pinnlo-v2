#!/usr/bin/env node

/**
 * Blueprint Registry Alignment Analysis
 * 
 * This script analyzes the alignment between:
 * 1. Blueprint Registry keys
 * 2. Database values found during cleanup
 * 3. Hardcoded references found in codebase
 */

// From blueprint registry analysis
const REGISTRY_KEYS = [
  'strategicContext', 'vision', 'valuePropositions', 'strategicBet',
  'personas', 'customerJourney', 'swotAnalysis', 'competitiveAnalysis',
  'marketInsight', 'experiment', 'okrs', 'problemStatement', 'workstreams',
  'epics', 'features', 'businessModel', 'gtmPlays', 'riskAssessment',
  'roadmap', 'serviceBlueprints', 'organisationalCapabilities', 'techRequirements',
  'kpis', 'financialProjections', 'costDriver', 'revenueDriver', 'template',
  'organisation', 'company', 'department', 'team', 'person',
  'marketIntelligence', 'competitorIntelligence', 'trendsIntelligence',
  'technologyIntelligence', 'stakeholderIntelligence', 'consumerIntelligence',
  'riskIntelligence', 'opportunitiesIntelligence', 'prd', 'trd',
  'techStack', 'techStackEnhanced'
]

// Unknown types found in database during cleanup
const DATABASE_UNKNOWN_TYPES = [
  // Cards table unknowns
  'epic', 'experience-section', 'feature', 'go-to-market', 'task', 
  'task-list', 'test-scenario', 'user-journey', 'workstream',
  
  // AI prompts table unknowns  
  'customerExperience', 'epic', 'experienceSections', 'feature',
  'go-to-market', 'user-journey', 'user-journeys', 'workstream',
  
  // AI generation history unknowns
  'experience-section', 'epic', 'feature', 'workstream', 'customerExperience',
  'experienceSections', 'go-to-market'
]

// Hardcoded references found in codebase scan
const HARDCODED_REFERENCES = [
  // From MCP sequencing (kebab-case)
  'strategic-context', 'value-proposition', 'customer-journey', 'business-model',
  'competitive-analysis', 'financial-projections', 'problem-statement',
  'risk-assessment', 'strategic-bet', 'tech-stack', 'market-insight',
  'user-journey', 'experience-section', 'service-blueprint', 'workstream',
  'epic', 'feature', 'technical-requirement', 'system-architecture',
  'organisational-capability', 'gtm-play', 'cost-driver', 'revenue-driver',
  
  // From component configs (mixed case)
  'customerExperience', 'experienceSections', 'swot-analysis', 'go-to-market'
]

class BlueprintAlignmentAnalyzer {
  constructor() {
    this.analysis = {
      missing_from_registry: [],
      inconsistent_naming: [],
      legacy_types: [],
      alignment_issues: []
    }
  }

  analyzeAlignment() {
    console.log('🔍 Blueprint Registry Alignment Analysis\n')
    
    // 1. Find types in database but not in registry
    console.log('1. TYPES IN DATABASE BUT NOT IN REGISTRY:')
    const uniqueDbTypes = [...new Set(DATABASE_UNKNOWN_TYPES)]
    
    uniqueDbTypes.forEach(type => {
      // Check if camelCase version exists in registry
      const camelCased = this.toCamelCase(type)
      const kebabCased = this.toKebabCase(type)
      
      if (!REGISTRY_KEYS.includes(type) && !REGISTRY_KEYS.includes(camelCased)) {
        this.analysis.missing_from_registry.push({
          database_value: type,
          suggested_registry_key: camelCased,
          category: this.categorizeBlueprint(type)
        })
        console.log(`   ❌ "${type}" → Suggest adding "${camelCased}" to registry`)
      } else if (REGISTRY_KEYS.includes(camelCased)) {
        console.log(`   ✅ "${type}" → Registry has "${camelCased}"`)
      }
    })

    // 2. Analyze naming inconsistencies  
    console.log('\n2. NAMING INCONSISTENCIES IN HARDCODED REFERENCES:')
    const uniqueHardcoded = [...new Set(HARDCODED_REFERENCES)]
    
    uniqueHardcoded.forEach(ref => {
      const camelCased = this.toCamelCase(ref)
      
      if (REGISTRY_KEYS.includes(camelCased) && ref !== camelCased) {
        this.analysis.inconsistent_naming.push({
          hardcoded_reference: ref,
          correct_registry_key: camelCased
        })
        console.log(`   ❌ "${ref}" → Should use "${camelCased}"`)
      } else if (!REGISTRY_KEYS.includes(camelCased)) {
        console.log(`   ⚠️  "${ref}" → No registry equivalent found`)
      }
    })

    // 3. Identify legacy types that should be deprecated
    console.log('\n3. LEGACY TYPES THAT SHOULD BE MAPPED OR DEPRECATED:')
    const legacyTypes = ['task', 'task-list', 'test-scenario']
    legacyTypes.forEach(type => {
      const suggestion = this.suggestModernEquivalent(type)
      this.analysis.legacy_types.push({ type, suggestion })
      console.log(`   🔄 "${type}" → Map to "${suggestion}"`)
    })

    // 4. Registry completeness analysis
    console.log('\n4. REGISTRY COMPLETENESS ANALYSIS:')
    this.analyzeRegistryCompleteness()

    // 5. Generate recommendations
    console.log('\n5. ALIGNMENT RECOMMENDATIONS:')
    this.generateRecommendations()
  }

  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  }

  toKebabCase(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
  }

  categorizeBlueprint(type) {
    if (type.includes('experience') || type.includes('user') || type.includes('journey')) {
      return 'User Experience'
    }
    if (type.includes('task') || type.includes('feature') || type.includes('epic') || type.includes('workstream')) {
      return 'Planning & Execution'
    }
    if (type.includes('go-to-market') || type.includes('gtm')) {
      return 'Go-to-Market'
    }
    if (type.includes('test')) {
      return 'Development'
    }
    return 'Uncategorized'
  }

  suggestModernEquivalent(legacyType) {
    const mappings = {
      'task': 'features',
      'task-list': 'features', 
      'test-scenario': 'features',
      'go-to-market': 'gtmPlays',
      'user-journey': 'customerJourney',
      'experience-section': 'serviceBlueprints'
    }
    return mappings[legacyType] || 'unknown'
  }

  analyzeRegistryCompleteness() {
    const categoryGaps = [
      'User Experience: Missing user-journey, experience-section equivalents',
      'Development: Missing test-scenario, task management blueprints',
      'Workflow: Potential gaps in epic/feature hierarchy'
    ]
    
    categoryGaps.forEach(gap => {
      console.log(`   📋 ${gap}`)
    })
  }

  generateRecommendations() {
    console.log(`
PRIORITY ACTIONS:

🔥 HIGH PRIORITY:
1. Add missing blueprint configs for: ${this.analysis.missing_from_registry.map(m => m.suggested_registry_key).join(', ')}
2. Update MCP sequencing to use registry keys instead of kebab-case strings
3. Replace all hardcoded blueprint arrays with registry-based constants

📋 MEDIUM PRIORITY:  
4. Create legacy type mapping system for backward compatibility
5. Standardize customerExperience vs customerJourney naming
6. Add experienceSections as alias or separate blueprint

🧹 LOW PRIORITY:
7. Deprecate legacy task/test-scenario types
8. Create blueprint category validation
9. Add registry completeness tests

NEXT STEPS:
- Create missing blueprint config files
- Update registry with new blueprints
- Create centralized constants file
- Replace hardcoded references systematically
    `)
  }
}

// Run the analysis
const analyzer = new BlueprintAlignmentAnalyzer()
analyzer.analyzeAlignment()