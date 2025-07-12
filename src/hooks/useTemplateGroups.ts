'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

export interface TemplateGroup {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  created_at: string
  updated_at: string
  card_count?: number
}

export interface TemplateGroupCard {
  id: string
  group_id: string
  card_id: string
  created_at: string
}

export interface GroupWithCards extends TemplateGroup {
  cards: any[]
}

export function useTemplateGroups() {
  const [groups, setGroups] = useState<TemplateGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('template_groups_with_counts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGroups(data || [])
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async (groupData: { name: string; description?: string; color?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('template_groups')
        .insert({
          user_id: user.id,
          name: groupData.name,
          description: groupData.description,
          color: groupData.color || 'blue'
        })
        .select()
        .single()

      if (error) throw error

      const newGroup = { ...data, card_count: 0 }
      setGroups([newGroup, ...groups])
      toast('Group created successfully')
      return data
    } catch (error) {
      console.error('Error creating group:', error)
      toast.error('Failed to create group')
      throw error
    }
  }

  const updateGroup = async (id: string, updates: Partial<TemplateGroup>) => {
    try {
      const { error } = await supabase
        .from('template_groups')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setGroups(groups.map(group => 
        group.id === id ? { ...group, ...updates } : group
      ))
      toast('Group updated successfully')
    } catch (error) {
      console.error('Error updating group:', error)
      toast.error('Failed to update group')
      throw error
    }
  }

  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('template_groups')
        .delete()
        .eq('id', id)

      if (error) throw error

      setGroups(groups.filter(group => group.id !== id))
      toast('Group deleted successfully')
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error('Failed to delete group')
      throw error
    }
  }

  const getGroupCards = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('template_group_cards')
        .select(`
          id,
          template_cards!inner (
            id,
            title,
            description,
            card_type,
            priority,
            card_data,
            created_at,
            updated_at
          )
        `)
        .eq('group_id', groupId)
        .order('id', { ascending: false })

      if (error) throw error
      
      return data?.map(item => ({
        ...item.template_cards,
        group_card_id: item.id
      })) || []
    } catch (error) {
      console.error('Error fetching group cards:', error)
      toast.error('Failed to load group cards')
      return []
    }
  }

  const addCardToGroup = async (groupId: string, cardId: string) => {
    try {
      // Check if card is already in group
      const { data: existing } = await supabase
        .from('template_group_cards')
        .select('id')
        .eq('group_id', groupId)
        .eq('card_id', cardId)
        .single()

      if (existing) {
        toast('Card is already in this group')
        return
      }

      const { error } = await supabase
        .from('template_group_cards')
        .insert({
          group_id: groupId,
          card_id: cardId
        })

      if (error) throw error

      // Update group card count
      await fetchGroups()
      toast('Card added to group')
    } catch (error) {
      console.error('Error adding card to group:', error)
      toast.error('Failed to add card to group')
      throw error
    }
  }

  const removeCardFromGroup = async (groupId: string, cardId: string) => {
    try {
      const { error } = await supabase
        .from('template_group_cards')
        .delete()
        .eq('group_id', groupId)
        .eq('card_id', cardId)

      if (error) throw error

      // Update group card count
      await fetchGroups()
      toast('Card removed from group')
    } catch (error) {
      console.error('Error removing card from group:', error)
      toast.error('Failed to remove card from group')
      throw error
    }
  }

  const addCardsToGroup = async (groupId: string, cardIds: string[]) => {
    try {
      // Get existing cards in group to avoid duplicates
      const { data: existing } = await supabase
        .from('template_group_cards')
        .select('card_id')
        .eq('group_id', groupId)
        .in('card_id', cardIds)

      const existingCardIds = existing?.map(item => item.card_id) || []
      const newCardIds = cardIds.filter(id => !existingCardIds.includes(id))

      if (newCardIds.length === 0) {
        toast('All selected cards are already in this group')
        return
      }

      const { error } = await supabase
        .from('template_group_cards')
        .insert(
          newCardIds.map(cardId => ({
            group_id: groupId,
            card_id: cardId
          }))
        )

      if (error) throw error

      // Update group card count
      await fetchGroups()
      toast(`${newCardIds.length} card(s) added to group`)
    } catch (error) {
      console.error('Error adding cards to group:', error)
      toast.error('Failed to add cards to group')
      throw error
    }
  }

  return {
    groups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupCards,
    addCardToGroup,
    removeCardFromGroup,
    addCardsToGroup,
    refetch: fetchGroups
  }
}