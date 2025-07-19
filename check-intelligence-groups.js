const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkIntelligenceGroupsTables() {
  try {
    console.log('Checking intelligence groups tables...')
    
    // Check if intelligence_groups table exists
    const { data: groupsTable, error: groupsError } = await supabase
      .from('intelligence_groups')
      .select('*')
      .limit(1)
    
    if (groupsError) {
      console.log('❌ intelligence_groups table does not exist:', groupsError.message)
    } else {
      console.log('✅ intelligence_groups table exists')
    }
    
    // Check if intelligence_group_cards table exists
    const { data: groupCardsTable, error: groupCardsError } = await supabase
      .from('intelligence_group_cards')
      .select('*')
      .limit(1)
    
    if (groupCardsError) {
      console.log('❌ intelligence_group_cards table does not exist:', groupCardsError.message)
    } else {
      console.log('✅ intelligence_group_cards table exists')
    }
    
    // Check if intelligence_cards table exists
    const { data: cardsTable, error: cardsError } = await supabase
      .from('intelligence_cards')
      .select('*')
      .limit(1)
    
    if (cardsError) {
      console.log('❌ intelligence_cards table does not exist:', cardsError.message)
    } else {
      console.log('✅ intelligence_cards table exists')
    }
    
  } catch (error) {
    console.error('Error checking tables:', error)
  }
}

checkIntelligenceGroupsTables()