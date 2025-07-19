const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUserAndGroups() {
  try {
    console.log('Creating test user and groups...')
    
    // Create a test user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpassword123',
      email_confirm: true
    })
    
    if (authError) {
      console.log('Auth error:', authError.message)
      return
    }
    
    const userId = authData.user.id
    console.log('✅ Test user created:', userId)
    
    // Create test groups for this user
    const testGroups = [
      {
        user_id: userId,
        name: 'Market Research',
        description: 'Market intelligence and analysis',
        color: '#3B82F6',
        card_count: 0,
        last_used_at: new Date().toISOString()
      },
      {
        user_id: userId,
        name: 'Competitor Analysis',
        description: 'Competitive intelligence tracking',
        color: '#10B981',
        card_count: 0,
        last_used_at: new Date().toISOString()
      },
      {
        user_id: userId,
        name: 'Technology Trends',
        description: 'Tech stack and innovation insights',
        color: '#F59E0B',
        card_count: 0,
        last_used_at: new Date().toISOString()
      }
    ]
    
    const { data: groupsData, error: groupsError } = await supabase
      .from('intelligence_groups')
      .insert(testGroups)
      .select()
    
    if (groupsError) {
      console.log('❌ Error creating groups:', groupsError.message)
    } else {
      console.log('✅ Test groups created:', groupsData.length)
      groupsData.forEach(group => {
        console.log(`- ${group.name} (${group.color})`)
      })
    }
    
    console.log('\n=== Login credentials for testing ===')
    console.log('Email: test@example.com')
    console.log('Password: testpassword123')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createTestUserAndGroups()