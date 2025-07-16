import { getAllBlueprints, BLUEPRINT_REGISTRY } from './components/blueprints/registry'

console.log('=== Blueprint Registry Test ===')
console.log(`Total blueprints in BLUEPRINT_REGISTRY: ${Object.keys(BLUEPRINT_REGISTRY).length}`)
console.log('\nBlueprint IDs:', Object.keys(BLUEPRINT_REGISTRY).sort())

const allBlueprints = getAllBlueprints()
console.log(`\ngetAllBlueprints() returns: ${allBlueprints.length} blueprints`)

// Check for missing required fields
const issues: string[] = []
allBlueprints.forEach(blueprint => {
  const problems: string[] = []
  
  if (!blueprint.id) problems.push('missing id')
  if (!blueprint.name) problems.push('missing name')
  if (!blueprint.description) problems.push('missing description')
  if (!blueprint.category) problems.push('missing category')
  if (!blueprint.icon) problems.push('missing icon')
  if (!blueprint.fields) problems.push('missing fields')
  if (!blueprint.defaultValues) problems.push('missing defaultValues')
  if (!blueprint.validation) problems.push('missing validation')
  
  if (problems.length > 0) {
    issues.push(`${blueprint.id || 'UNKNOWN'}: ${problems.join(', ')}`)
  }
})

if (issues.length > 0) {
  console.log('\n⚠️  Blueprints with issues:')
  issues.forEach(issue => console.log(`  - ${issue}`))
} else {
  console.log('\n✅ All blueprints have required fields')
}

// Group by category
const byCategory: Record<string, string[]> = {}
allBlueprints.forEach(bp => {
  if (!byCategory[bp.category]) byCategory[bp.category] = []
  byCategory[bp.category].push(bp.name)
})

console.log('\n📊 Blueprints by category:')
Object.entries(byCategory).forEach(([category, names]) => {
  console.log(`\n${category} (${names.length}):`)
  names.forEach(name => console.log(`  - ${name}`))
})