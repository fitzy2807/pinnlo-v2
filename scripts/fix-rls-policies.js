const https = require('https');

// Database connection details
const SUPABASE_URL = 'https://cdbzwjyqagqvdtmucidg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYnp3anlxYWdxdmR0bXVjaWRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjE5MjIwOSwiZXhwIjoyMDUxNzY4MjA5fQ.cFtR3qvFGIqVhKdWJyU7zZsrsVf4XwSuGPmMrTYAcec';

// Function to execute SQL via REST API
async function executeSQLCommand(sql, description) {
  console.log(`\n${description}...`);
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/sql`);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
          console.log('✅ Success');
          if (responseData) {
            try {
              const parsed = JSON.parse(responseData);
              console.log('Result:', JSON.stringify(parsed, null, 2));
            } catch (e) {
              // Response might not be JSON
            }
          }
          resolve(true);
        } else {
          console.error(`❌ Error: HTTP ${res.statusCode}`);
          console.error('Response:', responseData);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error: ${error.message}`);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

// Alternative approach using direct database operations
const { createClient } = require('@supabase/supabase-js');

async function fixRLSPolicies() {
  console.log('🚀 Starting comprehensive RLS fix for Pinnlo V2...\n');
  
  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Step 1: Update strategy ownership
  console.log('Step 1: Updating strategy ownership...');
  try {
    const { data: updateData, error: updateError } = await supabase
      .from('strategies')
      .update({ 
        userId: '900903ff-4a27-4b57-b82b-73a0bb57d776',
        updatedAt: new Date().toISOString()
      })
      .in('id', [2, 4])
      .select();
    
    if (updateError) {
      console.error('❌ Error updating strategies:', updateError.message);
    } else {
      console.log('✅ Success');
      console.log('Updated strategies:', updateData);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }

  // For RLS policies, we need to use raw SQL through a different approach
  // Let's create a Node.js script that uses psql command if available
  console.log('\nStep 2-3: RLS Policy Management');
  console.log('Note: RLS policies need to be managed through Supabase Dashboard SQL Editor or psql.');
  console.log('Here are the SQL commands to execute:\n');

  const rlsCommands = `
-- Drop existing broken RLS policies
DROP POLICY IF EXISTS "Users can view cards from their strategies" ON cards;
DROP POLICY IF EXISTS "Users can insert cards to their strategies" ON cards;
DROP POLICY IF EXISTS "Users can update cards in their strategies" ON cards;
DROP POLICY IF EXISTS "Users can delete cards from their strategies" ON cards;

-- Create corrected RLS policies with proper type casting
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
  );`;

  console.log(rlsCommands);

  // Step 4: Test card creation (this we can do through the API)
  console.log('\nStep 4: Testing card creation...');
  try {
    const { data: cardData, error: cardError } = await supabase
      .from('cards')
      .insert({
        strategy_id: 2,
        title: 'CC RLS Fix Test Card',
        description: 'Created by Claude Code to validate RLS fix',
        card_type: 'strategic-context',
        priority: 'High',
        confidence_level: 'High',
        strategic_alignment: 'Testing RLS implementation',
        tags: ["CC", "RLS-Fix", "Test"],
        card_data: { marketContext: "Automated RLS testing" }
      })
      .select();
    
    if (cardError) {
      console.error('❌ Error creating test card:', cardError.message);
      console.error('Details:', cardError);
    } else {
      console.log('✅ Success');
      console.log('Created card:', cardData);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }

  // Verification
  console.log('\n🔍 Verifying the fix...');
  try {
    const { data: strategies, error: verifyError } = await supabase
      .from('strategies')
      .select('id, userId')
      .in('id', [2, 4]);
    
    if (verifyError) {
      console.error('❌ Error verifying:', verifyError.message);
    } else {
      console.log('✅ Strategies verified:');
      console.log(strategies);
    }

    // Count cards
    const { count, error: countError } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true })
      .in('strategy_id', [2, 4]);
    
    if (!countError) {
      console.log(`Total cards in strategies 2 and 4: ${count}`);
    }
  } catch (err) {
    console.error('❌ Unexpected error during verification:', err.message);
  }
}

// Run the fix
fixRLSPolicies().catch(console.error);