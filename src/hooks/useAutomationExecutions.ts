'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'

interface AutomationExecution {
  id: string
  rule_id: string
  user_id: string
  trigger_type: 'scheduled' | 'manual'
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  cards_created: number
  cards_updated: number
  tokens_used: number
  cost_incurred: number
  processing_time_ms: number
  started_at: string
  completed_at?: string
  error_message?: string
  error_details?: any
  created_at: string
}

interface UseAutomationExecutionsOptions {
  ruleId?: string
  limit?: number
}

export function useAutomationExecutions(options: UseAutomationExecutionsOptions = {}) {
  const [executions, setExecutions] = useState<AutomationExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const loadExecutions = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('ai_automation_executions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })

      if (options.ruleId) {
        query = query.eq('rule_id', options.ruleId)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error: queryError } = await query

      if (queryError) {
        setError(queryError.message)
      } else {
        setExecutions(data || [])
      }
    } catch (err) {
      setError('Failed to load automation executions')
      console.error('Error loading automation executions:', err)
    }

    setLoading(false)
  }, [user, options.ruleId, options.limit])

  useEffect(() => {
    loadExecutions()
  }, [loadExecutions])

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('automation_executions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_automation_executions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setExecutions(prev => [payload.new as AutomationExecution, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setExecutions(prev => prev.map(exec => 
              exec.id === payload.new.id ? payload.new as AutomationExecution : exec
            ))
          } else if (payload.eventType === 'DELETE') {
            setExecutions(prev => prev.filter(exec => exec.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const getStats = useCallback(() => {
    const stats = {
      total: executions.length,
      completed: executions.filter(e => e.status === 'completed').length,
      failed: executions.filter(e => e.status === 'failed').length,
      running: executions.filter(e => e.status === 'running').length,
      totalCardsCreated: executions.reduce((sum, e) => sum + e.cards_created, 0),
      totalTokensUsed: executions.reduce((sum, e) => sum + e.tokens_used, 0),
      totalCost: executions.reduce((sum, e) => sum + e.cost_incurred, 0)
    }
    return stats
  }, [executions])

  return {
    executions,
    loading,
    error,
    stats: getStats(),
    refresh: loadExecutions
  }
}