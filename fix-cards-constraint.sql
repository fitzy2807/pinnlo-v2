-- Migration: Fix cards table constraint to include all valid card types
-- Created: 2025-07-18
-- Purpose: Fix constraint error by adding all valid card types from blueprint registry

-- Drop the existing constraint
ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_card_type_check;

-- Add updated constraint with all valid card types from the blueprint registry
ALTER TABLE cards ADD CONSTRAINT cards_card_type_check 
  CHECK (card_type IN (
    -- Core Strategy
    'strategic-context', 'strategicContext', 'vision', 'value-proposition', 'valuePropositions',
    
    -- Research & Analysis
    'personas', 'customer-journey', 'swot-analysis', 'competitive-analysis',
    'market-intelligence', 'competitor-intelligence', 'trends-intelligence', 
    'technology-intelligence', 'stakeholder-intelligence', 'consumer-intelligence',
    'risk-intelligence', 'opportunities-intelligence', 'market-insight', 'experiment',
    
    -- Planning & Execution
    'okrs', 'problem-statement', 'workstreams', 'epics', 'features', 'business-model',
    'gtmPlays', 'gtm-play', 'go-to-market', 'risk-assessment', 'roadmap',
    'prd', 'product-requirements', 'trd', 'technical-requirements', 'technical-requirement',
    'technical-requirement-structured',
    
    -- User Experience
    'serviceBlueprints', 'service-blueprint',
    
    -- Organizational & Technical
    'organisationalCapabilities', 'organisational-capability', 'techStack', 'tech-stack',
    'tech-stack-enhanced', 'techRequirements', 'tech-requirements',
    
    -- Measurement
    'kpis', 'financial-projections', 'cost-driver', 'revenue-driver',
    
    -- Task System
    'task-list', 'task',
    
    -- Template
    'template',
    
    -- Organisation
    'organisation', 'company', 'department', 'team', 'person',
    
    -- Development
    'feature', 'strategic-bet'
  ));

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT cards_card_type_check ON cards IS 'Ensures card_type matches valid blueprint types from the registry, supporting both kebab-case and camelCase variants';