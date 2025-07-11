#!/usr/bin/env node

/**
 * Quick Strategies Debug for current database
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dqqiqhagapiekdtcuoqr.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxcWlxaGFnYXBpZWtkdGN1b3FyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTcxOTU5MSwiZXhwIjoyMDY3Mjk1NTkxfQ.nlkhOcl3y80qmHe7DLw2rldvtNhioXavTDxEfP7Wtk0';

const supabase = createClient(supabaseUrl, serviceKey);

async function debugStrategies() {
  console.log('🔍 Strategies Debug');
  console.log('===================');
  
  try {
    // Check if strategies table exists and get all strategies
    const { data: allStrategies, error: allError } = await supabase
      .from('strategies')
      .select('*')
      .limit(10);
    
    if (allError) {
      console.log('❌ Error fetching strategies:', allError.message);
      console.log('Error details:', JSON.stringify(allError, null, 2));
      return;
    }
    
    console.log(`📊 Found ${allStrategies.length} total strategies:`);
    allStrategies.forEach((strategy, index) => {
      console.log(`  ${index + 1}. ID: ${strategy.id}, Title: "${strategy.title}", User: ${strategy.userId || 'NULL'}`);
    });
    
    // Check table structure
    console.log('\n📋 Table structure check:');
    const { data: tableInfo, error: structError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'strategies')
      .order('ordinal_position');
    
    if (!structError && tableInfo) {
      console.log('Strategies table columns:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    // Check current user in auth system
    console.log('\n👤 User check:');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (!usersError && users) {
      console.log(`Found ${users.length} users in auth system:`);
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}, Email: ${user.email}`);
        
        // Check strategies for this user
        const userStrategies = allStrategies.filter(s => s.userId === user.id);
        console.log(`     -> Has ${userStrategies.length} strategies`);
      });
    }
    
    // Test with a known user ID if any strategies exist
    if (allStrategies.length > 0) {
      const testUserId = allStrategies[0].userId;
      if (testUserId) {
        console.log(`\n🧪 Testing query with user ID: ${testUserId}`);
        
        const { data: userStrategies, error: userError } = await supabase
          .from('strategies')
          .select('id, title, userId')
          .eq('userId', testUserId);
        
        if (userError) {
          console.log('❌ User-specific query failed:', userError.message);
        } else {
          console.log(`✅ Found ${userStrategies.length} strategies for this user`);
        }
      }
    }
    
  } catch (error) {
    console.log('💥 Exception:', error.message);
  }
}

debugStrategies();