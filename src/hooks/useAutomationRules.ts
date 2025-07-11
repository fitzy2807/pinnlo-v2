'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'

interface AutomationRule {
  id: string
  user_id: string
  name: string
  description?: string
  system_prompt?: string
  enabled: boolean
  automation_enabled: boolean
  schedule_frequency: 'hourly' | 'daily' | 'weekly'
  next_run_at?: string
  intelligence_categories: string[]
  target_groups: string[]
  optimization_level: 'maximum_quality' | 'balanced' | 'maximum_savings'
  max_cards_per_run: number
  created_at: string
  updated_at: string
}

export function useAutomationRules() {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const loadRules = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: queryError } = await supabase
        .from('ai_generation_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (queryError) {
        setError(queryError.message)
      } else {
        setRules(data || [])
      }
    } catch (err) {
      setError('Failed to load automation rules')
      console.error('Error loading automation rules:', err)
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    loadRules()
  }, [loadRules])

  const createRule = async (ruleData: Partial<AutomationRule>) => {
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { data, error } = await supabase
        .from('ai_generation_rules')
        .insert({
          user_id: user.id,
          ...ruleData
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      setRules(prev => [data, ...prev])
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateRule = async (ruleId: string, updates: Partial<AutomationRule>) => {
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { data, error } = await supabase
        .from('ai_generation_rules')
        .update(updates)
        .eq('id', ruleId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      setRules(prev => prev.map(rule => rule.id === ruleId ? data : rule))
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const deleteRule = async (ruleId: string) => {
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { error } = await supabase
        .from('ai_generation_rules')
        .delete()
        .eq('id', ruleId)
        .eq('user_id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      setRules(prev => prev.filter(rule => rule.id !== ruleId))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const executeRule = async (ruleId: string) => {
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      // Get the rule details first
      const { data: rule, error: ruleError } = await supabase
        .from('ai_generation_rules')
        .select('*')
        .eq('id', ruleId)
        .eq('user_id', user.id)
        .single()

      if (ruleError || !rule) {
        return { success: false, error: 'Rule not found' }
      }

      // Create execution record
      const { data: execution, error: execError } = await supabase
        .from('ai_automation_executions')
        .insert({
          rule_id: ruleId,
          user_id: user.id,
          trigger_type: 'manual',
          status: 'running'
        })
        .select()
        .single()

      if (execError) {
        return { success: false, error: execError.message }
      }

      // Call MCP server to generate intelligence with rule parameters
      const response = await fetch('/api/mcp/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'generate_automation_intelligence',
          arguments: { 
            userId: user.id,
            ruleId, 
            triggerType: 'manual',
            categories: rule.intelligence_categories || [],
            maxCards: rule.max_cards_per_run || 5,
            targetGroups: rule.target_groups || [],
            optimizationLevel: rule.optimization_level || 'balanced',
            systemPrompt: rule.system_prompt || ''
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update execution status
        await supabase
          .from('ai_automation_executions')
          .update({
            status: 'completed',
            cards_created: result.cardsCreated || 0,
            tokens_used: result.tokensUsed || 0,
            cost_incurred: result.cost || 0,
            completed_at: new Date().toISOString()
          })
          .eq('id', execution.id)

        await loadRules()
        return { success: true, cardsCreated: result.cardsCreated || 0 }
      } else {
        // Update execution status as failed
        await supabase
          .from('ai_automation_executions')
          .update({
            status: 'failed',
            error_message: result.error || 'Execution failed',
            completed_at: new Date().toISOString()
          })
          .eq('id', execution.id)

        return { success: false, error: result.error || 'Execution failed' }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return { 
    rules, 
    loading, 
    error, 
    loadRules, 
    createRule,
    updateRule,
    deleteRule,
    executeRule 
  }
}