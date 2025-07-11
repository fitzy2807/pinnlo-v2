/**
 * Hook for managing Intelligence Groups
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface IntelligenceGroup {
  id: string
  user_id: string
  name: string
  description: string
  color: string
  created_at: string
  updated_at: string
  card_count: number
  last_used_at: string
}

interface CreateGroupData {
  name: string
  description: string
  color: string
}

export function useIntelligenceGroups() {
  const [groups, setGroups] = useState<IntelligenceGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('intelligence_groups')
        .select('*')
        .order('last_used_at', { ascending: false })

      if (error) throw error
      setGroups(data || [])
    } catch (err: any) {
      console.error('Error loading intelligence groups:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const createGroup = async (groupData: CreateGroupData): Promise<IntelligenceGroup | null> => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('intelligence_groups')
        .insert({
          user_id: user.id,  // ✅ Critical: Include user_id for RLS
          name: groupData.name,
          description: groupData.description,
          color: groupData.color,
          card_count: 0,
          last_used_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      
      // Add to local state
      setGroups(prev => [data, ...prev])
      return data
    } catch (err: any) {
      console.error('Error creating intelligence group:', err)
      setError(err.message)
      return null
    }
  }

  const updateGroup = async (id: string, updates: Partial<CreateGroupData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('intelligence_groups')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setGroups(prev => prev.map(group => 
        group.id === id ? { ...group, ...updates } : group
      ))
      
      return true
    } catch (err: any) {
      console.error('Error updating intelligence group:', err)
      setError(err.message)
      return false
    }
  }

  const deleteGroup = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('intelligence_groups')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remove from local state
      setGroups(prev => prev.filter(group => group.id !== id))
      return true
    } catch (err: any) {
      console.error('Error deleting intelligence group:', err)
      setError(err.message)
      return false
    }
  }

  const getGroupCards = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('intelligence_group_cards')
        .select(`
          id,
          position,
          intelligence_cards (
            id,
            category,
            title,
            summary,
            intelligence_content,
            key_findings,
            source_reference,
            date_accessed,
            credibility_score,
            relevance_score,
            strategic_implications,
            recommended_actions,
            tags,
            status,
            created_at,
            updated_at
          )
        `)
        .eq('group_id', groupId)
        .order('position', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err: any) {
      console.error('Error loading group cards:', err)
      throw err
    }
  }

  const removeCardFromGroup = async (groupId: string, cardId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('intelligence_group_cards')
        .delete()
        .eq('group_id', groupId)
        .eq('intelligence_card_id', cardId)

      if (error) throw error

      // Update the card count for the group
      const { data: groupData, error: countError } = await supabase
        .from('intelligence_groups')
        .select('card_count')
        .eq('id', groupId)
        .single()

      if (!countError && groupData) {
        const { error: updateError } = await supabase
          .from('intelligence_groups')
          .update({ 
            card_count: Math.max(0, groupData.card_count - 1),
            last_used_at: new Date().toISOString()
          })
          .eq('id', groupId)

        if (updateError) {
          console.error('Error updating group card count:', updateError)
        }
      }

      // Update local state
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, card_count: Math.max(0, group.card_count - 1), last_used_at: new Date().toISOString() }
          : group
      ))
      
      return true
    } catch (err: any) {
      console.error('Error removing card from group:', err)
      return false
    }
  }

  const addCardsToGroup = async (groupId: string, cardIds: string[]): Promise<boolean> => {
    try {
      // Prepare the insert data
      const insertData = cardIds.map((cardId, index) => ({
        group_id: groupId,
        intelligence_card_id: cardId,
        position: index,
        added_at: new Date().toISOString(),
        added_by: null // We'll get the user ID if needed
      }))

      const { error } = await supabase
        .from('intelligence_group_cards')
        .insert(insertData)

      if (error) throw error

      // Update the card count for the group
      const { data: groupData, error: countError } = await supabase
        .from('intelligence_groups')
        .select('card_count')
        .eq('id', groupId)
        .single()

      if (!countError && groupData) {
        const { error: updateError } = await supabase
          .from('intelligence_groups')
          .update({ 
            card_count: groupData.card_count + cardIds.length,
            last_used_at: new Date().toISOString()
          })
          .eq('id', groupId)

        if (updateError) {
          console.error('Error updating group card count:', updateError)
        }
      }

      // Update local state
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, card_count: group.card_count + cardIds.length, last_used_at: new Date().toISOString() }
          : group
      ))
      
      return true
    } catch (err: any) {
      console.error('Error adding cards to group:', err)
      return false
    }
  }

  return {
    groups,
    isLoading,
    error,
    loadGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupCards,
    removeCardFromGroup,
    addCardsToGroup
  }
}
