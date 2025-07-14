'use client'

import { useState, useCallback } from 'react'

export interface AgentGroup {
  id: string
  name: string
  description?: string
  color: string
  card_count: number
  created_at: string
  updated_at: string
}

// Mock initial groups
const initialGroups: AgentGroup[] = [
  {
    id: '1',
    name: 'My Favorite Agents',
    description: 'Frequently used agents',
    color: 'blue',
    card_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Testing Agents',
    description: 'Agents in beta testing',
    color: 'yellow',
    card_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export function useAgentGroups() {
  const [groups, setGroups] = useState<AgentGroup[]>(initialGroups)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [groupCards, setGroupCards] = useState<Record<string, string[]>>({
    '1': [],
    '2': []
  })

  const createGroup = useCallback(async (groupData: {
    name: string
    description?: string
    color: string
  }) => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newGroup: AgentGroup = {
        id: Date.now().toString(),
        name: groupData.name,
        description: groupData.description,
        color: groupData.color,
        card_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setGroups(prev => [...prev, newGroup])
      setGroupCards(prev => ({ ...prev, [newGroup.id]: [] }))
      
      return newGroup
    } catch (err) {
      setError('Failed to create group')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateGroup = useCallback(async (groupId: string, updates: Partial<AgentGroup>) => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, ...updates, updated_at: new Date().toISOString() }
          : group
      ))
      
      return true
    } catch (err) {
      setError('Failed to update group')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteGroup = useCallback(async (groupId: string) => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setGroups(prev => prev.filter(group => group.id !== groupId))
      setGroupCards(prev => {
        const newGroupCards = { ...prev }
        delete newGroupCards[groupId]
        return newGroupCards
      })
      
      return true
    } catch (err) {
      setError('Failed to delete group')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getGroupCards = useCallback(async (groupId: string) => {
    // In the real implementation, this would fetch the actual card objects
    // For now, we'll return the card IDs stored in our mock state
    const cardIds = groupCards[groupId] || []
    
    // Since we're mocking, we'll return empty array for now
    // In real implementation, you'd fetch the actual card objects from useAgentCards
    return []
  }, [groupCards])

  const addCardToGroup = useCallback(async (groupId: string, cardId: string) => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setGroupCards(prev => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), cardId]
      }))
      
      // Update card count
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, card_count: group.card_count + 1, updated_at: new Date().toISOString() }
          : group
      ))
      
      return true
    } catch (err) {
      setError('Failed to add card to group')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const removeCardFromGroup = useCallback(async (groupId: string, cardId: string) => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setGroupCards(prev => ({
        ...prev,
        [groupId]: prev[groupId].filter(id => id !== cardId)
      }))
      
      // Update card count
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, card_count: Math.max(0, group.card_count - 1), updated_at: new Date().toISOString() }
          : group
      ))
      
      return true
    } catch (err) {
      setError('Failed to remove card from group')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const addCardsToGroup = useCallback(async (groupId: string, cardIds: string[]) => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setGroupCards(prev => ({
        ...prev,
        [groupId]: [...new Set([...(prev[groupId] || []), ...cardIds])]
      }))
      
      // Update card count
      const newCount = (groupCards[groupId] || []).length + cardIds.length
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, card_count: newCount, updated_at: new Date().toISOString() }
          : group
      ))
      
      return true
    } catch (err) {
      setError('Failed to add cards to group')
      throw err
    } finally {
      setLoading(false)
    }
  }, [groupCards])

  return {
    groups,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupCards,
    addCardToGroup,
    removeCardFromGroup,
    addCardsToGroup
  }
}