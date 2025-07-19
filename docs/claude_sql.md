# Claude SQL Database Management Guide

This document provides Claude Code sessions with direct database access patterns and maintenance scripts for PINNLO v2.

## Database Connection

PINNLO v2 uses Supabase PostgreSQL with the following connection details:

```javascript
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

**Connection String:** Available in `.env.local` as `DATABASE_URL`

## Blueprint Naming Convention Standards

PINNLO v2 uses **camelCase** naming throughout the system to match the blueprint registry:

### Standard Blueprint Names (camelCase)
```
strategicContext, vision, valuePropositions, strategicBet, personas, customerJourney, 
swotAnalysis, competitiveAnalysis, marketInsight, experiment, okrs, problemStatement, 
workstreams, epics, features, businessModel, gtmPlays, riskAssessment, roadmap, 
serviceBlueprints, organisationalCapabilities, techRequirements, kpis, 
financialProjections, costDriver, revenueDriver, template, organisation, company, 
department, team, person, marketIntelligence, competitorIntelligence, 
trendsIntelligence, technologyIntelligence, stakeholderIntelligence, 
consumerIntelligence, riskIntelligence, opportunitiesIntelligence, prd, trd, 
techStack, techStackEnhanced
```

### Legacy Kebab-Case Mappings
```javascript
const KEBAB_TO_CAMEL_MAPPING = {
  'strategic-context': 'strategicContext',
  'value-proposition': 'valuePropositions',
  'customer-journey': 'customerJourney',
  'problem-statement': 'problemStatement',
  'business-model': 'businessModel',
  // ... (see database-naming-cleanup.js for full mapping)
}
```

## Database Tables with Blueprint References

### Core Tables
- `cards.card_type` - Card blueprint types
- `card_creator_system_prompts.section_id` - System prompt section IDs

### AI/Generation Tables  
- `ai_system_prompts.blueprint_type` - AI prompt blueprint types
- `ai_generation_history.blueprint_type` - Generation history blueprint types
- `generation_history.blueprint_id` - Generation blueprint IDs

### Usage/Analytics Tables
- `ai_usage.blueprint_id` - AI usage blueprint IDs

## Database Maintenance Scripts

### 1. Naming Convention Cleanup Script

Location: `/database-naming-cleanup.js`

**Purpose:** Systematically validates and fixes naming convention mismatches between kebab-case database values and camelCase blueprint registry.

**Usage:**
```bash
node database-naming-cleanup.js
```

**Key Features:**
- Validates all tables with blueprint references
- Identifies kebab-case to camelCase mismatches
- Handles duplicate records (deletes kebab-case where camelCase exists)
- Updates remaining kebab-case to camelCase
- Provides comprehensive validation reporting

### 2. Quick Database Validation

For quick checks, use this pattern:

```javascript
// Check for naming mismatches in any table
const { data } = await supabase
  .from('table_name')
  .select('field_name')
  .not('field_name', 'is', null)

const kebabValues = data
  .map(row => row.field_name)
  .filter(value => value.includes('-'))

console.log('Kebab-case values found:', kebabValues)
```

### 3. Strategic Blueprint Settings Validation

```javascript
// Validate strategy-specific blueprint selections
const { data } = await supabase
  .from('cards')
  .select('card_type, strategy_id')
  .not('card_type', 'is', null)

// Group by strategy to see blueprint usage
const strategyCounts = {}
data.forEach(card => {
  if (!strategyCounts[card.strategy_id]) strategyCounts[card.strategy_id] = {}
  strategyCounts[card.strategy_id][card.card_type] = 
    (strategyCounts[card.strategy_id][card.card_type] || 0) + 1
})
```

## Common Database Tasks

### Fix Single Table Naming
```javascript
// Update specific table field from kebab-case to camelCase
const { error } = await supabase
  .from('table_name')
  .update({ field_name: 'camelCaseValue' })
  .eq('field_name', 'kebab-case-value')
```

### Validate Blueprint Registry Consistency
```javascript
// Compare database values against blueprint registry
import { BLUEPRINT_REGISTRY } from './src/components/blueprints/registry'

const registryKeys = Object.keys(BLUEPRINT_REGISTRY)
const { data } = await supabase
  .from('cards')
  .select('card_type')
  .not('card_type', 'is', null)

const databaseTypes = [...new Set(data.map(row => row.card_type))]
const missingInRegistry = databaseTypes.filter(type => !registryKeys.includes(type))
const missingInDatabase = registryKeys.filter(key => !databaseTypes.includes(key))

console.log('Types in DB but not registry:', missingInRegistry)
console.log('Types in registry but not DB:', missingInDatabase)
```

## Database Schema Reference

### Cards Table Structure
```sql
cards (
  id UUID PRIMARY KEY,
  card_type TEXT,           -- Blueprint type (camelCase)
  strategy_id UUID,         -- Strategy reference
  title TEXT,
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### System Prompts Table Structure  
```sql
card_creator_system_prompts (
  id UUID PRIMARY KEY,
  prompt_type TEXT,         -- 'blueprint', 'intelligence', 'development'
  section_id TEXT,          -- Blueprint name (camelCase)
  display_name TEXT,
  preview_prompt TEXT,
  generation_prompt TEXT,
  config JSONB
)
```

## Strategy-Specific Features

### Blueprint Selection Persistence
- Strategy-specific blueprint selections stored in localStorage
- Key format: `strategyBlueprintSelections`
- Structure: `{ [strategyId]: { [hubName]: string[] } }`

### Default Blueprint Sets
- Strategy Hub: First 7 priority blueprints from registry
- Intelligence Hub: `['marketIntelligence', 'competitorIntelligence', 'trendsIntelligence']`
- Development Hub: `['prd', 'trd', 'techStack']`
- Organisation Hub: `['company', 'team', 'person']`

## Troubleshooting

### Common Issues
1. **Kebab-case values appearing**: Run `database-naming-cleanup.js`
2. **Unknown blueprint types**: Check against `BLUEPRINT_REGISTRY` in `/src/components/blueprints/registry.ts`
3. **Strategy settings not persisting**: Check localStorage and `LeftNavigation.tsx` implementation

### Validation Commands
```bash
# Full database cleanup
node database-naming-cleanup.js

# Check for specific issues
npm run lint
npm run typecheck
```

## Last Updated
- **Database Cleanup**: 2025-01-19 - Standardized 43 naming mismatches across 130 records
- **Strategy-First Navigation**: 2025-01-19 - Implemented strategy-specific blueprint persistence

---

*This guide ensures future Claude Code sessions can immediately understand and maintain the PINNLO v2 database structure and naming conventions.*