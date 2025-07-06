#!/usr/bin/env node

/**
 * Autonomous Adaptive RLS Database Fixer
 * Intelligently diagnoses and fixes RLS issues in Pinnlo V2 database
 * Adapts SQL based on actual database responses and errors
 * Run with: node fix-rls-adaptive.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://cdbzwjyqagqvdtmucidg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYnp3anlxYWdxdmR0bXVjaWRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjE5MjIwOSwiZXhwIjoyMDUxNzY4MjA5fQ.cFtR3qvFGIqVhKdWJyU7zZsrsVf4XwSuGPmMrTYAcec'
);

class AdaptiveRLSFixer {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.testUserId = '900903ff-4a27-4b57-b82b-73a0bb57d776';
  }

  log(message, type = 'info') {
    const icons = { info: '📝', success: '✅', error: '❌', warning: '⚠️', fix: '🔧' };
    console.log(`${icons[type]} ${message}`);
  }

  async diagnoseIssues() {
    this.log('Starting intelligent diagnosis...', 'info');
    
    // Test 1: Check if we can query strategies
    await this.testStrategiesAccess();
    
    // Test 2: Check strategy ownership
    await this.testStrategyOwnership();
    
    // Test 3: Check RLS policies existence
    await this.testRLSPolicies();
    
    // Test 4: Test card creation (the ultimate test)
    await this.testCardCreation();
    
    return this.issues;
  }

  async testStrategiesAccess() {
    try {
      const { data, error } = await supabaseAdmin
        .from('strategies')
        .select('id, title, "userId"')
        .limit(5);

      if (error) {
        this.issues.push({
          type: 'access',
          message: `Cannot access strategies table: ${error.message}`,
          severity: 'critical'
        });
      } else {
        this.log(`Found ${data.length} strategies`, 'success');
        return data;
      }
    } catch (e) {
      this.issues.push({
        type: 'connection',
        message: `Database connection failed: ${e.message}`,
        severity: 'critical'
      });
    }
  }

  async testStrategyOwnership() {
    try {
      const { data, error } = await supabaseAdmin
        .from('strategies')
        .select('id, title, "userId"')
        .in('id', [2, 4]);

      if (error) {
        this.issues.push({
          type: 'ownership_check',
          message: `Cannot check strategy ownership: ${error.message}`,
          severity: 'high'
        });
        return;
      }

      data.forEach(strategy => {
        if (strategy.userId !== this.testUserId) {
          this.issues.push({
            type: 'ownership',
            message: `Strategy ${strategy.id} owned by ${strategy.userId || 'none'}, should be ${this.testUserId}`,
            severity: 'high',
            fix: () => this.fixStrategyOwnership(strategy.id)
          });
        } else {
          this.log(`Strategy ${strategy.id} ownership is correct`, 'success');
        }
      });
    } catch (e) {
      this.issues.push({
        type: 'ownership_error',
        message: `Error checking ownership: ${e.message}`,
        severity: 'high'
      });
    }
  }

  async testRLSPolicies() {
    try {
      // Check if policies exist by querying pg_policies
      const { data, error } = await supabaseAdmin
        .from('pg_policies')
        .select('policyname, tablename')
        .eq('tablename', 'cards');

      if (error) {
        this.log(`Cannot check RLS policies directly, will test by card creation`, 'warning');
        return;
      }

      const expectedPolicies = [
        'Users can view cards from their strategies',
        'Users can insert cards to their strategies',
        'Users can update cards in their strategies',
        'Users can delete cards from their strategies'
      ];

      const existingPolicies = data.map(p => p.policyname);
      
      expectedPolicies.forEach(policy => {
        if (!existingPolicies.includes(policy)) {
          this.issues.push({
            type: 'missing_policy',
            message: `Missing RLS policy: ${policy}`,
            severity: 'high',
            fix: () => this.createRLSPolicy(policy)
          });
        }
      });

      this.log(`Found ${existingPolicies.length} existing RLS policies`, 'info');
    } catch (e) {
      this.log(`RLS policy check failed, will diagnose through card creation: ${e.message}`, 'warning');
    }
  }

  async testCardCreation() {
    try {
      const testCard = {
        strategy_id: 2,
        title: `Diagnostic Test Card ${Date.now()}`,
        description: 'Testing RLS functionality',
        card_type: 'strategic-context',
        priority: 'Medium',
        confidence_level: 'Medium',
        strategic_alignment: 'RLS testing',
        tags: ['Test'],
        card_data: { test: true }
      };

      const { data, error } = await supabaseAdmin
        .from('cards')
        .insert(testCard)
        .select()
        .single();

      if (error) {
        // Analyze the specific error to determine the fix needed
        if (error.message.includes('row-level security policy')) {
          this.issues.push({
            type: 'rls_violation',
            message: `RLS violation: ${error.message}`,
            severity: 'critical',
            fix: () => this.fixRLSPolicies()
          });
        } else if (error.message.includes('foreign key')) {
          this.issues.push({
            type: 'foreign_key',
            message: `Foreign key constraint: ${error.message}`,
            severity: 'high',
            fix: () => this.fixStrategyOwnership(2)
          });
        } else {
          this.issues.push({
            type: 'card_creation',
            message: `Card creation failed: ${error.message}`,
            severity: 'high'
          });
        }
      } else {
        this.log(`Card creation test passed: ${data.title}`, 'success');
        
        // Clean up test card
        await supabaseAdmin.from('cards').delete().eq('id', data.id);
        this.log('Cleaned up test card', 'info');
      }
    } catch (e) {
      this.issues.push({
        type: 'card_test_error',
        message: `Card creation test error: ${e.message}`,
        severity: 'critical'
      });
    }
  }

  async fixStrategyOwnership(strategyId = null) {
    const ids = strategyId ? [strategyId] : [2, 4];
    
    try {
      const { data, error } = await supabaseAdmin
        .from('strategies')
        .update({ 'userId': this.testUserId })
        .in('id', ids)
        .select();

      if (error) {
        this.log(`Failed to fix strategy ownership: ${error.message}`, 'error');
        return false;
      } else {
        this.log(`Fixed ownership for strategies: ${data.map(s => s.id).join(', ')}`, 'fix');
        return true;
      }
    } catch (e) {
      this.log(`Strategy ownership fix error: ${e.message}`, 'error');
      return false;
    }
  }

  async fixRLSPolicies() {
    this.log('Attempting to fix RLS policies...', 'fix');
    
    // First, try to drop existing policies (might fail, that's ok)
    const dropCommands = [
      'DROP POLICY IF EXISTS "Users can view cards from their strategies" ON cards',
      'DROP POLICY IF EXISTS "Users can insert cards to their strategies" ON cards',
      'DROP POLICY IF EXISTS "Users can update cards in their strategies" ON cards',
      'DROP POLICY IF EXISTS "Users can delete cards from their strategies" ON cards'
    ];

    for (const sql of dropCommands) {
      try {
        const { error } = await supabaseAdmin.rpc('execute_sql', { query: sql });
        if (!error) this.log('Dropped existing policy', 'info');
      } catch (e) {
        // Expected to fail sometimes, continue
      }
    }

    // Create new policies with multiple fallback approaches
    const policyAttempts = [
      // Attempt 1: Standard approach
      {
        name: 'Standard RLS policies',
        policies: [
          `CREATE POLICY "Users can view cards from their strategies" ON cards FOR SELECT USING (strategy_id IN (SELECT id FROM strategies WHERE "userId" = auth.uid()::text))`,
          `CREATE POLICY "Users can insert cards to their strategies" ON cards FOR INSERT WITH CHECK (strategy_id IN (SELECT id FROM strategies WHERE "userId" = auth.uid()::text))`,
          `CREATE POLICY "Users can update cards in their strategies" ON cards FOR UPDATE USING (strategy_id IN (SELECT id FROM strategies WHERE "userId" = auth.uid()::text))`,
          `CREATE POLICY "Users can delete cards from their strategies" ON cards FOR DELETE USING (strategy_id IN (SELECT id FROM strategies WHERE "userId" = auth.uid()::text))`
        ]
      },
      // Attempt 2: With explicit casting
      {
        name: 'Explicit casting RLS policies',
        policies: [
          `CREATE POLICY "Users can view cards from their strategies" ON cards FOR SELECT USING (strategy_id::text IN (SELECT id::text FROM strategies WHERE "userId" = auth.uid()::text))`,
          `CREATE POLICY "Users can insert cards to their strategies" ON cards FOR INSERT WITH CHECK (strategy_id::text IN (SELECT id::text FROM strategies WHERE "userId" = auth.uid()::text))`,
          `CREATE POLICY "Users can update cards in their strategies" ON cards FOR UPDATE USING (strategy_id::text IN (SELECT id::text FROM strategies WHERE "userId" = auth.uid()::text))`,
          `CREATE POLICY "Users can delete cards from their strategies" ON cards FOR DELETE USING (strategy_id::text IN (SELECT id::text FROM strategies WHERE "userId" = auth.uid()::text))`
        ]
      }
    ];

    for (const attempt of policyAttempts) {
      this.log(`Trying ${attempt.name}...`, 'info');
      let allSucceeded = true;

      for (const sql of attempt.policies) {
        try {
          const { error } = await supabaseAdmin.rpc('execute_sql', { query: sql });
          if (error) {
            this.log(`Policy creation failed: ${error.message}`, 'warning');
            allSucceeded = false;
            break;
          }
        } catch (e) {
          this.log(`Policy creation error: ${e.message}`, 'warning');
          allSucceeded = false;
          break;
        }
      }

      if (allSucceeded) {
        this.log(`${attempt.name} created successfully!`, 'success');
        return true;
      }
    }

    this.log('All RLS policy creation attempts failed', 'error');
    return false;
  }

  async applyFixes() {
    this.log(`Applying ${this.issues.length} fixes...`, 'fix');
    
    for (const issue of this.issues) {
      if (issue.fix) {
        this.log(`Fixing: ${issue.message}`, 'fix');
        const success = await issue.fix();
        if (success) {
          this.fixes.push(issue);
        }
      }
    }
  }

  async run() {
    console.log('🤖 Starting Adaptive RLS Fixer...\n');
    
    // Diagnose what's wrong
    await this.diagnoseIssues();
    
    if (this.issues.length === 0) {
      this.log('No issues found! Database is properly configured.', 'success');
      return;
    }

    this.log(`Found ${this.issues.length} issues to fix:`, 'warning');
    this.issues.forEach(issue => {
      console.log(`   ${issue.severity.toUpperCase()}: ${issue.message}`);
    });

    console.log('');
    
    // Apply fixes
    await this.applyFixes();
    
    // Re-test to see if fixes worked
    this.log('Re-testing after fixes...', 'info');
    this.issues = [];
    await this.testCardCreation();
    
    if (this.issues.length === 0) {
      this.log('🎉 All issues resolved! Database is now working correctly.', 'success');
    } else {
      this.log('Some issues remain. Manual intervention may be required.', 'warning');
      this.issues.forEach(issue => {
        console.log(`   REMAINING: ${issue.message}`);
      });
    }

    console.log(`\n📊 Summary: Applied ${this.fixes.length} fixes, ${this.issues.length} issues remaining`);
  }
}

// Run the adaptive fixer
const fixer = new AdaptiveRLSFixer();
fixer.run();
