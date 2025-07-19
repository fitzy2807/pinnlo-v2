const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixValuePropositionConstraint() {
  try {
    console.log('Fixing value proposition constraint...');
    
    // Drop the existing constraint
    console.log('Dropping existing constraint...');
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_card_type_check;' 
    });
    
    if (dropError) {
      console.error('Error dropping constraint:', dropError);
      return;
    }
    
    // Add the new constraint with valuePropositions included (removing regex pattern)
    console.log('Adding updated constraint...');
    const constraintSQL = `
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
    `;
    
    const { error: addError } = await supabase.rpc('exec_sql', { sql: constraintSQL });
    
    if (addError) {
      console.error('Error adding constraint:', addError);
      return;
    }
    
    console.log('Value proposition constraint fix applied successfully!');
    console.log('Now "valuePropositions" should be accepted.');
    
  } catch (error) {
    console.error('Error applying constraint fix:', error);
  }
}

fixValuePropositionConstraint();