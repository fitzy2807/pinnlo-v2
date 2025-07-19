const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixConstraint() {
  try {
    console.log('🔧 Fixing cards constraint to accept both naming conventions...');
    
    // Use the SQL directly since we have the DATABASE_URL
    const { data, error } = await supabase
      .from('cards')
      .select('card_type')
      .limit(1);
    
    if (error) {
      console.error('Error testing database connection:', error);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Let's test what happens when we try to create a value proposition card
    // First, get a strategy ID to use
    const { data: strategies, error: strategyError } = await supabase
      .from('strategies')
      .select('id')
      .limit(1);
    
    if (strategyError || !strategies || strategies.length === 0) {
      console.error('Error getting strategy:', strategyError);
      return;
    }
    
    const strategyId = strategies[0].id;
    
    // Test creating a card with 'valuePropositions' to see the exact error
    console.log('🧪 Testing valuePropositions card creation...');
    const { data: testCard, error: testError } = await supabase
      .from('cards')
      .insert({
        strategy_id: strategyId,
        title: 'Test Value Proposition',
        description: 'Test description',
        card_type: 'valuePropositions',
        priority: 'Medium',
        confidence_level: 'Medium'
      });
    
    if (testError) {
      console.error('❌ Error creating valuePropositions card:', testError.message);
      console.log('This confirms the constraint issue exists');
      
      // Now create a script to fix the constraint
      console.log('📝 The database constraint needs to be updated to include "valuePropositions"');
      console.log('Since we cannot execute DDL directly, please run this SQL in your database:');
      console.log('');
      console.log('-- Fix constraint to accept both naming conventions');
      console.log('ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_card_type_check;');
      console.log('ALTER TABLE cards ADD CONSTRAINT cards_card_type_check CHECK (');
      console.log('  card_type IN (');
      console.log('    -- Core Strategy');
      console.log('    \'strategic-context\', \'strategicContext\', \'vision\', \'value-proposition\', \'valuePropositions\',');
      console.log('    -- Research & Analysis');
      console.log('    \'personas\', \'customer-journey\', \'swot-analysis\', \'competitive-analysis\',');
      console.log('    -- Planning & Execution');
      console.log('    \'okrs\', \'problem-statement\', \'workstreams\', \'epics\', \'features\', \'business-model\',');
      console.log('    \'risk-assessment\', \'roadmap\', \'prd\', \'trd\', \'technical-requirements\',');
      console.log('    -- Measurement');
      console.log('    \'kpis\', \'financial-projections\', \'cost-driver\', \'revenue-driver\',');
      console.log('    -- Task System');
      console.log('    \'task-list\', \'task\',');
      console.log('    -- Template');
      console.log('    \'template\'');
      console.log('  )');
      console.log(');');
      console.log('');
      console.log('Or run this command with a PostgreSQL client:');
      console.log('psql "$DATABASE_URL" -c "ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_card_type_check; ALTER TABLE cards ADD CONSTRAINT cards_card_type_check CHECK (card_type IN (\'strategic-context\', \'strategicContext\', \'vision\', \'value-proposition\', \'valuePropositions\', \'personas\', \'customer-journey\', \'swot-analysis\', \'competitive-analysis\', \'okrs\', \'problem-statement\', \'workstreams\', \'epics\', \'features\', \'business-model\', \'risk-assessment\', \'roadmap\', \'prd\', \'trd\', \'technical-requirements\', \'kpis\', \'financial-projections\', \'cost-driver\', \'revenue-driver\', \'task-list\', \'task\', \'template\'));"');
      
    } else {
      console.log('✅ valuePropositions card created successfully');
      console.log('The issue might be elsewhere in the application');
      
      // Clean up the test card
      if (testCard && testCard.length > 0) {
        await supabase.from('cards').delete().eq('id', testCard[0].id);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixConstraint();