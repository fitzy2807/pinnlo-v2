#!/usr/bin/env node

/**
 * Comprehensive RLS Diagnostics for Pinnlo V2
 * Investigates type mismatches and policy issues preventing card creation
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cdbzwjyqagqvdtmucidg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYnp3anlxYWdxdmR0bXVjaWRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjE5MjIwOSwiZXhwIjoyMDUxNzY4MjA5fQ.cFtR3qvFGIqVhKdWJyU7zZsrsVf4XwSuGPmMrTYAcec';

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

const TARGET_USER_ID = '900903ff-4a27-4b57-b82b-73a0bb57d776';

async function executeSql(query, params = {}) {
  try {
    const { data, error } = await supabaseAdmin.rpc('execute_sql', { 
      query,
      params 
    });
    
    if (error) {
      console.error('SQL Execution Error:', error);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error('Execute SQL failed:', e);
    return null;
  }
}

async function runDiagnostics() {
  console.log('🔍 PINNLO V2 RLS DIAGNOSTICS\n');
  console.log('Target User ID:', TARGET_USER_ID);
  console.log('Database URL:', supabaseUrl);
  console.log('===============================================\n');

  // 1. Check Strategy Ownership
  console.log('📋 1. CHECKING STRATEGY OWNERSHIP');
  console.log('---------------------------------');
  
  const { data: strategies, error: stratError } = await supabaseAdmin
    .from('strategies')
    .select('id, title, "userId"')
    .in('id', [2, 4]);
  
  if (stratError) {
    console.error('❌ Error fetching strategies:', stratError.message);
  } else {
    console.log('Strategies found:');
    strategies.forEach(s => {
      const isCorrectOwner = s.userId === TARGET_USER_ID;
      console.log(`  Strategy ${s.id}: "${s.title}"`);
      console.log(`    Owner: ${s.userId || 'NULL'}`);
      console.log(`    Status: ${isCorrectOwner ? '✅ Correct owner' : '❌ Wrong owner'}`);
    });
  }

  // 2. Check Data Types
  console.log('\n📊 2. CHECKING DATA TYPES');
  console.log('-------------------------');
  
  // Get column information using information_schema
  const { data: userColumns, error: userColError } = await supabaseAdmin
    .from('information_schema.columns')
    .select('column_name, data_type, character_maximum_length')
    .eq('table_schema', 'public')
    .eq('table_name', 'users')
    .eq('column_name', 'id');
  
  const { data: stratColumns, error: stratColError } = await supabaseAdmin
    .from('information_schema.columns')
    .select('column_name, data_type, character_maximum_length')
    .eq('table_schema', 'public')
    .eq('table_name', 'strategies')
    .eq('column_name', 'userId');
  
  if (!userColError && userColumns?.length > 0) {
    console.log('users.id column:');
    console.log(`  Type: ${userColumns[0].data_type}`);
    console.log(`  Max Length: ${userColumns[0].character_maximum_length || 'N/A'}`);
  }
  
  if (!stratColError && stratColumns?.length > 0) {
    console.log('\nstrategies.userId column:');
    console.log(`  Type: ${stratColumns[0].data_type}`);
    console.log(`  Max Length: ${stratColumns[0].character_maximum_length || 'N/A'}`);
  }

  // 3. Check Cards Table Structure
  console.log('\n🗂️  3. CHECKING CARDS TABLE STRUCTURE');
  console.log('-------------------------------------');
  
  const { data: cardColumns, error: cardColError } = await supabaseAdmin
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_schema', 'public')
    .eq('table_name', 'cards')
    .order('ordinal_position');
  
  if (!cardColError && cardColumns) {
    console.log('Cards table columns:');
    cardColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
  }

  // 4. Check Current RLS Policies
  console.log('\n🔐 4. CHECKING RLS POLICIES');
  console.log('---------------------------');
  
  // Try to query pg_policies view
  const { data: policies, error: polError } = await supabaseAdmin
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'cards');
  
  if (!polError && policies) {
    console.log(`Found ${policies.length} RLS policies on cards table:`);
    policies.forEach(p => {
      console.log(`\n  Policy: "${p.policyname}"`);
      console.log(`  Command: ${p.cmd}`);
      console.log(`  Permissive: ${p.permissive}`);
      console.log(`  Roles: ${p.roles}`);
      console.log(`  Using: ${p.using || 'N/A'}`);
      console.log(`  With Check: ${p.with_check || 'N/A'}`);
    });
  } else if (polError) {
    console.log('⚠️  Could not query pg_policies directly');
    console.log('Will attempt alternative policy check...');
  }

  // 5. Test Card Creation
  console.log('\n🧪 5. TESTING CARD CREATION');
  console.log('---------------------------');
  
  const testCard = {
    strategy_id: 2,
    title: `RLS Test Card ${new Date().toISOString()}`,
    description: 'Testing RLS functionality',
    card_type: 'strategic-context',
    priority: 'Medium',
    confidence_level: 'Medium',
    strategic_alignment: 'RLS testing',
    tags: JSON.stringify(['test']),
    card_data: JSON.stringify({ test: true })
  };

  console.log('Attempting to create test card...');
  console.log('Card data:', JSON.stringify(testCard, null, 2));
  
  const { data: newCard, error: createError } = await supabaseAdmin
    .from('cards')
    .insert(testCard)
    .select()
    .single();
  
  if (createError) {
    console.log('\n❌ Card creation failed!');
    console.log('Error:', createError.message);
    console.log('Error code:', createError.code);
    console.log('Error details:', JSON.stringify(createError, null, 2));
    
    // Analyze the error
    if (createError.message.includes('row-level security')) {
      console.log('\n📌 DIAGNOSIS: RLS policy violation');
      console.log('The RLS policies are preventing card insertion.');
      
      // Check if it's due to type mismatch
      if (createError.message.includes('operator does not exist')) {
        console.log('\n🔍 Type Mismatch Detected!');
        console.log('The error suggests a type mismatch between:');
        console.log('  - auth.uid() returns UUID');
        console.log('  - strategies.userId is VARCHAR');
        console.log('\nThis prevents the RLS policy from working correctly.');
      }
    }
  } else {
    console.log('\n✅ Card created successfully!');
    console.log('Card ID:', newCard.id);
    
    // Clean up
    await supabaseAdmin.from('cards').delete().eq('id', newCard.id);
    console.log('Test card cleaned up');
  }

  // 6. Check auth.uid() type
  console.log('\n🔑 6. CHECKING AUTH FUNCTION');
  console.log('-----------------------------');
  
  // Create a test user to check auth.uid() behavior
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
    TARGET_USER_ID
  );
  
  if (!authError && authUser) {
    console.log('User found in auth system:');
    console.log(`  ID: ${authUser.user.id}`);
    console.log(`  Email: ${authUser.user.email}`);
    console.log(`  ID Type: UUID (${typeof authUser.user.id})`);
  } else {
    console.log('⚠️  Could not fetch user from auth system');
  }

  // 7. Recommended Fixes
  console.log('\n💡 7. RECOMMENDED FIXES');
  console.log('----------------------');
  
  console.log('\nThe main issue appears to be a type mismatch between:');
  console.log('  - auth.uid() which returns UUID');
  console.log('  - users.id and strategies.userId which are VARCHAR');
  
  console.log('\nTo fix this, the RLS policies need to cast auth.uid() to text:');
  console.log('\nExample corrected policy:');
  console.log(`
CREATE POLICY "Users can view cards from their strategies" ON cards
  FOR SELECT USING (
    strategy_id IN (
      SELECT id FROM strategies 
      WHERE "userId" = auth.uid()::text
    )
  );`);
  
  console.log('\nOr update the strategies table to reference auth.users directly:');
  console.log(`
ALTER TABLE strategies 
  ADD COLUMN user_id UUID REFERENCES auth.users(id);
  
UPDATE strategies 
  SET user_id = "userId"::uuid 
  WHERE "userId" IS NOT NULL;`);

  // 8. Quick Fix SQL
  console.log('\n🔧 8. QUICK FIX SQL');
  console.log('-------------------');
  console.log('Run this SQL in Supabase SQL Editor to fix the issues:');
  console.log(`
-- First, ensure strategies are owned by the correct user
UPDATE strategies 
SET "userId" = '${TARGET_USER_ID}'
WHERE id IN (2, 4);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view cards from their strategies" ON cards;
DROP POLICY IF EXISTS "Users can insert cards to their strategies" ON cards;
DROP POLICY IF EXISTS "Users can update cards in their strategies" ON cards;
DROP POLICY IF EXISTS "Users can delete cards from their strategies" ON cards;

-- Create new policies with proper type casting
CREATE POLICY "Users can view cards from their strategies" ON cards
  FOR SELECT USING (
    strategy_id IN (
      SELECT id FROM strategies 
      WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert cards to their strategies" ON cards
  FOR INSERT WITH CHECK (
    strategy_id IN (
      SELECT id FROM strategies 
      WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can update cards in their strategies" ON cards
  FOR UPDATE USING (
    strategy_id IN (
      SELECT id FROM strategies 
      WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete cards from their strategies" ON cards
  FOR DELETE USING (
    strategy_id IN (
      SELECT id FROM strategies 
      WHERE "userId" = auth.uid()::text
    )
  );

-- Verify the fix
SELECT 'Strategies owned by user:' as check_type, count(*) as count
FROM strategies 
WHERE "userId" = '${TARGET_USER_ID}';
`);

  console.log('\n✅ Diagnostics complete!');
}

// Run diagnostics
runDiagnostics().catch(console.error);