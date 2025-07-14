import { useState, useEffect, useCallback } from 'react'
import { loadIntelligenceCards } from '@/lib/intelligence-cards-api'
import { IntelligenceCardFilters, IntelligenceCard } from '@/types/intelligence-cards'

export function useIntelligenceCards(filters?: IntelligenceCardFilters) {
  const [cards, setCards] = useState<IntelligenceCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching intelligence cards with filters:', filters)
      
      const result = await loadIntelligenceCards(filters)
      
      if (result.success && result.data) {
        setCards(result.data.cards)
        setTotal(result.data.total)
        console.log(`✅ Loaded ${result.data.cards.length} cards for category: ${filters?.category || 'all'}`)
      } else {
        setError(result.error || 'Failed to load cards')
        setCards([])
        setTotal(0)
      }
    } catch (err) {
      console.error('❌ Error in useIntelligenceCards:', err)
      setError('Failed to fetch intelligence cards')
      setCards([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const refresh = useCallback(() => {
    console.log('🔄 Refreshing intelligence cards')
    fetchCards()
  }, [fetchCards])

  const getCardsByCategory = (category: string) => {
    return cards.filter(card => {
      const cardCategory = card.category || ''
      return cardCategory === category.toLowerCase()
    })
  }

  return {
    cards,
    loading,
    error,
    total,
    refresh,
    getCardsByCategory
  }
}

// Additional hooks needed by Intelligence Bank
export function useIntelligenceCardCounts() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  
  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Refreshing intelligence card counts')
      
      // Fetch counts for each category
      const categories = ['market', 'competitor', 'trends', 'technology', 
                        'stakeholder', 'consumer', 'risk', 'opportunities']
      
      const counts: Record<string, number> = {}
      
      // Fetch counts in parallel for better performance
      const countPromises = categories.map(async (category) => {
        const result = await loadIntelligenceCards({ category, limit: 0 })
        return { category, count: result.success && result.data ? result.data.total : 0 }
      })
      
      const results = await Promise.all(countPromises)
      
      results.forEach(({ category, count }) => {
        counts[category] = count
      })
      
      // Also fetch saved and archived counts
      const savedResult = await loadIntelligenceCards({ status: 'saved' as any, limit: 0 })
      counts.saved = savedResult.success && savedResult.data ? savedResult.data.total : 0
      
      const archivedResult = await loadIntelligenceCards({ status: 'archived' as any, limit: 0 })
      counts.archive = archivedResult.success && archivedResult.data ? archivedResult.data.total : 0
      
      setCategoryCounts(counts)
      console.log('✅ Category counts updated:', counts)
    } catch (error) {
      console.error('❌ Error fetching category counts:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    refresh()
  }, [refresh])
  
  return {
    categoryCounts,
    statusCounts,
    loading,
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