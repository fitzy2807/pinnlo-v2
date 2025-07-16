const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test direct strategy detection
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let openai = null;
let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabaseClient;
}

// Strategy detection function - Agent 0 in the sequence
async function detectCurrentStrategy(userId, cardId, blueprintType) {
  try {
    console.log('=== DETECTING STRATEGY CONTEXT ===');
    console.log('Detecting strategy for user:', userId, 'card:', cardId, 'blueprint:', blueprintType);
    
    // Method 1: Check user's most recent strategy activity
    const { data: recentCards, error: recentError } = await getSupabaseClient()
      .from('cards')
      .select('strategy_id')
      .eq('created_by', userId)
      .not('strategy_id', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (!recentError && recentCards && recentCards.length > 0) {
      const strategyId = recentCards[0].strategy_id;
      console.log('✅ Found strategy from recent card activity:', strategyId);
      return strategyId;
    }
    console.log('No recent cards found or error:', recentError);
    
    // Method 2: Check user's most recently accessed strategy
    const { data: recentStrategies, error: strategyError } = await getSupabaseClient()
      .from('strategies')
      .select('id')
      .eq('userId', userId)
      .order('updatedAt', { ascending: false })
      .limit(1);
    
    if (!strategyError && recentStrategies && recentStrategies.length > 0) {
      const strategyId = recentStrategies[0].id;
      console.log('✅ Found strategy from recent strategy access:', strategyId);
      return strategyId;
    }
    console.log('No recent strategies found or error:', strategyError);
    
    // Method 3: Check for strategies created in the last 24 hours (active session)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: activeStrategies, error: activeError } = await getSupabaseClient()
      .from('strategies')
      .select('id')
      .eq('userId', userId)
      .gte('updatedAt', oneDayAgo)
      .order('updatedAt', { ascending: false })
      .limit(1);
    
    if (!activeError && activeStrategies && activeStrategies.length > 0) {
      const strategyId = activeStrategies[0].id;
      console.log('✅ Found strategy from recent activity (24h):', strategyId);
      return strategyId;
    }
    console.log('No active strategies found or error:', activeError);
    
    console.log('❌ No strategy context detected - will continue without context');
    return null;
    
  } catch (error) {
    console.error('Error detecting strategy context:', error);
    return null;
  }
}

async function testStrategyDetection() {
  console.log('Testing strategy detection...');
  
  // Get some test strategies
  const { data: strategies, error } = await supabase
    .from('strategies')
    .select('id, title, userId, updatedAt')
    .limit(5);
  
  if (error) {
    console.error('Error fetching strategies:', error);
    return;
  }
  
  console.log('Found strategies:', strategies.length);
  strategies.forEach((s, i) => {
    console.log(`${i+1}. ${s.title} (ID: ${s.id}, User: ${s.userId})`);
  });
  
  // Test with a specific user
  if (strategies.length > 0) {
    const testUser = strategies[0].userId;
    console.log(`\nTesting with user: ${testUser}`);
    
    const strategyId = await detectCurrentStrategy(testUser, 'test-card-id', 'features');
    console.log('Detected strategy:', strategyId);
  }
}

testStrategyDetection().catch(console.error);