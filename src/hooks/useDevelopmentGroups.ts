import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface DevelopmentGroup {
  id: string
  strategy_id: number
  name: string
  description?: string
  color: string
  created_at: string
  updated_at: string
  card_count?: number
}

interface CreateGroupData {
  name: string
  description?: string
  color?: string
}

export function useDevelopmentGroups(strategyId?: number) {
  const [groups, setGroups] = useState<DevelopmentGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load groups for development context (using strategy_groups table)
  const loadGroups = useCallback(async () => {
    if (!strategyId) {
      setGroups([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Query strategy_groups table with card counts
      const { data, error: fetchError } = await supabase
        .from('strategy_groups_with_counts')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setGroups(data || [])
    } catch (err) {
      console.error('Failed to load development groups:', err)
      setError(err instanceof Error ? err.message : 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }, [strategyId])

  // Create new group
  const createGroup = useCallback(async (groupData: CreateGroupData) => {
    if (!strategyId) {
      throw new Error('Strategy ID is required')
    }

    try {
      const newGroup = {
        strategy_id: strategyId,
        name: groupData.name,
        description: groupData.description || '',
        color: groupData.color || 'blue'
      }

      const { data, error } = await supabase
        .from('strategy_groups')
        .insert(newGroup)
        .select()
        .single()

      if (error) throw error

      // Add to local state with zero card count
      const groupWithCount = { ...data, card_count: 0 }
      setGroups(prev => [groupWithCount, ...prev])
      return data
    } catch (err) {
      console.error('Failed to create development group:', err)
      throw err
    }
  }, [strategyId])

  // Update group
  const updateGroup = useCallback(async (groupId: string, updates: Partial<DevelopmentGroup>) => {
    try {
      const { data, error } = await supabase
        .from('strategy_groups')
        .update(updates)
        .eq('id', groupId)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, ...data } : group
      ))
      return data
    } catch (err) {
      console.error('Failed to update development group:', err)
      throw err
    }
  }, [])

  // Delete group
  const deleteGroup = useCallback(async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('strategy_groups')
        .delete()
        .eq('id', groupId)

      if (error) throw error

      // Remove from local state
      setGroups(prev => prev.filter(group => group.id !== groupId))
      return true
    } catch (err) {
      console.error('Failed to delete development group:', err)
      throw err
    }
  }, [])

  // Get cards in a group
  const getGroupCards = useCallback(async (groupId: string) => {
    try {
      // Query cards that have this group ID in their group_ids array
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .contains('group_ids', [groupId])
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (err) {
      console.error('Failed to load group cards:', err)
      return []
    }
  }, [])

  // Add card to group
  const addCardToGroup = useCallback(async (groupId: string, cardId: string) => {
    try {
      // Get current card
      const { data: card, error: fetchError } = await supabase
        .from('cards')
        .select('group_ids')
        .eq('id', cardId)
        .single()

      if (fetchError) throw fetchError

      // Add group ID to array if not already present
      const currentGroupIds = Array.isArray(card.group_ids) ? card.group_ids : []
      if (!currentGroupIds.includes(groupId)) {
        const updatedGroupIds = [...currentGroupIds, groupId]

        const { error: updateError } = await supabase
          .from('cards')
          .update({ group_ids: updatedGroupIds })
          .eq('id', cardId)

        if (updateError) throw updateError

        // Refresh groups to update counts
        await loadGroups()
      }

      return true
    } catch (err) {
      console.error('Failed to add card to group:', err)
      throw err
    }
  }, [loadGroups])

  // Add multiple cards to group
  const addCardsToGroup = useCallback(async (groupId: string, cardIds: string[]) => {
    try {
      // Get current cards
      const { data: cards, error: fetchError } = await supabase
        .from('cards')
        .select('id, group_ids')
        .in('id', cardIds)

      if (fetchError) throw fetchError

      // Update each card to include the group ID
      const updates = cards.map(card => {
        const currentGroupIds = Array.isArray(card.group_ids) ? card.group_ids : []
        const updatedGroupIds = currentGroupIds.includes(groupId) 
          ? currentGroupIds 
          : [...currentGroupIds, groupId]

        return {
          id: card.id,
          group_ids: updatedGroupIds
        }
      })

      // Batch update
      const { error: updateError } = await supabase
        .from('cards')
        .upsert(updates)

      if (updateError) throw updateError

      // Refresh groups to update counts
      await loadGroups()
      return true
    } catch (err) {
      console.error('Failed to add cards to group:', err)
      throw err
    }
  }, [loadGroups])

  // Remove card from group
  const removeCardFromGroup = useCallback(async (groupId: string, cardId: string) => {
    try {
      // Get current card
      const { data: card, error: fetchError } = await supabase
        .from('cards')
        .select('group_ids')
        .eq('id', cardId)
        .single()

      if (fetchError) throw fetchError

      // Remove group ID from array
      const currentGroupIds = Array.isArray(card.group_ids) ? card.group_ids : []
      const updatedGroupIds = currentGroupIds.filter(id => id !== groupId)

      const { error: updateError } = await supabase
        .from('cards')
        .update({ group_ids: updatedGroupIds })
        .eq('id', cardId)

      if (updateError) throw updateError

      // Refresh groups to update counts
      await loadGroups()
      return true
    } catch (err) {
      console.error('Failed to remove card from group:', err)
      throw err
    }
  }, [loadGroups])

  // Load groups on mount
  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  return {
    // Data
    groups,
    loading,
    error,

    // CRUD operations
    createGroup,
    updateGroup,
    deleteGroup,

    // Card-group operations
    getGroupCards,
    addCardToGroup,
    addCardsToGroup,
    removeCardFromGroup,

    // Utility
    refetch: loadGroups
  }
}