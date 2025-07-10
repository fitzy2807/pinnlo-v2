import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Authorization check
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    const supabase = createClient()
    
    // Get automation rules that need to run
    const { data: automationRules, error: rulesError } = await supabase
      .from('ai_generation_rules')
      .select('*')
      .eq('automation_enabled', true)
      .lte('next_run_at', new Date().toISOString())
      .not('next_run_at', 'is', null)
    
    if (rulesError) {
      console.error('Error fetching automation rules:', rulesError)
      return NextResponse.json({
        success: false,
        error: rulesError.message,
        processedAutomationRules: 0
      })
    }
    
    let processedCount = 0
    let successCount = 0
    
    // Process automation rules
    for (const rule of automationRules || []) {
      try {
        // Log execution start
        const { data: execution, error: execError } = await supabase
          .from('ai_automation_executions')
          .insert({
            rule_id: rule.id,
            user_id: rule.user_id,
            trigger_type: 'scheduled',
            status: 'running'
          })
          .select()
          .single()
        
        if (execError) {
          console.error(`Failed to create execution for rule ${rule.id}:`, execError)
          continue
        }
        
        // Call MCP automation tool
        const mcpResponse = await fetch(`${process.env.MCP_SERVER_URL}/invoke`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN}`
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'tools/call',
            params: {
              name: 'generate_automation_intelligence',
              arguments: {
                userId: rule.user_id,
                ruleId: rule.id,
                categories: rule.intelligence_categories,
                maxCards: rule.max_cards_per_run,
                targetGroups: rule.target_groups,
                optimizationLevel: rule.optimization_level,
                triggerType: 'scheduled'
              }
            },
            id: Date.now()
          })
        })
        
        // Process result and update execution
        const mcpResult = await mcpResponse.json()
        if (mcpResult.result?.content?.[0]?.text) {
          const resultData = JSON.parse(mcpResult.result.content[0].text)
          
          await supabase
            .from('ai_automation_executions')
            .update({
              status: 'completed',
              cards_created: resultData.cardsCreated || 0,
              tokens_used: resultData.tokensUsed || 0,
              cost_incurred: resultData.cost || 0,
              completed_at: new Date().toISOString(),
              processing_time_ms: Date.now() - new Date(execution.started_at).getTime()
            })
            .eq('id', execution.id)
          
          // Update next run time
          const nextRun = calculateNextRun(rule.schedule_frequency)
          await supabase
            .from('ai_generation_rules')
            .update({ next_run_at: nextRun })
            .eq('id', rule.id)
          
          successCount++
        } else {
          // Handle failure
          await supabase
            .from('ai_automation_executions')
            .update({
              status: 'failed',
              error_message: mcpResult.error?.message || 'Unknown error',
              error_details: mcpResult.error,
              completed_at: new Date().toISOString(),
              processing_time_ms: Date.now() - new Date(execution.started_at).getTime()
            })
            .eq('id', execution.id)
        }
        
        processedCount++
      } catch (error) {
        console.error(`Failed automation rule ${rule.id}:`, error)
        processedCount++
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Daily intelligence automation completed',
      processedAutomationRules: processedCount,
      successfulRules: successCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Daily intelligence automation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processedAutomationRules: 0
    }, { status: 500 })
  }
}

// Helper function to calculate next run time
function calculateNextRun(frequency: string): string {
  const now = new Date()
  switch (frequency) {
    case 'hourly': 
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString()
    case 'daily': 
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    case 'weekly': 
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    default: 
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
  }
}