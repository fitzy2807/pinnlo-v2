'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface OrganisationCard {
  id: string
  user_id: string
  title: string
  description?: string
  card_type: string
  priority: 'high' | 'medium' | 'low'
  card_data: any
  created_at: string
  updated_at: string
}

export function useOrganisationCards() {
  const [cards, setCards] = useState<OrganisationCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('organisation_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCards(data || [])
    } catch (error) {
      console.error('Error fetching organisation cards:', error)
      toast.error('Failed to load cards')
    } finally {
      setLoading(false)
    }
  }

  const createCard = async (cardData: Partial<OrganisationCard>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('organisation_cards')
        .insert({
          user_id: user.id,
          title: cardData.title || 'Untitled Card',
          description: cardData.description,
          card_type: cardData.card_type || 'organisation',
          priority: cardData.priority || 'medium',
          card_data: cardData.card_data || {}
        })
        .select()
        .single()

      if (error) throw error

      setCards([data, ...cards])
      return data
    } catch (error) {
      console.error('Error creating card:', error)
      toast.error('Failed to create card')
      throw error
    }
  }

  const updateCard = async (id: string, updates: Partial<OrganisationCard>) => {
    try {
      // Find the existing card to preserve card_data fields
      const existingCard = cards.find(card => card.id === id)
      if (!existingCard) throw new Error('Card not found')

      // Merge card_data to preserve existing fields like 'section'
      const mergedUpdates = {
        ...updates,
        card_data: updates.card_data ? {
          ...existingCard.card_data,
          ...updates.card_data
        } : existingCard.card_data,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('organisation_cards')
        .update(mergedUpdates)
        .eq('id', id)

      if (error) throw error

      setCards(cards.map(card => 
        card.id === id ? { ...card, ...mergedUpdates } : card
      ))
    } catch (error) {
      console.error('Error updating card:', error)
      toast.error('Failed to update card')
      throw error
    }
  }

  const deleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('organisation_cards')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCards(cards.filter(card => card.id !== id))
    } catch (error) {
      console.error('Error deleting card:', error)
      toast.error('Failed to delete card')
      throw error
    }
  }

  return {
    cards,
    loading,
    createCard,
    updateCard,
    deleteCard,
    refetch: fetchCards
  }
}
