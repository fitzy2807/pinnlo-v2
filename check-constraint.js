const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConstraint() {
  try {
    console.log('Checking current constraint...');
    
    // Query to check the constraint
    const { data, error } = await supabase
      .from('information_schema.check_constraints')
      .select('constraint_name, check_clause')
      .eq('table_name', 'cards')
      .eq('constraint_name', 'cards_card_type_check');
    
    if (error) {
      console.error('Error querying constraint:', error);
      return;
    }
    
    console.log('Current constraint:', data);
    
    // Test if value-proposition works
    console.log('Testing value-proposition insertion...');
    const { data: testData, error: testError } = await supabase
      .from('cards')
      .insert({
        strategy_id: 'test-strategy-id',
        title: 'Test Value Proposition',
        card_type: 'value-proposition'
      });
    
    if (testError) {
      console.error('value-proposition test failed:', testError.message);
    } else {
      console.log('value-proposition test passed');
    }
    
    // Test if valuePropositions works
    console.log('Testing valuePropositions insertion...');
    const { data: testData2, error: testError2 } = await supabase
      .from('cards')
      .insert({
        strategy_id: 'test-strategy-id',
        title: 'Test Value Propositions',
        card_type: 'valuePropositions'
      });
    
    if (testError2) {
      console.error('valuePropositions test failed:', testError2.message);
    } else {
      console.log('valuePropositions test passed');
    }
    
  } catch (error) {
    console.error('Error checking constraint:', error);
  }
}

checkConstraint();