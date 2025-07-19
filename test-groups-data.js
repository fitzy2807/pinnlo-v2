const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testGroupsData() {
  try {
    console.log('Testing groups data...')
    
    // Check if there are any groups in the database
    const { data: groups, error: groupsError } = await supabase
      .from('intelligence_groups')
      .select('*')
      .limit(10)
    
    if (groupsError) {
      console.log('❌ Error loading groups:', groupsError.message)
    } else {
      console.log('✅ Groups loaded successfully')
      console.log('Number of groups:', groups.length)
      if (groups.length > 0) {
        console.log('Sample group:', groups[0])
      } else {
        console.log('No groups found in database')
      }
    }
    
    // Test creating a sample group
    console.log('\n--- Testing group creation ---')
    const { data: newGroup, error: createError } = await supabase
      .from('intelligence_groups')
      .insert({
        name: 'Test Group',
        description: 'Test group for debugging',
        color: '#3B82F6',
        card_count: 0,
        last_used_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (createError) {
      console.log('❌ Error creating group:', createError.message)
    } else {
      console.log('✅ Group created successfully:', newGroup)
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testGroupsData()