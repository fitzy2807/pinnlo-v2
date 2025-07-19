-- Direct SQL fix for value proposition constraint
-- This should be applied to the database directly

-- Drop the existing constraint
ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_card_type_check;

-- Add the new constraint with valuePropositions included
ALTER TABLE cards ADD CONSTRAINT cards_card_type_check 
CHECK (card_type IN (
  -- Existing types
  'strategic-context', 'vision', 'value-proposition', 'valuePropositions', 'personas', 'customer-journey', 
  'swot-analysis', 'competitive-analysis', 'okrs', 'business-model', 'go-to-market',
  'risk-assessment', 'roadmap', 'kpis', 'financial-projections', 'feature',
  'technical-requirement-structured',
  -- Task system types
  'task-list', 'task'
));

-- Verify the fix
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE table_name = 'cards' AND constraint_name = 'cards_card_type_check';