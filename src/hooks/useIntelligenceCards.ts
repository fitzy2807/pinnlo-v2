import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useIntelligenceCards() {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 Fetching intelligence cards')
        
        // Check if intelligence_cards table exists, fallback to cards table
        let { data, error } = await supabase
          .from('intelligence_cards')
          .select('*')
          .order('created_at', { ascending: false })

        // If intelligence_cards table doesn't exist, try cards table
        if (error && error.code === '42P01') {
          console.log('📋 Intelligence table not found, using cards table')
          ({ data, error } = await supabase
            .from('cards')
            .select('*')
            .order('created_at', { ascending: false }))
        }

        if (error) {
          console.error('❌ Error fetching intelligence cards:', error)
          setError(error.message)
          setCards([])
          return
        }

        console.log('📋 Raw intelligence data:', data?.length || 0)
        console.log('📋 Card types/categories found:', [...new Set(data?.map(c => c.category || c.card_type) || [])])

        // Filter for intelligence-type cards
        const intelligenceCards = data?.filter(card => {
          const cardType = card.card_type || ''
          const category = card.category || ''
          return (
            cardType.includes('intelligence') ||
            cardType.includes('market') ||
            cardType.includes('competitor') ||
            cardType.includes('technology') ||
            cardType.includes('stakeholder') ||
            cardType.includes('consumer') ||
            cardType.includes('risk') ||
            cardType.includes('opportunity') ||
            cardType.includes('trend') ||
            category.includes('intelligence') ||
            category.includes('market') ||
            category.includes('competitor')
          )
        }) || []

        console.log('✅ Filtered intelligence cards:', intelligenceCards.length)
        setCards(intelligenceCards)
      } catch (err) {
        console.error('❌ Error in useIntelligenceCards:', err)
        setError('Failed to fetch intelligence cards')
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  const getCardsByCategory = (category: string) => {
    return cards.filter(card => {
      const cardCategory = card.category || card.card_type || ''
      return (
        cardCategory.includes(category.toLowerCase()) ||
        category.toLowerCase().includes(cardCategory.toLowerCase())
      )
    })
  }

  return {
    cards,
    loading,
    error,
    getCardsByCategory
  }
}

// Additional hooks needed by Intelligence Bank
export function useIntelligenceCardCounts() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  
  const refresh = () => {
    // Placeholder refresh function
    console.log('Refreshing intelligence card counts')
  }
  
  return {
    categoryCounts,
    statusCounts,
    refresh
  }
}

export function useCreateIntelligenceCard() {
  const create = async (data: any) => {
    console.log('Creating intelligence card:', data)
    // Placeholder create function
    return { success: true, data: { id: Date.now().toString(), ...data } }
  }
  
  return { create }
}

export function useUpdateIntelligenceCard() {
  const update = async (id: string, data: any) => {
    console.log('Updating intelligence card:', id, data)
    // Placeholder update function
    return { success: true, data: { id, ...data } }
  }
  
  return { update }
}

export function useIntelligenceCardActions() {
  const save = async (card: any) => {
    console.log('Saving intelligence card:', card)
    return { success: true }
  }
  
  const archive = async (id: string) => {
    console.log('Archiving intelligence card:', id)
    return { success: true }
  }
  
  const deleteCard = async (id: string) => {
    console.log('Deleting intelligence card:', id)
    return { success: true }
  }
  
  return {
    save,
    archive,
    delete: deleteCard
  }
}