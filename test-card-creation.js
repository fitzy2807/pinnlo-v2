const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCardCreation() {
  try {
    console.log('Testing card creation...');
    
    // First, let's get a real strategy ID
    console.log('Getting existing strategy...');
    const { data: strategies, error: strategyError } = await supabase
      .from('strategies')
      .select('id')
      .limit(1);
    
    if (strategyError) {
      console.error('Error getting strategy:', strategyError.message);
      return;
    }
    
    if (!strategies || strategies.length === 0) {
      console.error('No strategies found');
      return;
    }
    
    const strategyId = strategies[0].id;
    console.log('Using strategy ID:', strategyId);
    
    // Test 1: Try value-proposition (kebab-case)
    console.log('\n1. Testing value-proposition (kebab-case)...');
    const { data: testData1, error: testError1 } = await supabase
      .from('cards')
      .insert({
        strategy_id: strategyId,
        title: 'Test Value Proposition',
        card_type: 'value-proposition'
      });
    
    if (testError1) {
      console.error('❌ value-proposition failed:', testError1.message);
    } else {
      console.log('✅ value-proposition succeeded');
    }
    
    // Test 2: Try valuePropositions (camelCase)
    console.log('\n2. Testing valuePropositions (camelCase)...');
    const { data: testData2, error: testError2 } = await supabase
      .from('cards')
      .insert({
        strategy_id: strategyId,
        title: 'Test Value Propositions',
        card_type: 'valuePropositions'
      });
    
    if (testError2) {
      console.error('❌ valuePropositions failed:', testError2.message);
    } else {
      console.log('✅ valuePropositions succeeded');
    }
    
    // Test 3: Try a card type that should work
    console.log('\n3. Testing strategic-context (should work)...');
    const { data: testData3, error: testError3 } = await supabase
      .from('cards')
      .insert({
        strategy_id: strategyId,
        title: 'Test Strategic Context',
        card_type: 'strategic-context'
      });
    
    if (testError3) {
      console.error('❌ strategic-context failed:', testError3.message);
    } else {
      console.log('✅ strategic-context succeeded');
    }
    
  } catch (error) {
    console.error('Error testing card creation:', error);
  }
}

testCardCreation();