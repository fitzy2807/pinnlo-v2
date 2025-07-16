# Blueprint Naming Mismatch Troubleshooting Guide

## Overview

This document explains a common issue in the Pinnlo V2 AI generation system where blueprint naming mismatches between the frontend registry and database cause "No active prompt found" errors.

## System Architecture Context

### How AI Generation Works
```
User clicks "AI Generate" 
→ Frontend sends blueprint type (e.g., "strategicContext")
→ MCP server queries database for matching prompt
→ Database lookup: WHERE blueprint_type = 'strategicContext'
→ AI generation with retrieved prompt
```

### Key Components
- **Frontend Blueprint Registry**: `/src/components/blueprints/registry.ts` - Uses camelCase naming
- **Database Prompts**: `ai_system_prompts` table - May use kebab-case naming
- **MCP Server**: `/supabase-mcp/src/tools/edit-mode-generator.ts` - Bridges frontend and database

## The Problem

### Error Pattern
```
Error: No active prompt found for blueprint type: strategicContext
```

### Root Cause
**Naming convention mismatch** between what the frontend sends vs what's stored in the database:

- **Frontend sends**: `strategicContext` (camelCase from blueprint registry)
- **Database has**: `strategic-context` (kebab-case from initial data population)
- **Database query fails**: No match found → Error thrown

### Why This Happens
1. Blueprint registry uses camelCase for consistency with JavaScript naming
2. Database records were populated with kebab-case names
3. No automatic conversion between naming conventions
4. Hard failure when exact match not found

## Diagnosing the Issue

### 1. Check Current Database State
```sql
-- See all active prompts in database
SELECT 
    blueprint_type,
    prompt_name,
    is_active,
    times_used,
    last_used_at
FROM ai_system_prompts 
WHERE is_active = true
ORDER BY blueprint_type;
```

### 2. Identify Missing vs Existing Prompts
```sql
-- Combined analysis: what exists vs what's missing
SELECT 
    'EXISTING PROMPTS' as section,
    blueprint_type as name,
    prompt_name as details,
    CONCAT('Model: ', model_preference, ', Temp: ', temperature, ', Tokens: ', max_tokens) as config
FROM ai_system_prompts 
WHERE is_active = true

UNION ALL

SELECT 
    'MISSING BLUEPRINTS' as section,
    missing_blueprint as name,
    'NO PROMPT RECORD' as details,
    'NEEDS TO BE CREATED' as config
FROM (
    SELECT unnest(ARRAY[
        'strategicContext', 'vision', 'valuePropositions', 'personas', 
        'customerExperience', 'swotAnalysis', 'competitiveAnalysis', 'okrs', 
        'businessModel', 'goToMarket', 'riskAssessment', 'roadmap', 
        'kpis', 'financialProjections', 'epics', 'features',
        'experienceSections', 'serviceBlueprintsBlueprints', 'userJourneys',
        'techRequirements', 'techStack', 'strategicBet'
        -- Add more blueprint types as needed
    ]) AS missing_blueprint
) candidates
WHERE missing_blueprint NOT IN (
    SELECT blueprint_type FROM ai_system_prompts WHERE is_active = true
)

ORDER BY section DESC, name;
```

### 3. Find All Kebab-Case Names
```sql
-- Find all kebab-case names that might need converting
SELECT blueprint_type, prompt_name 
FROM ai_system_prompts 
WHERE blueprint_type LIKE '%-%' 
ORDER BY blueprint_type;
```

## Resolution Process

### Step 1: Identify the Mismatch
When you see an error like:
```
Error: No active prompt found for blueprint type: strategicContext
```

1. **Check what frontend is sending**: `strategicContext` (from error message)
2. **Check what database has**: Look for similar names with dashes
3. **Confirm the mismatch**: `strategic-context` exists but `strategicContext` doesn't

### Step 2: Fix Individual Mismatches
```sql
-- Template for fixing individual mismatches
UPDATE ai_system_prompts 
SET blueprint_type = 'strategicContext' 
WHERE blueprint_type = 'strategic-context' AND is_active = true;
```

### Step 3: Verify the Fix
```sql
-- Confirm the update worked
SELECT blueprint_type, prompt_name 
FROM ai_system_prompts 
WHERE blueprint_type = 'strategicContext';
```

### Step 4: Test AI Generation
- Go to the card that was failing
- Click "AI Generate"
- Should work immediately

## Common Naming Patterns

### Kebab-Case → CamelCase Conversions
```sql
-- Strategic Context
UPDATE ai_system_prompts SET blueprint_type = 'strategicContext' WHERE blueprint_type = 'strategic-context' AND is_active = true;

-- Customer Journey/Experience
UPDATE ai_system_prompts SET blueprint_type = 'customerExperience' WHERE blueprint_type = 'customer-journey' AND is_active = true;

-- Experience Sections
UPDATE ai_system_prompts SET blueprint_type = 'experienceSections' WHERE blueprint_type = 'experience-section' AND is_active = true;

-- SWOT Analysis
UPDATE ai_system_prompts SET blueprint_type = 'swotAnalysis' WHERE blueprint_type = 'swot-analysis' AND is_active = true;

-- Competitive Analysis
UPDATE ai_system_prompts SET blueprint_type = 'competitiveAnalysis' WHERE blueprint_type = 'competitive-analysis' AND is_active = true;

-- Go-to-Market
UPDATE ai_system_prompts SET blueprint_type = 'goToMarket' WHERE blueprint_type = 'go-to-market' AND is_active = true;

-- Tech Requirements
UPDATE ai_system_prompts SET blueprint_type = 'techRequirements' WHERE blueprint_type = 'tech-requirements' AND is_active = true;

-- Value Propositions
UPDATE ai_system_prompts SET blueprint_type = 'valuePropositions' WHERE blueprint_type = 'value-propositions' AND is_active = true;

-- Strategic Bet
UPDATE ai_system_prompts SET blueprint_type = 'strategicBet' WHERE blueprint_type = 'strategic-bet' AND is_active = true;

-- Tech Stack
UPDATE ai_system_prompts SET blueprint_type = 'techStack' WHERE blueprint_type = 'tech-stack' AND is_active = true;

-- Service Blueprints
UPDATE ai_system_prompts SET blueprint_type = 'serviceBlueprintsBlueprints' WHERE blueprint_type = 'service-blueprints' AND is_active = true;

-- User Journeys
UPDATE ai_system_prompts SET blueprint_type = 'userJourneys' WHERE blueprint_type = 'user-journeys' AND is_active = true;
```

## Prevention Strategies

### 1. Use System Prompt Manager
Instead of manual database inserts, use the System Prompt Manager UI in the Agent Hub:
- Location: `/src/components/agent-hub/agents/SystemPromptManager.tsx`
- Provides interface to view and edit existing prompts
- Helps maintain consistency

### 2. Naming Convention Standards
**Database Standard**: Use camelCase to match frontend blueprint registry
```sql
-- Good: camelCase
blueprint_type = 'strategicContext'

-- Avoid: kebab-case
blueprint_type = 'strategic-context'
```

### 3. Blueprint Registry Reference
Always check `/src/components/blueprints/registry.ts` for the exact naming used in the frontend:
```typescript
export const BLUEPRINT_REGISTRY: Record<string, BlueprintConfig> = {
  'strategicContext': strategicContextConfig,  // Use this exact name
  'customerExperience': customerJourneyConfig, // Not 'customer-journey'
  // ...
}
```

### 4. Validation Query
Run this before adding new blueprint types:
```sql
-- Check if blueprint type already exists
SELECT blueprint_type, prompt_name 
FROM ai_system_prompts 
WHERE blueprint_type = 'YOUR_BLUEPRINT_TYPE' AND is_active = true;
```

## Troubleshooting Checklist

When you encounter "No active prompt found" errors:

1. **✅ Identify the blueprint type** from the error message
2. **✅ Check database for similar names** with dashes or different casing
3. **✅ Run the diagnostic query** to see all existing vs missing prompts
4. **✅ Update the database record** to match frontend naming
5. **✅ Verify the fix** with a SELECT query
6. **✅ Test AI generation** on the affected card type
7. **✅ Document the change** if it's a new pattern

## Quick Reference

### Most Common Fixes
```sql
-- Fix the top 5 most common mismatches
UPDATE ai_system_prompts SET blueprint_type = 'strategicContext' WHERE blueprint_type = 'strategic-context' AND is_active = true;
UPDATE ai_system_prompts SET blueprint_type = 'customerExperience' WHERE blueprint_type = 'customer-journey' AND is_active = true;
UPDATE ai_system_prompts SET blueprint_type = 'experienceSections' WHERE blueprint_type = 'experience-section' AND is_active = true;
UPDATE ai_system_prompts SET blueprint_type = 'swotAnalysis' WHERE blueprint_type = 'swot-analysis' AND is_active = true;
UPDATE ai_system_prompts SET blueprint_type = 'competitiveAnalysis' WHERE blueprint_type = 'competitive-analysis' AND is_active = true;
```

### Verification Commands
```sql
-- See what was updated
SELECT blueprint_type, prompt_name, updated_at 
FROM ai_system_prompts 
WHERE blueprint_type IN ('strategicContext', 'customerExperience', 'experienceSections', 'swotAnalysis', 'competitiveAnalysis')
ORDER BY updated_at DESC;
```

## System Health Check

Run this comprehensive query periodically to ensure naming consistency:
```sql
-- System health check - find all potential mismatches
SELECT 
    blueprint_type,
    CASE 
        WHEN blueprint_type LIKE '%-%' THEN '⚠️ KEBAB-CASE (may need conversion)'
        WHEN blueprint_type ~ '[A-Z]' THEN '✅ CAMELCASE (correct)'
        ELSE '❓ UNKNOWN PATTERN'
    END as naming_pattern,
    prompt_name,
    times_used,
    last_used_at
FROM ai_system_prompts 
WHERE is_active = true
ORDER BY naming_pattern, blueprint_type;
```

This will help identify potential naming issues before they cause AI generation failures.

---

## Summary

The blueprint naming mismatch is a systematic issue caused by inconsistent naming conventions between frontend and database. The solution is straightforward: ensure database `blueprint_type` values match exactly what the frontend blueprint registry sends. Use the SQL queries in this guide to quickly identify and fix these mismatches as they arise.