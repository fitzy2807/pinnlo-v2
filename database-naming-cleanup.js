#!/usr/bin/env node

/**
 * Database Naming Convention Cleanup Script
 * 
 * This script systematically validates and fixes naming convention mismatches
 * between kebab-case database values and camelCase blueprint registry values.
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Blueprint registry naming (camelCase standard)
const BLUEPRINT_REGISTRY_NAMES = [
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

// Create kebab-case to camelCase mapping
const KEBAB_TO_CAMEL_MAPPING = {
  'strategic-context': 'strategicContext',
  'value-proposition': 'valuePropositions',
  'value-propositions': 'valuePropositions',
  'strategic-bet': 'strategicBet',
  'customer-journey': 'customerJourney',
  'swot-analysis': 'swotAnalysis',
  'competitive-analysis': 'competitiveAnalysis',
  'market-insight': 'marketInsight',
  'problem-statement': 'problemStatement',
  'business-model': 'businessModel',
  'gtm-play': 'gtmPlays',
  'gtm-plays': 'gtmPlays',
  'risk-assessment': 'riskAssessment',
  'service-blueprint': 'serviceBlueprints',
  'service-blueprints': 'serviceBlueprints',
  'organisational-capability': 'organisationalCapabilities',
  'organisational-capabilities': 'organisationalCapabilities',
  'tech-requirements': 'techRequirements',
  'technical-requirement': 'techRequirements',
  'technical-requirements': 'techRequirements',
  'financial-projections': 'financialProjections',
  'cost-driver': 'costDriver',
  'revenue-driver': 'revenueDriver',
  'market-intelligence': 'marketIntelligence',
  'competitor-intelligence': 'competitorIntelligence',
  'trends-intelligence': 'trendsIntelligence',
  'technology-intelligence': 'technologyIntelligence',
  'stakeholder-intelligence': 'stakeholderIntelligence',
  'consumer-intelligence': 'consumerIntelligence',
  'risk-intelligence': 'riskIntelligence',
  'opportunities-intelligence': 'opportunitiesIntelligence',
  'tech-stack': 'techStack',
  'tech-stack-enhanced': 'techStackEnhanced',
  // Add singular/plural variations
  'persona': 'personas',
  'okr': 'okrs',
  'kpi': 'kpis',
  'workstream': 'workstreams',
  'epic': 'epics',
  'feature': 'features'
}

// Tables and fields to validate
const VALIDATION_TARGETS = [
  { table: 'cards', field: 'card_type', description: 'Card types' },
  { table: 'ai_system_prompts', field: 'blueprint_type', description: 'AI system prompt blueprint types' },
  { table: 'ai_generation_history', field: 'blueprint_type', description: 'AI generation history blueprint types' },
  { table: 'ai_usage', field: 'blueprint_id', description: 'AI usage blueprint IDs' },
  { table: 'generation_history', field: 'blueprint_id', description: 'Generation history blueprint IDs' },
  { table: 'generation_rules', field: 'blueprint_type', description: 'Generation rules blueprint types' }
]

class DatabaseNamingValidator {
  constructor() {
    this.results = {
      validations: [],
      fixes: [],
      errors: []
    }
  }

  /**
   * Main validation and cleanup process
   */
  async run() {
    console.log('🔍 Starting Database Naming Convention Validation...\n')
    
    try {
      // 1. Validate all tables
      for (const target of VALIDATION_TARGETS) {
        await this.validateTable(target)
      }

      // 2. Display summary
      this.displaySummary()

      // 3. Execute fixes if mismatches found
      if (this.results.validations.some(v => v.mismatches.length > 0)) {
        console.log('\n🔧 Executing fixes...\n')
        await this.executeFixes()
      } else {
        console.log('\n✅ No naming convention mismatches found! Database is consistent.')
      }

      // 4. Final validation
      console.log('\n🔍 Running final validation...\n')
      await this.finalValidation()

    } catch (error) {
      console.error('❌ Validation failed:', error.message)
      this.results.errors.push(error.message)
    }
  }

  /**
   * Validate a specific table and field
   */
  async validateTable(target) {
    const { table, field, description } = target
    
    try {
      console.log(`📊 Validating ${description} (${table}.${field})...`)
      
      // Get all values from the table, then count locally
      const { data, error } = await supabase
        .from(table)
        .select(field)
        .not(field, 'is', null)

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log(`   ⚠️  Table ${table} or field ${field} does not exist - skipping`)
          return
        }
        throw error
      }

      if (!data || data.length === 0) {
        console.log(`   ℹ️  No data found in ${table}.${field}`)
        return
      }

      // Count occurrences locally
      const valueCounts = {}
      data.forEach(row => {
        const value = row[field]
        valueCounts[value] = (valueCounts[value] || 0) + 1
      })

      // Analyze values for naming convention mismatches
      const mismatches = []
      const validValues = []

      for (const [value, count] of Object.entries(valueCounts)) {
        if (this.isKebabCase(value) && KEBAB_TO_CAMEL_MAPPING[value]) {
          mismatches.push({
            current: value,
            correct: KEBAB_TO_CAMEL_MAPPING[value],
            count: count
          })
        } else if (BLUEPRINT_REGISTRY_NAMES.includes(value)) {
          validValues.push({ value, count })
        } else {
          // Check if it's an unknown blueprint type
          console.log(`   ⚠️  Unknown blueprint type: ${value} (${count} records)`)
        }
      }

      // Store validation results
      this.results.validations.push({
        table,
        field,
        description,
        mismatches,
        validValues,
        totalRecords: data.length
      })

      // Display results for this table
      if (mismatches.length > 0) {
        console.log(`   ❌ Found ${mismatches.length} naming mismatches:`)
        mismatches.forEach(m => {
          console.log(`      "${m.current}" → "${m.correct}" (${m.count} records)`)
        })
      } else {
        console.log(`   ✅ All values use correct camelCase naming`)
      }

      if (validValues.length > 0) {
        console.log(`   ✅ ${validValues.length} blueprint types already correctly named`)
      }

    } catch (error) {
      console.error(`   ❌ Error validating ${table}.${field}:`, error.message)
      this.results.errors.push(`${table}.${field}: ${error.message}`)
    }

    console.log('')
  }

  /**
   * Execute all fixes
   */
  async executeFixes() {
    for (const validation of this.results.validations) {
      if (validation.mismatches.length > 0) {
        await this.fixTable(validation)
      }
    }
  }

  /**
   * Fix naming conventions in a specific table
   */
  async fixTable(validation) {
    const { table, field, mismatches } = validation
    
    console.log(`🔧 Fixing ${table}.${field}...`)

    for (const mismatch of mismatches) {
      try {
        // First, check if the correct camelCase value already exists
        const { data: existing } = await supabase
          .from(table)
          .select('id')
          .eq(field, mismatch.correct)
          .limit(1)

        if (existing && existing.length > 0) {
          // Delete the kebab-case entries where camelCase equivalent exists
          console.log(`   🗑️  Deleting duplicate kebab-case entries: "${mismatch.current}"`)
          const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .eq(field, mismatch.current)

          if (deleteError) {
            throw deleteError
          }

          this.results.fixes.push({
            table,
            field,
            action: 'deleted_duplicates',
            from: mismatch.current,
            to: mismatch.correct,
            count: mismatch.count
          })
        } else {
          // Update kebab-case to camelCase
          console.log(`   ✏️  Updating: "${mismatch.current}" → "${mismatch.correct}"`)
          const { error: updateError } = await supabase
            .from(table)
            .update({ [field]: mismatch.correct })
            .eq(field, mismatch.current)

          if (updateError) {
            throw updateError
          }

          this.results.fixes.push({
            table,
            field,
            action: 'updated',
            from: mismatch.current,
            to: mismatch.correct,
            count: mismatch.count
          })
        }

        console.log(`   ✅ Successfully processed "${mismatch.current}"`)

      } catch (error) {
        console.error(`   ❌ Error fixing ${mismatch.current}:`, error.message)
        this.results.errors.push(`${table}.${field}: ${mismatch.current} - ${error.message}`)
      }
    }

    console.log('')
  }

  /**
   * Run final validation to confirm fixes
   */
  async finalValidation() {
    let allFixed = true

    for (const target of VALIDATION_TARGETS) {
      const { table, field } = target
      
      try {
        const { data, error } = await supabase
          .from(table)
          .select(field)
          .not(field, 'is', null)

        if (error && error.code !== '42P01') {
          throw error
        }

        if (data) {
          const remainingKebab = data.filter(row => 
            this.isKebabCase(row[field]) && KEBAB_TO_CAMEL_MAPPING[row[field]]
          )

          if (remainingKebab.length > 0) {
            console.log(`❌ ${table}.${field} still has kebab-case values:`, 
              remainingKebab.map(r => r[field]))
            allFixed = false
          }
        }
      } catch (error) {
        console.error(`Error in final validation of ${table}.${field}:`, error.message)
      }
    }

    if (allFixed) {
      console.log('✅ All naming conventions have been successfully standardized to camelCase!')
    } else {
      console.log('⚠️  Some issues remain - manual intervention may be required')
    }
  }

  /**
   * Display validation summary
   */
  displaySummary() {
    console.log('\n📋 VALIDATION SUMMARY')
    console.log('=' .repeat(50))

    let totalMismatches = 0
    let totalAffectedRecords = 0

    this.results.validations.forEach(validation => {
      const { table, field, mismatches, totalRecords } = validation
      const mismatchCount = mismatches.length
      const affectedRecords = mismatches.reduce((sum, m) => sum + m.count, 0)

      console.log(`${table}.${field}: ${mismatchCount} mismatches, ${affectedRecords}/${totalRecords} records affected`)
      
      totalMismatches += mismatchCount
      totalAffectedRecords += affectedRecords
    })

    console.log('=' .repeat(50))
    console.log(`Total: ${totalMismatches} naming mismatches affecting ${totalAffectedRecords} records`)

    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:')
      this.results.errors.forEach(error => console.log(`   ${error}`))
    }
  }

  /**
   * Check if a string is kebab-case
   */
  isKebabCase(str) {
    return typeof str === 'string' && str.includes('-') && str === str.toLowerCase()
  }
}

// Run the validation
async function main() {
  const validator = new DatabaseNamingValidator()
  await validator.run()
  
  console.log('\n🎉 Database naming convention cleanup completed!')
  process.exit(0)
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error)
    process.exit(1)
  })
}

module.exports = { DatabaseNamingValidator }