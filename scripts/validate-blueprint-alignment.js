#!/usr/bin/env node

/**
 * Blueprint Registry Alignment Validation
 * 
 * This script ensures that all blueprint references throughout the codebase
 * are consistent with the blueprint registry. It's designed to be run in CI/CD
 * to prevent blueprint naming drift.
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

// Import registry keys
const registryPath = path.join(__dirname, '../src/components/blueprints/registry.ts')

class BlueprintAlignmentValidator {
  constructor() {
    this.errors = []
    this.warnings = []
    this.info = []
    this.registryKeys = []
  }

  async validateAlignment() {
    console.log('🔍 Blueprint Registry Alignment Validation\n')
    
    try {
      // 1. Load registry keys
      await this.loadRegistryKeys()
      
      // 2. Validate imports
      await this.validateBlueprintImports()
      
      // 3. Check for hardcoded references
      await this.scanForHardcodedReferences()
      
      // 4. Validate database consistency
      await this.validateDatabaseConsistency()
      
      // 5. Generate report
      this.generateReport()
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message)
      process.exit(1)
    }
  }

  async loadRegistryKeys() {
    try {
      // Read registry file and extract keys
      const registryContent = fs.readFileSync(registryPath, 'utf8')
      const registryMatch = registryContent.match(/export const BLUEPRINT_REGISTRY[^}]+}/gs)
      
      if (registryMatch) {
        // Extract keys using regex
        const keyMatches = registryMatch[0].match(/'([^']+)':/g)
        this.registryKeys = keyMatches ? keyMatches.map(match => match.slice(1, -2)) : []
        console.log(`✅ Loaded ${this.registryKeys.length} blueprint keys from registry`)
      } else {
        throw new Error('Could not parse BLUEPRINT_REGISTRY from registry.ts')
      }
    } catch (error) {
      throw new Error(`Failed to load registry keys: ${error.message}`)
    }
  }

  async validateBlueprintImports() {
    console.log('\n📦 Validating Blueprint Imports...')
    
    const srcPath = path.join(__dirname, '../src')
    const filesToCheck = await this.findTSFiles(srcPath)
    
    for (const filePath of filesToCheck) {
      await this.checkFileImports(filePath)
    }
  }

  async findTSFiles(dir) {
    const files = []
    
    const traverse = (currentDir) => {
      const entries = fs.readdirSync(currentDir)
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          traverse(fullPath)
        } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
          files.push(fullPath)
        }
      }
    }
    
    traverse(dir)
    return files
  }

  async checkFileImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const relativePath = path.relative(process.cwd(), filePath)
    
    // Check for hardcoded blueprint arrays
    const hardcodedArrays = content.match(/\[([\s\S]*?'[^']*-[^']*'[\s\S]*?)\]/g)
    if (hardcodedArrays) {
      hardcodedArrays.forEach(match => {
        if (match.includes('-')) {
          this.warnings.push(`${relativePath}: Found hardcoded kebab-case blueprint array: ${match.slice(0, 50)}...`)
        }
      })
    }
    
    // Check for hardcoded switch statements
    const switchStatements = content.match(/switch\s*\([^)]+\)\s*{[^}]*case\s*['"][^'"]*-[^'"]*['"][^}]*}/gs)
    if (switchStatements) {
      this.warnings.push(`${relativePath}: Found switch statement with kebab-case blueprint cases`)
    }
    
    // Check for proper constant imports
    const hasConstants = content.includes('from \'@/utils/blueprintConstants\'') || 
                        content.includes('from \'./blueprintConstants\'')
    const hasHardcoded = content.match(/'(strategic-context|value-proposition|customer-journey)'/g)
    
    if (hasHardcoded && !hasConstants) {
      this.warnings.push(`${relativePath}: Has hardcoded blueprint references but no blueprintConstants import`)
    }
  }

  async scanForHardcodedReferences() {
    console.log('\n🔍 Scanning for Hardcoded References...')
    
    return new Promise((resolve) => {
      // Use grep to find potential hardcoded references
      exec('grep -r --include="*.ts" --include="*.tsx" "strategic-context\\|value-proposition\\|customer-journey" src/', 
        (error, stdout, stderr) => {
          if (stdout) {
            const lines = stdout.trim().split('\n')
            lines.forEach(line => {
              if (!line.includes('blueprintConstants') && !line.includes('// legacy')) {
                this.warnings.push(`Potential hardcoded reference: ${line.slice(0, 100)}...`)
              }
            })
          }
          resolve()
        })
    })
  }

  async validateDatabaseConsistency() {
    console.log('\n🗄️ Validating Database Consistency...')
    
    // Check if database cleanup script exists
    const cleanupScriptPath = path.join(__dirname, '../database-naming-cleanup.js')
    if (fs.existsSync(cleanupScriptPath)) {
      this.info.push('✅ Database cleanup script available')
      
      // TODO: Could run the script in dry-run mode to check for mismatches
      this.info.push('💡 Consider running database-naming-cleanup.js to verify database consistency')
    } else {
      this.warnings.push('⚠️ Database cleanup script not found')
    }
  }

  generateReport() {
    console.log('\n📋 VALIDATION REPORT')
    console.log('=' .repeat(50))
    
    console.log(`\n✅ REGISTRY STATUS:`)
    console.log(`   Blueprints in registry: ${this.registryKeys.length}`)
    console.log(`   Registry keys: ${this.registryKeys.slice(0, 5).join(', ')}...`)
    
    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORS (${this.errors.length}):`)
      this.errors.forEach(error => console.log(`   ${error}`))
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️ WARNINGS (${this.warnings.length}):`)
      this.warnings.forEach(warning => console.log(`   ${warning}`))
    }
    
    if (this.info.length > 0) {
      console.log(`\n💡 INFO (${this.info.length}):`)
      this.info.forEach(info => console.log(`   ${info}`))
    }
    
    console.log('\n📈 RECOMMENDATIONS:')
    
    if (this.warnings.length > 5) {
      console.log('   🔥 HIGH: Multiple hardcoded references found - consider systematic replacement')
    }
    
    if (this.warnings.some(w => w.includes('switch statement'))) {
      console.log('   📋 MEDIUM: Replace switch statements with registry-based lookups')
    }
    
    console.log('   ✨ Use blueprintConstants for all blueprint references')
    console.log('   🔄 Run database-naming-cleanup.js periodically to maintain consistency')
    console.log('   🧪 Add this script to CI/CD pipeline to prevent drift')
    
    console.log('\n' + '=' .repeat(50))
    
    if (this.errors.length > 0) {
      console.log('❌ Validation failed with errors')
      process.exit(1)
    } else if (this.warnings.length > 10) {
      console.log('⚠️ Validation passed with significant warnings')
      process.exit(1)
    } else {
      console.log('✅ Blueprint alignment validation passed')
      process.exit(0)
    }
  }
}

// Run validation
async function main() {
  const validator = new BlueprintAlignmentValidator()
  await validator.validateAlignment()
}

if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error)
    process.exit(1)
  })
}

module.exports = { BlueprintAlignmentValidator }