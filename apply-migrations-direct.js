require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

console.log('🔌 Connecting to Supabase...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
})

async function runSQL(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql })
  if (error) {
    // If exec_sql doesn't exist, try direct query
    const { data: directData, error: directError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(1)
    
    if (directError) {
      throw new Error(`Failed to execute SQL: ${directError.message}`)
    }
    
    // If we get here, we can connect but exec_sql doesn't exist
    // We'll need to use a different approach
    throw new Error('exec_sql function not available. Please run migrations manually.')
  }
  return data
}

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public')
    .eq('tablename', tableName)
    .single()
  
  return !error && data !== null
}

async function main() {
  try {
    console.log('🔍 Checking existing tables...\n')

    // Check which tables exist
    const strategyCreatorExists = await checkTableExists('strategy_creator_sessions')
    const intelligenceGroupsExists = await checkTableExists('intelligence_groups')

    console.log('Strategy Creator Tables:', strategyCreatorExists ? '✅ Already exist' : '❌ Missing')
    console.log('Intelligence Groups Tables:', intelligenceGroupsExists ? '✅ Already exist' : '❌ Missing')

    if (strategyCreatorExists && intelligenceGroupsExists) {
      console.log('\n✅ All tables already exist! No migrations needed.')
      return
    }

    console.log('\n📋 Instructions to apply migrations:\n')
    
    if (!strategyCreatorExists) {
      console.log('1. Strategy Creator Migration:')
      console.log('   Run the following command:')
      console.log('   npx supabase migration new strategy_creator_tables')
      console.log('   Then copy the content from: supabase/migrations/20250710_strategy_creator_schema.sql')
      console.log('   Finally run: npx supabase db push\n')
    }

    if (!intelligenceGroupsExists) {
      console.log('2. Intelligence Groups Migration:')
      console.log('   Run the following command:')
      console.log('   npx supabase migration new intelligence_groups_tables')
      console.log('   Then copy the content from: supabase/migrations/20250710_intelligence_groups.sql')
      console.log('   Finally run: npx supabase db push\n')
    }

    console.log('Alternatively, you can run the SQL directly in the Supabase Dashboard:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run the content of apply-new-migrations.sql')

  } catch (error) {
    console.error('❌ Error:', error.message)
    
    console.log('\n📋 Manual Migration Instructions:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run the content of apply-new-migrations.sql')
    console.log('\nThis will create the necessary tables if they don\'t exist.')
  }
}

main()