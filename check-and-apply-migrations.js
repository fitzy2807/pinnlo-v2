const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', tableName)
    .single()
  
  return !error && data !== null
}

async function main() {
  console.log('Checking which tables need to be created...\n')

  // Check Strategy Creator tables
  const strategyCreatorTables = [
    'strategy_creator_sessions',
    'strategy_creator_history'
  ]

  // Check Intelligence Groups tables
  const intelligenceGroupsTables = [
    'intelligence_groups',
    'intelligence_group_cards'
  ]

  console.log('Strategy Creator Tables:')
  for (const table of strategyCreatorTables) {
    const exists = await checkTableExists(table)
    console.log(`  ${table}: ${exists ? '✓ exists' : '✗ missing'}`)
  }

  console.log('\nIntelligence Groups Tables:')
  for (const table of intelligenceGroupsTables) {
    const exists = await checkTableExists(table)
    console.log(`  ${table}: ${exists ? '✓ exists' : '✗ missing'}`)
  }

  // Check if we need to apply migrations
  const needsStrategyCreator = !(await checkTableExists('strategy_creator_sessions'))
  const needsIntelligenceGroups = !(await checkTableExists('intelligence_groups'))

  if (!needsStrategyCreator && !needsIntelligenceGroups) {
    console.log('\n✅ All tables already exist! No migrations needed.')
    return
  }

  console.log('\n📋 Migrations needed:')
  if (needsStrategyCreator) console.log('  - Strategy Creator schema')
  if (needsIntelligenceGroups) console.log('  - Intelligence Groups schema')

  // Read migration files
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations')
  
  if (needsStrategyCreator) {
    console.log('\n🚀 Applying Strategy Creator migration...')
    const strategyCreatorSql = fs.readFileSync(
      path.join(migrationsDir, '20250710_strategy_creator_schema.sql'),
      'utf8'
    )
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: strategyCreatorSql
      })
      
      if (error) {
        console.error('❌ Error applying Strategy Creator migration:', error)
      } else {
        console.log('✅ Strategy Creator migration applied successfully!')
      }
    } catch (err) {
      console.error('❌ Error:', err.message)
    }
  }

  if (needsIntelligenceGroups) {
    console.log('\n🚀 Applying Intelligence Groups migration...')
    const intelligenceGroupsSql = fs.readFileSync(
      path.join(migrationsDir, '20250710_intelligence_groups.sql'),
      'utf8'
    )
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: intelligenceGroupsSql
      })
      
      if (error) {
        console.error('❌ Error applying Intelligence Groups migration:', error)
      } else {
        console.log('✅ Intelligence Groups migration applied successfully!')
      }
    } catch (err) {
      console.error('❌ Error:', err.message)
    }
  }

  console.log('\n🎉 Migration check complete!')
}

main().catch(console.error)