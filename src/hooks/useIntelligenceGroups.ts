import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import { 
  IntelligenceGroup, 
  CreateIntelligenceGroupData, 
  UpdateIntelligenceGroupData,
  IntelligenceGroupWithCards 
} from '@/types/intelligence-groups'

interface UseIntelligenceGroupsReturn {
  groups: IntelligenceGroup[]
  loading: boolean
  error: Error | null
  createGroup: (data: CreateIntelligenceGroupData) => Promise<IntelligenceGroup>
  updateGroup: (id: string, data: UpdateIntelligenceGroupData) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  addCardsToGroup: (groupId: string, cardIds: string[]) => Promise<void>
  removeCardFromGroup: (groupId: string, cardId: string) => Promise<void>
  getGroup: (id: string) => Promise<IntelligenceGroupWithCards>
  getGroupCards: (groupId: string) => Promise<any[]>
  refreshGroups: () => Promise<void>
}

export function useIntelligenceGroups(): UseIntelligenceGroupsReturn {
  const [groups, setGroups] = useState<IntelligenceGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  // Fetch all groups
  const fetchGroups = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('intelligence_groups')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false })

      if (fetchError) throw fetchError

      setGroups(data || [])
    } catch (err) {
      console.error('Error fetching intelligence groups:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Create a new group
  const createGroup = useCallback(async (data: CreateIntelligenceGroupData): Promise<IntelligenceGroup> => {
    if (!user) throw new Error('User not authenticated')

    const { data: group, error: createError } = await supabase
      .from('intelligence_groups')
      .insert({
        user_id: user.id,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        color: data.color || '#3B82F6'
      })
      .select()
      .single()

    if (createError) throw createError

    // Update local state
    setGroups(prev => [group, ...prev])
    
    return group
  }, [user])

  // Update a group
  const updateGroup = useCallback(async (id: string, data: UpdateIntelligenceGroupData): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.description !== undefined) updateData.description = data.description?.trim() || null
    if (data.color !== undefined) updateData.color = data.color

    const { error: updateError } = await supabase
      .from('intelligence_groups')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) throw updateError

    // Update local state
    setGroups(prev => prev.map(g => 
      g.id === id ? { ...g, ...updateData } : g
    ))
  }, [user])

  // Delete a group
  const deleteGroup = useCallback(async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    const { error: deleteError } = await supabase
      .from('intelligence_groups')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    // Update local state
    setGroups(prev => prev.filter(g => g.id !== id))
  }, [user])

  // Add cards to a group
  const addCardsToGroup = useCallback(async (groupId: string, cardIds: string[]): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch(`/api/intelligence-groups/${groupId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardIds })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add cards to group')
    }

    // Update local state to increment card count
    setGroups(prev => prev.map(g => 
      g.id === groupId 
        ? { ...g, card_count: g.card_count + cardIds.length, last_used_at: new Date().toISOString() }
        : g
    ))
  }, [user])

  // Remove card from group
  const removeCardFromGroup = useCallback(async (groupId: string, cardId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch(`/api/intelligence-groups/${groupId}/cards/${cardId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to remove card from group')
    }

    // Update local state to decrement card count
    setGroups(prev => prev.map(g => 
      g.id === groupId 
        ? { ...g, card_count: Math.max(0, g.card_count - 1), last_used_at: new Date().toISOString() }
        : g
    ))
  }, [user])

  // Get single group with cards
  const getGroup = useCallback(async (id: string): Promise<IntelligenceGroupWithCards> => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch(`/api/intelligence-groups/${id}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch group')
    }

    const { data } = await response.json()
    return data
  }, [user])

  // Get cards in a group
  const getGroupCards = useCallback(async (groupId: string): Promise<any[]> => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch(`/api/intelligence-groups/${groupId}/cards`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch group cards')
    }

    const { data } = await response.json()
    return data
  }, [user])

  // Refresh groups
  const refreshGroups = useCallback(async () => {
    await fetchGroups()
  }, [fetchGroups])

  // Initial fetch
  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('intelligence_groups_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'intelligence_groups',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setGroups(prev => [payload.new as IntelligenceGroup, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setGroups(prev => prev.map(g => 
              g.id === payload.new.id ? payload.new as IntelligenceGroup : g
            ))
          } else if (payload.eventType === 'DELETE') {
            setGroups(prev => prev.filter(g => g.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    groups,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    addCardsToGroup,
    removeCardFromGroup,
    getGroup,
    getGroupCards,
    refreshGroups
  }
}