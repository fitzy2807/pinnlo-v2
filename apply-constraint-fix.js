const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyConstraintFix() {
  try {
    console.log('Applying database constraint fix...');
    
    // Drop the existing constraint
    console.log('Dropping existing constraint...');
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_card_type_check;' 
    });
    
    if (dropError) {
      console.error('Error dropping constraint:', dropError);
      return;
    }
    
    // Add the new constraint with all valid card types
    console.log('Adding new constraint...');
    const constraintSQL = `
      ALTER TABLE cards ADD CONSTRAINT cards_card_type_check 
      CHECK (card_type IN (
        'strategic-context', 'strategicContext', 'vision', 'value-proposition', 'valuePropositions',
        'personas', 'customer-journey', 'swot-analysis', 'competitive-analysis',
        'market-intelligence', 'competitor-intelligence', 'trends-intelligence', 
        'technology-intelligence', 'stakeholder-intelligence', 'consumer-intelligence',
        'risk-intelligence', 'opportunities-intelligence', 'market-insight', 'experiment',
        'okrs', 'problem-statement', 'workstreams', 'epics', 'features', 'business-model',
        'gtmPlays', 'gtm-play', 'go-to-market', 'risk-assessment', 'roadmap',
        'prd', 'product-requirements', 'trd', 'technical-requirements', 'technical-requirement',
        'technical-requirement-structured', 'serviceBlueprints', 'service-blueprint',
        'organisationalCapabilities', 'organisational-capability', 'techStack', 'tech-stack',
        'tech-stack-enhanced', 'techRequirements', 'tech-requirements',
        'kpis', 'financial-projections', 'cost-driver', 'revenue-driver',
        'task-list', 'task', 'template',
        'organisation', 'company', 'department', 'team', 'person',
        'feature', 'strategic-bet'
      ));
    `;
    
    const { error: addError } = await supabase.rpc('exec_sql', { sql: constraintSQL });
    
    if (addError) {
      console.error('Error adding constraint:', addError);
      return;
    }
    
    console.log('Database constraint fix applied successfully!');
    console.log('Now both "value-proposition" and "valuePropositions" should be accepted.');
    
  } catch (error) {
    console.error('Error applying constraint fix:', error);
  }
}

applyConstraintFix();