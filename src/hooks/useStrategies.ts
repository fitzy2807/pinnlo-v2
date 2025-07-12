'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import { Strategy } from '@/types/database'

interface CreateStrategyData {
  title?: string
  client?: string
  description?: string
  status?: string
  progress?: number
  
  // Optional JSONB fields
  vision?: Record<string, any>
  okrs?: Record<string, any>
  problems?: Record<string, any>
  initiatives?: Record<string, any>
  personas?: Record<string, any>
  epics?: Record<string, any>
  customerExperience?: Record<string, any>
  experienceSections?: Record<string, any>
  userJourneys?: Record<string, any>
  features?: Record<string, any>
  roadmap?: Record<string, any>
  techRequirements?: Record<string, any>
  techStack?: Record<string, any>
  team?: Record<string, any>
  cost?: Record<string, any>
  deliveryPlan?: Record<string, any>
  strategicContext?: Record<string, any>
  valuePropositions?: Record<string, any>
  workstreams?: Record<string, any>
  technicalStacks?: Record<string, any>
  organisationalCapabilities?: Record<string, any>
  gtmPlays?: Record<string, any>
  serviceBlueprints?: Record<string, any>
  ideasBank?: Record<string, any>
  blueprintConfiguration?: Record<string, any>
}

export function useStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  
  // Circuit breaker to prevent infinite loops
  const fetchAttempts = useRef(0)
  const lastFetchTime = useRef(0)
  const maxAttempts = 3
  const cooldownPeriod = 5000 // 5 seconds

  // Fetch strategies with circuit breaker
  const fetchStrategies = useCallback(async () => {
    if (!user) {
      setStrategies([])
      setLoading(false)
      setError(null)
      return
    }

    const now = Date.now()
    
    // Circuit breaker logic
    if (fetchAttempts.current >= maxAttempts && (now - lastFetchTime.current) < cooldownPeriod) {
      console.log('Circuit breaker active - too many attempts, waiting for cooldown')
      setError('Too many requests - please wait a moment before trying again')
      setLoading(false)
      return
    }

    // Reset attempts after cooldown
    if ((now - lastFetchTime.current) >= cooldownPeriod) {
      fetchAttempts.current = 0
    }

    try {
      setLoading(true)
      setError(null)
      fetchAttempts.current++
      lastFetchTime.current = now

      // console.log(`Fetch attempt ${fetchAttempts.current} for user:`, user.id)

      const { data, error: fetchError } = await supabase
        .from('strategies')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // console.log('Successfully fetched strategies:', data?.length || 0)
      setStrategies(data || [])
      
      // Reset attempts on success
      fetchAttempts.current = 0
      
    } catch (err) {
      console.error('Error fetching strategies:', err)
      
      // Set more user-friendly error messages
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        setError('Network connection issue - please check your internet connection')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch strategies')
      }
      
      // If we've hit max attempts, stop trying
      if (fetchAttempts.current >= maxAttempts) {
        setError('Maximum retry attempts reached - please refresh the page')
      }
    } finally {
      setLoading(false)
    }
  }, [user, maxAttempts, cooldownPeriod])

  // Create strategy
  const createStrategy = async (strategyData: CreateStrategyData): Promise<Strategy | null> => {
    if (!user) {
      setError('User not authenticated')
      return null
    }

    try {
      setError(null)

      const { data, error: createError } = await supabase
        .from('strategies')
        .insert({
          userId: user.id,
          title: strategyData.title || 'Untitled Strategy',
          client: strategyData.client || '',
          description: strategyData.description || '',
          status: strategyData.status || 'draft',
          progress: strategyData.progress || 0,
          
          // JSONB fields with defaults
          vision: strategyData.vision || {},
          okrs: strategyData.okrs || {},
          problems: strategyData.problems || {},
          initiatives: strategyData.initiatives || {},
          personas: strategyData.personas || {},
          epics: strategyData.epics || {},
          customerExperience: strategyData.customerExperience || {},
          experienceSections: strategyData.experienceSections || {},
          userJourneys: strategyData.userJourneys || {},
          features: strategyData.features || {},
          roadmap: strategyData.roadmap || {},
          techRequirements: strategyData.techRequirements || {},
          techStack: strategyData.techStack || {},
          team: strategyData.team || {},
          cost: strategyData.cost || {},
          deliveryPlan: strategyData.deliveryPlan || {},
          strategicContext: strategyData.strategicContext || {},
          valuePropositions: strategyData.valuePropositions || {},
          workstreams: strategyData.workstreams || {},
          technicalStacks: strategyData.technicalStacks || {},
          organisationalCapabilities: strategyData.organisationalCapabilities || {},
          gtmPlays: strategyData.gtmPlays || {},
          serviceBlueprints: strategyData.serviceBlueprints || {},
          ideasBank: strategyData.ideasBank || {},
          blueprintConfiguration: strategyData.blueprintConfiguration || {},
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      // Add to local state
      setStrategies(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error creating strategy:', err)
      setError(err instanceof Error ? err.message : 'Failed to create strategy')
      return null
    }
  }

  // Delete strategy
  const deleteStrategy = async (strategyId: number): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    try {
      setError(null)

      const { error: deleteError } = await supabase
        .from('strategies')
        .delete()
        .eq('id', strategyId)
        .eq('userId', user.id) // Ensure user can only delete their own strategies

      if (deleteError) {
        throw deleteError
      }

      // Remove from local state
      setStrategies(prev => prev.filter(strategy => strategy.id !== strategyId))
      return true
    } catch (err) {
      console.error('Error deleting strategy:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete strategy')
      return false
    }
  }

  // Refresh strategies (manual trigger)
  const refreshStrategies = useCallback(() => {
    // Reset circuit breaker for manual refresh
    fetchAttempts.current = 0
    lastFetchTime.current = 0
    fetchStrategies()
  }, [fetchStrategies])

  // Effect to fetch strategies when user changes - but with protection
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    // Debounce the fetch to prevent rapid-fire requests
    const debouncedFetch = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        fetchStrategies()
      }, 500) // 500ms debounce
    }

    if (user) {
      debouncedFetch()
    } else {
      setStrategies([])
      setLoading(false)
      setError(null)
    }

    return () => {
      clearTimeout(timeoutId)
    }
  }, [user?.id, fetchStrategies]) // Include fetchStrategies dependency

  return {
    strategies,
    loading,
    error,
    createStrategy,
    deleteStrategy,
    refreshStrategies,
  }
}