const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  try {
    console.log('Testing authentication...')
    
    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log('❌ Error getting user:', userError.message)
    } else if (user) {
      console.log('✅ User authenticated:', user.id)
      console.log('User email:', user.email)
      
      // Now try to get groups for this user
      console.log('\n--- Testing groups for authenticated user ---')
      const { data: groups, error: groupsError } = await supabase
        .from('intelligence_groups')
        .select('*')
        .eq('user_id', user.id)
      
      if (groupsError) {
        console.log('❌ Error loading user groups:', groupsError.message)
      } else {
        console.log('✅ User groups loaded successfully')
        console.log('Number of groups:', groups.length)
        groups.forEach((group, index) => {
          console.log(`${index + 1}. ${group.name} (${group.card_count} cards)`)
        })
      }
    } else {
      console.log('❌ No user authenticated')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testAuth()